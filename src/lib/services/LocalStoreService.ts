// Rakuraku_Silo Local Storage Service
// All data stored locally using chrome.storage.local - NEVER leaves the device
// Falls back to localStorage for development mode when chrome APIs unavailable

import type {
  UserProfile,
  AppSettings,
  ContextCategory,
  ProfileField,
  ProfileCategory
} from '$lib/types';
import {
  CONTEXT_CATEGORIES,
  CATEGORY_LABELS,
  CATEGORY_ICONS,
  DEFAULT_FIELDS
} from '$lib/types';

// Storage keys
const STORAGE_KEYS = {
  PROFILE: 'rakuraku_profile',
  SETTINGS: 'rakuraku_settings',
  VERSION: 'rakuraku_version'
} as const;

// Default settings
const DEFAULT_SETTINGS: AppSettings = {
  theme: 'dark',
  autofillEnabled: true,
  showNotifications: true,
  fuzzyMatchThreshold: 0.7
};

// Check if running in Chrome extension context
function isChromeExtension(): boolean {
  return typeof chrome !== 'undefined' &&
    typeof chrome.storage !== 'undefined' &&
    typeof chrome.storage.local !== 'undefined';
}

// Generate unique ID
function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}

// Get current ISO timestamp
function now(): string {
  return new Date().toISOString();
}

/**
 * Storage adapter that works in both Chrome extension and development mode
 */
const storageAdapter = {
  async get(key: string): Promise<unknown> {
    if (isChromeExtension()) {
      const result = await chrome.storage.local.get(key);
      return result[key];
    } else {
      // Fallback to localStorage for development
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : null;
    }
  },

  async set(key: string, value: unknown): Promise<void> {
    if (isChromeExtension()) {
      await chrome.storage.local.set({ [key]: value });
    } else {
      // Fallback to localStorage for development
      localStorage.setItem(key, JSON.stringify(value));
    }
  },

  async clear(): Promise<void> {
    if (isChromeExtension()) {
      await chrome.storage.local.clear();
    } else {
      // Clear only our keys from localStorage
      Object.values(STORAGE_KEYS).forEach(key => localStorage.removeItem(key));
    }
  },

  async getBytesInUse(): Promise<number> {
    if (isChromeExtension()) {
      return await chrome.storage.local.getBytesInUse();
    } else {
      // Estimate localStorage usage
      let bytes = 0;
      Object.values(STORAGE_KEYS).forEach(key => {
        const item = localStorage.getItem(key);
        if (item) bytes += item.length * 2; // UTF-16
      });
      return bytes;
    }
  }
};

/**
 * LocalStoreService - Privacy-first storage using chrome.storage.local
 * Falls back to localStorage for development mode
 */
export class LocalStoreService {
  private static instance: LocalStoreService;

  private constructor() {
    console.log('[LocalStoreService] Mode:', isChromeExtension() ? 'Chrome Extension' : 'Development (localStorage)');
  }

  static getInstance(): LocalStoreService {
    if (!LocalStoreService.instance) {
      LocalStoreService.instance = new LocalStoreService();
    }
    return LocalStoreService.instance;
  }

  // =====================
  // Profile Operations
  // =====================

  async getProfile(): Promise<UserProfile | null> {
    try {
      const profile = await storageAdapter.get(STORAGE_KEYS.PROFILE);
      return profile as UserProfile | null;
    } catch (error) {
      console.error('[LocalStoreService] Failed to get profile:', error);
      return null;
    }
  }

  async saveProfile(profile: UserProfile): Promise<void> {
    try {
      profile.updatedAt = now();
      await storageAdapter.set(STORAGE_KEYS.PROFILE, profile);
    } catch (error) {
      console.error('[LocalStoreService] Failed to save profile:', error);
      throw error;
    }
  }

  async createDefaultProfile(name: string = 'My Profile'): Promise<UserProfile> {
    const timestamp = now();
    const categories: Record<ContextCategory, ProfileCategory> = {} as Record<ContextCategory, ProfileCategory>;

    for (const categoryId of CONTEXT_CATEGORIES) {
      const defaultFields = DEFAULT_FIELDS[categoryId] || [];

      categories[categoryId] = {
        id: categoryId,
        name: CATEGORY_LABELS[categoryId],
        icon: CATEGORY_ICONS[categoryId],
        fields: defaultFields.map(field => ({
          id: generateId(),
          label: field.label || '',
          value: '',
          keywords: field.keywords || [],
          fieldType: field.fieldType || 'text',
          placeholder: field.placeholder,
          isRequired: field.isRequired
        })),
        createdAt: timestamp,
        updatedAt: timestamp
      };
    }

    const profile: UserProfile = {
      id: generateId(),
      name,
      categories,
      activeCategory: 'personal',
      createdAt: timestamp,
      updatedAt: timestamp
    };

    await this.saveProfile(profile);
    return profile;
  }

