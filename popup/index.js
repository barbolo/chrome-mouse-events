async function initialize() {
  const btnStart    = document.getElementById('start');
  const btnStop     = document.getElementById('stop');
  const btnDownload = document.getElementById('download');
  const btnClear    = document.getElementById('clear');

  if (btnStart) btnStart.onclick = start;
  if (btnStop) btnStop.onclick = stop;
  if (btnDownload) btnDownload.onclick = download;
  if (btnClear) btnClear.onclick = clear;
}

async function start() {
  await chrome.action.setBadgeText({ text: 'On' });
  await chrome.action.setPopup({ popup: 'popup/recording.html' });
  await chrome.runtime.sendMessage({ type: 'start' });
  document.location.href = 'recording.html';
}

async function stop() {
  await chrome.action.setBadgeText({ text: '' });
  await chrome.action.setPopup({ popup: 'popup/index.html' });
  await chrome.runtime.sendMessage({ type: 'stop' });
  document.location.href = 'index.html';
}

async function download() {
  const csv = await chrome.runtime.sendMessage({ type: 'download' });
  const blob = new Blob([csv], { type: 'text/csv' });
  const blobURL = URL.createObjectURL(blob);
  window.open(blobURL, '_blank');
}

async function clear() {
  await chrome.runtime.sendMessage({ type: 'clear' });
  document.location.href = 'cleared.html';
}

window.onload = initialize;
