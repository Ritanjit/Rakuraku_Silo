<!-- Rakuraku_Silo - Category Tabs (Warm Red Active) -->
<script lang="ts">
    import {
        CONTEXT_CATEGORIES,
        CATEGORY_LABELS,
        CATEGORY_ICONS,
        type ContextCategory,
    } from "$lib/types";
    import { selectedCategory } from "$lib/store";

    function selectCategory(category: ContextCategory) {
        $selectedCategory = category;
    }
</script>

<div class="tabs-scroll">
    <div class="tabs">
        {#each CONTEXT_CATEGORIES as category}
            <button
                class="tab"
                class:active={$selectedCategory === category}
                on:click={() => selectCategory(category)}
                title={CATEGORY_LABELS[category]}
            >
                <span class="icon">{CATEGORY_ICONS[category]}</span>
            </button>
        {/each}
    </div>
</div>

<style>
    .tabs-scroll {
        width: 100%;
        overflow-x: auto;
        scrollbar-width: none;
    }

    .tabs-scroll::-webkit-scrollbar {
        display: none;
    }

    .tabs {
        display: flex;
        gap: 4px;
    }

    .tab {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 34px;
        height: 34px;
        border: 1px solid var(--rs-border);
        background: var(--rs-bg-card);
        color: var(--rs-text-muted);
        border-radius: 6px;
        cursor: pointer;
        transition: all 0.15s ease;
        flex-shrink: 0;
        /* Grayscale filter for inactive icons */
        filter: grayscale(100%);
        opacity: 0.7;
    }

    .tab:hover {
        border-color: var(--rs-text-muted);
        opacity: 1;
    }

    /* Active tab - warm red border, no grayscale */
    .tab.active {
        background: var(--rs-accent-light);
        border-color: var(--rs-accent);
        color: var(--rs-accent);
        filter: none;
        opacity: 1;
    }

    .icon {
        font-size: 15px;
    }
</style>
