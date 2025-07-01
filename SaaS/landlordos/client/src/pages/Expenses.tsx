import React from 'react';

const Expenses: React.FC = () => {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Expenses</h1>
      <div className="card">
        <p className="text-gray-500">No expenses recorded yet.</p>
      </div>
    </div>
  );
};

export default Expenses;
