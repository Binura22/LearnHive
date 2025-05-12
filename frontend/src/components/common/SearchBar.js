import React, { useState, useEffect } from 'react';
import { Search } from 'lucide-react';
import './SearchBar.css';

const SearchBar = ({ onSearch, placeholder = "Search courses...", className = "" }) => {
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      onSearch(searchTerm);
    }, 300);

    return () => clearTimeout(delayDebounce);
  }, [searchTerm, onSearch]);

  return (
    <div className={`search-bar-container ${className}`}>
      <div className="search-bar">
        <Search size={18} className="search-icon" />
        <input type="text" placeholder={placeholder} value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="search-input" />
      </div>
    </div>
  );
};

export default SearchBar;
