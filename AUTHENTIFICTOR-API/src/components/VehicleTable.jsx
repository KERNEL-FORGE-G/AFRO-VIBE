import React from 'react';
import { ChevronRight, AlertCircle } from 'lucide-react';

const mockVehicles = [
  {
    id: 'XD-456-US',
    type: 'Toyota Highlander 2004',
    status: 'Active',
    location: 'Belgrade, SR',
    serviceDate: '2025-03-22',
    expiryDate: '2025-12-23',
    manager: { name: 'John Doe', avatar: 'JD' },
  },
  {
    id: 'VR-419-106',
    type: 'Lexus 350 2000',
    status: 'Idle',
    location: 'San Diego, US',
    serviceDate: '2025-02-20',
    expiryDate: '2025-10-08',
    manager: { name: 'Jane Smith', avatar: 'JS' },
  },
  {
    id: 'HY-987-056',
    type: 'Ford F190',
    status: 'Maintenance',
    location: 'Birmingham, UK',
    serviceDate: '2025-02-10',
    expiryDate: '2025-12-26',
    manager: { name: 'Mike Johnson', avatar: 'MJ' },
  },
  {
    id: 'EH-456-RUV',
    type: 'Fire Grom Ranger',
    status: 'Active',
    location: 'Houston, TX',
    serviceDate: '2025-01-09',
    expiryDate: '2025-11-30',
    manager: { name: 'Emily Davis', avatar: 'ED' },
  },
  {
    id: 'SA-126-350',
    type: 'Jeep Wrangler',
    status: 'Active',
    location: 'Canada, YZ',
    serviceDate: '2025-01-15',
    expiryDate: '2025-11-20',
    manager: { name: 'Emily Davis', avatar: 'ED' },
  },
];

const getStatusColor = (status) => {
  const colors = {
    Active: 'bg-green-100 text-green-800',
    Idle: 'bg-gray-100 text-gray-800',
    Maintenance: 'bg-yellow-100 text-yellow-800',
  };
  return colors[status] || 'bg-gray-100 text-gray-800';
};

export default function VehicleTable() {
  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="p-6 border-b border-gray-200">
        <h2 className="text-lg font-bold text-gray-900">Vehicle List</h2>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-blue-500 text-white">
            <tr>
              <th className="px-6 py-4 text-left text-sm font-semibold">Type</th>
              <th className="px-6 py-4 text-left text-sm font-semibold">Status</th>
              <th className="px-6 py-4 text-left text-sm font-semibold">Current Location</th>
              <th className="px-6 py-4 text-left text-sm font-semibold">Last Service Date</th>
              <th className="px-6 py-4 text-left text-sm font-semibold">Next Maintenance</th>
              <th className="px-6 py-4 text-left text-sm font-semibold">Driver Assigned</th>
              <th className="px-6 py-4 text-left text-sm font-semibold"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {mockVehicles.map((vehicle) => (
              <tr key={vehicle.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 text-sm text-gray-900">
                  <div>
                    <p className="font-semibold">{vehicle.id}</p>
                    <p className="text-gray-600 text-xs">{vehicle.type}</p>
                  </div>
                </td>
                <td className="px-6 py-4 text-sm">
                  <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(vehicle.status)}`}>
                    {vehicle.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm text-gray-900">{vehicle.location}</td>
                <td className="px-6 py-4 text-sm text-gray-900">{vehicle.serviceDate}</td>
                <td className="px-6 py-4 text-sm text-gray-900">{vehicle.expiryDate}</td>
                <td className="px-6 py-4 text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-gradient-to-br from-red-400 to-red-600 rounded-full flex items-center justify-center text-white text-xs font-bold">
                      {vehicle.manager.avatar}
                    </div>
                    <span className="text-gray-900">{vehicle.manager.name}</span>
                  </div>
                </td>
                <td className="px-6 py-4 text-sm text-gray-400">
                  <ChevronRight size={18} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
