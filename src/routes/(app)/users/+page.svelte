<script lang="ts">
	import { page } from '$app/state';
	import { enhance } from '$app/forms';

	const userList = $derived(page.data.users);
	const masjidList = $derived(page.data.masjids);
	const error = $derived(page.form?.error);
	const updateError = $derived(page.form?.updateError);

	let showAddForm = $state(false);
	let editingUser = $state<(typeof userList)[number] | null>(null);

	$effect(() => {
		if (page.form?.updateSuccess) editingUser = null;
	});

	function initial(name: string) {
		return name?.charAt(0).toUpperCase() ?? '?';
	}

	function openEdit(u: (typeof userList)[number]) {
		editingUser = u;
	}

	function closeEdit() {
		editingUser = null;
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
							<div class="action-cell">
								<button class="btn ghost small" onclick={() => openEdit(u)}>Edit</button>
								{#if u.username !== 'admin'}
									<form method="POST" action="?/deleteUser" use:enhance>
										<input type="hidden" name="id" value={u.id} />
										<button
											class="btn danger small"
											type="submit"
											onclick={(e) => !confirm(`Hapus pengguna ${u.name}?`) && e.preventDefault()}
										>Hapus</button>
									</form>
								{/if}
							</div>
						</td>
					</tr>
				{:else}
					<tr><td colspan="5" class="empty-row">Belum ada pengguna terdaftar.</td></tr>
				{/each}
			</tbody>
		</table>
	</article>
</section>

{#if editingUser}
	<!-- svelte-ignore a11y_click_events_have_key_events a11y_no_static_element_interactions -->
	<div class="modal-backdrop" onclick={closeEdit} role="presentation">
		<!-- svelte-ignore a11y_interactive_supports_focus -->
		<div class="modal-box" onclick={(e) => e.stopPropagation()} role="dialog" aria-modal="true" aria-labelledby="edit-user-title" tabindex="-1">
			<div class="modal-header">
				<h3 id="edit-user-title">Edit Pengguna</h3>
				<button class="close-btn" onclick={closeEdit} aria-label="Tutup">
					<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
				</button>
			</div>

			<form method="POST" action="?/updateUser" use:enhance>
				<input type="hidden" name="id" value={editingUser.id} />
				<div class="field">
					<label for="edit-name">Nama Lengkap</label>
					<input id="edit-name" class="input" name="name" required value={editingUser.name} />
				</div>
				<div class="field">
					<label for="edit-username">Username</label>
					<input id="edit-username" class="input" value={editingUser.username} disabled />
					<p class="hint">Username tidak dapat diubah.</p>
				</div>
				<div class="split">
					<div class="field">
						<label for="edit-role">Peran (Role)</label>
						<select id="edit-role" name="role" required>
							<option value="admin" selected={editingUser.role === 'admin'}>Admin Masjid</option>
							<option value="superadmin" selected={editingUser.role === 'superadmin'}>Superadmin</option>
						</select>
					</div>
					<div class="field">
						<label for="edit-masjid">Akses Masjid</label>
						<select id="edit-masjid" name="masjidId">
							<option value="" selected={!editingUser.masjidId}>Semua Masjid</option>
							{#each masjidList as m}
								<option value={m.id} selected={editingUser.masjidId === m.id}>{m.name}</option>
							{/each}
						</select>
					</div>
				</div>
				<div class="field">
					<label for="edit-password">Password Baru <span class="optional">(kosongkan jika tidak ingin mengubah)</span></label>
					<input id="edit-password" class="input" type="password" name="password" placeholder="Min. 8 karakter" />
				</div>
				{#if updateError}
					<p class="error">{updateError}</p>
				{/if}
				<div class="modal-footer">
					<button type="button" class="btn ghost" onclick={closeEdit}>Batal</button>
					<button type="submit" class="btn gold">Simpan Perubahan</button>
				</div>
			</form>
		</div>
	</div>
{/if}

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

	.action-cell {
		display: flex;
		align-items: center;
		gap: 8px;
		flex-wrap: wrap;
	}

	/* Modal */
	.modal-backdrop {
		position: fixed;
		inset: 0;
		background: rgba(0, 0, 0, 0.6);
		backdrop-filter: blur(4px);
		z-index: 100;
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 16px;
	}

	.modal-box {
		background: var(--surface);
		border: 1px solid var(--border);
		border-radius: 12px;
		width: 100%;
		max-width: 480px;
		padding: 24px;
		box-shadow: 0 24px 64px rgba(0, 0, 0, 0.5);
	}

	.modal-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		margin-bottom: 20px;
	}

	.modal-header h3 {
		font-size: 18px;
		font-weight: 700;
	}

	.close-btn {
		background: none;
		border: none;
		color: var(--muted);
		cursor: pointer;
		padding: 4px;
		display: grid;
		place-items: center;
		border-radius: 6px;
		transition: color 0.15s, background 0.15s;
	}

	.close-btn:hover {
		color: var(--text);
		background: rgba(255, 255, 255, 0.06);
	}

	.modal-footer {
		display: flex;
		justify-content: flex-end;
		gap: 10px;
		margin-top: 20px;
	}

	.optional {
		font-size: 11px;
		font-weight: 400;
		color: var(--muted);
	}
</style>
