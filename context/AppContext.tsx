import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { User, Office, Parcel, ParcelStatus, TrackingEvent, UserRole, NotificationLog } from '../types';
import { fetchHealth, fetchBranches, loginOrganization, loginBranch, logoutUser, createApiClient } from '../services/apiService';
import { jwtDecode } from 'jwt-decode';
import { useMemo } from 'react';



interface AppContextType {
  currentUser: User | null;
  organization: any | null;
  offices: Office[];
  parcels: Parcel[];
  notifications: NotificationLog[];
  loading: boolean;
  login: (role: UserRole, credentials: { id?: string, password?: string }) => Promise<{ success: boolean, message: string }>;
  logout: () => Promise<void>;
  addOffice: (office: Office) => void;
  createParcel: (parcel: Omit<Parcel, 'id' | 'trackingId' | 'history' | 'currentStatus' | 'createdAt'>) => void;
  updateParcelStatus: (parcelId: string, newStatus: ParcelStatus, note?: string) => void;
  getOfficeName: (id: string) => string;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

// MOCK DATA
const MOCK_OFFICES: Office[] = [
  { id: 'off_1', name: 'Central Hub NY', code: 'NYC' },
  { id: 'off_2', name: 'Boston Branch', code: 'BOS' },
  { id: 'off_3', name: 'Philly Station', code: 'PHL' },
];

const MOCK_USERS: User[] = [
  { id: 'u_1', name: 'Super Admin', role: UserRole.SUPER_ADMIN },
  { id: 'u_2', name: 'NY Manager', role: UserRole.OFFICE_ADMIN, officeId: 'off_1' },
  { id: 'u_3', name: 'Boston Manager', role: UserRole.OFFICE_ADMIN, officeId: 'off_2' },
];

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [organization, setOrganization] = useState<any | null>(null);
  const [offices, setOffices] = useState<Office[]>(MOCK_OFFICES);
  const [parcels, setParcels] = useState<Parcel[]>([]);
  const [notifications, setNotifications] = useState<NotificationLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initializeApp = async () => {
      // Use a temporary client for initial setup (without logout yet)
      const initApi = createApiClient();

      try {
        const healthData = await initApi.get('/organization/health/');
        if (healthData.status_code === 200) {
          setOrganization(healthData.data);

          let mappedOffices: Office[] = [];
          // Use bundled branches from health check
          if (healthData.data.branches) {
            mappedOffices = healthData.data.branches.map((b: any) => ({
              id: b.slug,
              name: b.title,
              code: b.slug.substring(0, 3).toUpperCase()
            }));
            setOffices(mappedOffices);
          }

          // Check if we have a saved token and restore session
          const access = localStorage.getItem('access_token');
          if (access) {
            try {
              const decoded: any = jwtDecode(access);
              const currentTime = Date.now() / 1000;
              if (decoded.exp > currentTime) {
                const user: User = {
                  id: decoded.sub_id,
                  name: decoded.sub_type === 'org'
                    ? healthData.data.title
                    : mappedOffices.find((o: any) => o.id === decoded.sub_id)?.name || 'Branch Manager',
                  role: decoded.sub_type === 'org' ? UserRole.SUPER_ADMIN : UserRole.OFFICE_ADMIN,
                  officeId: decoded.sub_type === 'branch' ? decoded.sub_id : undefined
                };
                setCurrentUser(user);
              } else {
                localStorage.removeItem('access_token');
                localStorage.removeItem('refresh_token');
              }
            } catch (e) {
              console.error("Token restore failed:", e);
            }
          }
        }
      } catch (error) {
        console.error("Failed to initialize app:", error);
        setOrganization(null);
      } finally {
        setLoading(false);
      }
    };

