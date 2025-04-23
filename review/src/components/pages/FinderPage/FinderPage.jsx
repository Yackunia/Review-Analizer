import { useState, useEffect } from 'react';
import PageContainer from '../../base/contentContainers/PageContainer';
import './FinderPage.css';
import CardContainer from '../../base/contentContainers/CardContainer';

import { getCompanyById } from '../../../back/EndPoints';
import { searchCompaniesByName } from '../../../back/EndPoints';

export default function FinderPage({ companies, setCompanies, searchQuery, onCompanySelect }) {
  const [isLoading, setIsLoading] = useState(false);

  const fetchCompanies = async (query) => {
    setIsLoading(true);
    try {
	  console.log("start ")
	  const companiesData = await searchCompaniesByName(query)
	  setCompanies(companiesData)
    } catch (error) {
      console.error('Search error:', error);
    } finally {
	  console.log("stop")
	  console.log(companies)
      setIsLoading(false);
    }
  };

  const handleCardClick = async (companyID) => {
    try {
        const companyDetails = await getCompanyById(companyID); 
        onCompanySelect(companyDetails);
    } catch (error) {
        console.error('Fetch company error:', error);
    }
};

  useEffect(() => {
    if (searchQuery) fetchCompanies(searchQuery);
  }, [searchQuery]);

  return (
    <PageContainer>
      <div></div> 
      {isLoading ? (
        <div className="loading">Загрузка...</div>
      ) : companies.length > 0 ? (
        <div className="companies-list">
          <h1>Результаты поиска</h1>
          {companies.map((company) => (
            <CompanyCard
              key={company.ID}
              company={company}
              onClick={handleCardClick}
            />
          ))}
        </div>
      ) : (
        <div className="empty-state">
          {searchQuery ? 'Ничего не найдено' : 'Введите запрос для поиска компаний'}
        </div>
      )}
    </PageContainer>
  );
}


function CompanyCard({ company, onClick }) {
  const handleClick = (e) => {
    const card = e.currentTarget;
    card.classList.add('click-animation');
    
    setTimeout(() => {
      card.classList.remove('click-animation');
      onClick(company.ID); 
    }, 500);
  };

  return (
    <CardContainer onClick={handleClick}>
      <h3>{company.name}</h3>
      <p>{company.description}</p>
    </CardContainer>
  );
}