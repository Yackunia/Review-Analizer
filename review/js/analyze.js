import { state } from './state.js';
import mockCompany from '../back/Mocks.js';

export function renderAnalyzePage(container) {
  if (state.isUsingMockData) {
    state.companyDetails = mockCompany;
  }

  const page = document.createElement('div');
  page.className = 'page_container';

  const company = state.companyDetails;

  if (!company) {
    const card = document.createElement('div');
    card.className = 'container-card';

    const h1 = document.createElement('h1');
    h1.textContent = 'Данные анализа не найдены';

    card.append(h1);
    page.append(document.createElement('div'), card);
    container.append(page);
    return;
  }

  const grouped = {};
  const sources = company.sources || [];

  for (let i = 0; i < sources.length; i += 3) {
    const url = sources[i];
    const platform = sources[i + 1] || 'Другой источник';
    const text = sources[i + 2];
    if (!grouped[platform]) grouped[platform] = [];
    grouped[platform].push({ url, text });
  }

  const cardHeader = document.createElement('div');
  cardHeader.className = 'container-card';

  const headerBox = document.createElement('div');
  headerBox.className = 'company-header';

  const logo = document.createElement('div');
  logo.className = 'company-logo';
  const img = document.createElement('img');
  img.src = company.logoUrl || 'icons/defLogo.svg';
  img.onerror = () => {
    img.src = 'icons/defLogo.svg';
  };
  logo.append(img);

  const title = document.createElement('div');
  title.className = 'company-title';

  const hTag = document.createElement('h3');
  hTag.textContent = company.tagline;

  const hName = document.createElement('h1');
  hName.textContent = company.name;

  title.append(hTag, hName);
  headerBox.append(logo, title);
  cardHeader.append(headerBox);
  page.append(cardHeader);

  const summaryCard = document.createElement('div');
  summaryCard.className = 'container-card';
  summaryCard.style.marginTop = '25px';

  const summaryTitle = document.createElement('h1');
  summaryTitle.textContent = 'Общий анализ отзывов';

  const summaryText = document.createElement('p');
  summaryText.textContent = company.reviewsSummary;

  summaryCard.append(summaryTitle, summaryText);
  page.append(summaryCard);

  Object.entries(grouped).forEach(([platform, sources]) => {
    const platformCard = document.createElement('div');
    platformCard.className = 'container-card';
    platformCard.style.marginTop = '25px';

    const h = document.createElement('h1');
    h.textContent = platform;
    platformCard.append(h);

    sources.forEach(source => {
      const div = document.createElement('div');
      div.style.marginBottom = '20px';

      const p = document.createElement('p');
      p.textContent = source.text;

      const a = document.createElement('a');
      a.href = source.url;
      a.textContent = 'Источник';
      a.target = '_blank';
      a.rel = 'noopener noreferrer';
      a.style.color = '#666';
      a.style.fontSize = '0.9em';

      div.append(p, a);
      platformCard.append(div);
    });

    page.append(platformCard);
  });

  container.append(page);
}
