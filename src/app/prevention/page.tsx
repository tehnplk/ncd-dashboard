'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { DocumentTextIcon, ArrowPathIcon } from '@heroicons/react/24/outline';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

interface AmpData {
  amp_code: string;
  amp_name: string;
  total_officer: number;
  total_pop: number;
  osm_provider: number;
  officer_provider: number;
  target_pop: number;
  prevention_visit: number;
  normal_pop: number;
  risk_pop: number;
  sick_pop: number;
  trained: number;
  risk_to_normal: number;
  weight_reduce: number;
  weight_reduce_avg: number;
}

export default function AmpPreventionPage() {
  const [data, setData] = useState<AmpData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<string>('');

  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/prevention/amp', {
        cache: 'no-store',
        next: { revalidate: 0 }
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage = errorData?.details || errorData?.error || `HTTP error! status: ${response.status}`;
        throw new Error(errorMessage);
      }
      
      const result: AmpData[] = await response.json();
      setData(result);
      setLastUpdated(new Date().toLocaleString());
      
      // Show success toast if not initial load
      if (data.length > 0) {
        toast.success('ข้อมูลได้รับการอัปเดตแล้ว', {
          position: 'top-right',
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        });
      }
    } catch (e: any) {
      const errorMessage = e instanceof Error ? e.message : 'Failed to load data';
      setError(errorMessage);
      
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

  // Initial data fetch
  useEffect(() => {
    fetchData();
  }, []);

  if (loading && data.length === 0) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error && data.length === 0) {
    return (
      <div className="max-w-4xl mx-auto p-4">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
          <strong className="font-bold">เกิดข้อผิดพลาด: </strong>
          <span className="block sm:inline">{error}</span>
          <button 
            onClick={fetchData}
            className="absolute top-0 bottom-0 right-0 px-4 py-3"
          >
            <svg className="fill-current h-6 w-6 text-red-500" role="button" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
              <title>Close</title>
              <path d="M14.348 14.849a1.2 1.2 0 0 1-1.697 0L10 11.819l-2.651 3.029a1.2 1.2 0 1 1-1.697-1.697l2.758-3.15-2.759-3.152a1.2 1.2 0 1 1 1.697-1.697L10 8.183l2.651-3.031a1.2 1.2 0 1 1 1.697 1.697l-2.758 3.152 2.758 3.15a1.2 1.2 0 0 1 0 1.698z"/>
            </svg>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">ข้อมูลการป้องกันโรคไม่ติดต่อเรื้อรัง (ระดับอำเภอ)</h1>
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
            <svg 
              className={`animate-spin h-5 w-5 ${loading ? 'block' : 'hidden'}`} 
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
            href="/prevention/hos" 
            className="flex items-center gap-2 bg-teal-600 hover:bg-teal-700 text-white font-medium py-2 px-4 rounded-md transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h3m9 0h-3m4 0h2m-9-4h.01M12 16h.01M16 12h.01M12 12h.01M8 12h.01M7 8h.01M12 8h.01M16 8h.01" />
            </svg>
            ดูข้อมูลระดับสถานพยาบาล
          </Link>
        </div>
      </div>
      <ToastContainer position="top-right" autoClose={5000} hideProgressBar={false} newestOnTop closeOnClick rtl={false} pauseOnFocusLoss draggable pauseOnHover />
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border border-gray-200">
          <thead>
            <tr>
              <th className="py-2 px-4 border-b text-left" rowSpan={2}>#</th>
              <th className="py-2 px-4 border-b text-left" rowSpan={2}>อำเภอ</th>
              <th className="py-2 px-4 border-b text-right" rowSpan={2}>จนท</th>
              <th className="py-2 px-4 border-b text-right" rowSpan={2}>ปชก</th>
              <th className="py-2 px-4 border-b text-center" colSpan={2}>Provider ID</th>
              <th className="py-2 px-4 border-b text-right" rowSpan={2}>คัดกรอง35ปี+</th>
              <th className="py-2 px-4 border-b text-right" rowSpan={2}>ผู้เข้ารับบริการ NCD Prevention</th>
              <th className="py-2 px-4 border-b text-center" colSpan={3}>ผลการคัดกรอง</th>
              <th className="py-2 px-4 border-b text-right" rowSpan={2}>กลุ่มเสี่ยงเข้าอบรมปรับเปลี่ยน</th>
              <th className="py-2 px-4 border-b text-right" rowSpan={2}>กลุ่มเสี่ยงกลับเป็นปกติ</th>
              <th className="py-2 px-4 border-b text-right" rowSpan={2}>น้ำหนักลดรวม</th>
              <th className="py-2 px-4 border-b text-right" rowSpan={2}>น้ำหนักลดเฉลี่ยต่อคน</th>

            </tr>
            <tr>
              <th className="py-2 px-4 border-b text-right">อสม</th>
              <th className="py-2 px-4 border-b text-right">จนท</th>
              <th className="py-2 px-4 border-b text-right">ปกติ</th>
              <th className="py-2 px-4 border-b text-right">เสี่ยง</th>
              <th className="py-2 px-4 border-b text-right">ป่วย</th>
            </tr>
          </thead>
          <tbody>
            {data.map((row, index) => (
              <tr key={index} className="hover:bg-gray-50">
                <td className="py-2 px-4 border-b text-left">{row.amp_code}</td>
                <td className="py-2 px-4 border-b text-left">{row.amp_name}</td>
                <td className="py-2 px-4 border-b text-right">{row.total_officer.toLocaleString()}</td>
                <td className="py-2 px-4 border-b text-right">{row.total_pop.toLocaleString()}</td>
                <td className="py-2 px-4 border-b text-right">{row.osm_provider.toLocaleString()}</td>
                <td className="py-2 px-4 border-b text-right">{row.officer_provider.toLocaleString()}</td>
                <td className="py-2 px-4 border-b text-right">{row.target_pop.toLocaleString()}</td>
                <td className="py-2 px-4 border-b text-right">{row.prevention_visit.toLocaleString()}</td>
                <td className="py-2 px-4 border-b text-right">{row.normal_pop.toLocaleString()}</td>
                <td className="py-2 px-4 border-b text-right">{row.risk_pop.toLocaleString()}</td>
                <td className="py-2 px-4 border-b text-right">{row.sick_pop.toLocaleString()}</td>
                <td className="py-2 px-4 border-b text-right">{row.trained.toLocaleString()}</td>
                <td className="py-2 px-4 border-b text-right">{row.risk_to_normal.toLocaleString()}</td>
                <td className="py-2 px-4 border-b text-right">{row.weight_reduce.toLocaleString()}</td>
                <td className="py-2 px-4 border-b text-right">{row.weight_reduce_avg.toLocaleString()}</td>

              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}