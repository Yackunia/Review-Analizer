export const state = {
  currentPage: 'find',
  previousPage: '',
  searchQuery: '',
  lastSearchQuery: '',
  similarCompanies: [],
  companyDetails: null,
  isUsingMockData: false,
  isLoading: false
};

export function goToPage(page) {
  state.previousPage = state.currentPage;
  state.currentPage = page;
  renderContent();
}

export function goBack() {
  const prev = state.previousPage || 'finder';
  state.currentPage = prev;
  state.previousPage = prev === 'analyze' ? 'company' : prev === 'company' ? 'finder' : '';
  renderContent();
}

export function setSearchQuery(q) {
  state.searchQuery = q;
  goToPage('finder');
}

import { renderFinderPage } from './finder.js';
import { renderCompanyPage } from './company.js';
import { renderAnalyzePage } from './analyze.js';

export function renderContent() {
  const out = document.getElementById('content');
  out.innerHTML = '';
  switch (state.currentPage) {
    case 'finder':
      renderFinderPage(out);
      break;
    case 'company':
      renderCompanyPage(out);
      break;
    case 'analyze':
      renderAnalyzePage(out);
      break;
  }
}
