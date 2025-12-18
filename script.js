// Cryptorasta Rocola MVP v0.2 (json-first, Dub Minimal)

const audio = document.getElementById("audio");
const playlistEl = document.getElementById("playlist");
const nowPlayingEl = document.getElementById("nowPlaying");
const rastaDockEl = document.getElementById("rastaDock");

const btnPlay = document.getElementById("btnPlay");
const btnPrev = document.getElementById("btnPrev");
const btnNext = document.getElementById("btnNext");
const btnFullscreen = document.getElementById("btnFullscreen");
const btnSkin = document.getElementById("btnSkin");

const skinLink = document.getElementById("skin-link");
function loadSkin(name) {
  skinLink.href = `skins/${name}.css`;
}

let CONFIG = null;
let TRACKS = [];
let currentIndex = 0;

async function loadConfig() {
  const res = await fetch("config.json", { cache: "no-store" });
  if (!res.ok) throw new Error("No pude cargar config.json");
  return res.json();
}

function renderPlaylist() {
  playlistEl.innerHTML = "";
  TRACKS.forEach((t, idx) => {
    const row = document.createElement("div");
    row.className = "track-item" + (idx === currentIndex ? " active" : "");
    row.innerHTML = `
      <div class="title">${t.title}</div>
      <div class="badge">${idx === currentIndex ? "selected" : ""}</div>
    `;
    row.addEventListener("click", () => setTrack(idx, true));
    playlistEl.appendChild(row);
  });
}

function setTrack(index, autoplay = false) {
  currentIndex = (index + TRACKS.length) % TRACKS.length;
  const t = TRACKS[currentIndex];
  audio.src = t.file;
  nowPlayingEl.textContent = t.title;
  renderPlaylist();
  if (autoplay) audio.play();
  syncPlayButton();
}

function togglePlay() {
  if (!audio.src) setTrack(currentIndex, true);
  else if (audio.paused) audio.play();
  else audio.pause();
  syncPlayButton();
}

function syncPlayButton() {
  btnPlay.textContent = audio.paused ? "Play" : "Pause";
}

function nextTrack(autoplay = true) { setTrack(currentIndex + 1, autoplay); }
function prevTrack(autoplay = true) { setTrack(currentIndex - 1, autoplay); }

const visualStage = document.getElementById("visualStage");
async function toggleFullscreen() {
  try {
    if (!document.fullscreenElement) await visualStage.requestFullscreen();
    else await document.exitFullscreen();
  } catch (e) {
    console.warn("Fullscreen error:", e);
  }
}

function renderRastaButtons() {
  rastaDockEl.innerHTML = "";
  (CONFIG.rastabuttons || []).forEach((b) => {
    const btn = document.createElement("button");
    btn.className = "rasta";
    btn.type = "button";
    btn.textContent = b.label;

    btn.addEventListener("click", () => {
      // Placeholder: luego aquí será "spawn sprites / cambiar modo visual / etc."
      const trackTitle = TRACKS[currentIndex]?.title ?? "—";
      nowPlayingEl.textContent = `${trackTitle}  •  ${b.label}`;
    });

    rastaDockEl.appendChild(btn);
  });
}

function initUI() {
  document.title = CONFIG.app?.title || document.title;

  const skin = CONFIG.app?.defaultSkin || "dub-minimal";
  loadSkin(skin);
  btnSkin.textContent = `Skin: ${skin}`;

  currentIndex = CONFIG.app?.defaultTrackIndex ?? 0;
  TRACKS = CONFIG.playlist || [];
  if (!TRACKS.length) throw new Error("Playlist vacía en config.json");

  renderPlaylist();
  renderRastaButtons();
  setTrack(currentIndex, false);
  syncPlayButton();
}

function wireEvents() {
  btnPlay.addEventListener("click", togglePlay);
  btnNext.addEventListener("click", () => nextTrack(true));
  btnPrev.addEventListener("click", () => prevTrack(true));
  btnFullscreen.addEventListener("click", toggleFullscreen);

  audio.addEventListener("play", syncPlayButton);
  audio.addEventListener("pause", syncPlayButton);
  audio.addEventListener("ended", () => nextTrack(true));
}

(async function main() {
  wireEvents();
  CONFIG = await loadConfig();
  initUI();
})();
