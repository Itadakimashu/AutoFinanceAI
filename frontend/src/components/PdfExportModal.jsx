import React, { useEffect, useState } from 'react';
import './PdfExportModal.css';

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const getCurrentPeriod = () => ({
  month: new Date().getMonth() + 1,
  year: new Date().getFullYear(),
});

const PdfExportModal = ({ isOpen, isExporting, onClose, onExport }) => {
  const [period, setPeriod] = useState(getCurrentPeriod);

  useEffect(() => {
    if (isOpen) setPeriod(getCurrentPeriod());
  }, [isOpen]);

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 10 }, (_, index) => currentYear - index);

  if (!isOpen) return null;

  return (
    <div className="pdf-export-modal__overlay" onClick={isExporting ? undefined : onClose}>
      <section className="pdf-export-modal" role="dialog" aria-modal="true" aria-labelledby="pdf-export-modal-title" onClick={(event) => event.stopPropagation()}>
        <div className="pdf-export-modal__header">
          <h3 id="pdf-export-modal-title">Export transactions PDF</h3>
          <button type="button" onClick={onClose} disabled={isExporting} aria-label="Close export dialog">&times;</button>
        </div>
        <form onSubmit={(event) => { event.preventDefault(); onExport(period); }}>
          <p>Select the month and year to include in your report.</p>
          <div className="pdf-export-modal__fields">
            <label>Month<select value={period.month} onChange={(event) => setPeriod((previous) => ({ ...previous, month: Number(event.target.value) }))} disabled={isExporting}>
              {MONTHS.map((month, index) => <option key={month} value={index + 1}>{month}</option>)}
            </select></label>
            <label>Year<select value={period.year} onChange={(event) => setPeriod((previous) => ({ ...previous, year: Number(event.target.value) }))} disabled={isExporting}>
              {years.map((year) => <option key={year} value={year}>{year}</option>)}
            </select></label>
          </div>
          <div className="pdf-export-modal__actions">
            <button type="button" onClick={onClose} disabled={isExporting}>Cancel</button>
            <button type="submit" disabled={isExporting}>{isExporting ? 'Exporting...' : 'Export PDF'}</button>
          </div>
        </form>
      </section>
    </div>
  );
};

export default PdfExportModal;
