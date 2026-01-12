document.addEventListener('DOMContentLoaded', () => {
  const searchBtn = document.getElementById('search-btn');

  if (searchBtn) {
    searchBtn.addEventListener('click', async (e) => {
      e.preventDefault();
      console.log('Botão de busca clicado.');
      const urlInput = document.getElementById('videoUrl');
      const resultDiv = document.getElementById('result');

      if (!urlInput) {
        alert('por favor, insira uma URL.');
        return;
      }

      if (!resultDiv) {
        console.error('Erro: O elemento "result" não foi encontrado.');
        return;
      }

      const url = urlInput.value;
      resultDiv.innerHTML = '🔄 Carregando...';

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
            <iframe
              src="https://www.youtube.com/embed/${data.video_id}"
              frameborder="0"
              width="720"
              height="420"
            ></iframe>
            <img src="${
              data.thumbnail
            }" alt="Thumbnail" style="width:100%; max-width:300px;">
            <div> 
              <p>Qualidades disponíveis:</p>
              <ul>  
                ${data.qualities.map((q) => `<li>${q}</li>`).join('')}
              </ul>
            </div>
            <div class="btn-download">
            <form action="/convert-mp3/${data.video_id}" method="POST">
              <a class="btn-download" id="download-btn">
                ⬇️ Baixar MP3
              </a>
            </form>
      </div>
          `;

          const downloadBtn = document.getElementById('download-btn');
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
