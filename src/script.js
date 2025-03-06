document.addEventListener('DOMContentLoaded', () => {
    const roulette = document.getElementById('roulette');
    const spinButton = document.getElementById('spinButton');
    const restartButton = document.getElementById('restartButton');
    const shooter = document.getElementById('shooter');
    const spinSound = document.getElementById('spinSound');
    const gunSound = document.getElementById('gunSound');
    const selectedPlayer = document.getElementById('selectedPlayer');
    const playerInfo = selectedPlayer.querySelector('.player-info');
    const fatalityContainer = document.getElementById('fatalityContainer');
    const bloodSplatter = document.getElementById('bloodSplatter');

    let isSpinning = false;
    let currentRotation = 0;
    let hasSpunOnce = false;

    // Initialize the roulette with player slots
    function initializeRoulette() {
        // Clear existing slots
        roulette.innerHTML = '';
        
        const angleStep = 360 / players.length;
        players.forEach((player, index) => {
            const slot = document.createElement('div');
            slot.className = 'player-slot';
            slot.innerHTML = `
                <img src="${player.image}" alt="${player.name}">
                <div class="eliminate-button" data-player-id="${player.id}">X</div>
            `;
            slot.style.transform = `rotate(${angleStep * index}deg)`;
            slot.dataset.playerId = player.id;
            roulette.appendChild(slot);

            // Add event listener to the eliminate button
            const eliminateBtn = slot.querySelector('.eliminate-button');
            eliminateBtn.addEventListener('click', (e) => {
                e.stopPropagation(); // Prevent event bubbling
                manuallyEliminatePlayer(player.id);
            });
        });
    }

    // Manually eliminate a player
    function manuallyEliminatePlayer(playerId) {
        if (isSpinning) return;

        const playerIndex = players.findIndex(p => p.id === playerId);
        const player = players[playerIndex];
        if (player && !player.eliminated) {
            // Mark player as eliminated instead of removing from array
            player.eliminated = true;
            
            // Find and update the player slot
            const selectedSlot = document.querySelector(`.player-slot[data-player-id="${playerId}"]`);
            if (selectedSlot) {
                selectedSlot.classList.add('dead');

                // Show blood splatter effect
                bloodSplatter.classList.add('show');
                
                // Play gunshot sound
                gunSound.currentTime = 0;
                gunSound.play();
                
                // Add shooter animation
                shooter.classList.add('shoot');
                
                // Remove blood splatter and shooter animation after animation
                setTimeout(() => {
                    bloodSplatter.classList.remove('show');
                    shooter.classList.remove('shoot');
                    selectedSlot.classList.add('eliminated');
                    updatePlayerSlots();
                }, 2000);

                // Check if all players are eliminated
                const remainingPlayers = players.filter(p => !p.eliminated);
                if (remainingPlayers.length === 0) {
                    setTimeout(() => {
                        showFatalityAnimation();
                        spinButton.disabled = true;
                    }, 2500);
                }
            }
        }
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

    // Restart the game
    function restartGame() {
        // Reset all players to non-eliminated state
        players.forEach(player => {
            player.eliminated = false;
        });

        // Hide selected player display
        selectedPlayer.classList.remove('show');

        // Reset rotation
        currentRotation = 0;
        roulette.style.transform = `rotate(${currentRotation}deg)`;

        // Re-initialize the roulette
        initializeRoulette();

        // Enable spin button
        spinButton.disabled = false;
        isSpinning = false;
        hasSpunOnce = false;
    }

    // Show Fatality animation
    function showFatalityAnimation() {
        const remainingPlayers = players.filter(player => !player.eliminated);
        fatalityContainer.classList.add('show');
        // Hide fatality animation after 3 seconds
        setTimeout(() => {
            fatalityContainer.classList.remove('show');
        }, 3000);
    }
    // Spin the roulette
    function spinRoulette() {
        if (isSpinning) return;
        performSpin();
    }
    
    // Perform the actual spin animation
    function performSpin() {
        if (isSpinning) return;

        const remainingPlayers = players.filter(player => !player.eliminated);
        // Show fatality animation for every eliminated player
        if (remainingPlayers.length === 0) {
            showFatalityAnimation();
            spinButton.disabled = true;
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

            // Calculate selected player from remaining players only
            const normalizedRotation = currentRotation % 360;
            
            // Map the rotation to an index in the remaining players array
            const remainingPlayerIndex = Math.floor(Math.random() * remainingPlayers.length);
            const selectedPlayer = remainingPlayers[remainingPlayerIndex];

            // Mark the selected player as eliminated
            selectedPlayer.eliminated = true;
            
            const selectedSlot = document.querySelector(`[data-player-id="${selectedPlayer.id}"]`);
            selectedSlot.classList.add('dead');

            // Show blood splatter effect
            bloodSplatter.classList.add('show');
            
            // Display selected player
            displaySelectedPlayer(selectedPlayer);
            
            // Remove blood splatter after animation
            setTimeout(() => {
                bloodSplatter.classList.remove('show');
            }, 2000);

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
    restartButton.addEventListener('click', restartGame);
});