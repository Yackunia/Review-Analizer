import { useState, useEffect } from 'react';
import PageContainer from '../../base/contentContainers/PageContainer';
import CardContainer from '../../base/contentContainers/CardContainer';
import defIco from '../../../../public/icons/defLogo.svg';
import { mockCompaniesList, mockCompanyAnalysis } from '../../../mocks/companies';
import { analyzeCompany } from '../../../back/EndPoints';

import './CompanyPage.css';

export default function CompanyPage({ companyData, onAnalyzeCheck, onInfoCheck, onRatingCheck }) {

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

  if (!companyData) return <div>Загрузка...</div>;

  return (
    <PageContainer>
		<div className='cards-line'>
			<div className="card-name">
				<CardContainer>
					<div className="company-header">
						<div className="company-logo">
							<img 
								src={companyData.logoUrl || defIco} 
								alt="Логотип"
								onError={(e) => e.target.src = defIco}
							/>
						</div>
						<div className="company-title">
							<h3>{companyData.tagline}</h3>
							<h1>{companyData.name}</h1>
						</div>		
					</div>

					<p>{companyData.description}</p>		
				</CardContainer>
			</div>
		
			<div className="card-rating">
				<CardContainer width='800px' minWidth="500px" height={"120px"}>
					<div className="company-rating">
						<h2>Рейтинг: {companyData.rating}/5.0 ★</h2>
					</div>
				</CardContainer>
			</div>

			
		</div>

		<AnalyzeCard company={companyData} onClick={handleAnalyzeClick} />

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