// client.js - UI logic, YouTube API, chat via proxy, games, search, quotes, theme
const cfg = window.APP_CONFIG || {};
const YT_LIST = cfg.YOUTUBE_LIST || [];
let currentIndex = 0;
let ytPlayer = null;

function onYouTubeIframeAPIReady() {
  const id = YT_LIST[0] || '';
  ytPlayer = new YT.Player('player', {
    height: '200',
    width: '100%',
    videoId: id,
    playerVars: { 'playsinline': 1, 'rel': 0, 'enablejsapi': 1 },
    events: { 'onReady': onPlayerReady }
  });
}

function onPlayerReady() { updateTitle(YT_LIST[currentIndex]); }

function updateTitle(id){ document.getElementById('ytTitle').textContent = id ? 'Video ID: ' + id : ''; }

function renderByIndex(i){
  if(!YT_LIST.length) return;
  currentIndex = (i + YT_LIST.length) % YT_LIST.length;
  const id = YT_LIST[currentIndex];
  if(ytPlayer && ytPlayer.loadVideoById) ytPlayer.loadVideoById(id);
  updateTitle(id);
}

function playPause(){ if(!ytPlayer) return; const state = ytPlayer.getPlayerState(); if(state === YT.PlayerState.PLAYING) ytPlayer.pauseVideo(); else ytPlayer.playVideo(); }
function nextVid(){ renderByIndex(currentIndex+1); }
function prevVid(){ renderByIndex(currentIndex-1); }
function playRandom(){ renderByIndex(Math.floor(Math.random()*YT_LIST.length)); }

document.addEventListener('DOMContentLoaded', ()=>{
  document.getElementById('randomBtn').addEventListener('click', playRandom);
  document.getElementById('randomSmall').addEventListener('click', playRandom);
  document.getElementById('nextVid').addEventListener('click', nextVid);
  document.getElementById('prevVid').addEventListener('click', prevVid);
  document.getElementById('playPause').addEventListener('click', playPause);

  document.getElementById('searchBtn').addEventListener('click', ()=>{
    const q = document.getElementById('gq').value.trim();
    if(!q) return;
    window.open('https://www.google.com/search?q='+encodeURIComponent(q), '_blank');
  });

  const QUOTES = [
    "Sukses bukan kunci kebahagiaan — kebahagiaan adalah kunci sukses.",
    "Kerja keras hari ini, cerita sukses esok hari.",
    "Jangan takut gagal; takutlah jika tidak pernah mencoba.",
    "Mulailah dari yang kecil, konsistenlah, dan lihat perubahan."
  ];
  document.getElementById('nextQuote').addEventListener('click', ()=>{ document.getElementById('quoteText').textContent = QUOTES[Math.floor(Math.random()*QUOTES.length)]; });

  document.querySelectorAll('.gbtn').forEach(b=> b.addEventListener('click', ()=>{ document.getElementById('gameFrame').src = b.getAttribute('data-src'); }));

  document.getElementById('themeToggle').addEventListener('click', ()=> document.body.classList.toggle('dark'));

  document.getElementById('chatSend').addEventListener('click', sendChat);
  document.getElementById('chatIn').addEventListener('keydown', (e)=>{ if(e.key==='Enter') sendChat(); });
  playRandom();
});

async function sendChat(){
  const input = document.getElementById('chatIn');
  const msg = input.value.trim();
  if(!msg) return;
  const log = document.getElementById('chatLog');
  const userDiv = document.createElement('div'); userDiv.innerHTML = '<b>You:</b> '+msg; log.appendChild(userDiv);
  input.value='';
  const aiDiv = document.createElement('div'); aiDiv.innerHTML = '<b>AI:</b> ...'; log.appendChild(aiDiv);
  log.scrollTop = log.scrollHeight;

  const proxyBase = cfg.PROXY_BASE || '';
  const url = (proxyBase ? proxyBase.replace(/\/$/, '') : '') + '/api/chat';
  try{
    const res = await fetch(url, { method:'POST', headers:{ 'Content-Type':'application/json' }, body: JSON.stringify({ message: msg }) });
    if(res.ok){
      const j = await res.json();
      aiDiv.innerHTML = '<b>AI:</b> ' + (j.reply || j.error || 'No reply');
      document.getElementById('aiStatus').textContent = 'AI: done';
      return;
    } else {
      aiDiv.innerHTML = '<b>AI:</b> Mock reply: ' + msg.split('').reverse().join('');
      document.getElementById('aiStatus').textContent = 'AI: mock (proxy error)';
    }
  }catch(e){
    aiDiv.innerHTML = '<b>AI:</b> Mock reply: ' + msg.split('').reverse().join('');
    document.getElementById('aiStatus').textContent = 'AI: mock (no proxy)';
  }
}
