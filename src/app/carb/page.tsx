"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface GroupedCarbRecord {
  amp_code: string;
  amp_name: string;
  person_target: number;
  person_carb: number;
  percentage: number;
}

export default function CarbPage() {
  const [data, setData] = useState<GroupedCarbRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sortConfig, setSortConfig] = useState({
    key: 'percentage' as keyof GroupedCarbRecord,
    direction: 'desc' as 'asc' | 'desc'
  });
  const [lastUpdated, setLastUpdated] = useState<string>('');

  const handleSort = (key: keyof GroupedCarbRecord) => {
    if (key === sortConfig.key) {
      setSortConfig({
        key,
        direction: sortConfig.direction === 'asc' ? 'desc' : 'asc'
      });
    } else {
      setSortConfig({
        key,
        direction: 'desc'
      });
    }
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/carb/amp', {
        cache: 'no-store',
        next: { revalidate: 0 }
      });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage = errorData?.details || errorData?.error || 'Failed to fetch carb data';
        throw new Error(errorMessage);
      }
      const result: GroupedCarbRecord[] = await response.json();
      // Ensure percentage is a number
      const processedResult = result.map(item => ({
        ...item,
        percentage: Number(item.percentage) // Explicitly cast to Number
      }));
      // Sort data initially when fetched
      const initialSortedData = [...processedResult].sort((a, b) => {
        const aValue = a[sortConfig.key];
        const bValue = b[sortConfig.key];
        if (typeof aValue === 'string' && typeof bValue === 'string') {
          return sortConfig.direction === 'asc' ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue);
        }
        if (typeof aValue === 'number' && typeof bValue === 'number') {
          return sortConfig.direction === 'asc' ? aValue - bValue : bValue - aValue;
        }
        return 0;
      });
      setData(initialSortedData);
      setLastUpdated(new Date().toLocaleString());
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []); // Empty dependency array means this runs once on mount

  useEffect(() => {
    setData(currentData => {
      const sortedData = [...currentData].sort((a, b) => {
        const aValue = a[sortConfig.key];
        const bValue = b[sortConfig.key];
        
        if (typeof aValue === 'string' && typeof bValue === 'string') {
          return sortConfig.direction === 'asc' 
            ? aValue.localeCompare(bValue)
            : bValue.localeCompare(aValue);
        }
        
        if (typeof aValue === 'number' && typeof bValue === 'number') {
          return sortConfig.direction === 'asc' 
            ? aValue - bValue
            : bValue - aValue;
        }
        
        return 0;
      });
      return sortedData;
    });
  }, [sortConfig]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          Error: {error}
        </div>
      </div>
    );
  }

  return (
    <div className="container-fluid w-full mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">ความก้าวหน้าการนับคาร์บ</h1>
          {lastUpdated && (
            <p className="text-sm text-gray-500">อัปเดตล่าสุด: {lastUpdated}</p>
          )}
        </div>
        <div className="flex space-x-2">
          <button
            onClick={fetchData}
            disabled={loading}
            className="flex items-center gap-2 bg-teal-100 hover:bg-teal-200 text-teal-800 font-medium py-2 px-4 rounded-md border border-teal-200 transition-colors disabled:opacity-50"
          >
            {loading ? (
              <>
                <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                กำลังโหลด...
              </>
            ) : (
              <>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                รีเฟรช
              </>
            )}
          </button>
          <Link 
            href="/carb/hos" 
            className="flex items-center gap-2 bg-teal-600 hover:bg-teal-700 text-white font-medium py-2 px-4 rounded-md transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h3m9 0h-3m4 0h2m-9-4h.01M12 16h.01M16 12h.01M12 12h.01M8 12h.01M7 8h.01M12 8h.01M16 8h.01" />
            </svg>
            ดูข้อมูลระดับสถานพยาบาล
          </Link>
        </div>
      </div>
      
      <div className="overflow-x-auto bg-white rounded-lg shadow-md">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-blue-50">
            <tr>
              <th 
                scope="col" 
                className="px-6 py-3 cursor-pointer text-left text-xs font-medium text-blue-800 uppercase tracking-wider"
                onClick={() => handleSort('amp_code')}
              >
                รหัส
                {sortConfig.key === 'amp_code' && (
                  <svg 
                    className={`inline-block w-4 h-4 ml-1 ${sortConfig.direction === 'asc' ? 'rotate-180 transform' : ''}`} 
                    fill="none" 
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                  </svg>
                )}
              </th>
              <th 
                scope="col" 
                className="px-6 py-3 cursor-pointer text-left text-xs font-medium text-blue-800 uppercase tracking-wider"
                onClick={() => handleSort('amp_name')}
              >
                อำเภอ
                {sortConfig.key === 'amp_name' && (
                  <svg 
                    className={`inline-block w-4 h-4 ml-1 ${sortConfig.direction === 'asc' ? 'rotate-180 transform' : ''}`} 
                    fill="none" 
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                  </svg>
                )}
              </th>
              <th 
                scope="col" 
                className="px-6 py-3 cursor-pointer text-left text-xs font-medium text-blue-800 uppercase tracking-wider"
                onClick={() => handleSort('person_target')}
              >
                เป้าหมาย 🎯
                {sortConfig.key === 'person_target' && (
                  <svg 
                    className={`inline-block w-4 h-4 ml-1 ${sortConfig.direction === 'asc' ? 'rotate-180 transform' : ''}`} 
                    fill="none" 
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                  </svg>
                )}
              </th>
              <th 
                scope="col" 
                className="px-6 py-3 cursor-pointer text-left text-xs font-medium text-blue-800 uppercase tracking-wider"
                onClick={() => handleSort('person_carb')}
              >
                นับคาร์บ 🍚
                {sortConfig.key === 'person_carb' && (
                  <svg 
                    className={`inline-block w-4 h-4 ml-1 ${sortConfig.direction === 'asc' ? 'rotate-180 transform' : ''}`} 
                    fill="none" 
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                  </svg>
                )}
              </th>
              <th 
                scope="col" 
                className="px-6 py-3 cursor-pointer text-left text-xs font-medium text-blue-800 uppercase tracking-wider"
                onClick={() => handleSort('percentage')}
              >
                ร้อยละ 📈
                {sortConfig.key === 'percentage' && (
                  <svg 
                    className={`inline-block w-4 h-4 ml-1 ${sortConfig.direction === 'asc' ? 'rotate-180 transform' : ''}`} 
                    fill="none" 
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                  </svg>
                )}
              </th>

            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {data.map((item, index) => (
              <tr key={item.amp_code} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{item.amp_code}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.amp_name}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.person_target.toLocaleString()}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.person_carb.toLocaleString()}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.percentage.toFixed(2)}%</td>

              </tr>
            ))}
          </tbody>
        </table>
      </div>

    </div>
  );
}