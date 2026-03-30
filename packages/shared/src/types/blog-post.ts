import type { ISeoFields } from './seo';
import type { IFaqItem } from './page';
import type { IAuthor } from './author';
import type { ICategory } from './category';

export type BlogPostStatus = 'draft' | 'published' | 'archived';

export interface IBlogPost {
  _id: string;
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  coverImage?: string;
  category?: string | ICategory;
  tags?: string[];
  status: BlogPostStatus;
  seo: ISeoFields;
  author?: string | IAuthor;
  faq?: IFaqItem[];
  featured?: boolean;
  readingTime?: number;
  relatedPosts?: string[];
  publishedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}
