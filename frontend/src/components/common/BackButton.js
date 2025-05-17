import React from 'react';
import { useNavigate } from 'react-router-dom';
import './BackButton.css';

const BackButton = ({ to = '/admin/dashboard', text = 'Back to Dashboard' }) => {
  const navigate = useNavigate();

  return (
    <button className="back-button" onClick={() => navigate(to)} aria-label={text}>
      {text}
    </button>
  );
};

export default BackButton;