  async updateCategory(categoryId: ContextCategory, fields: ProfileField[]): Promise<void> {
    const profile = await this.getProfile();
    if (!profile) {
      throw new Error('No profile found. Create a profile first.');
    }

    profile.categories[categoryId].fields = fields;
    profile.categories[categoryId].updatedAt = now();
    await this.saveProfile(profile);
  }

  async addField(categoryId: ContextCategory, field: Omit<ProfileField, 'id'>): Promise<ProfileField> {
    const profile = await this.getProfile();
    if (!profile) {
      throw new Error('No profile found. Create a profile first.');
    }

    const newField: ProfileField = {
      ...field,
      id: generateId()
    };

    profile.categories[categoryId].fields.push(newField);
    profile.categories[categoryId].updatedAt = now();
    await this.saveProfile(profile);

    return newField;
  }

  async updateField(categoryId: ContextCategory, fieldId: string, updates: Partial<ProfileField>): Promise<void> {
    const profile = await this.getProfile();
    if (!profile) {
      throw new Error('No profile found. Create a profile first.');
    }

    const fieldIndex = profile.categories[categoryId].fields.findIndex(f => f.id === fieldId);
    if (fieldIndex === -1) {
      throw new Error(`Field ${fieldId} not found in category ${categoryId}`);
    }

    profile.categories[categoryId].fields[fieldIndex] = {
      ...profile.categories[categoryId].fields[fieldIndex],
      ...updates
    };
    profile.categories[categoryId].updatedAt = now();
    await this.saveProfile(profile);
  }

  async deleteField(categoryId: ContextCategory, fieldId: string): Promise<void> {
    const profile = await this.getProfile();
    if (!profile) {
      throw new Error('No profile found. Create a profile first.');
    }

    profile.categories[categoryId].fields = profile.categories[categoryId].fields.filter(f => f.id !== fieldId);
    profile.categories[categoryId].updatedAt = now();
    await this.saveProfile(profile);
  }

  async setActiveCategory(categoryId: ContextCategory): Promise<void> {
    const profile = await this.getProfile();
    if (!profile) {
      throw new Error('No profile found. Create a profile first.');
    }

    profile.activeCategory = categoryId;
    await this.saveProfile(profile);
  }

  // =====================
  // Settings Operations
  // =====================

  async getSettings(): Promise<AppSettings> {
    try {
      const settings = await storageAdapter.get(STORAGE_KEYS.SETTINGS);
      return { ...DEFAULT_SETTINGS, ...(settings as AppSettings || {}) };
    } catch (error) {
      console.error('[LocalStoreService] Failed to get settings:', error);
      return DEFAULT_SETTINGS;
    }
  }

  async saveSettings(settings: Partial<AppSettings>): Promise<void> {
    try {
      const current = await this.getSettings();
      const updated = { ...current, ...settings };
      await storageAdapter.set(STORAGE_KEYS.SETTINGS, updated);
    } catch (error) {
      console.error('[LocalStoreService] Failed to save settings:', error);
      throw error;
    }
  }

  // =====================
  // Data Management
  // =====================

  async exportData(): Promise<string> {
    const profile = await this.getProfile();
    const settings = await this.getSettings();

    return JSON.stringify({
      version: 1,
      exportedAt: now(),
      profile,
      settings
    }, null, 2);
  }

  async importData(jsonString: string): Promise<void> {
    try {
      const data = JSON.parse(jsonString);

      if (data.profile) {
        await this.saveProfile(data.profile);
      }
      if (data.settings) {
        await this.saveSettings(data.settings);
      }
    } catch (error) {
      console.error('[LocalStoreService] Failed to import data:', error);
      throw new Error('Invalid import data format');
    }
  }

  async clearAllData(): Promise<void> {
    try {
      await storageAdapter.clear();
    } catch (error) {
      console.error('[LocalStoreService] Failed to clear data:', error);
      throw error;
    }
  }

  async getStorageInfo(): Promise<{ bytesUsed: number; quotaBytes: number }> {
    try {
      const bytesUsed = await storageAdapter.getBytesInUse();
      return {
        bytesUsed,
        quotaBytes: isChromeExtension() ? chrome.storage.local.QUOTA_BYTES : 5242880
      };
    } catch (error) {
      console.error('[LocalStoreService] Failed to get storage info:', error);
      return { bytesUsed: 0, quotaBytes: 5242880 };
    }
  }
}

// Export singleton instance
export const localStore = LocalStoreService.getInstance();