    initializeApp();
  }, []);

  // Helper to log "SMS"
  const sendFakeSMS = (recipient: string, phone: string, message: string) => {
    const newLog: NotificationLog = {
      id: Date.now().toString() + Math.random(),
      timestamp: Date.now(),
      recipient,
      phone,
      message
    };
    setNotifications(prev => [newLog, ...prev]);
  };

  const login = async (role: UserRole, credentials: { id?: string, password?: string }) => {
    try {
      let data;
      if (role === UserRole.SUPER_ADMIN) {
        data = await loginOrganization(organization?.slug, credentials.password || '');
      } else if (role === UserRole.OFFICE_ADMIN) {
        data = await loginBranch(credentials.id || '', credentials.password || '');
      } else {
        // Public/Tracking - stays mock/session-less for now
        setCurrentUser({ id: 'public', name: 'Guest', role: UserRole.PUBLIC });
        return { success: true, message: 'Logged in as guest' };
      }

      if (data.status_code === 200) {
        const { access, refresh } = data.data;
        localStorage.setItem('access_token', access);
        localStorage.setItem('refresh_token', refresh);

        const decoded: any = jwtDecode(access);
        const name = role === UserRole.SUPER_ADMIN
          ? data.data.organization.title
          : data.data.branch.title;

        const user: User = {
          id: decoded.sub_id,
          name: name,
          role: role,
          officeId: role === UserRole.OFFICE_ADMIN ? decoded.sub_id : undefined
        };

        setCurrentUser(user);
        return { success: true, message: data.message };
      }
      else {
        return { success: false, message: data.message || 'Login failed' };
      }
    } catch (error: any) {
      console.error("Login error:", error);
      return { success: false, message: error.message || 'An error occurred during login' };
    }
  };

  const logout = useCallback(async () => {
    const refresh = localStorage.getItem('refresh_token');
    if (refresh) {
      try {
        await logoutUser(refresh);
      } catch (e) {
        console.error("Logout error:", e);
      }
    }
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    setCurrentUser(null);
  }, []);

  const addOffice = (office: Office) => {
    setOffices([...offices, office]);
  };

  const getOfficeName = (id: string) => offices.find(o => o.id === id)?.name || 'Unknown Office';

  const createParcel = (data: Omit<Parcel, 'id' | 'trackingId' | 'history' | 'currentStatus' | 'createdAt'>) => {
    const trackingId = `TRK-${Math.floor(100000 + Math.random() * 900000)}`;
    const sourceName = getOfficeName(data.sourceOfficeId);

    const newParcel: Parcel = {
      ...data,
      id: `p_${Date.now()}`,
      trackingId,
      currentStatus: ParcelStatus.BOOKED,
      createdAt: Date.now(),
      history: [{
        status: ParcelStatus.BOOKED,
        timestamp: Date.now(),
        location: sourceName,
        note: 'Parcel booked at source office'
      }]
    };

    setParcels(prev => [newParcel, ...prev]);

    // Send SMS
    sendFakeSMS('Sender', data.senderPhone, `Your parcel ${trackingId} to ${data.receiverName} is booked!`);
    sendFakeSMS('Receiver', data.receiverPhone, `A parcel from ${data.senderName} (${trackingId}) has been booked for you.`);
  };

  const updateParcelStatus = (parcelId: string, newStatus: ParcelStatus, note: string = '') => {
    setParcels(prev => prev.map(p => {
      if (p.id !== parcelId) return p;

      // Determine location based on user (assume current user handles it)
      let location = 'Transit';
      if (currentUser?.officeId) {
        location = getOfficeName(currentUser.officeId);
      } else if (currentUser?.role === UserRole.SUPER_ADMIN) {
        location = "HQ Update";
      }

      const updatedHistory = [...p.history, {
        status: newStatus,
        timestamp: Date.now(),
        location,
        note
      }];

      // SMS Logic based on status
      if (newStatus === ParcelStatus.IN_TRANSIT) {
        sendFakeSMS('Receiver', p.receiverPhone, `Parcel ${p.trackingId} is now in transit.`);
      } else if (newStatus === ParcelStatus.ARRIVED) {
        sendFakeSMS('Receiver', p.receiverPhone, `Good news! Parcel ${p.trackingId} has arrived at destination office.`);
      } else if (newStatus === ParcelStatus.DELIVERED) {
        sendFakeSMS('Sender', p.senderPhone, `Parcel ${p.trackingId} was successfully delivered.`);
        sendFakeSMS('Receiver', p.receiverPhone, `You have collected parcel ${p.trackingId}. Thanks!`);
      }

      return {
        ...p,
        currentStatus: newStatus,
        history: updatedHistory
      };
    }));
  };

  return (
    <AppContext.Provider value={{
      currentUser,
      organization,
      offices,
      parcels,
      notifications,
      loading,
      login,
      logout,
      addOffice,
      createParcel,
      updateParcelStatus,
      getOfficeName
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error("useApp must be used within AppProvider");
  return context;
};