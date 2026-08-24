const audio = document.querySelector('#audio');
const openButton = document.querySelector('#openButton');
const dropZone = document.querySelector('#dropZone');
const fileName = document.querySelector('#fileName');
const status = document.querySelector('#status');
const seek = document.querySelector('#seek');
const currentTime = document.querySelector('#currentTime');
const duration = document.querySelector('#duration');
const toggleButton = document.querySelector('#toggle');
const backwardButton = document.querySelector('#backward');
const forwardButton = document.querySelector('#forward');
const seekSecondsInput = document.querySelector('#seekSeconds');
const volumeInput = document.querySelector('#volume');
const volumeValue = document.querySelector('#volumeValue');
const playlistElement = document.querySelector('#playlist');
const playlistCount = document.querySelector('#playlistCount');
const playbackState = document.querySelector('#playbackState');
const shortcutDialog = document.querySelector('#shortcutDialog');
const shortcutForm = document.querySelector('#shortcutForm');
const shortcutError = document.querySelector('#shortcutError');
const shortcutInputs = [...document.querySelectorAll('.shortcut-input')];
const localShortcutInputs = [...document.querySelectorAll('.local-shortcut')];
const globalShortcutInputs = [...document.querySelectorAll('.global-shortcut')];
let currentShortcuts = {};
let currentGlobalShortcuts = {};
let seekSeconds = 10;
let playlist = [];
let currentTrackIndex = -1;
let nextTrackId = 1;
const recentlyAddedIds = new Set();
const playIcon = '<svg viewBox="0 0 24 24"><path class="fill" d="m9 6 9 6-9 6V6Z"/></svg>';
const pauseIcon = '<svg viewBox="0 0 24 24"><path class="fill" d="M7.5 6h3v12h-3zM13.5 6h3v12h-3z"/></svg>';

const keyNames = {
  ' ': 'Space', Space: 'Space', ArrowLeft: 'Left', ArrowRight: 'Right', ArrowUp: 'Up', ArrowDown: 'Down',
  Escape: 'Esc', Enter: 'Return', Backspace: 'Backspace', Delete: 'Delete', Tab: 'Tab',
  Home: 'Home', End: 'End', PageUp: 'PageUp', PageDown: 'PageDown'
};

function acceleratorFromEvent(event) {
  const key = keyNames[event.key]
    || (/^F([1-9]|1[0-9]|2[0-4])$/.test(event.key) ? event.key : null)
    || (event.code.startsWith('Key') ? event.code.slice(3) : null)
    || (event.code.startsWith('Digit') ? event.code.slice(5) : null);
  if (!key) return null;

  const modifiers = [];
  if (event.metaKey) modifiers.push('Command');
  if (event.ctrlKey) modifiers.push('Control');
  if (event.altKey) modifiers.push('Option');
  if (event.shiftKey) modifiers.push('Shift');
  return [...modifiers, key].join('+');
}

function displayShortcut(accelerator) {
  return accelerator
    .replaceAll('CommandOrControl', '⌘')
    .replaceAll('Command', '⌘')
    .replaceAll('Control', '⌃')
    .replaceAll('Option', '⌥')
    .replaceAll('Shift', '⇧')
    .replaceAll('Space', 'Space')
    .replaceAll('Left', '←').replaceAll('Right', '→')
    .replaceAll('Up', '↑').replaceAll('Down', '↓')
    .replaceAll('+', ' ');
}

function renderShortcutGroup(shortcuts, inputs) {
  for (const input of inputs) {
    input.dataset.accelerator = shortcuts[input.dataset.command];
    input.value = displayShortcut(shortcuts[input.dataset.command]);
  }
}

function renderShortcuts(shortcuts) {
  currentShortcuts = { ...shortcuts };
  renderShortcutGroup(shortcuts, localShortcutInputs);
  renderShortcutSummary();
}

function renderGlobalShortcuts(shortcuts) {
  currentGlobalShortcuts = { ...shortcuts };
  renderShortcutGroup(shortcuts, globalShortcutInputs);
}

