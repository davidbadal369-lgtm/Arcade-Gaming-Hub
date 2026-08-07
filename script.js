// MOŽNOSTI AVATARŮ A BAREV
const AVATAR_OPTIONS = [
  { id: 'cat', emoji: '🐱', label: 'Kočka' },
  { id: 'robot', emoji: '🤖', label: 'Robot' },
  { id: 'ninja', emoji: '🥷', label: 'Ninja' },
  { id: 'alien', emoji: '👽', label: 'Mimozemšťan' },
  { id: 'wizard', emoji: '🧙‍♂️', label: 'Čaroděj' },
  { id: 'dragon', emoji: '🐉', label: 'Drak' }
];

const COLOR_OPTIONS = ['#e94560', '#00fff5', '#ffbd39', '#9d0191'];

let players = [];
let selectedMinigameIds = [];
let currentPlayerIndex = 0;
const TOTAL_TILES = 20;

// DATABÁZE MINIHER
const MINIGAMES = [
  {
    id: 'reaction_test',
    title: '⚡ Rychlé Reflexy',
    minPlayers: 1,
    maxPlayers: 4,
    description: 'Klikni na tlačítko jakmile se změní na zelenou!',
    start: function(container, onComplete) {
      container.innerHTML = `<button id="reflex-btn" style="padding:15px; background:red; color:white; border:none; border-radius:8px; cursor:pointer; width:100%; font-weight:bold;">Čekej...</button>`;
      const btn = document.getElementById('reflex-btn');
      const delay = Math.floor(Math.random() * 3000) + 2000;
      
      setTimeout(() => {
        btn.style.background = '#00ff88';
        btn.style.color = '#000';
        btn.innerText = 'KLIKNI TEĎ!';
        const readyTime = Date.now();
        btn.onclick = () => {
          const score = Date.now() - readyTime;
          alert(`Tůj čas: ${score} ms!`);
          onComplete(true);
        };
      }, delay);
    }
  },
  {
    id: 'math_challenge',
    title: '🧮 Rychlé Počty',
    minPlayers: 1,
    maxPlayers: 4,
    description: 'Spočítej příklad správně!',
    start: function(container, onComplete) {
      const a = Math.floor(Math.random() * 10) + 1;
      const b = Math.floor(Math.random() * 10) + 1;
      const correct = a * b;
      
      container.innerHTML = `
        <p style="font-size: 20px;">Kolik je <strong>${a} × ${b}</strong>?</p>
        <input type="number" id="math-answer" style="margin-bottom: 15px; width: 80%; padding: 8px; text-align: center;" />
        <button id="math-submit" class="btn-primary">Odeslat</button>
      `;
      
      document.getElementById('math-submit').onclick = () => {
        const val = parseInt(document.getElementById('math-answer').value);
        if (val === correct) {
          alert('Správně!');
          onComplete(true);
        } else {
          alert(`Špatně! Správná odpověď byla ${correct}.`);
          onComplete(false);
        }
      };
    }
  },
  {
    id: 'solo_target_clicker',
    title: '🎯 Sólo Terče',
    minPlayers: 1,
    maxPlayers: 1,
    description: 'Sestřel 3 terče v časovém okně!',
    start: function(container, onComplete) {
      let score = 0;
      container.innerHTML = `<div id="target-area" style="height:150px; position:relative; background:#0f3460; border-radius:8px; overflow:hidden;"></div>`;
      const area = document.getElementById('target-area');

      function spawnTarget() {
        if (score >= 3) {
          alert('Minihra dokončena!');
          onComplete(true);
          return;
        }
        const target = document.createElement('div');
        target.innerText = '🎯';
        target.style.fontSize = '24px';
        target.style.position = 'absolute';
        target.style.cursor = 'pointer';
        target.style.left = Math.random() * 80 + '%';
        target.style.top = Math.random() * 70 + '%';
        target.onclick = () => {
          score++;
          target.remove();
          spawnTarget();
        };
        area.appendChild(target);
      }
      spawnTarget();
    }
  }
];

// INICIALIZACE NASTAVENÍ PROFILŮ A DLAŽDIC MINIHER
function updatePlayerSetup() {
  const countSelect = document.getElementById('player-count');
  if (!countSelect) return;
  const count = parseInt(countSelect.value);
  
  // Nastavení hráčů
  const container = document.getElementById('players-config-container');
  if (container) {
    container.innerHTML = '';
    for (let i = 0; i < count; i++) {
      const avatarOptionsHTML = AVATAR_OPTIONS.map(a => `<option value="${a.emoji}">${a.emoji} ${a.label}</option>`).join('');
      container.innerHTML += `
        <div class="player-row">
          <label>Hráč ${i + 1}:</label>
          <input type="text" id="p-name-${i}" value="Hráč ${i + 1}" placeholder="Jméno">
          <select id="p-avatar-${i}">${avatarOptionsHTML}</select>
          <div style="width: 20px; height: 20px; background-color: ${COLOR_OPTIONS[i]}; border-radius: 50%;"></div>
        </div>
      `;
    }
  }

  // Generování dlaždic miniher
  renderMinigameOptions(count);
}

