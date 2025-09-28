import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import SearchBar from '../components/SearchBar';

export default function Home() {
  const [q, setQ] = useState('');
  const navigate = useNavigate();

  const doSearch = () => {
    if (q.trim()) {
      navigate(`/search/${encodeURIComponent(q.trim())}`);
    }
  };

  return (
    <div>
      <h1>Movie Search (RapidAPI)</h1>
      <SearchBar
        value={q}
        onChange={(e) => setQ(e.target.value)}
        onSearch={doSearch}
      />
    </div>
  );
}
