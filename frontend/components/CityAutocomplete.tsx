'use client';

import { useState, useRef, useEffect } from 'react';
import { City, searchCities, getCityDisplayName } from '@/lib/cities';

interface CityAutocompleteProps {
  id?: string;
  placeholder?: string;
  value: City | null;
  onChange: (city: City | null) => void;
  disabled?: boolean;
}

export function CityAutocomplete({ 
  id, 
  placeholder = "Search cities...", 
  value, 
  onChange, 
  disabled = false 
}: CityAutocompleteProps) {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [suggestions, setSuggestions] = useState<City[]>([]);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

  // Update query when value changes
  useEffect(() => {
    if (value) {
      setQuery(getCityDisplayName(value));
    } else {
      setQuery('');
    }
  }, [value]);

  // Search cities when query changes
  useEffect(() => {
    if (query.length >= 2) {
      const results = searchCities(query);
      setSuggestions(results);
      setHighlightedIndex(-1);
    } else {
      setSuggestions([]);
      setHighlightedIndex(-1);
    }
  }, [query]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newQuery = e.target.value;
    setQuery(newQuery);
    setIsOpen(true);
    
    // Clear selection if query doesn't match current value
    if (value && !getCityDisplayName(value).toLowerCase().includes(newQuery.toLowerCase())) {
      onChange(null);
    }
  };

  const handleInputFocus = () => {
    setIsOpen(true);
    if (query.length >= 2) {
      const results = searchCities(query);
      setSuggestions(results);
    }
  };

  const handleInputBlur = () => {
    // Delay closing to allow clicks on suggestions
    setTimeout(() => {
      setIsOpen(false);
    }, 150);
  };

  const handleSuggestionClick = (city: City) => {
    onChange(city);
    setQuery(getCityDisplayName(city));
    setIsOpen(false);
    inputRef.current?.blur();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen || suggestions.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setHighlightedIndex(prev => 
          prev < suggestions.length - 1 ? prev + 1 : 0
        );
        break;
      
      case 'ArrowUp':
        e.preventDefault();
        setHighlightedIndex(prev => 
          prev > 0 ? prev - 1 : suggestions.length - 1
        );
        break;
      
      case 'Enter':
        e.preventDefault();
        if (highlightedIndex >= 0) {
          handleSuggestionClick(suggestions[highlightedIndex]);
        }
        break;
      
      case 'Escape':
        setIsOpen(false);
        inputRef.current?.blur();
        break;
    }
  };

  // Scroll highlighted item into view
  useEffect(() => {
    if (highlightedIndex >= 0 && listRef.current) {
      const highlightedElement = listRef.current.children[highlightedIndex] as HTMLElement;
      if (highlightedElement) {
        highlightedElement.scrollIntoView({
          block: 'nearest',
          behavior: 'smooth'
        });
      }
    }
  }, [highlightedIndex]);

  return (
    <div className="relative">
      <input
        ref={inputRef}
        id={id}
        type="text"
        value={query}
        onChange={handleInputChange}
        onFocus={handleInputFocus}
        onBlur={handleInputBlur}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        disabled={disabled}
        autoComplete="off"
        className={`w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent disabled:bg-gray-50 dark:disabled:bg-gray-700 disabled:text-gray-500 dark:disabled:text-gray-400 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 transition-colors duration-200 ${
          value ? 'text-gray-900 dark:text-white' : 'text-gray-500 dark:text-gray-400'
        }`}
      />
      
      {/* Search Icon */}
      <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
        <svg className="w-4 h-4 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      </div>

      {/* Suggestions Dropdown */}
      {isOpen && suggestions.length > 0 && (
        <div className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg shadow-lg dark:shadow-2xl max-h-60 overflow-auto">
          <ul ref={listRef} className="py-1">
            {suggestions.map((city, index) => (
              <li key={`${city.name}-${city.iata}`}>
                <button
                  type="button"
                  onClick={() => handleSuggestionClick(city)}
                  className={`w-full text-left px-3 py-2 hover:bg-blue-50 dark:hover:bg-blue-900/20 focus:bg-blue-50 dark:focus:bg-blue-900/20 focus:outline-none transition-colors duration-150 ${
                    index === highlightedIndex ? 'bg-blue-50 dark:bg-blue-900/20' : ''
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium text-gray-900 dark:text-gray-100">
                        {city.name}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        {city.iata} • {city.tz}
                      </div>
                    </div>
                    <div className="text-xs text-gray-400 dark:text-gray-500">
                      {city.lat.toFixed(1)}°, {city.lon.toFixed(1)}°
                    </div>
                  </div>
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* No Results */}
      {isOpen && query.length >= 2 && suggestions.length === 0 && (
        <div className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg shadow-lg dark:shadow-2xl">
          <div className="px-3 py-2 text-sm text-gray-500 dark:text-gray-400">
            No cities found for "{query}"
          </div>
        </div>
      )}
    </div>
  );
}
