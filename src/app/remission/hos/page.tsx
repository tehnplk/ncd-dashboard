'use client';

import Link from 'next/link';
import { useState, useEffect, useMemo } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Dialog } from '@headlessui/react';
import { XMarkIcon, PencilIcon, DocumentTextIcon } from '@heroicons/react/24/outline';

// Custom styles for table headers
const headerStyle = {
  fontSize: '15px',
  lineHeight: '1.25rem',
};

interface Remission {
  id: number;
  hoscode: string;
  hosname: string;
  hostype: string;
  tmb_code: string;
  tmb_name: string;
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
        className={`${className} border rounded px-2 py-1 w-20`}
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
        step="1"
      />
    );
  }

  return (
    <div className={className}>
      {value.toLocaleString()}
    </div>
  );
};

interface EditState {
  id: number | null;
  hoscode: string;
  hosname: string;
  isEditing: boolean;
  trained: string;
  ncds_remission: string;
  stopped_medication: string;
  reduced_1: string;
  reduced_2: string;
  reduced_3: string;
  reduced_4: string;
  reduced_5: string;
  reduced_6: string;
  reduced_7: string;
  reduced_8: string;
  reduced_n: string;
  same_medication: string;
  increased_medication: string;
  pending_evaluation: string;
  lost_followup: string;
}

type SortDirection = 'asc' | 'desc';
type SortableField = keyof Pick<Remission, 
  'id' | 'hoscode' | 'hosname' | 'amp_name' | 
  'trained' | 'ncds_remission' | 'stopped_medication' |
  'same_medication' | 'increased_medication' | 'pending_evaluation' |
  'lost_followup' | 'updated_at'
>;

