<script lang="ts">
	import { page } from '$app/state';
	import { enhance } from '$app/forms';

	const userList = $derived(page.data.users);
	const masjidList = $derived(page.data.masjids);
	const error = $derived(page.form?.error);

	let showAddForm = $state(false);

	function initial(name: string) {
		return name?.charAt(0).toUpperCase() ?? '?';
	}
</script>

<svelte:head>
	<title>Kelola Pengguna — Digimos</title>
</svelte:head>

<section class="users-page">
	<div class="section-header">
		<div>
			<h1>Kelola Pengguna</h1>
			<p>Tambah atau hapus akses pengguna ke sistem panel Digimos.</p>
		</div>
		<button class="btn {showAddForm ? 'ghost' : 'gold'}" onclick={() => showAddForm = !showAddForm}>
			{#if !showAddForm}
				<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
				Tambah Pengguna
			{:else}
				Batal
			{/if}
		</button>
	</div>

	{#if showAddForm}
		<article class="card add-form">
			<h3>Tambah Pengguna Baru</h3>
			<p>Buat akun baru untuk admin masjid atau superadmin sistem.</p>

			<form method="POST" action="?/createUser" use:enhance={() => {
				return async ({ update }) => {
					await update();
					if (!page.form?.error) showAddForm = false;
				};
			}}>
				<div class="split">
					<div class="field">
						<label for="name">Nama Lengkap</label>
						<input id="name" class="input" name="name" required placeholder="Ahmad Fulan" />
					</div>
					<div class="field">
						<label for="username">Username</label>
						<input id="username" class="input" name="username" required placeholder="ahmad.fulan" />
					</div>
				</div>
				<div class="split">
					<div class="field">
						<label for="password">Password</label>
						<input id="password" class="input" type="password" name="password" required placeholder="Min. 8 karakter" />
					</div>
					<div class="field">
						<label for="role">Peran (Role)</label>
						<select id="role" name="role" required>
							<option value="admin">Admin Masjid</option>
							<option value="superadmin">Superadmin</option>
						</select>
					</div>
				</div>
				<div class="field">
					<label for="masjidId">Akses Masjid</label>
					<select id="masjidId" name="masjidId">
						<option value="">Semua Masjid (Superadmin)</option>
						{#each masjidList as m}
							<option value={m.id}>{m.name}</option>
						{/each}
					</select>
					<p class="hint">Jika peran adalah Superadmin, biarkan kosong.</p>
				</div>
				{#if error}
					<p class="error">{error}</p>
				{/if}
				<button class="btn gold" type="submit">Simpan Pengguna</button>
			</form>
		</article>
	{/if}

	<article class="card table-card">
		<div class="table-head">
			<h3>Daftar Pengguna</h3>
			<span class="count-badge">{userList.length}</span>
		</div>
		<table class="ptable">
			<thead>
				<tr>
					<th>PENGGUNA</th>
					<th>USERNAME</th>
					<th>PERAN</th>
					<th>AKSES MASJID</th>
					<th>AKSI</th>
				</tr>
			</thead>
			<tbody>
				{#each userList as u}
					<tr>
						<td>
							<div class="user-cell">
								<div class="user-avatar">{initial(u.name)}</div>
								<strong>{u.name}</strong>
							</div>
						</td>
						<td class="mono">{u.username}</td>
						<td><span class="role-badge {u.role}">{u.role === 'superadmin' ? 'Superadmin' : 'Admin'}</span></td>
						<td>{u.masjidName ?? '—'}</td>
						<td>
							{#if u.username !== 'admin'}
								<form method="POST" action="?/deleteUser" use:enhance>
									<input type="hidden" name="id" value={u.id} />
									<button
										class="btn danger small"
										type="submit"
										onclick={(e) => !confirm(`Hapus pengguna ${u.name}?`) && e.preventDefault()}
									>Hapus</button>
								</form>
							{:else}
								<span style="font-size:12px; color: var(--muted);">—</span>
							{/if}
						</td>
					</tr>
				{:else}
					<tr><td colspan="5" class="empty-row">Belum ada pengguna terdaftar.</td></tr>
				{/each}
			</tbody>
		</table>
	</article>
</section>

<style>
	.users-page {
		display: grid;
		gap: 24px;
	}

	/* Add form */
	.add-form h3 {
		font-size: 18px;
		font-weight: 700;
		margin-bottom: 4px;
	}

	.add-form p {
		font-size: 13px;
		color: var(--muted);
		margin-bottom: 20px;
	}

	.hint {
		font-size: 12px;
		color: var(--muted);
		margin-top: 4px;
	}

	/* Table card */
	.table-card {
		padding: 0;
		overflow: hidden;
	}

	.table-head {
		display: flex;
		align-items: center;
		gap: 10px;
		padding: 18px 22px;
		border-bottom: 1px solid var(--border);
	}

	.table-head h3 {
		font-size: 16px;
		font-weight: 700;
	}

	.count-badge {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		min-width: 24px;
		height: 24px;
		padding: 0 8px;
		border-radius: 999px;
		background: rgba(243, 205, 134, 0.15);
		border: 1px solid rgba(243, 205, 134, 0.3);
		color: var(--gold-300);
		font-size: 12px;
		font-weight: 700;
	}

	.ptable {
		width: 100%;
		border-collapse: collapse;
	}

	.ptable th {
		text-align: left;
		font-size: 11px;
		font-weight: 600;
		letter-spacing: 1.5px;
		color: var(--muted);
		padding: 10px 22px;
		border-bottom: 1px solid var(--border);
	}

	.ptable td {
		padding: 14px 22px;
		font-size: 14px;
		border-bottom: 1px solid rgba(255, 255, 255, 0.04);
		vertical-align: middle;
	}

	.ptable tr:last-child td {
		border-bottom: none;
	}

	.ptable tr:hover td {
		background: rgba(255, 255, 255, 0.02);
	}

	.user-cell {
		display: flex;
		align-items: center;
		gap: 10px;
	}

	.user-avatar {
		width: 32px;
		height: 32px;
		border-radius: 50%;
		background: rgba(243, 205, 134, 0.2);
		border: 1px solid rgba(243, 205, 134, 0.3);
		color: var(--gold-300);
		display: grid;
		place-items: center;
		font-weight: 700;
		font-size: 13px;
		flex-shrink: 0;
	}

	.mono {
		font-family: 'Inter', monospace;
		font-size: 13px;
		color: var(--muted);
	}

	.role-badge {
		padding: 4px 10px;
		border-radius: 6px;
		font-size: 12px;
		font-weight: 600;
	}

	.role-badge.superadmin {
		background: rgba(255, 80, 80, 0.15);
		border: 1px solid rgba(255, 80, 80, 0.3);
		color: #ff9696;
	}

	.role-badge.admin {
		background: rgba(37, 99, 212, 0.2);
		border: 1px solid rgba(37, 99, 212, 0.4);
		color: #7baeff;
	}

	.empty-row {
		text-align: center;
		color: var(--muted);
		padding: 40px !important;
	}
</style>
