// ============================================
// GESTIONNAIRE AUDIO POUR LES EFFETS SONORES
// ============================================

class AudioManager {
    constructor() {
        this.ctx = new (window.AudioContext || window.webkitAudioContext)();
        this.master = this.ctx.createGain();
        this.master.connect(this.ctx.destination);
        this.master.gain.value = 1;
        this.style = "realiste";
    }

    unlock() {
        if (this.ctx.state === "suspended") this.ctx.resume();
    }

    _pulse(freq, vol, dur, type="sine") {
        let o = this.ctx.createOscillator();
        let g = this.ctx.createGain();
        o.type = type;
        o.frequency.setValueAtTime(freq, this.ctx.currentTime);
        g.gain.setValueAtTime(vol, this.ctx.currentTime);
        g.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + dur);
        o.connect(g);
        g.connect(this.master);
        o.start();
        o.stop(this.ctx.currentTime + dur);
    }

    _pitch(start, end, vol, dur, type="sine") {
        let o = this.ctx.createOscillator();
        let g = this.ctx.createGain();
        o.type = type;
        o.frequency.setValueAtTime(start, this.ctx.currentTime);
        o.frequency.exponentialRampToValueAtTime(end, this.ctx.currentTime + dur);
        g.gain.setValueAtTime(vol, this.ctx.currentTime);
        g.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + dur);
        o.connect(g);
        g.connect(this.master);
        o.start();
        o.stop(this.ctx.currentTime + dur);
    }

    realiste = {
        flip: () => this._pitch(200, 260, 0.25, 0.06, "triangle"),
        draw: () => this._pulse(180, 0.2, 0.04, "sine"),
        place: () => this._pulse(140, 0.25, 0.05, "sine"),
        shuffle: () => { for (let i=0;i<6;i++) setTimeout(()=>this.realiste.flip(), i*35)},
        click: () => this._pulse(300, 0.08, 0.03),
        win: () => [400, 520, 620].forEach((f,i)=>setTimeout(()=>this._pulse(f,0.25,0.12,"triangle"),i*130)),
        lose: () => [260,190,120].forEach((f,i)=>setTimeout(()=>this._pulse(f,0.25,0.12,"sine"),i*150)),
    }

    casino = {
        flip: () => this._pulse(500, 0.2, 0.05, "square"),
        draw: () => this._pulse(600, 0.15, 0.04, "square"),
        place: () => this._pulse(450, 0.18, 0.06, "triangle"),
        shuffle: () => { for (let i=0;i<7;i++) setTimeout(()=>this.casino.flip(), i*28)},
        click: () => this._pulse(900, 0.2, 0.02, "sine"),
        win: () => [800, 1000, 1300].forEach((f,i)=>setTimeout(()=>this._pulse(f,0.3,0.10,"square"),i*90)),
        lose: () => this._pitch(400,80,0.25,0.25,"triangle")
    }

    cartoon = {
        flip: () => this._pitch(300, 500, 0.3, 0.08, "sine"),
        draw: () => this._pitch(350, 600, 0.25, 0.07, "triangle"),
        place: () => this._pitch(500, 200, 0.3, 0.1, "sawtooth"),
        shuffle: () => { for (let i=0;i<5;i++) setTimeout(()=>this.cartoon.draw(), i*60)},
        click: () => this._pulse(800, 0.25, 0.05, "square"),
        win: () => [500, 650, 900].forEach((f,i)=>setTimeout(()=>this._pulse(f,0.35,0.12,"sawtooth"),i*120)),
        lose: () => this._pitch(250, 40, 0.35, 0.3, "sawtooth"),
    }

    chiptune = {
        flip: () => this._pulse(700, 0.2, 0.05, "square"),
        draw: () => this._pulse(850, 0.15, 0.04, "square"),
        place: () => this._pulse(600, 0.2, 0.05, "square"),
        shuffle: () => { for (let i=0;i<8;i++) setTimeout(()=>this.chiptune.flip(), i*25)},
        click: () => this._pulse(1000, 0.1, 0.02, "square"),
        win: () => [900,1100,1500].forEach((f,i)=>setTimeout(()=>this._pulse(f,0.3,0.12,"square"),i*80)),
        lose: () => [500, 300, 150].forEach((f,i)=>setTimeout(()=>this._pulse(f,0.25,0.12,"square"),i*140)),
    }

    premium = {
        flip: () => this._pulse(240, 0.15, 0.04, "sine"),
        draw: () => this._pulse(300, 0.1, 0.03, "sine"),
        place: () => this._pulse(200, 0.18, 0.05, "sine"),
        shuffle: () => { for (let i=0;i<5;i++) setTimeout(()=>this.premium.flip(), i*40)},
        click: () => this._pulse(500, 0.1, 0.03, "triangle"),
        win: () => [300, 450, 600].forEach((f,i)=>setTimeout(()=>this._pulse(f,0.2,0.10,"sine"),i*150)),
        lose: () => this._pitch(250, 80, 0.2, 0.20, "sine"),
    }

    dark = {
        flip: () => this._pulse(90, 0.3, 0.07, "triangle"),
        draw: () => this._pulse(120, 0.25, 0.06, "sine"),
        place: () => this._pulse(80, 0.35, 0.08, "triangle"),
        shuffle: () => { for (let i=0;i<5;i++) setTimeout(()=>this.dark.flip(), i*55)},
        click: () => this._pulse(200, 0.15, 0.04, "sine"),
        win: () => [150,200,260].forEach((f,i)=>setTimeout(()=>this._pulse(f,0.35,0.14,"triangle"),i*180)),
        lose: () => this._pitch(120,30,0.4,0.4,"triangle"),
    }

    play(type) {
        this[this.style][type]();
    }
}

