export type AffiliateStatus = 'active' | 'inactive';

export interface IAffiliate {
  _id: string;
  name: string;
  slug: string;
  url: string;
  logo?: string;
  description?: string;
  programInfo?: string;
  status: AffiliateStatus;
  createdAt: Date;
  updatedAt: Date;
}

export interface IAffiliateClick {
  _id: string;
  affiliate: string;
  page?: string;
  ip?: string;
  userAgent?: string;
  createdAt: Date;
}

export interface IAffiliateAnalytics {
  affiliateId: string;
  name: string;
  slug: string;
  totalClicks: number;
  topPages: { page: string; count: number }[];
  dailyClicks: { date: string; count: number }[];
}
