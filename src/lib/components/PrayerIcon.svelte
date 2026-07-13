<script lang="ts">
	let { icon } = $props();
</script>

{#if icon === 'shubuh'}
<svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><circle cx="32" cy="40" r="11"/><path d="M8 51h48M14 40l-5 4M50 40l5 4M32 24v-6M21 28l-3-3M43 28l3-3"/></svg>
{:else if icon === 'syuruq'}
<svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><circle cx="32" cy="32" r="10"/><path d="M32 10v8M32 46v8M10 32h8M46 32h8M16 16l5 5M43 43l5 5M16 48l5-5M43 21l5-5"/></svg>
{:else if icon === 'dzuhur'}
<svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><circle cx="32" cy="32" r="12"/><path d="M32 4v8M32 52v8M4 32h8M52 32h8M11 11l6 6M47 47l6 6M11 53l6-6M47 17l6-6"/></svg>
{:else if icon === 'ashar'}
<svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><circle cx="32" cy="32" r="9"/><path d="M8 38h48M14 30l-5 1M50 30l5 1M32 18v-6"/></svg>
{:else if icon === 'maghrib'}
<svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><circle cx="32" cy="40" r="10"/><path d="M5 50h54M3 40h6M55 40h6M32 22v-4"/></svg>
{:else if icon === 'isya'}
<svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M52 38a20 20 0 1 1-26-26 16.5 16.5 0 0 0 26 26Z"/></svg>
{/if}
