# 🎵 Song 2 U

Conversor de YouTube para MP3 feito com Node.js, `yt-dlp` e FFmpeg. Permite buscar informações de um vídeo e baixar o áudio convertido diretamente pelo browser.

---

## Tecnologias

- **Node.js** + **Express** — servidor e rotas
- **yt-dlp** — extração de informações e download do áudio
- **FFmpeg** / **fluent-ffmpeg** — conversão para MP3
- **HTML/CSS** — layout e estilos do front-end
- **dotenv** — variáveis de ambiente

---

## Pré-requisitos

- [Node.js](https://nodejs.org/) v18+
- [yt-dlp](https://github.com/yt-dlp/yt-dlp/releases/latest) — baixar o `yt-dlp.exe`
- [FFmpeg](https://ffmpeg.org/download.html) — baixar o `ffmpeg.exe`

---

## Instalação

**1. Clone o repositório:**
```bash
git clone https://github.com/gstvoli/song2u.git
cd song2u
```

**2. Instale as dependências:**
```bash
npm install
```

**3. Adicione os executáveis na pasta `/bin`:**
```
song2u/
├── bin/
│   ├── yt-dlp.exe
│   └── ffmpeg.exe
```

**4. Crie o arquivo `.env` na raiz:**
```env
PORT=8080
HOST=localhost
```

**5. Inicie o servidor:**
```bash
node app.js
# ou com nodemon:
nodemon app.js
```

**6. Acesse no browser:**
```
http://localhost:8080
```

---

## Rotas

### `GET /`
Renderiza a página principal.

---

### `POST /search-video`
Busca informações do vídeo a partir de uma URL.

**Body:**
```json
{ "url": "https://www.youtube.com/watch?v=XXL29qKb0Jo" }
```

**Resposta:**
```json
{
  "valid": true,
  "success": true,
  "title": "Nome do vídeo",
  "thumbnail": "https://...",
  "video_id": "XXL29qKb0Jo",
  "duration": 214,
  "channel": "Nome do canal",
  "channel_url": "https://www.youtube.com/...",
  "qualities": ["360p", "480p", "720p", "1080p"]
}
```

---

### `GET /convert-mp3?videoID=XXL29qKb0Jo`
Inicia a conversão e faz o stream do arquivo MP3 diretamente para o cliente.

**Query params:**
| Param | Tipo | Descrição |
|---|---|---|
| `videoID` | string | ID do vídeo do YouTube |

**Resposta:** stream de áudio `audio/mpeg` com header `Content-Disposition: attachment`.

---

## Estrutura do projeto

```
song2u/
├── bin/
│   ├── ffmpeg.exe
│   └── yt-dlp.exe
├── public/
│   ├── css/
│   │   └── style.css
│   └── js/
│       └── script.js
├── views/
│   └── index.html
├── .env
├── .gitignore
├── app.js
└── package.json
```

---

## .gitignore recomendado

```
node_modules/
.env
bin/
```

> Os binários `yt-dlp.exe` e `ffmpeg.exe` não devem ser versionados — cada ambiente deve baixar os executáveis diretamente nas fontes oficiais.

---

## Observações

- O projeto utiliza stream direto para o cliente na conversão. Para vídeos muito longos em ambientes com rede instável, considere implementar um sistema de fila com jobs (uuid + tmpdir) para salvar o arquivo no servidor antes de servir ao cliente.
- O `yt-dlp` suporta mais de 1000 plataformas além do YouTube. Futuramente o projeto pode ser expandido para suporte multi-plataforma (Dailymotion, Vimeo, SoundCloud, etc.).
- Plataformas com DRM (Netflix, Spotify, Amazon Prime) não são suportadas.

---

## Licença

MIT
