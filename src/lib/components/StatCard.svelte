<script lang="ts">
	let { label, value, hint = null }: { label: string, value: string | number, hint?: string | null } = $props();
</script>

<div class="card stat-card">
	<div class="label">{label}</div>
	<div class="value">{value}</div>
	{#if hint}
		<div class="hint">{hint}</div>
	{/if}
</div>

<style>
	.stat-card {
		display: grid;
		gap: 6px;
	}

	.label {
		font-size: 13px;
		color: var(--muted);
		text-transform: uppercase;
		letter-spacing: 0.08em;
	}

	.value {
		font-size: 28px;
		font-weight: 700;
	}

	.hint {
		font-size: 12px;
		color: var(--muted);
	}
</style>
