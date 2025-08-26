export interface Review {
  id: string;
  propertyName: string;
  guestName: string;
  review: string;
  rating: number;
  categories: { [key: string]: number };
  date: string;
  channel: string;
  type: string;
  isApproved: boolean;
}

export interface Property {
  name: string;
  totalReviews: number;
  averageRating: number;
  approvedReviews?: Review[];
}