document.addEventListener('DOMContentLoaded', () => {
  const searchBtn = document.getElementById('search-btn');

  if (searchBtn) {
    searchBtn.addEventListener('click', async (e) => {
      e.preventDefault();

      const urlInput = document.getElementById('videoUrl');
      const loading = document.getElementById('loading');
      const resultDiv = document.getElementById('result');

      if (!urlInput || !urlInput.value.trim()) {
        alert('Por favor, insira uma URL.');
        return;
      }

      loading.style.display = 'block';
      resultDiv.style.display = 'none';
      resultDiv.innerHTML = '';

      const url = urlInput.value.trim();

      try {
        const res = await fetch('/search-video', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ url })
        });

        if (!res.ok) throw new Error(`Erro no servidor: ${res.status}`);

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
                  <h4><a href="${data.channel_url}" target="_blank">${data.channel}</a></h4>
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
              <button id="download-btn" data-video-id="${data.video_id}">
                ⬇️ Baixar MP3
              </button>
            </div>
          `;

          const videoPromise = new Promise((resolve) => {
            const iframe = document.getElementById('video-player');
            iframe.onload = () => resolve();
          });

          const thumbnailPromise = new Promise((resolve) => {
            const img = resultDiv.querySelector('.img_thumb');
            if (!img) return resolve();
            img.onload = () => resolve();
            img.onerror = () => resolve();
          });

          Promise.all([videoPromise, thumbnailPromise]).then(() => {
            loading.style.display = 'none';
            resultDiv.style.display = 'flex';
            resultDiv.scrollIntoView({ behavior: 'smooth' });
          });

          const downloadBtn = document.getElementById('download-btn');
          if (downloadBtn) {
            downloadBtn.addEventListener('click', async () => {
              downloadBtn.innerText = '⏳ Convertendo...';
              downloadBtn.disabled = true;

              const videoID = downloadBtn.dataset.videoId;

              try {
                const resDownload = await fetch(
                  `/convert-mp3?videoID=${videoID}`
                );

                if (!resDownload.ok) {
                  console.error(
                    `Erro ${resDownload.status}: falha na conversão.`
                  );
                  downloadBtn.innerText = '❌ Erro na conversão';
                  return;
                }

                const blob = await resDownload.blob();
                const blobUrl = window.URL.createObjectURL(blob);

                const a = document.createElement('a');
                a.href = blobUrl;
                a.download = `${videoID}.mp3`;
                document.body.appendChild(a);
                a.click();
                a.remove();
                window.URL.revokeObjectURL(blobUrl);

                downloadBtn.innerText = '✅ Baixado!';
              } catch (error) {
                console.error('Erro na conversão:', error);
                downloadBtn.innerText = '❌ Erro';
              } finally {
                downloadBtn.disabled = false;
              }
            });
          }
        } else {
          resultDiv.innerHTML = `<p>Erro: ${data.message}</p>`;
          resultDiv.style.display = 'flex';
          loading.style.display = 'none';
        }
      } catch (error) {
        resultDiv.innerHTML = `<p>Erro ao conectar à API.</p>`;
        resultDiv.style.display = 'flex';
        loading.style.display = 'none';
        console.error(error);
      }
    });
  }
});
