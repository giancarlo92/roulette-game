document.addEventListener('DOMContentLoaded', () => {
    const roulette = document.getElementById('roulette');
    const spinButton = document.getElementById('spinButton');
    const shooter = document.getElementById('shooter');
    const spinSound = document.getElementById('spinSound');
    const gunSound = document.getElementById('gunSound');
    const selectedPlayer = document.getElementById('selectedPlayer');
    const playerInfo = selectedPlayer.querySelector('.player-info');

    let isSpinning = false;
    let currentRotation = 0;

    // Initialize the roulette with player slots
    function initializeRoulette() {
        const angleStep = 360 / players.length;
        players.forEach((player, index) => {
            const slot = document.createElement('div');
            slot.className = 'player-slot';
            slot.innerHTML = `<img src="${player.image}" alt="${player.name}">`;
            slot.style.transform = `rotate(${angleStep * index}deg)`;
            slot.dataset.playerId = player.id;
            roulette.appendChild(slot);
        });
    }

    // Update player slots visual state
    function updatePlayerSlots() {
        const slots = document.querySelectorAll('.player-slot');
        slots.forEach(slot => {
            const playerId = parseInt(slot.dataset.playerId);
            const player = players.find(p => p.id === playerId);
            if (player.eliminated) {
                slot.classList.add('eliminated');
            }
        });
    }

    // Display selected player
    function displaySelectedPlayer(player) {
        playerInfo.innerHTML = `
            <img src="${player.image}" alt="${player.name}">
            <h3>${player.name}</h3>
        `;
        selectedPlayer.classList.add('show');
    }

    // Spin the roulette
    function spinRoulette() {
        if (isSpinning) return;

        const remainingPlayers = players.filter(player => !player.eliminated);
        if (remainingPlayers.length < 2) {
            alert('Game Over! Not enough players to continue.');
            return;
        }

        isSpinning = true;
        spinButton.disabled = true;
        spinSound.currentTime = 0;
        spinSound.play();

        // Calculate random rotation (3-5 full spins + random angle)
        const minSpins = 3;
        const maxSpins = 5;
        const randomSpins = Math.random() * (maxSpins - minSpins) + minSpins;
        const randomAngle = Math.random() * 360;
        const totalRotation = (360 * randomSpins) + randomAngle;

        // Update rotation
        currentRotation += totalRotation;
        roulette.style.transform = `rotate(${currentRotation}deg)`;

        // After spinning animation
        setTimeout(() => {
            spinSound.pause();
            shooter.classList.add('shoot');
            gunSound.currentTime = 0;
            gunSound.play();

            // Calculate selected player
            const angleStep = 360 / players.length;
            const normalizedRotation = currentRotation % 360;
            const selectedIndex = Math.floor((360 - (normalizedRotation % 360)) / angleStep);
            const selectedPlayer = players[selectedIndex % players.length];

            // Mark player as eliminated
            selectedPlayer.eliminated = true;
            const selectedSlot = document.querySelector(`[data-player-id="${selectedPlayer.id}"]`);
            selectedSlot.classList.add('dead');

            // Display selected player
            displaySelectedPlayer(selectedPlayer);

            // Reset state
            setTimeout(() => {
                shooter.classList.remove('shoot');
                updatePlayerSlots();
                isSpinning = false;
                spinButton.disabled = false;
            }, 1000);
        }, 4000);
    }

    // Initialize the game
    initializeRoulette();
    spinButton.addEventListener('click', spinRoulette);
});