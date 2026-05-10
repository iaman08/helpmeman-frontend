/* ─── Enums ─── */

export type Role = "USER" | "MENTOR" | "ADMIN";
export type InstitutionType = "COLLEGE" | "COMPANY" | "STARTUP";
export type ApprovalStatus = "PENDING" | "APPROVED" | "REJECTED";
export type BookingStatus =
  | "PENDING"
  | "CONFIRMED"
  | "COMPLETED"
  | "CANCELLED"
  | "NO_SHOW";
export type PaymentStatus = "UNPAID" | "PAID" | "REFUNDED";
export type ThreadStatus = "OPEN" | "LOCKED" | "BOOKED" | "CLOSED";
export type SenderRole = "USER" | "MENTOR";

/* ─── Models ─── */

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
  avatar?: string | null;
  role: Role;
  isEmailVerified: boolean;
  createdAt: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  icon?: string | null;
  description?: string | null;
  isActive: boolean;
}

export interface Mentor {
  id: string;
  userId: string;
  user?: Pick<User, "name" | "email">;
  displayName: string;
  bio: string;
  avatar?: string | null;
  institutionType: InstitutionType;
  institutionName: string;
  institutionEmail: string;
  department?: string | null;
  graduationYear?: number | null;
  currentRole?: string | null;
  company?: string | null;
  linkedinUrl?: string | null;
  expertise: string[];
  categoryId: string;
  category?: Category;
  approvalStatus: ApprovalStatus;
  rejectionReason?: string | null;
  isActive: boolean;
  pricePerSession: number;
  sessionDuration: number;
  totalSessions: number;
  rating: number;
  reviews?: Review[];
  verificationDocs?: VerificationDoc[];
  createdAt: string;
}

export interface Availability {
  id: string;
  mentorId: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  isActive: boolean;
}

export interface Booking {
  id: string;
  userId: string;
  user?: Pick<User, "name" | "email" | "avatar">;
  mentorId: string;
  mentor?: Pick<Mentor, "displayName" | "avatar" | "institutionName">;
  scheduledAt: string;
  durationMinutes: number;
  status: BookingStatus;
  meetLink?: string | null;
  paymentId?: string | null;
  paymentStatus: PaymentStatus;
  amountPaid: number;
  userNotes?: string | null;
  mentorNotes?: string | null;
  review?: Review | null;
  createdAt: string;
}

export interface Review {
  id: string;
  bookingId: string;
  userId: string;
  user?: Pick<User, "name" | "avatar">;
  mentorId: string;
  rating: number;
  comment?: string | null;
  isVisible: boolean;
  createdAt: string;
}

export interface VerificationDoc {
  id: string;
  mentorId: string;
  docType: string;
  fileUrl: string;
  uploadedAt: string;
}

export interface Notification {
  id: string;
  userId?: string | null;
  mentorId?: string | null;
  type: string;
  title: string;
  body: string;
  isRead: boolean;
  createdAt: string;
}

export interface Earning {
  id: string;
  mentorId: string;
  bookingId: string;
  amount: number;
  status: string;
  paidAt?: string | null;
  createdAt: string;
}

export interface ChatThread {
  id: string;
  userId: string;
  user?: Pick<User, "name" | "avatar">;
  mentorId: string;
  mentor?: Pick<Mentor, "displayName" | "avatar" | "id">;
  status: ThreadStatus;
  userMsgCount: number;
  mentorMsgCount: number;
  isLockedForBooking: boolean;
  bookingId?: string | null;
  messages?: ChatMessage[];
  unreadCount?: number;
  createdAt: string;
  updatedAt: string;
}

export interface ChatMessage {
  id: string;
  threadId: string;
  senderId: string;
  senderRole: SenderRole;
  body: string;
  isRead: boolean;
  createdAt: string;
}

/* ─── API Response Shapes ─── */

export interface PaginatedResponse<T> {
  total: number;
  page: number;
  totalPages: number;
  [key: string]: T[] | number;
}

export interface AuthResponse {
  user: User;
  mentor?: { id: string; approvalStatus: ApprovalStatus; isActive?: boolean } | null;
  accessToken: string;
  refreshToken: string;
}

export interface MentorSearchResponse {
  mentors: Mentor[];
  total: number;
  page: number;
  totalPages: number;
}

export interface MentorAvailabilityResponse {
  availabilities: Availability[];
  bookedSlots: { scheduledAt: string; durationMinutes: number }[];
}
