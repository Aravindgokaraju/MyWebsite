import React from 'react';
import styles from './landingPage.module.css';
import apiService from '../../pymonitor/apiService'; // Changed from named import to default import

const LandingPage = () => {
  // Logic for upgrade/downgrade (example)
  const handleUpgrade = async () => {
    try {
      const response = await apiService.users.applyUpgrade();
      console.log('Upgrade successful:', response.data);

      // Optional: refresh user state or show toast
      alert('Upgraded to premium!');
    } catch (error) {
      console.error('Upgrade failed:', error);
      alert('Upgrade failed');
    }
  };

  const handleDowngrade = async () => {
    try {
      const response = await apiService.users.applyDowngrade();
      console.log('Downgrade successful:', response.data);

      alert('Downgraded to demo');
    } catch (error) {
      console.error('Downgrade failed:', error);
      alert('Downgrade failed');
    }
  };
  return (
    <div className={styles.container}>
      <div className={styles.welcomeCard}>
        <h2>System Overview</h2>
        <p>Welcome to PyMonitor. Use the sidebar to manage your SKUs, Flows, and Price Data.</p>

        <div className={styles.statsGrid}>
          <div className={styles.statBox}>
            <span>Status</span>
            <strong>Active</strong>
          </div>
          <div className={styles.statBox}>
            <span>Tier</span>
            <strong>Professional</strong>
          </div>
        </div>
      </div>

      <div className={styles.actionSection}>
        <h3>Subscription Management</h3>
        <div className={styles.buttonGroup}>
          <button onClick={handleUpgrade} className={styles.upgradeBtn}>
            Upgrade Plan
          </button>
          <button onClick={handleDowngrade} className={styles.downgradeBtn}>
            Downgrade Plan
          </button>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;