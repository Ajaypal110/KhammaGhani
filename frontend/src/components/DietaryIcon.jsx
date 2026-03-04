import React from 'react';

const DietaryIcon = ({ isVeg, size = 16 }) => {
  // Handle both boolean and string "true"/"false" from old data
  // Default to true (Veg) if undefined
  const isVegNormalized = isVeg === undefined || isVeg === true || isVeg === "true";
  const color = isVegNormalized ? "#00b200" : "#d32f2f";
  
  return (
    <div style={{
      width: size,
      height: size,
      border: `2px solid ${color}`,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: size * 0.1,
      borderRadius: '2px',
      flexShrink: 0
    }} title={isVegNormalized ? "Vegetarian" : "Non-Vegetarian"}>
      <div style={{
        width: size * 0.6,
        height: size * 0.6,
        backgroundColor: color,
        borderRadius: '50%'
      }} />
    </div>
  );
};

export default DietaryIcon;
