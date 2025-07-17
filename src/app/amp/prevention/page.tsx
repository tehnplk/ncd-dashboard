'use client'

import { useState, useEffect } from 'react'
import { PencilIcon } from '@heroicons/react/24/outline'
import { useAuth } from '../../../contexts/AuthContext'
import Image from 'next/image'

interface PreventionAmp {
  id: number
  amp_code: string
  amp_name: string
  total_volunteers: number
  volunteers_registered: number
  volunteers_percentage: number
  total_personnel: number
  personnel_registered: number
  personnel_percentage: number
  service_recipients: number
  normal_population: number
  risk_population: number
  sick_population: number
  risk_trained: number
  risk_to_normal: number
  weight_reduced_0_1: number
  weight_reduced_1_2: number
  weight_reduced_2_3: number
  weight_reduced_3_4: number
  weight_reduced_4_5: number
  weight_reduced_over_5: number
  updated_at: string
}

type SortField = keyof PreventionAmp
type SortDirection = 'asc' | 'desc'

export default function PreventionAmpPage() {
  const { isLoggedIn } = useAuth()
  const [data, setData] = useState<PreventionAmp[]>([])
  const [loading, setLoading] = useState(true)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editData, setEditData] = useState<Partial<PreventionAmp>>({})
  const [sortField, setSortField] = useState<SortField>('amp_code')
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc')
  const [editingCell, setEditingCell] = useState<{ id: string, field: keyof PreventionAmp } | null>(null)


  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const response = await fetch('/api/amp/prevention')
      const result = await response.json()
      setData(result)
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (item: PreventionAmp) => {
    setEditingId(item.amp_code)
    setEditData(item)
  }

  const handleSave = async () => {
    if (!editingId) return

    try {
      const response = await fetch(`/api/amp/prevention/${editingId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(editData),
      })

      if (response.ok) {
        await fetchData()
        setEditingId(null)
        setEditData({})
      }
    } catch (error) {
      console.error('Error updating data:', error)
    }
  }

  const handleCancel = () => {
    setEditingId(null)
    setEditData({})
  }

  const handleCellClick = (item: PreventionAmp, field: keyof PreventionAmp) => {
    if (!isLoggedIn) return // Prevent editing if not logged in
    // Only allow editing of numeric fields (exclude id, amp_code, amp_name, updated_at, and percentage fields which are auto-calculated)
    const editableFields = ['total_volunteers', 'volunteers_registered', 'total_personnel', 'personnel_registered', 'service_recipients', 'normal_population', 'risk_population', 'sick_population', 'risk_trained', 'risk_to_normal', 'weight_reduced_0_1', 'weight_reduced_1_2', 'weight_reduced_2_3', 'weight_reduced_3_4', 'weight_reduced_4_5', 'weight_reduced_over_5']
    if (editableFields.includes(field as string)) {
      setEditingCell({ id: item.amp_code, field })
    }
  }

  const handleCellSave = async (item: PreventionAmp, field: keyof PreventionAmp, value: number) => {
    try {
      // Create updated item with the new value
      const updatedItem = { ...item, [field]: value }

      // Auto-calculate percentages when related fields are updated
      if (field === 'total_volunteers' || field === 'volunteers_registered') {
        if (updatedItem.total_volunteers > 0) {
          updatedItem.volunteers_percentage = (updatedItem.volunteers_registered / updatedItem.total_volunteers) * 100
        } else {
          updatedItem.volunteers_percentage = 0.00
        }
      }

      if (field === 'total_personnel' || field === 'personnel_registered') {
        if (updatedItem.total_personnel > 0) {
          updatedItem.personnel_percentage = (updatedItem.personnel_registered / updatedItem.total_personnel) * 100
        } else {
          updatedItem.personnel_percentage = 0.00
        }
      }

      if (field === 'risk_trained' || field === 'risk_to_normal') {
        if (field === 'risk_trained' && updatedItem.risk_trained > 0) {
          // Don't let risk_to_normal exceed risk_trained
          if (updatedItem.risk_to_normal > updatedItem.risk_trained) {
            updatedItem.risk_to_normal = updatedItem.risk_trained
          }
        } else if (field === 'risk_to_normal' && updatedItem.risk_trained > 0) {
          // Don't let risk_to_normal exceed risk_trained
          if (updatedItem.risk_to_normal > updatedItem.risk_trained) {
            updatedItem.risk_to_normal = updatedItem.risk_trained
          }
        }
      }

      const response = await fetch(`/api/amp/prevention/${item.amp_code}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedItem),
      })

      if (response.ok) {
        await fetchData()
        setEditingCell(null)
      }
    } catch (error) {
      console.error('Error updating data:', error)
      setEditingCell(null)
    }
  }

  const handleCellBlur = (item: PreventionAmp, field: keyof PreventionAmp, value: string, isFloat = false) => {
    const numValue = isFloat ? parseFloat(value) || 0 : parseInt(value) || 0
    if (numValue !== item[field]) {
      handleCellSave(item, field, numValue)
    } else {
      setEditingCell(null)
    }
  }

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortDirection('asc')
    }
  }

  // Sort the data
  const sortedData = [...data].sort((a, b) => {
    let aValue = a[sortField]
    let bValue = b[sortField]

    if (typeof aValue === 'string') {
      aValue = aValue.toLowerCase()
      bValue = (bValue as string).toLowerCase()
    }

    if (sortDirection === 'asc') {
      return aValue < bValue ? -1 : aValue > bValue ? 1 : 0
    } else {
      return aValue > bValue ? -1 : aValue < bValue ? 1 : 0
    }
  })

  const getSortIcon = (field: SortField) => {
    if (sortField !== field) return '↕️'
    return sortDirection === 'asc' ? '↑' : '↓'
  }

  const renderEditableCell = (item: PreventionAmp, field: keyof PreventionAmp, value: number, isFloat = false) => {
    const editableFields = ['total_volunteers', 'volunteers_registered', 'total_personnel', 'personnel_registered', 'service_recipients', 'normal_population', 'risk_population', 'sick_population', 'risk_trained', 'risk_to_normal', 'weight_reduced_0_1', 'weight_reduced_1_2', 'weight_reduced_2_3', 'weight_reduced_3_4', 'weight_reduced_4_5', 'weight_reduced_over_5']

    if (editingCell?.id === item.amp_code && editingCell?.field === field) {
      return (
        <input
          type="number"
          step={isFloat ? "0.01" : "1"}
          defaultValue={value}
          onBlur={(e) => handleCellBlur(item, field, e.target.value, isFloat)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              handleCellBlur(item, field, e.currentTarget.value, isFloat)
            }
            if (e.key === 'Escape') {
              setEditingCell(null)
            }
          }}
          className="w-20 px-2 py-1 border border-blue-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          autoFocus
        />
      )
    }

    if (editableFields.includes(field as string)) {
      return (
        <span
          onClick={() => handleCellClick(item, field)}
          className={isLoggedIn ? "cursor-pointer hover:bg-blue-50 px-2 py-1 rounded" : "px-2 py-1 text-gray-500"}
        >
          {isFloat ? value.toFixed(2) : value.toLocaleString()}
        </span>
      )
    }

    return isFloat ? value.toFixed(2) : value.toLocaleString()
  }

  // Calculate totals for the summary cards
  const totalServiceRecipients = data.reduce((sum, item) => sum + item.service_recipients, 0)
  const totalNormalPopulation = data.reduce((sum, item) => sum + item.normal_population, 0)
  const totalRiskPopulation = data.reduce((sum, item) => sum + item.risk_population, 0)
  const totalSickPopulation = data.reduce((sum, item) => sum + item.sick_population, 0)
  const totalRiskTrained = data.reduce((sum, item) => sum + item.risk_trained, 0)
  const totalRiskToNormal = data.reduce((sum, item) => sum + item.risk_to_normal, 0)
  const totalWeightReduced01 = data.reduce((sum, item) => sum + item.weight_reduced_0_1, 0)
  const totalWeightReduced12 = data.reduce((sum, item) => sum + item.weight_reduced_1_2, 0)
  const totalWeightReduced23 = data.reduce((sum, item) => sum + item.weight_reduced_2_3, 0)
  const totalWeightReduced34 = data.reduce((sum, item) => sum + item.weight_reduced_3_4, 0)
  const totalWeightReduced45 = data.reduce((sum, item) => sum + item.weight_reduced_4_5, 0)
  const totalWeightReducedOver5 = data.reduce((sum, item) => sum + item.weight_reduced_over_5, 0)

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('th-TH').format(num)
  }

  if (loading) {
    return <div className="p-6">Loading...</div>
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">ผลการดำเนินงาน NCD Prevention</h1>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
        {/* คัดกรอง NCDs Summary Card */}
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
              {formatNumber(totalServiceRecipients)} คน
            </span>
          </div>

          <div className="space-y-4">
            <div className="flex justify-between items-center p-3 bg-gray-50 rounded border border-gray-100">
              <div className="flex items-center">
                <div className="w-3 h-3 rounded-full bg-emerald-500 mr-2"></div>
                <span className="text-gray-700">ปกติ</span>
              </div>
              <span className="font-bold text-emerald-700">{formatNumber(totalNormalPopulation)} คน</span>
            </div>

            <div className="flex justify-between items-center p-3 bg-gray-50 rounded border border-gray-100">
              <div className="flex items-center">
                <div className="w-3 h-3 rounded-full bg-yellow-500 mr-2"></div>
                <span className="text-gray-700">เสี่ยง</span>
              </div>
              <span className="font-bold text-yellow-600">{formatNumber(totalRiskPopulation)} คน</span>
            </div>

            <div className="flex justify-between items-center p-3 bg-gray-50 rounded border border-gray-100">
              <div className="flex items-center">
                <div className="w-3 h-3 rounded-full bg-red-500 mr-2"></div>
                <span className="text-gray-700">ป่วย</span>
              </div>
              <span className="font-bold text-red-600">{formatNumber(totalSickPopulation)} คน</span>
            </div>
          </div>
        </div>

        {/* อบรมปรับเปลี่ยนพฤติกรรม Summary Card */}
        <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-blue-500">
          <div className="flex items-center gap-2 mb-4">
            <div className="p-1.5 rounded-full bg-blue-100">
              <Image
                src="/icon/workshop.png"
                alt="Workshop"
                width={20}
                height={20}
                className="w-5 h-5"
              />
            </div>
            <h2 className="text-xl font-bold text-gray-800">อบรมปรับเปลี่ยนพฤติกรรม</h2>
          </div>

          <div className="space-y-4">
            <div className="flex justify-between items-center p-3 bg-gray-50 rounded border border-gray-100">
              <div className="flex items-center">
                <div className="w-3 h-3 rounded-full bg-blue-500 mr-2"></div>
                <span className="text-gray-700">อบรมกลุ่มเสี่ยง</span>
              </div>
              <span className="font-bold text-blue-700">{formatNumber(totalRiskTrained)} คน</span>
            </div>

            <div className="flex justify-between items-center p-3 bg-gray-50 rounded border border-gray-100">
              <div className="flex items-center">
                <div className="w-3 h-3 rounded-full bg-green-500 mr-2"></div>
                <span className="text-gray-700">กลับเป็นปกติ</span>
              </div>
              <span className="font-bold text-green-700">{formatNumber(totalRiskToNormal)} คน</span>
            </div>
          </div>
        </div>

        {/* น้ำหนักลดลง Summary Card */}
        <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-purple-500">
          <div className="flex items-center gap-2 mb-4">
            <div className="p-1.5 rounded-full bg-purple-100">
              <Image
                src="/icon/bw-scale.png"
                alt="Weight Scale"
                width={20}
                height={20}
                className="w-5 h-5"
              />
            </div>
            <h2 className="text-xl font-bold text-gray-800">น้ำหนักลดลง</h2>
          </div>

          <div className="space-y-3">
            {/* Row 1: 0-1 กก. และ 1-2 กก. */}
            <div className="grid grid-cols-2 gap-2">
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded border border-gray-100">
                <div className="flex items-center">
                  <div className="w-3 h-3 rounded-full bg-indigo-400 mr-2"></div>
                  <span className="text-gray-700 text-sm">0-1 กก.</span>
                </div>
                <span className="font-bold text-indigo-600 text-sm">{formatNumber(totalWeightReduced01)} คน</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded border border-gray-100">
                <div className="flex items-center">
                  <div className="w-3 h-3 rounded-full bg-blue-500 mr-2"></div>
                  <span className="text-gray-700 text-sm">1-2 กก.</span>
                </div>
                <span className="font-bold text-blue-600 text-sm">{formatNumber(totalWeightReduced12)} คน</span>
              </div>
            </div>

            {/* Row 2: 2-3 กก. และ 3-4 กก. */}
            <div className="grid grid-cols-2 gap-2">
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded border border-gray-100">
                <div className="flex items-center">
                  <div className="w-3 h-3 rounded-full bg-green-500 mr-2"></div>
                  <span className="text-gray-700 text-sm">2-3 กก.</span>
                </div>
                <span className="font-bold text-green-600 text-sm">{formatNumber(totalWeightReduced23)} คน</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded border border-gray-100">
                <div className="flex items-center">
                  <div className="w-3 h-3 rounded-full bg-orange-500 mr-2"></div>
                  <span className="text-gray-700 text-sm">3-4 กก.</span>
                </div>
                <span className="font-bold text-orange-600 text-sm">{formatNumber(totalWeightReduced34)} คน</span>
              </div>
            </div>

            {/* Row 3: 4-5 กก. และ >5 กก. */}
            <div className="grid grid-cols-2 gap-2">
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded border border-gray-100">
                <div className="flex items-center">
                  <div className="w-3 h-3 rounded-full bg-red-500 mr-2"></div>
                  <span className="text-gray-700 text-sm">4-5 กก.</span>
                </div>
                <span className="font-bold text-red-600 text-sm">{formatNumber(totalWeightReduced45)} คน</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded border border-gray-100">
                <div className="flex items-center">
                  <div className="w-3 h-3 rounded-full bg-purple-600 mr-2"></div>
                  <span className="text-gray-700 text-sm">{'>'} 5 กก.</span>
                </div>
                <span className="font-bold text-purple-700 text-sm">{formatNumber(totalWeightReducedOver5)} คน</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border border-dashed border-gray-400">
          <thead className="bg-gray-50">
            <tr>
              <th rowSpan={2} className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase cursor-pointer hover:bg-gray-100 border-r border-gray-300" onClick={() => handleSort('amp_code')}>รหัส {getSortIcon('amp_code')}</th>
              <th rowSpan={2} className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase cursor-pointer hover:bg-gray-100 border-r border-gray-300" onClick={() => handleSort('amp_name')}>อำเภอ {getSortIcon('amp_name')}</th>
              <th rowSpan={2} className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase cursor-pointer hover:bg-gray-100 border-r border-gray-300" onClick={() => handleSort('total_volunteers')}>จำนวนอสม. {getSortIcon('total_volunteers')}</th>
              <th rowSpan={2} className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase cursor-pointer hover:bg-gray-100 border-r border-gray-300" onClick={() => handleSort('volunteers_registered')}>อสม.สมัคร Provider {getSortIcon('volunteers_registered')}</th>
              <th rowSpan={2} className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase cursor-pointer hover:bg-gray-100 border-r border-gray-300" onClick={() => handleSort('volunteers_percentage')}>ร้อยละ อสม. {getSortIcon('volunteers_percentage')}</th>
              <th rowSpan={2} className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase cursor-pointer hover:bg-gray-100 border-r border-gray-300" onClick={() => handleSort('total_personnel')}>จำนวนบุคลากร {getSortIcon('total_personnel')}</th>
              <th rowSpan={2} className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase cursor-pointer hover:bg-gray-100 border-r border-gray-300" onClick={() => handleSort('personnel_registered')}>บุคลากรสมัคร Provider {getSortIcon('personnel_registered')}</th>
              <th rowSpan={2} className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase cursor-pointer hover:bg-gray-100 border-r border-gray-300" onClick={() => handleSort('personnel_percentage')}>ร้อยละ บุคลากร {getSortIcon('personnel_percentage')}</th>
              <th rowSpan={2} className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase cursor-pointer hover:bg-gray-100 border-r border-gray-300" onClick={() => handleSort('service_recipients')}>ผู้เข้ารับบริการ {getSortIcon('service_recipients')}</th>
              <th colSpan={3} className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase border-r border-gray-300 bg-blue-50">จำนวนปชก.ที่ได้รับการคัดกรองแยกหรือประเมิน</th>
              <th rowSpan={2} className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase cursor-pointer hover:bg-gray-100 border-r border-gray-300" onClick={() => handleSort('risk_trained')}>กลุ่มเสี่ยงอบรม {getSortIcon('risk_trained')}</th>
              <th rowSpan={2} className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase cursor-pointer hover:bg-gray-100 border-r border-gray-300" onClick={() => handleSort('risk_to_normal')}>เสี่ยง→ปกติ {getSortIcon('risk_to_normal')}</th>
              <th rowSpan={2} className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase cursor-pointer hover:bg-gray-100 border-r border-gray-300" onClick={() => handleSort('weight_reduced_0_1')}>ลด 0-1 kg {getSortIcon('weight_reduced_0_1')}</th>
              <th rowSpan={2} className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase cursor-pointer hover:bg-gray-100 border-r border-gray-300" onClick={() => handleSort('weight_reduced_1_2')}>ลด 1-2 kg {getSortIcon('weight_reduced_1_2')}</th>
              <th rowSpan={2} className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase cursor-pointer hover:bg-gray-100 border-r border-gray-300" onClick={() => handleSort('weight_reduced_2_3')}>ลด 2-3 kg {getSortIcon('weight_reduced_2_3')}</th>
              <th rowSpan={2} className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase cursor-pointer hover:bg-gray-100 border-r border-gray-300" onClick={() => handleSort('weight_reduced_3_4')}>ลด 3-4 kg {getSortIcon('weight_reduced_3_4')}</th>
              <th rowSpan={2} className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase cursor-pointer hover:bg-gray-100 border-r border-gray-300" onClick={() => handleSort('weight_reduced_4_5')}>ลด 4-5 kg {getSortIcon('weight_reduced_4_5')}</th>
              <th rowSpan={2} className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase cursor-pointer hover:bg-gray-100" onClick={() => handleSort('weight_reduced_over_5')}>ลด {'>'}5 kg {getSortIcon('weight_reduced_over_5')}</th>
            </tr>
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase cursor-pointer hover:bg-gray-100 bg-blue-50" onClick={() => handleSort('normal_population')}>กลุ่มปกติ {getSortIcon('normal_population')}</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase cursor-pointer hover:bg-gray-100 bg-blue-50" onClick={() => handleSort('risk_population')}>กลุ่มเสี่ยง {getSortIcon('risk_population')}</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase cursor-pointer hover:bg-gray-100 bg-blue-50 border-r border-gray-300" onClick={() => handleSort('sick_population')}>กลุ่มป่วย {getSortIcon('sick_population')}</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {sortedData.map((item, index) => (
              <tr key={item.id} className={`${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'} hover:bg-blue-50 transition-colors duration-150`}>
                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900 border border-dashed border-gray-300">{item.amp_code}</td>
                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900 border border-dashed border-gray-300">{item.amp_name}</td>
                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900 border border-dashed border-gray-300">
                  {renderEditableCell(item, 'total_volunteers', item.total_volunteers)}
                </td>
                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900 border border-dashed border-gray-300">
                  {renderEditableCell(item, 'volunteers_registered', item.volunteers_registered)}
                </td>
                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900 border border-dashed border-gray-300">
                  {renderEditableCell(item, 'volunteers_percentage', item.volunteers_percentage, true)}
                </td>
                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900 border border-dashed border-gray-300">
                  {renderEditableCell(item, 'total_personnel', item.total_personnel)}
                </td>
                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900 border border-dashed border-gray-300">
                  {renderEditableCell(item, 'personnel_registered', item.personnel_registered)}
                </td>
                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900 border border-dashed border-gray-300">
                  {renderEditableCell(item, 'personnel_percentage', item.personnel_percentage, true)}
                </td>
                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900 border border-dashed border-gray-300">
                  {renderEditableCell(item, 'service_recipients', item.service_recipients)}
                </td>
                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900 border border-dashed border-gray-300">
                  {renderEditableCell(item, 'normal_population', item.normal_population)}
                </td>
                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900 border border-dashed border-gray-300">
                  {renderEditableCell(item, 'risk_population', item.risk_population)}
                </td>
                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900 border border-dashed border-gray-300">
                  {renderEditableCell(item, 'sick_population', item.sick_population)}
                </td>
                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900 border border-dashed border-gray-300">
                  {renderEditableCell(item, 'risk_trained', item.risk_trained)}
                </td>
                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900 border border-dashed border-gray-300">
                  {renderEditableCell(item, 'risk_to_normal', item.risk_to_normal)}
                </td>
                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900 border border-dashed border-gray-300">
                  {renderEditableCell(item, 'weight_reduced_0_1', item.weight_reduced_0_1)}
                </td>
                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900 border border-dashed border-gray-300">
                  {renderEditableCell(item, 'weight_reduced_1_2', item.weight_reduced_1_2)}
                </td>
                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900 border border-dashed border-gray-300">
                  {renderEditableCell(item, 'weight_reduced_2_3', item.weight_reduced_2_3)}
                </td>
                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900 border border-dashed border-gray-300">
                  {renderEditableCell(item, 'weight_reduced_3_4', item.weight_reduced_3_4)}
                </td>
                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900 border border-dashed border-gray-300">
                  {renderEditableCell(item, 'weight_reduced_4_5', item.weight_reduced_4_5)}
                </td>
                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900 border border-dashed border-gray-300">
                  {renderEditableCell(item, 'weight_reduced_over_5', item.weight_reduced_over_5)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}