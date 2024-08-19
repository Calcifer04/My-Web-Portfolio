const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const titleImage = document.getElementById('titleImage');
let width, height;

function resizeCanvas() {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;

    // Center the title image
    const imgWidth = titleImage.width;
    const imgHeight = titleImage.height;
    titleImage.style.left = (width / 2 - imgWidth / 2) + 'px';
    titleImage.style.top = (height / 2 - imgHeight / 2) + 'px';
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

// Array to store ovals
const ovals = [];

// Function to create an oval object
function createOval(baseRadiusX, baseRadiusY, baseWarpAmplitude, amplitudeRange, animationSpeed) {
    return {
        baseRadiusX,
        baseRadiusY,
        baseWarpAmplitude,
        amplitudeRange,
        animationSpeed,
        angleOffset: Math.random() * Math.PI * 2,
        amplitudeOffset: Math.random() * Math.PI * 2
    };
}

// Create multiple ovals with different parameters
ovals.push(createOval(320, 320, 50, 200, 0.001));
ovals.push(createOval(320, 320, 50, 200, 0.0015));
ovals.push(createOval(320, 320, 50, 140, 0.002));
ovals.push(createOval(320, 320, 50, 120, 0.0009));
ovals.push(createOval(320, 320, 50, 180, 0.0017));
ovals.push(createOval(320, 320, 50, 140, 0.0017));
ovals.push(createOval(320, 320, 50, 140, 0.0017));
ovals.push(createOval(320, 320, 50, 140, 0.0017));
ovals.push(createOval(320, 320, 50, 100, 0.0017));

// Mouse position
let mouseX = width / 2;
let mouseY = height / 2;

canvas.addEventListener('mousemove', (event) => {
    mouseX = event.clientX;
    mouseY = event.clientY;
});

function drawOvals() {
    ctx.clearRect(0, 0, width, height);

    const centerX = width / 2;
    const centerY = height / 2;

    ovals.forEach(oval => {
        ctx.beginPath();
        const points = [];
        const distance = Math.sqrt((mouseX - centerX) ** 2 + (mouseY - centerY) ** 2);
        const maxDistance = Math.sqrt(centerX ** 2 + centerY ** 2);
        const normalizedDistance = 1 - (distance / maxDistance); // Invert the distance effect
        const scalingFactor = 1; // Adjust this value to control the difference in amplitude
        const effectiveAmplitude = oval.amplitudeRange * (1 - scalingFactor + normalizedDistance * scalingFactor);

        for (let angle = 0; angle <= 2 * Math.PI; angle += 0.01) {
            const noiseValue = noise(Math.cos(angle * 3 + oval.angleOffset), Math.sin(angle * 3 + oval.angleOffset));
            const amplitude = oval.baseWarpAmplitude + Math.sin(oval.angleOffset + oval.amplitudeOffset) * effectiveAmplitude;
            const warp = noiseValue * amplitude;

            const radiusX = oval.baseRadiusX + warp;
            const radiusY = oval.baseRadiusY + warp;
            const x = width / 2 + radiusX * Math.cos(angle);
            const y = height / 2 + radiusY * Math.sin(angle);
            points.push({ x, y });
        }
        points.push(points[0]); // Ensure the end point connects smoothly to the start point

        ctx.moveTo(points[0].x, points[0].y);
        for (let i = 1; i < points.length; i++) {
            ctx.lineTo(points[i].x, points[i].y);
        }
        ctx.closePath();
        
        // Set stroke color based on body class
        if (document.body.classList.contains('dark-mode')) {
            ctx.strokeStyle = 'white'; // Change to your desired dark mode stroke color
        } else {
            ctx.strokeStyle = 'black'; // Change to your desired light mode stroke color
        }
        
        ctx.lineWidth = 2;
        ctx.stroke();

        oval.angleOffset += oval.animationSpeed;
        oval.amplitudeOffset += oval.animationSpeed * 2; // Adjust amplitude oscillation speed
    });

    requestAnimationFrame(drawOvals);
}

drawOvals();