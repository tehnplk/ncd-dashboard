'use client';

import Link from 'next/link';
import { useState, useEffect, useMemo } from 'react';
import React from 'react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Custom styles for table headers
const headerStyle = {
  fontSize: '15px',
  lineHeight: '1.25rem',
};

interface Carb {
  id: number;
  hoscode: string;
  hosname: string;
  hostype: string;
  tmb_code: string;
  tmb_name: string;
  amp_code: string;
  amp_name: string;
  person_target: number;
  person_carb: number;
  percentage: number;
  person_diff: number;
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
  person_target: string;
  person_carb: string;
  hoscode: string;
  isEditing: boolean;
}

type SortDirection = 'asc' | 'desc';
type SortableField = keyof Pick<Carb, 'id' | 'hoscode' | 'hosname' | 'amp_name' | 'person_target' | 'person_carb' | 'percentage' | 'person_diff' | 'updated_at'>;

export default function CarbPage() {
  const [carbs, setCarbs] = useState<Carb[]>([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [sortConfig, setSortConfig] = useState<{
    key: SortableField;
    direction: SortDirection;
  }>({ key: 'hoscode', direction: 'asc' });
  const [lastUpdated, setLastUpdated] = useState<string>('');
  const [editing, setEditing] = useState<EditState & { 
    hoscode: string; 
    isEditing: boolean;
  }>({
    id: null,
    person_target: '',
    person_carb: '',
    hoscode: '',
    isEditing: false
  });
  const [showPasswordDialog, setShowPasswordDialog] = useState(false);
  const [password, setPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  
  // Check if a specific row is in editing mode with password verification
  const isRowEditing = (id: number | null): boolean => {
    const isEditingRow = editing.id === id && editing.isEditing === true;
    
    // If the row is in editing mode, verify the password
    if (isEditingRow && password !== editing.hoscode) {
      // If password doesn't match, reset editing state
      setEditing(prev => ({
        ...prev,
        id: null,
        isEditing: false
      }));
      return false;
    }
    
    return isEditingRow;
  };
  
  
  // Search states
  const [searchHoscode, setSearchHoscode] = useState('');
  const [searchHosname, setSearchHosname] = useState('');
  const [searchAmp, setSearchAmp] = useState('');
  const [blinkingRows, setBlinkingRows] = useState<Set<number>>(new Set());

  const sortData = (data: Carb[]) => {
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

  // Filter and sort data
  // Get unique amphoe names for the filter
  const uniqueAmphoes = useMemo(() => {
    const amphoes = new Set<string>();
    carbs.forEach(carb => {
      if (carb.amp_name) {
        amphoes.add(carb.amp_name);
      }
    });
    return Array.from(amphoes).sort();
  }, [carbs]);

  const filteredAndSortedCarbs = useMemo(() => {
    let result = [...carbs];
    
    // Apply filters
    if (searchAmp) {
      result = result.filter(carb => 
        carb.amp_name === searchAmp
      );
    }
    
    if (searchHoscode) {
      const term = searchHoscode.toLowerCase();
      result = result.filter(carb => 
        carb.hoscode?.toLowerCase().includes(term)
      );
    }
    
    if (searchHosname) {
      const term = searchHosname.toLowerCase();
      result = result.filter(carb => 
        carb.hosname?.toLowerCase().includes(term)
      );
    }
    
    // Apply sorting
    return sortData(result);
  }, [carbs, searchAmp, searchHoscode, searchHosname, sortConfig]);

  // Initial data fetch
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const response = await fetch('/api/carb/hos', {
          cache: 'no-store',
          next: { revalidate: 0 }
        });
        
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          const errorMessage = errorData?.details || errorData?.error || 'Failed to fetch carb data';
          throw new Error(errorMessage);
        }
        
        const data = await response.json();
        // Calculate percentage and difference for each item
        const processedData = data.map((item: any) => ({
          ...item,
          percentage: item.person_target === 0 ? 0 : (item.person_carb / item.person_target) * 100,
          person_diff: item.person_target - item.person_carb
        }));
        
        setCarbs(processedData);
        setLastUpdated(new Date().toLocaleString());
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to load carb data';
        console.error('Error fetching carb data:', err);
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

    fetchData();
  }, []);

  // Function to refresh data
  const refreshData = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/carb/hos', {
        cache: 'no-store',
        next: { revalidate: 0 }
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage = errorData?.details || errorData?.error || 'Failed to fetch carb data';
        throw new Error(errorMessage);
      }
      
      const data = await response.json();
      // Calculate percentage and difference for each item
      const processedData = data.map((item: any) => ({
        ...item,
        percentage: item.person_target === 0 ? 0 : (item.person_carb / item.person_target) * 100,
        person_diff: item.person_target - item.person_carb
      }));
      
      setCarbs(processedData);
      setLastUpdated(new Date().toLocaleString());
      
      toast.success('ข้อมูลได้รับการอัปเดตแล้ว', {
        position: 'top-right',
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load carb data';
      console.error('Error refreshing carb data:', err);
      setError(errorMessage);
      
      toast.error(`ไม่สามารถอัปเดตข้อมูลได้: ${errorMessage}`, {
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

  // Format number with commas, without decimals
  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('en-US', {
      maximumFractionDigits: 0
    }).format(num);
  };

  const handleEditClick = (carb: Carb) => {
    // Always get the full item from the original data to ensure we have all fields
    const fullCarbItem = carbs.find(c => c.id === carb.id) || carb;
    
    // Create a new editing object with all required fields
    const newEditingState = {
      id: fullCarbItem.id,
      person_target: fullCarbItem.person_target.toString(),
      person_carb: fullCarbItem.person_carb.toString(),
      hoscode: fullCarbItem.hoscode,
      isEditing: false  // Will be set to true after password verification
    };
    
    // Reset editing state with the full item data
    setEditing(newEditingState);
    
    // Reset password state
    setPassword('');
    setPasswordError('');
    
    // Show password dialog
    setShowPasswordDialog(true);
  };

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!editing.id) {
      setPasswordError('ไม่พบข้อมูลที่จะแก้ไข');
      toast.error('เกิดข้อผิดพลาดในการเข้าสู่โหมดแก้ไข');
      return;
    }
    
    if (password === editing.hoscode) {
      // Update the editing state with isEditing set to true
      setEditing(prev => ({
        ...prev,
        isEditing: true
      }));
      
      // Close the dialog and show success message
      setShowPasswordDialog(false);
      toast.success('เข้าสู่โหมดแก้ไขเรียบร้อย');
      
      // Clear the password field but keep the password in state for verification
      setPasswordError('');
    } else {
      // Show error for incorrect password
      setPasswordError('รหัสผ่านไม่ถูกต้อง');
      toast.error('รหัสผ่านไม่ถูกต้อง');
      
      // Clear the editing state on incorrect password
      setEditing(prev => ({
        ...prev,
        id: null,
        isEditing: false
      }));
    }
  };

  const handleCancelEdit = () => {
    setEditing({ 
      id: null, 
      person_target: '', 
      person_carb: '', 
      hoscode: '',
      isEditing: false 
    });
    setError('');
    setShowPasswordDialog(false);
  };

  const handleInputChange = (field: 'person_target' | 'person_carb', value: string) => {
    setEditing(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSave = async () => {
    if (!editing.id) return;

    try {
      const toastId = toast.loading('กำลังบันทึกข้อมูล...');
      
      const response = await fetch(`/api/carb/hos/${editing.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          person_target: parseInt(editing.person_target) || 0,
          person_carb: parseInt(editing.person_carb) || 0,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update record');
      }

      const updatedCarb = await response.json();
      
      // Update the carbs list with the updated data
      setCarbs(carbs.map(carb => {
        if (carb.id === updatedCarb.id) {
          return {
            ...updatedCarb,
            // Recalculate derived values
            percentage: updatedCarb.person_target === 0 ? 0 : 
              (updatedCarb.person_carb / updatedCarb.person_target) * 100,
            person_diff: updatedCarb.person_target - updatedCarb.person_carb,
            updated_at: new Date().toISOString()
          };
        }
        return carb;
      }));

      // Add blinking effect to the updated row
      setBlinkingRows(prev => {
        const newSet = new Set(prev);
        newSet.add(updatedCarb.id);
        return newSet;
      });

      // Remove blinking effect after 5 seconds
      setTimeout(() => {
        setBlinkingRows(prev => {
          const newSet = new Set(prev);
          newSet.delete(updatedCarb.id);
          return newSet;
        });
      }, 5000);

      // Reset editing state
      setEditing({ 
        id: null, 
        person_target: '', 
        person_carb: '', 
        hoscode: '',
        isEditing: false 
      });

      // Update toast to show success
      toast.update(toastId, {
        render: 'บันทึกข้อมูลเรียบร้อย',
        type: 'success',
        isLoading: false,
        autoClose: 3000,
        closeButton: true,
      });
    } catch (err) {
      console.error('Error updating record:', err);
      setError('Failed to update data');
      toast.error('เกิดข้อผิดพลาดในการบันทึกข้อมูล');
    }
  };

  // Using isRowEditing for consistency

  return (
    <div className="container mx-auto px-4 py-8">
      <ToastContainer 
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
      {/* Password Dialog */}
      {showPasswordDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl w-96">
            <h3 className="text-lg font-medium mb-4">กรุณากรอกรหัสผ่าน</h3>
            <form onSubmit={handlePasswordSubmit}>
              <div className="mb-4">
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="กรอกรหัสผ่าน"
                  autoFocus
                />
                {passwordError && (
                  <p className="mt-1 text-sm text-red-600">{passwordError}</p>
                )}
              </div>
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={handleCancelEdit}
                  className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  ตกลง
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">ความก้าวหน้าการนับคาร์บ</h1>
          {lastUpdated && (
            <p className="text-sm text-gray-500">อัปเดตล่าสุด: {lastUpdated}</p>
          )}
        </div>
        <div className="flex space-x-2">
          <button
            onClick={refreshData}
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
            href="/carb" 
            className="bg-teal-600 hover:bg-teal-700 text-white font-medium py-2 px-4 rounded-md flex items-center gap-2 transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
            </svg>
            ดูข้อมูลระดับอำเภอ
          </Link>
        </div>
      </div>
      
      {/* Search Section */}
      <div className="bg-white p-5 rounded-lg shadow mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
          {/* Amphoe Filter */}
          <div>
            <select
              id="amp"
              value={searchAmp}
              onChange={(e) => setSearchAmp(e.target.value)}
              className="w-full h-11 px-3 text-base rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-gray-600"
            >
              <option value="">เลือกอำเภอทั้งหมด</option>
              {uniqueAmphoes.map(amp => (
                <option key={amp} value={amp}>
                  {amp}
                </option>
              ))}
            </select>
          </div>
          
          {/* Hoscode Search */}
          <div>
            <input
              type="text"
              id="hoscode"
              value={searchHoscode}
              onChange={(e) => setSearchHoscode(e.target.value)}
              placeholder="ค้นหาโดย รหัสสถานพยาบาล"
              className="w-full h-11 px-3 text-base rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-gray-600"
            />
          </div>
          
          {/* Hosname Search */}
          <div>
            <input
              type="text"
              id="hosname"
              value={searchHosname}
              onChange={(e) => setSearchHosname(e.target.value)}
              placeholder="ค้นหาโดย ชื่อสถานพยาบาล"
              className="w-full h-11 px-3 text-base rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-gray-600"
            />
          </div>
          
          {/* Clear Filters Button */}
          <div className="flex items-end">
            <button
              onClick={() => {
                setSearchAmp('');
                setSearchHoscode('');
                setSearchHosname('');
              }}
              className="w-full h-9 px-3 py-1 border border-gray-300 rounded-md shadow-sm text-xs font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-1 focus:ring-offset-1 focus:ring-blue-500"
            >
              ล้างตัวกรอง
            </button>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center p-8">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : error ? (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
          <span className="block sm:inline">{error}</span>
        </div>
      ) : (
        <div className="bg-white shadow-md rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th 
                    className="px-6 py-3 text-left font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                    style={headerStyle}
                    onClick={() => handleSort('hoscode')}
                  >
                    รหัส {getSortIndicator('hoscode')}
                  </th>
                  <th 
                    className="px-6 py-3 text-left text-base font-medium text-gray-500 uppercase tracking-wider"
                  >
                    ชื่อหน่วยงาน
                  </th>
                  <th 
                    className="px-6 py-3 text-left text-base font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSort('amp_name')}
                  >
                    อำเภอ {getSortIndicator('amp_name')}
                  </th>
                  <th 
                    className="px-6 py-3 text-left text-base font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSort('person_target')}
                  >
                    <span className="text-blue-500">👥</span> เป้าหมาย(คน) {getSortIndicator('person_target')}
                  </th>
                  <th 
                    className="px-6 py-3 text-left text-base font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSort('person_carb')}
                  >
                    <span className="text-yellow-600">🍚</span> นับคาร์บ(คน) {getSortIndicator('person_carb')}
                  </th>
                  <th 
                    className="px-6 py-3 text-left text-base font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSort('percentage')}
                  >
                    <span className="text-green-500">📊</span> ร้อยละ {getSortIndicator('percentage')}
                  </th>
                  <th 
                    className="px-6 py-3 text-left text-base font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSort('person_diff')}
                  >
                    <span className="text-purple-500">⏳</span> คงเหลือ(คน) {getSortIndicator('person_diff')}
                  </th>
                  <th 
                    className="px-6 py-3 text-left text-base font-medium text-gray-500 uppercase tracking-wider"
                  >
                    วันที่ปรับปรุง
                  </th>
                  <th className="px-6 py-3 text-left text-base font-medium text-gray-500 uppercase tracking-wider">
                    การจัดการ
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredAndSortedCarbs.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-xs text-gray-900">
                      {item.hoscode}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-xs text-gray-900">
                      {item.hosname}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-xs text-gray-500">
                      {item.amp_name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {isRowEditing(item.id) ? (
                        <EditableCell
                          value={item.person_target}
                          editingValue={editing.person_target}
                          onChange={(value) => setEditing(prev => ({ ...prev, person_target: value }))}
                          isEditing={isRowEditing(item.id)}
                          onFocus={() => {}}
                        />
                      ) : (
                        <div className="text-sm text-gray-900">
                          {formatNumber(item.person_target)}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {isRowEditing(item.id) ? (
                        <EditableCell
                          value={item.person_carb}
                          editingValue={editing.person_carb}
                          onChange={(value) => setEditing(prev => ({ ...prev, person_carb: value }))}
                          isEditing={isRowEditing(item.id)}
                          onFocus={() => {}}
                        />
                      ) : (
                        <div className="text-sm text-gray-900">
                          {formatNumber(item.person_carb)}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-xs text-gray-900">
                      {item.percentage.toFixed(2)}%
                    </td>
                    <td className={`px-6 py-4 whitespace-nowrap text-xs font-medium ${
                      item.person_diff >= 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {formatNumber(item.person_diff)}
                    </td>
                    <td className={`px-6 py-4 whitespace-nowrap text-xs ${
                      blinkingRows.has(item.id) ? 'animate-pulse text-green-400 font-bold' : 'text-gray-500 font-normal'
                    }`}>
                      {formatDate(item.updated_at)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-1">
                        {isRowEditing(item.id) ? (
                          <>
                            <button
                              onClick={handleSave}
                              className="p-1 text-green-600 hover:text-green-800"
                              title="Save changes"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                              </svg>
                            </button>
                            <button
                              onClick={handleCancelEdit}
                              className="p-1 text-red-600 hover:text-red-800"
                              title="Cancel editing"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                              </svg>
                            </button>
                          </>
                        ) : (
                          <button
                            onClick={() => handleEditClick(item)}
                            className="p-1 text-blue-600 hover:text-blue-800 cursor-pointer"
                            title="Edit"
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-5 w-5"
                              viewBox="0 0 20 20"
                              fill="currentColor"
                            >
                              <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                            </svg>
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
