// ============================================
// GESTIONNAIRE AUDIO POUR LES SONS DE COMBO
// ============================================
class ComboAudio {
    constructor() {
        this.ctx = new (window.AudioContext || window.webkitAudioContext)();
        this.master = this.ctx.createGain();
        this.master.connect(this.ctx.destination);
        this.master.gain.value = 1;
    }

    unlock() {
        if (this.ctx.state === "suspended") this.ctx.resume();
    }

    playCombo(comboLevel) {
        // Son de plus en plus aigu selon le niveau de combo
        const baseFreq = 400;
        const freqIncrement = 100;
        const frequencies = [];
        
        // Générer 2-3 notes selon le niveau
        const noteCount = Math.min(3, Math.floor(comboLevel / 2) + 2);
        
        for (let i = 0; i < noteCount; i++) {
            frequencies.push(baseFreq + (freqIncrement * comboLevel) + (i * 150));
        }

        frequencies.forEach((freq, i) => {
            setTimeout(() => {
                const o = this.ctx.createOscillator();
                const g = this.ctx.createGain();
                
                o.type = "sine";
                o.frequency.setValueAtTime(freq, this.ctx.currentTime);
                
                const volume = Math.min(0.3, 0.15 + (comboLevel * 0.02));
                g.gain.setValueAtTime(volume, this.ctx.currentTime);
                g.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.15);
                
                o.connect(g);
                g.connect(this.master);
                o.start();
                o.stop(this.ctx.currentTime + 0.15);
            }, i * 80);
        });
    }
}

// Instance globale pour le système de combo
const comboAudio = new ComboAudio();
document.addEventListener("click", () => comboAudio.unlock(), { once: true });

// ============================================
// GESTIONNAIRE DE COMBO
// ============================================
class ComboManager {
    constructor() {
        this.comboCount = 0;
        this.comboText = null;
        this.hideTimeout = null;
        this.maxCombo = 0;
        this.comboStats = {}; // Stocke le nombre de chaque type de combo (2-hit, 3-hit, etc.)
        this.init();
    }

    init() {
        // Créer les éléments DOM nécessaires
        const comboZone = document.createElement('div');
        comboZone.id = 'comboZone';
        
        this.comboText = document.createElement('div');
        this.comboText.id = 'comboText';
        
        comboZone.appendChild(this.comboText);
        document.body.appendChild(comboZone);
    }

    incrementCombo() {
        this.comboCount++;

        // Mettre à jour le combo maximum
        if (this.comboCount > this.maxCombo) {
            this.maxCombo = this.comboCount;
        }

        if (this.comboCount >= 2) {
            // Délai de 500ms pour synchroniser avec l'animation de la carte (glow + pulse)
            setTimeout(() => {
                this.showCombo();
                
                // Jouer le son de combo si disponible et non muté
                if (musicPlayer && !musicPlayer.isMuted) {
                    comboAudio.playCombo(this.comboCount);
                }
            }, 500);
        }
    }

    resetCombo() {
        // Sauvegarder le combo actuel dans les statistiques avant de réinitialiser
        if (this.comboCount >= 2) {
            if (!this.comboStats[this.comboCount]) {
                this.comboStats[this.comboCount] = 0;
            }
            this.comboStats[this.comboCount]++;
        }
        
        this.comboCount = 0;
        this.hideCombo();
    }

    showCombo() {
        // Annuler le timeout de disparition précédent
        if (this.hideTimeout) {
            clearTimeout(this.hideTimeout);
        }

        // Calculer la taille en fonction du combo (min 48px, max 120px)
        const minSize = 48;
        const maxSize = 120;
        const sizeIncrement = 8;
        const fontSize = Math.min(maxSize, minSize + ((this.comboCount - 2) * sizeIncrement));

        // Déterminer la couleur selon le niveau de combo
        let color = '#FFD700'; // Or par défaut
        if (this.comboCount >= 10) {
            color = '#FF1493'; // Rose vif pour 10+
        } else if (this.comboCount >= 7) {
            color = '#FF4500'; // Orange rouge pour 7-9
        } else if (this.comboCount >= 5) {
            color = '#FF8C00'; // Orange foncé pour 5-6
        }

        // Mettre à jour le texte et le style
        this.comboText.textContent = `${this.comboCount} HIT COMBO!`;
        this.comboText.style.fontSize = `${fontSize}px`;
        this.comboText.style.color = color;

        // Retirer puis rajouter la classe pour relancer l'animation
        this.comboText.classList.remove('show');
        void this.comboText.offsetWidth; // Force reflow
        this.comboText.classList.add('show');

        // Programmer la disparition après 3 secondes
        this.hideTimeout = setTimeout(() => {
            this.hideCombo();
        }, 3000);
    }

    hideCombo() {
        if (this.comboText) {
            this.comboText.classList.remove('show');
        }
    }

    getComboCount() {
        return this.comboCount;
    }

    getMaxCombo() {
        return this.maxCombo;
    }

    getComboStats() {
        return this.comboStats;
    }

    // Appelé à la fin du jeu pour comptabiliser le dernier combo en cours
    finalizeComboStats() {
        if (this.comboCount >= 2) {
            if (!this.comboStats[this.comboCount]) {
                this.comboStats[this.comboCount] = 0;
            }
            this.comboStats[this.comboCount]++;
        }
    }
}

// Instance globale pour le jeu
let comboManager;
document.addEventListener("DOMContentLoaded", () => {
    comboManager = new ComboManager();
});