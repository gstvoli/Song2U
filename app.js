const ffmpeg = require('fluent-ffmpeg');
const express = require('express');
const path = require('path');
const { execFile, spawn } = require('child_process');

const YTDL_PATH = path.join(__dirname, 'bin', 'yt-dlp.exe');
const FFMPEG_PATH = path.join(__dirname, 'bin', 'ffmpeg.exe');

ffmpeg.setFfmpegPath(FFMPEG_PATH);
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 8080;
const HOST = process.env.HOST;

app.set('view engine', 'ejs');
app.use(express.static('public'));

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

const jobs = {};

app.post('/search-video', async (req, res) => {
  const { url } = req.body;

  if (!url) {
    return res
      .status(400)
      .json({ success: false, message: 'URL não informada' });
  }

  execFile(
    YTDL_PATH,
    ['--dump-json', '--no-playlist', url],
    (err, stdout, stderr) => {
      if (err) {
        console.log('Erro yt-dlp: ', stderr);
        return res
          .status(500)
          .json({ success: false, message: 'Erro ao buscar vídeo' });
      }

      try {
        const info = JSON.parse(stdout);

        return res.json({
          valid: true,
          success: true,
          title: info.title,
          thumbnail: info.thumbnail,
          video_id: info.id,
          duration: info.duration,
          channel: info.uploader,
          channel_url: info.uploader_url,
          qualities: info.formats
            .filter((f) => f.height)
            .map((f) => `${f.height}p`)
            .filter((v, i, a) => a.indexOf(v) === i)
        });
      } catch (e) {
        return res
          .status(500)
          .json({ success: false, message: 'Erro ao processar informações.' });
      }
    }
  );
});

app.get('/convert-mp3', async (req, res) => {
  const videoId = req.query.videoID;

  if (!videoId) {
    return res
      .status(400)
      .json({ success: false, message: 'ID do Vídeo não informado' });
  }

  const jobID = uuidv4();
  const outputPath = path.join(os.tmpDir(), `${jobID}.mp3`);

  const videoUrl = `https://www.youtube.com/watch?v=${videoId}`;

  res.setHeader('Content-Type', 'audio/mpeg');
  res.setHeader('Content-Disposition', `attachment; filename="${videoId}.mp3"`);

  const ytDlp = spawn(YTDL_PATH, [
    '--no-playlist',
    '--no-continue',
    '-f',
    'bestaudio',
    '-o',
    '-',
    '--ffmpeg-location',
    FFMPEG_PATH,
    videoUrl
  ]);

  ffmpeg(ytDlp.stdout)
    .audioBitrate(128)
    .toFormat('mp3')
    .on('error', (err) => {
      if (
        err.message.includes('Output stream closed') ||
        err.message.includes('SIGKILL')
      ) {
        console.log('Stream encerrado pelo cliente.');
        return;
      }
      console.error('Erro FFmpeg: ', err.message);
      if (!res.headersSent) {
        res.status(500).send('Erro na conversão');
      }
    })
    .on('end', () => console.log('Conversão finalizada.', videoId))
    .pipe(res);

  req.on('close', () => {
    ytDlp.kill('SIGKILL');
    console.log('Cliente desconectado, processo yt-dlp encerrado.');
  });

  ytDlp.stderr.on('data', (data) => {
    console.log('yt-dlp:', data.toString().trim());
  });

  ytDlp.on('error', (err) => {
    console.error('Erro ao iniciar yt-dlp: ', err.message);
    if (!res.headersSent) {
      res.status(500).send('Erro interno');
    }
  });

  ytDlp.on('close', (code) =>
    console.log(`⚠️ yt-dlp encerrou com código: ${code}`)
  );
  ytDlp.on('error', (err) => console.error('❌ Erro yt-dlp:', err.message));

  res.on('close', () => console.log('🔌 Conexão com cliente encerrada'));
  res.on('finish', () => console.log('✅ Resposta enviada completamente'));

  req.on('close', () => console.log('📵 Cliente desconectou'));
});
//start the server
app.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
});
