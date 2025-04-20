import { useState, useEffect } from 'react';
import PageContainer from '../../base/contentContainers/PageContainer';
import CardContainer from '../../base/contentContainers/CardContainer';
import defIco from '../../../../public/icons/defLogo.svg';
import { mockCompaniesList, mockCompanyAnalysis } from '../../../mocks/companies';
import { analyzeCompany } from '../../../back/EndPoints';

import './CompanyPage.css';

export default function CompanyPage({ companyData, onAnalyzeCheck, onInfoCheck, onRatingCheck }) {
  const [company, setCompany] = useState(companyData);


  useEffect(() => {
    if (!companyData) {
      
    }
  }, [companyData]);


  const handleAnalyzeClick = async (companyID) => {
	  try {
		const analyzeData = await analyzeCompany(companyID);
		console.log(analyzeData);
		onAnalyzeCheck(analyzeData);
	  } catch (error) {
		console.error('Fetch analyze error:', error);
	  }
	  finally{
		console.log("open analyze")
	  }
	};

	const handleInfoClick = async (companyID) => {
		try {
		  const response = await fetch(`/api/company/info?id=${companyID}`);
		  const infoDetails = await response.json();
		  onInfoCheck(infoDetails);
		} catch (error) {
		  console.error('Fetch info error:', error);
		}
	  };
	
	const handleRatingClick = async (companyID) => {
	try {
		const response = await fetch(`/api/company/rating?id=${companyID}`);
		const ratingDetails = await response.json();
		onRatingCheck(ratingDetails);
	} catch (error) {
		console.error('Fetch rating error:', error);
	}
	};

  if (!company) return <div>Загрузка...</div>;

  return (
    <PageContainer>
		<div className='cards-line'>
			<CardContainer>
				<div className="company-header">
					<div className="company-logo">
						<img 
							src={company.logoUrl || defIco} 
							alt="Логотип"
							onError={(e) => e.target.src = defIco}
						/>
					</div>
					<div className="company-title">
						<h3>{company.tagline}</h3>
						<h1>{company.name}</h1>
					</div>		
				</div>

				<p>{company.description}</p>

				
			</CardContainer>

			<CardContainer width='800px' minWidth="500px" height={"120px"}>
				<div className="company-rating">
					<h2>Рейтинг: {company.rating}/5.0 ★</h2>
				</div>
			</CardContainer>
		</div>

		<AnalyzeCard company={company} onClick={handleAnalyzeClick} />

    </PageContainer>
  );
}


function AnalyzeCard({ company, onClick }) {
  const handleClick = (e) => {
	const card = e.currentTarget;
	card.classList.add('click-animation');
	
	setTimeout(() => {
	  card.classList.remove('click-animation');
	  onClick(company.ID); 
	}, 500);
  };

  return (
	<div className='cards-end'>
		<CardContainer width='1800px' height={'2000px'} onClick={handleClick}>
			<h1>Анализ отзывов</h1>
			<p>{company.reviewsSummary}</p>
		</CardContainer>
	</div>
  );
}