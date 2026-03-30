export interface ISeoFields {
  metaTitle: string;
  metaDescription: string;
  canonicalUrl?: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  twitterCard?: 'summary' | 'summary_large_image';
  noIndex?: boolean;
  focusKeyword?: string;
  secondaryKeywords?: string[];
  structuredData?: Record<string, unknown>;
}
