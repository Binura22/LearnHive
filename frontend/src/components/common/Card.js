import React from 'react';
import './Card.css';

const Card = ({
  children,
  className = '',
  variant = 'default',
  padding = 'medium',
  ...props
}) => {
  const baseClass = 'card';
  const variantClass = `card-${variant}`;
  const paddingClass = `card-padding-${padding}`;

  return (
    <div
      className={`${baseClass} ${variantClass} ${paddingClass} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

export default Card; 