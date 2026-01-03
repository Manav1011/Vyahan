import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { UserRole } from '../types';
import { Navigation, Shield, Store, Search, Lock, AlertCircle, ChevronLeft, Check, Loader2 } from 'lucide-react';

export const Login: React.FC = () => {
  const { login, offices } = useApp();
  const [role, setRole] = useState<UserRole | null>(null);
  const [selectedOffice, setSelectedOffice] = useState<string>(offices[0]?.id || '');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    setTimeout(() => {
        if (role === UserRole.SUPER_ADMIN) {
            if (password === 'admin123') {
                login(UserRole.SUPER_ADMIN);
            } else {
                setError('Invalid password. Hint: admin123');
                setLoading(false);
            }
        } else if (role === UserRole.OFFICE_ADMIN) {
            if (password === 'manager123') {
                login(UserRole.OFFICE_ADMIN, selectedOffice);
            } else {
                setError('Invalid password. Hint: manager123');
                setLoading(false);
            }
        } else {
            login(UserRole.PUBLIC);
        }
    }, 800);
  };

  const resetSelection = () => {
    setRole(null);
    setPassword('');
    setError('');
    setLoading(false);
  };

  const RoleButton = ({ title, desc, icon: Icon, targetRole, themeColor, ringColor, bgColor }: any) => (
    <button 
      onClick={() => setRole(targetRole)}
      className={`group w-full text-left p-4 rounded-xl border border-white/60 hover:border-${themeColor}-300 hover:ring-4 ${ringColor} transition-all bg-white/70 backdrop-blur-sm relative overflow-hidden flex items-center gap-4 shadow-sm hover:shadow-xl`}
    >
      <div className={`absolute inset-0 bg-gradient-to-r from-${themeColor}-50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300`}></div>
      
      <div className={`relative w-12 h-12 rounded-full ${bgColor} flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-inner`}>
        <Icon className="w-6 h-6 text-white" />
      </div>
      <div className="relative flex-1">
        <h3 className="font-brand font-bold text-slate-800 text-lg group-hover:text-slate-900 transition-colors">{title}</h3>
        <p className="text-xs text-slate-500 font-medium group-hover:text-slate-600 font-sans">{desc}</p>
      </div>
      <div className={`relative w-8 h-8 rounded-full flex items-center justify-center opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300 text-${themeColor}-600`}>
        <ChevronLeft className="w-5 h-5 rotate-180" />
      </div>
    </button>
  );

  return (
    <div className="min-h-screen flex w-full bg-slate-50 font-sans overflow-hidden">
      <style>{`
        @keyframes float {
          0% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
          100% { transform: translate(0px, 0px) scale(1); }
        }
        .animate-float {
          animation: float 20s ease-in-out infinite;
        }
        .animate-float-delayed {
          animation: float 25s ease-in-out infinite reverse;
        }
      `}</style>

      {/* Left Side - Rich Image Background */}
      <div className="hidden lg:flex lg:w-5/12 relative bg-slate-900 text-white overflow-hidden shadow-2xl z-10">
        <div 
            className="absolute inset-0 bg-cover bg-center transition-transform duration-[40s] hover:scale-110"
            style={{ backgroundImage: "url('https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80')" }}
        />
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-950 via-slate-900/90 to-blue-900/90 mix-blend-multiply"></div>
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
        
        <div className="relative z-10 p-12 flex flex-col justify-between h-full">
          {/* Logo Section */}
          <div className="flex items-center gap-3">
             <div className="bg-gradient-to-br from-indigo-500 to-purple-600 p-2.5 rounded-xl shadow-lg shadow-indigo-500/30 ring-1 ring-white/20 transform rotate-3 hover:rotate-6 transition-transform">
                <Navigation className="w-6 h-6 text-white transform -rotate-45 translate-x-0.5 translate-y-0.5" fill="currentColor" />
             </div>
             <span className="text-3xl font-brand font-bold tracking-tight text-white drop-shadow-md">Vyhan</span>
          </div>
          
          <div className="mb-12">
            <h1 className="text-4xl xl:text-5xl font-brand font-extrabold leading-tight mb-6 tracking-tight">
              Logistics for the <br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-300 via-purple-300 to-pink-300">
                Next Generation.
              </span>
            </h1>
            <p className="text-slate-300 text-lg max-w-md leading-relaxed font-light font-sans">
              Vyhan automates your entire supply chain with intelligent tracking, real-time analytics, and seamless coordination.
            </p>
            
            <div className="flex gap-6 mt-10 items-center">
                <div className="flex -space-x-4">
                    {[1,2,3,4].map(i => (
                        <div key={i} className="w-12 h-12 rounded-full border-2 border-slate-900 bg-slate-800 flex items-center justify-center overflow-hidden shadow-lg ring-2 ring-white/10">
                             <img src={`https://i.pravatar.cc/100?img=${i+10}`} alt="User" className="w-full h-full object-cover opacity-90" />
                        </div>
                    ))}
                </div>
                <div className="h-10 w-px bg-white/20"></div>
                <div className="flex flex-col justify-center">
                    <div className="text-2xl font-bold text-white font-brand">10k+</div>
                    <span className="text-xs text-slate-400 font-medium tracking-wide uppercase font-sans">Daily Shipments</span>
                </div>
            </div>
          </div>
          
          <div className="flex justify-between items-center text-xs text-slate-400 font-medium tracking-wide border-t border-white/10 pt-6 font-sans">
             <span>© 2025 VYHAN INC.</span>
             <div className="flex gap-4">
                <span className="hover:text-white cursor-pointer transition-colors">PRIVACY</span>
                <span className="hover:text-white cursor-pointer transition-colors">TERMS</span>
             </div>
          </div>
        </div>
      </div>

      {/* Right Side - Dynamic Form Container */}
      <div className="w-full lg:w-7/12 flex items-center justify-center p-6 relative bg-slate-50">
        
        {/* Dynamic Background Blobs */}
        <div className="absolute top-[-10%] right-[-5%] w-[600px] h-[600px] bg-purple-300 rounded-full blur-[120px] opacity-30 animate-float pointer-events-none mix-blend-multiply"></div>
        <div className="absolute bottom-[-10%] left-[-5%] w-[500px] h-[500px] bg-indigo-300 rounded-full blur-[100px] opacity-30 animate-float-delayed pointer-events-none mix-blend-multiply"></div>
        <div className="absolute top-[40%] left-[30%] w-[300px] h-[300px] bg-blue-300 rounded-full blur-[80px] opacity-30 animate-pulse pointer-events-none mix-blend-multiply"></div>

        <div className="w-full max-w-[440px] relative z-10">
          
          {!role ? (
            <div className="bg-white/60 backdrop-blur-xl p-8 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white ring-1 ring-white/50 animate-fade-in-up">
              <div className="text-center mb-10">
                <div className="inline-flex justify-center items-center w-16 h-16 rounded-2xl bg-gradient-to-tr from-white to-slate-100 text-slate-700 mb-6 shadow-lg ring-1 ring-slate-100">
                    <Lock className="w-7 h-7 text-indigo-600" />
                </div>
                <h2 className="text-3xl font-brand font-bold text-slate-900 tracking-tight">Welcome to Vyhan</h2>
                <p className="text-slate-500 mt-3 text-sm font-medium font-sans">Select your portal to access the dashboard</p>
              </div>

              <div className="space-y-4">
                <RoleButton 
                  title="Company Owner" 
                  desc="Global Analytics & Control" 
                  icon={Shield} 
                  targetRole={UserRole.SUPER_ADMIN} 
                  themeColor="indigo"
                  ringColor="ring-indigo-100"
                  bgColor="bg-gradient-to-br from-indigo-500 to-purple-600"
                />
                <RoleButton 
                  title="Office Manager" 
                  desc="Branch Shipment Management" 
                  icon={Store} 
                  targetRole={UserRole.OFFICE_ADMIN} 
                  themeColor="teal"
                  ringColor="ring-teal-100"
                  bgColor="bg-gradient-to-br from-teal-500 to-emerald-600"
                />
                
                <div className="relative py-2">
                    <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-slate-300/50"></span></div>
                    <div className="relative flex justify-center text-xs uppercase tracking-widest"><span className="bg-white/30 backdrop-blur px-3 text-slate-400 font-bold rounded-full font-brand">Or</span></div>
                </div>

                <RoleButton 
                  title="Track a Shipment" 
                  desc="Public Tracking Search" 
                  icon={Search} 
                  targetRole={UserRole.PUBLIC} 
                  themeColor="sky"
                  ringColor="ring-sky-100"
                  bgColor="bg-gradient-to-br from-sky-500 to-blue-600"
                />
              </div>
            </div>
          ) : (
            <div className="bg-white/70 backdrop-blur-2xl p-8 rounded-3xl shadow-2xl border border-white ring-1 ring-white/60 relative transition-all animate-fade-in-up">
              <button 
                onClick={resetSelection}
                className="absolute top-6 left-6 p-2 rounded-xl hover:bg-white/80 text-slate-400 hover:text-slate-700 transition-colors shadow-sm ring-1 ring-transparent hover:ring-slate-100"
                title="Go Back"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>

              <div className="text-center mb-8 pt-6">
                <div className={`inline-flex justify-center items-center w-20 h-20 rounded-3xl mb-6 shadow-xl ring-4 ring-white 
                    ${role === UserRole.SUPER_ADMIN ? 'bg-gradient-to-br from-indigo-500 to-purple-600 shadow-indigo-200' : ''}
                    ${role === UserRole.OFFICE_ADMIN ? 'bg-gradient-to-br from-teal-500 to-emerald-600 shadow-teal-200' : ''}
                    ${role === UserRole.PUBLIC ? 'bg-gradient-to-br from-sky-500 to-blue-600 shadow-sky-200' : ''}
                `}>
                    {role === UserRole.SUPER_ADMIN && <Shield className="w-10 h-10 text-white" />}
                    {role === UserRole.OFFICE_ADMIN && <Store className="w-10 h-10 text-white" />}
                    {role === UserRole.PUBLIC && <Search className="w-10 h-10 text-white" />}
                </div>
                <h2 className="text-3xl font-brand font-bold text-slate-900 tracking-tight">
                  {role === UserRole.SUPER_ADMIN && 'Admin Portal'}
                  {role === UserRole.OFFICE_ADMIN && 'Branch Portal'}
                  {role === UserRole.PUBLIC && 'Public Tracking'}
                </h2>
                <p className="text-slate-500 mt-2 text-sm font-medium font-sans">
                   {role === UserRole.PUBLIC ? 'Enter details to track instantly' : 'Secure login to your workspace'}
                </p>
              </div>

              <form onSubmit={handleLogin} className="space-y-6">
                
                {role === UserRole.OFFICE_ADMIN && (
                   <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-700 uppercase tracking-wide ml-1 font-brand">Select Branch</label>
                    <div className="relative group">
                        <Store className="absolute left-4 top-4 w-5 h-5 text-slate-400 group-focus-within:text-teal-600 transition-colors" />
                        <select 
                            className="w-full pl-12 p-4 bg-white/50 border border-slate-200 rounded-2xl text-slate-900 outline-none focus:ring-4 focus:ring-teal-500/10 focus:border-teal-500 transition-all text-sm font-bold appearance-none cursor-pointer hover:bg-white"
                            value={selectedOffice}
                            onChange={(e) => setSelectedOffice(e.target.value)}
                        >
                        {offices.map(office => (
                            <option key={office.id} value={office.id}>{office.name} ({office.city})</option>
                        ))}
                        </select>
                        <div className="absolute right-4 top-4 pointer-events-none">
                            <ChevronLeft className="w-5 h-5 text-slate-400 -rotate-90" />
                        </div>
                    </div>
                   </div>
                )}

                {role !== UserRole.PUBLIC && (
                  <div className="space-y-2">
                    <div className="flex justify-between items-center ml-1">
                        <label className="text-xs font-bold text-slate-700 uppercase tracking-wide font-brand">Password</label>
                        <span className={`text-xs cursor-pointer hover:underline font-bold transition-colors font-brand
                            ${role === UserRole.SUPER_ADMIN ? 'text-indigo-600' : 'text-teal-600'}
                        `}>Forgot Password?</span>
                    </div>
                    <div className="relative group">
                      <Lock className={`absolute left-4 top-4 w-5 h-5 text-slate-400 transition-colors
                          ${role === UserRole.SUPER_ADMIN ? 'group-focus-within:text-indigo-600' : 'group-focus-within:text-teal-600'}
                      `} />
                      <input 
                        type="password" 
                        placeholder="••••••••" 
                        className={`w-full pl-12 p-4 bg-white/50 border border-slate-200 rounded-2xl text-slate-900 outline-none focus:ring-4 transition-all font-bold placeholder:text-slate-300 hover:bg-white font-sans
                            ${role === UserRole.SUPER_ADMIN ? 'focus:ring-indigo-500/10 focus:border-indigo-500' : 'focus:ring-teal-500/10 focus:border-teal-500'}
                        `}
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        autoFocus
                      />
                    </div>
                  </div>
                )}

                {role !== UserRole.PUBLIC && (
                    <div className="flex items-center gap-3 ml-1">
                        <button 
                            type="button"
                            onClick={() => setRememberMe(!rememberMe)}
                            className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all 
                                ${rememberMe && role === UserRole.SUPER_ADMIN ? 'bg-indigo-600 border-indigo-600 text-white' : ''}
                                ${rememberMe && role === UserRole.OFFICE_ADMIN ? 'bg-teal-600 border-teal-600 text-white' : ''}
                                ${!rememberMe ? 'bg-transparent border-slate-300 hover:border-slate-400' : ''}
                            `}
                        >
                            {rememberMe && <Check className="w-4 h-4" strokeWidth={3} />}
                        </button>
                        <span className="text-sm text-slate-600 select-none cursor-pointer font-medium font-sans" onClick={() => setRememberMe(!rememberMe)}>Keep me logged in</span>
                    </div>
                )}

                {error && (
                  <div className="p-4 bg-rose-50/80 backdrop-blur border border-rose-200 text-rose-600 text-sm rounded-2xl flex items-start gap-3 animate-pulse shadow-sm">
                    <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                    <span className="font-medium font-sans">{error}</span>
                  </div>
                )}

                <button 
                  type="submit"
                  disabled={loading}
                  className={`w-full py-4 rounded-2xl font-bold text-sm text-white shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed hover:-translate-y-1 hover:shadow-2xl font-brand
                    ${role === UserRole.SUPER_ADMIN ? 'bg-gradient-to-r from-indigo-600 to-purple-600 shadow-indigo-500/30' : ''}
                    ${role === UserRole.OFFICE_ADMIN ? 'bg-gradient-to-r from-teal-600 to-emerald-600 shadow-teal-500/30' : ''}
                    ${role === UserRole.PUBLIC ? 'bg-gradient-to-r from-sky-600 to-blue-600 shadow-sky-500/30' : ''}
                  `}
                >
                  {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                  {role === UserRole.PUBLIC ? 'Start Tracking' : 'Sign In to Dashboard'}
                </button>
              </form>
            </div>
          )}
          
          <div className="mt-8 text-center">
             <p className="text-slate-400 text-xs font-medium font-sans">
                {role ? 'Need help accessing your account?' : 'Having trouble?'} <a href="#" className="text-slate-600 font-bold hover:text-slate-900 hover:underline transition-colors">Contact Support</a>
             </p>
          </div>
        </div>
      </div>
    </div>
  );
};