function renderShortcutSummary() {
  if (!currentShortcuts.toggle) return;
  document.querySelector('#shortcutSummary').innerHTML = `
    <span>재생 <kbd>${displayShortcut(currentShortcuts.toggle)}</kbd></span>
    <span>−${seekSeconds}초 <kbd>${displayShortcut(currentShortcuts.backward)}</kbd></span>
    <span>+${seekSeconds}초 <kbd>${displayShortcut(currentShortcuts.forward)}</kbd></span>
    <span>볼륨 <kbd>${displayShortcut(currentShortcuts.volumeDown)}</kbd><kbd>${displayShortcut(currentShortcuts.volumeUp)}</kbd></span>`;
}

function formatTime(seconds) {
  if (!Number.isFinite(seconds)) return '0:00';
  const minutes = Math.floor(seconds / 60);
  const remainder = Math.floor(seconds % 60).toString().padStart(2, '0');
  return `${minutes}:${remainder}`;
}

function renderPlaylist() {
  playlistElement.replaceChildren();
  playlistCount.textContent = playlist.length > 99 ? '99+' : playlist.length;

  playlist.forEach((track, index) => {
    const item = document.createElement('li');
    item.className = `playlist-item${index === currentTrackIndex ? ' current' : ''}${recentlyAddedIds.has(track.id) ? ' added' : ''}`;

    const number = document.createElement('span');
    number.className = 'playlist-index';
    number.textContent = index === currentTrackIndex && !audio.paused ? '▶' : String(index + 1);

    const select = document.createElement('button');
    select.className = 'playlist-track';
    select.type = 'button';
    select.textContent = track.name;
    select.title = track.name;
    select.addEventListener('click', () => playTrack(index));

    const remove = document.createElement('button');
    remove.className = 'playlist-remove';
    remove.type = 'button';
    remove.setAttribute('aria-label', `${track.name} 삭제`);
    remove.textContent = '×';
    remove.addEventListener('click', () => removeTrack(index));

    item.append(number, select, remove);
    playlistElement.append(item);
  });
}

function addTracks(tracks) {
  if (tracks.length === 0) return;
  const firstNewIndex = playlist.length;
  const additions = tracks.map((track) => ({ id: nextTrackId++, ...track }));
  for (const track of additions) recentlyAddedIds.add(track.id);
  playlist.push(...additions);
  renderPlaylist();
  if (currentTrackIndex === -1) playTrack(firstNewIndex);
  window.setTimeout(() => {
    for (const track of additions) recentlyAddedIds.delete(track.id);
    renderPlaylist();
  }, 1300);
}

function playTrack(index, autoplay = true) {
  const track = playlist[index];
  if (!track) return;
  currentTrackIndex = index;
  audio.src = track.url;
  fileName.textContent = track.name;
  status.textContent = '재생 준비됨';
  playbackState.textContent = '준비';
  seek.value = 0;
  currentTime.textContent = '0:00';
  renderPlaylist();
  if (!autoplay) return;
  audio.play().catch(() => {
    status.textContent = '재생 버튼을 눌러 시작하세요';
  });
}

function removeTrack(index) {
  const wasCurrent = index === currentTrackIndex;
  const wasPlaying = !audio.paused;
  const [removed] = playlist.splice(index, 1);
  if (removed?.objectUrl) URL.revokeObjectURL(removed.objectUrl);

  if (playlist.length === 0) {
    resetPlayer();
  } else if (wasCurrent) {
    playTrack(Math.min(index, playlist.length - 1), wasPlaying);
  } else {
    if (index < currentTrackIndex) currentTrackIndex -= 1;
    renderPlaylist();
  }
}

function resetPlayer() {
  audio.pause();
  audio.removeAttribute('src');
  audio.load();
  currentTrackIndex = -1;
  fileName.textContent = '재생할 파일이 없습니다';
  status.textContent = '파일을 열거나 창에 드롭하세요';
  playbackState.textContent = '대기';
  seek.value = 0;
  seek.max = 100;
  currentTime.textContent = '0:00';
  duration.textContent = '0:00';
  renderPlaylist();
}

function clearPlaylist() {
  for (const track of playlist) if (track.objectUrl) URL.revokeObjectURL(track.objectUrl);
  playlist = [];
  resetPlayer();
}

