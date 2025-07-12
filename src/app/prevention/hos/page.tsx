'use client';

import Link from 'next/link';
import { useState, useEffect, useMemo } from 'react';
import React from 'react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Dialog } from '@headlessui/react';
import { XMarkIcon, PencilIcon, DocumentTextIcon } from '@heroicons/react/24/outline';

// Custom styles for table headers
const headerStyle = {
  fontSize: '15px',
  lineHeight: '1.25rem',
};

interface Prevention {
  id: number;
  hoscode: string;
  hosname: string;
  hostype: string;
  tmb_code: string;
  tmb_name: string;
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
  updated_at: string;
}

interface EditableCellProps {
  value: number;
  editingValue: string;
  onChange: (value: string) => void;
  isEditing: boolean;
  onFocus: () => void;
  className?: string;
}

const EditableCell: React.FC<EditableCellProps> = ({ 
  value, 
  editingValue, 
  onChange, 
  isEditing, 
  onFocus,
  className 
}) => {
  if (isEditing) {
    return (
      <input
        type="number"
        className={`${className} border rounded px-2 py-1 w-24`}
        value={editingValue}
        onChange={(e) => onChange(e.target.value)}
        onFocus={onFocus}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            const form = e.currentTarget.closest('tr')?.querySelector('button[title="Save changes"]') as HTMLButtonElement;
            form?.click();
          }
        }}
        min="0"
        step="0.01"
      />
    );
  }

  return (
    <div className={className}>
      {Math.round(value).toLocaleString()}
    </div>
  );
};

interface EditState {
  id: number | null;
  hoscode: string;
  hosname: string;
  isEditing: boolean;
  // Add all numeric fields that should be editable
  total_officer: string;
  total_pop: string;
  osm_provider: string;
  officer_provider: string;
  target_pop: string;
  prevention_visit: string;
  normal_pop: string;
  risk_pop: string;
  sick_pop: string;
  trained: string;
  risk_to_normal: string;
  weight_reduce: string;
  weight_reduce_avg: string;
}

type SortDirection = 'asc' | 'desc';
type SortableField = keyof Pick<Prevention, 
  'id' | 'hoscode' | 'hosname' | 'amp_name' | 
  'total_officer' | 'total_pop' | 'osm_provider' | 
  'officer_provider' | 'target_pop' | 'prevention_visit' | 
  'normal_pop' | 'risk_pop' | 'sick_pop' | 'trained' | 
  'risk_to_normal' | 'weight_reduce' | 'weight_reduce_avg' | 'updated_at'
>;

