// ===============================
//  ANIMATION FEUX D'ARTIFICE + CONFETTIS
// ===============================

// ------ Création du canvas ------
const canvas = document.createElement("canvas");
canvas.id = "animationCanvas";
canvas.style.position = "fixed";
canvas.style.top = 0;
canvas.style.left = 0;
canvas.style.width = "100%";
canvas.style.height = "100%";
canvas.style.pointerEvents = "none";
canvas.style.zIndex = 2110;
document.body.appendChild(canvas);

const ctx = canvas.getContext("2d");

function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}
resizeCanvas();
window.addEventListener("resize", resizeCanvas);


// ===============================
//  FEUX D'ARTIFICE
// ===============================
class Firework {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.particles = [];
        this.createParticles();
    }

    createParticles() {
        const particleCount = 50;
        const color = `hsl(${Math.random() * 360}, 100%, 60%)`;

        for (let i = 0; i < particleCount; i++) {
            const angle = (Math.PI * 2 * i) / particleCount;
            const velocity = 2 + Math.random() * 2;
            this.particles.push({
                x: this.x,
                y: this.y,
                vx: Math.cos(angle) * velocity,
                vy: Math.sin(angle) * velocity,
                alpha: 1,
                color: color
            });
        }
    }

    update() {
        this.particles.forEach(p => {
            p.x += p.vx;
            p.y += p.vy;
            p.vy += 0.05;
            p.alpha -= 0.01;
        });

        this.particles = this.particles.filter(p => p.alpha > 0);
    }

    draw() {
        this.particles.forEach(p => {
            ctx.save();
            ctx.globalAlpha = p.alpha;
            ctx.fillStyle = p.color;
            ctx.beginPath();
            ctx.arc(p.x, p.y, 3, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
        });
    }
}


// ===============================
//  CONFETTIS
// ===============================
class Confetti {
    constructor() {
        this.x = Math.random() * canvas.width;
        this.y = -20;
        this.vx = (Math.random() - 0.5) * 2;
        this.vy = Math.random() * 3 + 2;
        this.rotation = Math.random() * 360;
        this.rotationSpeed = (Math.random() - 0.5) * 10;
        this.color = `hsl(${Math.random() * 360}, 100%, 60%)`;
        this.width = 8 + Math.random() * 6;
        this.height = 12 + Math.random() * 8;
    }

    update() {
        this.x += this.vx;
        this.y += this.vy;
        this.rotation += this.rotationSpeed;
        this.vy += 0.1;
    }

    draw() {
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.rotation * Math.PI / 180);
        ctx.fillStyle = this.color;
        ctx.fillRect(-this.width / 2, -this.height / 2, this.width, this.height);
        ctx.restore();
    }
}


// ===============================
//  ANIMATION
// ===============================
let fireworks = [];
let confettis = [];

function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Feux d’artifice
    fireworks.forEach((fw, i) => {
        fw.update();
        fw.draw();
        if (fw.particles.length === 0) fireworks.splice(i, 1);
    });

    // Confettis
    confettis.forEach((c, i) => {
        c.update();
        c.draw();
        if (c.y > canvas.height + 20) confettis.splice(i, 1);
    });

    if (fireworks.length > 0 || confettis.length > 0) {
        requestAnimationFrame(animate);
    }
}


// ===============================
//  FONCTIONS PUBLIQUES CALLABLE
// ===============================
window.launchFireworks = function () {
    for (let i = 0; i < 5; i++) {
        setTimeout(() => {
            const x = Math.random() * canvas.width;
            const y = canvas.height * 0.3 + Math.random() * canvas.height * 0.3;
            fireworks.push(new Firework(x, y));
            if (fireworks.length === 1 && confettis.length === 0) animate();
        }, i * 200);
    }
};

window.launchConfetti = function () {
    for (let i = 0; i < 300; i++) {
        setTimeout(() => {
            confettis.push(new Confetti());
            if (confettis.length === 1 && fireworks.length === 0) animate();
        }, i * 20);
    }
};
