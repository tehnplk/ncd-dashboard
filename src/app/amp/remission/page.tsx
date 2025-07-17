'use client'

import { useState, useEffect } from 'react'
import { PencilIcon } from '@heroicons/react/24/outline'
import { useAuth } from '../../../contexts/AuthContext'
import Image from 'next/image'

interface RemissionAmp {
  id: number
  amp_code: string
  amp_name: string
  trained: number
  ncds_remission: number
  stopped_medication: number
  reduced_1: number
  reduced_2: number
  reduced_3: number
  reduced_4: number
  reduced_5: number
  reduced_6: number
  reduced_7: number
  reduced_8: number
  reduced_n: number
  same_medication: number
  increased_medication: number
  pending_evaluation: number
  lost_followup: number
  updated_at: string
}

type SortField = keyof RemissionAmp
type SortDirection = 'asc' | 'desc'

export default function RemissionAmpPage() {
  const { isLoggedIn } = useAuth()
  const [data, setData] = useState<RemissionAmp[]>([])
  const [loading, setLoading] = useState(true)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editData, setEditData] = useState<Partial<RemissionAmp>>({})
  const [sortField, setSortField] = useState<SortField>('amp_code')
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc')
  const [editingCell, setEditingCell] = useState<{ id: string, field: keyof RemissionAmp } | null>(null)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const response = await fetch('/api/amp/remission')
      const result = await response.json()
      setData(result)
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (item: RemissionAmp) => {
    setEditingId(item.amp_code)
    setEditData(item)
  }

  const handleSave = async () => {
    if (!editingId) return

    try {
      const response = await fetch(`/api/amp/remission/${editingId}`, {
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

  const handleCellClick = (item: RemissionAmp, field: keyof RemissionAmp) => {
    if (!isLoggedIn) return // Prevent editing if not logged in
    // Only allow editing of numeric fields (exclude id, amp_code, amp_name, updated_at)
    const editableFields = ['trained', 'ncds_remission', 'stopped_medication', 'reduced_1', 'reduced_2', 'reduced_3', 'reduced_4', 'reduced_5', 'reduced_6', 'reduced_7', 'reduced_8', 'reduced_n', 'same_medication', 'increased_medication', 'pending_evaluation', 'lost_followup']
    if (editableFields.includes(field as string)) {
      setEditingCell({ id: item.amp_code, field })
    }
  }

  const handleCellSave = async (item: RemissionAmp, field: keyof RemissionAmp, value: number) => {
    try {
      const response = await fetch(`/api/amp/remission/${item.amp_code}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...item,
          [field]: value
        }),
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

  const handleCellBlur = (item: RemissionAmp, field: keyof RemissionAmp, value: string) => {
    const numValue = parseInt(value) || 0
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

  const renderEditableCell = (item: RemissionAmp, field: keyof RemissionAmp, value: number) => {
    const editableFields = ['trained', 'ncds_remission', 'stopped_medication', 'reduced_1', 'reduced_2', 'reduced_3', 'reduced_4', 'reduced_5', 'reduced_6', 'reduced_7', 'reduced_8', 'reduced_n', 'same_medication', 'increased_medication', 'pending_evaluation', 'lost_followup']

    if (editingCell?.id === item.amp_code && editingCell?.field === field) {
      return (
        <input
          type="number"
          defaultValue={value}
          onBlur={(e) => handleCellBlur(item, field, e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              handleCellBlur(item, field, e.currentTarget.value)
            }
            if (e.key === 'Escape') {
              setEditingCell(null)
            }
          }}
          className="w-16 px-2 py-1 border border-blue-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
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
          {value.toLocaleString()}
        </span>
      )
    }

    return value.toLocaleString()
  }

  if (loading) {
    return <div className="p-6">Loading...</div>
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">ผลการดำเนินงานคลินิก NCDs รักษาหาย</h1>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {/* Training Bar Chart Card */}
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
            <h2 className="text-xl font-bold text-gray-800">ผู้ป่วยเข้ารับการอบรมปรับเปลี่ยนพฤติกรรม</h2>
          </div>

          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
            </div>
          ) : (
            <div className="bg-gray-50 p-4 border border-gray-200 rounded-md w-full overflow-x-auto" style={{ minHeight: "300px" }}>
              <div className="flex items-end min-w-max" style={{ height: 'calc(100% - 40px)' }}>
                {[...data]
                  .sort((a, b) => b.trained - a.trained)
                  .slice(0, 10)
                  .map((item, index) => {
                    const maxValue = Math.max(...data.map(d => d.trained));
                    const heightPercentage = maxValue > 0 ? (item.trained / maxValue) * 100 : 0;

                    return (
                      <div
                        key={item.amp_code}
                        className="flex flex-col items-center h-full px-1 sm:px-2"
                        style={{ width: '10%', minWidth: '60px' }}
                      >
                        <div className="text-xs font-medium mb-1 text-center w-full truncate text-green-700">
                          {item.trained.toLocaleString()}
                        </div>
                        <div
                          className="bg-green-500 w-10/12 sm:w-4/5 mx-auto rounded-t-sm hover:bg-green-600 transition-colors"
                          style={{
                            height: `${Math.max(heightPercentage * 2, 4)}px`,
                            maxHeight: "200px",
                          }}
                        ></div>
                        <div className="mt-2 text-xs text-gray-600 truncate w-full text-center">
                          {item.amp_name}
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>
          )}
        </div>

        {/* Cost Savings Bar Chart Card */}
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
            <h2 className="text-xl font-bold text-gray-800">ประหยัดค่าใช้จ่าย</h2>
          </div>

          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500"></div>
            </div>
          ) : (
            <div className="bg-gray-50 p-4 border border-gray-200 rounded-md w-full overflow-x-auto" style={{ minHeight: "300px" }}>
              <div className="flex items-end min-w-max" style={{ height: 'calc(100% - 40px)' }}>
                {[...data]
                  .map(item => ({
                    ...item,
                    totalSavings: ((item.ncds_remission + item.stopped_medication) * 16310) +
                      (item.reduced_1 * 1000) +
                      (item.reduced_2 * 2000) +
                      (item.reduced_3 * 3000)
                  }))
                  .sort((a, b) => b.totalSavings - a.totalSavings)
                  .slice(0, 10)
                  .map((item, index) => {
                    const maxValue = Math.max(...data.map(d =>
                      ((d.ncds_remission + d.stopped_medication) * 16310) +
                      (d.reduced_1 * 1000) +
                      (d.reduced_2 * 2000) +
                      (d.reduced_3 * 3000)
                    ));
                    const heightPercentage = maxValue > 0 ? (item.totalSavings / maxValue) * 100 : 0;

                    return (
                      <div
                        key={item.amp_code}
                        className="flex flex-col items-center h-full px-1 sm:px-2"
                        style={{ width: '10%', minWidth: '60px' }}
                      >
                        <div className="text-xs font-medium mb-1 text-center w-full truncate text-orange-600">
                          {(item.totalSavings / 1000000).toFixed(1)} ลบ.
                        </div>
                        <div
                          className="bg-orange-300 w-10/12 sm:w-4/5 mx-auto rounded-t-sm hover:bg-orange-400 transition-colors"
                          style={{
                            height: `${Math.max(heightPercentage * 2, 4)}px`,
                            maxHeight: "200px",
                          }}
                        ></div>
                        <div className="mt-2 text-xs text-gray-600 truncate w-full text-center">
                          {item.amp_name}
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full bg-white text-sm border-separate border-spacing-0 dashed-table">
          <thead className="bg-gray-50">
            <tr>
              <th rowSpan={2} className="text-left text-xs font-medium text-gray-500 uppercase cursor-pointer hover:bg-gray-100" onClick={() => handleSort('amp_code')}>รหัส {getSortIcon('amp_code')}</th>
              <th rowSpan={2} className="text-left text-xs font-medium text-gray-500 uppercase cursor-pointer hover:bg-gray-100" onClick={() => handleSort('amp_name')}>อำเภอ {getSortIcon('amp_name')}</th>
              <th rowSpan={2} className="text-left text-xs font-medium text-gray-500 uppercase cursor-pointer hover:bg-gray-100" onClick={() => handleSort('trained')}>จำนวนผู้ป่วยเข้ารับการอบรมปรับเปลี่ยนพฤติกรรม {getSortIcon('trained')}</th>
              <th rowSpan={2} className="text-left text-xs font-medium text-gray-500 uppercase cursor-pointer hover:bg-gray-100" onClick={() => handleSort('ncds_remission')}>จำนวนผู้ป่วยเข้าเกณฑ์ NCDs Remission {getSortIcon('ncds_remission')}</th>
              <th rowSpan={2} className="text-left text-xs font-medium text-gray-500 uppercase cursor-pointer hover:bg-gray-100" onClick={() => handleSort('stopped_medication')}>จำนวนผู้ป่วยที่หยุดยาได้ {getSortIcon('stopped_medication')}</th>
              <th colSpan={9} className="text-center text-xs font-medium text-gray-500 uppercase bg-blue-50">จำนวนผู้ป่วยที่ลดยาลง</th>
              <th rowSpan={2} className="text-left text-xs font-medium text-gray-500 uppercase cursor-pointer hover:bg-gray-100" onClick={() => handleSort('same_medication')}>จำนวนผู้ป่วยที่รับยาเท่าเดิม {getSortIcon('same_medication')}</th>
              <th rowSpan={2} className="text-left text-xs font-medium text-gray-500 uppercase cursor-pointer hover:bg-gray-100" onClick={() => handleSort('increased_medication')}>จำนวนผู้ป่วยเพิ่มยา {getSortIcon('increased_medication')}</th>
              <th rowSpan={2} className="text-left text-xs font-medium text-gray-500 uppercase cursor-pointer hover:bg-gray-100" onClick={() => handleSort('pending_evaluation')}>จำนวนผู้ป่วยอยู่ระหว่างการประเมิน {getSortIcon('pending_evaluation')}</th>
              <th rowSpan={2} className="text-left text-xs font-medium text-gray-500 uppercase cursor-pointer hover:bg-gray-100" onClick={() => handleSort('lost_followup')}>จำนวนผู้ป่วยขาดนัด/ติดตามไม่ได้ {getSortIcon('lost_followup')}</th>
            </tr>
            <tr>
              <th className="text-center text-xs font-medium text-gray-500 uppercase cursor-pointer hover:bg-gray-100 bg-blue-50" onClick={() => handleSort('reduced_1')}>1 ตัว {getSortIcon('reduced_1')}</th>
              <th className="text-center text-xs font-medium text-gray-500 uppercase cursor-pointer hover:bg-gray-100 bg-blue-50" onClick={() => handleSort('reduced_2')}>2 ตัว {getSortIcon('reduced_2')}</th>
              <th className="text-center text-xs font-medium text-gray-500 uppercase cursor-pointer hover:bg-gray-100 bg-blue-50" onClick={() => handleSort('reduced_3')}>3 ตัว {getSortIcon('reduced_3')}</th>
              <th className="text-center text-xs font-medium text-gray-500 uppercase cursor-pointer hover:bg-gray-100 bg-blue-50" onClick={() => handleSort('reduced_4')}>4 ตัว {getSortIcon('reduced_4')}</th>
              <th className="text-center text-xs font-medium text-gray-500 uppercase cursor-pointer hover:bg-gray-100 bg-blue-50" onClick={() => handleSort('reduced_5')}>5 ตัว {getSortIcon('reduced_5')}</th>
              <th className="text-center text-xs font-medium text-gray-500 uppercase cursor-pointer hover:bg-gray-100 bg-blue-50" onClick={() => handleSort('reduced_6')}>6 ตัว {getSortIcon('reduced_6')}</th>
              <th className="text-center text-xs font-medium text-gray-500 uppercase cursor-pointer hover:bg-gray-100 bg-blue-50" onClick={() => handleSort('reduced_7')}>7 ตัว {getSortIcon('reduced_7')}</th>
              <th className="text-center text-xs font-medium text-gray-500 uppercase cursor-pointer hover:bg-gray-100 bg-blue-50" onClick={() => handleSort('reduced_8')}>8 ตัว {getSortIcon('reduced_8')}</th>
              <th className="text-center text-xs font-medium text-gray-500 uppercase cursor-pointer hover:bg-gray-100 bg-blue-50" onClick={() => handleSort('reduced_n')}>&gt;8 ตัว {getSortIcon('reduced_n')}</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {sortedData.map((item, index) => (
              <tr key={item.id} className={`${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'} hover:bg-blue-50 transition-colors duration-150`}>
                <td className="whitespace-nowrap text-sm text-gray-900">{item.amp_code}</td>
                <td className="whitespace-nowrap text-sm text-gray-900">{item.amp_name}</td>
                <td className="whitespace-nowrap text-sm text-gray-900">
                  {renderEditableCell(item, 'trained', item.trained)}
                </td>
                <td className="whitespace-nowrap text-sm text-gray-900">
                  {renderEditableCell(item, 'ncds_remission', item.ncds_remission)}
                </td>
                <td className="whitespace-nowrap text-sm text-gray-900">
                  {renderEditableCell(item, 'stopped_medication', item.stopped_medication)}
                </td>
                <td className="whitespace-nowrap text-sm text-gray-900 text-center">
                  {renderEditableCell(item, 'reduced_1', item.reduced_1)}
                </td>
                <td className="whitespace-nowrap text-sm text-gray-900 text-center">
                  {renderEditableCell(item, 'reduced_2', item.reduced_2)}
                </td>
                <td className="whitespace-nowrap text-sm text-gray-900 text-center">
                  {renderEditableCell(item, 'reduced_3', item.reduced_3)}
                </td>
                <td className="whitespace-nowrap text-sm text-gray-900 text-center">
                  {renderEditableCell(item, 'reduced_4', item.reduced_4)}
                </td>
                <td className="whitespace-nowrap text-sm text-gray-900 text-center">
                  {renderEditableCell(item, 'reduced_5', item.reduced_5)}
                </td>
                <td className="whitespace-nowrap text-sm text-gray-900 text-center">
                  {renderEditableCell(item, 'reduced_6', item.reduced_6)}
                </td>
                <td className="whitespace-nowrap text-sm text-gray-900 text-center">
                  {renderEditableCell(item, 'reduced_7', item.reduced_7)}
                </td>
                <td className="whitespace-nowrap text-sm text-gray-900 text-center">
                  {renderEditableCell(item, 'reduced_8', item.reduced_8)}
                </td>
                <td className="whitespace-nowrap text-sm text-gray-900 text-center">
                  {renderEditableCell(item, 'reduced_n', item.reduced_n)}
                </td>
                <td className="whitespace-nowrap text-sm text-gray-900">
                  {renderEditableCell(item, 'same_medication', item.same_medication)}
                </td>
                <td className="whitespace-nowrap text-sm text-gray-900">
                  {renderEditableCell(item, 'increased_medication', item.increased_medication)}
                </td>
                <td className="whitespace-nowrap text-sm text-gray-900">
                  {renderEditableCell(item, 'pending_evaluation', item.pending_evaluation)}
                </td>
                <td className="whitespace-nowrap text-sm text-gray-900">
                  {renderEditableCell(item, 'lost_followup', item.lost_followup)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}