'use client'

import { useState, useEffect } from 'react'
import { PencilIcon } from '@heroicons/react/24/outline'

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
  const [data, setData] = useState<RemissionAmp[]>([])
  const [loading, setLoading] = useState(true)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editData, setEditData] = useState<Partial<RemissionAmp>>({})
  const [sortField, setSortField] = useState<SortField>('amp_code')
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc')
  const [editingCell, setEditingCell] = useState<{id: string, field: keyof RemissionAmp} | null>(null)

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
          className="cursor-pointer hover:bg-blue-50 px-2 py-1 rounded"
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
      
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border border-gray-200 text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase cursor-pointer hover:bg-gray-100" onClick={() => handleSort('amp_code')}>รหัส {getSortIcon('amp_code')}</th>
              <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase cursor-pointer hover:bg-gray-100" onClick={() => handleSort('amp_name')}>อำเภอ {getSortIcon('amp_name')}</th>
              <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase cursor-pointer hover:bg-gray-100" onClick={() => handleSort('trained')}>Trained {getSortIcon('trained')}</th>
              <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase cursor-pointer hover:bg-gray-100" onClick={() => handleSort('ncds_remission')}>NCDs Remission {getSortIcon('ncds_remission')}</th>
              <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase cursor-pointer hover:bg-gray-100" onClick={() => handleSort('stopped_medication')}>Stopped Med {getSortIcon('stopped_medication')}</th>
              <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase cursor-pointer hover:bg-gray-100" onClick={() => handleSort('reduced_1')}>Reduced 1 {getSortIcon('reduced_1')}</th>
              <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase cursor-pointer hover:bg-gray-100" onClick={() => handleSort('reduced_2')}>Reduced 2 {getSortIcon('reduced_2')}</th>
              <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase cursor-pointer hover:bg-gray-100" onClick={() => handleSort('reduced_3')}>Reduced 3 {getSortIcon('reduced_3')}</th>
              <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase cursor-pointer hover:bg-gray-100" onClick={() => handleSort('reduced_4')}>Reduced 4 {getSortIcon('reduced_4')}</th>
              <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase cursor-pointer hover:bg-gray-100" onClick={() => handleSort('reduced_5')}>Reduced 5 {getSortIcon('reduced_5')}</th>
              <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase cursor-pointer hover:bg-gray-100" onClick={() => handleSort('reduced_6')}>Reduced 6 {getSortIcon('reduced_6')}</th>
              <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase cursor-pointer hover:bg-gray-100" onClick={() => handleSort('reduced_7')}>Reduced 7 {getSortIcon('reduced_7')}</th>
              <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase cursor-pointer hover:bg-gray-100" onClick={() => handleSort('reduced_8')}>Reduced 8 {getSortIcon('reduced_8')}</th>
              <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase cursor-pointer hover:bg-gray-100" onClick={() => handleSort('reduced_n')}>Reduced N {getSortIcon('reduced_n')}</th>
              <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase cursor-pointer hover:bg-gray-100" onClick={() => handleSort('same_medication')}>Same Med {getSortIcon('same_medication')}</th>
              <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase cursor-pointer hover:bg-gray-100" onClick={() => handleSort('increased_medication')}>Increased Med {getSortIcon('increased_medication')}</th>
              <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase cursor-pointer hover:bg-gray-100" onClick={() => handleSort('pending_evaluation')}>Pending Eval {getSortIcon('pending_evaluation')}</th>
              <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase cursor-pointer hover:bg-gray-100" onClick={() => handleSort('lost_followup')}>Lost Followup {getSortIcon('lost_followup')}</th>

            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {sortedData.map((item, index) => (
              <tr key={item.id} className={`${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'} hover:bg-blue-50 transition-colors duration-150`}>
                <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-900">{item.amp_code}</td>
                <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-900">{item.amp_name}</td>
                <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-900">
                  {renderEditableCell(item, 'trained', item.trained)}
                </td>
                <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-900">
                  {renderEditableCell(item, 'ncds_remission', item.ncds_remission)}
                </td>
                <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-900">
                  {renderEditableCell(item, 'stopped_medication', item.stopped_medication)}
                </td>
                <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-900">
                  {renderEditableCell(item, 'reduced_1', item.reduced_1)}
                </td>
                <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-900">
                  {renderEditableCell(item, 'reduced_2', item.reduced_2)}
                </td>
                <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-900">
                  {renderEditableCell(item, 'reduced_3', item.reduced_3)}
                </td>
                <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-900">
                  {renderEditableCell(item, 'reduced_4', item.reduced_4)}
                </td>
                <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-900">
                  {renderEditableCell(item, 'reduced_5', item.reduced_5)}
                </td>
                <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-900">
                  {renderEditableCell(item, 'reduced_6', item.reduced_6)}
                </td>
                <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-900">
                  {renderEditableCell(item, 'reduced_7', item.reduced_7)}
                </td>
                <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-900">
                  {renderEditableCell(item, 'reduced_8', item.reduced_8)}
                </td>
                <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-900">
                  {renderEditableCell(item, 'reduced_n', item.reduced_n)}
                </td>
                <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-900">
                  {renderEditableCell(item, 'same_medication', item.same_medication)}
                </td>
                <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-900">
                  {renderEditableCell(item, 'increased_medication', item.increased_medication)}
                </td>
                <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-900">
                  {renderEditableCell(item, 'pending_evaluation', item.pending_evaluation)}
                </td>
                <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-900">
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