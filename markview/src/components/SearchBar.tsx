import { useEffect, useRef, useState } from 'react';
import { Search, X, ChevronUp, ChevronDown } from 'lucide-react';
import { useAppStore } from '../stores/appStore';

export default function SearchBar() {
  const { 
    setSearchVisible, 
    searchQuery, 
    setSearchQuery,
    searchMatches,
    currentMatch,
    setCurrentMatch
  } = useAppStore();
  const inputRef = useRef<HTMLInputElement>(null);
  const [caseSensitive, setCaseSensitive] = useState(false);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleNext = () => {
    if (searchMatches > 0) {
      setCurrentMatch((currentMatch % searchMatches) + 1);
    }
  };

  const handlePrev = () => {
    if (searchMatches > 0) {
      setCurrentMatch(currentMatch === 1 ? searchMatches : currentMatch - 1);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      if (e.shiftKey) {
        handlePrev();
      } else {
        handleNext();
      }
    } else if (e.key === 'Escape') {
      setSearchVisible(false);
      setSearchQuery('');
    }
  };

  return (
    <div className="absolute top-0 right-8 z-10 bg-[var(--sidebar-bg)] border border-t-0 border-[var(--border-color)] rounded-b-md shadow-lg p-2 flex items-center space-x-2 animate-slide-down">
      <Search size={16} className="text-gray-500" />
      <input
        ref={inputRef}
        type="text"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Find in document..."
        className="bg-transparent border-none outline-none text-sm w-48 text-[var(--text-color)]"
      />
      {searchQuery && (
        <span className="text-xs text-gray-500 min-w-[40px] text-center">
          {searchMatches > 0 ? `${currentMatch}/${searchMatches}` : '0/0'}
        </span>
      )}
      <div className="flex items-center space-x-1 border-l border-[var(--border-color)] pl-2">
        <button
          onClick={() => setCaseSensitive(!caseSensitive)}
          className={`p-1 rounded text-xs font-medium ${caseSensitive ? 'bg-[var(--link-color)] text-white' : 'hover:bg-[var(--hover-bg)] text-gray-500'}`}
          title="Match Case"
        >
          Aa
        </button>
        <button onClick={handlePrev} className="p-1 hover:bg-[var(--hover-bg)] rounded text-gray-500">
          <ChevronUp size={16} />
        </button>
        <button onClick={handleNext} className="p-1 hover:bg-[var(--hover-bg)] rounded text-gray-500">
          <ChevronDown size={16} />
        </button>
        <button onClick={() => {
          setSearchVisible(false);
          setSearchQuery('');
        }} className="p-1 hover:bg-[var(--hover-bg)] rounded text-gray-500 ml-1">
          <X size={16} />
        </button>
      </div>
    </div>
  );
}