// Instance globale pour le jeu
const audioManager = new AudioManager();
document.addEventListener("click", () => audioManager.unlock(), { once: true });

// ============================================
// GESTIONNAIRE DE MUSIQUE
// ============================================

const playlist = [
    { name: "1 - Piano Background Music Soft", auteur: "Viacheslav Starostin", link: "https://pixabay.com/fr/music/classique-moderne-piano-background-music-soft-344547/", url: "asset/music/PianoBackground.mp3" },
    { name: "2 - Lofi Chill", auteur: "DELOSound", link: "https://pixabay.com/fr/music/beats-lofi-chill-medium-version-159456/", url: "asset/music/LofiChill.mp3" },
    { name: "3 - Lofi Background", auteur: "DELOSound", link: "https://pixabay.com/fr/music/beats-lofi-background-256905/", url: "asset/music/LofiBackground.mp3" },
    { name: "4 - Nature Documentary", auteur: "DELOSound", link: "https://pixabay.com/fr/music/ambient-nature-documentary-calm-atmospheric-268832/", url: "asset/music/NatureDocumentary.mp3" }
];

const completeMusic = [
    { name: "1 - Uplifting Funs", auteur: "AudioCoffee", link: "https://pixabay.com/music/happy-childrens-tunes-uplifting-funs-150192/", url: "asset/music/upLiftingFuns.mp3" },
    { name: "2 - time technology echoes of purity", auteur: "Coma-Media", link: "https://pixabay.com/music/upbeat-time-technology-echoes-of-purity-11257/", url: "asset/music/timeTechnologyEchoesOfPurity.mp3" }
];

class MusicPlayer {
    constructor() {
        this.audio = new Audio();
        this.audio.volume = 0.5;
        this.index = 0;
        this.isMuted = false;
        this.currentPlaylist = playlist;
        this.isVictoryMode = false;
        
        this.audio.addEventListener('ended', () => this.next(true));
        this.init();
    }
    
    init() {
        this.trackName = document.getElementById("trackName");
        this.trackAuthor = document.getElementById("trackAuthor");
        this.playBtn = document.getElementById("play");
        this.volumeSlider = document.getElementById("volume");
        this.volumePercent = document.getElementById("volumePercent");
        this.muteBtn = document.getElementById("muteButton");
        
        console.log("MusicPlayer initialisé", this.trackAuthor); // Debug
        
        this.playBtn.addEventListener("click", () => this.togglePlay());
        document.getElementById("prev").addEventListener("click", () => this.prev());
        document.getElementById("next").addEventListener("click", () => this.next(true));
        this.volumeSlider.addEventListener("input", (e) => this.updateVolume(e.target.value));
        this.muteBtn.addEventListener("click", () => this.toggleMute());
        
        this.loadTrack(false);
    }
    
    loadTrack(autoPlay) {
        const track = this.currentPlaylist[this.index];
        this.trackName.textContent = track.name;
        
        // Créer le lien pour l'auteur
        this.trackAuthor.innerHTML = `<a href="${track.link}" target="_blank" rel="noopener noreferrer">${track.auteur}</a>`;
        console.log("Lien créé:", track.link); // Debug
        
        this.audio.src = track.url;
        
        this.trackName.classList.remove("scrolling");
        
        // Initialiser le gradient du volume
        this.updateVolume(this.volumeSlider.value);
        
        if (autoPlay) {
            this.audio.play().catch(err => console.log("Autoplay bloqué:", err));
            this.playBtn.textContent = "⏸️";
            this.trackName.classList.add("scrolling");
        } else {
            this.playBtn.textContent = "▶️";
        }
    }
    
    togglePlay() {
        if (this.audio.paused) {
            this.audio.play();
            this.playBtn.textContent = "⏸️";
            this.trackName.classList.add("scrolling");
        } else {
            this.audio.pause();
            this.playBtn.textContent = "▶️";
            this.trackName.classList.remove("scrolling");
        }
    }
    
    next(autoPlay) {
        this.index = (this.index + 1) % this.currentPlaylist.length;
        this.loadTrack(autoPlay);
    }
    
    prev() {
        this.index = (this.index - 1 + this.currentPlaylist.length) % this.currentPlaylist.length;
        this.loadTrack(true);
    }
    
    toggleMute() {
        this.isMuted = !this.isMuted;
        this.audio.muted = this.isMuted;
        audioManager.master.gain.value = this.isMuted ? 0 : 1;
        this.muteBtn.textContent = this.isMuted ? "🔇" : "🔊";
    }
    
    updateVolume(value) {
        this.audio.volume = value / 100;
        this.volumePercent.textContent = value + "%";
        
        // Mise à jour du gradient de la barre
        const percent = value;
        this.volumeSlider.style.background = `linear-gradient(to right, #4caf50 0%, #4caf50 ${percent}%, #555 ${percent}%, #555 100%)`;
    }
    
    switchToVictoryMode() {
        this.isVictoryMode = true;
        this.currentPlaylist = completeMusic;
        this.index = 0;
        this.loadTrack(true);
    }
    
    switchToNormalMode() {
        this.isVictoryMode = false;
        this.currentPlaylist = playlist;
        this.index = 0;
        this.loadTrack(true);
    }
}

let musicPlayer;
document.addEventListener("DOMContentLoaded", () => {
    musicPlayer = new MusicPlayer();
});