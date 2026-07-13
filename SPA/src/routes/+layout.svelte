<script lang="ts">
	let { children } = $props();
</script>

<svelte:head>
	<meta charset="utf-8" />
	<meta name="viewport" content="width=device-width, initial-scale=1" />
	<title>Digimos SPA</title>
</svelte:head>

{@render children()}

<style>
	:global(*) {
		box-sizing: border-box;
		margin: 0;
		padding: 0;
	}
	:global(body) {
		font-family: 'Segoe UI', system-ui, sans-serif;
		background: #0a0a0a;
		color: #fff;
		min-height: 100vh;
	}
</style>
