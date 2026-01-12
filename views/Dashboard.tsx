import React from 'react';
import { useApp } from '../context/AppContext';
import { ParcelStatus, UserRole } from '../types';
import { ArrowRight, Package, Truck, CheckCircle, Clock, TrendingUp } from 'lucide-react';

export const Dashboard: React.FC = () => {
  const { parcels, currentUser, organization } = useApp();

  const relevantParcels = currentUser?.role === UserRole.SUPER_ADMIN
    ? parcels
    : parcels.filter(p => p.sourceOfficeId === currentUser?.officeId || p.destinationOfficeId === currentUser?.officeId);

  const stats = {
    total: relevantParcels.length,
    inTransit: relevantParcels.filter(p => p.currentStatus === ParcelStatus.IN_TRANSIT).length,
    delivered: relevantParcels.filter(p => p.currentStatus === ParcelStatus.DELIVERED).length,
    pending: relevantParcels.filter(p => p.currentStatus === ParcelStatus.BOOKED).length,
  };

  const StatCard = ({ label, value, icon: Icon, color, subtext }: any) => (
    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div className={`p-2.5 rounded-lg ${color} bg-opacity-10`}>
          <Icon className={`w-5 h-5 ${color.replace('bg-', 'text-')}`} />
        </div>
        {/* Mock trend indicator */}
        <div className="flex items-center text-emerald-600 text-xs font-bold bg-emerald-50 px-2 py-1 rounded-full">
          <TrendingUp className="w-3 h-3 mr-1" /> +2.5%
        </div>
      </div>
      <div>
        <h3 className="text-3xl font-bold text-slate-900 mb-1">{value}</h3>
        <p className="text-sm font-medium text-slate-500">{label}</p>
      </div>
    </div>
  );

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            {currentUser?.role === UserRole.SUPER_ADMIN ? `Welcome Admin, ${organization?.title}` : `Welcome, ${currentUser?.name}`}
          </h1>
          <p className="text-slate-500 mt-1">
            {currentUser?.role === UserRole.SUPER_ADMIN
              ? `Managing high-level logistics for ${organization?.title}`
              : `Managing operations for ${currentUser?.name} branch`}
          </p>
        </div>
        <div className="text-sm text-slate-500 bg-white px-3 py-1.5 rounded-lg border border-slate-200 shadow-sm">
          Date: {new Date().toLocaleDateString()}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          label="Total Shipments"
          value={stats.total}
          icon={Package}
          color="bg-indigo-500 text-indigo-600"
        />
        <StatCard
          label="In Transit"
          value={stats.inTransit}
          icon={Truck}
          color="bg-sky-500 text-sky-600"
        />
        <StatCard
          label="Delivered"
          value={stats.delivered}
          icon={CheckCircle}
          color="bg-emerald-500 text-emerald-600"
        />
        <StatCard
          label="Pending"
          value={stats.pending}
          icon={Clock}
          color="bg-amber-500 text-amber-600"
        />
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center">
          <h3 className="font-bold text-slate-800">Recent Shipments</h3>
          <button className="text-sm text-teal-600 font-semibold hover:text-teal-700">View All</button>
        </div>

        {relevantParcels.length === 0 ? (
          <div className="p-12 text-center">
            <div className="bg-slate-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <Package className="w-8 h-8 text-slate-300" />
            </div>
            <p className="text-slate-500 font-medium">No shipment data available.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-slate-500 font-medium border-b border-slate-100">
                <tr>
                  <th className="px-6 py-4">Tracking ID</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Origin</th>
                  <th className="px-6 py-4">Destination</th>
                  <th className="px-6 py-4">Amount</th>
                  <th className="px-6 py-4">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {relevantParcels.slice(0, 5).map(parcel => (
                  <tr key={parcel.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-6 py-4 font-bold text-slate-900">
                      {parcel.trackingId}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold capitalize
                          ${parcel.currentStatus === ParcelStatus.DELIVERED ? 'bg-emerald-100 text-emerald-700' :
                          parcel.currentStatus === ParcelStatus.IN_TRANSIT ? 'bg-sky-100 text-sky-700' :
                            parcel.currentStatus === ParcelStatus.ARRIVED ? 'bg-indigo-100 text-indigo-700' :
                              'bg-slate-100 text-slate-600'}
                       `}>
                        {parcel.currentStatus === ParcelStatus.DELIVERED && <CheckCircle className="w-3 h-3 mr-1" />}
                        {parcel.currentStatus.toLowerCase().replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-600 font-medium">{parcel.sourceOfficeId}</td>
                    <td className="px-6 py-4 text-slate-600 font-medium">{parcel.destinationOfficeId}</td>
                    <td className="px-6 py-4 text-slate-900 font-bold">${parcel.price}</td>
                    <td className="px-6 py-4 text-slate-500">{new Date(parcel.createdAt).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};