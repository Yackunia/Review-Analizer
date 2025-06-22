// topbar.js
import { setSearchQuery, goBack } from './state.js';

export function initTopBar() {
  const input = document.getElementById('search-input');
  const btnSearch = document.getElementById('search-btn');
  const btnBack   = document.getElementById('back-btn');
  const btnHelp   = document.getElementById('help-btn');
  const wrapper   = document.getElementById('search-wrapper');

  // При клике на «лупу»
  btnSearch.addEventListener('click', () => {
    wrapper.classList.add('input-search-trigger');
    setTimeout(() => wrapper.classList.remove('input-search-trigger'), 500);
    setSearchQuery(input.value.trim());
  });

  // По Enter
  input.addEventListener('keypress', e => {
    if (e.key === 'Enter') {
      btnSearch.click();
    }
  });

  // Назад
  btnBack.addEventListener('click', () => {
    goBack();
  });

  // Справка
  btnHelp.addEventListener('click', () => {
    console.log('Открыть справку');
    alert('Здесь будет справка по приложению');
  });
}
