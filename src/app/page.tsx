'use client';

import { useState, useEffect } from 'react';
import { FiUsers, FiActivity, FiCheckCircle, FiAlertCircle, FiAlertTriangle, FiAward, FiBarChart2, FiFileText, FiUser, FiPlus, FiX } from 'react-icons/fi';

interface SubDistrictData {
  name: string;     // ชื่ออำเภอ
  value: number;    // ค่าคาร์บ
  percentage: number; // ร้อยละ
}

interface SummaryData {
  carbPercentage: number;
  screenedPercentage: number;
  normalCount: number;
  riskCount: number;
  sickCount: number;
  trainedCount: number;
  trainedPercentage: number;
  // New metrics
  recoveredCount: number;
  totalWeightLoss: number;
  avgWeightLoss: number;
  stoppedMedication: number; // จำนวนผู้ป่วยที่หยุดยาได้
  subDistricts: SubDistrictData[]; // ข้อมูลรายอำเภอ
}

export default function Dashboard() {
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState<SummaryData | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Mock data - in a real app, you would fetch this from your API
    const fetchSummaryData = async () => {
      try {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Mock data - replace with actual API call
        const mockData: SummaryData = {
          carbPercentage: 78.5,
          screenedPercentage: 85.2,
          normalCount: 12540,
          riskCount: 8560,
          sickCount: 3200,
          trainedCount: 7500,
          trainedPercentage: 65.8,
          // New mock data
          recoveredCount: 1240,
          totalWeightLoss: 3250.5,
          avgWeightLoss: 2.6,
          stoppedMedication: 850, // จำนวนผู้ป่วยที่หยุดยาได้
          subDistricts: [
            { name: 'เมืองพิษณุโลก', value: 88.5, percentage: 16.2 },
            { name: 'นครไทย', value: 85.7, percentage: 15.8 },
            { name: 'ชาติตระการ', value: 84.2, percentage: 15.5 },
            { name: 'บางระกำ', value: 82.9, percentage: 15.2 },
            { name: 'บางกระทุ่ม', value: 81.5, percentage: 14.9 },
            { name: 'วัดโบสถ์', value: 80.1, percentage: 14.6 },
            { name: 'วังทอง', value: 78.8, percentage: 14.3 },
            { name: 'เนินมะปราง', value: 77.4, percentage: 14.0 },
            { name: 'ชาติตระการ', value: 76.2, percentage: 13.8 }
          ]
        };
        
        setSummary(mockData);
      } catch (err) {
        setError('Failed to load summary data');
        console.error('Error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchSummaryData();
  }, []);

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
          {error}
        </div>
      </div>
    );
  }

  if (!summary) return null;

  return (
    <>
      {/* Mockup placeholder */}
      <div className="container mx-auto px-4 py-6">
      
      {/* Summary Cards */}
      {/* กลับเป็นปกติ, น้ำหนัดรวมลดลง(กก) ,นำหนักลดลงเฉลี่ย(คน/กก) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* นับคาร์บ(%) */}
        <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-blue-500">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center">
              <div className="p-1 rounded-full bg-blue-100 text-blue-600 text-xl mr-2">
                🍚
              </div>
              <p className="text-gray-500 text-base font-medium">นับคาร์บ</p>
            </div>
            <p className="text-2xl font-bold">{summary.carbPercentage}%</p>
          </div>
          <div className="mt-3 pt-3 border-t border-gray-100">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {summary.subDistricts.map((district, index) => (
                <div key={index} className="bg-gray-50 p-2 rounded text-center">
                  <p className="text-xs text-gray-600 truncate">{district.name}</p>
                  <p className="text-sm font-semibold mt-1">{district.value}%</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* คัดกรอง(%) */}
        <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-green-500">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center">
              <div className="p-1 rounded-full bg-green-100 text-green-600 text-xl mr-2 relative">
                <FiUser size={16} className="relative z-10" />
                <FiPlus size={10} className="absolute -bottom-0.5 -right-0.5 text-green-600 font-bold" />
              </div>
              <p className="text-gray-500 text-base font-medium">คัดกรอง</p>
            </div>
            <p className="text-2xl font-bold">{summary.screenedPercentage}%</p>
          </div>
          <div className="mt-3 pt-3 border-t border-gray-100">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {summary.subDistricts.map((district, index) => (
                <div key={`screened-${index}`} className="bg-gray-50 p-2 rounded text-center">
                  <p className="text-xs text-gray-600 truncate">{district.name}</p>
                  <p className="text-sm font-semibold mt-1">{district.percentage}%</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ผลการคัดกรอง Section - Vertical Layout */}
        <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-purple-500">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-gray-600 text-base font-semibold">ผลการคัดกรอง</p>
            </div>
            <div className="p-2 rounded-full bg-purple-100 text-purple-600">
              <FiFileText size={20} />
            </div>
          </div>
          <div className="space-y-3">
            {/* ปกติ */}
            <div className="flex justify-between items-center p-3 bg-gray-50 rounded border border-gray-100">
              <div className="flex items-center">
                <div className="w-4 h-4 rounded-full bg-emerald-500 mr-3"></div>
                <span className="text-lg font-medium text-gray-800">ปกติ</span>
              </div>
              <span className="font-bold text-lg">{summary.normalCount.toLocaleString()}</span>
            </div>

            {/* เสี่ยง */}
            <div className="flex justify-between items-center p-3 bg-gray-50 rounded border border-gray-100">
              <div className="flex items-center">
                <div className="w-4 h-4 rounded-full bg-yellow-500 mr-3"></div>
                <span className="text-lg font-medium text-gray-800">เสี่ยง</span>
              </div>
              <span className="font-bold text-lg">{summary.riskCount.toLocaleString()}</span>
            </div>

            {/* ป่วย */}
            <div className="flex justify-between items-center p-3 bg-gray-50 rounded border border-gray-100">
              <div className="flex items-center">
                <div className="w-4 h-4 rounded-full bg-red-500 mr-3"></div>
                <span className="text-lg font-medium text-gray-800">ป่วย</span>
              </div>
              <span className="font-bold text-lg">{summary.sickCount.toLocaleString()}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Metrics Row - 3 Columns */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
        {/* อบรมปรับเปลี่ยนพฤติกรรม(คน) */}
        <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-indigo-500">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center">
              <div className="p-1 rounded-full bg-indigo-100 text-indigo-600 text-xl mr-2">
                <FiUsers size={18} />
              </div>
              <p className="text-gray-500 text-base font-medium">อบรมปรับเปลี่ยนพฤติกรรม</p>
            </div>
            <p className="text-2xl font-bold">
              {summary.trainedCount.toLocaleString()} <span className="text-lg">คน</span>
            </p>
          </div>
          <div className="mt-3 pt-3 border-t border-gray-100">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {summary.subDistricts.map((district, index) => (
                <div key={`trained-${index}`} className="bg-indigo-50 p-2 rounded text-center">
                  <p className="text-xs text-indigo-600 truncate">{district.name}</p>
                  <p className="text-sm font-semibold mt-1 text-indigo-800">{district.value}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
        
        {/* กลับเป็นปกติ(คน) */}
        <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-teal-500">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center">
              <div className="p-1 rounded-full bg-teal-100 text-teal-600 text-xl mr-2">
                <FiCheckCircle size={18} />
              </div>
              <p className="text-gray-500 text-base font-medium">กลับเป็นปกติ</p>
            </div>
            <p className="text-2xl font-bold">
              {summary.recoveredCount.toLocaleString()} <span className="text-lg">คน</span>
            </p>
          </div>
          <div className="mt-3 pt-3 border-t border-gray-100">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {summary.subDistricts.map((district, index) => (
                <div key={`recovered-${index}`} className="bg-teal-50 p-2 rounded text-center">
                  <p className="text-xs text-teal-600 truncate">{district.name}</p>
                  <p className="text-sm font-semibold mt-1 text-teal-800">{district.value}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
        
        {/* น้ำหนักลดลง */}
        <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-amber-500">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <div className="p-1 rounded-full bg-amber-100 text-amber-600 text-xl mr-2">
                ⚖️
              </div>
              <p className="text-gray-600 text-base font-semibold">น้ำหนักลดลง</p>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            {/* รวม */}
            <div className="bg-amber-50 p-3 rounded-lg">
              <p className="text-amber-600 text-sm font-medium">รวม</p>
              <p className="text-xl font-bold mt-1">
                {summary.totalWeightLoss.toLocaleString()} <span className="text-base">กก.</span>
              </p>
            </div>
            
            {/* เฉลี่ย */}
            <div className="bg-amber-50 p-3 rounded-lg">
              <p className="text-amber-600 text-sm font-medium">เฉลี่ย</p>
              <p className="text-xl font-bold mt-1">
                {summary.avgWeightLoss.toFixed(1)} <span className="text-base">กก./คน</span>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Medication Status Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
        {/* จำนวนผู้ป่วยที่รับยาเท่าเดิม */}
        <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-blue-500">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center">
              <div className="p-1 rounded-full bg-blue-100 text-blue-600 text-xl mr-2">
                <FiCheckCircle size={18} />
              </div>
              <p className="text-gray-500 text-base font-medium">จำนวนผู้ป่วยที่รับยาเท่าเดิม</p>
            </div>
            <p className="text-2xl font-bold">
              {Math.floor(summary.sickCount * 0.6).toLocaleString()} <span className="text-lg">คน</span>
            </p>
          </div>
          <div className="mt-3 pt-3 border-t border-gray-100">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {summary.subDistricts.map((district, index) => (
                <div key={`same-meds-${index}`} className="bg-blue-50 p-2 rounded text-center">
                  <p className="text-xs text-blue-600 truncate">{district.name}</p>
                  <p className="text-sm font-semibold mt-1 text-blue-800">
                    {Math.floor(district.value * 0.6)}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* จำนวนผู้ป่วยที่ต้องเพิ่มยา */}
        <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-orange-500">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center">
              <div className="p-1 rounded-full bg-orange-100 text-orange-600 text-xl mr-2">
                <FiPlus size={18} />
              </div>
              <p className="text-gray-500 text-base font-medium">จำนวนผู้ป่วยที่ต้องเพิ่มยา</p>
            </div>
            <p className="text-2xl font-bold">
              {Math.floor(summary.sickCount * 0.4).toLocaleString()} <span className="text-lg">คน</span>
            </p>
          </div>
          <div className="mt-3 pt-3 border-t border-gray-100">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {summary.subDistricts.map((district, index) => (
                <div key={`increase-meds-${index}`} className="bg-orange-50 p-2 rounded text-center">
                  <p className="text-xs text-orange-600 truncate">{district.name}</p>
                  <p className="text-sm font-semibold mt-1 text-orange-800">
                    {Math.floor(district.value * 0.4)}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* หยุดยา */}
        <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-red-500">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center">
              <div className="p-1 rounded-full bg-red-100 text-red-600 text-xl mr-2">
                <FiX size={18} />
              </div>
              <p className="text-gray-500 text-base font-medium">หยุดยา</p>
            </div>
            <p className="text-2xl font-bold">
              {summary.stoppedMedication.toLocaleString()} <span className="text-lg">คน</span>
            </p>
          </div>
          <div className="mt-3 pt-3 border-t border-gray-100">
            <div className="grid grid-cols-3 gap-2">
              {[1, 2, 3, 4, 5, 6, 7, 8].map((num) => (
                <div key={`stop-${num}`} className="bg-red-50 p-2 rounded text-center">
                  <p className="text-xs text-red-600">หยุด {num} ตัว</p>
                  <p className="text-sm font-semibold mt-1 text-red-800">
                    {Math.floor(summary.stoppedMedication * (0.1 * (10 - num))).toLocaleString()}
                  </p>
                </div>
              ))}
              <div className="bg-red-50 p-2 rounded text-center">
                <p className="text-xs text-red-600">หยุด &gt;8 ตัว</p>
                <p className="text-sm font-semibold mt-1 text-red-800">
                  {Math.floor(summary.stoppedMedication * 0.1).toLocaleString()}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    </>
  );
}
