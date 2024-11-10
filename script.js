const player = document.getElementById("player");
const computer = document.getElementById("computer");
const playerHitCountEl = document.getElementById("playerHitCount");
const computerHitCountEl = document.getElementById("computerHitCount");

let playerPos = 100;
let computerPos = 600;
let playerHits = 0;
let computerHits = 0;
const moveSpeed = 2; // Normal movement speed
const flickSpeed = moveSpeed * 4; // Flick distance (4x normal movement speed)
const jumpHeight = 100;
let isJumping = false;
let computerIsJumping = false;
const keys = {};
let computerDirection = -1; // -1 for left, 1 for right
let isComputerAttacking = false;
let canAttack = true; // Track if the player can attack

// Track key presses for simultaneous actions
document.addEventListener("keydown", (e) => {
  keys[e.key.toLowerCase()] = true;
  if (e.key.toLowerCase() === "s") {
    checkCollision(); // Check for collision when 'S' is pressed
  }
});

document.addEventListener("keyup", (e) => {
  keys[e.key.toLowerCase()] = false;
});

// Smooth movement with continuous animation
function animate() {
  let moveDirection = 0;

  // Handle movement keys (left and right)
  if (keys["d"]) {
    moveDirection = moveSpeed; // Move right
  } else if (keys["a"]) {
    moveDirection = -moveSpeed; // Move left
  }

  // If Shift key is pressed, apply flick movement
  if (keys["shift"]) {
    if (moveDirection !== 0) {
      moveDirection = moveDirection * 4; // Apply flick speed (4x normal movement)
      performFlick(); // Perform flick and check for opponent damage
    }
  }

  if ((keys[" "] || keys["w"]) && !isJumping) {
    jump(moveDirection); // Jump diagonally if moving
  } else {
    playerPos = Math.max(0, Math.min(playerPos + moveDirection, 750));
  }

  computerLogic(); // Control computer's movements and actions

  updatePositions();
  requestAnimationFrame(animate); // Keep the animation loop running
}

// Make player jump with smooth diagonal movement
function jump(moveDirection = 0) {
  isJumping = true;
  let jumpProgress = 0;

  const jumpInterval = setInterval(() => {
    jumpProgress += 2;
    const jumpOffset = jumpHeight * Math.sin((Math.PI * jumpProgress) / 100); // Smooth arc

    playerPos += moveDirection;
    player.style.left = `${Math.max(0, Math.min(playerPos, 750))}px`;
    player.style.bottom = `${jumpOffset}px`;

    if (jumpProgress >= 100) {
      clearInterval(jumpInterval);
      player.style.bottom = "0px";
      isJumping = false;
    }
  }, 10); // Update every 10ms for smoothness
}

// Apply the hit effect to an element
function applyHitEffect(element) {
  element.classList.add("hit-effect");
  setTimeout(() => {
    element.classList.remove("hit-effect");
  }, 200); // Effect lasts for 200ms
}

// Perform flick action and check for opponent damage
function performFlick() {
  const startX = playerPos; // Starting position of the flick
  const endX = playerPos + flickSpeed; // End position of the flick

  // Check if the opponent is on the ground and within the flick path
  if (
    ((startX < computerPos && computerPos <= endX) ||
      (endX < startX && computerPos >= endX && computerPos <= startX)) &&
    !computerIsJumping // Ensure the computer is not in the air
  ) {
    playerHits += 2;
    updateHitCount();
    applyHitEffect(computer); // Apply the hit effect to the computer

    if (playerHits >= 10) {
      alert("Player wins!");
      resetGame();
    }
  }
}

// Collision detection for when "S" key is pressed
function checkCollision() {
  if (!canAttack) return; // If cooldown is active, ignore attack

  const playerRect = player.getBoundingClientRect();
  const computerRect = computer.getBoundingClientRect();

  // Check if the player and computer are close enough to count as a hit
  if (
    playerRect.right > computerRect.left &&
    playerRect.left < computerRect.right &&
    Math.abs(playerRect.bottom - computerRect.bottom) < 20 // Ensure both are on the same level
  ) {
    playerHits++;
    updateHitCount();
    applyHitEffect(computer); // Apply the hit effect to the computer

    if (playerHits >= 10) {
      alert("Player wins!");
      resetGame();
    }
    // Trigger cooldown
    canAttack = false;
    setTimeout(() => {
      canAttack = true; // Reset cooldown after 1 second
    }, 1000);
  }
}

// Update hit counters
function updateHitCount() {
  playerHitCountEl.textContent = `Player Hits: ${playerHits}`;
  computerHitCountEl.textContent = `Computer Hits: ${computerHits}`;
}

// Update positions
function updatePositions() {
  player.style.left = `${playerPos}px`;
  computer.style.left = `${computerPos}px`;
}

// Control computer's movements and actions
function computerLogic() {
  const distanceToPlayer = Math.abs(playerPos - computerPos);

  if (distanceToPlayer < 100 && !computerIsJumping) {
    // Attack if close enough and on the ground
    if (!isComputerAttacking) {
      isComputerAttacking = true;
      setTimeout(() => {
        const playerRect = player.getBoundingClientRect();
        const computerRect = computer.getBoundingClientRect();

        // Check if computer is actually touching the player
        if (
          computerRect.right > playerRect.left &&
          computerRect.left < playerRect.right &&
          Math.abs(computerRect.bottom - playerRect.bottom) < 20 // Ensure both are on the same level
        ) {
          computerHits++;
          updateHitCount();
          applyHitEffect(player); // Apply the hit effect to the player

          if (computerHits >= 10) {
            alert("Computer wins!");
            resetGame();
          }
        }
        isComputerAttacking = false;
      }, 500);
    }
  } else {
    // Move closer to player when not attacking
    if (playerPos > computerPos) {
      computerPos += moveSpeed;
    } else {
      computerPos -= moveSpeed;
    }
  }

  // Randomly jump or change direction
  if (Math.random() < 0.01 && !computerIsJumping) {
    computerJump();
  }
  if (Math.random() < 0.01) {
    computerDirection *= -1;
  }

  computerPos = Math.max(0, Math.min(computerPos, 750));
}

// Make computer jump
function computerJump() {
  computerIsJumping = true;
  let jumpProgress = 0;
  const jumpInterval = setInterval(() => {
    jumpProgress += 2;
    const jumpOffset = jumpHeight * Math.sin((Math.PI * jumpProgress) / 100); // Smooth arc
    computer.style.bottom = `${jumpOffset}px`;
    if (jumpProgress >= 100) {
      clearInterval(jumpInterval);
      computer.style.bottom = "0px";
      computerIsJumping = false;
    }
  }, 10); // Update every 10ms for smoothness
}

function resetGame() {
  playerHits = 0;
  computerHits = 0;
  playerPos = 100;
  computerPos = 600;
  updatePositions();
  updateHitCount();
  location.reload();
}

// Start the animation loop
animate();
// perfect sayan
