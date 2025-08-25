import './App.css';
import './styles/global.css';
import { useState } from 'react';
import apiService from './pymonitor/apiService'; // Changed from named import to default import

import ExecutionForm from './pages/execution/execution';
import SkuCrud from './pages/skus/skus';
import FlowCrud from './pages/flows/flows'; // Import the FlowCrud component
import PriceDataViewer from './pages/pricedata/pricedata'; // Import the FlowCrud component

function LandingPage({ onNavigate }) {
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);


  const handleUpgrade = async () => {
    console.log("HandleUpgrade")
    setIsLoading(true);
    setMessage('');

    try {
      const response = await apiService.users.applyUpgrade();
      console.log(response.data.message);
      setMessage(response.data.message || 'Premium upgrade successful!');
    } catch (error) {
      setMessage(error.response?.data?.error || 'Upgrade failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

    const handleDowngrade = async () => {
    console.log("HandleUpgrade")
    setIsLoading(true);
    setMessage('');

    try {
      const response = await apiService.users.applyDowngrade();
      console.log(response.data.message);
      setMessage(response.data.message || 'Premium upgrade successful!');
    } catch (error) {
      setMessage(error.response?.data?.error || 'Upgrade failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };
  return (
    <div className="landing-page">
      <h1>Docker Redy Pymonitor</h1>
      <div className="button-container">
        <button onClick={() => onNavigate('execution')}>Go to Execution Form</button>
        <button onClick={() => onNavigate('skuCrud')}>SKU Management</button>
        <button onClick={() => onNavigate('flowCrud')}>Flow Configuration</button>
        <button onClick={() => onNavigate('PriceDataViewer')}>Price data Viewer</button>
        <button
          onClick={handleUpgrade}
          disabled={isLoading}
          className="upgrade-button"
        >
          {isLoading ? 'Testing Premium...' : 'Test Premium Upgrade'}
        </button>
        <button
          onClick={handleDowngrade}
          disabled={isLoading}
          className="upgrade-button"
        >
          {isLoading ? 'Testing Demo...' : 'Test Demo Downgrade'}
        </button>
      </div>
    </div>
  );
}

function App() {
  const [currentPage, setCurrentPage] = useState('landing');

  const navigateTo = (page) => {
    setCurrentPage(page);
  };

  const goBack = () => {
    setCurrentPage('landing');
  };

  return (
    <div className="App">
      {currentPage === 'landing' && <LandingPage onNavigate={navigateTo} />}
      {currentPage === 'execution' && <ExecutionForm onBack={goBack} />}
      {currentPage === 'skuCrud' && <SkuCrud onBack={goBack} />}
      {currentPage === 'flowCrud' && <FlowCrud onBack={goBack} />}
      {currentPage === 'PriceDataViewer' && <PriceDataViewer onBack={goBack} />}
      //Addd here
    </div>
  );
}

export default App;