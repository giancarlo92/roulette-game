document.addEventListener('DOMContentLoaded', () => {
    const roulette = document.getElementById('roulette');
    const spinButton = document.getElementById('spinButton');
    const restartButton = document.getElementById('restartButton');
    const shooter = document.getElementById('shooter');
    const spinSound = document.getElementById('spinSound');
    const gunSound = document.getElementById('gunSound');
    const restartSound = document.getElementById('restartSound');
    const selectedPlayer = document.getElementById('selectedPlayer');
    const playerInfo = selectedPlayer.querySelector('.player-info');
    const fatalityContainer = document.getElementById('fatalityContainer');
    const bloodSplatter = document.getElementById('bloodSplatter');

    let isSpinning = false;
    let currentRotation = 0;
    let gameStarted = false; // Track if the game has started
    let isProcessingElimination = false; // Flag to track if we're currently processing an elimination

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

    // Disable all eliminate buttons
    function disableAllEliminateButtons() {
        const eliminateBtns = document.querySelectorAll('.eliminate-button');
        eliminateBtns.forEach(btn => {
            btn.style.pointerEvents = 'none';
            btn.style.opacity = '0.5';
        });
    }

    // Enable all eliminate buttons
    function enableAllEliminateButtons() {
        const eliminateBtns = document.querySelectorAll('.eliminate-button');
        eliminateBtns.forEach(btn => {
            // Only enable buttons for non-eliminated players
            const playerId = parseInt(btn.dataset.playerId);
            const player = players.find(p => p.id === playerId);
            if (player && !player.eliminated) {
                btn.style.pointerEvents = 'auto';
                btn.style.opacity = ''; // Reset to default CSS value
                btn.style.display = ''; // Reset display property
            } else if (player && player.eliminated) {
                // Ensure eliminated players' buttons stay hidden
                btn.style.display = 'none';
            }
        });
    }

    // Manually eliminate a player
    function manuallyEliminatePlayer(playerId) {
        if (isSpinning || isProcessingElimination) return;

        const playerIndex = players.findIndex(p => p.id === playerId);
        const player = players[playerIndex];
        if (player && !player.eliminated) {
            // Set processing flag
            isProcessingElimination = true;
            
            // Disable all eliminate buttons during the process
            disableAllEliminateButtons();
            
            // Enable restart button after first manual elimination, just like after first spin
            if (!gameStarted) {
                gameStarted = true;
                restartButton.disabled = false;
            }
            
            // Mark player as eliminated instead of removing from array
            player.eliminated = true;
            
            // Find and update the player slot
            const selectedSlot = document.querySelector(`.player-slot[data-player-id="${playerId}"]`);
            if (selectedSlot) {
                // Hide the eliminate button immediately
                const eliminateBtn = selectedSlot.querySelector('.eliminate-button');
                if (eliminateBtn) {
                    eliminateBtn.style.display = 'none';
                }
                
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
                    
                    // Redistribute remaining players
                    redistributePlayers();
                    
                    // Re-enable eliminate buttons after redistribution animation completes
                    setTimeout(() => {
                        isProcessingElimination = false;
                        enableAllEliminateButtons();
                    }, 1200); // Slightly longer than the redistribution animation (1s)
                    
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

    // Redistribute players evenly around the wheel
    function redistributePlayers() {
        const remainingPlayers = players.filter(p => !p.eliminated);
        if (remainingPlayers.length <= 1) return; // No need to redistribute if 0 or 1 player left
        
        const angleStep = 360 / remainingPlayers.length;
        let currentIndex = 0;
        
        // Sort slots by player ID to ensure consistent ordering
        const slots = Array.from(document.querySelectorAll('.player-slot'));
        
        // Process non-eliminated players first
        slots.forEach(slot => {
            const playerId = parseInt(slot.dataset.playerId);
            const player = players.find(p => p.id === playerId);
            
            if (!player.eliminated) {
                // Add a transition for smooth animation
                slot.style.transition = 'transform 1s ease-in-out';
                // Set the new position with a small offset to prevent exact overlapping
                const newRotation = angleStep * currentIndex;
                slot.style.transform = `rotate(${newRotation}deg)`;
                
                // Reset the eliminate button's counter-rotation to ensure it stays upright
                const eliminateBtn = slot.querySelector('.eliminate-button');
                if (eliminateBtn) {
                    eliminateBtn.style.transition = 'transform 1s ease-in-out';
                    eliminateBtn.style.transform = `rotate(${-newRotation}deg)`;
                }
                
                // Ensure each player slot has proper z-index to prevent hover issues
                // Higher z-index for slots that appear later in the rotation
                slot.style.zIndex = 10 + currentIndex;
                
                currentIndex++;
            } else {
                // Move eliminated players to a lower z-index
                slot.style.zIndex = "5";
            }
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

    // Restart the game
    function restartGame() {
        // Play restart sound
        restartSound.currentTime = 0;
        restartSound.play();
        
        // Reset all players to non-eliminated state
        players.forEach(player => {
            player.eliminated = false;
        });

        // Hide selected player display
        selectedPlayer.classList.remove('show');

        // Reset rotation
        currentRotation = 0;
        roulette.style.transform = `rotate(${currentRotation}deg)`;

        // Reset shooter position
        shooter.classList.remove('exit');
        shooter.classList.remove('shoot');

        // Re-initialize the roulette
        initializeRoulette();

        // Enable spin button and disable restart button
        spinButton.disabled = false;
        restartButton.disabled = true;
        isSpinning = false;
        gameStarted = false;
    }

    // Show Fatality animation
    function showFatalityAnimation() {
        const remainingPlayers = players.filter(player => !player.eliminated);
        fatalityContainer.classList.add('show');
        // Hide selected player display when fatality is shown
        selectedPlayer.classList.remove('show');
        // Play fatality sound
        const fatalitySound = document.getElementById('fatalitySound');
        fatalitySound.currentTime = 0;
        fatalitySound.play();
        // Hide fatality animation after 3 seconds
        setTimeout(() => {
            fatalityContainer.classList.remove('show');
            // Call shooter exit animation after fatality animation completes
            shooterExitAnimation();
        }, 3000);
    }
    
    // Shooter exit animation
    function shooterExitAnimation() {
        // First rotate back to original position
        shooter.classList.remove('shoot');
        
        // Add exit animation class after a longer delay to simulate walking
        setTimeout(() => {
            // Add exit class to trigger the animation
            shooter.classList.add('exit');
        }, 1000); // Increased from 500ms to 1000ms for a more natural pause before walking away
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

        // Enable restart button after first spin
        if (!gameStarted) {
            gameStarted = true;
            restartButton.disabled = false;
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
            
            // Hide the eliminate button immediately
            const eliminateBtn = selectedSlot.querySelector('.eliminate-button');
            if (eliminateBtn) {
                eliminateBtn.style.display = 'none';
            }
            
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
                selectedSlot.classList.add('eliminated');
                updatePlayerSlots();
                
                // Redistribute remaining players
                redistributePlayers();
                
                // Re-enable eliminate buttons after redistribution
                setTimeout(() => {
                    isSpinning = false;
                    spinButton.disabled = false;
                    enableAllEliminateButtons();
                }, 1200); // Slightly longer than the redistribution animation (1s)
            }, 1000);
        }, 4000);
    }

    // Initialize the game
    initializeRoulette();
    // Disable restart button initially
    restartButton.disabled = true;
    spinButton.addEventListener('click', spinRoulette);
    restartButton.addEventListener('click', restartGame);
});