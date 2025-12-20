
export type UserPlan = 'free' | 'paid';

export interface Profile {
  id: string;
  email: string;
  plan: UserPlan;
  full_name?: string;
}

export interface GBPAuditData {
  businessName: string;
  city: string;
  category: string;
  description: string;
  website?: string;
  hasPhotos: boolean;
  hasReviews: boolean;
}

export interface KeywordRecomendation {
  term: string;
  placement: string;
}

export interface AuditResult {
  score: number;
  businessName: string;
  summary: string;
  categories: {
    primary: string;
    suggested: string[];
  };
  keywords: KeywordRecomendation[];
  attributes: string[];
  descriptionOptimization: string;
  actionPlan: {
    title: string;
    impact: 'High' | 'Medium' | 'Low';
    description: string;
  }[];
  sources: { title: string; uri: string }[];
}

export enum AppState {
  IDLE = 'IDLE',
  AUDITING = 'AUDITING',
  RESULT = 'RESULT',
  ERROR = 'ERROR'
}
