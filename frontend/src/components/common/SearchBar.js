import React, { useState, useEffect, useCallback } from 'react';
import { Search } from 'lucide-react';
import './SearchBar.css';

const SearchBar = ({ onSearch, placeholder = "Search courses...", className = "" }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Debounce search to avoid too many API calls
  const debouncedSearch = useCallback(
    (term) => {
      const timer = setTimeout(() => {
        onSearch(term);
        setIsLoading(false);
      }, 500);

      return () => clearTimeout(timer);
    },
    [onSearch]
  );

  useEffect(() => {
    if (searchTerm) {
      setIsLoading(true);
      debouncedSearch(searchTerm);
    } else {
      onSearch('');
    }
  }, [searchTerm, debouncedSearch, onSearch]);

  const handleChange = (e) => {
    setSearchTerm(e.target.value);
  };

  return (
    <div className={`search-bar-container ${className}`}>
      <div className="search-bar">
        <Search size={18} className="search-icon" />
        <input
          type="text"
          placeholder={placeholder}
          value={searchTerm}
          onChange={handleChange}
          className="search-input"
        />
        {isLoading && <div className="search-spinner"></div>}
      </div>
    </div>
  );
};

export default SearchBar; 