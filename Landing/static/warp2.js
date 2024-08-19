const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
let width, height;
let waveGroupPositions;

function resizeCanvas() {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
    // Recalculate positions based on the new width
    waveGroupPositions = [width * 0.2, width * 0.8];
}

window.addEventListener('resize', resizeCanvas);
resizeCanvas();

// Perlin Noise Implementation
const perm = new Uint8Array(512);
for (let i = 0; i < 256; i++) perm[i] = perm[i + 256] = i;
for (let i = 0; i < 256; i++) {
    let j = Math.floor(Math.random() * 256);
    [perm[i], perm[j]] = [perm[j], perm[i]];
}

function fade(t) {
    return t * t * t * (t * (t * 6 - 15) + 10);
}

function grad(hash, x, y, z) {
    const h = hash & 15;
    const u = h < 8 ? x : y;
    const v = h < 4 ? y : h === 12 || h === 14 ? x : z;
    return ((h & 1) === 0 ? u : -u) + ((h & 2) === 0 ? v : -v);
}

function lerp(t, a, b) {
    return a + t * (b - a);
}

function noise(x, y = 0, z = 0) {
    const X = Math.floor(x) & 255;
    const Y = Math.floor(y) & 255;
    const Z = Math.floor(z) & 255;

    x -= Math.floor(x);
    y -= Math.floor(y);
    z -= Math.floor(z);

    const u = fade(x);
    const v = fade(y);
    const w = fade(z);

    const A = perm[X] + Y;
    const AA = perm[A] + Z;
    const AB = perm[A + 1] + Z;
    const B = perm[X + 1] + Y;
    const BA = perm[B] + Z;
    const BB = perm[B + 1] + Z;

    return lerp(w, lerp(v, lerp(u, grad(perm[AA], x, y, z), grad(perm[BA], x - 1, y, z)),
                        lerp(u, grad(perm[AB], x, y - 1, z), grad(perm[BB], x - 1, y - 1, z))),
            lerp(v, lerp(u, grad(perm[AA + 1], x, y, z - 1), grad(perm[BA + 1], x - 1, y, z - 1)),
                lerp(u, grad(perm[AB + 1], x, y - 1, z - 1), grad(perm[BB + 1], x - 1, y - 1, z - 1))));
}

// Array to store wave groups
const waveGroups = [];

// Function to create a wave object
function createWave(x, baseAmplitude, amplitudeRange, animationSpeed) {
    return {
        x,
        baseAmplitude,
        amplitudeRange,
        animationSpeed,
        angleOffset: Math.random() * Math.PI * 2,
        amplitudeOffset: Math.random() * Math.PI * 2
    };
}

// Create multiple wave groups with different parameters
function createWaveGroups() {
    waveGroups.length = 0;
    waveGroupPositions.forEach(position => {
        const group = [];
        for (let i = 0; i < 10; i++) { // 10 waves per group
            group.push(createWave(position, 80, 100, 0.001));
        }
        waveGroups.push(group);
    });
}
createWaveGroups();

// Mouse position
let mouseX = width / 2;

canvas.addEventListener('mousemove', (event) => {
    mouseX = event.clientX;
});

function drawWaves() {
    ctx.clearRect(0, 0, width, height);

    waveGroups.forEach(group => {
        group.forEach(wave => {
            ctx.beginPath();
            const distance = Math.abs(mouseX - wave.x);
            const maxDistance = width / 2;
            const normalizedDistance = 1 - (distance / maxDistance); // Invert the distance effect
            const scalingFactor = 1; // Adjust this value to control the difference in amplitude
            const effectiveAmplitude = wave.amplitudeRange * (1 - scalingFactor + normalizedDistance * scalingFactor);

            for (let y = 0; y <= height; y += 10) {
                const noiseValue = noise(y * 0.01 + wave.angleOffset);
                const amplitude = wave.baseAmplitude + Math.sin(wave.angleOffset + wave.amplitudeOffset) * effectiveAmplitude;
                const warp = noiseValue * amplitude;
                const x = wave.x + warp;

                if (y === 0) {
                    ctx.moveTo(x, y);
                } else {
                    ctx.lineTo(x, y);
                }
            }

            // Set stroke color based on body class
            if (document.body.classList.contains('dark-mode')) {
                ctx.strokeStyle = 'white'; // Change to your desired dark mode stroke color
            } else {
                ctx.strokeStyle = 'black'; // Change to your desired light mode stroke color
            }
            
            ctx.lineWidth = 2;
            ctx.stroke();

            wave.angleOffset += wave.animationSpeed;
            wave.amplitudeOffset += wave.animationSpeed * 2; // Adjust amplitude oscillation speed
        });
    });

    requestAnimationFrame(drawWaves);
}

drawWaves();