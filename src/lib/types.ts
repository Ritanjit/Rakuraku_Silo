// Rakuraku_Silo Type Definitions
// Privacy-first, local-only form filler for Google Forms

// Context categories for organizing user data
export type ContextCategory = 
  | 'personal'
  | 'work'
  | 'business'
  | 'job_application'
  | 'medical'
  | 'travel'
  | 'resume';

// All available context categories
export const CONTEXT_CATEGORIES: ContextCategory[] = [
  'personal',
  'work',
  'business',
  'job_application',
  'medical',
  'travel',
  'resume'
];

// Human-readable names for categories
export const CATEGORY_LABELS: Record<ContextCategory, string> = {
  personal: 'Personal',
  work: 'Work',
  business: 'Business',
  job_application: 'Job Application',
  medical: 'Medical',
  travel: 'Travel',
  resume: 'Resume'
};

// Category icons (emoji for now, can be replaced with SVG icons)
export const CATEGORY_ICONS: Record<ContextCategory, string> = {
  personal: '👤',
  work: '💼',
  business: '🏢',
  job_application: '📋',
  medical: '🏥',
  travel: '✈️',
  resume: '📄'
};

// Field types supported for data entry
export type FieldType = 'text' | 'email' | 'phone' | 'date' | 'textarea' | 'select' | 'url' | 'number';

// Field within a category
export interface ProfileField {
  id: string;
  label: string;           // Display label (e.g., "Full Name")
  value: string;           // User's data
  keywords: string[];      // Fuzzy match keywords (e.g., ["name", "full name", "your name"])
  fieldType: FieldType;
  placeholder?: string;    // Input placeholder
  isRequired?: boolean;
}

// Category containing multiple fields
export interface ProfileCategory {
  id: ContextCategory;
  name: string;            // Display name (e.g., "Job Application")
  icon: string;            // Icon identifier
  fields: ProfileField[];
  createdAt: string;
  updatedAt: string;
}

// User profile containing all categories
export interface UserProfile {
  id: string;
  name: string;            // Profile name (e.g., "Ritanjit's Profile")
  categories: Record<ContextCategory, ProfileCategory>;
  activeCategory: ContextCategory;  // Currently selected for autofill
  createdAt: string;
  updatedAt: string;
}

// Extension settings
export interface AppSettings {
  theme: 'light' | 'dark' | 'system';
  autofillEnabled: boolean;
  showNotifications: boolean;
  fuzzyMatchThreshold: number;  // 0.0 to 1.0
}

// Message types for communication between popup, background, and content scripts
export type MessageType = 
  | 'FILL_FORM'
  | 'FILL_FORM_RESULT'
  | 'GET_FORM_FIELDS'
  | 'FORM_FIELDS_RESULT'
  | 'PROFILE_UPDATED';

export interface ExtensionMessage {
  type: MessageType;
  payload?: unknown;
}

export interface FillFormMessage extends ExtensionMessage {
  type: 'FILL_FORM';
  payload: {
    category: ContextCategory;
    fields: ProfileField[];
  };
}

export interface FillFormResultMessage extends ExtensionMessage {
  type: 'FILL_FORM_RESULT';
  payload: {
    success: boolean;
    filledCount: number;
    totalFields: number;
  };
}

// Default fields for each category (used for onboarding)
export const DEFAULT_FIELDS: Record<ContextCategory, Partial<ProfileField>[]> = {
  personal: [
    { label: 'Full Name', fieldType: 'text', keywords: ['name', 'full name', 'your name'] },
    { label: 'Email', fieldType: 'email', keywords: ['email', 'email address', 'e-mail'] },
    { label: 'Phone', fieldType: 'phone', keywords: ['phone', 'mobile', 'contact number', 'phone number'] },
    { label: 'Date of Birth', fieldType: 'date', keywords: ['dob', 'birth', 'birthday', 'date of birth'] },
    { label: 'Address', fieldType: 'textarea', keywords: ['address', 'home address', 'residential'] },
  ],
  work: [
    { label: 'Work Email', fieldType: 'email', keywords: ['work email', 'office email', 'professional email'] },
    { label: 'Company Name', fieldType: 'text', keywords: ['company', 'organization', 'employer', 'workplace'] },
    { label: 'Job Title', fieldType: 'text', keywords: ['title', 'position', 'role', 'designation'] },
    { label: 'Work Phone', fieldType: 'phone', keywords: ['work phone', 'office phone', 'office number'] },
    { label: 'Office Address', fieldType: 'textarea', keywords: ['office address', 'work address'] },
  ],
  business: [
    { label: 'Business Name', fieldType: 'text', keywords: ['business name', 'company name', 'entity name'] },
    { label: 'Tax ID / GST', fieldType: 'text', keywords: ['tax', 'gst', 'tin', 'tax id', 'gstin'] },
    { label: 'Business Email', fieldType: 'email', keywords: ['business email'] },
    { label: 'Business Address', fieldType: 'textarea', keywords: ['business address', 'registered address'] },
    { label: 'Business Phone', fieldType: 'phone', keywords: ['business phone'] },
  ],
  job_application: [
    { label: 'LinkedIn URL', fieldType: 'url', keywords: ['linkedin', 'linkedin url', 'linkedin profile'] },
    { label: 'Portfolio URL', fieldType: 'url', keywords: ['portfolio', 'website', 'personal website'] },
    { label: 'GitHub URL', fieldType: 'url', keywords: ['github', 'github url', 'github profile'] },
    { label: 'Years of Experience', fieldType: 'number', keywords: ['experience', 'years of experience', 'yoe'] },
    { label: 'Cover Letter', fieldType: 'textarea', keywords: ['cover letter', 'motivation', 'why join'] },
  ],
  medical: [
    { label: 'Blood Group', fieldType: 'text', keywords: ['blood', 'blood group', 'blood type'] },
    { label: 'Emergency Contact', fieldType: 'phone', keywords: ['emergency', 'emergency contact', 'kin'] },
    { label: 'Allergies', fieldType: 'textarea', keywords: ['allergies', 'allergic', 'allergy'] },
    { label: 'Medical Conditions', fieldType: 'textarea', keywords: ['conditions', 'illness', 'health issues'] },
    { label: 'Doctor Contact', fieldType: 'phone', keywords: ['doctor', 'physician', 'doctor contact'] },
  ],
  travel: [
    { label: 'Passport Number', fieldType: 'text', keywords: ['passport', 'passport number', 'passport no'] },
    { label: 'Passport Expiry', fieldType: 'date', keywords: ['passport expiry', 'expiry date'] },
    { label: 'Nationality', fieldType: 'text', keywords: ['nationality', 'citizenship', 'country'] },
    { label: 'Frequent Flyer ID', fieldType: 'text', keywords: ['frequent flyer', 'miles', 'loyalty'] },
    { label: 'Travel Preferences', fieldType: 'textarea', keywords: ['preferences', 'travel preferences'] },
  ],
  resume: [
    { label: 'Objective', fieldType: 'textarea', keywords: ['objective', 'summary', 'about me', 'profile summary'] },
    { label: 'Skills', fieldType: 'textarea', keywords: ['skills', 'technical skills', 'expertise'] },
    { label: 'Education', fieldType: 'textarea', keywords: ['education', 'qualification', 'degree'] },
    { label: 'Certifications', fieldType: 'textarea', keywords: ['certifications', 'certificates', 'certified'] },
    { label: 'Languages', fieldType: 'text', keywords: ['languages', 'language', 'spoken languages'] },
  ],
};