
export interface Location {
  latitude: number;
  longitude: number;
}

export type PlaceType = 'market' | 'service' | 'emergency' | 'lifestyle';

export interface PlaceResult {
  title: string;
  uri: string;
  description?: string;
  isPromoted?: boolean;
  isVerified?: boolean;
  lat?: number;
  lng?: number;
  type?: PlaceType;
  distance?: string;
}

export interface RecentPlace extends PlaceResult {
  viewedAt: number;
}

export interface WeatherData {
  temp: string;
  condition: string;
  emoji: string;
  locationName: string;
}

export interface SearchResponse {
  text: string;
  places: PlaceResult[];
  error?: string;
}

export interface Category {
  id: string;
  label: string;
  icon: string;
}

export interface MerchantRequest {
  id: string;
  businessName: string;
  status: 'pending' | 'active';
  bidAmount: number;
  category: string;
  appliedDate: string;
}

export const CATEGORIES: Category[] = [
  { id: 'food', label: 'Food & Drink', icon: '🍔' },
  { id: 'services', label: 'Pro Services', icon: '🛠️' },
  { id: 'shopping', label: 'Local Markets', icon: '🛍️' },
  { id: 'health', label: 'Medical', icon: '🏥' },
  { id: 'emergency', label: 'Emergency', icon: '🚨' },
  { id: 'tech', label: 'Electronics', icon: '💻' }
];

export const SEARCH_SUGGESTIONS = [
  "Farmers markets", "Reliable plumbers", "24/7 Pharmacies", "Auto repair shops", "Tailors near me", "Fresh produce"
];
