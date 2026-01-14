// Rakuraku_Silo Svelte Stores
// Reactive state management for the extension popup

import { writable, derived } from 'svelte/store';
import type { UserProfile, AppSettings, ContextCategory, ProfileField } from './types';

// =====================
// Profile Store
// =====================

// Main profile store
export const profile = writable<UserProfile | null>(null);

// Settings store - Default to light theme
export const settings = writable<AppSettings>({
    theme: 'light',
    autofillEnabled: true,
    showNotifications: true,
    fuzzyMatchThreshold: 0.7
});

// =====================
// UI State
// =====================

// Current view in the popup
export type ViewMode = 'dashboard' | 'category' | 'settings' | 'add-field';
export const activeView = writable<ViewMode>('dashboard');

// Currently selected category
export const selectedCategory = writable<ContextCategory>('personal');

// Loading state
export const isLoading = writable<boolean>(false);

// Toast notifications
export interface Toast {
    id: string;
    message: string;
    type: 'success' | 'error' | 'info';
    duration?: number;
}
export const toasts = writable<Toast[]>([]);

// Field being edited (for edit modal)
export const editingField = writable<ProfileField | null>(null);

// =====================
// Derived Stores
// =====================

// Current category data
export const currentCategory = derived(
    [profile, selectedCategory],
    ([$profile, $selectedCategory]) => {
        if (!$profile) return null;
        return $profile.categories[$selectedCategory] ?? null;
    }
);

// Fields for current category
export const currentCategoryFields = derived(
    [profile, selectedCategory],
    ([$profile, $selectedCategory]) => {
        if (!$profile) return [];
        return $profile.categories[$selectedCategory]?.fields ?? [];
    }
);

// Check if profile exists
export const hasProfile = derived(profile, ($profile) => $profile !== null);

// Count of filled fields across all categories
export const filledFieldsCount = derived(profile, ($profile) => {
    if (!$profile) return 0;
    return Object.values($profile.categories).reduce((total, category) => {
        return total + category.fields.filter(f => f.value.trim() !== '').length;
    }, 0);
});

// Total fields across all categories
export const totalFieldsCount = derived(profile, ($profile) => {
    if (!$profile) return 0;
    return Object.values($profile.categories).reduce((total, category) => {
        return total + category.fields.length;
    }, 0);
});

// =====================
// Toast Actions
// =====================

export function showToast(message: string, type: Toast['type'] = 'info', duration = 3000) {
    const id = `toast-${Date.now()}`;
    toasts.update(t => [...t, { id, message, type, duration }]);

    if (duration > 0) {
        setTimeout(() => {
            toasts.update(t => t.filter(toast => toast.id !== id));
        }, duration);
    }

    return id;
}

export function dismissToast(id: string) {
    toasts.update(t => t.filter(toast => toast.id !== id));
}