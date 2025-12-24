import { useState } from 'react';
import './App.css';

// Import your components...
import ExecutionForm from './pages/execution/execution';
import SkuCrud from './pages/skus/skus';
import FlowCrud from './pages/flows/flows';
import PriceDataViewer from './pages/pricedata/pricedata';
import LandingPage from './pages/landing/landingPage';

function App() {
  const [currentPage, setCurrentPage] = useState('landing');

  const menuItems = [
    { id: 'landing', label: 'Home' },
    { id: 'execution', label: 'Execution' },
    { id: 'skuCrud', label: 'SKU Management' },
    { id: 'flowCrud', label: 'Flow Editor' },
    { id: 'PriceDataViewer', label: 'Price Viewer' },
  ];

  const renderContent = () => {
    switch (currentPage) {
      case 'execution': return <ExecutionForm />;
      case 'skuCrud': return <SkuCrud />;
      case 'flowCrud': return <FlowCrud />;
      case 'PriceDataViewer': return <PriceDataViewer />;
      default: return <LandingPage />;
    }
  };

  return (
    <div className="dashboard-container">
      {/* Sidebar Navigation */}
      <nav className="sidebar">
        <div className="sidebar-header">
          <h2>PyMonitor</h2>
        </div>
        <ul className="nav-links">
          {menuItems.map((item) => (
            <li key={item.id}>
              <button 
                className={currentPage === item.id ? 'active' : ''} 
                onClick={() => setCurrentPage(item.id)}
              >
                {item.label}
              </button>
            </li>
          ))}
        </ul>
      </nav>

      {/* Main Content Area */}
      <main className="main-content">
        <header className="content-header">
          <h1>{menuItems.find(i => i.id === currentPage)?.label}</h1>
        </header>
        <div className="page-wrapper">
          {renderContent()}
        </div>
      </main>
    </div>
  );
}

export default App;