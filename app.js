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

app.set('view engine', 'ejs');
app.use(express.json());
app.use(express.static('public'));

app.get('/', (req, res) => {
  res.render('index', {
    message: ''
  });
});

app.post('/search-video', async (req, res) => {
  const url = req.body.videoUrl;

  if (!url) {
    return res.render('index', {
      success: false,
      message: 'URL não informada.'
    });
  }

  const videoInfo = await play.video_basic_info(url);
  // const streams = await play.stream_from_info(videoInfo);

  // console.log(streams);
  console.log('ata');
  if (videoInfo) {
    return res.render('index', {
      success: true,
      video_title: videoInfo.video_details.title,
      video_thumbnail: videoInfo.video_details.thumbnails[0].url,
      message: ''
      // qualities: streams.qualities
    });
  } else {
    res.render('index', {
      success: false,
      message: 'Erro ao buscare vídeo.'
    });
  }
});

// app.post('/api/search-video', async (req, res) => {
//   try {
//     const data = await
//   } catch (error) {

//   }
// })

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
