document.getElementById('search-btn').addEventListener('click', async (e) => {
  e.preventyDefault();
  const url = document.getElementById('url').value;
  const resultDiv = document.getElementById('result');
  resultDiv.innerHTML = '🔄 Carregando...';
  console.log('Script' + url);
  try {
    const res = await fetch('/api/search-video', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url })
    });

    const data = await res.json();
    console.log(data);
    if (data.valid) {
      resultDiv.innerHTML = `
        <h3>${data.title}</h3>
        <img src="${data.thumbnail}" alt="Thumbnail">
        <div>
          Qualidades disponíveis:
          <ul>
            ${data.qualities.map((q) => `<li>${q}</li>`).join('')}
          </ul>
          <button id="downloadBtn">Baixar</button>
        </div>
      `;
    } else {
      resultDiv.innerHTML = `<p>Erro: ${data.message}</p>`;
    }
  } catch (error) {
    resultDiv.innerHTML = `<p>Erro ao conectar à API.</p>`;
  }
});
