import React from 'react';
import PageLayout from '../components/layout/PageLayout';
import '../Home.css';

const HomePage = () => {
  return (
    <PageLayout className="home-container">
      <h1 className="home-title">
        Welcome to <span>AutoFinanceAI</span>
      </h1>
      <p className="home-subtitle">Smarter Budgets, Better Habits.</p>
    </PageLayout>
  );
};

export default HomePage;
