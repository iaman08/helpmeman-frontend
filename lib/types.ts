export type Role = "SUPER_ADMIN" | "ADMIN" | "MENTOR" | "STUDENT";
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
export type MessageStatus = "SENDING" | "SENT" | "DELIVERED" | "READ";
export type PresenceStatus = "ONLINE" | "AWAY" | "OFFLINE";

export interface ChatAttachment {
  url: string;
  name: string;
  type: string;
  size: number;
  isImage?: boolean;
}

/* ─── Models ─── */

export interface User {
  id: string;
  name: string;
  username?: string | null;
  email: string;
  phone?: string | null;
  avatar?: string | null;
  role: Role;
  onboardingRole?: string | null;
  currentRole?: string | null;
  isEmailVerified: boolean;
  currency?: string | null;
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
  location?: string | null;
  country?: string | null;
  state?: string | null;
  city?: string | null;
  locality?: string | null;
  postalCode?: string | null;
  activeStatus?: string | null;
  averageResponseTime?: string | null;
  languages?: string[] | string | null;
  experienceYears?: number | null;
  isOnline: boolean;
  googleCalendarConnected?: boolean;
  googleCalendarTimezone?: string | null;
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
  currency: string;
  amountPaidINR?: number | null;
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
  emailSent?: boolean;
  pushSent?: boolean;
  metadata?: Record<string, unknown> | null;
  createdAt: string;
}

export interface NotificationPreferences {
  userId: string;
  emailNotifications: boolean;
  pushNotifications: boolean;
  marketingEmails: boolean;
  accountUpdates: boolean;
  messages: boolean;
  mentorUpdates: boolean;
  updatedAt: string;
}

export interface BlockedDate {
  id: string;
  mentorId: string;
  date: string;
  reason?: string | null;
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
  user?: Pick<User, "id" | "name" | "username" | "email" | "avatar" | "role">;
  mentorId: string;
  mentor?: Pick<Mentor, "displayName" | "avatar" | "id" | "userId">;
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

export interface MessageReaction {
  id: string;
  messageId: string;
  userId: string;
  emoji: string;
  createdAt: string;
}

export interface ChatMessage {
  id: string;
  threadId: string;
  senderId: string;
  senderRole: SenderRole;
  body: string;
  isRead: boolean;
  status: MessageStatus;
  replyToId?: string | null;
  replyTo?: Pick<ChatMessage, "id" | "body" | "senderId" | "senderRole" | "deletedAt"> | null;
  attachments?: ChatAttachment[] | null;
  editedAt?: string | null;
  deletedAt?: string | null;
  createdAt: string;
  reactions?: MessageReaction[];
  // Optimistic UI fields (client-only)
  _tempId?: string;
  _sending?: boolean;
  _failed?: boolean;
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

export interface OTPResponse {
  message: string;
  email: string;
  requiresOTP: boolean;
}

export interface ResetOTPResponse {
  resetToken: string;
  message: string;
}
