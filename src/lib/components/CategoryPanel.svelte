<!-- Rakuraku_Silo - Category Panel (Pure Monochrome) -->
<script lang="ts">
    import {
        currentCategory,
        currentCategoryFields,
        profile,
        isLoading,
        showToast,
    } from "$lib/store";
    import { localStore } from "$lib/services/LocalStoreService";
    import type { ProfileField } from "$lib/types";
    import FieldCard from "./FieldCard.svelte";

    let editingFieldId: string | null = null;

    async function handleSaveField(event: CustomEvent<ProfileField>) {
        const updatedField = event.detail;
        if (!$profile || !$currentCategory) return;

        $isLoading = true;
        try {
            await localStore.updateField($currentCategory.id, updatedField.id, {
                value: updatedField.value,
            });

            const categoryId = $currentCategory.id;
            const fieldIndex = $profile.categories[categoryId].fields.findIndex(
                (f) => f.id === updatedField.id,
            );
            if (fieldIndex !== -1) {
                $profile.categories[categoryId].fields[fieldIndex] =
                    updatedField;
                $profile = $profile;
            }

            editingFieldId = null;
            showToast("Saved", "success");
        } catch {
            showToast("Save failed", "error");
        } finally {
            $isLoading = false;
        }
    }

    function handleEditField(event: CustomEvent<ProfileField>) {
        editingFieldId = event.detail.id;
    }
</script>

<div class="panel">
    {#if $currentCategory}
        <div class="header">
            <span class="icon">{$currentCategory.icon}</span>
            <span class="name">{$currentCategory.name}</span>
            <span class="count">{$currentCategoryFields.length}</span>
        </div>

        <div class="fields">
            {#each $currentCategoryFields as field (field.id)}
                <FieldCard
                    {field}
                    isEditing={editingFieldId === field.id}
                    on:edit={handleEditField}
                    on:save={handleSaveField}
                />
            {/each}

            {#if $currentCategoryFields.length === 0}
                <div class="empty">
                    <span>📭</span>
                    <p>No fields</p>
                </div>
            {/if}
        </div>
    {:else}
        <div class="loading">
            <div class="skeleton" style="height: 32px;"></div>
            <div class="skeleton" style="height: 60px;"></div>
            <div class="skeleton" style="height: 60px;"></div>
        </div>
    {/if}
</div>

<style>
    .panel {
        display: flex;
        flex-direction: column;
        height: 100%;
        overflow: hidden;
    }

    .header {
        display: flex;
        align-items: center;
        gap: 8px;
        padding-bottom: 10px;
        margin-bottom: 10px;
        border-bottom: 1px solid var(--rs-border);
    }

    .icon {
        font-size: 18px;
    }

    .name {
        flex: 1;
        font-size: 14px;
        font-weight: 700;
        color: var(--rs-text);
    }

    .count {
        font-size: 10px;
        font-weight: 600;
        color: var(--rs-text-muted);
        padding: 2px 6px;
        background: var(--rs-bg-card);
        border: 1px solid var(--rs-border);
        border-radius: 4px;
        font-family: monospace;
    }

    .fields {
        flex: 1;
        display: flex;
        flex-direction: column;
        gap: 8px;
        overflow-y: auto;
        padding-right: 2px;
    }

    .empty {
        text-align: center;
        padding: 30px 16px;
        color: var(--rs-text-muted);
    }

    .empty span {
        font-size: 28px;
        display: block;
        margin-bottom: 6px;
        opacity: 0.4;
    }

    .empty p {
        margin: 0;
        font-size: 12px;
    }

    .loading {
        display: flex;
        flex-direction: column;
        gap: 8px;
    }
</style>
