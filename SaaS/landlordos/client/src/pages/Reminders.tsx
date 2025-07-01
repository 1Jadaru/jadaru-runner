import React from 'react';

const Reminders: React.FC = () => {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Reminders</h1>
      <div className="card">
        <p className="text-gray-500">No reminders set yet.</p>
      </div>
    </div>
  );
};

export default Reminders;
