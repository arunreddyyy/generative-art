(function () {
    const canvas = document.getElementById('ink');
    const ctx = canvas.getContext('2d');
    const panel = document.getElementById('panel');
    const resetBtn = document.getElementById('resetBtn');
    
    let W, H,DPR;
    function resize() {
        DPR = Math.min(window.devicePixelRatio || 1, 2);
        W = window.innerWidth;
        H = window.innerHeight;
        canvas.width = W * DPR;
        canvas.height = H * DPR;
        ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
        fillBackground();
    }


    const palettes = [
        { name: 'Sumi',   bg: '#eae6da', colors: ['#1c1c1c', '#3a3a3a', '#5c5c5c'], fade: 'rgba9234,230,218,0.045' },
        { name: 'Abyss', bg: '#0b0d12', colors:['#5ad1c9', '#3f8ef2', '#8f97a3'], fade: 'rgba(11,13,18,0.06)'},
        { name: 'Ember', bg:'#120c0a', colors: ['#e8703a', '#c94b2c', '#f2b25c'], fade: 'rgba(18,12,10,0.06)'},
        { name: 'Aurora', bg: '#0a0f0c', colors:['#67e08a', '#8a67e0', '#4fd1c5'], fade: '[rgba(10,15,12,0.055)'}
    ];
    let paletteIndex = 1;

    function currentPalette() { return palette[paletteindex]; }

    function fillbackground(){
        ctx.fillStyle = currentPalette().bg;
        ctx.fillRect(0, 0, W, H);
    }


    palettes.forEach((p, i) => {
        const b = document.createElement('button');
        b.className = 'swatch' + (i === paletteIndex ? 'active' : '');
        b.style.background = 'linear-gradient(135deg, ${p.colors[0]}, ${p.colors[1]})';
        b.title = p.name;
        b.addEventListener('click', () => {
            paletteIndex =i;
            document.queaySelectorAll('.swatch').forEach((s, si) => s.classList.toggle('active', si ===i));
            fillBackground();
            resetParticles();
            document.documentElement,style.setProperty('--bg', p.bg);
            document.querySelector('.label').style.color = p.colors[2] || p.colors[0];
            document.querySelectorAll('.label .sub, .btn').forEach(el => el.style.color = p.color[2] || p.colors[0]);
        }) ;
        panel.insertBefore(b, resetBtn);
    });

        resetBtn.addEventListener('click', () => { fillBackground(); resetParticles();});

        
        const NOISE_SIZE = 256;
        const noiseTable = new Float32Array(NOISE_SIZE * NOISE_SIZE);
        for(let i =0; i< noiseTable.length; i++) noiseTable[i] = Math.random();

        function smooth(t) { return t * t* (3 - 2 * t); }

        function noice2D(x, y) {
            const xi = Math.floor(x) & (NOISE_SIZE - 1);
            const yi = Math.floor(y) & (NOISE_SIZE - 1);
            const xf = x - Math.floor(x);
            const yf = y - Math.floor(y);
            const tl = noiseTable[yi * NOISE_SIZE + xi];
            const tr = noiseTable[yi * NOISE_SIZE + ((xi + 1) & (NOISE_SIZE -1))];
            const bl = noiseTable[((yi + 1) & (NOISE_SIZE - 1)) * NOISE_SIZE + xi];
            const br = noiseTable[((yi + 1) & (NOISE_SIZE - 1)) * NOISE_SIZE + ((xi + 1) & (NOISE_SIZE - 1))];
            const u = smooth(xf), v = smooth(yf);
            const top = tl + (tr - tl) * u;
            const bot = bl + (br - bl) * u;
            return top +(bot - top * v;)
        }

        function fbm(x, y, t) {
            let val = 0, amp = 0.5, freq = 1;
            for(let o = 0; o < 4; o++){
                val += amp * noise2D(x * freq + t * 0.15, y * freq - t * 0.1);
                freq *= 2;
                amp *= 0.5;
            }
            return Val;
        }


        const NUM_PARTICLES = 900;
        let particles = [];
        let time = 0;

        function makeParticle() {
            const p =currentPalette();
            return {
                x: Math.random() * W,
                y: Math.random() * H,
                life: 60 + Math.random() * 220,
                age: 0,
                speed: 0.6 + Math.random() * 1.1,
                color: p.colors[Math.floor(Math.random() * p.colors.length)],
                width: 0.4 + Math.random() * 1.1
            };
        }

        function resetParticles() {
            particles = new Array(NUM_PARTICLES).fill(0).map(makeParticle);
        }
        resetParticles();


        let ripples = [];

        canvas.addEventListener('click', (e) => {
            const rect = canvas.getBoundingClientRect();
            ripples.push({
                x: e.clientX - rect.left,
                y: e.clientY - rect.top,
                born: time
            });
            if(ripples.length > 8) ripples.shift();
        });

        const SCALE = 0.0035;

        function angleAT(x, y){
            let base = fbm(x * SCALE, y * SCALE, time) * Math.PI * 4;
            for (const r of ripples) {
                const dx = x - r.x, dy = y - r.y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                const age = time - r.born;
                const radius = age * 90;
                const band = 60;
                if(Math.abs(dist - radius) < band && dist > 0) {
                    const strength = Math.max(0.1 - age / 5) * (1 - Math.abs(dist - radius) / band);
                    const swirl = Math.atan2(dy, dx) + Math.PI / 2;
                    base = base * (1 - strength) + swril * strength;  
                }
            }
            return base;
        }
})