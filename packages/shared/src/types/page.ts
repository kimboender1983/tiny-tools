import type { ISeoFields } from './seo';

export interface IFaqItem {
  question: string;
  answer: string;
}

export type PageStatus = 'draft' | 'published' | 'archived';
export type PageTemplate = 'tool' | 'static' | 'landing';
export type PageNavPlacement = 'none' | 'header' | 'footer' | 'both';

export interface INavItem {
  title: string;
  slug: string;
  path: string;
  order?: number;
}

export interface IFooterSection {
  title: string;
  order: number;
  items: INavItem[];
}

export interface IPage {
  _id: string;
  title: string;
  slug: string;
  content: string;
  excerpt?: string;
  category?: string;
  status: PageStatus;
  template: PageTemplate;
  seo: ISeoFields;
  faq?: IFaqItem[];
  relatedPages?: string[];
  navPlacement?: PageNavPlacement;
  navLabel?: string;
  footerGroup?: string;
  footerGroupOrder?: number;
  order?: number;
  publishedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}
