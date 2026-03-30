import type { ISeoFields } from './seo';

export interface ICategory {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  icon?: string;
  order: number;
  parentCategory?: string;
  seo: ISeoFields;
  createdAt: Date;
  updatedAt: Date;
}
