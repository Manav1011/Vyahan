export enum UserRole {
  SUPER_ADMIN = 'SUPER_ADMIN',
  OFFICE_ADMIN = 'OFFICE_ADMIN',
  PUBLIC = 'PUBLIC'
}

export interface Office {
  id: string;
  name: string;
  code: string; // e.g., NYC, BOS
}

export interface User {
  id: string;
  name: string;
  role: UserRole;
  officeId?: string; // Only for OFFICE_ADMIN
}

export enum ParcelStatus {
  BOOKED = 'BOOKED',
  IN_TRANSIT = 'IN_TRANSIT',
  ARRIVED = 'ARRIVED',
  DELIVERED = 'DELIVERED'
}

export enum PaymentMode {
  SENDER_PAYS = 'SENDER_PAYS',
  RECEIVER_PAYS = 'RECEIVER_PAYS'
}

export interface TrackingEvent {
  status: ParcelStatus;
  timestamp: number;
  location: string; // Office Name or "Transit"
  note?: string;
}

export interface Parcel {
  id: string;
  trackingId: string;
  senderName: string;
  senderPhone: string;
  receiverName: string;
  receiverPhone: string;
  sourceOfficeId: string;
  destinationOfficeId: string;
  weightKg: number;
  quantity: number; // Added quantity
  type: string; // e.g., "Box", "Document"
  paymentMode: PaymentMode;
  price: number;
  currentStatus: ParcelStatus;
  history: TrackingEvent[];
  createdAt: number;
}

export interface NotificationLog {
  id: string;
  timestamp: number;
  recipient: string; // "Sender" or "Receiver"
  phone: string;
  message: string;
}