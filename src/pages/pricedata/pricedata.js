import { useState } from 'react';
import apiService from '../../pymonitor/apiService';
import styles from './PriceDataViewer.module.css'; // Correct import syntax

const PriceDataViewer = ({ onBack }) => {
    const [priceData, setPriceData] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleFetchPriceData = async () => {
        setIsLoading(true);
        setError(null);
        setPriceData(null);

        try {
            const response = await apiService.priceData.getSorted();
            console.log('Price Data:', response.data);
            setPriceData(response.data);
        } catch (err) {
            console.error('Error fetching price data:', err);
            setError(err.message || 'Failed to fetch price data');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className={styles['price-data-container']}>
            <div className={styles.header}>
                <h1>Price Data Viewer</h1>
                <button onClick={onBack} className={styles['back-button']}>
                    Back to Home
                </button>
            </div>

            <button
                onClick={handleFetchPriceData}
                disabled={isLoading}
                className={styles['fetch-button']}
            >
                {isLoading ? 'Loading...' : 'Fetch Best Prices'}
            </button>

            {error && <div className={styles['error-message']}>{error}</div>}

            {priceData && (
                <div className={styles['price-table-container']}>
                    <table className={styles['price-table']}>
                        <thead>
                            <tr>
                                <th>SKU</th>
                                <th>Product Name</th>
                                <th>Best Price</th>
                                <th>Website</th>
                                <th>All Offers</th>
                            </tr>
                        </thead>
                        <tbody>
                            {priceData.map((item) => (
                                <tr key={item.sku_number}>
                                    <td>{item.sku_number}</td>
                                    <td>{item.product_name}</td>
                                    <td>${item.best_price.toFixed(2)}</td>
                                    <td>
                                        <a
                                            href={item.best_price_website}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                        >
                                            {new URL(item.best_price_website).hostname}
                                        </a>
                                    </td>
                                    <td>
                                        <ul className={styles['offers-list']}>
                                            {item.all_offers.map((offer, index) => (
                                                <li key={index}>
                                                    ${offer.price.toFixed(2)} -
                                                    <a
                                                        href={offer.website}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className={styles['offer-link']}
                                                    >
                                                        {new URL(offer.website).hostname}
                                                    </a>
                                                    <span className={styles['offer-time']}>
                                                        ({new Date(offer.last_updated).toLocaleDateString()})
                                                    </span>
                                                </li>
                                            ))}
                                        </ul>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default PriceDataViewer;