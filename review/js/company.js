// company.js
import { state, goToPage, renderContent } from './state.js';
import { analyzeCompany, getCompanyById } from '../back/EndPoints.js';
import mockCompany from '../back/Mocks.js';

export function renderCompanyPage(container) {
  // подтягиваем моковые данные, если нужно
  if (state.isUsingMockData && !state.companyDetails) {
    state.companyDetails = mockCompany;
  }

  const company = state.companyDetails;
  const page = document.createElement('div');
  page.className = 'page_container';

  // лоадер
  if (state.isLoading) {
    const loading = document.createElement('div');
    loading.className = 'loading';
    loading.textContent = 'Загрузка...';
    page.append(loading);
    container.append(page);
    return;
  }

  // если нет данных
  if (!company) {
    const empty = document.createElement('div');
    empty.className = 'empty-state';
    empty.textContent = 'Компания не выбрана';
    page.append(empty);
    container.append(page);
    return;
  }

  // --- Карточки с основными данными ---
  const cardsLine = document.createElement('div');
  cardsLine.className = 'cards-line';

  // имя и описание
  const cardName = document.createElement('div');
  cardName.className = 'card-name';
  const nameCard = document.createElement('div');
  nameCard.className = 'container-card';

  const headerBox = document.createElement('div');
  headerBox.className = 'company-header';

  const logoDiv = document.createElement('div');
  logoDiv.className = 'company-logo';
  const img = document.createElement('img');
  img.src = company.logoUrl || 'icons/defLogo.svg';
  img.alt = 'Логотип';
  img.onerror = () => { img.src = 'icons/defLogo.svg'; };
  logoDiv.append(img);

  const titleDiv = document.createElement('div');
  titleDiv.className = 'company-title';
  const hTag = document.createElement('h3');
  hTag.textContent = company.tagline;
  const hName = document.createElement('h1');
  hName.textContent = company.name;
  titleDiv.append(hTag, hName);

  headerBox.append(logoDiv, titleDiv);
  nameCard.append(headerBox);
  const descP = document.createElement('p');
  descP.textContent = company.description;
  nameCard.append(descP);

  cardName.append(nameCard);
  cardsLine.append(cardName);

  // рейтинг и количество отзывов
  const cardRating = document.createElement('div');
  cardRating.className = 'card-rating';

  const ratingCard = document.createElement('div');
  ratingCard.className = 'container-card';
  const ratingDiv = document.createElement('div');
  ratingDiv.className = 'company-rating';
  const h2rating = document.createElement('h2');
  h2rating.textContent = `Рейтинг: ${company.rating}/5.0 ★`;
  ratingDiv.append(h2rating);
  ratingCard.append(ratingDiv);

  const reviewsCard = document.createElement('div');
  reviewsCard.className = 'container-card';
  reviewsCard.style.marginTop = '30px';
  const reviewsDiv = document.createElement('div');
  reviewsDiv.className = 'company-rating';
  const h2reviews = document.createElement('h2');
  h2reviews.textContent = `Отзывов: ${company.reviewsCount}📊`;
  reviewsDiv.append(h2reviews);
  reviewsCard.append(reviewsDiv);

  cardRating.append(ratingCard, reviewsCard);
  cardsLine.append(cardRating);
  page.append(cardsLine);

  // --- Кнопки Инфо и Рейтинг ---
  const actionsDiv = document.createElement('div');
  actionsDiv.className = 'company-actions';

  const infoBtn = document.createElement('button');
  infoBtn.className = 'back-button';
  infoBtn.textContent = 'Информация';
  const infoResult = document.createElement('div');
  infoResult.className = 'action-result';

  infoBtn.addEventListener('click', async () => {
    infoBtn.disabled = true;
    try {
      let infoData;
      if (state.isUsingMockData) {
        infoData = mockCompany;
      } else {
        const res = await fetch(`/api/company/info?id=${company.ID}`);
        infoData = await res.json();
      }
      infoResult.textContent = JSON.stringify(infoData, null, 2);
    } catch (err) {
      infoResult.textContent = 'Ошибка загрузки информации';
      console.error(err);
    } finally {
      infoBtn.disabled = false;
    }
  });

  const ratingBtn = document.createElement('button');
  ratingBtn.className = 'back-button';
  ratingBtn.textContent = 'Рейтинг';
  const ratingResult = document.createElement('div');
  ratingResult.className = 'action-result';

  ratingBtn.addEventListener('click', async () => {
    ratingBtn.disabled = true;
    try {
      let rateData;
      if (state.isUsingMockData) {
        rateData = mockCompany;
      } else {
        const res = await fetch(`/api/company/rating?id=${company.ID}`);
        rateData = await res.json();
      }
      ratingResult.textContent = JSON.stringify(rateData, null, 2);
    } catch (err) {
      ratingResult.textContent = 'Ошибка загрузки рейтинга';
      console.error(err);
    } finally {
      ratingBtn.disabled = false;
    }
  });

  actionsDiv.append(infoBtn, ratingBtn);
  page.append(actionsDiv, infoResult, ratingResult);

  // --- Анализ отзывов ---
  const cardsEnd = document.createElement('div');
  cardsEnd.className = 'cards-end';
  const analyzeCard = document.createElement('div');
  analyzeCard.className = 'container-card reviews-analysis';
  analyzeCard.addEventListener('click', () => {
    analyzeCard.classList.add('click-animation');
    setTimeout(async () => {
      analyzeCard.classList.remove('click-animation');
      state.isLoading = true; renderContent();
      try {
        const data = await analyzeCompany(company.ID);
        state.companyDetails = data;
        goToPage('analyze');
      } catch (err) {
        console.error('Fetch analyze error:', err);
      } finally {
        state.isLoading = false; renderContent();
      }
    }, 500);
  });

  const h1anal = document.createElement('h1'); h1anal.textContent = 'Анализ отзывов';
  const pSummary = document.createElement('p'); pSummary.textContent = company.reviewsSummary;
  analyzeCard.append(h1anal, pSummary);
  cardsEnd.append(analyzeCard);
  page.append(cardsEnd);

  container.append(page);
}