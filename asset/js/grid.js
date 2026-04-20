// ==========================================
// GRID.JS — JEU DE CARTES JUMEAUX
// Avec combos, vitesse et efficacité
// ==========================================

// ----------------------------
// Données
// ----------------------------
const symbols = [
    "🍎","🍐","🍊","🍋","🍌","🍉","🍇","🍓",
    "🍒","🍑","🥭","🍍","🥝","🍅","🥑","🥥",
    "🥕","🌽","🥔","🍆","🥒","🌶️","🥦","🧄",
    "🍞","🧀","🥨","🥐","🍪","🍰","🧁","🍩"
];

let cards = [...symbols, ...symbols].sort(() => Math.random() - 0.5);

// ----------------------------
// Éléments DOM
// ----------------------------
const game = document.getElementById("game");
const clickStatus = document.getElementById("clickStatus");
const attemptsDisplay = document.getElementById("attempts");
const remainingDisplay = document.getElementById("remaining");
const scoreDisplay = document.getElementById("score");

// ----------------------------
// État du jeu
// ----------------------------
let firstCard = null;
let lock = false;
let attempts = 0;
let pairsRemaining = symbols.length;
let startTime = Date.now();

// Pour le bonus de vitesse
let lastPairTime = Date.now();

remainingDisplay.textContent = "Paires restantes : " + pairsRemaining;

