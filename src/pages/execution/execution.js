import { useState, useEffect } from 'react';
import apiService from '../../pymonitor/apiService';
import styles from './ExecutionForm.module.css';

function ExecutionForm({ onBack }) {
  const [inputValue, setInputValue] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [skus, setSkus] = useState([]);
  const [flows, setFlows] = useState([]);
  const [filteredFlows, setFilteredFlows] = useState([]);
  const [executionResult, setExecutionResult] = useState(null);
  const [currentJobId, setCurrentJobId] = useState(null);
  const [pollingCount, setPollingCount] = useState(0);

  // Polling effect
  useEffect(() => {
    if (!currentJobId) return;

    const pollJobStatus = async () => {
      try {
        const response = await apiService.execution.getJob(currentJobId);
        const jobData = response.data;

        console.log('Polling job:', jobData.status, pollingCount);

        if (jobData.status === 'completed') {
          // Job completed successfully
          setExecutionResult(jobData.result);
          setSuccess(true);
          setIsSubmitting(false);
          setCurrentJobId(null); // Stop polling
        } else if (jobData.status === 'failed') {
          // Job failed
          setError(jobData.error || 'Job failed');
          setIsSubmitting(false);
          setCurrentJobId(null); // Stop polling
        } else if (jobData.status === 'queued' || jobData.status === 'started') {
          // Job still processing, poll again after delay
          if (pollingCount < 30) { // Max 60 polls (≈2 minutes)
            setTimeout(() => {
              setPollingCount(prev => prev + 1);
            }, 10000); // Poll every 2 seconds
          } else {
            // Timeout after 2 minutes
            setError('Job timeout - taking too long to complete');
            setIsSubmitting(false);
            setCurrentJobId(null);
          }
        }
      } catch (error) {
        console.error('Polling error:', error);
        if (pollingCount < 10) { // Retry on transient errors
          setTimeout(() => {
            setPollingCount(prev => prev + 1);
          }, 2000);
        } else {
          setError('Failed to check job status');
          setIsSubmitting(false);
          setCurrentJobId(null);
        }
      }
    };

    pollJobStatus();
  }, [currentJobId, pollingCount]);

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
    setCurrentJobId(null);
    setPollingCount(0);

    try {
      // Execute all requests in parallel
      const [skusResponse, flowsResponse] = await Promise.all([
        apiService.sku.getAll(),
        apiService.flow.getAllFlows()
      ]);
      
      setSkus(skusResponse.data);
      const fetchedFlows = flowsResponse.data.data || [];
      setFlows(fetchedFlows);

      // Then execute scraping
      const flowsToExecute = inputValue.trim() 
        ? fetchedFlows.filter(flow => 
            flow.name.toLowerCase().includes(inputValue.toLowerCase())
          )
        : fetchedFlows;

      if (flowsToExecute.length > 0) {
        const executionResponse = await apiService.execution.executeScraping({
          skus: skusResponse.data,
          flows: flowsToExecute
        });
        
        // Start polling for this job
        setCurrentJobId(executionResponse.data.job_id);
        
      } else {
        throw new Error('No flows available to execute');
      }

    } catch (error) {
      console.error('API Error:', error);
      setError(error.drfMessage || error.message || 'Failed to complete operations');
      setIsSubmitting(false);
    }
  };

return (
    <div className={styles.container}>
      <h1>Automated Scraping Execution</h1>
      
      <div className={styles.description}>
        <p>
          <strong>Local Execution Mode:</strong> For resource efficiency, the scraping execution 
          needs to connect directly to your local machine to run the mock chrome driver. This saves cloud resources and ensures 
          optimal performance for data-intensive operations. I have a docker container on my local machine that runs the worker 
          container which sends the data to the services on the cloud. Execution will not work unless the Dockerfile.chromedriver is up and running
        
        </p>
        <p>
          The scraping works by taking the irregular website template objects from atlas, and plugging in the skus from sql to these templates.
          A template is a one time setup where you outline the path a user would take to get to a sku so that the code can repeat the steps for all skus.
        
        </p>
        <p>
          Click "Execute Scraping" to run the process using your local computing power.
        </p>
        
      </div>

      <form className={styles.form} onSubmit={handleSubmit}>
        <button 
          onClick={onBack} 
          className={styles.backButton}
        >
          Back to Home
        </button>
        
        <button 
          type="submit" 
          className={styles.submitButton}
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Executing...' : 'Execute Scraping'}
        </button>
        
        {/* Polling Status Indicator */}
        {isSubmitting && currentJobId && (
          <div className={styles.pollingStatus}>
            <div className={styles.loadingSpinner}></div>
            <p>
              {pollingCount === 0 ? 'Connecting to local worker...' : `Processing locally... (${pollingCount})`}
            </p>
          </div>
        )}
        
        {error && <div className={styles.errorMessage}>{error}</div>}
        {success && <div className={styles.successMessage}>Execution completed successfully!</div>}
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