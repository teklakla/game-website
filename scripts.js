const burger = document.getElementById('burger');
const navLinks = document.getElementById('navLinks');
burger.addEventListener('click', () => {
  navLinks.classList.toggle('active');
});

document.getElementById('scrollTop').addEventListener('click', () => {
  window.scrollTo({ top: 0, behavior: 'smooth' });
});

const cookieBanner = document.getElementById('cookieBanner');
const acceptCookies = document.getElementById('acceptCookies');
if (!localStorage.getItem('cookiesAccepted')) {
  cookieBanner.style.display = 'flex';
}
acceptCookies.addEventListener('click', () => {
  localStorage.setItem('cookiesAccepted', 'true');
  cookieBanner.style.display = 'none';
});

// ========== GAME FETCHING WITH SEARCH, FILTER, PAGINATION ==========
const apiKey = 'b269bd1af3e04e46bcef5dc171f80025';
const gamesContainer = document.getElementById('gamesContainer');
const pagination = document.createElement('div');
pagination.className = 'pagination';
gamesContainer.after(pagination);

const searchInput = document.createElement('input');
searchInput.placeholder = 'შეიყვანე თამაშის სახელი...';
searchInput.className = 'search-input';

const genreSelect = document.createElement('select');
genreSelect.innerHTML = `<option value="">ყველა ჟანრი</option>`;
genreSelect.className = 'genre-select';

const controlsDiv = document.createElement('div');
controlsDiv.className = 'controls';
controlsDiv.appendChild(searchInput);
controlsDiv.appendChild(genreSelect);
gamesContainer.before(controlsDiv);

let currentPage = 1;
let currentSearch = '';
let currentGenre = '';

async function fetchGenres() {
  const res = await fetch(`https://api.rawg.io/api/genres?key=${apiKey}`);
  const data = await res.json();
  data.results.forEach(genre => {
    const opt = document.createElement('option');
    opt.value = genre.slug;
    opt.textContent = genre.name;
    genreSelect.appendChild(opt);
  });
}
fetchGenres();

async function fetchGames(page = 1) {
  let url = `https://api.rawg.io/api/games?key=${apiKey}&page_size=9&page=${page}`;
  if (currentSearch) url += `&search=${currentSearch}`;
  if (currentGenre) url += `&genres=${currentGenre}`;

  const res = await fetch(url);
  const data = await res.json();
  displayGames(data.results);
  displayPagination(data.count);
}

function getFavoriteIds() {
  return JSON.parse(localStorage.getItem('favoriteGames') || '[]');
}

function saveFavoriteIds(ids) {
  localStorage.setItem('favoriteGames', JSON.stringify(ids));
}

function toggleFavorite(id) {
  const favorites = getFavoriteIds();
  const index = favorites.indexOf(id);
  if (index > -1) {
    favorites.splice(index, 1);
  } else {
    favorites.push(id);
  }
  saveFavoriteIds(favorites);
  fetchGames();        // refresh game cards
  loadFavoriteGames(); // refresh favorites section
}

function displayGames(games) {
  gamesContainer.innerHTML = '';
  games.forEach(game => {
    const card = document.createElement('div');
    card.className = 'game-card';

    const isFavorite = getFavoriteIds().includes(game.id);

    card.innerHTML = `
      <img src="${game.background_image}" alt="${game.name}" />
      <div class="game-card-content">
        <h3>${game.name}</h3>
        <p>რეიტინგი: ${game.rating}</p>
        <button class="favorite-btn" data-id="${game.id}">
          ${isFavorite ? '❤️ ფავორიტი' : '🤍 დამატება'}
        </button>
      </div>
    `;

    card.querySelector('.favorite-btn').addEventListener('click', (e) => {
      e.stopPropagation();
      toggleFavorite(game.id);
    });

    card.addEventListener('click', () => openModal(game.id));
    gamesContainer.appendChild(card);
  });
}


function displayPagination(total) {
  pagination.innerHTML = '';
  const totalPages = Math.ceil(total / 9);

  for (let i = 1; i <= totalPages && i <= 10; i++) {
    const btn = document.createElement('button');
    btn.textContent = i;
    if (i === currentPage) btn.classList.add('active');
    btn.addEventListener('click', () => {
      currentPage = i;
      fetchGames(currentPage);
    });
    pagination.appendChild(btn);
  }
}

searchInput.addEventListener('input', (e) => {
  currentSearch = e.target.value;
  currentPage = 1;
  fetchGames();
});

genreSelect.addEventListener('change', (e) => {
  currentGenre = e.target.value;
  currentPage = 1;
  fetchGames();
});

fetchGames();

