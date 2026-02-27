import React from 'react';

const renderIcon = ({ icon, alt = '' }) => {
  if (!icon) return null;
  if (typeof icon === 'string') {
    return <img src={icon} alt={alt} />;
  }
  if (typeof icon === 'function' || (typeof icon === 'object' && icon.$$typeof)) {
    return React.createElement(icon, { size: 16, strokeWidth: 1.75 });
  }
  return null;
};

export default renderIcon;