export default function RemissionHosPage() {
  const [remissions, setRemissions] = useState<Remission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [lastUpdated, setLastUpdated] = useState<string>('');
  const [sortConfig, setSortConfig] = useState<{
    key: keyof Remission;
    direction: 'asc' | 'desc';
  }>({ key: 'hoscode', direction: 'asc' });
  
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editing, setEditing] = useState<EditState>({
    id: null,
    hoscode: '',
    hosname: '',
    isEditing: false,
    trained: '',
    ncds_remission: '',
    stopped_medication: '',
    reduced_1: '',
    reduced_2: '',
    reduced_3: '',
    reduced_4: '',
    reduced_5: '',
    reduced_6: '',
    reduced_7: '',
    reduced_8: '',
    reduced_n: '',
    same_medication: '',
    increased_medication: '',
    pending_evaluation: '',
    lost_followup: ''
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

  // Fetch data function
  const fetchRemissionData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('Fetching remission data from API...');
      const response = await fetch('/api/remission/hos', {
        cache: 'no-store',
        next: { revalidate: 0 }
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage = errorData?.details || errorData?.error || 'Failed to fetch data';
        console.error('API Error:', errorMessage);
        throw new Error(errorMessage);
      }
      
      const data = await response.json();
      
      if (!Array.isArray(data)) {
        console.error('Unexpected response format:', data);
        throw new Error('Invalid data format received from server');
      }
      
      console.log(`Successfully loaded ${data.length} remission records`);
      setRemissions(data);
      setLastUpdated(new Date().toLocaleString());
      
      return data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
      console.error('Error in fetchRemissionData:', errorMessage);
      setError(`เกิดข้อผิดพลาด: ${errorMessage}`);
      
      toast.error(`ไม่สามารถโหลดข้อมูลได้: ${errorMessage}`, {
        position: 'top-right',
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
      
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Initial data fetch
  useEffect(() => {
    fetchRemissionData();
  }, []);
  
  // Handle refresh
  const handleRefresh = () => {
    fetchRemissionData();
  };

  // Sort data
  const sortData = (data: Remission[]) => {
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
    remissions.forEach(remission => {
      if (remission.amp_name) {
        amphoes.add(remission.amp_name);
      }
    });
    return Array.from(amphoes).sort();
  }, [remissions]);

  // Filter and sort data
  const filteredAndSortedRemissions = useMemo(() => {
    let result = [...remissions];
    
    // Apply filters
    if (searchAmp) {
      result = result.filter(remission => 
        remission.amp_name === searchAmp
      );
    }
    
    if (searchHoscode) {
      const searchTerm = searchHoscode.toLowerCase();
      result = result.filter(remission => 
        remission.hoscode.toLowerCase().includes(searchTerm)
      );
    }
    
    if (searchHosname) {
      const searchTerm = searchHosname.toLowerCase();
      result = result.filter(remission => 
        remission.hosname.toLowerCase().includes(searchTerm)
      );
    }
    
    // Apply sorting
    return sortData(result);
  }, [remissions, searchAmp, searchHoscode, searchHosname, sortConfig]);

  // Handle edit start
  const handleEdit = (remission: Remission) => {
    setEditing({
      id: remission.id,
      hoscode: remission.hoscode,
      hosname: remission.hosname,
      isEditing: true,
      trained: remission.trained.toString(),
      ncds_remission: remission.ncds_remission.toString(),
      stopped_medication: remission.stopped_medication.toString(),
      reduced_1: remission.reduced_1.toString(),
      reduced_2: remission.reduced_2.toString(),
      reduced_3: remission.reduced_3.toString(),
      reduced_4: remission.reduced_4.toString(),
      reduced_5: remission.reduced_5.toString(),
      reduced_6: remission.reduced_6.toString(),
      reduced_7: remission.reduced_7.toString(),
      reduced_8: remission.reduced_8.toString(),
      reduced_n: remission.reduced_n.toString(),
      same_medication: remission.same_medication.toString(),
      increased_medication: remission.increased_medication.toString(),
      pending_evaluation: remission.pending_evaluation.toString(),
      lost_followup: remission.lost_followup.toString()
    });
    setIsEditModalOpen(true);
  };

  // Handle save
  const handleSave = async (id: number) => {
    try {
      const response = await fetch(`/api/remission/hos/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          trained: parseInt(editing.trained) || 0,
          ncds_remission: parseInt(editing.ncds_remission) || 0,
          stopped_medication: parseInt(editing.stopped_medication) || 0,
          reduced_1: parseInt(editing.reduced_1) || 0,
          reduced_2: parseInt(editing.reduced_2) || 0,
          reduced_3: parseInt(editing.reduced_3) || 0,
          reduced_4: parseInt(editing.reduced_4) || 0,
          reduced_5: parseInt(editing.reduced_5) || 0,
          reduced_6: parseInt(editing.reduced_6) || 0,
          reduced_7: parseInt(editing.reduced_7) || 0,
          reduced_8: parseInt(editing.reduced_8) || 0,
          reduced_n: parseInt(editing.reduced_n) || 0,
          same_medication: parseInt(editing.same_medication) || 0,
          increased_medication: parseInt(editing.increased_medication) || 0,
          pending_evaluation: parseInt(editing.pending_evaluation) || 0,
          lost_followup: parseInt(editing.lost_followup) || 0,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update record');
      }

      const updatedRemission = await response.json();
      
      // Update the UI with the updated record
      setRemissions(prev => 
        prev.map(r => 
          r.id === updatedRemission.id ? { ...r, ...updatedRemission } : r
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
        trained: '',
        ncds_remission: '',
        stopped_medication: '',
        reduced_1: '',
        reduced_2: '',
        reduced_3: '',
        reduced_4: '',
        reduced_5: '',
        reduced_6: '',
        reduced_7: '',
        reduced_8: '',
        reduced_n: '',
        same_medication: '',
        increased_medication: '',
        pending_evaluation: '',
        lost_followup: ''
      });
      
      // Add blinking effect to the updated row
      setBlinkingRows(prev => {
        const newSet = new Set(prev);
        newSet.add(updatedRemission.id);
        return newSet;
      });
      
      // Remove blinking effect after animation
      setTimeout(() => {
        setBlinkingRows(prev => {
          const newSet = new Set(prev);
          newSet.delete(updatedRemission.id);
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
      trained: '',
      ncds_remission: '',
      stopped_medication: '',
      reduced_1: '',
      reduced_2: '',
      reduced_3: '',
      reduced_4: '',
      reduced_5: '',
      reduced_6: '',
      reduced_7: '',
      reduced_8: '',
      reduced_n: '',
      same_medication: '',
      increased_medication: '',
      pending_evaluation: '',
      lost_followup: ''
    });
    setIsEditModalOpen(false);
  };

  // Handle input change for editable cells
  const handleInputChange = (field: keyof EditState, value: string) => {
    setEditing(prev => ({
      ...prev,
      [field]: value
    }));
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
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">Remission by Hospital</h1>
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
            href="/remission" 
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
            <label className="block text-sm font-medium text-gray-700 mb-1">ค้นหาตามรหัสหน่วยบริการ</label>
            <input
              type="text"
              value={searchHoscode}
              onChange={(e) => setSearchHoscode(e.target.value)}
              className="w-full p-2 border rounded-md"
              placeholder="รหัสหน่วยบริการ"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">ค้นหาตามชื่อหน่วยบริการ</label>
            <input
              type="text"
              value={searchHosname}
              onChange={(e) => setSearchHosname(e.target.value)}
              className="w-full p-2 border rounded-md"
              placeholder="ชื่อหน่วยบริการ"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">ค้นหาตามอำเภอ</label>
            <select
              value={searchAmp}
              onChange={(e) => setSearchAmp(e.target.value)}
              className="w-full p-2 border rounded-md"
            >
              <option value="">ทั้งหมด</option>
              {uniqueAmphoes.map(amp => (
                <option key={amp} value={amp}>{amp}</option>
              ))}
            </select>
          </div>
        </div>
        <div className="flex justify-end">
          <button
            onClick={handleClearFilters}
            className="px-4 py-2 text-sm font-medium text-green-800 bg-green-100 rounded-md hover:bg-green-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 border border-green-200 transition-colors flex items-center"
          >
            ล้างการค้นหา
          </button>
        </div>
      </div>

      {/* Data Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border border-gray-200 rounded-lg overflow-hidden">
          <thead className="bg-gray-50">
            <tr>
              <th 
                className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('hoscode')}
              >
                รหัส {getSortIndicator('hoscode')}
              </th>
              <th 
                className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('hosname')}
              >
                ชื่อหน่วยบริการ {getSortIndicator('hosname')}
              </th>
              <th 
                className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('amp_name')}
              >
                อำเภอ {getSortIndicator('amp_name')}
              </th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                อบรม
              </th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                NCDs Remission
              </th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                หยุดยา
              </th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                ลดยา 1-8
              </th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                ยาเท่าเดิม
              </th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                เพิ่มยา
              </th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                รอประเมิน
              </th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                ติดตามไม่ได้
              </th>
              <th 
                className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('updated_at')}
              >
                อัปเดตล่าสุด {getSortIndicator('updated_at')}
              </th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                แก้ไข
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {filteredAndSortedRemissions.map((remission) => (
              <tr 
                key={remission.id} 
                className={`${blinkingRows.has(remission.id) ? 'animate-pulse bg-blue-50' : ''} hover:bg-gray-50`}
              >
                <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {remission.hoscode}
                </td>
                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                  {remission.hosname}
                </td>
                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                  {remission.amp_name}
                </td>
                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500 text-right">
                  {remission.trained.toLocaleString()}
                </td>
                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500 text-right">
                  {remission.ncds_remission.toLocaleString()}
                </td>
                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500 text-right">
                  {remission.stopped_medication.toLocaleString()}
                </td>
                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500 text-right">
                  {(
                    remission.reduced_1 + remission.reduced_2 + remission.reduced_3 + 
                    remission.reduced_4 + remission.reduced_5 + remission.reduced_6 + 
                    remission.reduced_7 + remission.reduced_8
                  ).toLocaleString()}
                </td>
                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500 text-right">
                  {remission.same_medication.toLocaleString()}
                </td>
                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500 text-right">
                  {remission.increased_medication.toLocaleString()}
                </td>
                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500 text-right">
                  {remission.pending_evaluation.toLocaleString()}
                </td>
                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500 text-right">
                  {remission.lost_followup.toLocaleString()}
                </td>
                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                  {formatDate(remission.updated_at)}
                </td>
                <td className="px-4 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button
                    onClick={() => handleEdit(remission)}
                    className="text-blue-600 hover:text-blue-900"
                    title="Edit"
                  >
                    <PencilIcon className="h-5 w-5" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Edit Modal */}
      <Dialog 
        open={isEditModalOpen} 
        onClose={() => setIsEditModalOpen(false)}
        className="fixed inset-0 z-10 overflow-y-auto"
      >
        <div className="flex items-center justify-center min-h-screen">
          <div className="fixed inset-0 bg-black opacity-30" />
          
          <div className="relative bg-white rounded-lg max-w-4xl w-full mx-4 my-8 p-6 shadow-xl">
            <div className="flex justify-between items-center mb-4">
              <Dialog.Title className="text-xl font-semibold">
                แก้ไขข้อมูล Remission - {editing.hosname} ({editing.hoscode})
              </Dialog.Title>
              <button
                onClick={handleCancel}
                className="text-gray-500 hover:text-gray-700"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              {/* Column 1 */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">อบรม</label>
                  <input
                    type="number"
                    className="w-full p-2 border rounded-md"
                    value={editing.trained}
                    onChange={(e) => handleInputChange('trained', e.target.value)}
                    min="0"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">NCDs Remission</label>
                  <input
                    type="number"
                    className="w-full p-2 border rounded-md"
                    value={editing.ncds_remission}
                    onChange={(e) => handleInputChange('ncds_remission', e.target.value)}
                    min="0"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">หยุดยา</label>
                  <input
                    type="number"
                    className="w-full p-2 border rounded-md"
                    value={editing.stopped_medication}
                    onChange={(e) => handleInputChange('stopped_medication', e.target.value)}
                    min="0"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">ลดยา 1</label>
                  <input
                    type="number"
                    className="w-full p-2 border rounded-md"
                    value={editing.reduced_1}
                    onChange={(e) => handleInputChange('reduced_1', e.target.value)}
                    min="0"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">ลดยา 2</label>
                  <input
                    type="number"
                    className="w-full p-2 border rounded-md"
                    value={editing.reduced_2}
                    onChange={(e) => handleInputChange('reduced_2', e.target.value)}
                    min="0"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">ลดยา 3</label>
                  <input
                    type="number"
                    className="w-full p-2 border rounded-md"
                    value={editing.reduced_3}
                    onChange={(e) => handleInputChange('reduced_3', e.target.value)}
                    min="0"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">ลดยา 4</label>
                  <input
                    type="number"
                    className="w-full p-2 border rounded-md"
                    value={editing.reduced_4}
                    onChange={(e) => handleInputChange('reduced_4', e.target.value)}
                    min="0"
                  />
                </div>
              </div>
              
              {/* Column 2 */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">ลดยา 5</label>
                  <input
                    type="number"
                    className="w-full p-2 border rounded-md"
                    value={editing.reduced_5}
                    onChange={(e) => handleInputChange('reduced_5', e.target.value)}
                    min="0"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">ลดยา 6</label>
                  <input
                    type="number"
                    className="w-full p-2 border rounded-md"
                    value={editing.reduced_6}
                    onChange={(e) => handleInputChange('reduced_6', e.target.value)}
                    min="0"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">ลดยา 7</label>
                  <input
                    type="number"
                    className="w-full p-2 border rounded-md"
                    value={editing.reduced_7}
                    onChange={(e) => handleInputChange('reduced_7', e.target.value)}
                    min="0"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">ลดยา 8</label>
                  <input
                    type="number"
                    className="w-full p-2 border rounded-md"
                    value={editing.reduced_8}
                    onChange={(e) => handleInputChange('reduced_8', e.target.value)}
                    min="0"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">ลดยา N</label>
                  <input
                    type="number"
                    className="w-full p-2 border rounded-md"
                    value={editing.reduced_n}
                    onChange={(e) => handleInputChange('reduced_n', e.target.value)}
                    min="0"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">ยาเท่าเดิม</label>
                  <input
                    type="number"
                    className="w-full p-2 border rounded-md"
                    value={editing.same_medication}
                    onChange={(e) => handleInputChange('same_medication', e.target.value)}
                    min="0"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">เพิ่มยา</label>
                  <input
                    type="number"
                    className="w-full p-2 border rounded-md"
                    value={editing.increased_medication}
                    onChange={(e) => handleInputChange('increased_medication', e.target.value)}
                    min="0"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">รอประเมิน</label>
                  <input
                    type="number"
                    className="w-full p-2 border rounded-md"
                    value={editing.pending_evaluation}
                    onChange={(e) => handleInputChange('pending_evaluation', e.target.value)}
                    min="0"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">ติดตามไม่ได้</label>
                  <input
                    type="number"
                    className="w-full p-2 border rounded-md"
                    value={editing.lost_followup}
                    onChange={(e) => handleInputChange('lost_followup', e.target.value)}
                    min="0"
                  />
                </div>
              </div>
            </div>
            
            <div className="flex justify-end space-x-3 pt-4 border-t">
              <button
                type="button"
                onClick={handleCancel}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
              >
                ยกเลิก
              </button>
              <button
                type="button"
                onClick={() => editing.id && handleSave(editing.id)}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
              >
                บันทึก
              </button>
            </div>
          </div>
        </div>
      </Dialog>
      
      <ToastContainer position="top-right" autoClose={3000} />
    </div>
  );
}