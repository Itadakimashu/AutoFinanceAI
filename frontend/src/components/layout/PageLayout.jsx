import React from 'react';

const PageLayout = ({ children, className = '', style = {} }) => {
  return (
    <div className={`page-layout ${className}`} style={style}>
      {children}
    </div>
  );
};

export default PageLayout;
