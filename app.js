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
  const { url } = req.body;

  if (!url) {
    return res.json({
      success: false,
      message: 'URL não informada.'
    });
  }

  try {
    const isValid = play.yt_validate(url);
    console.log('Tipo de URL validada:', isValid);
    let videoInfo;
    let playlist;

    if (url.startsWith('https') && isValid === 'video') {
      videoInfo = await play.video_basic_info(url);
    } else if (isValid === 'search' || isValid === false) {
      const results = await play.search(url, { limit: 1 });
      if (results.length > 0) {
        videoInfo = { video_details: results[0] };
      }
    } else if (isValid === 'playlist') {
      playlist = await play.playlist_info(url);
    }

    if (videoInfo) {
      return res.json({
        valid: true,
        success: true,
        title: videoInfo.video_details.title,
        thumbnail: videoInfo.video_details.thumbnails[0].url,
        video_id: videoInfo.video_details.id,
        qualities: ['360p', '480p', '720p', '1080p']
      });
    } else if (playlist) {
      return res.json({
        valid: true,
        success: true,
        title: playlist.title[0],
        thumbnail: playlist.thumbnail.url,
        video_id: playlist.id,
        qualities: playlist.videos.map((video) => video.qualities)
      });
    } else {
      return res.json({
        success: false,
        message: 'Erro ao buscar vídeo.'
      });
    }
  } catch (error) {
    console.error('Erro no servidor:', error);
    return res.json({
      success: false,
      message: 'Erro interno ao processar vídeo.'
    });
  }
});

app.post('/convert-mp3', async (req, res) => {
  const videoId = req.body.videoID;
  console.log(videoId);
  if (videoId === undefined || videoId === '' || videoId === null) {
    return res.json({
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
      return res.json({
        success: true,
        song_title: fetchResponse.title,
        song_link: fetchResponse.link
      });
    else
      return res.json({
        success: false,
        message: fetchResponse.msg
      });
  }
});

//start the server
app.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
});
