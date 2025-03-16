document.addEventListener('DOMContentLoaded', function() {
    const repellentButton = document.getElementById('repellentButton');
    const pulse = document.getElementById('pulse');
    const status = document.getElementById('status');
    const mosquitoContainer = document.getElementById('mosquitoContainer');
    const settingsPanel = document.getElementById('settingsPanel');
    const frequencySlider = document.getElementById('frequencySlider');
    const frequencyValue = document.getElementById('frequencyValue');
    const powerSlider = document.getElementById('powerSlider');
    const powerValue = document.getElementById('powerValue');
    const aiAssistant = document.getElementById('aiAssistant');
    const aiChat = document.getElementById('aiChat');
    const mosquitoCount = document.getElementById('mosquitoCount');
    const totalMosquitos = document.getElementById('totalMosquitos');
    const timer = document.getElementById('timer');
    const gameOver = document.getElementById('gameOver');
    const gameResult = document.getElementById('gameResult');
    const restartButton = document.getElementById('restartButton');

    let isActive = false;
    let audioContext = null;
    let oscillator = null;
    let gainNode = null;
    let mosquitos = [];
    let killCount = 0;
    let totalCount = 0;
    let timeLeft = 0;
    let gameTimer = null;
    let gameInProgress = false;
    let animationFrame = null;

    totalMosquitos.textContent = totalCount;

    repellentButton.addEventListener('click', function() {
        if (!gameInProgress) {
            startGame();
        } else if (isActive) {
            stopRepellent();
        } else {
            startRepellent();
        }
    });

    repellentButton.addEventListener('dblclick', function() {
        settingsPanel.classList.toggle('visible');
    });

    frequencySlider.addEventListener('input', function() {
        frequencyValue.textContent = this.value;
        if (oscillator) {
            oscillator.frequency.value = this.value;
        }
    });

    powerSlider.addEventListener('input', function() {
        powerValue.textContent = this.value;
        if (gainNode) {
            gainNode.gain.value = this.value / 100;
        }
    });

    aiAssistant.addEventListener('click', function() {
        aiChat.classList.toggle('visible');
    });

    let aiMessages = [
        "Scanning for mosquitoes in your area...",
        "Tip: Tap directly on mosquitoes to eliminate them!",
        "Ultrasonic waves are active but mosquitoes need manual targeting.",
        "Stay vigilant! Some mosquitoes may be resistant to ultrasonic waves.",
        "For best results, aim carefully and tap quickly!",
        "Mosquito activity detected nearby. Stay alert!",
        "Remember to hydrate while mosquito hunting!",
        "Ultrasonic emissions at optimal frequency.",
        "Environmental conditions favorable for mosquito activity.",
        "Power levels steady. Continue manual elimination."
    ];

    restartButton.addEventListener('click', function() {
        gameOver.classList.remove('visible');
        resetGame();
    });

    function startGame() {
        const warningPopup = document.getElementById('warningPopup');
        const acknowledgeButton = document.getElementById('acknowledgeButton');
        const timeInput = document.getElementById('timeInput');
        
        warningPopup.classList.add('visible');
        
        acknowledgeButton.addEventListener('click', function() {
            warningPopup.classList.remove('visible');
            
            const userTimeMinutes = Math.min(Math.max(parseInt(timeInput.value) || 1, 1), 30);
            const userTimeSeconds = userTimeMinutes * 60;
            
            totalCount = Math.floor(Math.random() * 11) + 10;
            totalMosquitos.textContent = "∞";
            
            gameInProgress = true;
            killCount = 0;
            timeLeft = userTimeSeconds;
            mosquitoCount.textContent = killCount;
            timer.textContent = timeLeft;
            createMosquitos();
            startRepellent();
            
            let spawnInterval = setInterval(function() {
                if (gameInProgress && mosquitos.length < 30) {
                    createMosquito();
                    totalCount++;
                }
            }, 2000);
            
            gameTimer = setInterval(updateTimer, 1000);
            animationFrame = requestAnimationFrame(gameLoop);
        }, {once: true});
    }

    function endGame() {
        clearInterval(gameTimer);
        cancelAnimationFrame(animationFrame);
        gameInProgress = false;
        stopRepellent();
        
        for (let i = 1; i < 10000; i++) {
            window.clearInterval(i);
        }
        
        showExperimentalResults();
        gameOver.classList.add('visible');
    }

    function resetGame() {
        mosquitoContainer.innerHTML = '';
        mosquitos = [];
        killCount = 0;
        const defaultTimeSeconds = 30 * 60;
        timeLeft = defaultTimeSeconds;
        mosquitoCount.textContent = killCount;
        timer.textContent = timeLeft;
        status.textContent = 'Ready to zap mosquitos!';
    }

    function createMosquitos() {
        mosquitoContainer.innerHTML = '';
        mosquitos = [];
        
        for (let i = 0; i < totalCount; i++) {
            createMosquito();
        }
    }

    function createMosquito() {
        const mosquito = document.createElement('div');
        mosquito.className = 'mosquito';
        const mosquitoImg = document.createElement('img');
        mosquitoImg.src = 'mosquito.png';
        mosquitoImg.alt = 'Mosquito';
        mosquitoImg.style.width = '100%';
        mosquitoImg.style.height = '100%';
        mosquito.appendChild(mosquitoImg);
        
        const posX = Math.random() * (window.innerWidth - 50);
        const posY = Math.random() * (window.innerHeight - 50);
        
        mosquito.style.left = `${posX}px`;
        mosquito.style.top = `${posY}px`;
        
        const dirX = Math.random() * 2 - 1;
        const dirY = Math.random() * 2 - 1;
        
        mosquitoContainer.appendChild(mosquito);
        
        const mosquitoObj = {
            element: mosquito,
            posX: posX,
            posY: posY,
            dirX: dirX,
            dirY: dirY,
            speed: 0.5 + Math.random() * 1.5,
            isAlive: true
        };
        
        mosquitos.push(mosquitoObj);
        
        mosquito.addEventListener('click', function() {
            if (mosquitoObj.isAlive) {
                zapMosquito(mosquitoObj);
            }
        });
    }

    function moveMosquitos() {
        mosquitos.forEach(mosquito => {
            if (!mosquito.isAlive) return;
            
            mosquito.posX += mosquito.dirX * mosquito.speed;
            mosquito.posY += mosquito.dirY * mosquito.speed;
            
            if (mosquito.posX < 0 || mosquito.posX > window.innerWidth - 30) {
                mosquito.dirX *= -1;
            }
            
            if (mosquito.posY < 0 || mosquito.posY > window.innerHeight - 30) {
                mosquito.dirY *= -1;
            }
            
            mosquito.element.style.left = `${mosquito.posX}px`;
            mosquito.element.style.top = `${mosquito.posY}px`;
            
            if (Math.random() < 0.02) {
                mosquito.dirX += (Math.random() * 0.4) - 0.2;
                mosquito.dirY += (Math.random() * 0.4) - 0.2;
                
                const length = Math.sqrt(mosquito.dirX * mosquito.dirX + mosquito.dirY * mosquito.dirY);
                mosquito.dirX /= length;
                mosquito.dirY /= length;
            }
        });
    }
    
    function startRepellent() {
        isActive = true;
        repellentButton.style.display = 'none';
        
        const controlPanel = document.createElement('div');
        controlPanel.id = 'controlPanel';
        controlPanel.style.position = 'fixed';
        controlPanel.style.top = '20px';
        controlPanel.style.left = '50%';
        controlPanel.style.transform = 'translateX(-50%)';
        controlPanel.style.zIndex = '100';
        controlPanel.style.display = 'flex';
        controlPanel.style.gap = '10px';
        
        const pauseButton = document.createElement('button');
        pauseButton.textContent = 'PAUSE';
        pauseButton.className = 'restart-button';
        pauseButton.addEventListener('click', function() {
            if (this.textContent === 'PAUSE') {
                this.textContent = 'RESUME';
                gameInProgress = false;
                clearInterval(gameTimer);
            } else {
                this.textContent = 'PAUSE';
                gameInProgress = true;
                gameTimer = setInterval(updateTimer, 1000);
                animationFrame = requestAnimationFrame(gameLoop);
            }
        });
        
        const deactivateButton = document.createElement('button');
        deactivateButton.textContent = 'DEACTIVATE';
        deactivateButton.className = 'restart-button';
        deactivateButton.addEventListener('click', stopRepellent);
        
        controlPanel.appendChild(pauseButton);
        controlPanel.appendChild(deactivateButton);
        document.body.appendChild(controlPanel);
        
        status.textContent = 'Ultrasonic repellent active! Tap on mosquitoes to zap them.';
        aiChat.classList.add('visible');
        updateAIChat('Ultrasonic repellent activated! Tap on mosquitoes to eliminate them.');
        startAIChatUpdates();
        pulse.style.animation = 'pulse-animation 2s infinite';
        
        try {
            audioContext = new (window.AudioContext || window.webkitAudioContext)();
            oscillator = audioContext.createOscillator();
            gainNode = audioContext.createGain();
            
            oscillator.type = 'sine';
            oscillator.frequency.value = parseInt(frequencySlider.value);
            
            gainNode.gain.value = parseInt(powerSlider.value) / 100;
            
            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);
            
            oscillator.start();
        } catch (e) {
            console.error('Web Audio API not supported:', e);
        }
    }
    
    function stopRepellent() {
        isActive = false;
        repellentButton.style.display = 'block';
        
        const controlPanel = document.getElementById('controlPanel');
        if (controlPanel) {
            controlPanel.remove();
        }
        
        status.textContent = 'Ultrasonic repellent deactivated';
        updateAIChat('Ultrasonic repellent deactivated. Mosquitoes may return!');
        stopAIChatUpdates();
        pulse.style.animation = 'none';
        
        mosquitos.forEach(mosquito => {
            if (mosquito.isAlive) {
                mosquito.dirX *= -1;
                mosquito.dirY *= -1;
                mosquito.element.style.transform = 'scaleX(-1)';
            }
        });
        
        if (oscillator) {
            oscillator.stop();
            oscillator.disconnect();
            oscillator = null;
        }
        
        if (gainNode) {
            gainNode.disconnect();
            gainNode = null;
        }
        
        if (audioContext) {
            audioContext.close().then(() => {
                audioContext = null;
            });
        }
        
        const currentTime = timeLeft;
        let countDown = currentTime;
        clearInterval(gameTimer);
        
        gameTimer = setInterval(function() {
            countDown--;
            timer.textContent = countDown;
            
            if (countDown <= 0) {
                clearInterval(gameTimer);
                showExperimentalResults();
                gameOver.classList.add('visible');
            }
        }, 500);
    }

    let aiChatInterval;

    function updateAIChat(message) {
        const messageDiv = document.createElement('div');
        messageDiv.className = 'message';
        messageDiv.textContent = message;
        aiChat.appendChild(messageDiv);
        aiChat.scrollTop = aiChat.scrollHeight;
        
        while (aiChat.children.length > 5) {
            aiChat.removeChild(aiChat.children[0]);
        }
    }

    function startAIChatUpdates() {
        if (aiChatInterval) {
            clearInterval(aiChatInterval);
        }
        
        aiChatInterval = setInterval(function() {
            if (isActive && gameInProgress) {
                const randomMessage = aiMessages[Math.floor(Math.random() * aiMessages.length)];
                updateAIChat(randomMessage);
                
                if (Math.random() > 0.5) {
                    const progressMessage = `Progress: ${killCount} mosquitoes eliminated. ${timeLeft} seconds remaining.`;
                    updateAIChat(progressMessage);
                }
            }
        }, 8000 + Math.random() * 7000);
    }

    function stopAIChatUpdates() {
        if (aiChatInterval) {
            clearInterval(aiChatInterval);
            aiChatInterval = null;
        }
    }

    function updateTimer() {
        timeLeft--;
        timer.textContent = timeLeft;
        
        if (timeLeft <= 0) {
            clearInterval(gameTimer);
            endGame();
        }
    }
    
 function gameLoop() {
    if (gameInProgress) {
        moveMosquitos();
        if (isActive) {
            checkForZaps();
        }
        
        
        if (mosquitos.length === 0) {
            for (let i = 0; i < 3; i++) {  
                createMosquito();
                totalCount++;
            }
            totalMosquitos.textContent = "∞";  
        }
       
        else if (timeLeft > 60 && Math.random() < 0.002) {
            createMosquito();
            totalCount++;
        }
        
        animationFrame = requestAnimationFrame(gameLoop);
    }
}

    function checkForZaps() {
        const buttonRect = repellentButton.getBoundingClientRect();
        const buttonCenterX = buttonRect.left + buttonRect.width / 2;
        const buttonCenterY = buttonRect.top + buttonRect.height / 2;
        
        mosquitos.forEach(mosquito => {
            if (!mosquito.isAlive) return;
            
            const mosquitoCenterX = mosquito.posX + 15;
            const mosquitoCenterY = mosquito.posY + 15;
            
            const dx = mosquitoCenterX - buttonCenterX;
            const dy = mosquitoCenterY - buttonCenterY;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            const maxRange = 300 * (parseInt(powerSlider.value) / 50);
            const effectProbability = Math.max(0, 1 - (distance / maxRange)) * 0.1;
            
            if (Math.random() < effectProbability) {
                mosquito.element.style.animation = 'shake 0.5s';
                setTimeout(() => {
                    if (mosquito.isAlive) {
                        mosquito.element.style.animation = '';
                    }
                }, 500);
            }
        });
    }
    
    function zapMosquito(mosquito) {
        if (!mosquito.isAlive) return;
        
        mosquito.isAlive = false;
        killCount++;
        mosquitoCount.textContent = killCount;
        
        const missile = document.createElement('div');
        missile.innerHTML = '🚀';
        missile.style.position = 'absolute';
        missile.style.fontSize = '20px';
        missile.style.zIndex = '5';
        
        const buttonRect = repellentButton.getBoundingClientRect();
        missile.style.left = `${buttonRect.left + buttonRect.width/2}px`;
        missile.style.top = `${buttonRect.top + buttonRect.height/2}px`;
        document.body.appendChild(missile);
        
        const startX = buttonRect.left + buttonRect.width/2;
        const startY = buttonRect.top + buttonRect.height/2;
        const endX = mosquito.posX + 15;
        const endY = mosquito.posY + 15;
        
        let t = 0;
        const duration = 300;
        
        function animateMissile() {
            const progress = t / duration;
            const currentX = startX + (endX - startX) * progress;
            const currentY = startY + (endY - startY) * progress;
            
            missile.style.left = `${currentX}px`;
            missile.style.top = `${currentY}px`;
            
            if (t < duration) {
                t += 16;
                requestAnimationFrame(animateMissile);
            } else {
                missile.innerHTML = '𖦏';
                missile.style.fontSize = '30px';
                
                setTimeout(() => {
                    if (missile.parentNode) {
                        missile.parentNode.removeChild(missile);
                    }
                }, 300);
            }
        }
        
        requestAnimationFrame(animateMissile);
        
        const deathOverlay = document.createElement('div');
        deathOverlay.style.position = 'absolute';
        deathOverlay.style.top = '0';
        deathOverlay.style.left = '0';
        deathOverlay.style.width = '100%';
        deathOverlay.style.height = '100%';
        deathOverlay.style.backgroundColor = 'rgba(255, 0, 0, 0.5)';
        deathOverlay.style.zIndex = '2';
        mosquito.element.appendChild(deathOverlay);
        
        const fire = document.createElement('div');
        fire.innerHTML = '💥';
        fire.style.position = 'absolute';
        fire.style.top = '-10px';
        fire.style.left = '5px';
        fire.style.fontSize = '20px';
        fire.style.zIndex = '3';
        mosquito.element.appendChild(fire);
        
        mosquito.element.style.animation = 'die 0.5s forwards';
        
        setTimeout(() => {
            if (mosquito.element && mosquito.element.parentNode) {
                mosquito.element.parentNode.removeChild(mosquito.element);
            }
        }, 500);
    }
});

function showExperimentalResults() {
    const efficiency = Math.round((killCount / (30 - timeLeft)) * 100) / 100;
    
    gameResult.innerHTML = `
        <h3>Experimental Results:</h3>
        <p>Mosquitos zapped: ${killCount}</p>
        <p>Time elapsed: ${30 - timeLeft} seconds</p>
        <p>Efficiency: ${efficiency} mosquitos/second</p>
        <p>Frequency used: ${frequencySlider.value} Hz</p>
        <p>Power setting: ${powerSlider.value}%</p>
    `;
}
