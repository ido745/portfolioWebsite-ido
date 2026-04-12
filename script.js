// --- VIEW SWITCHING ---
function switchView(viewName) {
    document.getElementById('home-view').style.display = 'none';
    document.querySelectorAll('.project-view').forEach(v => v.style.display = 'none');
    if (viewName === 'home') document.getElementById('home-view').style.display = 'block';
    else (document.getElementById('project-' + viewName) || document.getElementById('project-default')).style.display = 'block';
    window.scrollTo(0, 0);
}
function openProject(id) { switchView(id); history.pushState({ view: id }, null, '#' + id); }
function closeProject() { if (history.state) history.back(); else { switchView('home'); history.replaceState(null, null, ' '); } }
window.addEventListener('popstate', (e) => switchView((e.state && e.state.view) ? e.state.view : 'home'));
window.addEventListener('load', () => switchView(location.hash.replace('#', '') || 'home'));

// --- GRID TOGGLE ---
function toggleProjects() {
    const grid = document.getElementById('projectsGrid');
    const btn = document.getElementById('toggleBtn');
    const btnText = btn.querySelector('span');
    grid.classList.toggle('is-expanded');
    btn.classList.toggle('active');
    if (grid.classList.contains('is-expanded')) btnText.innerText = "Show Less";
    else { btnText.innerText = "Show More"; grid.scrollIntoView({ behavior: 'smooth', block: 'start' }); }
}

// --- PDF MODAL ---
function openPdf(file, title) {
    const modal = document.getElementById('pdf-modal');
    const frame = document.getElementById('pdf-frame');
    document.getElementById('modal-title').innerText = title;
    document.getElementById('download-link').href = file;
    frame.src = file; modal.style.display = "flex";
}
function closePdf() { document.getElementById('pdf-modal').style.display = "none"; document.getElementById('pdf-frame').src = ""; }
window.onclick = function(e) { if (e.target == document.getElementById('pdf-modal')) closePdf(); }

// --- INTERSECTION OBSERVER ---
const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => { if (entry.isIntersecting) entry.target.classList.add('is-visible'); });
}, { threshold: 0.1 });
document.querySelectorAll('.fade-in-section').forEach(el => observer.observe(el));

// --- CANVAS BACKGROUND ---
const canvas = document.getElementById('canvas-bg');
const ctx = canvas.getContext('2d');
let width, height, particles = [];

function resize() { width = canvas.width = window.innerWidth; height = canvas.height = window.innerHeight; }
window.addEventListener('resize', resize);
resize();

class Particle {
    constructor() {
        this.x = Math.random() * width;
        this.y = Math.random() * height;
        this.vx = (Math.random() - 0.5) * 0.5;
        this.vy = (Math.random() - 0.5) * 0.5;
        this.size = Math.random() * 2 + 1;
    }
    update() {
        this.x += this.vx; this.y += this.vy;
        if (this.x < 0 || this.x > width) this.vx *= -1;
        if (this.y < 0 || this.y > height) this.vy *= -1;
    }
    draw() {
        ctx.fillStyle = 'rgba(56, 189, 248, 0.5)';
        ctx.beginPath(); ctx.arc(this.x, this.y, this.size, 0, Math.PI*2); ctx.fill();
    }
}

function init() {
    particles = [];
    for (let i=0; i < Math.min(window.innerWidth/10, 100); i++) particles.push(new Particle());
}
init();

let mouse = {x: null, y: null};
window.addEventListener('mousemove', e => { mouse.x = e.clientX; mouse.y = e.clientY; });
window.addEventListener('mouseleave', () => { mouse.x = null; mouse.y = null; });

function animate() {
    ctx.clearRect(0, 0, width, height);
    particles.forEach((p, i) => {
        p.update();

        // --- MOUSE REPULSION FEATURE ---
        if (mouse.x) {
            const dx = p.x - mouse.x;
            const dy = p.y - mouse.y;
            const dist = Math.sqrt(dx*dx + dy*dy);
            if (dist < 150) {
                const force = (150 - dist) / 150;
                p.x += (dx/dist) * force * 2;
                p.y += (dy/dist) * force * 2;
            }
        }

        p.draw();
        for (let j = i; j < particles.length; j++) {
            const dx = p.x - particles[j].x;
            const dy = p.y - particles[j].y;
            const dist = Math.sqrt(dx*dx + dy*dy);
            if (dist < 100) {
                ctx.strokeStyle = `rgba(56, 189, 248, ${1 - dist/100})`;
                ctx.lineWidth = 1;
                ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(particles[j].x, particles[j].y); ctx.stroke();
            }
        }
    });
    requestAnimationFrame(animate);
}
animate();
