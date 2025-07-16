'use client'

import { useState, useEffect } from 'react'
import { PencilIcon } from '@heroicons/react/24/outline'
import { useAuth } from '../../../contexts/AuthContext'

interface PreventionAmp {
  id: number
  amp_code: string
  amp_name: string
  total_officer: number
  total_pop: number
  osm_provider: number
  officer_provider: number
  target_pop: number
  prevention_visit: number
  normal_pop: number
  risk_pop: number
  sick_pop: number
  trained: number
  risk_to_normal: number
  weight_reduce: number
  weight_reduce_avg: number
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
  const [editingCell, setEditingCell] = useState<{id: string, field: keyof PreventionAmp} | null>(null)

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
    // Only allow editing of numeric fields (exclude id, amp_code, amp_name, updated_at)
    const editableFields = ['total_officer', 'total_pop', 'osm_provider', 'officer_provider', 'target_pop', 'prevention_visit', 'normal_pop', 'risk_pop', 'sick_pop', 'trained', 'risk_to_normal', 'weight_reduce', 'weight_reduce_avg']
    if (editableFields.includes(field as string)) {
      setEditingCell({ id: item.amp_code, field })
    }
  }

  const handleCellSave = async (item: PreventionAmp, field: keyof PreventionAmp, value: number) => {
    try {
      const response = await fetch(`/api/amp/prevention/${item.amp_code}`, {
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
    const editableFields = ['total_officer', 'total_pop', 'osm_provider', 'officer_provider', 'target_pop', 'prevention_visit', 'normal_pop', 'risk_pop', 'sick_pop', 'trained', 'risk_to_normal', 'weight_reduce', 'weight_reduce_avg']
    
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

  if (loading) {
    return <div className="p-6">Loading...</div>
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">ผลการดำเนินงาน NCD Prevention</h1>
      
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border border-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase cursor-pointer hover:bg-gray-100" onClick={() => handleSort('amp_code')}>รหัส {getSortIcon('amp_code')}</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase cursor-pointer hover:bg-gray-100" onClick={() => handleSort('amp_name')}>อำเภอ {getSortIcon('amp_name')}</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase cursor-pointer hover:bg-gray-100" onClick={() => handleSort('total_officer')}>Total Officer {getSortIcon('total_officer')}</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase cursor-pointer hover:bg-gray-100" onClick={() => handleSort('total_pop')}>Total Pop {getSortIcon('total_pop')}</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase cursor-pointer hover:bg-gray-100" onClick={() => handleSort('osm_provider')}>OSM Provider {getSortIcon('osm_provider')}</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase cursor-pointer hover:bg-gray-100" onClick={() => handleSort('officer_provider')}>Officer Provider {getSortIcon('officer_provider')}</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase cursor-pointer hover:bg-gray-100" onClick={() => handleSort('target_pop')}>Target Pop {getSortIcon('target_pop')}</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase cursor-pointer hover:bg-gray-100" onClick={() => handleSort('prevention_visit')}>Prevention Visit {getSortIcon('prevention_visit')}</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase cursor-pointer hover:bg-gray-100" onClick={() => handleSort('normal_pop')}>Normal Pop {getSortIcon('normal_pop')}</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase cursor-pointer hover:bg-gray-100" onClick={() => handleSort('risk_pop')}>Risk Pop {getSortIcon('risk_pop')}</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase cursor-pointer hover:bg-gray-100" onClick={() => handleSort('sick_pop')}>Sick Pop {getSortIcon('sick_pop')}</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase cursor-pointer hover:bg-gray-100" onClick={() => handleSort('trained')}>Trained {getSortIcon('trained')}</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase cursor-pointer hover:bg-gray-100" onClick={() => handleSort('risk_to_normal')}>Risk to Normal {getSortIcon('risk_to_normal')}</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase cursor-pointer hover:bg-gray-100" onClick={() => handleSort('weight_reduce')}>Weight Reduce {getSortIcon('weight_reduce')}</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase cursor-pointer hover:bg-gray-100" onClick={() => handleSort('weight_reduce_avg')}>Weight Reduce Avg {getSortIcon('weight_reduce_avg')}</th>

            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {sortedData.map((item, index) => (
              <tr key={item.id} className={`${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'} hover:bg-blue-50 transition-colors duration-150`}>
                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">{item.amp_code}</td>
                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">{item.amp_name}</td>
                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                  {renderEditableCell(item, 'total_officer', item.total_officer)}
                </td>
                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                  {renderEditableCell(item, 'total_pop', item.total_pop)}
                </td>
                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                  {renderEditableCell(item, 'osm_provider', item.osm_provider)}
                </td>
                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                  {renderEditableCell(item, 'officer_provider', item.officer_provider)}
                </td>
                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                  {renderEditableCell(item, 'target_pop', item.target_pop)}
                </td>
                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                  {renderEditableCell(item, 'prevention_visit', item.prevention_visit)}
                </td>
                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                  {renderEditableCell(item, 'normal_pop', item.normal_pop)}
                </td>
                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                  {renderEditableCell(item, 'risk_pop', item.risk_pop)}
                </td>
                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                  {renderEditableCell(item, 'sick_pop', item.sick_pop)}
                </td>
                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                  {renderEditableCell(item, 'trained', item.trained)}
                </td>
                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                  {renderEditableCell(item, 'risk_to_normal', item.risk_to_normal)}
                </td>
                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                  {renderEditableCell(item, 'weight_reduce', item.weight_reduce, true)}
                </td>
                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                  {renderEditableCell(item, 'weight_reduce_avg', item.weight_reduce_avg, true)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}