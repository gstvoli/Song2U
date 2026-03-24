document.addEventListener('DOMContentLoaded', () => {
  const searchBtn = document.getElementById('search-btn');

  if (searchBtn) {
    searchBtn.addEventListener('click', async (e) => {
      e.preventDefault();

      const urlInput = document.getElementById('videoUrl');
      const loading = document.getElementById('loading');
      const resultDiv = document.getElementById('result');

      if (!urlInput) {
        alert('por favor, insira uma URL.');
        return;
      }

      loading.style.display = 'block';
      loading.style.animation = 'blink 1s linear infinite';
      resultDiv.style.display = 'none';

      const url = urlInput.value;

      try {
        const res = await fetch('/search-video', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ url })
        });

        if (!res.ok) {
          throw new Error('Erro no servidor: ${res.status}');
        }

        const data = await res.json();
        console.log('Resposta da API:', data);

        if (data.valid) {
          resultDiv.innerHTML = `
            <h3>${data.title}</h3>
            <div class="result_wrapper">
              <div>
              <iframe
                src="https://www.youtube.com/embed/${data.video_id}"
                frameborder="0"
                width="620"
                height="350"
                id="video-player"
              ></iframe>
              </div>
              <div class="info_wrapper">
                <div class="channel_info_header">
                  <img src="${data.channelInfo[2]}" alt="Channel Icon"    class="channel_icon">
                  <h4><a href="${data.channelInfo[1]}" target="_blank">${data.channelInfo[0]}</a></h4>
                </div>
                <div class="thumbnail_wrapper">
                <img src="${data.thumbnail}" class="img_thumb" alt="Thumbnail">
                </div>
              </div>
            </div>
            <div class="qualities_wrapper"> 
              <p>Qualidades disponíveis:</p>
              <ul>  
                ${data.qualities.map((q) => `<button><li>${q}</li></button>`).join('')}
              </ul>
            </div>
            <div class="btn-download">
            <form action="/convert-mp3" method="GET">
              <input type="hidden" name="videoID" value="${data.video_id}">
              <button class="btn-download" id="download-btn">
                ⬇️ Baixar MP3
              </button>
            </form>
          </div>
          `;

          const videoPromise = new Promise((resolve) => {
            const iframe = document.getElementById('video-player');
            iframe.onload = () => resolve();
          });

          const thumbnailPromise = new Promise((resolve) => {
            const img = resultDiv.querySelector('img');
            img.onload = () => resolve();
            img.onerror = () => resolve();
          });

          Promise.all([videoPromise, thumbnailPromise]).then(() => {
            const loadingElement = document.getElementById('loading');
            if (loadingElement) loadingElement.style.animation = 'none';

            resultDiv.style.display = 'flex';
            loading.style.display = 'none';
            resultDiv.scrollIntoView({ behavior: 'smooth' });
          });

          const downloadBtn = document.getElementById('download-btn');
          if (downloadBtn) {
            downloadBtn.addEventListener('click', async (btnEvent) => {
              btnEvent.preventDefault();
              downloadBtn.innerText = '⏳ Convertendo...';

              const videoID = data.video_id;

              try {
                const resDownload = await fetch(
                  `/convert-mp3?videoID=${videoID}`
                );
                const dataDownload = await resDownload.json();

                if (dataDownload.success) {
                  window.location.href = dataDownload.song_link;
                  downloadBtn.innerText = '✅ Baixado';
                } else {
                  alert('Erro na conversão: ' + dataDownload.message);
                }
              } catch (error) {
                console.error('Erro na conversão:', error);
              }
            });
          }
        } else {
          resultDiv.innerHTML = `<p>Erro: ${data.message}</p>`;
        }
      } catch (error) {
        resultDiv.innerHTML = `<p>Erro ao conectar à API.</p>`;
        console.error(error);
      }
    });
  }
});
