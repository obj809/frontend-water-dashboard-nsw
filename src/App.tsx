// src/App.tsx

import React, { useEffect, useRef } from 'react';
import { Provider } from 'react-redux';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { store } from './app/store';

import HomePage from './pages/HomePage/HomePage';
import DashboardPage from './pages/DashboardPage/DashboardPage';
import AboutPage from './pages/AboutPage/AboutPage';
import DamDetailPage from './pages/DamDetailPage/DamDetailPage';
import TestVideoPage from './components/TestVideoPage/TestVideoPage';

import DamStorageOverview from './graphs/DamStorageOverview/DamStorageOverview';
import DamBarChart from './graphs/DamBarChart/DamBarChart';

import Graph1 from './graphs/Graph1/Graph1';
import Graph2 from './graphs/Graph2/Graph2';
import Graph3 from './graphs/Graph3/Graph3';
import Graph4 from './graphs/Graph4/Graph4';

import DamGraphPage from './pages/DamGraphPage/DamGraphPage';

import './App.scss';

const StackedPages: React.FC = () => {
  const location = useLocation();

  const homeRef = useRef<HTMLDivElement>(null);
  const dashboardRef = useRef<HTMLDivElement>(null);
  const aboutRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const path = location.pathname;

    let target: HTMLElement | null = null;
    if (path.startsWith('/dashboard')) target = dashboardRef.current;
    else if (path.startsWith('/about')) target = aboutRef.current;
    else target = homeRef.current;

    target?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, [location.pathname]);

  return (
    <>
      <div ref={homeRef} id="home-section">
        <HomePage />
      </div>
      <div ref={dashboardRef} id="dashboard-section">
        <DashboardPage />
      </div>
      <div ref={aboutRef} id="about-section">
        <AboutPage />
      </div>
    </>
  );
};

const App: React.FC = () => {
  return (
    <Provider store={store}>
      <div className="App">
        <Router>
          <Routes>
            <Route path="/" element={<StackedPages />} />
            <Route path="/home" element={<StackedPages />} />
            <Route path="/dashboard" element={<StackedPages />} />
            <Route path="/about" element={<StackedPages />} />

            <Route path="/graphs/storage" element={<DamStorageOverview />} />
            <Route path="/graphs/release" element={<DamBarChart />} />
            <Route path="/graphs/graph1/:damId" element={<Graph1 fullScreen />} />
            <Route path="/graphs/graph2/:damId" element={<Graph2 fullScreen />} />
            <Route path="/graphs/graph3/:damId" element={<Graph3 fullScreen />} />
            <Route path="/graphs/graph4/:damId" element={<Graph4 fullScreen />} />

            <Route path="/dams/:damId" element={<DamDetailPage />} />
            <Route path="/dams/:damId/graph/:graphId" element={<DamGraphPage />} />

            <Route path="/test-video" element={<TestVideoPage />} />
          </Routes>
        </Router>
      </div>
    </Provider>
  );
};

export default App;
