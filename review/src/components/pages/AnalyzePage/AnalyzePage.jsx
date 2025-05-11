import { useState, useEffect } from 'react';
import PageContainer from '../../base/contentContainers/PageContainer';
import CardContainer from '../../base/contentContainers/CardContainer';
import defIco from '../../../../public/icons/defLogo.svg';
import './AnalyzePage.css';

export default function AnalyzePage({ company, analyzeData }) {
  if (!analyzeData) {
    return (
      <PageContainer>
		<div></div>
        <CardContainer>
          <h1>Данные анализа не найдены</h1>
        </CardContainer>
      </PageContainer>
    );
  }

  console.log(analyzeData);

  return (
    <PageContainer>
      {/* Шапка компании */}
	  <div>
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
      </CardContainer>
	  </div>

	<div style={{"paddingBottom" : "25px"}}>
		
		<div style={{"marginTop" : "25px", "marginBottom" : "25px"}}>
			<CardContainer>
				<h1>Подробный анализ</h1>
				<p className="analyze-text">{analyzeData[0]}</p>
			</CardContainer>
		</div>

		<div style={{"marginTop" : "25px", "marginBottom" : "25px"}}>
    <div style={{ marginTop: "25px", marginBottom: "25px" }}>
  <CardContainer>
    <h1>Источники</h1>
    {(() => {
      const items = analyzeData[1].split("\n");
      const result = [];

      for (let i = 0; i < items.length; i += 2) {
        const link = items[i];
        const title = items[i + 1];

        if (link && title) {
          result.push(
            <p key={i}>
              <a href={link} target="_blank" rel="noopener noreferrer" style={{ color: '#007bff', textDecoration: 'underline' }}>
                {title}
              </a>
            </p>
          );
        }
      }

      return result;
    })()}
  </CardContainer>
</div>

  </div>

	</div>

    </PageContainer>
  );
}