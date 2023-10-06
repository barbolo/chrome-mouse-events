importScripts('utils/mutexify.js');

let active = false;
const mouseEvents = [];

// set active status
chrome.action.getBadgeText({}, text => (active = text == 'On'));

chrome.runtime.onMessage.addListener(function(message, sender, sendResponse) {
  let sendResponseAsync;
  switch (message?.type) {
    case 'mouseevent':
      if (active && message.item) mouseEvents.push(message.item);
      break;
    case 'start':
      active = true;
      break;
    case 'stop':
      active = false;
      break;
    case 'download':
      generateCSV().then(sendResponse);
      sendResponseAsync = true;
      break;
    case 'clear':
      clear().then(sendResponse);
      sendResponseAsync = true;
    default:
      break;
  }
  return sendResponseAsync;
});

const persistIntervalMin = 1; // persist mouse events every x minutes
const mutex = mutexify();
const synchronize = fn => mutex(async release => { try { await fn.call() } catch {}; release(); })
async function persistMouseEvents() {
  return new Promise(resolve => {
    synchronize(async () => {
      let eventsCount = mouseEvents.length + 1;
      const eventsArray = [];
      while ((eventsCount -= 1) > 0) {
        const event = mouseEvents.shift();
        if (event) eventsArray.push(event);
      }
      if (eventsArray.length > 0) {
        let count = ((await chrome.storage.local.get('mouseEventsCount')) || {})['mouseEventsCount'];
        if (typeof count != 'number') count = -1;
        count++;
        const key = `mouseEventsAt${count}`;
        const store = {};
        store['mouseEventsCount'] = count;
        store[key] = eventsArray;
        await chrome.storage.local.set(store);
      }
      resolve();
    });
  })
}
setInterval(persistMouseEvents, persistIntervalMin * 60 * 1_000);

const CSV_HEADER = ['TIME_MS', 'EVENT', 'X', 'Y', 'BUTTON'].join(',');
async function generateCSV() {
  await persistMouseEvents(); // ensure all mouseEvents are persisted
  const lastKeyIndex = ((await chrome.storage.local.get('mouseEventsCount')) || {})['mouseEventsCount'];
  const keys = [];
  for (let i = 0; i <= lastKeyIndex; i++) keys.push(`mouseEventsAt${i}`);
  const eventsSets = await chrome.storage.local.get(keys);
  let csv = CSV_HEADER + "\n";
  for (const key of keys) {
    for (const event of eventsSets[key]) csv += (event.join(',') + "\n");
  }
  return csv;
}

async function clear() {
  mouseEvents.splice(0,mouseEvents.length); // remove all events from mouseEvents
  await chrome.storage.local.clear(); // remove all items from storage
}
