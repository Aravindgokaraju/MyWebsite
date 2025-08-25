import { useState, useEffect } from 'react';  // Add useEffect to the import
import apiService from '../../pymonitor/apiService'; // Changed from named import to default import
import styles from './ExecutionForm.module.css';  // Import the styles

function ExecutionForm({ onBack }) {
  const [inputValue, setInputValue] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [skus, setSkus] = useState([]);
  const [flows, setFlows] = useState([]);
  const [filteredFlows, setFilteredFlows] = useState([]); // Store filtered flows
  const [executionResult, setExecutionResult] = useState(null);

  useEffect(() => {
    if (inputValue.trim() === '') {
      setFilteredFlows(flows);
    } else {
      const filtered = flows.filter(flow => 
        flow.name.toLowerCase().includes(inputValue.toLowerCase())
      );
      setFilteredFlows(filtered);
    }
  }, [inputValue, flows]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    setSuccess(false);
    setSkus([]);
    setFlows([]);
    setExecutionResult(null);

    try {
      // Execute all requests in parallel
      const [skusResponse, flowsResponse] = await Promise.all([
        apiService.sku.getAll(),
        apiService.flow.getAllFlows()
      ]);
      console.log('SKUs:', skusResponse.data);
      console.log('Flows:', flowsResponse.data.data);
      setSkus(skusResponse.data);
      const fetchedFlows = flowsResponse.data.data || [];
      setFlows(fetchedFlows);


      // Then execute scraping with a selected flow
            const flowsToExecute = inputValue.trim() 
        ? fetchedFlows.filter(flow => 
            flow.name.toLowerCase().includes(inputValue.toLowerCase())
          )
        : fetchedFlows;

      if (fetchedFlows.length > 0) {
        const executionResponse = await apiService.execution.executeScraping({
            skus: skusResponse.data,
            flows: flowsToExecute
        });
        setExecutionResult(executionResponse.data);
      } else {
        console.log(flowsToExecute)
        throw new Error('No flows available to execute');
      }

      setSuccess(true);
    } catch (error) {
      console.error('API Error:', error);
      setError(error.drfMessage || error.message || 'Failed to complete operations');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={styles.container}>
      <h1>Text Input Form</h1>
      <form className={styles.form} onSubmit={handleSubmit}>
        <button 
          onClick={onBack} 
          className={styles.backButton}
        >
          Back to Home
        </button>
        
        <label htmlFor="text-input">Enter your text:</label>
        <input
          type="text"
          id="text-input"
          className={styles.input}
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder="Type something..."
          disabled={isSubmitting}
        />
        
        <button 
          type="submit" 
          className={styles.submitButton}
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Submitting...' : 'Submit'}
        </button>
        
        {error && <div className={styles.errorMessage}>{error}</div>}
        {success && <div className={styles.successMessage}>Submitted successfully!</div>}
      </form>
      
      {/* Display the fetched data */}
      <div className={styles.results}>
        {skus.length > 0 && (
          <div>
            <h3>SKUs:</h3>
            <pre>{JSON.stringify(skus, null, 2)}</pre>
          </div>
        )}
        
        {flows.length > 0 && (
          <div>
            <h3>Flows:</h3>
            <pre>{JSON.stringify(filteredFlows, null, 2)}</pre>
          </div>
        )}
        
        {executionResult && (
          <div>
            <h3>Execution Result:</h3>
            <pre>{JSON.stringify(executionResult, null, 2)}</pre>
          </div>
        )}
      </div>
    </div>
  );
}

export default ExecutionForm;