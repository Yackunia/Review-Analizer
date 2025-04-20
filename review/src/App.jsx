import { useState } from 'react';
import TopBar from './components/base/upBar/TopBar';
import FinderPage from './components/pages/FinderPage/FinderPage';
import CompanyPage from './components/pages/CompanyPage/CompanyPage';
import AnalyzePage from './components/pages/AnalyzePage/AnalyzePage';
import ContentContainer from './components/base/contentContainers/ContentContainer';
import './App.css';


function App() {
	const [currentPage, setCurrentPage] = useState('finder');
	const [searchQuery, setSearchQuery] = useState('');
	const [companyDetails, setCompanyDetails] = useState(null);
	const [companyAnalyze, setCompanyAnalyze] = useState(null);
  
	const handleCompanySelect = (details) => {
	  setCompanyDetails(details);
	  setCurrentPage('company');
	};

	const handleAnalyzeSelect = (details) => {
		setCompanyAnalyze(details);
		setCurrentPage('analyze');
	  };
  
	return (
	  <>
		<TopBar 
		  onSearch={(query) => {
			setSearchQuery(query);
			setCurrentPage('finder');
		  }}
		/>
		

		<ContentContainer>
		  {currentPage === 'finder' && 
			<FinderPage 
			  searchQuery={searchQuery}
			  onCompanySelect={handleCompanySelect}
			/>
		  }
		  {currentPage === 'company' && <CompanyPage 
			  companyData={companyDetails}
			  onAnalyzeCheck={handleAnalyzeSelect}
			/>
		  }
		  {currentPage === 'analyze' && <AnalyzePage 
			  company={companyDetails}
			  analyzeData={companyAnalyze}
			/>
		  }
		</ContentContainer>
	  </>
	);
  }

export default App;