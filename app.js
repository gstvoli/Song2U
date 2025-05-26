//required packages
const express = require('express');
const fetch = require('node-fetch');
const play = require('play-dl');
require('dotenv').config();

//create the express server
const app = express();

//server port number
const PORT = process.env.PORT || 8080;
const HOST = process.env.HOST;
//set template engine
app.set('view engine', 'ejs');
app.use(express.static('public'));

//needed to parse html data for POST request
app.use(
  express.urlencoded({
    extended: true
  })
);
app.use(express.json());

app.get('/', (req, res) => {
  res.render('index', {
    message: ''
  });
});

app.post('/search-video', async (req, res) => {
  console.log(req.body);
  console.log(req.body.videoUrl);
  const { url } = req.body.videoUrl;
  console.log('começou');
  console.log(url);
  if (url != undefined) {
    return res.render('index', {
      valid: false,
      message: 'Informe um link válido.'
    });
    console.log('Link não informado');
  }

  try {
    const response = await fetch(`${HOST}:${PORT}/search-video`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url })
    });

    const fetchResponse = await response.json();

    if (fetchResponse.video_details.id) {
      return res.render('index', {
        valid: true,
        message: 'Vídeo encontrado!',
        videoData: fetchResponse
      });
    } else {
      return res.render('index', {
        valid: false,
        message: fetchResponse.msg
      });
    }

    // let results = [];

    // if (play.yt_validate(url) === 'video') {
    //   const video = await play.video_basic_info(url);
    //   results.push(video);
    // } else if (play.yt_validate === 'playlist') {
    //   const playlist = await play.playlist_info(url, { incomplete: true });
    //   for (const video of playlist.videos) {
    //     results.push(await play.video_basic_info(video.url));
    //   }
    // }
  } catch (error) {
    console.error('Erro ao buscar vídeo:', error);
    return res.render('index', {
      valid: false,
      message: 'Erro ao buscar informações do vídeo.'
    });
  }
});

app.post('/convert-mp3', async (req, res) => {
  const videoId = req.body.videoID;
  console.log(videoId);
  if (videoId === undefined || videoId === '' || videoId === null) {
    return res.render('index', {
      success: false,
      message: 'Please enter a video ID'
    });
  } else {
    const fetchAPI = await fetch(
      `https://youtube-mp36.p.rapidapi.com/dl?id=${videoId}`,
      {
        method: 'GET',
        headers: {
          'x-rapidapi-key': process.env.API_KEY,
          'x-rapidapi-host': process.env.API_HOST
        }
      }
    );

    const fetchResponse = await fetchAPI.json();

    if (fetchResponse.status === 'ok')
      return res.render('index', {
        success: true,
        song_title: fetchResponse.title,
        song_link: fetchResponse.link
      });
    else
      return res.render('index', {
        success: false,
        message: fetchResponse.msg
      });
  }
});

//start the server
app.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
});
