'use client';

import { useState, useEffect } from 'react';
import { FiRefreshCw, FiExternalLink } from 'react-icons/fi';
import Link from 'next/link';

// List of all dashboard endpoints
const DASHBOARD_ENDPOINTS = [
  { name: 'Carb Counting', endpoint: 'carb' },
  { name: 'Screening', endpoint: 'screening' },
  { name: 'Training', endpoint: 'training' },
  { name: 'Recovery', endpoint: 'recovery' },
  { name: 'Weight Loss', endpoint: 'weight' },
  { name: 'Medication', endpoint: 'medication' },
];

interface EndpointTestProps {
  name: string;
  endpoint: string;
}

const EndpointTest = ({ name, endpoint }: EndpointTestProps) => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const apiUrl = `/api/dashboard/${endpoint}`;

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(apiUrl);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const result = await response.json();
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      console.error(`Error fetching ${name}:`, err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [endpoint]);

  return (
    <div className="p-4 border rounded-lg shadow-sm mb-4">
      <div className="flex justify-between items-center mb-2">
        <div className="flex items-center space-x-2">
          <h3 className="text-lg font-medium">{name}</h3>
          <a 
            href={apiUrl} 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-blue-500 hover:text-blue-700"
            title="Open in new tab"
          >
            <FiExternalLink className="w-4 h-4" />
          </a>
        </div>
        <button
          onClick={fetchData}
          disabled={loading}
          className="p-2 rounded-full hover:bg-gray-100 disabled:opacity-50"
          title="Refresh data"
        >
          <FiRefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>
      
      {loading && <div className="text-gray-500">Loading...</div>}
      
      {error && (
        <div className="text-red-500 p-2 bg-red-50 rounded">
          Error: {error}
        </div>
      )}
      
      {!loading && !error && data && (
        <div className="mt-2">
          <div className="text-sm text-gray-500 mb-2">
            Status: <span className="text-green-600">Success</span>
          </div>
          <pre className="bg-gray-50 p-3 rounded text-xs overflow-x-auto">
            {JSON.stringify(data, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
};

export default function TestDashboardPage() {
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Dashboard API Test</h1>
      
      <div className="mb-8 p-4 bg-blue-50 rounded-lg">
        <h2 className="text-xl font-semibold mb-3">Direct API Links</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {DASHBOARD_ENDPOINTS.map(({ name, endpoint }) => (
            <Link 
              key={endpoint} 
              href={`/api/dashboard/${endpoint}`}
              target="_blank"
              className="p-3 border rounded-md hover:bg-white transition-colors flex items-center justify-between"
            >
              <span>{name}</span>
              <FiExternalLink className="w-4 h-4 text-gray-500" />
            </Link>
          ))}
        </div>
      </div>
      
      <div className="space-y-4 mt-8">
        <h2 className="text-xl font-semibold mb-3">API Test Components</h2>
        {DASHBOARD_ENDPOINTS.map(({ name, endpoint }) => (
          <EndpointTest key={endpoint} name={name} endpoint={endpoint} />
        ))}
      </div>
    </div>
  );
}
