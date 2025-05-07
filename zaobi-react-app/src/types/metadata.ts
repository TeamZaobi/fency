// src/types/metadata.ts
export interface MetadataPage {
  id: string;
  path: string;
  title: string;
  lastModifiedDate: string;
  category: string;
  description: string;
  keywords: string[];
  "publish-date": string;
}

export interface Metadata {
  lastUpdated: string;
  pages: MetadataPage[];
} 