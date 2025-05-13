import { useState, useEffect } from 'react';
import PageContainer from '../../base/contentContainers/PageContainer';
import CardContainer from '../../base/contentContainers/CardContainer';
import defIco from '../../../../public/icons/defLogo.svg';
import { analyzeCompany } from '../../../back/EndPoints';

import './CompanyPage.css';

export default function CompanyPage({ companyData, onAnalyzeCheck, onInfoCheck, onRatingCheck }) {
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!companyData) {
      
    }
  }, [companyData]);


	const handleAnalyzeClick = async (companyID) => {
		setIsLoading(true);

		try {
			const analyzeData = await analyzeCompany(companyID);
			console.log(analyzeData);
			onAnalyzeCheck(analyzeData);
		} 
		catch (error) {
			console.error('Fetch analyze error:', error);
		}
		finally{
			setIsLoading(false);
			console.log("open analyze");
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

  if (!companyData || isLoading) return <div>Загрузка...</div>;

  return (
	
    <PageContainer>

		<div></div>
		{isLoading ? (
        <div className="loading">Загрузка...</div>
      ) : (
		<div>
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
					<CardContainer>
						<div className="company-rating">
							<h2>Рейтинг: {companyData.rating}/5.0 ★</h2>
						</div>
					</CardContainer>

					<div style={{marginTop:"30px"}}></div>

					<CardContainer>
						<div className="company-rating">
							<h2>Отзывов: {companyData.reviewsCount}📊</h2>
						</div>
					</CardContainer>
				</div>

				
			</div>

			<AnalyzeCard company={companyData} onClick={handleAnalyzeClick} />
		</div>
	  )
	}
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