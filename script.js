// GLOBÁLNÍ STAV UŽIVATELE A HRY
let userProfile = {
  name: 'User',
  avatar: '🕶️'
};

let gemBalance = 680;
let dailyBonusClaimed = false;

let players = [];
let currentPlayerIndex = 0;
const TOTAL_TILES = 100;

const AVATARS = ['🕶️', '🐱', '🤖', '🥷', '👽', '🧙‍♂️', '🐉', '🦊', '👑', '👾', '🚀', '🔮'];
const COLORS = ['#e94560', '#00fff5', '#ffbd39', '#9d0191'];

let selectedAvatarInModal = userProfile.avatar;

// CRAZYGAMES SDK INICIALIZACE
let crazySDK = null;

window.addEventListener('DOMContentLoaded', async () => {
  updateNavbarUI();
  buildAvatarSelector();

  // Inicializace CrazyGames SDK v3
  if (window.CrazyGames && window.CrazyGames.SDK) {
    try {
      crazySDK = window.CrazyGames.SDK;
      await crazySDK.init();
      console.log("CrazyGames SDK úspěšně inicializováno.");
    } catch (e) {
      console.error("Chyba při inicializaci CrazyGames SDK:", e);
    }
  }
});

// FUNKCE PRO ZOBRAZENÍ MEZIHERNÍ REKLAMY (MIDROLL)
function showMidrollAd(onComplete) {
  if (crazySDK && crazySDK.ad) {
    crazySDK.ad.requestAd("midroll", {
      adStarted: () => { console.log("Spuštěna meziherní reklama..."); },
      adFinished: () => { if (onComplete) onComplete(); },
      adError: (error) => {
        console.log("Reklama se nezobrazila / byla blokována:", error);
        if (onComplete) onComplete();
      }
    });
  } else {
    // Pokud běžím lokálně bez SDK, pokračuje se ihned
    if (onComplete) onComplete();
  }
}

// FUNKCE PRO ZOBRAZENÍ ODMĚNOVÉ REKLAMY (REWARDED) - KRYSTALY ZDARMA
function watchAdForGems(gemReward) {
  if (crazySDK && crazySDK.ad) {
    crazySDK.ad.requestAd("rewarded", {
      adStarted: () => { console.log("Odměnová reklama zahájena..."); },
      adFinished: () => {
        addGems(gemReward);
        alert(`🎉 Děkujeme za zhlédnutí! Získal jsi +${gemReward} 💎`);
      },
      adError: (error) => {
        alert("Reklamu se nepodařilo načíst. Zkus to prosím později.");
      }
    });
  } else {
    // Lokální testovací fallback
    addGems(gemReward);
    alert(`[TEST REKLAMY] Získal jsi +${gemReward} 💎`);
  }
}

// AKTUALIZACE HORNÍ LIŠTY
function updateNavbarUI() {
  document.getElementById('gem-count').innerText = gemBalance;
  document.getElementById('nav-user-name').innerText = userProfile.name;
  document.getElementById('nav-user-avatar').innerText = userProfile.avatar;
}

// NÁVRAT NA HLAVNÍ STRÁNKU
function goHome() {
  closeModals();
}

// OTEVŘENÍ A ZAVŘENÍ MODÁLNÍCH OKEN
function closeModals() {
  document.querySelectorAll('.modal').forEach(m => m.classList.add('hidden'));
}

function openUserProfile() {
  closeModals();
  selectedAvatarInModal = userProfile.avatar;
  document.getElementById('profile-name-input').value = userProfile.name;
  highlightSelectedAvatar();
  document.getElementById('profile-modal').classList.remove('hidden');
}

function openGemsShop() {
  closeModals();
  document.getElementById('modal-gem-count').innerText = gemBalance;
  document.getElementById('gems-modal').classList.remove('hidden');
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

// NASTAVENÍ A ULOŽENÍ PROFILU HRÁČE
function buildAvatarSelector() {
  const container = document.getElementById('avatar-selector');
  if (!container) return;
  container.innerHTML = '';

  AVATARS.forEach(emoji => {
    const div = document.createElement('div');
    div.className = 'avatar-option';
    div.innerText = emoji;
    div.onclick = () => {
      selectedAvatarInModal = emoji;
      highlightSelectedAvatar();
    };
    container.appendChild(div);
  });
}

function highlightSelectedAvatar() {
  const options = document.querySelectorAll('.avatar-option');
  options.forEach(opt => {
    if (opt.innerText === selectedAvatarInModal) {
      opt.classList.add('selected');
    } else {
      opt.classList.remove('selected');
    }
  });
}

function saveUserProfile() {
  const nameInput = document.getElementById('profile-name-input').value.trim();
  if (nameInput.length > 0) {
    userProfile.name = nameInput;
  }
  userProfile.avatar = selectedAvatarInModal;
  
  updateNavbarUI();
  closeModals();
}

// SPRÁVA KRYSTALŮ A DENNÍ BONUS
function addGems(amount) {
  gemBalance += amount;
  updateNavbarUI();
  const modalCount = document.getElementById('modal-gem-count');
  if (modalCount) modalCount.innerText = gemBalance;
}

function claimDailyBonus() {
  if (dailyBonusClaimed) {
    alert('Dnešní bonus už jsi si vyzvedl!');
    return;
  }
  addGems(100);
  dailyBonusClaimed = true;
  const btn = document.getElementById('daily-bonus-btn');
  btn.innerText = 'Vybráno';
  btn.classList.replace('btn-launch', 'btn-disabled');
  btn.disabled = true;
  alert('🎉 Získal jsi +100 krystalů!');
}

// PROFILY HRÁČŮ PRO DESKOVOU HRU
function updatePlayerSetup() {
  const count = parseInt(document.getElementById('player-count').value);
  const container = document.getElementById('players-config-container');
  container.innerHTML = '';

  for (let i = 0; i < count; i++) {
    const defaultName = i === 0 ? userProfile.name : `Hráč ${i + 1}`;
    const defaultAvatar = i === 0 ? userProfile.avatar : AVATARS[i + 1];
    const avatarOpts = AVATARS.map(a => `<option value="${a}" ${a === defaultAvatar ? 'selected' : ''}>${a}</option>`).join('');
    
    container.innerHTML += `
      <div style="display:flex; gap:10px; align-items:center; margin-bottom:8px;">
        <label style="font-family:var(--arcade-font-heading); font-size:9px;">Hráč ${i + 1}:</label>
        <input type="text" id="p-name-${i}" value="${defaultName}" style="flex-grow:1;">
        <select id="p-avatar-${i}">${avatarOpts}</select>
      </div>
    `;
  }
}

// DESKOVÁ HRA (100 POLÍČEK) S REKLAMOU
function startBoardGame() {
  // Spustí meziherní reklamu před startem deskové hry
  showMidrollAd(() => {
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
  });
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
    alert(`🎉 Hráč ${player.name} vyhrál hru! Získává +150 💎`);
    addGems(150);
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

// MINIHRA CRYSTAL REFLEX
function runReflexRound() {
  const area = document.getElementById('reflex-game-area');
  area.innerHTML = '<span style="color:#aaa; font-family:var(--arcade-font-heading); font-size:10px;">Příprava... Sleduj plochu!</span>';

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
      const earned = Math.max(10, Math.floor(10000 / reactionTime));
      addGems(earned);
      alert(`Skvělý reflex! Čas: ${reactionTime} ms. Získal jsi +${earned} krystalů!`);
      area.innerHTML = '<button id="start-reflex-btn" class="btn-launch" onclick="runReflexRound()">Hrát Znova</button>';
    };

    area.appendChild(crystal);
  }, delay);
}
