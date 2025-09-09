import './App.css';
import './styles/global.css';
import { useState } from 'react';

import ExecutionForm from './pages/execution/execution';
import SkuCrud from './pages/skus/skus';
import FlowCrud from './pages/flows/flows';
import PriceDataViewer from './pages/pricedata/pricedata';
import LandingPage from './pages/landing/landingPage';

function App() {
  const [currentPage, setCurrentPage] = useState('landing');

  const navigateTo = (page) => setCurrentPage(page);
  const goBack = () => setCurrentPage('landing');

  return (
    <div className="App">
      {currentPage === 'landing' && <LandingPage onNavigate={navigateTo} />}
      {currentPage === 'execution' && <ExecutionForm onBack={goBack} />}
      {currentPage === 'skuCrud' && <SkuCrud onBack={goBack} />}
      {currentPage === 'flowCrud' && <FlowCrud onBack={goBack} />}
      {currentPage === 'PriceDataViewer' && <PriceDataViewer onBack={goBack} />}
    </div>
  );
}

export default App;
