import Link from 'next/link'

export default function AmpPage() {
  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-8">Amp Management System</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Link href="/amp/carb" className="block">
          <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow border border-gray-200">
            <h2 className="text-xl font-semibold mb-3 text-blue-600">CarbAmp</h2>
            <p className="text-gray-600 mb-4">
              Manage carbohydrate-related data for each district (อำเภอ)
            </p>
            <div className="text-sm text-gray-500">
              • Person Target
              • Person Carb
              • Percentage
              • Person Diff
            </div>
          </div>
        </Link>

        <Link href="/amp/prevention" className="block">
          <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow border border-gray-200">
            <h2 className="text-xl font-semibold mb-3 text-green-600">PreventionAmp</h2>
            <p className="text-gray-600 mb-4">
              Manage prevention program data for each district
            </p>
            <div className="text-sm text-gray-500">
              • Population Data
              • Officer Information
              • Prevention Visits
              • Training Records
            </div>
          </div>
        </Link>

        <Link href="/amp/remission" className="block">
          <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow border border-gray-200">
            <h2 className="text-xl font-semibold mb-3 text-purple-600">RemissionAmp</h2>
            <p className="text-gray-600 mb-4">
              Manage NCDs remission data for each district
            </p>
            <div className="text-sm text-gray-500">
              • Training Records
              • Medication Reduction
              • Follow-up Status
              • Evaluation Data
            </div>
          </div>
        </Link>
      </div>

      <div className="mt-8 bg-gray-50 p-4 rounded-lg">
        <h3 className="text-lg font-medium mb-2">Available Districts (อำเภอ)</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-sm text-gray-600">
          <div>6501 - เมืองพิษณุโลก</div>
          <div>6502 - นครไทย</div>
          <div>6503 - ชาติตระการ</div>
          <div>6504 - บางระกำ</div>
          <div>6505 - บางกระทุ่ม</div>
          <div>6506 - พรหมพิราม</div>
          <div>6507 - วัดโบสถ์</div>
          <div>6508 - วังทอง</div>
          <div>6509 - เนินมะปราง</div>
        </div>
      </div>
    </div>
  )
}