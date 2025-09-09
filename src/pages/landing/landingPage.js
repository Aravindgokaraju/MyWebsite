import { useState } from 'react';
import apiService from '../../pymonitor/apiService';
import './landingPage.css';

function LandingPage({ onNavigate }) {
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleUpgrade = async () => {
    setIsLoading(true);
    setMessage('');
    try {
      const response = await apiService.users.applyUpgrade();
      setMessage(response.data.message || 'Premium upgrade successful!');
    } catch (error) {
      setMessage(error.response?.data?.error || 'Upgrade failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDowngrade = async () => {
    setIsLoading(true);
    setMessage('');
    try {
      const response = await apiService.users.applyDowngrade();
      setMessage(response.data.message || 'Downgrade successful!');
    } catch (error) {
      setMessage(error.response?.data?.error || 'Downgrade failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="landing-page">
      <h1>Docker Ready PyMonitor</h1>
      <p className="intro-text">
        This is the sample deploy of PyMonitor. A webscraping app built on React, Django, Supabase for SQL and Atlas for Mongo db.
        Containerized through docker, the app has a UI container, API container, and a worker container which can be run on the cloud but I chose
        to run locally due to computational requirements to run chrome and no free tier being powerful enough to do so.
      </p>

      <div className="button-container">
        <button onClick={() => onNavigate('execution')}>Go to Execution Form</button>
        <button onClick={() => onNavigate('skuCrud')}>SKU Management</button>
        <button onClick={() => onNavigate('flowCrud')}>Flow Configuration</button>
        <button onClick={() => onNavigate('PriceDataViewer')}>Price Data Viewer</button>
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

      {message && <p className="status-message">{message}</p>}
    </div>
  );
}

export default LandingPage;
