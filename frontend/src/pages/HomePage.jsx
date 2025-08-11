import React, { useState, useEffect } from 'react';
import { useAuth } from '../AuthContext';
import { navigateTo } from '../utils/helpers';
import { transactionsAPI } from '../api';
import PageLayout from '../components/layout/PageLayout';
import '../Home.css';

const HomePage = () => {
  const { isAuthenticated } = useAuth();
  const [dashboardData, setDashboardData] = useState({
    totalIncome: 0,
    totalExpenses: 0,
    loading: true
  });

  // Fetch dashboard data when component mounts and user is authenticated
  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!isAuthenticated) {
        setDashboardData({
          totalIncome: 0,
          totalExpenses: 0,
          loading: false
        });
        return;
      }

      try {
        setDashboardData(prev => ({ ...prev, loading: true }));
        
        // Fetch transactions with a reasonable limit for dashboard overview
        const response = await transactionsAPI.getTransactions({ 
          page_size: 1000 // Get enough data for accurate totals
        });
        
        if (response.totals) {
          setDashboardData({
            totalIncome: response.totals.total_income || 0,
            totalExpenses: response.totals.total_expenses || 0,
            loading: false
          });
        } else {
          // Fallback if totals aren't provided
          setDashboardData({
            totalIncome: 0,
            totalExpenses: 0,
            loading: false
          });
        }
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        setDashboardData({
          totalIncome: 0,
          totalExpenses: 0,
          loading: false
        });
      }
    };

    fetchDashboardData();
  }, [isAuthenticated]);

  const features = [
    {
      icon: '🤖',
      title: 'AI-Powered Analysis',
      description: 'Get intelligent insights into your spending patterns with advanced AI analysis and personalized recommendations.'
    },
    {
      icon: '📊',
      title: 'Smart Budgeting',
      description: 'Track your income and expenses effortlessly with intuitive categorization and visual analytics.'
    },
    {
      icon: '📱',
      title: 'Receipt Scanning',
      description: 'Simply upload photos of your receipts and let AI extract transaction details automatically.'
    },
    {
      icon: '📈',
      title: 'Financial Insights',
      description: 'Discover spending trends, budget optimization tips, and achieve your financial goals faster.'
    },
    {
      icon: '🔒',
      title: 'Secure & Private',
      description: 'Your financial data is protected with enterprise-grade security and privacy measures.'
    },
    {
      icon: '📄',
      title: 'Monthly Reports',
      description: 'Generate detailed PDF reports of your transactions and financial summaries with just one click.'
    }
  ];

  return (
    <PageLayout className="home-container">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-content">
          <div className="hero-text">
            <h1 className="hero-title">
              Welcome to <span className="brand-gradient">AutoFinanceAI</span>
            </h1>
            <p className="hero-subtitle">Smarter Budgets, Better Habits.</p>
            <p className="hero-description">
              Transform your financial management with AI-powered insights. Track expenses, 
              analyze spending patterns, and make smarter financial decisions with ease.
            </p>
            
            <div className="hero-buttons">
              {!isAuthenticated ? (
                <>
                  <button 
                    className="btn-primary-large"
                    onClick={() => navigateTo('#signup')}
                  >
                    Get Started Free
                  </button>
                  <button 
                    className="btn-secondary-large"
                    onClick={() => navigateTo('#login')}
                  >
                    Sign In
                  </button>
                </>
              ) : (
                <>
                  <button 
                    className="btn-primary-large"
                    onClick={() => navigateTo('#transactions')}
                  >
                    View Transactions
                  </button>
                  <button 
                    className="btn-secondary-large"
                    onClick={() => navigateTo('#add-transactions')}
                  >
                    Add Transaction
                  </button>
                </>
              )}
            </div>
          </div>
          
          <div className="hero-visual">
            <div className="dashboard-preview">
              <div className="preview-header">
                <div className="preview-dots">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
                <div className="preview-title">AutoFinanceAI Dashboard</div>
              </div>
              <div className="preview-content">
                <div className="preview-chart">
                  <div className="chart-bars">
                    {dashboardData.loading ? (
                      // Loading state - animated bars
                      <>
                        <div className="bar" style={{height: '40%', opacity: 0.5}}></div>
                        <div className="bar" style={{height: '60%', opacity: 0.5}}></div>
                        <div className="bar" style={{height: '30%', opacity: 0.5}}></div>
                        <div className="bar" style={{height: '50%', opacity: 0.5}}></div>
                        <div className="bar" style={{height: '45%', opacity: 0.5}}></div>
                      </>
                    ) : (
                      // Dynamic bars based on actual data
                      (() => {
                        const maxAmount = Math.max(dashboardData.totalIncome, dashboardData.totalExpenses);
                        const incomeHeight = maxAmount > 0 ? (dashboardData.totalIncome / maxAmount) * 80 : 20;
                        const expenseHeight = maxAmount > 0 ? (dashboardData.totalExpenses / maxAmount) * 80 : 20;
                        
                        return (
                          <>
                            <div className="bar" style={{height: `${Math.max(incomeHeight * 0.7, 20)}%`}}></div>
                            <div className="bar" style={{height: `${Math.max(incomeHeight, 20)}%`}}></div>
                            <div className="bar" style={{height: `${Math.max(expenseHeight * 0.8, 20)}%`}}></div>
                            <div className="bar" style={{height: `${Math.max(expenseHeight, 20)}%`}}></div>
                            <div className="bar" style={{height: `${Math.max((incomeHeight + expenseHeight) / 2, 20)}%`}}></div>
                          </>
                        );
                      })()
                    )}
                  </div>
                </div>
                <div className="preview-stats">
                  <div className="stat">
                    <div className="stat-value">
                      {dashboardData.loading ? (
                        <span style={{ color: '#a78bfa', fontSize: '14px' }}>Loading...</span>
                      ) : (
                        `৳${dashboardData.totalIncome.toLocaleString('en-BD', { 
                          minimumFractionDigits: 0, 
                          maximumFractionDigits: 0 
                        })}`
                      )}
                    </div>
                    <div className="stat-label">Total Income</div>
                  </div>
                  <div className="stat">
                    <div className="stat-value">
                      {dashboardData.loading ? (
                        <span style={{ color: '#a78bfa', fontSize: '14px' }}>Loading...</span>
                      ) : (
                        `৳${dashboardData.totalExpenses.toLocaleString('en-BD', { 
                          minimumFractionDigits: 0, 
                          maximumFractionDigits: 0 
                        })}`
                      )}
                    </div>
                    <div className="stat-label">Total Expenses</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features-section">
        <div className="container">
          <div className="section-header">
            <h2>Powerful Features for Smart Finance Management</h2>
            <p>Everything you need to take control of your finances and build better habits</p>
          </div>
          
          <div className="features-grid">
            {features.map((feature, index) => (
              <div key={index} className="feature-card">
                <div className="feature-icon">{feature.icon}</div>
                <h3 className="feature-title">{feature.title}</h3>
                <p className="feature-description">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="stats-section">
        <div className="container">
          <div className="stats-grid">
            <div className="stat-item">
              <div className="stat-number">500+</div>
              <div className="stat-text">Transactions Analyzed</div>
            </div>
            <div className="stat-item">
              <div className="stat-number">98%</div>
              <div className="stat-text">Accuracy Rate</div>
            </div>
            <div className="stat-item">
              <div className="stat-number">24/7</div>
              <div className="stat-text">AI Monitoring</div>
            </div>
            <div className="stat-item">
              <div className="stat-number">100%</div>
              <div className="stat-text">Secure & Private</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <div className="container">
          <div className="cta-content">
            <h2>Ready to Transform Your Financial Life?</h2>
            <p>Join thousands of users who are already making smarter financial decisions with AutoFinanceAI</p>
            
            {!isAuthenticated && (
              <button 
                className="btn-primary-large"
                onClick={() => navigateTo('#signup')}
              >
                Start Your Journey Today
              </button>
            )}
          </div>
        </div>
      </section>
    </PageLayout>
  );
};

export default HomePage;