function renderMinigameOptions(playerCount) {
  const container = document.getElementById('minigames-selection-container');
  if (!container) return;

  container.innerHTML = '';

  const validGames = MINIGAMES.filter(g => playerCount >= g.minPlayers && playerCount <= g.maxPlayers);

  if (validGames.length === 0) {
    container.innerHTML = '<span style="color:#aaa; grid-column: 1/-1;">Pro tento počet hráčů nejsou dostupné žádné minihry.</span>';
    return;
  }

  validGames.forEach(game => {
    const titleParts = game.title.split(' ');
    const icon = titleParts[0];
    const name = titleParts.slice(1).join(' ');

    const card = document.createElement('div');
    card.className = 'minigame-card selected';
    card.dataset.gameId = game.id;

    card.innerHTML = `
      <div class="icon">${icon}</div>
      <div class="title">${name}</div>
      <div class="badge">${game.minPlayers === game.maxPlayers ? game.minPlayers + ' Hráč' : game.minPlayers + '-' + game.maxPlayers + ' Hráči'}</div>
    `;

    card.onclick = () => {
      card.classList.toggle('selected');
    };

    container.appendChild(card);
  });
}

// SPUŠTĚNÍ HRY
function startGame() {
  const count = parseInt(document.getElementById('player-count').value);
  players = [];

  for (let i = 0; i < count; i++) {
    players.push({
      id: i,
      name: document.getElementById(`p-name-${i}`).value || `Hráč ${i + 1}`,
      avatar: document.getElementById(`p-avatar-${i}`).value,
      color: COLOR_OPTIONS[i],
      position: 0,
      score: 0
    });
  }

  const selectedCards = document.querySelectorAll('.minigame-card.selected');
  selectedMinigameIds = Array.from(selectedCards).map(card => card.dataset.gameId);

  if (selectedMinigameIds.length === 0) {
    alert('Vyber prosím alespoň jednu minihru!');
    return;
  }

  document.getElementById('setup-screen').classList.remove('active');
  document.getElementById('game-screen').classList.add('active');

  renderBoard();
  renderTokens();
  updateTurnUI();
}

// RENDER DESKY A FIGUREK
function renderBoard() {
  const board = document.getElementById('board');
  board.innerHTML = '';
  for (let i = 0; i < TOTAL_TILES; i++) {
    const tile = document.createElement('div');
    tile.className = 'tile';
    tile.id = `tile-${i}`;
    tile.innerText = i === 0 ? 'START' : i;
    board.appendChild(tile);
  }
}

function renderTokens() {
  document.querySelectorAll('.token').forEach(t => t.remove());

  players.forEach((player) => {
    const tile = document.getElementById(`tile-${player.position}`);
    if (!tile) return;
    const token = document.createElement('div');
    token.className = 'token';
    token.id = `token-${player.id}`;
    token.style.backgroundColor = player.color;
    token.innerText = player.avatar;
    token.style.fontSize = '14px';

    const offset = player.id * 6;
    token.style.transform = `translate(${offset}px, ${offset}px)`;

    tile.appendChild(token);
  });
}

// POHYB A LOGIKA KOSTKY
function rollDice() {
  const btn = document.getElementById('dice-btn');
  btn.disabled = true;

  const roll = Math.floor(Math.random() * 6) + 1;
  document.getElementById('dice-result').innerText = `Hodil jsi: ${roll}`;

  movePlayer(players[currentPlayerIndex], roll);
}

function movePlayer(player, steps) {
  let targetPosition = player.position + steps;
  if (targetPosition >= TOTAL_TILES) targetPosition = TOTAL_TILES - 1;

  let currentStep = player.position;
  const interval = setInterval(() => {
    if (currentStep < targetPosition) {
      currentStep++;
      player.position = currentStep;
      renderTokens();
    } else {
      clearInterval(interval);
      document.getElementById('dice-btn').disabled = false;
      triggerTileAction();
    }
  }, 300);
}

function triggerTileAction() {
  const availableMinigames = MINIGAMES.filter(g => selectedMinigameIds.includes(g.id));

  if (availableMinigames.length === 0) {
    nextTurn();
    return;
  }

  const selectedGame = availableMinigames[Math.floor(Math.random() * availableMinigames.length)];
  
  const modal = document.getElementById('minigame-modal');
  document.getElementById('minigame-title').innerText = selectedGame.title;
  document.getElementById('minigame-desc').innerText = selectedGame.description;
  
  const container = document.getElementById('minigame-container');
  container.innerHTML = '';

  modal.classList.remove('hidden');

  selectedGame.start(container, (success) => {
    modal.classList.add('hidden');
    if (success) {
      players[currentPlayerIndex].score += 10;
    }
    nextTurn();
  });
}

function nextTurn() {
  currentPlayerIndex = (currentPlayerIndex + 1) % players.length;
  updateTurnUI();
}

function updateTurnUI() {
  const current = players[currentPlayerIndex];
  document.getElementById('turn-player-name').innerText = `${current.avatar} ${current.name}`;
  document.getElementById('turn-player-name').style.color = current.color;
}

window.onload = function() {
  updatePlayerSetup();
};
