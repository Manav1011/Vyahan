import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { ParcelStatus, UserRole, Parcel } from '../types';
import { Truck, MapPin, CheckCircle, ArrowRight, Printer } from 'lucide-react';
import ReceiptModal from '../components/ReceiptModal.tsx';

// Component to manage and list parcels with status transition actions
export const ParcelList: React.FC = () => {
   const { parcels, currentUser, updateParcelStatus, getOfficeName, offices } = useApp();
   const myOfficeId = currentUser?.officeId;
   const isSuper = currentUser?.role === UserRole.SUPER_ADMIN;
   const myParcels = parcels.filter(p => isSuper || p.sourceOfficeId === myOfficeId || p.destinationOfficeId === myOfficeId);

   const [selectedParcel, setSelectedParcel] = useState<Parcel | null>(null);

   const ActionButton = ({ onClick, colorClass, icon: Icon, label }: any) => (
      <button
         onClick={(e) => { e.stopPropagation(); onClick(); }}
         className={`flex items-center justify-center w-full md:w-auto px-3 py-1.5 rounded-md text-xs font-bold transition-all shadow-sm border ${colorClass}`}
      >
         <Icon className="w-3 h-3 mr-1.5" /> {label}
      </button>
   );

   const renderAction = (parcel: Parcel) => {
      if (isSuper) return <span className="text-slate-400 text-xs italic">View Only</span>;

      // Source Office Actions
      if (parcel.sourceOfficeId === myOfficeId) {
         if (parcel.currentStatus === ParcelStatus.BOOKED) {
            return (
               <div className="flex gap-2 justify-end">
                  <button
                     onClick={() => setSelectedParcel(parcel)}
                     className="flex items-center justify-center px-3 py-1.5 rounded-md text-xs font-bold transition-all shadow-sm border bg-white border-slate-300 text-slate-700 hover:bg-slate-50"
                     title="Print Bill"
                  >
                     <Printer className="w-3 h-3 mr-1.5" /> Print
                  </button>
                  <ActionButton onClick={async () => {
                     const res = await updateParcelStatus(parcel.trackingId, ParcelStatus.IN_TRANSIT, "Dispatched from source");
                     if (!res.success) alert(res.message);
                  }} colorClass="bg-sky-50 text-sky-700 border-sky-200 hover:bg-sky-100" icon={Truck} label="Dispatch" />
               </div>
            );
         }
         // Even if dispatched, allow printing
         return (
            <button
               onClick={() => setSelectedParcel(parcel)}
               className="flex items-center justify-center px-3 py-1.5 rounded-md text-xs font-bold transition-all shadow-sm border bg-white border-slate-300 text-slate-700 hover:bg-slate-50 ml-auto"
               title="Print Bill"
            >
               <Printer className="w-3 h-3 mr-1.5" /> Bill
            </button>
         );
      }

      // Destination Office Actions
      if (parcel.destinationOfficeId === myOfficeId) {
         const printBtn = (
            <button
               onClick={() => setSelectedParcel(parcel)}
               className="flex items-center justify-center px-3 py-1.5 rounded-md text-xs font-bold transition-all shadow-sm border bg-white border-slate-300 text-slate-700 hover:bg-slate-50"
               title="Print Bill"
            >
               <Printer className="w-3 h-3 mr-1.5" /> Bill
            </button>
         );

         if (parcel.currentStatus === ParcelStatus.IN_TRANSIT) {
            return (
               <div className="flex gap-2 justify-end">
                  {printBtn}
                  <ActionButton onClick={async () => {
                     const res = await updateParcelStatus(parcel.trackingId, ParcelStatus.ARRIVED, "Arrived at destination");
                     if (!res.success) alert(res.message);
                  }} colorClass="bg-indigo-50 text-indigo-700 border-indigo-200 hover:bg-indigo-100" icon={MapPin} label="Arrive" />
               </div>
            );
         }
         if (parcel.currentStatus === ParcelStatus.ARRIVED) {
            return (
               <div className="flex gap-2 justify-end">
                  {printBtn}
                  <ActionButton onClick={async () => {
                     const res = await updateParcelStatus(parcel.trackingId, ParcelStatus.DELIVERED, "Delivered to recipient");
                     if (!res.success) alert(res.message);
                  }} colorClass="bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100" icon={CheckCircle} label="Deliver" />
               </div>
            );
         }
         return (
            <div className="flex justify-end">
               {printBtn}
            </div>
         );
      }
      return <span className="text-xs font-medium text-slate-400">Completed</span>;
   };

   return (
      <div className="space-y-6">
         <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold text-slate-900">Shipment Management</h2>
            <div className="text-sm font-medium text-slate-500">
               Total: {myParcels.length} records
            </div>
         </div>

         <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
            {myParcels.length === 0 ? (
               <div className="p-12 text-center text-slate-500">
                  No active shipments found.
               </div>
            ) : (
               <table className="w-full text-left text-sm">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold">
                     <tr>
                        <th className="px-6 py-4">Tracking ID</th>
                        <th className="px-6 py-4">Description</th>
                        <th className="px-6 py-4">Route</th>
                        <th className="px-6 py-4">Status</th>
                        <th className="px-6 py-4 text-right">Action</th>
                     </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                     {myParcels.map(parcel => (
                        <tr key={parcel.slug} className="hover:bg-slate-50 transition-colors group">
                           <td className="px-6 py-4 align-top">
                              <div className="font-bold text-slate-900">{parcel.trackingId}</div>
                              <div className="text-xs text-slate-500 mt-1">{new Date(parcel.createdAt).toLocaleDateString()}</div>
                           </td>
                           <td className="px-6 py-4 align-top">
                              <div className="font-medium text-slate-800">{parcel.description}</div>
                              <div className="text-xs text-slate-500 mt-1">${parcel.price}</div>
                           </td>
                           <td className="px-6 py-4 align-top">
                              <div className="flex items-center text-slate-700 font-medium">
                                 {getOfficeName(parcel.sourceOfficeId)}
                                 <ArrowRight className="w-3 h-3 mx-2 text-slate-400" />
                                 {getOfficeName(parcel.destinationOfficeId)}
                              </div>
                           </td>
                           <td className="px-6 py-4 align-top">
                              <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-bold uppercase tracking-wide
                            ${parcel.currentStatus === ParcelStatus.DELIVERED ? 'bg-emerald-100 text-emerald-700' :
                                    parcel.currentStatus === ParcelStatus.IN_TRANSIT ? 'bg-sky-100 text-sky-700' :
                                       parcel.currentStatus === ParcelStatus.ARRIVED ? 'bg-indigo-100 text-indigo-700' :
                                          'bg-slate-100 text-slate-600'}
                         `}>
                                 {parcel.currentStatus.replace('_', ' ')}
                              </span>
                           </td>
                           <td className="px-6 py-4 align-top text-right">
                              {renderAction(parcel)}
                           </td>
                        </tr>
                     ))}
                  </tbody>
               </table>
            )}
         </div>

         {selectedParcel && (
            <ReceiptModal
               parcel={selectedParcel}
               sourceOffice={offices.find(o => o.id === selectedParcel.sourceOfficeId)}
               destinationOffice={offices.find(o => o.id === selectedParcel.destinationOfficeId)}
               user={currentUser}
               onClose={() => setSelectedParcel(null)}
            />
         )}
      </div>
   );
};