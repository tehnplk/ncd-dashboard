'use client';

import Image from 'next/image';
import { useEffect, useState } from 'react';

interface CarbData {
  success: boolean;
  data: {
    total_target: number;
    total_carb: number;
    percentage: number;
  }
}

interface PreventionData {
  success: boolean;
  data: {
    total_volunteers: number;
    volunteers_registered: number;
    volunteers_percentage: number;
    total_personnel: number;
    personnel_registered: number;
    personnel_percentage: number;
    service_recipients: number;
    normal_population: number;
    risk_population: number;
    sick_population: number;
    // Add other fields if needed
  }
}

interface RemissionData {
  success: boolean;
  data: {
    total_ncds_remission: number;
    total_stopped_medication: number;
    total_reduced_1: number;
    total_reduced_2: number;
    total_reduced_3: number;
    total_reduced_4: number;
    total_reduced_5: number;
    total_reduced_6: number;
    total_reduced_7: number;
    total_reduced_8: number;
    total_reduced_n: number;
    total_same_medication: number;
    total_increased_medication: number;
    total_pending_evaluation: number;
    total_lost_followup: number;
  }
}

export default function Dashboard() {
  const [carbData, setCarbData] = useState<CarbData | null>(null);
  const [preventionData, setPreventionData] = useState<PreventionData | null>(null);
  const [remissionData, setRemissionData] = useState<RemissionData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);

        // Fetch all data in parallel
        const endpoints = [
          { name: 'carb', url: '/api/sum/carb' },
          { name: 'prevention', url: '/api/sum/prevention' },
          { name: 'remission', url: '/api/sum/remission' }
        ];

        // Define a type for the API response
        type ApiResponse =
          | { name: string; data: any; error?: never }
          | { name: string; error: string; data?: never };

        const responses: ApiResponse[] = await Promise.all(
          endpoints.map(async ({ name, url }) => {
            try {
              const res = await fetch(url);
              if (!res.ok) {
                throw new Error(`Failed to fetch ${name}: ${res.status} ${res.statusText}`);
              }
              const data = await res.json();
              console.log(`${name} response:`, data);
              return { name, data };
            } catch (error) {
              const errorMessage = error instanceof Error ? error.message : 'Unknown error';
              console.error(`Error fetching ${name}:`, errorMessage);
              return { name, error: errorMessage };
            }
          })
        );

        // Check for any errors
        const errors = responses.filter((r): r is { name: string; error: string } => 'error' in r);
        if (errors.length > 0) {
          throw new Error(`Failed to load data: ${errors.map(e => e.error).join(', ')}`);
        }

        // Set data from successful responses
        const responseMap = Object.fromEntries(
          responses
            .filter((r): r is { name: string; data: any } => 'data' in r)
            .map(({ name, data }) => [name, data])
        );

        console.log('All API responses:', responseMap);

        setCarbData(responseMap.carb);
        setPreventionData(responseMap.prevention);
        setRemissionData(responseMap.remission);
        setError(null);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Failed to load data. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('th-TH').format(num);
  };
  return (
    <div className="container mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold text-center mb-8">คนไทยห่างไกล NCDs จังหวัดพิษณุโลก</h1>

      {/* First Row - คลินิก NCDs รักษาหาย และ ลดค่าใช้จ่าย */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {/* คลินิก NCDs รักษาหาย Card */}
        <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-purple-500">
          <div className="flex items-center gap-2 mb-4">
            <div className="p-1.5 rounded-full bg-purple-100">
              <Image
                src="/icon/remission.png"
                alt="Remission"
                width={20}
                height={20}
                className="w-5 h-5"
              />
            </div>
            <h2 className="text-xl font-bold text-gray-800">คลินิก NCDs รักษาหาย</h2>
          </div>

          {isLoading ? (
            <div className="flex justify-center items-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
            </div>
          ) : error ? (
            <div className="text-red-500 text-center py-4">{error}</div>
          ) : (
            <div className="space-y-4">
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded border border-gray-100">
                <div className="flex items-center">
                  <div className="w-3 h-3 rounded-full bg-purple-500 mr-2"></div>
                  <span className="text-gray-700">ผู้ป่วยเข้าเกณฑ์</span>
                </div>
                <span className="font-bold text-purple-700">{formatNumber(remissionData?.data?.total_ncds_remission || 0)} คน</span>
              </div>

              <div className="flex justify-between items-center p-3 bg-gray-50 rounded border border-gray-100">
                <div className="flex items-center">
                  <div className="w-3 h-3 rounded-full bg-green-500 mr-2"></div>
                  <span className="text-gray-700">หยุดยาได้</span>
                </div>
                <span className="font-bold text-green-700">{formatNumber(remissionData?.data?.total_stopped_medication || 0)} คน</span>
              </div>

              <div className="flex justify-between items-center p-3 bg-gray-50 rounded border border-gray-100">
                <div className="flex items-center">
                  <div className="w-3 h-3 rounded-full bg-blue-500 mr-2"></div>
                  <span className="text-gray-700">ลดยาลง</span>
                </div>
                <span className="font-bold text-blue-700">
                  {formatNumber(
                    (remissionData?.data?.total_reduced_1 || 0) +
                    (remissionData?.data?.total_reduced_2 || 0) +
                    (remissionData?.data?.total_reduced_3 || 0) +
                    (remissionData?.data?.total_reduced_4 || 0) +
                    (remissionData?.data?.total_reduced_5 || 0) +
                    (remissionData?.data?.total_reduced_6 || 0) +
                    (remissionData?.data?.total_reduced_7 || 0) +
                    (remissionData?.data?.total_reduced_8 || 0) +
                    (remissionData?.data?.total_reduced_n || 0)
                  )} คน
                </span>
              </div>
            </div>
          )}
        </div>

        {/* ลดค่าใช้จ่าย Card */}
        <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-green-500">
          <div className="flex items-center gap-2 mb-4">
            <div className="p-1.5 rounded-full bg-green-100">
              <Image
                src="/icon/money.png"
                alt="Money"
                width={20}
                height={20}
                className="w-5 h-5"
              />
            </div>
            <h2 className="text-xl font-bold text-gray-800">ลดค่าใช้จ่าย</h2>
          </div>

          {isLoading ? (
            <div className="flex justify-center items-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500"></div>
            </div>
          ) : error ? (
            <div className="text-red-500 text-center py-4">{error}</div>
          ) : (
            <div className="space-y-2">
              <div className="p-2 bg-green-50 rounded border border-green-100">
                <div className="flex items-center text-xs text-gray-700">
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 mr-2 flex-shrink-0"></div>
                  <span>เข้าเกณฑ์ NCDs Remission <span className="font-medium">{formatNumber(remissionData?.data?.total_ncds_remission || 0)}</span> คน + หยุดยาได้ <span className="font-medium">{formatNumber(remissionData?.data?.total_stopped_medication || 0)}</span> คน = <span className="font-medium">{formatNumber((remissionData?.data?.total_ncds_remission || 0) + (remissionData?.data?.total_stopped_medication || 0))}</span> คน × <span className="font-medium">16,310</span> = <span className="font-bold text-green-700">{formatNumber(((remissionData?.data?.total_ncds_remission || 0) + (remissionData?.data?.total_stopped_medication || 0)) * 16310)} บาท</span></span>
                </div>
              </div>

              <div className="p-2 bg-green-50 rounded border border-green-100">
                <div className="flex items-center text-xs text-gray-700">
                  <div className="w-2.5 h-2.5 rounded-full bg-green-500 mr-2 flex-shrink-0"></div>
                  <span>หยุดยาได้ 1 ตัว <span className="font-medium">{formatNumber(remissionData?.data?.total_reduced_1 || 0)}</span> คน × <span className="font-medium">1,000</span> บาท = <span className="font-bold text-green-700">{formatNumber((remissionData?.data?.total_reduced_1 || 0) * 1000)} บาท</span></span>
                </div>
              </div>

              <div className="p-2 bg-green-50 rounded border border-green-100">
                <div className="flex items-center text-xs text-gray-700">
                  <div className="w-2.5 h-2.5 rounded-full bg-green-600 mr-2 flex-shrink-0"></div>
                  <span>หยุดยาได้ 2 ตัว <span className="font-medium">{formatNumber(remissionData?.data?.total_reduced_2 || 0)}</span> คน × <span className="font-medium">2,000</span> บาท = <span className="font-bold text-green-700">{formatNumber((remissionData?.data?.total_reduced_2 || 0) * 2000)} บาท</span></span>
                </div>
              </div>

              <div className="p-2 bg-green-50 rounded border border-green-100">
                <div className="flex items-center text-xs text-gray-700">
                  <div className="w-2.5 h-2.5 rounded-full bg-green-700 mr-2 flex-shrink-0"></div>
                  <span>หยุดยาได้ 3 ตัว <span className="font-medium">{formatNumber(remissionData?.data?.total_reduced_3 || 0)}</span> คน × <span className="font-medium">3,000</span> บาท = <span className="font-bold text-green-700">{formatNumber((remissionData?.data?.total_reduced_3 || 0) * 3000)} บาท</span></span>
                </div>
              </div>

              <div className="pt-2 border-t border-green-200">
                <div className="flex justify-between items-center">
                  <span className="font-semibold text-gray-800">รวมประหยัดได้:</span>
                  <span className="text-lg font-bold text-green-600">
                    {formatNumber(
                      ((remissionData?.data?.total_ncds_remission || 0) + (remissionData?.data?.total_stopped_medication || 0)) * 16310 +
                      (remissionData?.data?.total_reduced_1 || 0) * 1000 +
                      (remissionData?.data?.total_reduced_2 || 0) * 2000 +
                      (remissionData?.data?.total_reduced_3 || 0) * 3000
                    )} บาท/ปี
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Second Row - นับคาร์บ และ คัดกรอง NCDs */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* นับคาร์บ Card */}
        <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-blue-500">
          <div className="flex items-center gap-2 mb-4">
            <div className="p-1.5 rounded-full bg-blue-100">
              <Image
                src="/icon/rice.png"
                alt="Rice"
                width={20}
                height={20}
                className="w-5 h-5"
              />
            </div>
            <h2 className="text-xl font-bold text-gray-800">นับคาร์บ</h2>
          </div>

          {isLoading ? (
            <div className="flex justify-center items-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            </div>
          ) : error ? (
            <div className="text-red-500 text-center py-4">{error}</div>
          ) : (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">เป้าหมาย</span>
                <span className="font-bold text-gray-700">{formatNumber(carbData?.data?.total_target || 0)} คน</span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-gray-600">นับคาร์บ</span>
                <span className="font-bold text-blue-700">{formatNumber(carbData?.data?.total_carb || 0)} คน</span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-gray-600">ร้อยละ</span>
                <span className="text-2xl font-bold text-green-600">
                  {isLoading ? '...' : `${carbData?.data?.percentage?.toFixed(2) || '0.00'}%`}
                </span>
              </div>

              {/* Progress bar */}
              <div className="w-full bg-gray-200 rounded-full h-2.5 mt-2">
                <div
                  className="bg-blue-500 h-2.5 rounded-full"
                  style={{ width: `${carbData?.data?.percentage || 0}%` }}
                ></div>
              </div>
            </div>
          )}
        </div>

        {/* คัดกรอง NCDs Card */}
        <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-green-500">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-full bg-green-100">
                <Image
                  src="/icon/medical-report.png"
                  alt="Medical Report"
                  width={20}
                  height={20}
                  className="w-5 h-5"
                />
              </div>
              <h2 className="text-xl font-bold text-gray-800">คัดกรอง NCDs</h2>
            </div>
            <span className="text-2xl font-bold text-green-600">
              {isLoading ? '...' : formatNumber(preventionData?.data?.service_recipients || 0)} คน
            </span>
          </div>

          {isLoading ? (
            <div className="flex justify-center items-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500"></div>
            </div>
          ) : error ? (
            <div className="text-red-500 text-center py-4">{error}</div>
          ) : (
            <div className="space-y-4">
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded border border-gray-100">
                <div className="flex items-center">
                  <div className="w-3 h-3 rounded-full bg-emerald-500 mr-2"></div>
                  <span className="text-gray-700">ปกติ</span>
                </div>
                <span className="font-bold text-emerald-700">{formatNumber(preventionData?.data?.normal_population || 0)} คน</span>
              </div>

              <div className="flex justify-between items-center p-3 bg-gray-50 rounded border border-gray-100">
                <div className="flex items-center">
                  <div className="w-3 h-3 rounded-full bg-yellow-500 mr-2"></div>
                  <span className="text-gray-700">เสี่ยง</span>
                </div>
                <span className="font-bold text-yellow-600">{formatNumber(preventionData?.data?.risk_population || 0)} คน</span>
              </div>

              <div className="flex justify-between items-center p-3 bg-gray-50 rounded border border-gray-100">
                <div className="flex items-center">
                  <div className="w-3 h-3 rounded-full bg-red-500 mr-2"></div>
                  <span className="text-gray-700">ป่วย</span>
                </div>
                <span className="font-bold text-red-600">{formatNumber(preventionData?.data?.sick_population || 0)} คน</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
