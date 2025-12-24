import React, { useState } from 'react';
import apiService from '../../pymonitor/apiService';
import styles from './PriceDataViewer.module.css';

const PriceDataViewer = () => {
    const [priceData, setPriceData] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleFetchPriceData = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const response = await apiService.priceData.getSorted();
            setPriceData(response.data || []);
        } catch (err) {
            setError(err.message || 'Failed to fetch price data');
        } finally {
            setIsLoading(false);
        }
    };

    const getSafeUrl = (url) => {
        if (!url || url.trim() === '') return null;
        return (!url.startsWith('http://') && !url.startsWith('https://')) ? `https://${url}` : url;
    };

    const getHostname = (url) => {
        try { return new URL(url).hostname; } 
        catch { return url || 'N/A'; }
    };

    return (
        <div className={styles['page-container']}>
            {/* Cleaner Action Bar: Only one title and the button */}
            <div className={styles.actionBar}>
                
                <button
                    onClick={handleFetchPriceData}
                    disabled={isLoading}
                    className={`${styles.primaryButton} ${isLoading ? styles.loading : ''}`}
                >
                    {isLoading ? 'Refreshing...' : 'Refresh Data'}
                </button>
            </div>

            {error && <div className={styles.errorBanner}>{error}</div>}

            <div className={styles.contentCard}>
                {!priceData.length && !isLoading && (
                    <div className={styles.emptyState}>
                        <p>No data loaded. Use the button above to fetch latest prices.</p>
                    </div>
                )}

                {priceData.length > 0 && (
                    <div className={styles.tableWrapper}>
                        <table className={styles.priceTable}>
                            <thead>
                                <tr>
                                    <th>SKU</th>
                                    <th>Product Name</th>
                                    <th>Best Price</th>
                                    <th>Top Vendor</th>
                                    <th>Market Offers</th>
                                </tr>
                            </thead>
                            <tbody>
                                {priceData.map((item) => (
                                    <tr key={item.sku_number}>
                                        <td className={styles.skuCell}>{item.sku_number}</td>
                                        <td className={styles.nameCell}><strong>{item.product_name}</strong></td>
                                        <td className={styles.priceCell}>${item.best_price.toFixed(2)}</td>
                                        <td>
                                            <a href={getSafeUrl(item.best_price_website)} target="_blank" rel="noopener noreferrer" className={styles.vendorLink}>
                                                {getHostname(getSafeUrl(item.best_price_website))}
                                            </a>
                                        </td>
                                        <td>
                                            <div className={styles.miniOfferList}>
                                                {item.all_offers.slice(0, 3).map((offer, index) => (
                                                    <div key={index} className={styles.miniOffer}>
                                                        <span className={styles.offerPrice}>${offer.price.toFixed(2)}</span>
                                                        <span className={styles.offerVendor}>{getHostname(getSafeUrl(offer.website))}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};

export default PriceDataViewer;