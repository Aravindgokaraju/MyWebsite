import { useState, useEffect } from 'react';
import apiService from '../../pymonitor/apiService'; // Changed from named import to default import
import styles from './FlowCrud.module.css';

const FlowCrud = ({ onBack }) => {
  const [flows, setFlows] = useState([]);
  const [formData, setFormData] = useState({
    name: '',
    url: '',
    steps: [],
    interruptions: []
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currentStep, setCurrentStep] = useState({
    xpath: '',
    actions: [],
    next: { xpath: '', actions: [] },
    start_trigger: false
  });
  const [currentInterruption, setCurrentInterruption] = useState({
    name: '',
    xpath: '',
    actions: [],
    trigger: { on: '' },
    retry: { attempts: 3, delay_ms: 1000, strategy: 'linear' }
  });

  const [jsonEditMode, setJsonEditMode] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [jsonEditorValue, setJsonEditorValue] = useState('');
  const [originalFormData, setOriginalFormData] = useState(null);

  // Available actions for dropdowns
  const availableActions = [
    'scroll_view',
    'strong_click',
    'enter_string',
    'add_next',
    'add_to_table',
    'print_text',
    'clear_stack'
  ];

  const triggerOptions = [
    'on_error',
    'on_load',
    'on_element_found'
  ];


  // Fetch flows on component mount
  useEffect(() => {
    fetchFlows();
  }, []);

  const fetchFlows = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await apiService.flow.getAllFlows();
      setFlows(response.data.data);
    } catch (err) {
      setError(err.drfMessage || 'Failed to fetch flows');
      console.error('Error fetching flows:', err);
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

  const handleStepChange = (e) => {
    const { name, value } = e.target;
    setCurrentStep(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleInterruptionChange = (e) => {
    const { name, value } = e.target;
    setCurrentInterruption(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleActionToggle = (action, type) => {
    if (type === 'step') {
      setCurrentStep(prev => ({
        ...prev,
        actions: prev.actions.includes(action)
          ? prev.actions.filter(a => a !== action)
          : [...prev.actions, action]
      }));
    } else {
      setCurrentInterruption(prev => ({
        ...prev,
        actions: prev.actions.includes(action)
          ? prev.actions.filter(a => a !== action)
          : [...prev.actions, action]
      }));
    }
  };

  const addStep = () => {
    setFormData(prev => ({
      ...prev,
      steps: [...prev.steps, currentStep]
    }));
    setCurrentStep({
      xpath: '',
      actions: [],
      next: { xpath: '', actions: [] },
      start_trigger: false
    });
  };

  const addInterruption = () => {
    setFormData(prev => ({
      ...prev,
      interruptions: [...prev.interruptions, currentInterruption]
    }));
    setCurrentInterruption({
      name: '',
      xpath: '',
      actions: [],
      trigger: { on: '' },
      retry: { attempts: 3, delay_ms: 1000, strategy: 'linear' }
    });
  };

  const removeStep = (index) => {
    setFormData(prev => ({
      ...prev,
      steps: prev.steps.filter((_, i) => i !== index)
    }));
  };

  const removeInterruption = (index) => {
    setFormData(prev => ({
      ...prev,
      interruptions: prev.interruptions.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
        // Create new flow
        const response = await apiService.flow.createConfig(formData);
        
        setFlows([...flows, response.data.data]);
      
      
      setFormData({
        name: 'Extra Bollucks',
        url: '',
        steps: [],
        interruptions: []
      });
    } catch (err) {
      setError(err.drfMessage || 'Failed to save flow');
      console.error('Error saving flow:', err);
    } finally {
      setIsLoading(false);
    }
  };

const handleEdit = (flow) => {
  // Save the current form data in case user cancels
  setOriginalFormData(formData);
  
  // Set the flow data as JSON in the editor
  setJsonEditorValue(JSON.stringify({
    name: flow.name || 'Bollocks',
    url: flow.url || '',
    steps: flow.steps?.map(step => ({
      xpath: step?.xpath || '',
      actions: step?.actions || [],
      next: {
        xpath: step?.next?.xpath || '',
        actions: step?.next?.actions || []
      },
      start_trigger: step?.start_trigger || false
    })) || [],
    interruptions: flow.interruptions?.map(interruption => ({
      name: interruption?.name || '',
      xpath: interruption?.xpath || '',
      actions: interruption?.actions || [],
      trigger: {
        on: interruption?.trigger?.on || ''
      }
    })) || []
  }, null, 2));
  console.log("Set Json Editor Value claled")
  setEditingId(flow._id);
  setJsonEditMode(true);
};

const handleJsonUpdate = async () => {
  setIsLoading(true);
  setError(null);

  try {
    const updatedFlow = JSON.parse(jsonEditorValue);
    const response = await apiService.flow.partialUpdateFlow(editingId, updatedFlow);
    
    setFlows(flows.map(flow =>
      flow._id === editingId ? updatedFlow: flow
    ));
    if(!response){
      throw new Error('lesssser ssserver error?')
    }
     if (!response || response.data["status"] !== 'success') {
      throw new Error(`Invalid SSSSEEEERRRVVVEEERRR response ${response.data["status"]}`);
    }

    setJsonEditMode(false);
    setEditingId(null);
  } catch (err) {
    setError(err.drfMessage || `Invalid JSON or failed to update flow:${editingId}`,);
    console.error('Error updating flow:', err);
  } finally {
    setIsLoading(false);
  }
};

const handleJsonCancel = () => {
  // Restore original form data
  if (originalFormData) {
    setFormData(originalFormData);
  }
  setJsonEditMode(false);
  setEditingId(null);
  setOriginalFormData(null);
};

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this flow?')) return;
    
    setIsLoading(true);
    try {
      await apiService.flow.deleteFlow(id);
      setFlows(flows.filter(flow => flow._id !== id));
    } catch (err) {
      setError(err.drfMessage || 'Failed to delete flow');
      console.error('Error deleting flow:', err);
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
          <label>Flow Name:</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            required
          />
        </div>
        
        <div className={styles.formGroup}>
          <label>Target URL:</label>
          <input
            type="url"
            name="url"
            value={formData.url}
            onChange={handleInputChange}
            required
          />
        </div>
        
        <div className={styles.section}>
          <h3>Steps Configuration</h3>
          
          <div className={styles.formGroup}>
            <label>XPath:</label>
            <input
              type="text"
              name="xpath"
              value={currentStep?.xpath||"N/A"}
              onChange={handleStepChange}
              required
            />
          </div>
          
          <div className={styles.formGroup}>
            <label>Actions:</label>
            <div className={styles.actionButtons}>
              {availableActions.map(action => (
                <button
                  key={action}
                  type="button"
                  className={`${styles.actionButton} ${currentStep.actions.includes(action) ? styles.active : ''}`}
                  onClick={() => handleActionToggle(action, 'step')}
                >
                  {action}
                </button>
              ))}
            </div>
          </div>
          
          <div className={styles.formGroup}>
            <label>
              <input
                type="checkbox"
                checked={currentStep.start_trigger}
                onChange={() => setCurrentStep(prev => ({
                  ...prev,
                  start_trigger: !prev.start_trigger
                }))}
              />
              Start Trigger
            </label>
          </div>
          
          <div className={styles.formGroup}>
            <label>Next Step XPath:</label>
            <input
              type="text"
              name="xpath"
              value={currentStep.next.xpath}
              onChange={(e) => setCurrentStep(prev => ({
                ...prev,
                next: { ...prev.next, xpath: e.target.value }
              }))}
            />
          </div>
          
          <button
            type="button"
            onClick={addStep}
            className={styles.addButton}
          >
            Add Step
          </button>
          
          {formData.steps.length > 0 && (
            <div className={styles.stepsList}>
              <h4>Current Steps:</h4>
              <ul>
                {formData.steps.map((step, index) => (
                  <li key={index}>
                    <div>
                      <strong>XPath:</strong> {step?.xpath || "N/A"}
                    </div>
                    <div>
                      <strong>Actions:</strong> {step.actions.join(', ')}
                    </div>
                    <div>
                      <strong>Next:</strong> {step.next.xpath}
                    </div>
                    <div>
                      <strong>Start Trigger:</strong> {step.start_trigger ? 'Yes' : 'No'}
                    </div>
                    <button
                      type="button"
                      onClick={() => removeStep(index)}
                      className={styles.removeButton}
                    >
                      Remove
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
        
        <div className={styles.section}>
          <h3>Interruptions Configuration</h3>
          
          <div className={styles.formGroup}>
            <label>Interruption Name:</label>
            <input
              type="text"
              name="name"
              value={currentInterruption.name}
              onChange={handleInterruptionChange}
              required
            />
          </div>
          
          <div className={styles.formGroup}>
            <label>XPath:</label>
            <input
              type="text"
              name="xpath"
              value={currentInterruption.xpath}
              onChange={handleInterruptionChange}
              required
            />
          </div>
          
          <div className={styles.formGroup}>
            <label>Actions:</label>
            <div className={styles.actionButtons}>
              {availableActions.map(action => (
                <button
                  key={action}
                  type="button"
                  className={`${styles.actionButton} ${currentInterruption.actions.includes(action) ? styles.active : ''}`}
                  onClick={() => handleActionToggle(action, 'interruption')}
                >
                  {action}
                </button>
              ))}
            </div>
          </div>
          
          <div className={styles.formGroup}>
            <label>Trigger On:</label>
            <select
              name="on"
              value={currentInterruption.trigger.on}
              onChange={(e) => setCurrentInterruption(prev => ({
                ...prev,
                trigger: { ...prev.trigger, on: e.target.value }
              }))}
            >
              <option value="">Select trigger</option>
              {triggerOptions.map(option => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
          </div>
          
          <div className={styles.formGroup}>
            <label>Retry Strategy:</label>
            <select
              name="strategy"
              value={currentInterruption.retry.strategy}
              onChange={(e) => setCurrentInterruption(prev => ({
                ...prev,
                retry: { ...prev.retry, strategy: e.target.value }
              }))}
            >
            </select>
          </div>
          
          <div className={styles.formGroup}>
            <label>Retry Attempts:</label>
            <input
              type="number"
              name="attempts"
              min="1"
              value={currentInterruption.retry.attempts}
              onChange={(e) => setCurrentInterruption(prev => ({
                ...prev,
                retry: { ...prev.retry, attempts: parseInt(e.target.value) }
              }))}
            />
          </div>
          
          <div className={styles.formGroup}>
            <label>Retry Delay (ms):</label>
            <input
              type="number"
              name="delay_ms"
              min="0"
              value={currentInterruption.retry.delay_ms}
              onChange={(e) => setCurrentInterruption(prev => ({
                ...prev,
                retry: { ...prev.retry, delay_ms: parseInt(e.target.value) }
              }))}
            />
          </div>
          
          <button
            type="button"
            onClick={addInterruption}
            className={styles.addButton}
          >
            Add Interruption
          </button>
          
          {formData.interruptions.length > 0 && (
            <div className={styles.interruptionsList}>
              <h4>Current Interruptions:</h4>
              <ul>
                {formData.interruptions.map((interruption, index) => (
                  <li key={index}>
                    <div>
                      <strong>Name:</strong> {interruption.name}
                    </div>
                    <div>
                      <strong>XPath:</strong> {interruption.xpath}
                    </div>
                    <div>
                      <strong>Actions:</strong> {interruption.actions.join(', ')}
                    </div>
                    <div>
                      <strong>Trigger:</strong> {interruption.trigger.on}
                    </div>
                    <div>
                      <strong>Retry:</strong> {interruption.retry.attempts} attempts ({interruption.retry.strategy}, {interruption.retry.delay_ms}ms)
                    </div>
                    <button
                      type="button"
                      onClick={() => removeInterruption(index)}
                      className={styles.removeButton}
                    >
                      Remove
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
        
        <button 
          type="submit" 
          className={styles.submitButton}
          disabled={isLoading}
        >
          {isLoading ? 'Processing...' : 'Create Flow'}
        </button>
      </form>
      
      <div className={styles.flowsList}>
        <h2>Saved Flows</h2>
        {isLoading && flows.length === 0 ? (
          <p>Loading flows...</p>
        ) : flows.length === 0 ? (
          <p>No flows found</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>URL</th>
                <th>Steps</th>
                <th>Interruptions</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {flows.map(flow => (
                <tr key={flow._id}>
                  <td>{flow.name}</td>
                  <td>{flow.url}</td>
                  <td>{flow.steps?.length || 0}</td>
                  <td>{flow.interruptions?.length || 0}</td>
                  <td className={styles.actions}>
                    <button 
                      onClick={() => handleEdit(flow)} 
                      className={styles.editButton}
                      disabled={isLoading}
                    >
                      Edit
                    </button>
                    <button 
                      onClick={() => handleDelete(flow._id)} 
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
      
      {jsonEditMode && (
        <div className={styles.jsonEditorModal}>
          <div className={styles.jsonEditorContent}>
            <h3>Edit Flow (JSON)</h3>
            <textarea
              className={styles.jsonEditorTextarea}
              value={jsonEditorValue}
              onChange={(e) => setJsonEditorValue(e.target.value)}
              spellCheck="false"
            />
            {error && <div className={styles.errorMessage}>{error}</div>}
            <div className={styles.jsonEditorButtons}>
              <button 
                type="button" 
                onClick={handleJsonUpdate}
                disabled={isLoading}
                className={styles.submitButton}
              >
                {isLoading ? 'Updating...' : 'Update Flow'}
              </button>
              <button 
                type="button" 
                onClick={handleJsonCancel}
                className={styles.cancelButton}
                disabled={isLoading}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FlowCrud;