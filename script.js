const container = document.getElementById("container");

const TIME_STEP = 60 * 60;
const FPS = 30
const TOTAL_BOXELS = 1000;
let containerSize;
const margin = 20;
const windowHeight = window.innerHeight;
const windowWidth = window.innerWidth;

console.log('windowHeight', windowHeight);
console.log('windowWidth', windowWidth);

if (windowHeight < windowWidth) {
    containerSize = windowHeight - margin
}
else {
    containerSize = windowWidth - margin
}


container.style.height = `${containerSize}px`;
container.style.width = `${containerSize}px`;


// Scaling constants

const SHIFT = (containerSize) / 2; // shift origin to center
console.log('shift', SHIFT);

const AUtoKM = 149597870;
const MARS_DISTANCE = 1.52 * AUtoKM; // in km, so that it fits in screen
const BOX_KM_RATIO = (containerSize / 2) / MARS_DISTANCE; // 1 km = 1000 pixels
const DIA_BOXEL_RATIO = containerSize / TOTAL_BOXELS;

// Planet class
function velocityCalc(d) {
    d = Math.abs(d)
    return Math.sqrt((6.674 * 10e-11 * 1.99 * 10e30) / (d * 1000)) / 1000;
}

class Planet {
    constructor(x, y, diameter, color, mass, name, isSun, vDir) {
        // Planet properties
        this.x = x; // in km
        this.y = y; // in km
        this.diameter = diameter; // in pixels
        this.color = color;
        this.mass = mass; // in kg
        this.id = name + "-planet";
        this.isSun = isSun;
        this.velocityX = 0; // in km/s
        this.velocityY = velocityCalc(this.x) * vDir; // in km/s

        // Create planet
        container.innerHTML += `<div id="${this.id}" class="planet"><span>${name}</span></div>`;
        const element = document.getElementById(this.id);
        element.style.height = `${this.diameter * DIA_BOXEL_RATIO}px`;
        element.style.width = `${this.diameter * DIA_BOXEL_RATIO}px`;
        element.style.backgroundColor = this.color;
        element.style.top = `${(KMtoBoxels(this.y) - (this.diameter * DIA_BOXEL_RATIO / 2) + SHIFT)
            }px`;
        element.style.left = `${(KMtoBoxels(this.x) - (this.diameter * DIA_BOXEL_RATIO / 2) + SHIFT)
            }px`;


        // Create orbit
        if (!this.isSun) {
            container.innerHTML += `<div id="${name}-orbit" class="orbit"></div>`;

            const orbit = document.getElementById(`${name}-orbit`);
            x = Math.abs(this.x);
            orbit.style.width = `${(x * BOX_KM_RATIO) * 2}px`;
            orbit.style.height = `${(x * BOX_KM_RATIO) * 2}px`;
            orbit.style.left = `${(SHIFT - (orbit.clientWidth / 2)) - 2}px`;
            orbit.style.top = `${(SHIFT - (orbit.clientHeight / 2)) - 2}px`;
        }
    }

    getForce(otherPlanet) {
        const dx = (otherPlanet.x - this.x) * 1000; // in meter
        const dy = (otherPlanet.y - this.y) * 1000; // in meter
        const distance = Math.sqrt(dx ** 2 + dy ** 2); // in meter
        const force =
            (6.674 * 10e-11 * this.mass * otherPlanet.mass) /
            ((distance) ** 2);
        const angle = Math.atan2(dy, dx);
        let fx = Math.cos(angle) * force;
        let fy = Math.sin(angle) * force;
        if (!fx) { fx = 1 }
        if (!fy) { fy = 1 }
        return [fx, fy]; // force in Newtons
    }
}

// Convert size to boxels
function KMtoBoxels(size) {
    return size * BOX_KM_RATIO;
}

// Planets

const sun = new Planet(0, 0, 150, "yellow", 1.99 * 10e30, "sun", true, 0, 0);
const mercury = new Planet(-0.39 * AUtoKM, 0, 30, "grey", 3.3 * 10e23, "mercury", false, 1);
const venus = new Planet(+0.72 * AUtoKM, 0, 60, "orange", 4.87 * 10e24, "venus", false, -1);
const earth = new Planet(-1 * AUtoKM, 0, 70, "blue", 5.97 * 10e24, "earth", false, 1);
const mars = new Planet(+1.52 * AUtoKM, 0, 50, "red", 6.42 * 10e29, "mars", false, -1);
const PLANETS = [sun, mercury, venus, earth, mars];

// Animation

function movePlanet(planet) {
    const element = document.getElementById(planet.id);
    element.style.top = `${(KMtoBoxels(planet.y) - (planet.diameter * DIA_BOXEL_RATIO / 2) + SHIFT)
        }px`;
    element.style.left = `${(KMtoBoxels(planet.x) - (planet.diameter * DIA_BOXEL_RATIO / 2) + SHIFT)
        }px`;

}

function updatePosition() {
    // Calculate forces
    for (let i = 0; i < PLANETS.length; i++) {
        const planet = PLANETS[i];

        if (planet.isSun) {
            continue;
        }

        // Calculate net force
        const force = planet.getForce(sun);
        const netForceX = force[0];
        const netForceY = force[1];

        // Update velocity
        planet.velocityX += ((netForceX / planet.mass) * TIME_STEP) / 1000; // in km/s
        planet.velocityY += ((netForceY / planet.mass) * TIME_STEP) / 1000; // in km/s

        // Update position
        planet.x += planet.velocityX * TIME_STEP;
        planet.y += planet.velocityY * TIME_STEP;
        movePlanet(planet);
    }
}


// Run simulation
let interval;
function start() {
    try { clearInterval(interval) }
    catch { interval = null }
    interval = setInterval(updatePosition, 1000 / FPS);
}

function stop() {
    clearInterval(interval)
}

start()