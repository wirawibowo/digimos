<script lang="ts">
    import PrayerIcon from '$lib/components/PrayerIcon.svelte';
    let { masjid, settings, schedules, nextPrayer, nextSecs, timeStr, dateStrMasehi, dateStrHijri, dayName, activeWallpaper, formatSecs, timeNow, iqamahFor } = $props();

    const nameShort = $derived(masjid?.name?.replace(/^Masjid\s+/i, '') || '');
</script>

<div class="theme-wrapper">

    <div class="bg-photo" style="background-image: url({activeWallpaper || '/assets/masjid-bg.png'});"></div>

    <!-- LEFT TORN PANEL -->
    <aside class="panel">
      <div class="big-clock">
        <div class="time"><span>{timeStr.h}</span><span class="sep">:</span><span>{timeStr.m}</span></div>
        <div class="date">
          <span class="dot"></span>
          <span>{dateStrMasehi}</span>
        </div>
        {#if settings?.showHijri}<div class="hijri">{dateStrHijri}</div>{/if}
      </div>

      <div class="prayers">
        {#each schedules as p}
        <div class="row" class:active={nextPrayer?.key === p.key} data-prayer={p.key}>
          <div class="icon"><PrayerIcon icon={p.key} /></div>
          <div class="name">{p.name}</div>
          <div class="time">{p.time}</div>
          <div class="iq">
            {#if p.key === 'syuruq'}
              <span class="none">—</span>
            {:else}
              IQAMAH<b>{iqamahFor ? iqamahFor(p.key, p.time) : ''}</b>
            {/if}
          </div>
        </div>
        {/each}
      </div>
    </aside>

    <!-- HEADER top-right -->
    <header class="header">
      <div>
        <div class="name"><span class="accent">Masjid</span> {nameShort}</div>
        <div class="addr">{masjid?.address || ''}{masjid?.phone ? ' · Telp. ' + masjid.phone : ''}</div>
      </div>
      {#if settings?.showLogo}
      <div class="logo">
        <svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2c.4 0 .8.2 1 .6l1.2 2c.2.4.2.8 0 1.2L12.8 8.4c-.1.2-.2.4-.2.6V11h3.3a3 3 0 0 1 3 3v7H5V14a3 3 0 0 1 3-3h3.3V9a1 1 0 0 0-.2-.6L9.8 5.8a1 1 0 0 1 0-1.2l1.2-2c.2-.4.6-.6 1-.6Z"/></svg>
      </div>
      {/if}
    </header>

    <!-- COUNTDOWN -->
    <div class="countdown">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>
      <span class="lbl">{nextPrayer?.name || ''}</span>
      <span class="val">{formatSecs(nextSecs)}</span>
    </div>

</div>

<style>
  .theme-wrapper { position: absolute; inset: 0; }

  .bg-photo{ position:absolute; inset:0; background-size:cover; background-position:center 30%; z-index:0; }
  .bg-photo::after{ content:""; position:absolute; inset:0; background:linear-gradient(180deg, rgba(6,18,46,.18) 0%, transparent 30%, transparent 75%, rgba(6,18,46,.5) 100%); }

  .panel{
    position:absolute; left:0; top:0; bottom:6vh; width:35vw;
    background:linear-gradient(180deg, #3585e9 0%, #2168d6 100%);
    padding:3vh 3vw;
    z-index:3; display:flex; flex-direction:column;
    box-shadow:6px 0 24px rgba(0,0,0,.3);
    clip-path: polygon(
      0 0, 100% 0,
      97% 1.5%, 100% 3%, 95.5% 4.5%, 99% 6%, 96% 7.5%, 100% 9%, 95% 10.5%,
      98% 12%, 96% 13.5%, 100% 15%, 95.5% 16.5%, 97% 18%, 94% 19.5%, 100% 21%,
      96.5% 22.5%, 99% 24%, 95% 25.5%, 100% 27%, 97.5% 28.5%, 94.5% 30%, 99% 31.5%,
      96% 33%, 100% 34.5%, 95.5% 36%, 98.5% 37.5%, 94% 39%, 100% 40.5%, 97% 42%,
      99.5% 43.5%, 95% 45%, 100% 46.5%, 96.5% 48%, 94.5% 49.5%, 100% 51%, 97.5% 52.5%,
      94% 54%, 99% 55.5%, 96% 57%, 100% 58.5%, 95.5% 60%, 98.5% 61.5%, 94.5% 63%,
      100% 64.5%, 96% 66%, 99% 67.5%, 95% 69%, 100% 70.5%, 97% 72%, 94% 73.5%,
      100% 75%, 95.5% 76.5%, 98% 78%, 96% 79.5%, 100% 81%, 94.5% 82.5%, 99% 84%,
      96.5% 85.5%, 100% 87%, 95% 88.5%, 98.5% 90%, 94% 91.5%, 100% 93%, 97% 94.5%,
      95.5% 96%, 99.5% 97.5%, 96% 99%, 100% 100%,
      0 100%
    );
  }

  .big-clock{ text-align:center; color:#fff; }
  .big-clock .time{ font-family:'Inter',sans-serif; font-weight:800; font-size:clamp(60px,7vw,150px); line-height:.95; letter-spacing:-6px; font-variant-numeric:tabular-nums; text-shadow:0 6px 24px rgba(0,0,0,.4); }
  .big-clock .time .sep{ color:#fff; animation:blink 1s steps(1) infinite; }
  @keyframes blink{ 50%{opacity:.45} }
  .big-clock .date{ display:flex; align-items:center; justify-content:center; gap:.8vw; margin-top:1.4vh; font-size:clamp(18px,1.8vw,36px); font-weight:600; }
  .big-clock .date .dot{ width:.8vw; height:.8vw; max-width:14px; max-height:14px; border-radius:50%; background:#7bff9c; box-shadow:0 0 10px #7bff9c; }
  .big-clock .hijri{ margin-top:.6vh; font-size:clamp(16px,1.5vw,28px); font-weight:500; color:rgba(255,255,255,.9); letter-spacing:.3px; }

  .prayers{ margin-top:3vh; flex:1; display:flex; flex-direction:column; gap:.5vh; }
  .row{ display:grid; grid-template-columns:3.2vw 1fr auto auto; align-items:center; gap:1.4vw; padding:.6vh .6vw .6vh .4vw; border-radius:.8vw; }
  .row .icon{ width:3vw; height:3vw; max-width:60px; max-height:60px; color:#fff; display:grid; place-items:center; }
  .row .icon :global(svg){ width:100%; height:100%; filter:drop-shadow(0 2px 4px rgba(0,0,0,.3)); }
  .row .name{ font-weight:700; font-size:clamp(18px,1.8vw,36px); color:#fff; letter-spacing:1.5px; }
  .row .time{ font-family:'Inter',sans-serif; font-weight:800; font-size:clamp(28px,2.8vw,56px); line-height:1; color:#fff; letter-spacing:-1.5px; font-variant-numeric:tabular-nums; text-shadow:0 2px 8px rgba(0,0,0,.3); }
  .row .iq{ font-size:clamp(10px,1vw,18px); line-height:1.15; color:rgba(255,255,255,.85); letter-spacing:1px; font-weight:600; text-align:right; }
  .row .iq b{ display:block; font-family:'Inter',sans-serif; font-weight:700; font-size:clamp(14px,1.3vw,24px); margin-top:1px; letter-spacing:0; font-variant-numeric:tabular-nums; }
  .row .iq .none{ font-size:clamp(24px,2.4vw,46px); color:rgba(255,255,255,.75); letter-spacing:0; }
  .row.active{ background:linear-gradient(180deg,#0e3392,#0a2b78); border:1px solid rgba(243,205,134,.4); box-shadow:inset 0 1px 0 rgba(255,235,180,.18), 0 6px 18px rgba(0,0,0,.3); }
  .row.active .time{ color:var(--yellow); text-shadow:0 0 20px rgba(255,217,61,.5); }
  .row.active .iq b{ color:var(--gold-300); }

  .header{ position:absolute; right:1.6vw; top:2vh; z-index:5; display:flex; align-items:center; gap:1.2vw; text-align:right; }
  .header .name{ font-family:'Plus Jakarta Sans',sans-serif; font-weight:800; font-size:clamp(28px,3vw,60px); letter-spacing:-1px; line-height:1; text-shadow:0 2px 12px rgba(0,0,0,.6); }
  .header .accent{ color:var(--gold-300); }
  .header .addr{ margin-top:.7vh; font-size:clamp(11px,.9vw,18px); color:rgba(255,255,255,.85); letter-spacing:.3px; font-weight:500; }
  .logo{ width:clamp(56px,5vw,100px); height:clamp(56px,5vw,100px); border-radius:14px; background:linear-gradient(135deg,#c89a45,#f0cd86 50%,#a37a2a); border:2px solid rgba(255,235,180,.65); display:grid; place-items:center; box-shadow:0 8px 22px rgba(0,0,0,.45); flex:none; }
  .logo :global(svg){ width:60%; height:60%; color:#0a1f4d; }

  .countdown{ position:absolute; right:1.6vw; bottom:8.5vh; z-index:5; background:linear-gradient(180deg,#ffffff,#e9eefb); color:#0a1f4d; padding:1vh 1.4vw; border-radius:999px; display:flex; align-items:center; gap:.8vw; box-shadow:0 12px 30px rgba(0,0,0,.5), inset 0 1px 0 #fff; border:1.5px solid rgba(243,205,134,.7); }
  .countdown :global(svg){ width:clamp(20px,1.8vw,36px); height:clamp(20px,1.8vw,36px); color:var(--navy-600); }
  .countdown .lbl{ font-weight:700; font-size:clamp(16px,1.5vw,30px); }
  .countdown .val{ font-family:'Inter',sans-serif; font-weight:800; font-size:clamp(20px,1.9vw,38px); color:#0a3d8f; letter-spacing:-.5px; font-variant-numeric:tabular-nums; }
</style>
