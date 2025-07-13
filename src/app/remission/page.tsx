'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { DocumentTextIcon } from '@heroicons/react/24/outline';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

interface AmpRemissionData {
  amp_code: string;
  amp_name: string;
  trained: number;
  ncds_remission: number;
  stopped_medication: number;
  reduced_1: number;
  reduced_2: number;
  reduced_3: number;
  reduced_4: number;
  reduced_5: number;
  reduced_6: number;
  reduced_7: number;
  reduced_8: number;
  reduced_n: number;
  same_medication: number;
  increased_medication: number;
  pending_evaluation: number;
  lost_followup: number;
}

export default function AmpRemissionPage() {
  const [data, setData] = useState<AmpRemissionData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<string>('');

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('Fetching remission data from API...');
      const response = await fetch('/api/remission/amp', {
        cache: 'no-store',
        next: { revalidate: 0 }
      });
      
      const result = await response.json();
      
      if (!response.ok) {
        const errorMessage = result?.details || result?.error || 'Failed to fetch data';
        console.error('API Error:', errorMessage);
        throw new Error(errorMessage);
      }
      
      if (!Array.isArray(result)) {
        console.error('Unexpected response format:', result);
        throw new Error('Invalid data format received from server');
      }
      
      console.log(`Successfully loaded ${result.length} AMP remission records`);
      setData(result);
      setLastUpdated(new Date().toLocaleString());
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
      console.error('Error in fetchData:', errorMessage);
      setError(`เกิดข้อผิดพลาด: ${errorMessage}`);
      
      toast.error(`ไม่สามารถโหลดข้อมูลได้: ${errorMessage}`, {
        position: 'top-right',
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleRefresh = () => {
    fetchData();
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 text-red-600">
        Error loading remission data: {error}
      </div>
    );
  }

  return (
    <div className="p-4">
      <ToastContainer position="top-right" autoClose={5000} />
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">Remission Clinic (รายอำเภอ)</h1>
          {lastUpdated && (
            <p className="text-sm text-gray-500">อัปเดตล่าสุด: {lastUpdated}</p>
          )}
        </div>
        <div className="flex space-x-2">
          <button
            onClick={handleRefresh}
            disabled={loading}
            className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-2 px-4 rounded flex items-center disabled:opacity-50"
          >
            <svg 
              className={`animate-spin -ml-1 mr-2 h-4 w-4 ${loading ? 'block' : 'hidden'}`} 
              xmlns="http://www.w3.org/2000/svg" 
              fill="none" 
              viewBox="0 0 24 24"
            >
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            {loading ? 'กำลังโหลด...' : 'รีเฟรช'}
          </button>
          <Link 
            href="/remission/hos" 
            className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded flex items-center transition-colors duration-200"
          >
            <DocumentTextIcon className="h-5 w-5 mr-2" />
            ดูข้อมูลระดับสถานพยาบาล
          </Link>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border border-gray-200 rounded-lg overflow-hidden">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                AMP Code
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Amphur
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Trained
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                NCDs Remission
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Stopped Meds
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Reduced 1-8
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Same Meds
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Increased
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Pending
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Lost Followup
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {data.map((item) => (
              <tr key={item.amp_code} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {item.amp_code}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {item.amp_name}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">
                  {item.trained.toLocaleString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">
                  {item.ncds_remission.toLocaleString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">
                  {item.stopped_medication.toLocaleString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">
                  {(
                    item.reduced_1 + item.reduced_2 + item.reduced_3 + 
                    item.reduced_4 + item.reduced_5 + item.reduced_6 + 
                    item.reduced_7 + item.reduced_8
                  ).toLocaleString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">
                  {item.same_medication.toLocaleString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">
                  {item.increased_medication.toLocaleString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">
                  {item.pending_evaluation.toLocaleString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">
                  {item.lost_followup.toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}