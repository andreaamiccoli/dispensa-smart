import React from 'react';

export default function CategoryBadge({ categoryName, colorTag = '#6b7280' }) {
  if (!categoryName) return null;

  return (
    <span
      className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium text-white shadow-xs"
      style={{ backgroundColor: colorTag }}
    >
      {categoryName}
    </span>
  );
}