// ========== MODAL ==========
const modal = document.createElement('div');
modal.className = 'modal';
modal.innerHTML = `
  <div class="modal-content">
    <button class="modal-close">&times;</button>
    <img id="modalImage" />
    <h2 id="modalTitle"></h2>
    <div class="modal-info">
      <div><h4>გამოშვების თარიღი</h4><p id="modalRelease"></p></div>
      <div><h4>ჟანრები</h4><p id="modalGenres"></p></div>
      <div><h4>პლატფორმები</h4><p id="modalPlatforms"></p></div>
    </div>
    <div class="modal-description">
      <h4>აღწერა</h4>
      <p id="modalDescription"></p>
    </div>
  </div>
`;
document.body.appendChild(modal);
const closeModal = () => modal.style.display = 'none';
modal.querySelector('.modal-close').addEventListener('click', closeModal);
modal.addEventListener('click', (e) => { if (e.target === modal) closeModal(); });

async function openModal(gameId) {
  const res = await fetch(`https://api.rawg.io/api/games/${gameId}?key=${apiKey}`);
  const game = await res.json();

  document.getElementById('modalImage').src = game.background_image;
  document.getElementById('modalTitle').textContent = game.name;
  document.getElementById('modalRelease').textContent = game.released;
  document.getElementById('modalGenres').textContent = game.genres.map(g => g.name).join(', ');
  document.getElementById('modalPlatforms').textContent = game.platforms.map(p => p.platform.name).join(', ');
  document.getElementById('modalDescription').innerHTML = game.description || 'აღწერა მიუწვდომელია';

  modal.style.display = 'block';
}

async function openModal(gameId) {
  const res = await fetch(`https://api.rawg.io/api/games/${gameId}?key=${apiKey}`);
  const game = await res.json();

  document.getElementById('modalImage').src = game.background_image;
  document.getElementById('modalTitle').textContent = game.name;
  document.getElementById('modalRelease').textContent = game.released;
  document.getElementById('modalGenres').textContent = game.genres.map(g => g.name).join(', ');
  document.getElementById('modalPlatforms').textContent = game.platforms.map(p => p.platform.name).join(', ');
  document.getElementById('modalDescription').innerHTML = game.description || 'აღწერა მიუწვდომელია';

  modal.style.display = 'block';
}

// ========== FAVORITES SECTION ==========
async function loadFavoriteGames() {
  const favoritesContainer = document.getElementById('favoritesContainer');
  const favoriteIds = getFavoriteIds();
  
  if (favoriteIds.length === 0) {
    favoritesContainer.innerHTML = '<p style="text-align: center; color: #a0a6b0; font-size: 1.1rem;">ფავორიტი თამაშები ჯერ არ დაგიმატებიათ</p>';
    return;
  }

  favoritesContainer.innerHTML = '';

  // Fetch each favorite game
  for (const gameId of favoriteIds) {
    try {
      const res = await fetch(`https://api.rawg.io/api/games/${gameId}?key=${apiKey}`);
      const game = await res.json();
      
      const card = document.createElement('div');
      card.className = 'game-card';
      
      card.innerHTML = `
        <img src="${game.background_image}" alt="${game.name}" />
        <div class="game-card-content">
          <h3>${game.name}</h3>
          <p>რეიტინგი: ${game.rating}</p>
          <button class="favorite-btn" data-id="${game.id}">
            ❤️ ფავორიტებიდან ამოშლა
          </button>
        </div>
      `;

      card.querySelector('.favorite-btn').addEventListener('click', (e) => {
        e.stopPropagation();
        toggleFavorite(game.id);
      });

      card.addEventListener('click', () => openModal(game.id));
      favoritesContainer.appendChild(card);
    } catch (error) {
      console.error('Error loading favorite game:', error);
    }
  }
}

// Load favorites when page loads
loadFavoriteGames();

// ========== CONTACT FORM ==========
const form = document.getElementById('contactForm');
const togglePasswordBtn = document.getElementById('togglePassword');
const passwordInput = document.getElementById('password');

let isPasswordShown = false;
togglePasswordBtn.addEventListener('click', () => {
  isPasswordShown = !isPasswordShown;
  passwordInput.type = isPasswordShown ? 'text' : 'password';
  togglePasswordBtn.textContent = isPasswordShown ? 'დამალვა' : 'პაროლის ჩვენება';
});

form.addEventListener('submit', (e) => {
  e.preventDefault();
  const name = document.getElementById('name').value.trim();
  const email = document.getElementById('email').value.trim();
  const message = document.getElementById('message').value.trim();
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!name || !email || !message || !passwordInput.value) {
    alert('ყველა ველი სავალდებულოა!');
    return;
  }

  if (!emailRegex.test(email)) {
    alert('გთხოვ შეიყვანე ვალიდური ელ. ფოსტა');
    return;
  }

  alert('შეტყობინება წარმატებით გაიგზავნა!');
  form.reset();
});
