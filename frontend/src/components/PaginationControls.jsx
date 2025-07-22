import React from 'react';

const PaginationControls = ({ 
  currentPage, 
  totalPages, 
  handlePageChange 
}) => {
  if (totalPages <= 1) {
    return null;
  }

  return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      marginTop: '20px',
      padding: '15px',
      backgroundColor: '#2a254a',
      borderRadius: '8px',
      border: '1px solid #475569'
    }}>
      <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
        <button
          onClick={() => handlePageChange(1)}
          disabled={currentPage === 1}
          style={{
            padding: '6px 12px',
            border: '1px solid #475569',
            borderRadius: '4px',
            backgroundColor: currentPage === 1 ? '#1e293b' : '#334155',
            color: currentPage === 1 ? '#64748b' : '#d8b4fe',
            cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
            fontSize: '12px'
          }}
        >
          First
        </button>
        
        <button
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1}
          style={{
            padding: '6px 12px',
            border: '1px solid #475569',
            borderRadius: '4px',
            backgroundColor: currentPage === 1 ? '#1e293b' : '#334155',
            color: currentPage === 1 ? '#64748b' : '#d8b4fe',
            cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
            fontSize: '12px'
          }}
        >
          Previous
        </button>

        {/* Page numbers */}
        {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
          let pageNum;
          if (totalPages <= 5) {
            pageNum = i + 1;
          } else if (currentPage <= 3) {
            pageNum = i + 1;
          } else if (currentPage >= totalPages - 2) {
            pageNum = totalPages - 4 + i;
          } else {
            pageNum = currentPage - 2 + i;
          }
          
          return (
            <button
              key={pageNum}
              onClick={() => handlePageChange(pageNum)}
              style={{
                padding: '6px 12px',
                border: currentPage === pageNum ? '2px solid #a78bfa' : '1px solid #475569',
                borderRadius: '4px',
                backgroundColor: currentPage === pageNum ? '#322e50' : '#334155',
                color: currentPage === pageNum ? '#d8b4fe' : 'white',
                cursor: 'pointer',
                fontSize: '12px',
                fontWeight: currentPage === pageNum ? 'bold' : 'normal'
              }}
            >
              {pageNum}
            </button>
          );
        })}

        <button
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          style={{
            padding: '6px 12px',
            border: '1px solid #475569',
            borderRadius: '4px',
            backgroundColor: currentPage === totalPages ? '#1e293b' : '#334155',
            color: currentPage === totalPages ? '#64748b' : '#d8b4fe',
            cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
            fontSize: '12px'
          }}
        >
          Next
        </button>
        
        <button
          onClick={() => handlePageChange(totalPages)}
          disabled={currentPage === totalPages}
          style={{
            padding: '6px 12px',
            border: '1px solid #475569',
            borderRadius: '4px',
            backgroundColor: currentPage === totalPages ? '#1e293b' : '#334155',
            color: currentPage === totalPages ? '#64748b' : '#d8b4fe',
            cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
            fontSize: '12px'
          }}
        >
          Last
        </button>
      </div>
    </div>
  );
};

export default PaginationControls;
