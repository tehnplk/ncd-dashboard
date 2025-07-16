'use client'

import { useState, useEffect } from 'react'
import { PencilIcon } from '@heroicons/react/24/outline'
import { useAuth } from '../../../contexts/AuthContext'

interface CarbAmp {
  id: number
  amp_code: string
  amp_name: string
  person_target: number
  person_carb: number
  percentage: number
  person_diff: number
  updated_at: string
}

type SortField = 'amp_code' | 'amp_name' | 'person_target' | 'person_carb' | 'percentage' | 'person_diff'
type SortDirection = 'asc' | 'desc'

export default function CarbAmpPage() {
  const { isLoggedIn } = useAuth()
  const [data, setData] = useState<CarbAmp[]>([])
  const [loading, setLoading] = useState(true)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editData, setEditData] = useState<Partial<CarbAmp>>({})
  const [sortField, setSortField] = useState<SortField>('amp_code')
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc')
  const [editingCell, setEditingCell] = useState<{id: string, field: 'person_target' | 'person_carb'} | null>(null)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const response = await fetch('/api/amp/carb')
      const result = await response.json()
      setData(result)
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (item: CarbAmp) => {
    setEditingId(item.amp_code)
    setEditData(item)
  }

  const calculateValues = (target: number, carb: number) => {
    const percentage = target > 0 ? (carb / target) * 100 : 0
    const diff = target - carb
    return { percentage, diff }
  }

  const handleInputChange = (field: 'person_target' | 'person_carb', value: number) => {
    const newData = { ...editData, [field]: value }
    const { percentage, diff } = calculateValues(
      newData.person_target || 0,
      newData.person_carb || 0
    )
    setEditData({
      ...newData,
      percentage,
      person_diff: diff
    })
  }

  const handleSave = async () => {
    if (!editingId) return

    try {
      const response = await fetch(`/api/amp/carb/${editingId}`, {
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

  const handleCellClick = (item: CarbAmp, field: 'person_target' | 'person_carb') => {
    if (!isLoggedIn) return // Prevent editing if not logged in
    setEditingCell({ id: item.amp_code, field })
  }

  const handleCellSave = async (item: CarbAmp, field: 'person_target' | 'person_carb', value: number) => {
    const { percentage, diff } = calculateValues(
      field === 'person_target' ? value : item.person_target,
      field === 'person_carb' ? value : item.person_carb
    )

    try {
      const response = await fetch(`/api/amp/carb/${item.amp_code}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...item,
          [field]: value,
          percentage,
          person_diff: diff
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

  const handleCellBlur = (item: CarbAmp, field: 'person_target' | 'person_carb', value: string) => {
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

  if (loading) {
    return <div className="p-6">Loading...</div>
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">ผลงานนับคาร์บ</h1>
      
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border border-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('amp_code')}
              >
                รหัส {getSortIcon('amp_code')}
              </th>
              <th 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('amp_name')}
              >
                อำเภอ {getSortIcon('amp_name')}
              </th>
              <th 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('person_target')}
              >
                ปชก.10ปี+(คน) {getSortIcon('person_target')}
              </th>
              <th 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('person_carb')}
              >
                นับคาร์บ(คน) {getSortIcon('person_carb')}
              </th>
              <th 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('percentage')}
              >
                ร้อยละ {getSortIcon('percentage')}
              </th>
              <th 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('person_diff')}
              >
                คงเหลือ {getSortIcon('person_diff')}
              </th>

            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {sortedData.map((item, index) => (
              <tr key={item.id} className={`${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'} hover:bg-blue-50 transition-colors duration-150`}>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {item.amp_code}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {item.amp_name}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {editingCell?.id === item.amp_code && editingCell?.field === 'person_target' ? (
                    <input
                      type="number"
                      defaultValue={item.person_target}
                      onBlur={(e) => handleCellBlur(item, 'person_target', e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          handleCellBlur(item, 'person_target', e.currentTarget.value)
                        }
                        if (e.key === 'Escape') {
                          setEditingCell(null)
                        }
                      }}
                      className="w-20 px-2 py-1 border border-blue-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                      autoFocus
                    />
                  ) : (
                    <span
                      onClick={() => handleCellClick(item, 'person_target')}
                      className={isLoggedIn ? "cursor-pointer hover:bg-blue-50 px-2 py-1 rounded" : "px-2 py-1 text-gray-500"}
                    >
                      {item.person_target.toLocaleString()}
                    </span>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {editingCell?.id === item.amp_code && editingCell?.field === 'person_carb' ? (
                    <input
                      type="number"
                      defaultValue={item.person_carb}
                      onBlur={(e) => handleCellBlur(item, 'person_carb', e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          handleCellBlur(item, 'person_carb', e.currentTarget.value)
                        }
                        if (e.key === 'Escape') {
                          setEditingCell(null)
                        }
                      }}
                      className="w-20 px-2 py-1 border border-blue-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                      autoFocus
                    />
                  ) : (
                    <span
                      onClick={() => handleCellClick(item, 'person_carb')}
                      className={isLoggedIn ? "cursor-pointer hover:bg-blue-50 px-2 py-1 rounded" : "px-2 py-1 text-gray-500"}
                    >
                      {item.person_carb.toLocaleString()}
                    </span>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {editingId === item.amp_code ? (
                    <span className="w-20 px-2 py-1 bg-gray-100 border border-gray-300 rounded text-gray-600 inline-block">
                      {(editData.percentage || 0).toFixed(2)}%
                    </span>
                  ) : (
                    `${item.percentage.toFixed(2)}%`
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {editingId === item.amp_code ? (
                    <span className="w-20 px-2 py-1 bg-gray-100 border border-gray-300 rounded text-gray-600 inline-block">
                      {(editData.person_diff || 0).toLocaleString()}
                    </span>
                  ) : (
                    item.person_diff.toLocaleString()
                  )}
                </td>

              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}