function playRelativeTrack(offset, wrap = true) {
  if (playlist.length === 0) return;
  let nextIndex = currentTrackIndex + offset;
  if (wrap) nextIndex = (nextIndex + playlist.length) % playlist.length;
  if (nextIndex >= 0 && nextIndex < playlist.length) playTrack(nextIndex);
}

function togglePlayback() {
  if (!audio.src) return;
  if (audio.paused) audio.play();
  else audio.pause();
}

function move(seconds) {
  if (!audio.src) return;
  const end = Number.isFinite(audio.duration) ? audio.duration : Infinity;
  audio.currentTime = Math.max(0, Math.min(audio.currentTime + seconds, end));
}

openButton.addEventListener('click', async () => {
  const files = await window.playerAPI.chooseAudio();
  addTracks(files);
});

document.querySelector('#previousTrack').addEventListener('click', () => playRelativeTrack(-1));
document.querySelector('#nextTrack').addEventListener('click', () => playRelativeTrack(1));
document.querySelector('#clearPlaylist').addEventListener('click', clearPlaylist);

document.querySelector('#settingsButton').addEventListener('click', () => {
  shortcutError.textContent = '';
  renderShortcuts(currentShortcuts);
  renderGlobalShortcuts(currentGlobalShortcuts);
  shortcutDialog.showModal();
});
document.querySelector('#closeSettings').addEventListener('click', () => shortcutDialog.close());

for (const input of shortcutInputs) {
  input.addEventListener('keydown', (event) => {
    event.preventDefault();
    event.stopPropagation();
    const accelerator = acceleratorFromEvent(event);
    if (!accelerator) {
      shortcutError.textContent = '지원되는 키를 눌러주세요.';
      return;
    }
    shortcutError.textContent = '';
    input.dataset.accelerator = accelerator;
    input.value = displayShortcut(accelerator);
  });
}

shortcutForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  const localCandidate = Object.fromEntries(localShortcutInputs.map((input) => [input.dataset.command, input.dataset.accelerator]));
  const globalCandidate = Object.fromEntries(globalShortcutInputs.map((input) => [input.dataset.command, input.dataset.accelerator]));
  const localResult = await window.playerAPI.setShortcuts(localCandidate);
  if (!localResult.ok) {
    shortcutError.textContent = localResult.error;
    return;
  }
  const globalResult = await window.playerAPI.setGlobalShortcuts(globalCandidate);
  if (!globalResult.ok) {
    shortcutError.textContent = globalResult.error;
    return;
  }
  renderShortcuts(localResult.shortcuts);
  renderGlobalShortcuts(globalResult.shortcuts);
  shortcutDialog.close();
});

function runShortcut(command) {
  if (command === 'toggle') togglePlayback();
  if (command === 'backward') move(-seekSeconds);
  if (command === 'forward') move(seekSeconds);
  if (command === 'volumeUp') changeVolume(0.05);
  if (command === 'volumeDown') changeVolume(-0.05);
}

window.playerAPI.onGlobalShortcut(runShortcut);

document.addEventListener('keydown', (event) => {
  if (shortcutDialog.open || event.target.matches('input, button')) return;
  const accelerator = acceleratorFromEvent(event);
  if (!accelerator) return;
  const command = Object.keys(currentShortcuts).find((name) => currentShortcuts[name] === accelerator);
  if (!command) return;
  event.preventDefault();
  runShortcut(command);
});

document.querySelector('#resetShortcuts').addEventListener('click', async () => {
  const result = await window.playerAPI.resetShortcuts();
  if (!result.ok) shortcutError.textContent = result.error;
  else renderShortcuts(result.shortcuts);
});

document.querySelector('#resetGlobalShortcuts').addEventListener('click', async () => {
  const result = await window.playerAPI.resetGlobalShortcuts();
  if (!result.ok) shortcutError.textContent = result.error;
  else renderGlobalShortcuts(result.shortcuts);
});

document.querySelector('#toggle').addEventListener('click', togglePlayback);
backwardButton.addEventListener('click', () => move(-seekSeconds));
forwardButton.addEventListener('click', () => move(seekSeconds));

