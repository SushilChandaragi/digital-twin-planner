import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import './App.css'; // Import app-wide styles
import LoginPage from './components/LoginPage.jsx';
import Dashboard from './components/Dashboard.jsx';
import PlanPage from './components/PlanPage_old.jsx';
import SavedPlans from './components/SavedPlans.jsx';
import Analytics from './components/Analytics.jsx';

function App() {
  return (
    <div className="app">
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LoginPage />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/plan" element={<PlanPage />} />
          <Route path="/saved-plans" element={<SavedPlans />} />
          <Route path="/analytics" element={<Analytics />} />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
