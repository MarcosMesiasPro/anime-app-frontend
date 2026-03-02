import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search } from 'lucide-react';

const SearchBar = () => {
  const [query, setQuery] = useState('');
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (query.trim().length > 0) {
      navigate(`/search?q=${encodeURIComponent(query.trim())}`);
      setQuery(''); // Limpiar el input después de buscar
    }
  };

  return (
    <form onSubmit={handleSubmit} className="relative w-full max-w-sm ml-4">
      <div className="relative flex items-center">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
          <Search size={16} />
        </div>
        <input
          type="text"
          className="block w-full pl-10 pr-3 py-1.5 border border-gray-700 rounded-full leading-5 bg-gray-800 text-gray-300 placeholder-gray-500 focus:outline-none focus:bg-gray-900 focus:border-primary focus:ring-1 focus:ring-primary sm:text-sm transition-colors"
          placeholder="Buscar anime y presiona Enter..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <button type="submit" className="hidden">Buscar</button>
      </div>
    </form>
  );
};

export default SearchBar;