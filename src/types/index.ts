// Project status enum
export type ProjectStatus =
  | 'CREATED'
  | 'GBP_SELECTED'
  | 'GBP_SCRAPED'
  | 'WEBSITE_SCRAPED'
  | 'IMAGES_ANALYZED'
  | 'HTML_GENERATED'
  | 'READY';

// Page status enum
export type PageStatus = 'draft' | 'published' | 'inactive';

// Project model
export interface Project {
  id: string;
  user_id: string;
  generated_hostname: string;
  status: ProjectStatus;
  selected_place_id: string | null;
  selected_website_url: string | null;
  step_gbp_scrape: Record<string, unknown> | null;
  step_website_scrape: Record<string, unknown> | null;
  step_image_analysis: Array<{ s3Url: string; description: string }> | null;
  created_at: Date;
  updated_at: Date;
}

// Page content structure (JSONB)
export interface PageContent {
  html: string;
}

// Page model
export interface Page {
  id: string;
  project_id: string;
  path: string;
  version: number;
  status: PageStatus;
  html_content: PageContent;
  created_at: Date;
  updated_at: Date;
}
