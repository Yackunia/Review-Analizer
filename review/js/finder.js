// finder.js
import { searchCompaniesByName, getCompanyById } from '../back/EndPoints.js';
import { renderContent, state } from './state.js';
import mockCompany from '../back/Mocks.js';

async function fetchCompanies() {
  state.isLoading = true;
  state.lastSearchQuery = state.searchQuery;
  renderContent();

  try {
    if (state.isUsingMockData) {
      state.similarCompanies = [mockCompany];
    } else {
      state.similarCompanies = await searchCompaniesByName(state.searchQuery);
    }
  } catch (error) {
    console.error('Search error:', error);
    state.similarCompanies = state.isUsingMockData ? [mockCompany] : [];
  } finally {
    state.isLoading = false;
    renderContent();
  }
}

export function renderFinderPage(container) {
  const page = document.createElement('div');
  page.className = 'page_container';

  if (state.isLoading) {
    const loader = document.createElement('div');
    loader.className = 'loading';
    loader.textContent = 'Загрузка...';
    page.append(loader);
  } else if (state.similarCompanies.length > 0) {
    const listDiv = document.createElement('div');
    listDiv.className = 'companies-list';
    const header = document.createElement('h1');
    header.textContent = 'Результаты поиска';
    listDiv.append(header);

    state.similarCompanies.forEach(company => {
      const card = document.createElement('div');
      card.className = 'container-card';
      card.style.maxWidth = '1200px';

      const title = document.createElement('h3');
      title.textContent = company.name;
      const desc = document.createElement('p');
      desc.textContent = company.description;
      card.append(title, desc);

      card.addEventListener('click', () => {
        card.classList.add('click-animation');
        setTimeout(async () => {
          card.classList.remove('click-animation');

          state.isLoading = true;
          renderContent();

          if (state.isUsingMockData) {
            state.companyDetails = mockCompany;
          } else {
            try {
              state.companyDetails = await getCompanyById(company.ID);
            } catch (err) {
              console.error('Fetch by ID error:', err);
              state.companyDetails = null;
            }
          }

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
    const empty = document.createElement('div');
    empty.className = 'empty-state';
    empty.textContent = state.searchQuery
      ? 'Ничего не найдено'
      : 'Введите запрос для поиска компаний';
    page.append(empty);
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
