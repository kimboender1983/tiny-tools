import type { ISeoFields } from './seo';

export interface IFaqItem {
  question: string;
  answer: string;
}

export type PageStatus = 'draft' | 'published' | 'archived';
export type PageTemplate = 'tool' | 'static' | 'landing';

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
  order?: number;
  publishedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}
