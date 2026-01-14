<!-- Rakuraku_Silo - Theme Toggle (Pure Monochrome) -->
<script lang="ts">
  import { onMount } from "svelte";
  import { settings } from "$lib/store";
  import { localStore } from "$lib/services/LocalStoreService";

  let isDark = false;
  let mounted = false;

  onMount(() => {
    mounted = true;
    applyTheme($settings.theme);
  });

  function applyTheme(theme: "dark" | "light" | "system") {
    if (typeof document === "undefined") return;
    isDark = theme === "dark";
    if (isDark) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }

  async function toggleTheme() {
    isDark = !isDark;
    const newTheme = isDark ? "dark" : "light";

    if (isDark) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }

    $settings = { ...$settings, theme: newTheme };
    await localStore.saveSettings({ theme: newTheme });
  }

  $: if (mounted && $settings.theme) {
    applyTheme($settings.theme);
  }
</script>

<button
  class="toggle"
  on:click={toggleTheme}
  title={isDark ? "Light Mode" : "Dark Mode"}
>
  {#if isDark}
    <svg
      class="icon"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="2"
    >
      <circle cx="12" cy="12" r="5" />
      <path
        d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"
      />
    </svg>
  {:else}
    <svg
      class="icon"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="2"
    >
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
    </svg>
  {/if}
</button>

<style>
  .toggle {
    width: 28px;
    height: 28px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: var(--rs-bg-card);
    border: 1px solid var(--rs-border);
    border-radius: 6px;
    color: var(--rs-text-muted);
    cursor: pointer;
    transition: all 0.15s ease;
  }

  .toggle:hover {
    border-color: var(--rs-text);
    color: var(--rs-text);
  }

  .icon {
    width: 14px;
    height: 14px;
  }
</style>
