import React from 'react';

const TotalsSummary = ({ totals, loading }) => {
  if (loading) {
    return (
      <div className="totals-summary">
        <div className="totals-grid">
          <div className="total-card">
            <div className="total-label">Total Income</div>
            <div className="total-value loading">Loading...</div>
          </div>
          <div className="total-card">
            <div className="total-label">Total Expenses</div>
            <div className="total-value loading">Loading...</div>
          </div>
          <div className="total-card">
            <div className="total-label">Net Amount</div>
            <div className="total-value loading">Loading...</div>
          </div>
        </div>
      </div>
    );
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-BD', {
      style: 'currency',
      currency: 'BDT',
      minimumFractionDigits: 2,
    }).format(amount);
  };

  return (
    <div className="totals-summary">
      <div className="totals-grid">
        <div className="total-card income">
          <div className="total-label">Total Income</div>
          <div className="total-value positive">
            {formatCurrency(totals.total_income)}
          </div>
        </div>
        <div className="total-card expenses">
          <div className="total-label">Total Expenses</div>
          <div className="total-value negative">
            {formatCurrency(totals.total_expenses)}
          </div>
        </div>
        <div className="total-card net">
          <div className="total-label">Net Amount</div>
          <div className={`total-value ${totals.net_amount >= 0 ? 'positive' : 'negative'}`}>
            {formatCurrency(totals.net_amount)}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TotalsSummary;
