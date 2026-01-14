<!-- Rakuraku_Silo - Toast (Warm Red Theme) -->
<script lang="ts">
    import { toasts, dismissToast } from "$lib/store";
</script>

<div class="container">
    {#each $toasts as toast (toast.id)}
        <div class="toast {toast.type}" role="alert">
            <span class="msg">{toast.message}</span>
            <button class="close" on:click={() => dismissToast(toast.id)}
                >×</button
            >
        </div>
    {/each}
</div>

<style>
    .container {
        position: fixed;
        bottom: 12px;
        left: 12px;
        right: 12px;
        display: flex;
        flex-direction: column;
        gap: 6px;
        z-index: 10000;
        pointer-events: none;
    }

    .toast {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 10px 12px;
        background: var(--rs-bg-card);
        border: 1px solid var(--rs-border);
        border-radius: 6px;
        animation: slideIn 0.15s ease-out;
        pointer-events: auto;
    }

    @keyframes slideIn {
        from {
            transform: translateY(100%);
            opacity: 0;
        }
        to {
            transform: translateY(0);
            opacity: 1;
        }
    }

    .toast.success {
        border-left: 3px solid var(--rs-success);
    }

    .toast.error {
        border-left: 3px solid var(--rs-accent);
    }

    .toast.info {
        border-left: 3px solid var(--rs-text-muted);
    }

    .msg {
        flex: 1;
        font-size: 12px;
        color: var(--rs-text);
    }

    .close {
        width: 18px;
        height: 18px;
        display: flex;
        align-items: center;
        justify-content: center;
        border: none;
        background: transparent;
        color: var(--rs-text-muted);
        font-size: 14px;
        cursor: pointer;
        padding: 0;
    }

    .close:hover {
        color: var(--rs-text);
    }
</style>