export default function PreventionPage() {
  const [preventions, setPreventions] = useState<Prevention[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [lastUpdated, setLastUpdated] = useState<string>('');
  const [sortConfig, setSortConfig] = useState<{
    key: SortableField;
    direction: SortDirection;
  }>({ key: 'id', direction: 'asc' });
  
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editing, setEditing] = useState<EditState>({
    id: null,
    hoscode: '',
    hosname: '',
    isEditing: false,
    total_officer: '',
    total_pop: '',
    osm_provider: '',
    officer_provider: '',
    target_pop: '',
    prevention_visit: '',
    normal_pop: '',
    risk_pop: '',
    sick_pop: '',
    trained: '',
    risk_to_normal: '',
    weight_reduce: '',
    weight_reduce_avg: ''
  });
  
  // Search states
  const [searchHoscode, setSearchHoscode] = useState('');
  const [searchHosname, setSearchHosname] = useState('');
  const [searchAmp, setSearchAmp] = useState('');
  const [blinkingRows, setBlinkingRows] = useState<Set<number>>(new Set());

  const handleClearFilters = () => {
    setSearchHoscode('');
    setSearchHosname('');
    setSearchAmp('');
  };

  // Function to fetch data
  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/prevention/hos', {
        cache: 'no-store',
        next: { revalidate: 0 }
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage = errorData?.details || errorData?.error || 'Failed to fetch prevention data';
        throw new Error(errorMessage);
      }
      
      const data = await response.json();
      setPreventions(data);
      setLastUpdated(new Date().toLocaleString());
      
      // Show success toast if not initial load
      if (preventions.length > 0) {
        toast.success('ข้อมูลได้รับการอัปเดตแล้ว', {
          position: 'top-right',
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        });
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load prevention data';
      console.error('Error fetching prevention data:', err);
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

  // Sort data
  const sortData = (data: Prevention[]) => {
    return [...data].sort((a, b) => {
      let aValue = a[sortConfig.key];
      let bValue = b[sortConfig.key];

      // Handle null/undefined values
      if (aValue === null || aValue === undefined) return sortConfig.direction === 'asc' ? -1 : 1;
      if (bValue === null || bValue === undefined) return sortConfig.direction === 'asc' ? 1 : -1;

      // Convert to string for locale comparison if not a number
      if (typeof aValue === 'string') aValue = aValue.toLowerCase();
      if (typeof bValue === 'string') bValue = bValue.toLowerCase();

      if (aValue < bValue) {
        return sortConfig.direction === 'asc' ? -1 : 1;
      }
      if (aValue > bValue) {
        return sortConfig.direction === 'asc' ? 1 : -1;
      }
      return 0;
    });
  };

  const handleSort = (key: SortableField) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  const getSortIndicator = (field: SortableField) => {
    if (sortConfig.key !== field) return null;
    return sortConfig.direction === 'asc' ? ' ↑' : ' ↓';
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('th-TH', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Get unique amphoe names for the filter
  const uniqueAmphoes = useMemo(() => {
    const amphoes = new Set<string>();
    preventions.forEach(prevention => {
      if (prevention.amp_name) {
        amphoes.add(prevention.amp_name);
      }
    });
    return Array.from(amphoes).sort();
  }, [preventions]);

  // Filter and sort data
  const filteredAndSortedPreventions = useMemo(() => {
    let result = [...preventions];
    
    // Apply filters
    if (searchAmp) {
      result = result.filter(prevention => 
        prevention.amp_name === searchAmp
      );
    }
    
    if (searchHoscode) {
      const searchTerm = searchHoscode.toLowerCase();
      result = result.filter(prevention => 
        prevention.hoscode.toLowerCase().includes(searchTerm)
      );
    }
    
    if (searchHosname) {
      const searchTerm = searchHosname.toLowerCase();
      result = result.filter(prevention => 
        prevention.hosname.toLowerCase().includes(searchTerm)
      );
    }
    
    // Apply sorting
    return sortData(result);
  }, [preventions, searchAmp, searchHoscode, searchHosname, sortConfig]);

  // Handle edit start
  const handleEdit = (prevention: Prevention) => {
    setEditing({
      id: prevention.id,
      hoscode: prevention.hoscode,
      hosname: prevention.hosname, // Add hosname to the editing state
      isEditing: true,
      total_officer: prevention.total_officer.toString(),
      total_pop: prevention.total_pop.toString(),
      osm_provider: prevention.osm_provider.toString(),
      officer_provider: prevention.officer_provider.toString(),
      target_pop: prevention.target_pop.toString(),
      prevention_visit: prevention.prevention_visit.toString(),
      normal_pop: prevention.normal_pop.toString(),
      risk_pop: prevention.risk_pop.toString(),
      sick_pop: prevention.sick_pop.toString(),
      trained: prevention.trained.toString(),
      risk_to_normal: prevention.risk_to_normal.toString(),
      weight_reduce: prevention.weight_reduce.toString(),
      weight_reduce_avg: prevention.weight_reduce_avg.toString()
    });
    setIsEditModalOpen(true);
  };

  // Handle save
  const handleSave = async (id: number) => {
    try {

      const response = await fetch(`/api/prevention/hos/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          total_officer: parseFloat(editing.total_officer) || 0,
          total_pop: parseFloat(editing.total_pop) || 0,
          osm_provider: parseFloat(editing.osm_provider) || 0,
          officer_provider: parseFloat(editing.officer_provider) || 0,
          target_pop: parseFloat(editing.target_pop) || 0,
          prevention_visit: parseFloat(editing.prevention_visit) || 0,
          normal_pop: parseFloat(editing.normal_pop) || 0,
          risk_pop: parseFloat(editing.risk_pop) || 0,
          sick_pop: parseFloat(editing.sick_pop) || 0,
          trained: parseFloat(editing.trained) || 0,
          risk_to_normal: parseFloat(editing.risk_to_normal) || 0,
          weight_reduce: parseFloat(editing.weight_reduce) || 0,
          weight_reduce_avg: parseFloat(editing.weight_reduce_avg) || 0,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update record');
      }

      const updatedPrevention = await response.json();
      
      // Update the UI with the updated record
      setPreventions(prev => 
        prev.map(p => 
          p.id === updatedPrevention.id ? { ...p, ...updatedPrevention } : p
        )
      );
      
      // Show success message
      toast.success('อัปเดตข้อมูลสำเร็จ');
      
      // Reset editing state
      setEditing({
        id: null,
        hoscode: '',
        hosname: '',
        isEditing: false,
        total_officer: '',
        total_pop: '',
        osm_provider: '',
        officer_provider: '',
        target_pop: '',
        prevention_visit: '',
        normal_pop: '',
        risk_pop: '',
        sick_pop: '',
        trained: '',
        risk_to_normal: '',
        weight_reduce: '',
        weight_reduce_avg: ''
      });
      // Add blinking effect to the updated row
      setBlinkingRows(prev => {
        const newSet = new Set(prev);
        newSet.add(updatedPrevention.id);
        return newSet;
      });
      
      // Remove blinking effect after animation
      setTimeout(() => {
        setBlinkingRows(prev => {
          const newSet = new Set(prev);
          newSet.delete(updatedPrevention.id);
          return newSet;
        });
      }, 2000);
      
      // Close the modal
      setIsEditModalOpen(false);
      
    } catch (err) {
      console.error('Error updating record:', err);
      toast.error('เกิดข้อผิดพลาดในการอัปเดตข้อมูล');
    }
  };

  // Handle cancel edit
  const handleCancel = () => {
    setEditing({
      id: null,
      hoscode: '',
      hosname: '',
      isEditing: false,
      total_officer: '',
      total_pop: '',
      osm_provider: '',
      officer_provider: '',
      target_pop: '',
      prevention_visit: '',
      normal_pop: '',
      risk_pop: '',
      sick_pop: '',
      trained: '',
      risk_to_normal: '',
      weight_reduce: '',
      weight_reduce_avg: ''
    });
    setIsEditModalOpen(false);
  };

  // Handle input change for editable cells
  const handleInputChange = (field: keyof Omit<EditState, 'id' | 'hoscode' | 'isEditing'>, value: string) => {
    setEditing(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Check if a specific row is in editing mode
  const isRowEditing = (id: number | null): boolean => {
    return editing.id === id && editing.isEditing === true;
  };

  if (loading && preventions.length === 0) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error && preventions.length === 0) {
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
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">ข้อมูลการป้องกันโรคไม่ติดต่อเรื้อรัง (ระดับโรงพยาบาล)</h1>
          {lastUpdated && (
            <p className="text-sm text-gray-500">อัปเดตล่าสุด: {lastUpdated}</p>
          )}
        </div>
        <div className="flex space-x-2">
          <button
            onClick={fetchData}
            disabled={loading}
            className="bg-teal-100 hover:bg-teal-200 text-teal-800 font-medium py-2 px-4 rounded-md flex items-center gap-2 border border-teal-200 transition-colors disabled:opacity-50"
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
            href="/prevention/amp"
            className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded flex items-center transition-colors focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
          >
            <DocumentTextIcon className="h-5 w-5 mr-2" />
            ดูข้อมูลระดับอำเภอ
          </Link>
        </div>
      </div>
      
      <div className="mb-6 p-4 bg-gray-50 rounded-lg">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">ค้นหาจากรหัสหน่วยงาน</label>
            <input
              type="text"
              className="w-full p-2 border rounded-md"
              value={searchHoscode}
              onChange={(e) => setSearchHoscode(e.target.value)}
              placeholder="รหัสหน่วยงาน..."
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">ค้นหาจากชื่อหน่วยงาน</label>
            <input
              type="text"
              className="w-full p-2 border rounded-md"
              value={searchHosname}
              onChange={(e) => setSearchHosname(e.target.value)}
              placeholder="ชื่อหน่วยงาน..."
            />
          </div>
          <div className="flex items-end">
            <button
              type="button"
              onClick={handleClearFilters}
              className="w-full px-4 py-2 text-sm font-medium text-green-800 bg-green-100 rounded-md hover:bg-green-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 border border-green-200 transition-colors flex items-center justify-center"
            >
              <XMarkIcon className="h-4 w-4 mr-1" />
              ล้างตัวกรอง
            </button>
          </div>
        </div>
      </div>
      
      {/* Data Table */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSort('hoscode')}
                  style={headerStyle}
                  rowSpan={2}
                >
                  <div className="flex items-center">
                    รหัสหน่วยงาน
                    {getSortIndicator('hoscode')}
                  </div>
                </th>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSort('hosname')}
                  style={headerStyle}
                  rowSpan={2}
                >
                  <div className="flex items-center">
                    ชื่อหน่วยงาน
                    {getSortIndicator('hosname')}
                  </div>
                </th>
              <th 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                onClick={() => handleSort('amp_name')}
                style={headerStyle}
                rowSpan={2}
              >
                อำเภอ {getSortIndicator('amp_name')}
              </th>
              <th 
                className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider"
                style={headerStyle}
                colSpan={2}
              >
                Provider ID
              </th>
              <th 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                style={headerStyle}
                rowSpan={2}
              >
                คัดกรอง35ปี+
              </th>
              <th 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                style={headerStyle}
                rowSpan={2}
              >
                ผู้เข้ารับบริการ NCD Prevention
              </th>
              <th 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                style={headerStyle}
                colSpan={3}
              >
                ผลการคัดกรอง
              </th>
              <th 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                style={headerStyle}
                rowSpan={2}
              >
                อัปเดตล่าสุด
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider" style={headerStyle}
                rowSpan={2}
              >
                การจัดการ
              </th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider" style={headerStyle}
                rowSpan={2}
              >
                Stat
              </th>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSort('amp_name')}
                  style={headerStyle}
                  rowSpan={2}
                >
                  <div className="flex items-center">
                    อำเภอ
                    {getSortIndicator('amp_name')}
                  </div>
                </th>
                <th 
                  className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider"
                  style={headerStyle}
                  colSpan={2}
                >
                  Provider ID
                </th>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  style={headerStyle}
                  rowSpan={2}
                >
                  คัดกรอง35ปี+
                </th>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  style={headerStyle}
                  rowSpan={2}
                >
                  ผู้เข้ารับบริการ NCD Prevention
                </th>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  style={headerStyle}
                  colSpan={3}
                >
                  ผลการคัดกรอง
                </th>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  style={headerStyle}
                  rowSpan={2}
                >
                  อัปเดตล่าสุด
                </th>
                <th 
                  className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider" 
                  style={headerStyle}
                  rowSpan={2}
                >
                  การจัดการ
                </th>
                <th 
                  className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider" 
                  style={headerStyle}
                  rowSpan={2}
                >
                  Stat
                </th>
              </tr>
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider" style={headerStyle}>อสม</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider" style={headerStyle}>จนท</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider" style={headerStyle}>ปกติ</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider" style={headerStyle}>เสี่ยง</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider" style={headerStyle}>ป่วย</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredAndSortedPreventions.length > 0 ? (
                filteredAndSortedPreventions.map((prevention) => (
                  <tr 
                    key={prevention.id} 
                    className={`${blinkingRows.has(prevention.id) ? 'animate-pulse bg-blue-50' : ''} ${
                      isRowEditing(prevention.id) ? 'bg-yellow-50' : 'hover:bg-gray-50'
                    }`}
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {prevention.hoscode}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {prevention.hosname}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {prevention.amp_name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {Math.round(prevention.total_officer).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {Math.round(prevention.total_pop).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {Math.round(prevention.target_pop).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {Math.round(prevention.prevention_visit).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {Math.round(prevention.normal_pop).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {Math.round(prevention.risk_pop).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {Math.round(prevention.sick_pop).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(prevention.updated_at)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      {isRowEditing(prevention.id) ? (
                        <div className="flex space-x-2 justify-end">
                          <button
                            onClick={() => handleSave(prevention.id)}
                            className="text-teal-600 hover:text-teal-800 font-medium px-3 py-1 bg-teal-50 hover:bg-teal-100 rounded-md transition-colors"
                            title="Save changes"
                          >
                            บันทึก
                          </button>
                          <button
                            onClick={handleCancel}
                            className="text-gray-600 hover:text-gray-800 font-medium px-3 py-1 bg-gray-50 hover:bg-gray-100 rounded-md transition-colors"
                            title="Cancel"
                          >
                            ยกเลิก
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => handleEdit(prevention)}
                          className="text-teal-600 hover:text-teal-800 font-medium px-2 py-1 bg-teal-50 hover:bg-teal-100 rounded-md transition-colors"
                          title="Edit"
                        >
                          <PencilIcon className="h-5 w-5" />
                        </button>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                      <Link href={`/prevention/hos/stat?hoscode=${prevention.hoscode}`}>
                        <DocumentTextIcon className="h-5 w-5 text-teal-600 hover:text-teal-700 mx-auto transition-colors" />
                      </Link>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={12} className="px-6 py-4 text-center text-sm text-gray-500">
                    ไม่พบข้อมูล
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      
      {/* Edit Modal */}
      <Dialog open={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} className="relative z-50">
        <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
        <div className="fixed inset-0 flex items-center justify-center p-4">
          <Dialog.Panel className="w-full max-w-4xl rounded-lg bg-white p-6 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <Dialog.Title className="text-lg font-medium">
                รายงานผลงาน ({editing.hosname || 'หน่วยงาน'})
              </Dialog.Title>
              <button
                onClick={handleCancel}
                className="text-gray-400 hover:text-gray-500"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">เจ้าหน้าที่ทั้งหมด</label>
                <input
                  type="number"
                  className="w-full border rounded px-3 py-2"
                  value={editing.total_officer}
                  onChange={(e) => handleInputChange('total_officer', e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">ประชากรทั้งหมด</label>
                <input
                  type="number"
                  className="w-full border rounded px-3 py-2"
                  value={editing.total_pop}
                  onChange={(e) => handleInputChange('total_pop', e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">กลุ่มเป้าหมาย</label>
                <input
                  type="number"
                  className="w-full border rounded px-3 py-2"
                  value={editing.target_pop}
                  onChange={(e) => handleInputChange('target_pop', e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">เข้าถึงบริการ</label>
                <input
                  type="number"
                  className="w-full border rounded px-3 py-2"
                  value={editing.prevention_visit}
                  onChange={(e) => handleInputChange('prevention_visit', e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">ปกติ</label>
                <input
                  type="number"
                  className="w-full border rounded px-3 py-2"
                  value={editing.normal_pop}
                  onChange={(e) => handleInputChange('normal_pop', e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">เสี่ยง</label>
                <input
                  type="number"
                  className="w-full border rounded px-3 py-2"
                  value={editing.risk_pop}
                  onChange={(e) => handleInputChange('risk_pop', e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">ป่วย</label>
                <input
                  type="number"
                  className="w-full border rounded px-3 py-2"
                  value={editing.sick_pop}
                  onChange={(e) => handleInputChange('sick_pop', e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">น้ำหนักลด (กก.)</label>
                <input
                  type="number"
                  step="0.1"
                  className="w-full border rounded px-3 py-2"
                  value={editing.weight_reduce}
                  onChange={(e) => handleInputChange('weight_reduce', e.target.value)}
                />
              </div>
            </div>

            <div className="mt-6 flex justify-end space-x-3">
              <button
                type="button"
                onClick={handleCancel}
                className="px-4 py-2 text-sm font-medium text-gray-600 bg-gray-50 hover:bg-gray-100 rounded-md transition-colors"
              >
                ยกเลิก
              </button>
              <button
                type="button"
                onClick={() => editing.id && handleSave(editing.id)}
                className="px-4 py-2 text-sm font-medium text-white bg-teal-600 rounded-md hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 transition-colors"
              >
                บันทึกการเปลี่ยนแปลง
              </button>
            </div>
          </Dialog.Panel>
        </div>
      </Dialog>
    </div>
  );
}