export interface CheckoutDetails {
  guestName: string;
  guestEmail: string;
  guestPhone: string;
}

export interface CheckoutAddress {
  deliveryAddressLine1: string;
  deliveryAddressLine2: string;
  deliverySuburb: string;
  deliveryState: string;
  deliveryPostcode: string;
}

export interface CheckoutFormState {
  details: CheckoutDetails;
  address: CheckoutAddress;
  scheduledAt: string;
  notes: string;
}

export const EMPTY_CHECKOUT_DETAILS: CheckoutDetails = {
  guestName: "",
  guestEmail: "",
  guestPhone: "",
};

export const EMPTY_CHECKOUT_ADDRESS: CheckoutAddress = {
  deliveryAddressLine1: "",
  deliveryAddressLine2: "",
  deliverySuburb: "",
  deliveryState: "VIC",
  deliveryPostcode: "",
};

export const EMPTY_CHECKOUT_FORM: CheckoutFormState = {
  details: EMPTY_CHECKOUT_DETAILS,
  address: EMPTY_CHECKOUT_ADDRESS,
  scheduledAt: "",
  notes: "",
};
