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
          {analysis.metadata && (
            <div className="analysis-metadata">
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

          {analysis.Overview && (
            <div className="analysis-section overview-section">
              <h3>📊 Overview</h3>
              <p>{analysis.Overview}</p>
            </div>
          )}

          {analysis.financial_health_score && (
            <div className="analysis-section health-score">
              <h3>💚 Financial Health Score</h3>
              <div className="score-container">
                <div className="score-circle">
                  <div className="score-display">
                    <span className="score-number">
                      {(() => {
                        if (typeof analysis.financial_health_score.score === 'string') {
                          // Handle formats like "20 out of 100", "20/100", or "20"
                          const match = analysis.financial_health_score.score.match(/(\d+)/);
                          return match ? match[1] : analysis.financial_health_score.score;
                        }
                        return analysis.financial_health_score.score;
                      })()}
                    </span>
                    <span className="score-total">/100</span>
                  </div>
                  <div className="score-label">Health Score</div>
                </div>
                <div className="score-description">
                  {(() => {
                    let score;
                    if (typeof analysis.financial_health_score.score === 'string') {
                      // Handle formats like "20 out of 100", "20/100", or "20"
                      const match = analysis.financial_health_score.score.match(/(\d+)/);
                      score = match ? parseInt(match[1]) : parseInt(analysis.financial_health_score.score);
                    } else {
                      score = analysis.financial_health_score.score;
                    }
                    
                    if (score >= 80) return "Excellent financial health! 🎉";
                    if (score >= 60) return "Good financial management 👍";
                    if (score >= 40) return "Room for improvement 📈";
                    return "Focus needed on financial habits 💪";
                  })()}
                </div>
              </div>
              {analysis.financial_health_score.factors && (
                <div className="score-details">
                  <h4>Contributing Factors:</h4>
                  <ul>
                    {analysis.financial_health_score.factors.map((factor, index) => (
                      <li key={index}>{factor}</li>
                    ))}
                  </ul>
                </div>
              )}
              {analysis.financial_health_score.improvement_areas && (
                <div className="score-details">
                  <h4>Areas for Improvement:</h4>
                  <ul>
                    {analysis.financial_health_score.improvement_areas.map((area, index) => (
                      <li key={index}>{area}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {analysis.alerts_and_warnings && (
            <div className="analysis-section alerts">
              <h3>⚠️ Alerts & Warnings</h3>
              <ul>
                {analysis.alerts_and_warnings.map((alert, index) => (
                  <li key={index}>{alert}</li>
                ))}
              </ul>
            </div>
          )}

          {analysis.positive_trends && (
            <div className="analysis-section positive">
              <h3>✅ Positive Trends</h3>
              <ul>
                {analysis.positive_trends.map((trend, index) => (
                  <li key={index}>{trend}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AnalysisPage;