// ----------------------------
// Fonctions utilitaires
// ----------------------------
function formatTime(milliseconds) {
    const totalSeconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}m ${seconds}s`;
}

function playSound(type, style = "realiste") {
    if (audioManager && !musicPlayer?.isMuted) {
        audioManager.style = style;
        audioManager.play(type);
    }
}

// ----------------------------
// Système de score intégré
// ----------------------------
let score = 0;
const basePoints = 10; // +10 par paire trouvée
let scoreHistory = []; // Historique des gains de points

const scoreManager = {
    getScore() {
        return score;
    },

    resetScore() {
        score = 0;
        scoreHistory = [];
        scoreDisplay.textContent = "Score : 0";
    },

    addPair(combo, speed) {
        const gained = basePoints * combo * speed;
        score += gained;

        scoreHistory.push({
            base: basePoints,
            combo,
            speed,
            points: gained
        });

        scoreDisplay.textContent = "Score : " + score;
        return gained;
    },

    applyFinalMultiplier(multiplier) {
        score = Math.round(score * multiplier);
        scoreDisplay.textContent = "Score : " + score;

        scoreHistory.push({
            points: score,
            combo: "EFFICIENCY",
            multiplier
        });
    },

    getHistory() {
        return scoreHistory;
    }
};

// ----------------------------
// Bonus de vitesse
// ----------------------------
function getSpeedMultiplier() {
    const now = Date.now();
    const deltaSec = (now - lastPairTime) / 1000;
    lastPairTime = now;

    if (deltaSec < 2) return 3;
    if (deltaSec < 4) return 2;
    if (deltaSec < 6) return 1.5;
    return 1;
}

// ----------------------------
// Animation flottante du score
// ----------------------------
function showFloatingScore(cardElement, points) {
    const floatEl = document.createElement("div");

    let combo = typeof comboManager !== "undefined" ? comboManager.getComboCount() : 1;
    let color = '#FFD700';

    if (combo >= 10) color = '#FF1493';
    else if (combo >= 7) color = '#FF4500';
    else if (combo >= 5) color = '#FF8C00';

    floatEl.textContent = `+${points}`;
    floatEl.style.position = "absolute";
    floatEl.style.color = color;
    floatEl.style.fontWeight = "bold";
    floatEl.style.fontSize = "24px";
    floatEl.style.pointerEvents = "none";
    floatEl.style.textShadow =
        "2px 2px 0 #000, -2px 2px 0 #000, 2px -2px 0 #000, -2px -2px 0 #000";
    floatEl.style.transition = "all 1s ease-out";
    floatEl.style.zIndex = 1000;

    const rectCard = cardElement.getBoundingClientRect();
    const rectGame = game.getBoundingClientRect();

    const left = rectCard.left - rectGame.left + rectCard.width / 2 - 20;
    const top  = rectCard.top - rectGame.top - 20;

    floatEl.style.left = `${left}px`;
    floatEl.style.top = `${top}px`;

    game.appendChild(floatEl);

    setTimeout(() => {
        floatEl.style.top = `${top - 40}px`;
        floatEl.style.opacity = 0;
    }, 50);

    setTimeout(() => floatEl.remove(), 1050);
}

// ----------------------------
// Création des cartes
// ----------------------------
cards.forEach(symbol => {
    const card = document.createElement("div");
    card.classList.add("card");
    card.dataset.symbol = symbol;

    const back = document.createElement("div");
    back.classList.add("card-face", "card-back");

    const front = document.createElement("div");
    front.classList.add("card-face", "card-front");
    front.textContent = symbol;

    card.appendChild(back);
    card.appendChild(front);

    card.addEventListener("click", () => {
        if (lock || card.classList.contains("flipped")) return;

        card.classList.add("flipped");

        if (!firstCard) {
            firstCard = card;
            clickStatus.textContent = "Sélectionnez la seconde carte";
            playSound("place", "casino");
        } else {
            attempts++;
            attemptsDisplay.textContent = "Tentatives : " + attempts;

            if (firstCard.dataset.symbol === card.dataset.symbol) {
                // Paire correcte
                card.classList.add("matched");
                firstCard.classList.add("matched");

                if (typeof addToTicket === 'function') addToTicket(card.dataset.symbol);

                let comboCount = 1;
                if (typeof comboManager !== 'undefined') {
                    comboManager.incrementCombo();
                    comboCount = comboManager.getComboCount();
                }

                setTimeout(() => {
                    // --- BONUS VITESSE ---
                    const speedMultiplier = getSpeedMultiplier();

                    const points = scoreManager.addPair(comboCount, speedMultiplier);
                    showFloatingScore(card, points);

                    console.log(
                        `+${points} points (combo x${comboCount}, vitesse x${speedMultiplier})`
                    );
                }, 700);

                playSound("win", "realiste");

                pairsRemaining--;
                remainingDisplay.textContent = "Paires restantes : " + pairsRemaining;

                clickStatus.textContent = "Cliquez sur la première carte";
                firstCard = null;

                // --------------------------
                // FIN DE PARTIE
                // --------------------------
                if (pairsRemaining === 0) {
                    clickStatus.textContent = "🎉 Bravo ! Toutes les paires sont trouvées !";
                    const elapsedTime = formatTime(Date.now() - startTime);

                    // BONUS D’EFFICACITÉ
                    const totalPairs = symbols.length;
                    const pairsFound = totalPairs;
                    const efficience = attempts > 0 ? pairsFound / attempts : 1;
                    const efficiencyMultiplier = 0.5 + efficience;
                    scoreManager.applyFinalMultiplier(efficiencyMultiplier);

                    if (typeof comboManager !== 'undefined') {
                        comboManager.finalizeComboStats();
                    }

                    setTimeout(() => {
                        if (typeof showResultOverlay === 'function') {
                            showResultOverlay(attempts, elapsedTime);
                        }
                        if (musicPlayer) {
                            musicPlayer.switchToVictoryMode();
                        }
                    }, 1000);
                }

            } else {
                // Paire incorrecte
                playSound("place", "casino");

                if (typeof comboManager !== 'undefined') {
                    comboManager.resetCombo();
                }

                lock = true;
                clickStatus.textContent = "Raté ! Les cartes vont se retourner…";

                setTimeout(() => {
                    card.classList.remove("flipped");
                    firstCard.classList.remove("flipped");
                    firstCard = null;
                    lock = false;
                    clickStatus.textContent = "Cliquez sur la première carte";
                }, 900);
            }
        }
    });

    game.appendChild(card);
});
