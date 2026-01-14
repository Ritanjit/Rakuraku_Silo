<!-- Rakuraku_Silo - Main Popup (Warm Red Theme) -->
<script lang="ts">
  import { onMount } from 'svelte';
  import { profile, settings, selectedCategory, isLoading, showToast, currentCategory } from '$lib/store';
  import { localStore } from '$lib/services/LocalStoreService';
  import type { FillFormMessage } from '$lib/types';
  
  import PrivacyBadge from '$lib/components/PrivacyBadge.svelte';
  import CategorySelector from '$lib/components/CategorySelector.svelte';
  import CategoryPanel from '$lib/components/CategoryPanel.svelte';
  import ThemeToggle from '$lib/components/ThemeToggle.svelte';
  import Toast from '$lib/components/Toast.svelte';

  onMount(async () => {
    $isLoading = true;
    try {
      $settings = await localStore.getSettings();
      
      if ($settings.theme === 'dark') {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
      
      let loadedProfile = await localStore.getProfile();
      
      if (!loadedProfile) {
        loadedProfile = await localStore.createDefaultProfile('My Profile');
        showToast('Profile created!', 'success');
      }
      
      $profile = loadedProfile;
      $selectedCategory = loadedProfile.activeCategory;
    } catch (error) {
      console.error('Failed to load profile:', error);
      showToast('Load failed', 'error');
    } finally {
      $isLoading = false;
    }
  });

  async function handleFillForm() {
    if (!$profile || !$currentCategory) return;
    
    $isLoading = true;
    try {
      if (typeof chrome === 'undefined' || !chrome.tabs) {
        showToast('Load as extension to fill', 'info');
        return;
      }
      
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      
      if (!tab?.id || !tab.url?.includes('docs.google.com/forms')) {
        showToast('Open a Google Form', 'info');
        return;
      }
      
      const message: FillFormMessage = {
        type: 'FILL_FORM',
        payload: {
          category: $selectedCategory,
          fields: $currentCategory.fields.filter(f => f.value.trim() !== '')
        }
      };
      
      const response = await chrome.tabs.sendMessage(tab.id, message);
      
      if (response?.success) {
        showToast(`Filled ${response.filledCount} fields!`, 'success');
      } else {
        showToast(response?.error || 'Fill failed', 'error');
      }
    } catch {
      showToast('Open Google Forms first', 'error');
    } finally {
      $isLoading = false;
    }
  }
  
  $: filledCount = $currentCategory?.fields?.filter(f => f.value?.trim())?.length ?? 0;
  $: totalCount = $currentCategory?.fields?.length ?? 0;
</script>

<svelte:head>
  <title>Rakuraku_Silo</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="anonymous">
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
</svelte:head>

<div class="popup">
  <!-- Header -->
  <header class="header">
    <div class="header-left">
      <span class="logo">🔒</span>
      <h1 class="title">Rakuraku</h1>
    </div>
    <div class="header-right">
      <PrivacyBadge />
      <ThemeToggle />
    </div>
  </header>

  <!-- Category Tabs -->
  <nav class="tabs-wrapper">
    <CategorySelector />
  </nav>

  <!-- Main Content -->
  <main class="main">
    {#if $isLoading && !$profile}
      <div class="loading animate-fade-in">
        <div class="skeleton" style="height: 36px; margin-bottom: 10px;"></div>
        <div class="skeleton" style="height: 60px; margin-bottom: 8px;"></div>
        <div class="skeleton" style="height: 60px; margin-bottom: 8px;"></div>
        <div class="skeleton" style="height: 60px;"></div>
      </div>
    {:else}
      <CategoryPanel />
    {/if}
  </main>

  <!-- Footer with Red CTA -->
  <footer class="footer">
    <span class="counter">{filledCount}/{totalCount}</span>
    <button 
      class="fill-btn" 
      on:click={handleFillForm}
      disabled={$isLoading || filledCount === 0}
    >
      {#if $isLoading}
        <span class="spinner"></span>
      {:else}
        <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
          <path d="M5 12h14M12 5l7 7-7 7"/>
        </svg>
      {/if}
      Fill Form
    </button>
  </footer>

  <Toast />
</div>

<style>
  .popup {
    display: flex;
    flex-direction: column;
    width: 300px;
    height: 500px;
    background: var(--rs-bg-base);
    overflow: hidden;
  }

  /* Header */
  .header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 10px 12px;
    background: var(--rs-bg-elevated);
    border-bottom: 1px solid var(--rs-border);
  }

  .header-left {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .logo {
    font-size: 18px;
  }

  .title {
    font-size: 14px;
    font-weight: 700;
    color: var(--rs-text);
    margin: 0;
    letter-spacing: -0.02em;
  }

  .header-right {
    display: flex;
    align-items: center;
    gap: 6px;
  }

  /* Tabs */
  .tabs-wrapper {
    padding: 8px 12px;
    border-bottom: 1px solid var(--rs-border);
    background: var(--rs-bg-elevated);
  }

  /* Main */
  .main {
    flex: 1;
    padding: 12px;
    overflow-y: auto;
    background: var(--rs-bg-base);
  }

  .loading {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  /* Footer */
  .footer {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 10px 12px;
    background: var(--rs-bg-elevated);
    border-top: 1px solid var(--rs-border);
  }

  .counter {
    font-size: 11px;
    font-weight: 600;
    color: var(--rs-text-muted);
    font-family: monospace;
  }

  /* Warm Red Fill Button */
  .fill-btn {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 8px 14px;
    background: var(--rs-accent);
    color: #ffffff;
    border: none;
    border-radius: 8px;
    font-size: 12px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.15s ease;
  }

  .fill-btn:hover:not(:disabled) {
    background: var(--rs-accent-hover);
  }

  .fill-btn:disabled {
    opacity: 0.4;
    cursor: not-allowed;
  }

  .fill-btn .icon {
    width: 14px;
    height: 14px;
  }

  .spinner {
    width: 12px;
    height: 12px;
    border: 2px solid rgba(255, 255, 255, 0.3);
    border-top-color: #ffffff;
    border-radius: 50%;
    animation: spin 0.8s linear infinite;
  }

  @keyframes spin {
    to { transform: rotate(360deg); }
  }
</style>
