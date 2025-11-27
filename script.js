// Game State
let players = [];
let gameActive = false;

// DOM Elements
const setupSection = document.getElementById('setupSection');
const gameSection = document.getElementById('gameSection');
const playersGrid = document.getElementById('playersGrid');


// Buttons
const startGameBtn = document.getElementById('startGameBtn');
const resetPointsBtn = document.getElementById('resetPointsBtn');
const newGameBtn = document.getElementById('newGameBtn');

// Player Name Inputs
const player1NameInput = document.getElementById('player1Name');
const player2NameInput = document.getElementById('player2Name');
const player3NameInput = document.getElementById('player3Name');
const player4NameInput = document.getElementById('player4Name');

// Prevent pull-to-refresh on mobile (only when at top and pulling down)
let touchStartY = 0;

document.body.addEventListener('touchstart', (e) => {
    touchStartY = e.touches[0].clientY;
}, { passive: true });

document.body.addEventListener('touchmove', (e) => {
    const touchY = e.touches[0].clientY;
    const touchDelta = touchY - touchStartY;
    
    // Only prevent if we're at the top of the page AND pulling down
    if (window.scrollY === 0 && touchDelta > 0) {
        e.preventDefault();
    }
}, { passive: false });

// Prevent form submission on enter key
document.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && e.target.tagName === 'INPUT') {
        e.preventDefault();
    }
});

// Event Listeners
startGameBtn.addEventListener('click', startGame);
resetPointsBtn.addEventListener('click', resetPoints);
newGameBtn.addEventListener('click', newGame);

// Start Game Function
function startGame() {
    const playerNames = [
        player1NameInput.value.trim(),
        player2NameInput.value.trim(),
        player3NameInput.value.trim(),
        player4NameInput.value.trim()
    ].filter(name => name !== '');

    // Validate at least 2 players
    if (playerNames.length < 2) {
        alert('Please enter at least 2 player names!');
        return;
    }

    // Initialize players
    players = playerNames.map((name, index) => ({
        id: index,
        name: name,
        score: 0,
        currentInput: 0,
        history: [] // Track history of added points
    }));

    gameActive = true;
    renderGameSection();
    
    // Switch sections
    setupSection.classList.add('hidden');
    gameSection.classList.remove('hidden');
}

// Render Game Section
function renderGameSection() {
    playersGrid.innerHTML = '';
    
    players.forEach((player, index) => {
        const playerCard = document.createElement('div');
        playerCard.className = 'player-card';
        playerCard.style.animationDelay = `${index * 0.1}s`;
        
        playerCard.innerHTML = `
            <div class="player-name">
                <span>${player.name}</span>
            </div>
            <div class="player-score" id="score-${player.id}">
                ${player.score}
            </div>
            <div class="player-input-group">
                <label for="input-${player.id}">Add Points</label>
                <div class="input-with-button">
                    <button class="btn-undo-player" data-player-id="${player.id}" title="Undo last entry" ${player.history && player.history.length === 0 ? 'disabled' : ''}>
                        ⎌
                    </button>
                    <input 
                        type="number" 
                        id="input-${player.id}" 
                        placeholder="0" 
                        value="${player.currentInput || ''}"
                        inputmode="numeric"
                        pattern="[0-9]*"
                    >
                    <button class="btn-submit-player" data-player-id="${player.id}">+</button>
                </div>
            </div>
        `;
        
        playersGrid.appendChild(playerCard);
        
        // Add event listener to update currentInput
        const input = document.getElementById(`input-${player.id}`);
        input.addEventListener('input', (e) => {
            player.currentInput = parseInt(e.target.value) || 0;
        });
        
        // Add event listener to individual submit button
        const submitBtn = playerCard.querySelector('.btn-submit-player');
        submitBtn.addEventListener('click', () => submitPlayerPoints(player.id));

        // Add event listener to undo button
        const undoBtn = playerCard.querySelector('.btn-undo-player');
        undoBtn.addEventListener('click', () => undoLastPoints(player.id));
    });
}

// Submit Points for Individual Player
function submitPlayerPoints(playerId) {
    const player = players.find(p => p.id === playerId);
    if (!player) return;
    
    const input = document.getElementById(`input-${player.id}`);
    const points = parseInt(input.value) || 0;
    
    if (points !== 0) {
        player.score += points;
        player.history.push(points);
        
        // Enable undo button
        const undoBtn = document.querySelector(`.btn-undo-player[data-player-id="${player.id}"]`);
        if (undoBtn) undoBtn.disabled = false;
        
        // Animate score update
        const scoreElement = document.getElementById(`score-${player.id}`);
        scoreElement.style.transform = 'scale(1.2)';
        scoreElement.style.color = 'var(--color-primary)';
        
        setTimeout(() => {
            scoreElement.style.transform = 'scale(1)';
            scoreElement.style.color = 'var(--text-primary)';
        }, 300);
        
        // Update score display
        scoreElement.textContent = player.score;
        
        // Clear input
        input.value = '';
        player.currentInput = 0;
    }
}

// Undo Last Points
function undoLastPoints(playerId) {
    const player = players.find(p => p.id === playerId);
    if (!player || !player.history || player.history.length === 0) return;

    const lastPoints = player.history.pop();
    player.score -= lastPoints;

    // Animate score update (maybe different color for undo?)
    const scoreElement = document.getElementById(`score-${player.id}`);
    scoreElement.style.transform = 'scale(0.9)';
    scoreElement.style.color = 'var(--color-danger)'; // Use danger color for undo

    setTimeout(() => {
        scoreElement.style.transform = 'scale(1)';
        scoreElement.style.color = 'var(--text-primary)';
    }, 300);

    // Update score display
    scoreElement.textContent = player.score;
    
    // Update undo button state
    const undoBtn = document.querySelector(`.btn-undo-player[data-player-id="${player.id}"]`);
    if (undoBtn) {
        if (player.history.length === 0) {
            undoBtn.disabled = true;
        }
    }
}


// Reset Points Function
function resetPoints() {
    const confirmed = confirm('Are you sure you want to reset all points?');
    
    if (confirmed) {
        players.forEach(player => {
            player.score = 0;
            player.currentInput = 0;
            player.history = [];
            
            const scoreElement = document.getElementById(`score-${player.id}`);
            const inputElement = document.getElementById(`input-${player.id}`);
            
            if (scoreElement) scoreElement.textContent = '0';
            if (inputElement) inputElement.value = '';
        });
        

    }
}

// New Game Function
function newGame() {
    const confirmed = confirm('Start a new game? This will reset everything.');
    
    if (confirmed) {
        // Reset state
        players = [];
        gameActive = false;
        
        // Clear inputs
        player1NameInput.value = '';
        player2NameInput.value = '';
        player3NameInput.value = '';
        player4NameInput.value = '';
        
        // Switch sections
        gameSection.classList.add('hidden');
        setupSection.classList.remove('hidden');
    }
}

// Prevent accidental page refresh
window.addEventListener('beforeunload', (e) => {
    if (gameActive && players.some(p => p.score !== 0)) {
        e.preventDefault();
        e.returnValue = '';
        return '';
    }
});

// Handle visibility change (when user switches tabs)
document.addEventListener('visibilitychange', () => {
    if (!document.hidden && gameActive) {
        // Refresh display when user returns to tab
        renderGameSection();
    }
});
