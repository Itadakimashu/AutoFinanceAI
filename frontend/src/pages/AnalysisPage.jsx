import React, { useState, useEffect } from 'react';
import { useAuth } from '../AuthContext';
import api from '../api';
import { API_ENDPOINTS } from '../utils/constants';
import './AnalysisPage.css';

const AnalysisPage = () => {
  const { isAuthenticated } = useAuth();
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);

  const months = [
    { value: 1, label: 'January' },
    { value: 2, label: 'February' },
    { value: 3, label: 'March' },
    { value: 4, label: 'April' },
    { value: 5, label: 'May' },
    { value: 6, label: 'June' },
    { value: 7, label: 'July' },
    { value: 8, label: 'August' },
    { value: 9, label: 'September' },
    { value: 10, label: 'October' },
    { value: 11, label: 'November' },
    { value: 12, label: 'December' }
  ];

  const years = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i);

  const fetchAnalysis = async () => {
    if (!isAuthenticated) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const params = new URLSearchParams({
        year: selectedYear.toString(),
        month: selectedMonth.toString()
      });
      
      console.log('Making API request to:', `${API_ENDPOINTS.ANALYSIS}?${params}`);
      const response = await api.get(`${API_ENDPOINTS.ANALYSIS}?${params}`);
      console.log('Analysis response:', response.data);
      setAnalysis(response.data);
    } catch (err) {
      console.error('Analysis error:', err);
      console.error('Error response:', err.response);
      setError(err.response?.data?.error || err.response?.data?.suggestion || err.message || 'Failed to fetch analysis');
      setAnalysis(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Remove automatic analysis on page load
    // Analysis will only run when user clicks the Analyze button
  }, [isAuthenticated]);

  const handleAnalyzeClick = () => {
    fetchAnalysis();
  };

  if (!isAuthenticated) {
    return (
      <div className="analysis-page">
        <div className="analysis-header">
          <h1>Financial Analysis</h1>
          <p>Please log in to view your financial analysis.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="analysis-page">
      <div className="analysis-header">
        <h1>Financial Analysis</h1>
        <p>Get insights and recommendations for your spending patterns</p>
      </div>

      <div className="analysis-controls">
        <div className="date-selector">
          <div className="selector-group">
            <label>
              <span className="label-text">Year:</span>
              <select 
                value={selectedYear} 
                onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                className="styled-select"
              >
                {years.map(year => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
            </label>
          </div>
          
          <div className="selector-group">
            <label>
              <span className="label-text">Month:</span>
              <select 
                value={selectedMonth} 
                onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
                className="styled-select"
              >
                {months.map(month => (
                  <option key={month.value} value={month.value}>
                    {month.label}
                  </option>
                ))}
              </select>
            </label>
          </div>
          
          <button 
            onClick={handleAnalyzeClick} 
            className="analyze-btn"
            disabled={loading}
          >
            <span className="btn-icon">{loading ? '⏳' : '🔍'}</span>
            {loading ? 'Analyzing...' : 'Analyze'}
          </button>
        </div>
      </div>

      {loading && (
        <div className="loading-state">
          <div className="loading-content">
            <div className="spinner"></div>
            <h3>Analyzing Your Finances</h3>
            <p>Crunching numbers and generating insights...</p>
            <div className="loading-dots">
              <span></span>
              <span></span>
              <span></span>
            </div>
          </div>
        </div>
      )}

      {error && (
        <div className="error-state">
          <h3>Analysis Error</h3>
          <p>{error}</p>
          {error.includes('No transactions found') && (
            <div className="error-suggestion">
              <p>Try selecting a different month that has transaction data.</p>
            </div>
          )}
          <button onClick={fetchAnalysis} className="retry-btn">
            Try Again
          </button>
        </div>
      )}

      {analysis && !loading && (
        <div className="analysis-results">
          {/* Financial Score - First and Prominent */}
          {analysis.financial_score && (
            <div className="score-hero-section">
              <div className="score-hero-container">
                <div className="score-circle-large">
                  <div className="score-display-large">
                    <span className="score-number-large">{analysis.financial_score.score}</span>
                    <span className="score-total-large">/100</span>
                  </div>
                  <div className="score-status-large">{analysis.financial_score.status}</div>
                </div>
                <div className="score-info">
                  <h2>💚 Your Financial Health</h2>
                  <p className="score-description-large">
                    {(() => {
                      const score = analysis.financial_score.score;
                      if (score >= 80) return "Excellent! Keep it up! 🎉";
                      if (score >= 60) return "Good job! 👍";
                      if (score >= 40) return "Getting better 📈";
                      return "Time to improve 💪";
                    })()}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Overview Section */}
          {analysis.overview && (
            <div className="overview-hero">
              <h3>📊 Quick Summary</h3>
              <p className="overview-text">{analysis.overview}</p>
            </div>
          )}

          {/* Main Grid Layout */}
          <div className="analysis-grid">
            {analysis.metadata && (
              <div className="analysis-metadata grid-item">
                <div className="metadata-content">
                  <div className="metadata-header">
                    <h3>📊 Analysis Summary</h3>
                  </div>
                  <div className="metadata-stats">
                    <div className="stat-card">
                      <div className="stat-value">{analysis.metadata.current_transactions_count}</div>
                      <div className="stat-label">Transactions in {analysis.metadata.current_month}</div>
                    </div>
                    {analysis.metadata.previous_transactions_count > 0 && (
                      <div className="stat-card">
                        <div className="stat-value">{analysis.metadata.previous_transactions_count}</div>
                        <div className="stat-label">Transactions in {analysis.metadata.previous_month}</div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {analysis.quick_tips && analysis.quick_tips.length > 0 && (
              <div className="tips-section grid-item">
                <h3>💡 Quick Tips</h3>
                <div className="tips-grid">
                  {analysis.quick_tips.map((tip, index) => (
                    <div key={index} className="tip-card">
                      <span className="tip-icon">💰</span>
                      <span className="tip-text">{tip}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {analysis.warnings && analysis.warnings.length > 0 && (
              <div className="warnings-section grid-item">
                <h3>⚠️ Watch Out</h3>
                <div className="warning-list">
                  {analysis.warnings.map((warning, index) => (
                    <div key={index} className="warning-item">
                      <span className="warning-icon">⚠️</span>
                      <span className="warning-text">{warning}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {analysis.good_habits && analysis.good_habits.length > 0 && (
              <div className="positive-section grid-item">
                <h3>✅ Good Job!</h3>
                <div className="positive-list">
                  {analysis.good_habits.map((habit, index) => (
                    <div key={index} className="positive-item">
                      <span className="positive-icon">✅</span>
                      <span className="positive-text">{habit}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AnalysisPage;
