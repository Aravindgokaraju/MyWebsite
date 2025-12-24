import { useState, useEffect } from 'react';
import apiService from '../../pymonitor/apiService'; // Changed from named import to default import
import styles from './SkuCrud.module.css';

const SkuCrud = ({ onBack }) => {
  const [skus, setSkus] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    sku_number: '',
    name: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch SKUs on component mount
  useEffect(() => {
    fetchSkus();
  }, []);

  const fetchSkus = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await apiService.sku.getAll();
      setSkus(response.data);
    } catch (err) {
      setError(err.drfMessage || 'Failed to fetch SKUs');
      console.error('Error fetching SKUs:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      if (editingId) {
        // Update existing SKU
        const response = await apiService.sku.update(editingId, formData);
        setSkus(skus.map(sku => 
          sku.id === editingId ? response.data : sku
        ));
      } else {
        // Create new SKU
        const response = await apiService.sku.create(formData);
        setSkus([...skus, response.data]);
      }
      
      setEditingId(null);
      setFormData({ sku_number: '', name: '' });
    } catch (err) {
      setError(err.drfMessage || 'Failed to save SKU');
      console.error('Error saving SKU:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (sku) => {
    setEditingId(sku.id);
    setFormData({
      sku_number: sku.sku_number,
      name: sku.name
    });
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this SKU?')) return;
    
    setIsLoading(true);
    try {
      await apiService.sku.delete(id);
      setSkus(skus.filter(sku => sku.id !== id));
    } catch (err) {
      setError(err.drfMessage || 'Failed to delete SKU');
      console.error('Error deleting SKU:', err);
    } finally {
      setIsLoading(false);
    }
  };

 return (
    <div className={styles.container}>
      <div className={styles.header}>
      </div>
      
      {error && <div className={styles.errorMessage}>{error}</div>}
      
      <form onSubmit={handleSubmit} className={styles.form}>
        <div className={styles.formGroup}>
          <label>SKU Number:</label>
          <input
            type="text"
            name="sku_number"
            value={formData.sku_number}
            onChange={handleInputChange}
            required
          />
        </div>
        
        <div className={styles.formGroup}>
          <label>Product Name:</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            required
          />
        </div>
        
        <div className={styles.buttonGroup}>
          <button 
            type="submit" 
            className={styles.submitButton}
            disabled={isLoading}
          >
            {isLoading ? 'Processing...' : editingId ? 'Update SKU' : 'Add SKU'}
          </button>
          
          {editingId && (
            <button 
              type="button" 
              onClick={() => {
                setEditingId(null);
                setFormData({ sku_number: '', name: '' });
              }}
              className={styles.cancelButton}
              disabled={isLoading}
            >
              Cancel
            </button>
          )}
        </div>
      </form>
      
      <div className={styles.skuList}>
        <h2>SKU List</h2>
        {isLoading && skus.length === 0 ? (
          <p className={styles.loadingMessage}>Loading SKUs...</p>
        ) : skus.length === 0 ? (
          <p className={styles.emptyMessage}>No SKUs found</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>SKU Number</th>
                <th>Product Name</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {skus.map(sku => (
                <tr key={sku.id}>
                  <td>{sku.id}</td>
                  <td>{sku.sku_number}</td>
                  <td>{sku.name}</td>
                  <td className={styles.actions}>
                    <button 
                      onClick={() => handleEdit(sku)} 
                      className={styles.editButton}
                      disabled={isLoading}
                    >
                      Edit
                    </button>
                    <button 
                      onClick={() => handleDelete(sku.id)} 
                      className={styles.deleteButton}
                      disabled={isLoading}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default SkuCrud;