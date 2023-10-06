async function recordEvent(event) {
  if (!chrome.runtime?.id) return; // connection with background was probably disconnected.
  let eventType = 0;
  switch (event.type) {
    case 'mousemove':
      eventType = 1;
      break;
    case 'mousedown':
      eventType = 2;
      break;
    case 'mouseup':
      eventType = 3;
      break;
    default:
      break;
  }
  const item = [new Date().getTime(), eventType, event.clientX, event.clientY, event.which];
  await chrome.runtime.sendMessage({ type: 'mouseevent', item });
}

document.addEventListener('mousemove', recordEvent, {capture: true, passive: true});
document.addEventListener('mousedown', recordEvent, {capture: true, passive: true});
document.addEventListener('mouseup', recordEvent, {capture: true, passive: true});
