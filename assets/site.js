'use strict';
// Local preview: the live catalog will be connected to the future administration panel.
const search = document.querySelector('#search');
search?.addEventListener('submit', event => {
  event.preventDefault();
  document.querySelector('#result').textContent = 'Il catalogo non è ancora attivo. Nessun annuncio è stato pubblicato in questa anteprima.';
});
const detail = document.querySelector('#detail');
let dialogTrigger = null;
function openDialog(dialog, trigger) {
  if (!dialog || dialog.open) return;
  dialogTrigger = trigger;
  dialog.showModal();
  dialog.querySelector('.close')?.focus({preventScroll:true});
}
for (const dialog of document.querySelectorAll('dialog')) {
  dialog.querySelector('.close')?.addEventListener('click', () => dialog.close());
  dialog.addEventListener('click', event => {
    if (event.target !== dialog) return;
    const r = dialog.getBoundingClientRect();
    if (event.clientX < r.left || event.clientX > r.right || event.clientY < r.top || event.clientY > r.bottom) dialog.close();
  });
  dialog.addEventListener('close', () => { dialogTrigger?.focus({preventScroll:true}); dialogTrigger = null; });
}
for (const trigger of document.querySelectorAll('.listing .link, .listing-media')) {
  trigger.addEventListener('click', () => {
    const card = trigger.closest('.listing'), img = card.querySelector('img');
    const detailImg = document.querySelector('#detailImage');
    detailImg.src = img.src; detailImg.alt = img.alt;
    document.querySelector('#detailTitle').textContent = card.querySelector('h3').textContent;
    openDialog(detail, trigger);
  });
}
const viewer = document.querySelector('#photoViewer');
const tiles = [...document.querySelectorAll('.photo-tile')];
let album = [], current = 0;
const viewerImage = document.querySelector('#viewerImage');
const prev = document.querySelector('#prevPhoto'), next = document.querySelector('#nextPhoto');
function showPhoto() {
  const tile = album[current], img = tile.querySelector('img');
  viewerImage.src = img.src; viewerImage.alt = img.alt;
  document.querySelector('#photoTitle').textContent = tile.querySelector('strong').textContent;
  document.querySelector('#photoNote').textContent = tile.querySelector('small').textContent;
  document.querySelector('#photoCount').textContent = `Foto ${current+1} di ${album.length}`;
  const focused = document.activeElement;
  prev.disabled = current === 0; next.disabled = current === album.length-1;
  if (focused === prev && prev.disabled) (next.disabled ? viewer.querySelector('.close') : next).focus();
  if (focused === next && next.disabled) (prev.disabled ? viewer.querySelector('.close') : prev).focus();
  viewerImage.classList.remove('viewer-fade');
  void viewerImage.offsetWidth;
  viewerImage.classList.add('viewer-fade');
}
function movePhoto(delta) { if (current+delta >= 0 && current+delta < album.length) { current+=delta; showPhoto(); } }
for (const tile of tiles) tile.addEventListener('click', () => {
  album = tiles.filter(x => x.dataset.group === tile.dataset.group);
  current = album.indexOf(tile); showPhoto(); openDialog(viewer, tile);
});
prev?.addEventListener('click', () => movePhoto(-1));
next?.addEventListener('click', () => movePhoto(1));
document.addEventListener('keydown', event => {
  if (!viewer?.open) return;
  if (event.key === 'ArrowLeft') {event.preventDefault(); movePhoto(-1);}
  if (event.key === 'ArrowRight') {event.preventDefault(); movePhoto(1);}
});
// Swipe left/right in the gallery; vertical gestures remain available for scrolling.
let start = null;
viewerImage?.addEventListener('touchstart', event => { if(event.touches.length===1) start = [event.touches[0].clientX,event.touches[0].clientY]; else start=null; }, {passive:true});
viewerImage?.addEventListener('touchend', event => {
  if (!start || !event.changedTouches.length) return;
  const t=event.changedTouches[0], dx=t.clientX-start[0], dy=t.clientY-start[1]; start=null;
  if (Math.abs(dx)>50 && Math.abs(dx)>Math.abs(dy)*1.5) movePhoto(dx<0?1:-1);
}, {passive:true});
viewerImage?.addEventListener('touchcancel', () => { start=null; }, {passive:true});

// Floating note remains in the viewport; optional collapse is local to this page.
const valuationNote = document.querySelector('.valuation-note');
const valuationToggle = valuationNote?.querySelector('.valuation-note-toggle');
if (valuationToggle) {
  valuationToggle.hidden = false;
  valuationToggle.addEventListener('click', () => {
    const compact = valuationNote.classList.toggle('is-compact');
    valuationToggle.textContent = compact ? '+' : '−';
    valuationToggle.setAttribute('aria-expanded', String(!compact));
    valuationToggle.setAttribute('aria-label', compact ? 'Espandi il promemoria' : 'Riduci il promemoria');
  });
}
