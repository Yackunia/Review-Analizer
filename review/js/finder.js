import { searchCompaniesByName, getCompanyById } from '../back/EndPoints.js';
import { renderContent } from './state.js';
import mockCompany from '../back/Mocks.js';
import { state } from './state.js';

async function fetchCompanies() {
  state.isLoading = true;
  state.lastSearchQuery = state.searchQuery;
  renderContent();

  try {
    state.similarCompanies = await searchCompaniesByName(state.searchQuery);
  } catch (error) {
    if (state.isUsingMockData) {
      state.similarCompanies = [mockCompany];
    } else {
      state.similarCompanies = [];
    }
  }

  state.isLoading = false;
  renderContent();
}

export function renderFinderPage(container) {
  const page = document.createElement('div');
  page.className = 'page_container';

  if (state.isLoading) {
    const d = document.createElement('div');
    d.className = 'loading';
    d.textContent = 'Загрузка...';
    page.append(d);
  } else if (state.similarCompanies.length > 0) {
    const listDiv = document.createElement('div');
    listDiv.className = 'companies-list';
    const h1 = document.createElement('h1');
    h1.textContent = 'Результаты поиска';
    listDiv.append(h1);

    state.similarCompanies.forEach(company => {
      const card = document.createElement('div');
      card.className = 'container-card';
      card.style.maxWidth = '1200px';

      const h3 = document.createElement('h3');
      h3.textContent = company.name;

      const p = document.createElement('p');
      p.textContent = company.description;

      card.append(h3, p);

      card.addEventListener('click', () => {
        card.classList.add('click-animation');
        setTimeout(async () => {
          card.classList.remove('click-animation');
          state.isLoading = true;
          renderContent();
          state.companyDetails = await getCompanyById(company.ID);
          state.previousPage = 'finder';
          state.currentPage = 'company';
          state.isLoading = false;
          renderContent();
        }, 500);
      });

      listDiv.append(card);
    });

    page.append(listDiv);
  } else {
    const d = document.createElement('div');
    d.className = 'empty-state';
    d.textContent = state.searchQuery
      ? 'Ничего не найдено'
      : 'Введите запрос для поиска компаний';
    page.append(d);
  }

  container.append(page);

  if (
    state.searchQuery &&
    state.searchQuery !== state.lastSearchQuery &&
    !state.isLoading
  ) {
    fetchCompanies();
  }
}
