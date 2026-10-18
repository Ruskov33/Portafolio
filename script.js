const kirby = document.querySelector("#kirby");
const sprite = document.querySelector("#kirby-sprite");

const SIZE = 64;
const GRAVITY = 1500;
const JUMP = 550;
const SPEED = 260;
const FLY_SPEED = -150;

const walkFrames = ["kirby_walk_0", "kirby_walk_1", "kirby_walk_2", "kirby_walk_3"];
const flyFrames = ["kirby_fly_2", "kirby_fly_3"];

for (const name of [...walkFrames, ...flyFrames, "kirby_idle", "kirby_falling"]) {
    new Image().src = `sprites/${name}.png`;
}

const viewW = () => document.documentElement.clientWidth;
const viewH = () => document.documentElement.clientHeight;

let x = viewW() - SIZE;
let y = viewH() - SIZE;
let vy = 0;
let facing = -1;
let onGround = true;
let flying = false;
let timer = 0;

const keys = {};

window.addEventListener("keydown", (e) => {
    const key = e.key.toLowerCase();

    if (key === "a" || key === "d" || key === " ") e.preventDefault();

    keys[key] = true;

    if (e.repeat || key !== " ") return;

    if (onGround) {
        vy = -JUMP;
        onGround = false;
    } else {
        flying = true;
    }
});

window.addEventListener("keyup", (e) => {
    const key = e.key.toLowerCase();
    keys[key] = false;
    if (key === " ") flying = false;
});

window.addEventListener("blur", () => {
    keys.a = false;
    keys.d = false;
    flying = false;
});

let currentSprite = "";

let dragging = false;
let grabX = 0;
let grabY = 0;
let lastPX = 0;

kirby.addEventListener("pointerdown", (e) => {
    dragging = true;
    grabX = e.clientX - x;
    grabY = e.clientY - y;
    lastPX = e.clientX;
    vy = 0;
    flying = false;
    kirby.setPointerCapture(e.pointerId);
    e.preventDefault();
});

kirby.addEventListener("pointermove", (e) => {
    if (!dragging) return;
    x = Math.max(0, Math.min(e.clientX - grabX, viewW() - SIZE));
    y = Math.max(0, Math.min(e.clientY - grabY, viewH() - SIZE));
    if (Math.abs(e.clientX - lastPX) > 2) {
        facing = e.clientX > lastPX ? 1 : -1;
        lastPX = e.clientX;
    }
});

const drop = () => { dragging = false; };
kirby.addEventListener("pointerup", drop);
kirby.addEventListener("pointercancel", drop);
kirby.addEventListener("contextmenu", (e) => e.preventDefault());

function setSprite(name) {
    if (name === currentSprite) return;
    currentSprite = name;
    sprite.src = `sprites/${name}.png`;
}

function update(dt) {
    if (dragging) {
        setSprite("kirby_falling");
        return;
    }

    const floor = viewH() - SIZE;
    const maxX = viewW() - SIZE;

    let direction = 0;
    if (keys.a) direction = -1;
    if (keys.d) direction = 1;

    if (direction !== 0) facing = direction;

    x = x + direction * SPEED * dt;
    x = Math.max(0, Math.min(x, maxX));

    if (flying) {
        vy = FLY_SPEED;
    } else {
        vy = vy + GRAVITY * dt;
    }

    y = y + vy * dt;

    if (y < 0) {
        y = 0;
        vy = 0;
    }

    if (y >= floor) {
        y = floor;
        vy = 0;
        onGround = true;
        flying = false;
    } else {
        onGround = false;
    }

    timer = timer + dt;

    if (flying) {
        setSprite(flyFrames[Math.floor(timer * 10) % flyFrames.length]);
    } else if (!onGround) {
        setSprite("kirby_falling");
    } else if (direction !== 0) {
        setSprite(walkFrames[Math.floor(timer * 12) % walkFrames.length]);
    } else {
        setSprite("kirby_idle");
    }
}

let previous = performance.now();

function loop(now) {
    const dt = Math.min((now - previous) / 1000, 0.033);
    previous = now;

    update(dt);

    kirby.style.transform = `translate3d(${x}px, ${y}px, 0)`;
    sprite.style.transform = `scaleX(${facing})`;

    requestAnimationFrame(loop);
}

requestAnimationFrame(loop);