// fireworks.ts
class Firework {
    constructor(x, y, color) {
        this.exploded = false;
        this.particles = [];
        this.x = x;
        this.y = y;
        this.color = color;
        this.velocity = { x: Math.random() * 2 - 1, y: -Math.random() * 3 - 3 };
    }
    update() {
        if (!this.exploded) {
            this.x += this.velocity.x;
            this.y += this.velocity.y;
            if (this.y <= 100) {
                this.explode();
            }
        }
        else {
            this.particles.forEach(particle => particle.update());
            // Filter out particles that have faded
            this.particles = this.particles.filter(particle => particle.alpha > 0);
        }
    }
    explode() {
        this.exploded = true;
        for (let i = 0; i < 50; i++) {
            this.particles.push(new Particle(this.x, this.y, this.color));
        }
    }
    draw(ctx) {
        if (!this.exploded) {
            ctx.beginPath();
            ctx.arc(this.x, this.y, 2, 0, Math.PI * 2);
            ctx.fillStyle = this.color;
            ctx.fill();
        }
        else {
            this.particles.forEach(particle => particle.draw(ctx));
        }
    }
}
class Particle {
    constructor(x, y, color) {
        this.alpha = 1;
        this.x = x;
        this.y = y;
        this.color = color;
        this.velocity = {
            x: Math.random() * 2 - 1,
            y: Math.random() * 2 - 1
        };
    }
    update() {
        this.x += this.velocity.x;
        this.y += this.velocity.y;
        this.alpha -= 0.01; // Fade out effect
    }
    draw(ctx) {
        ctx.globalAlpha = this.alpha;
        ctx.beginPath();
        ctx.arc(this.x, this.y, 1, 0, Math.PI * 2);
        ctx.fillStyle = this.color;
        ctx.fill();
    }
}
export function initFireworks() {
    const canvas = document.getElementById('fireworksCanvas');
    if (!canvas) {
        console.error('Canvas element not found');
        return;
    }
    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = 200; // Adjust as needed
    const fireworks = [];
    const colors = ['#ff0000', '#00ff00', '#0000ff', '#ffff00', '#ff00ff', '#00ffff'];
    function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        // Spawn new fireworks if there are less than three
        if (fireworks.length < 3) {
            const x = Math.random() * canvas.width;
            const color = colors[Math.floor(Math.random() * colors.length)];
            fireworks.push(new Firework(x, canvas.height, color));
        }
        // Update and draw each firework
        fireworks.forEach(firework => {
            firework.update();
            ctx.shadowColor = 'rgba(255, 255, 255, 0.8)';
            ctx.shadowBlur = 10;
            firework.draw(ctx);
        });
        // Filter out finished fireworks and update the array
        for (let i = fireworks.length - 1; i >= 0; i--) {
            if (fireworks[i].exploded && fireworks[i].particles.length === 0) {
                fireworks.splice(i, 1); // Remove finished fireworks
            }
        }
        requestAnimationFrame(animate);
    }
    animate();
    window.addEventListener('resize', () => {
        canvas.width = window.innerWidth; // Adjust canvas width on resize
    });
}
