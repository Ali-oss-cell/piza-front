export interface TradingHours {
  label: string;
  hours: string;
}

export interface MapPosition {
  x: number;
  y: number;
}

export interface Location {
  id: string;
  name: string;
  suburb: string;
  isOpen: boolean;
  address: string;
  phone: string;
  email: string;
  tradingHours: TradingHours[];
  mapPosition: MapPosition;
  directionsUrl: string;
  mapEmbedUrl?: string;
}

export function buildMapEmbedUrl(address: string): string {
  return `https://maps.google.com/maps?q=${encodeURIComponent(address)}&hl=en&z=16&output=embed`;
}
