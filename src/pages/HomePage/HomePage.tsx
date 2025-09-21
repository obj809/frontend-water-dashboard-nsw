// src/pages/HomePage/HomePage.tsx

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import SearchBar from '../../components/SearchBar/SearchBar';
import droneVideo from '../../assets/drone-footage-4.mp4';
import './HomePage.scss';

const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');

  const handleSearch = (q: string) => {
    navigate(`/dams/${encodeURIComponent(q)}`);
  };

  return (
    <div className="HomePage">
      <video
        className="home-bg-video"
        src={droneVideo}
        autoPlay
        muted
        loop
        playsInline
        preload="auto"
        aria-hidden="true"
        tabIndex={-1}
        onContextMenu={(e) => e.preventDefault()}
        onPlay={(e) => e.currentTarget.play()}
      >
        Your browser does not support the video tag.
      </video>

      <div className="home-content">
        <h1 className="homepage-title">Water Dashboard NSW</h1>
        <p className="homepage-subtitle">
          This website provides recent and historical data on dams across NSW, Australia
        </p>

        <div className="search-row">
          <SearchBar
            value={search}
            onChange={setSearch}
            onSearch={handleSearch}
            placeholder="Search for a Dam..."
            ariaLabel="Search for a Dam"
            buttonLabel="Search"
          />
        </div>
      </div>
    </div>
  );
};

export default HomePage;