function applySeekSeconds(value) {
  seekSeconds = value;
  seekSecondsInput.value = value;
  document.querySelector('#backwardValue').textContent = value;
  document.querySelector('#forwardValue').textContent = value;
  backwardButton.setAttribute('aria-label', `${value}초 뒤로`);
  forwardButton.setAttribute('aria-label', `${value}초 앞으로`);
  renderShortcutSummary();
}

seekSecondsInput.addEventListener('change', async () => {
  const result = await window.playerAPI.setSeekSeconds(seekSecondsInput.value);
  if (!result.ok) {
    status.textContent = result.error;
    seekSecondsInput.value = seekSeconds;
    return;
  }
  applySeekSeconds(result.seekSeconds);
});

function applyVolume(value) {
  const nextVolume = Math.max(0, Math.min(1, Number(value)));
  audio.volume = nextVolume;
  volumeInput.value = nextVolume;
  volumeValue.textContent = Math.round(nextVolume * 100);
}

function changeVolume(delta) {
  applyVolume(audio.volume + delta);
  window.playerAPI.setVolume(audio.volume);
}

volumeInput.addEventListener('input', () => applyVolume(volumeInput.value));
volumeInput.addEventListener('change', () => window.playerAPI.setVolume(audio.volume));

audio.addEventListener('play', () => {
  document.body.classList.add('is-playing');
  toggleButton.innerHTML = pauseIcon;
  toggleButton.setAttribute('aria-label', '일시정지');
  status.textContent = '재생 중';
  playbackState.textContent = '재생 중';
  renderPlaylist();
});

audio.addEventListener('pause', () => {
  document.body.classList.remove('is-playing');
  toggleButton.innerHTML = playIcon;
  toggleButton.setAttribute('aria-label', '재생');
  if (audio.src && !audio.ended) {
    status.textContent = '일시정지';
    playbackState.textContent = '일시정지';
  }
  renderPlaylist();
});

audio.addEventListener('ended', () => {
  document.body.classList.remove('is-playing');
  toggleButton.innerHTML = playIcon;
  if (currentTrackIndex < playlist.length - 1) {
    playRelativeTrack(1, false);
  } else {
    status.textContent = '재생목록 완료';
    playbackState.textContent = '완료';
    renderPlaylist();
  }
});

audio.addEventListener('loadedmetadata', () => {
  seek.max = audio.duration;
  duration.textContent = formatTime(audio.duration);
});

audio.addEventListener('timeupdate', () => {
  seek.value = audio.currentTime;
  currentTime.textContent = formatTime(audio.currentTime);
});

seek.addEventListener('input', () => {
  if (audio.src) audio.currentTime = Number(seek.value);
});

for (const eventName of ['dragenter', 'dragover']) {
  document.addEventListener(eventName, (event) => {
    event.preventDefault();
    document.body.classList.add('dragging');
  });
}

for (const eventName of ['dragleave', 'drop']) {
  document.addEventListener(eventName, (event) => {
    event.preventDefault();
    if (eventName === 'drop' || event.relatedTarget === null) document.body.classList.remove('dragging');
  });
}

document.addEventListener('drop', (event) => {
  const supportedExtensions = ['mp3', 'm4a', 'wav', 'aac', 'ogg', 'flac'];
  const files = [...event.dataTransfer.files].filter((item) => {
    const extension = item.name.split('.').pop()?.toLowerCase();
    return item.type.startsWith('audio/') || supportedExtensions.includes(extension);
  });
  if (files.length === 0) {
    status.textContent = '지원되는 오디오 파일이 아닙니다';
    return;
  }
  try {
    addTracks(files.map((file) => {
      const objectUrl = URL.createObjectURL(file);
      return { name: file.name, url: objectUrl, objectUrl };
    }));
  } catch (error) {
    status.textContent = `파일을 열지 못했습니다: ${error.message}`;
  }
});

window.playerAPI.getShortcuts().then(renderShortcuts);
window.playerAPI.getGlobalShortcuts().then(renderGlobalShortcuts);
window.playerAPI.getSeekSeconds().then(applySeekSeconds);
window.playerAPI.getVolume().then(applyVolume);
renderPlaylist();
