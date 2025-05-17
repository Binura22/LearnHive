import React, { useState } from 'react';
import axios from 'axios';
import { generateLearningPlanFromAI } from '../../services/api';

const AIGoalGenerator = () => {
  const [goal, setGoal] = useState('');
  const [plan, setPlan] = useState('');
  const [loading, setLoading] = useState(false);

  const handleGenerate = async () => {
  if (!goal.trim()) {
    alert('Please enter a learning goal.');
    return;
  }

  setLoading(true);
  try {
    const response = await generateLearningPlanFromAI(goal);
    setPlan(response.data.plan);
  } catch (error) {
    console.error('Error generating plan', error);
    alert('Failed to generate plan.');
  } finally {
    setLoading(false);
  }
};


  return (
    <div style={{ maxWidth: '600px', margin: '0 auto', padding: '1rem' }}>
      <h2>AI Goal Generator</h2>
      <input 
        type="text" 
        placeholder="Enter your learning goal..." 
        value={goal} 
        onChange={e => setGoal(e.target.value)} 
        style={{ width: '100%', padding: '0.5rem', marginBottom: '1rem' }}
      />
      <button onClick={handleGenerate} disabled={loading}>
        {loading ? 'Generating...' : 'Generate Plan'}
      </button>
      {plan && (
        <pre style={{ whiteSpace: 'pre-wrap', marginTop: '1rem', background: '#f6f6f6', padding: '1rem' }}>
          {plan}
        </pre>
      )}
    </div>
  );
};

export default AIGoalGenerator;
