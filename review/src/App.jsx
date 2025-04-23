import { useState } from 'react';
import TopBar from './components/base/upBar/TopBar';
import FinderPage from './components/pages/FinderPage/FinderPage';
import CompanyPage from './components/pages/CompanyPage/CompanyPage';
import AnalyzePage from './components/pages/AnalyzePage/AnalyzePage';
import ContentContainer from './components/base/contentContainers/ContentContainer';
import './App.css';


function App() {
	const [currentPage, setCurrentPage] = useState('finder');
	const [previousPage, setPreviousPage] = useState('')
	const [searchQuery, setSearchQuery] = useState('');
	const [companyDetails, setCompanyDetails] = useState(null);
	const [companyAnalyze, setCompanyAnalyze] = useState(null);
	const [similarCompanies, setSimilarCompanies] = useState([]);
  
	const handleCompanySelect = (details = companyDetails) => {
	  setCompanyDetails(details);
	  setCurrentPage('company');
	  setPreviousPage('finder');
	};

	const handleAnalyzeSelect = (details = companyAnalyze) => {
		setCompanyAnalyze(details);
		setCurrentPage('analyze');
		setPreviousPage('company');
	  };

	const selectPageToPrevious = () => {
		setCurrentPage(previousPage);
		setPreviousPage(previousPage == "analyze" ? "company" : previousPage == "company" ? "finder" : "");
	}
  
	return (
	  <>
		<TopBar 
		  onSearch={(query) => {
			setSearchQuery(query);
			setCurrentPage('finder');
			setPreviousPage('')
		  }}
		  moveToPreviousPage={selectPageToPrevious}
		/>
		

		<ContentContainer>
		  {currentPage === 'finder' && 
			<FinderPage 
			  searchQuery={searchQuery}
			  onCompanySelect={handleCompanySelect}
			  companies={similarCompanies}
			  setCompanies={setSimilarCompanies}
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