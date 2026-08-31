export type InquiryType = "CONTACT" | "CAREERS" | "CATERING";
export type InquiryStatus = "NEW" | "READ" | "ARCHIVED";

export interface StoreInquiry {
  id: string;
  brandId: string;
  type: InquiryType;
  status: InquiryStatus;
  name: string;
  email: string;
  phone: string | null;
  subject: string | null;
  message: string;
  payload: Record<string, unknown> | null;
  createdAt: string;
  readAt: string | null;
}

export interface SubmitInquiryPayload {
  type: InquiryType;
  name: string;
  email: string;
  phone?: string;
  subject?: string;
  message: string;
  payload?: Record<string, unknown>;
}
