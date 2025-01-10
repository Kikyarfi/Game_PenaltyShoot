const ball = document.getElementById('ball');
const goalkeeper = document.getElementById('goalkeeper');
const notification = document.getElementById('notification');
const goalSound = document.getElementById('goalSound');
const missSound = document.getElementById('missSound');
const gameOverSound = document.getElementById('gameOverSound');
const gameWin = document.getElementById('gameWin');

const urlParams = new URLSearchParams(window.location.search);
const uniqueCodeFromUrl = urlParams.get('uniquecode');
localStorage.setItem('uniqueCode', uniqueCodeFromUrl);

let startX = 0;
let isDragging = false;
let dragDistance = 0;
let shoot = 0;
let goals = 0;
let maxShots = 5; // Maximum number of shots
let lives = 5; // Start with 5 lives
let isTouch = false; // To detect touch devices
let isShooting = false; // New variable to track shooting state

// Debouncing variables
let lastTap = 0;
const debounceDelay = 300;  // Delay in milliseconds

// Event listeners for both mouse and touch events
ball.addEventListener('mousedown', (e) => {
    if (!isTouch) {
        handleTap(e.clientX);
    }
});
ball.addEventListener('touchstart', (e) => {
    isTouch = true;
    handleTap(e.touches[0].clientX);
});

document.addEventListener('mousemove', (e) => {
    if (isDragging) {
        dragBall(e.clientX);
    }
});
document.addEventListener('touchmove', (e) => {
    if (isDragging) {
        dragBall(e.touches[0].clientX);
    }
});

document.addEventListener('mouseup', endDrag);
document.addEventListener('touchend', endDrag);

// Button event listeners
const leftBtn = document.getElementById('leftBtn');
const centerBtn = document.getElementById('centerBtn');
const rightBtn = document.getElementById('rightBtn');

leftBtn.addEventListener('click', () => shootBall('left'));
centerBtn.addEventListener('click', () => shootBall('center'));
rightBtn.addEventListener('click', () => shootBall('right'));

function handleTap(x) {
    const currentTime = new Date().getTime();
    const tapInterval = currentTime - lastTap;

    if (tapInterval < debounceDelay) {
        return; // Ignore the second tap
    }

    lastTap = currentTime;
    startDrag(x);
}

function startDrag(x) {
    isDragging = true;
    startX = x;
    ball.classList.add('active');
    ball.style.transition = 'none';
}

function dragBall(currentX) {
    if (!isDragging) return;

    const deltaX = currentX - startX;
    dragDistance = Math.min(Math.max(-150, deltaX), 150);
}

function endDrag() {
    if (!isDragging) return;
    isDragging = false;
    ball.classList.remove('active');

    let direction = 'center';
    if (dragDistance < -50) {
        direction = 'left';
    } else if (dragDistance > 50) {
        direction = 'right';
    }

    shootBall(direction);

    dragDistance = 0;
}

function shootBall(direction) {
    if (isShooting) return; // Prevent shooting if already in motion
    isShooting = true; // Set to true while the ball is in motion

    let moveX;
    let moveY = '-200px';
    shoot++;

    switch (direction) {
        case 'left':
            moveX = '-75px';
            break;
        case 'center':
            moveX = '0px';
            break;
        case 'right':
            moveX = '75px';
            break;
    }

    ball.style.transition = 'transform 0.7s ease';
    ball.style.transform = `translate(${moveX}, ${moveY})`;

    const goalkeeperPosition = moveGoalkeeperRandom();

    setTimeout(() => {
        const isGoal = (moveX === '0px' && goalkeeperPosition === '75px') ||
                       (moveX === '0px' && goalkeeperPosition === '-75px') ||
                       (moveX === '-75px' && goalkeeperPosition === '0px') ||
                       (moveX === '75px' && goalkeeperPosition === '0px') ||
                       (moveX === '-75px' && goalkeeperPosition === '75px') ||
                       (moveX === '75px' && goalkeeperPosition === '-75px');

        if (isGoal) {
            goals++;
            showNotification("GOAL!");
            document.querySelector(`.nyawa > img:nth-child(${shoot})`).style.opacity = 1;
            goalSound.play(); // Play goal sound

            // Check if scored 3 goals
            if (goals >= 3) {
                gameWin.play();
                setTimeout(() => {
                    localStorage.setItem('gameStatus', 'win');
                    showNotification("YOU WIN!");
                    window.location.href = "hadiah.html"; // Change to victory page URL
                }, 1000);
                return; // Exit function to prevent further processing
            }
        } else {
            lives--;
            showNotification("Caught by the Keeper!");
            missSound.play(); // Play miss sound
        }

        // Check if reached maximum shots
        if (shoot >= maxShots) {
            if (goals < 3) {
                gameOverSound.play(); // Play game over sound
                setTimeout(() => {
                    localStorage.setItem('gameStatus', 'lose'); // Save game status as lose
                    showNotification("YOU LOSE!");
                    window.location.href = "hadiah.html"; // Change to loss page URL
                }, 1000);
            }
        }

        resetPositions();
        isShooting = false; // Reset shooting state after the ball animation completes
    }, 1000);
}

function moveGoalkeeperRandom() {
    const randomPosition = Math.floor(Math.random() * 3);
    let goalkeeperPosition;

    switch (randomPosition) {
        case 0:
            goalkeeperPosition = '-75px';
            break;
        case 1:
            goalkeeperPosition = '0px';
            break;
        case 2:
            goalkeeperPosition = '75px';
            break;
    }

    goalkeeper.style.transform = `translateX(${goalkeeperPosition})`;
    return goalkeeperPosition;
}

function showNotification(message) {
    notification.innerText = message;
    notification.style.display = 'block';
    setTimeout(() => {
        notification.style.display = 'none';
    }, 2000);
}

function resetPositions() {
    // Ensures the ball always resets its position after every shot
    ball.style.transition = 'transform 0.7s ease';
    ball.style.transform = 'translateX(0px) translateY(0px)';
    goalkeeper.style.transform = 'translateX(0px)';
}

function resetGame() {
    goals = 0;
    shoot = 0;
    lives = 5;

    document.querySelectorAll('.nyawa > img').forEach(img => {
        img.style.opacity = 0.2;
    });

    resetPositions();
}
