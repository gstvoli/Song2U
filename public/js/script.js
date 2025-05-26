const form = document.querySelector('form');
const loadingEl = document.getElementById('loading');

form.addEventListener('submite', () => {
  loadingEl.style.display = 'block';
});
