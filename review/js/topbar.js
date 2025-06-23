import { setSearchQuery, goBack } from './state.js';

export function initTopBar() {
  const input = document.getElementById('search-input');
  const btnSearch = document.getElementById('search-btn');
  const btnBack   = document.getElementById('back-btn');
  const btnHelp   = document.getElementById('help-btn');
  const wrapper   = document.getElementById('search-wrapper');

  btnSearch.addEventListener('click', () => {
    wrapper.classList.add('input-search-trigger');
    setTimeout(() => wrapper.classList.remove('input-search-trigger'), 500);
    setSearchQuery(input.value.trim());
  });

  input.addEventListener('keypress', e => {
    if (e.key === 'Enter') {
      btnSearch.click();
    }
  });

  btnBack.addEventListener('click', () => {
    goBack();
  });

  btnHelp.addEventListener('click', () => {
    console.log('Открыть справку');
    alert('Здесь будет справка по приложению');
  });
}
