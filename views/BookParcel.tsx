import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { PaymentMode } from '../types';
import { ArrowRight, MapPin, User, Package, CreditCard, Save } from 'lucide-react';

const InputGroup: React.FC<{ label: string; children: React.ReactNode }> = ({ label, children }) => (
    <div className="space-y-1.5">
        <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">{label}</label>
        {children}
    </div>
);

const StyledInput = (props: React.InputHTMLAttributes<HTMLInputElement>) => (
    <input
        {...props}
        className="w-full p-2.5 bg-white border border-slate-300 rounded-lg text-sm text-slate-900 outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition-all shadow-sm"
    />
);

export const BookParcel: React.FC = () => {
    const { offices, currentUser, createParcel } = useApp();

    const [form, setForm] = useState({
        senderName: '',
        senderPhone: '',
        receiverName: '',
        receiverPhone: '',
        destinationOfficeId: '',
        description: '',
        price: '',
        paymentMode: PaymentMode.SENDER_PAYS,
    });

    const sourceOffice = offices.find(o => o.id === currentUser?.officeId);
    const destOffices = offices.filter(o => o.id !== currentUser?.officeId);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!form.destinationOfficeId) {
            alert("Please select a destination");
            return;
        }
        const res = await createParcel({
            senderName: form.senderName,
            senderPhone: form.senderPhone,
            receiverName: form.receiverName,
            receiverPhone: form.receiverPhone,
            destinationOfficeId: form.destinationOfficeId,
            description: form.description,
            price: Number(form.price),
            paymentMode: form.paymentMode,
        });

        if (res.success) {
            setForm({
                senderName: '',
                senderPhone: '',
                receiverName: '',
                receiverPhone: '',
                destinationOfficeId: '',
                description: '',
                price: '',
                paymentMode: PaymentMode.SENDER_PAYS,
            });
            alert("Booked Successfully!");
        } else {
            alert(res.message);
        }
    };

    return (
        <div className="max-w-4xl mx-auto">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h2 className="text-2xl font-bold text-slate-900">New Booking</h2>
                    <p className="text-slate-500 text-sm mt-1">Create a shipment record from {sourceOffice?.name}</p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-6">

                {/* Route Card */}
                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                    <div className="flex items-center gap-2 mb-6 border-b border-slate-100 pb-4">
                        <MapPin className="w-5 h-5 text-teal-600" />
                        <h3 className="text-lg font-bold text-slate-800">Route</h3>
                    </div>

                    <div className="flex flex-col md:flex-row gap-6 items-center">
                        <div className="flex-1 w-full bg-slate-50 p-4 rounded-lg border border-slate-200">
                            <span className="text-xs font-bold text-slate-400 uppercase">Origin</span>
                            <div className="text-lg font-bold text-slate-900">{sourceOffice?.city}</div>
                            <div className="text-sm text-slate-500">{sourceOffice?.name}</div>
                        </div>
                        <ArrowRight className="text-slate-300 w-6 h-6 rotate-90 md:rotate-0" />
                        <div className="flex-1 w-full">
                            <InputGroup label="Destination">
                                <select
                                    required
                                    className="w-full p-3 bg-white border border-slate-300 rounded-lg text-sm font-medium text-slate-900 outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 shadow-sm"
                                    value={form.destinationOfficeId}
                                    onChange={e => setForm({ ...form, destinationOfficeId: e.target.value })}
                                >
                                    <option value="">Select Destination...</option>
                                    {destOffices.map(o => (
                                        <option key={o.id} value={o.id}>{o.city} - {o.name}</option>
                                    ))}
                                </select>
                            </InputGroup>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Sender */}
                    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                        <div className="flex items-center gap-2 mb-6 border-b border-slate-100 pb-4">
                            <User className="w-5 h-5 text-teal-600" />
                            <h3 className="text-lg font-bold text-slate-800">Sender</h3>
                        </div>
                        <div className="space-y-4">
                            <InputGroup label="Full Name">
                                <StyledInput required value={form.senderName} onChange={e => setForm({ ...form, senderName: e.target.value })} />
                            </InputGroup>
                            <InputGroup label="Phone Number">
                                <StyledInput type="tel" required value={form.senderPhone} onChange={e => setForm({ ...form, senderPhone: e.target.value })} />
                            </InputGroup>
                        </div>
                    </div>

                    {/* Receiver */}
                    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                        <div className="flex items-center gap-2 mb-6 border-b border-slate-100 pb-4">
                            <User className="w-5 h-5 text-teal-600" />
                            <h3 className="text-lg font-bold text-slate-800">Receiver</h3>
                        </div>
                        <div className="space-y-4">
                            <InputGroup label="Full Name">
                                <StyledInput required value={form.receiverName} onChange={e => setForm({ ...form, receiverName: e.target.value })} />
                            </InputGroup>
                            <InputGroup label="Phone Number">
                                <StyledInput type="tel" required value={form.receiverPhone} onChange={e => setForm({ ...form, receiverPhone: e.target.value })} />
                            </InputGroup>
                        </div>
                    </div>
                </div>

                {/* Details & Payment */}
                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                    <div className="flex items-center gap-2 mb-6 border-b border-slate-100 pb-4">
                        <Package className="w-5 h-5 text-teal-600" />
                        <h3 className="text-lg font-bold text-slate-800">Shipment Details</h3>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                        <div className="md:col-span-2">
                            <InputGroup label="Description">
                                <StyledInput required value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} placeholder="e.g. 2 Boxes of Electronic parts" />
                            </InputGroup>
                        </div>
                        <div className="md:col-span-2">
                            <InputGroup label="Price ($)">
                                <StyledInput type="number" required value={form.price} onChange={e => setForm({ ...form, price: e.target.value })} />
                            </InputGroup>
                        </div>
                    </div>

                    <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
                        <div className="flex items-center gap-2 mb-3 text-slate-800 font-bold text-sm">
                            <CreditCard className="w-4 h-4" /> Payment Method
                        </div>
                        <div className="flex gap-4">
                            {[
                                { val: PaymentMode.SENDER_PAYS, label: 'Prepaid (Sender)' },
                                { val: PaymentMode.RECEIVER_PAYS, label: 'COD (Receiver)' }
                            ].map((opt) => (
                                <label key={opt.val} className={`flex-1 flex items-center justify-center p-3 rounded-lg cursor-pointer border text-sm font-medium transition-all ${form.paymentMode === opt.val ? 'bg-white border-teal-500 text-teal-700 shadow-sm ring-1 ring-teal-500' : 'bg-transparent border-slate-300 text-slate-500 hover:bg-white'}`}>
                                    <input type="radio" name="payment" className="hidden" checked={form.paymentMode === opt.val} onChange={() => setForm({ ...form, paymentMode: opt.val as PaymentMode })} />
                                    {opt.label}
                                </label>
                            ))}
                        </div>
                    </div>
                </div>

                <button className="w-full bg-slate-900 text-white py-4 rounded-xl font-bold text-lg hover:bg-slate-800 shadow-xl shadow-slate-900/10 flex items-center justify-center gap-2 transition-all">
                    <Save className="w-5 h-5" /> Confirm & Create Booking
                </button>
            </form>
        </div>
    );
};