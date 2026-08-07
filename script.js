// STAV HRY A KRYSTALŮ
let gemBalance = 680;
let players = [];
let currentPlayerIndex = 0;
const TOTAL_TILES = 100;

const AVATARS = ['🐱', '🤖', '🥷', '👽', '🧙‍♂️', '🐉'];
const COLORS = ['#e94560', '#00fff5', '#ffbd39', '#9d0191'];

// OTEVÍRÁNÍ A ZAVÍRÁNÍ MODÁLNÍCH OKEN
function closeModals() {
  document.querySelectorAll('.modal').forEach(m => m.classList.add('hidden'));
}

function openBoardGameSetup() {
  closeModals();
  document.getElementById('board-setup-modal').classList.remove('hidden');
  updatePlayerSetup();
}

function openReflexGame() {
  closeModals();
  document.getElementById('reflex-modal').classList.remove('hidden');
}

// AKTUALIZACE VOLBY HRÁČŮ
function updatePlayerSetup() {
  const count = parseInt(document.getElementById('player-count').value);
  const container = document.getElementById('players-config-container');
  container.innerHTML = '';

  for (let i = 0; i < count; i++) {
    const avatarOpts = AVATARS.map(a => `<option value="${a}">${a}</option>`).join('');
    container.innerHTML += `
      <div style="display:flex; gap:10px; align-items:center; margin-bottom:8px;">
        <label>Hráč ${i + 1}:</label>
        <input type="text" id="p-name-${i}" value="Hráč ${i + 1}" style="flex-grow:1;">
        <select id="p-avatar-${i}">${avatarOpts}</select>
      </div>
    `;
  }
}

// SPUŠTĚNÍ DESKOVÉ HRY (100 POLÍČEK)
function startBoardGame() {
  const count = parseInt(document.getElementById('player-count').value);
  players = [];

  for (let i = 0; i < count; i++) {
    players.push({
      id: i,
      name: document.getElementById(`p-name-${i}`).value || `Hráč ${i + 1}`,
      avatar: document.getElementById(`p-avatar-${i}`).value,
      color: COLORS[i],
      position: 0
    });
  }

  closeModals();
  document.getElementById('board-game-modal').classList.remove('hidden');
  
  renderBoard100();
  renderTokens();
  updateTurnUI();
}

function renderBoard100() {
  const board = document.getElementById('board-100');
  board.innerHTML = '';
  for (let i = 0; i < TOTAL_TILES; i++) {
    const tile = document.createElement('div');
    tile.className = 'tile-100';
    tile.id = `tile-100-${i}`;
    tile.innerText = i === 0 ? 'START' : (i === 99 ? 'CÍL' : i + 1);
    board.appendChild(tile);
  }
}

function renderTokens() {
  document.querySelectorAll('.token-100').forEach(t => t.remove());

  players.forEach((p) => {
    const tile = document.getElementById(`tile-100-${p.position}`);
    if (!tile) return;
    const token = document.createElement('div');
    token.className = 'token-100';
    token.style.backgroundColor = p.color;
    token.innerText = p.avatar;
    tile.appendChild(token);
  });
}

function rollDice() {
  const btn = document.getElementById('dice-btn');
  btn.disabled = true;

  const roll = Math.floor(Math.random() * 6) + 1;
  document.getElementById('dice-result').innerText = `Hodil jsi: ${roll}`;

  let player = players[currentPlayerIndex];
  player.position += roll;
  if (player.position >= TOTAL_TILES) {
    player.position = TOTAL_TILES - 1;
    alert(`🎉 Hráč ${player.name} vyhrál hru!`);
    addGems(50);
  }

  renderTokens();

  setTimeout(() => {
    btn.disabled = false;
    currentPlayerIndex = (currentPlayerIndex + 1) % players.length;
    updateTurnUI();
  }, 400);
}

function updateTurnUI() {
  const current = players[currentPlayerIndex];
  if (current) {
    document.getElementById('turn-player-name').innerText = `${current.avatar} ${current.name}`;
    document.getElementById('turn-player-name').style.color = current.color;
  }
}

// SAMOSTATNÁ MINIHRA CRYSTAL REFLEX
function runReflexRound() {
  const area = document.getElementById('reflex-game-area');
  area.innerHTML = '<span style="color:#aaa;">Příprava... Sleduj plochu!</span>';

  const delay = Math.floor(Math.random() * 2000) + 1500;

  setTimeout(() => {
    area.innerHTML = '';
    const crystal = document.createElement('button');
    crystal.innerText = '💎 KLIKNI TEĎ!';
    crystal.className = 'btn-launch';
    crystal.style.position = 'absolute';
    crystal.style.width = 'auto';
    crystal.style.padding = '15px 25px';

    const startTime = Date.now();

    crystal.onclick = () => {
      const reactionTime = Date.now() - startTime;
      const earned = Math.max(5, Math.floor(10000 / reactionTime));
      addGems(earned);
      alert(`Skvělý reflex! Čas: ${reactionTime} ms. Získal jsi +${earned} krystalů!`);
      area.innerHTML = '<button id="start-reflex-btn" class="btn-launch" onclick="runReflexRound()">Hráte Znova</button>';
    };

    area.appendChild(crystal);
  }, delay);
}

// PRÁCE S KRYSTALY
function addGems(amount) {
  gemBalance += amount;
  document.getElementById('gem-count').innerText = gemBalance;
}
