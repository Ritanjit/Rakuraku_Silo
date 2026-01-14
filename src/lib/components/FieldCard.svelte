<!-- Rakuraku_Silo - Field Card (Warm Red Theme) -->
<script lang="ts">
  import type { ProfileField } from '$lib/types';
  import { createEventDispatcher } from 'svelte';

  export let field: ProfileField;
  export let isEditing: boolean = false;

  const dispatch = createEventDispatcher<{
    edit: ProfileField;
    delete: string;
    save: ProfileField;
  }>();

  let editValue = field.value;

  function startEdit() {
    editValue = field.value;
    dispatch('edit', field);
  }

  function saveEdit() {
    dispatch('save', { ...field, value: editValue });
  }

  function handleKeydown(e: KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      saveEdit();
    } else if (e.key === 'Escape') {
      editValue = field.value;
      isEditing = false;
    }
  }
</script>

<div class="card" class:editing={isEditing} class:filled={!!field.value}>
  <div class="header">
    <span class="label">{field.label}</span>
    {#if isEditing}
      <button class="btn save" on:click={saveEdit}>✓</button>
    {:else}
      <button class="btn" on:click={startEdit}>✎</button>
    {/if}
  </div>

  {#if isEditing}
    {#if field.fieldType === 'textarea'}
      <textarea
        bind:value={editValue}
        on:keydown={handleKeydown}
        placeholder="Enter value..."
        rows="2"
        class="input"
      ></textarea>
    {:else}
      <input
        type={field.fieldType === 'email' ? 'email' : field.fieldType === 'phone' ? 'tel' : 'text'}
        bind:value={editValue}
        on:keydown={handleKeydown}
        placeholder="Enter value..."
        class="input"
      />
    {/if}
  {:else}
    <div class="value" class:empty={!field.value} on:click={startEdit}>
      {field.value || 'Click to add...'}
    </div>
  {/if}
</div>

<style>
  .card {
    background: var(--rs-bg-card);
    border: 1px solid var(--rs-border);
    border-radius: 8px;
    padding: 10px;
    transition: all 0.15s ease;
  }

  .card:hover {
    border-color: var(--rs-border-strong);
  }

  .card.editing {
    border-color: var(--rs-accent);
  }

  /* Warm red left border for filled fields */
  .card.filled {
    border-left: 2px solid var(--rs-accent);
  }

  .header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 6px;
  }

  .label {
    font-size: 10px;
    font-weight: 700;
    color: var(--rs-text-muted);
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  .btn {
    width: 22px;
    height: 22px;
    display: flex;
    align-items: center;
    justify-content: center;
    border: 1px solid var(--rs-border);
    background: var(--rs-bg-base);
    color: var(--rs-text-muted);
    border-radius: 4px;
    font-size: 11px;
    cursor: pointer;
    opacity: 0;
    transition: all 0.15s ease;
  }

  .card:hover .btn,
  .card.editing .btn {
    opacity: 1;
  }

  .btn:hover {
    border-color: var(--rs-text);
    color: var(--rs-text);
  }

  /* Warm red save button */
  .btn.save {
    opacity: 1;
    background: var(--rs-accent);
    border-color: var(--rs-accent);
    color: #ffffff;
  }

  .value {
    font-size: 13px;
    color: var(--rs-text);
    padding: 6px 8px;
    background: var(--rs-bg-elevated);
    border-radius: 4px;
    cursor: pointer;
    word-break: break-word;
    transition: background 0.15s ease;
  }

  .value:hover {
    background: var(--rs-bg-hover);
  }

  .value.empty {
    color: var(--rs-text-muted);
    font-style: italic;
  }

  .input {
    width: 100%;
    padding: 6px 8px;
    background: var(--rs-bg-base);
    border: 1px solid var(--rs-border);
    border-radius: 4px;
    color: var(--rs-text);
    font-size: 13px;
    font-family: inherit;
    resize: none;
    transition: all 0.15s ease;
  }

  .input:focus {
    outline: none;
    border-color: var(--rs-accent);
  }

  .input::placeholder {
    color: var(--rs-text-muted);
  }
</style>
