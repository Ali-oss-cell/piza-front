import { apiRequest } from "@/lib/api-client";
import type { StoreInquiry, SubmitInquiryPayload } from "@/types/inquiry";

export function submitInquiry(
  payload: SubmitInquiryPayload,
  brandSlug?: string
): Promise<StoreInquiry> {
  return apiRequest<StoreInquiry>("/inquiries", {
    method: "POST",
    brandSlug,
    body: JSON.stringify(payload),
  });
}

export function fetchInquiries(token: string, brandSlug?: string): Promise<StoreInquiry[]> {
  return apiRequest<StoreInquiry[]>("/inquiries", { token, brandSlug });
}

export function updateInquiryStatus(
  token: string,
  inquiryId: string,
  status: StoreInquiry["status"],
  brandSlug?: string
): Promise<StoreInquiry> {
  return apiRequest<StoreInquiry>(`/inquiries/${inquiryId}`, {
    method: "PATCH",
    token,
    brandSlug,
    body: JSON.stringify({ status }),
  });
}
