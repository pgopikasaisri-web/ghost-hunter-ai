// ==========================================
// GHOST HUNTER AI
// A* PATHFINDING + FINITE STATE MACHINE
// ==========================================

const SIZE = 15;

const gameBoard = document.getElementById("gameBoard");
const livesElement = document.getElementById("lives");
const scoreElement = document.getElementById("score");
const timerElement = document.getElementById("timer");
const aiStatusElement = document.getElementById("aiStatus");
const aiMessageElement = document.getElementById("aiMessage");

// ------------------------------------------
// GAME VARIABLES
// ------------------------------------------

let player = {
    row: 1,
    col: 1
};

let exit = {
    row: 13,
    col: 13
};

let ghosts = [
    {
        row: 13,
        col: 1,
        state: "PATROL",
        lastPlayerPosition: null
    },
    {
        row: 1,
        col: 13,
        state: "PATROL",
        lastPlayerPosition: null
    }
];

let souls = [];

let lives = 3;
let score = 0;
let timeLeft = 60;

let gameRunning = false;
let gameTimer = null;
let ghostTimer = null;

// ------------------------------------------
// MAZE
// 0 = path
// 1 = wall
// ------------------------------------------

const maze = [
    [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],

    [1,0,0,0,0,0,1,0,0,0,0,0,0,0,1],

    [1,0,1,1,1,0,1,0,1,1,1,1,1,0,1],

    [1,0,1,0,0,0,0,0,0,0,0,0,1,0,1],

    [1,0,1,0,1,1,1,1,1,1,1,0,1,0,1],

    [1,0,0,0,1,0,0,0,0,0,1,0,0,0,1],

    [1,1,1,0,1,0,1,1,1,0,1,1,1,0,1],

    [1,0,0,0,0,0,1,0,0,0,0,0,1,0,1],

    [1,0,1,1,1,1,1,0,1,1,1,0,1,0,1],

    [1,0,1,0,0,0,0,0,1,0,0,0,1,0,1],

    [1,0,1,0,1,1,1,1,1,0,1,0,1,0,1],

    [1,0,0,0,1,0,0,0,0,0,1,0,0,0,1],

    [1,1,1,0,1,0,1,1,1,1,1,1,1,0,1],

    [1,0,0,0,0,0,0,0,0,0,0,0,0,0,1],

    [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1]
];

// ------------------------------------------
// CREATE SOULS
// ------------------------------------------

function createSouls() {

    souls = [
        { row: 3, col: 3 },
        { row: 3, col: 9 },
        { row: 5, col: 7 },
        { row: 7, col: 5 },
        { row: 9, col: 5 },
        { row: 11, col: 7 },
        { row: 13, col: 11 }
    ];
}

// ------------------------------------------
// DRAW GAME BOARD
// ------------------------------------------

function drawBoard() {

    gameBoard.innerHTML = "";

    for (let row = 0; row < SIZE; row++) {

        for (let col = 0; col < SIZE; col++) {

            const cell = document.createElement("div");

            cell.classList.add("cell");

            // Wall
            if (maze[row][col] === 1) {
                cell.classList.add("wall");
                cell.textContent = "🧱";
            }

            // Player
            if (
                player.row === row &&
                player.col === col
            ) {
                cell.classList.add("player");
                cell.textContent = "🧍";
            }

            // Exit
            if (
                exit.row === row &&
                exit.col === col
            ) {
                cell.classList.add("exit");
                cell.textContent = "🚪";
            }

            // Souls
            const soulExists = souls.some(
                soul =>
                    soul.row === row &&
                    soul.col === col
            );

            if (soulExists) {
                cell.classList.add("soul");
                cell.textContent = "💎";
            }

            // Ghosts
            ghosts.forEach((ghost, index) => {

                if (
                    ghost.row === row &&
                    ghost.col === col
                ) {

                    cell.classList.remove("player");

                    cell.classList.add("ghost");

                    cell.textContent =
                        index === 0 ? "👻" : "👹";
                }

            });

            gameBoard.appendChild(cell);
        }
    }

    updateUI();
}

// ------------------------------------------
// UI UPDATE
// ------------------------------------------

function updateUI() {

    livesElement.textContent = lives;
    scoreElement.textContent = score;
    timerElement.textContent = timeLeft;

    if (ghosts.length > 0) {
        aiStatusElement.textContent =
            ghosts[0].state;
    }
}

// ------------------------------------------
// START GAME
// ------------------------------------------

function startGame() {

    if (gameRunning) return;

    gameRunning = true;

    createSouls();

    aiMessageElement.textContent =
        "AI activated. Ghosts are analyzing your position...";

    gameTimer = setInterval(() => {

        if (!gameRunning) return;

        timeLeft--;

        timerElement.textContent = timeLeft;

        if (timeLeft <= 0) {
            gameOver("⏰ Time's Up!");
        }

    }, 1000);

    ghostTimer = setInterval(() => {

        if (gameRunning) {
            moveGhosts();
        }

    }, 650);

    drawBoard();
}

// ------------------------------------------
// RESTART GAME
// ------------------------------------------

function restartGame() {

    clearInterval(gameTimer);
    clearInterval(ghostTimer);

    player = {
        row: 1,
        col: 1
    };

    ghosts = [
        {
            row: 13,
            col: 1,
            state: "PATROL",
            lastPlayerPosition: null
        },
        {
            row: 1,
            col: 13,
            state: "PATROL",
            lastPlayerPosition: null
        }
    ];

    lives = 3;
    score = 0;
    timeLeft = 60;

    gameRunning = false;

    createSouls();

    aiStatusElement.textContent = "IDLE";

    aiMessageElement.textContent =
        "AI is waiting for the player...";

    drawBoard();
}

// ------------------------------------------
// PLAYER MOVEMENT
// ------------------------------------------

document.addEventListener("keydown", function(event) {

    if (!gameRunning) return;

    let newRow = player.row;
    let newCol = player.col;

    if (event.key === "ArrowUp") {
        newRow--;
    }

    if (event.key === "ArrowDown") {
        newRow++;
    }

    if (event.key === "ArrowLeft") {
        newCol--;
    }

    if (event.key === "ArrowRight") {
        newCol++;
    }

    // Check valid position
    if (isWalkable(newRow, newCol)) {

        player.row = newRow;
        player.col = newCol;

        collectSoul();

        checkGhostCollision();

        checkExit();

        drawBoard();
    }
});

// ------------------------------------------
// CHECK WALKABLE
// ------------------------------------------

function isWalkable(row, col) {

    if (
        row < 0 ||
        row >= SIZE ||
        col < 0 ||
        col >= SIZE
    ) {
        return false;
    }

    return maze[row][col] === 0;
}

// ------------------------------------------
// COLLECT SOUL
// ------------------------------------------

function collectSoul() {

    const index = souls.findIndex(
        soul =>
            soul.row === player.row &&
            soul.col === player.col
    );

    if (index !== -1) {

        souls.splice(index, 1);

        score += 10;

        aiMessageElement.textContent =
            "💎 Soul collected! AI is tracking your new position.";

    }
}

// ------------------------------------------
// CHECK EXIT
// ------------------------------------------

function checkExit() {

    if (
        player.row === exit.row &&
        player.col === exit.col
    ) {

        if (souls.length === 0) {

            gameWin();

        } else {

            aiMessageElement.textContent =
                "🚪 Exit found! Collect all souls first.";

        }
    }
}

// ------------------------------------------
// GHOST AI
// ------------------------------------------

function moveGhosts() {

    ghosts.forEach((ghost, index) => {

        const distance =
            manhattanDistance(
                ghost.row,
                ghost.col,
                player.row,
                player.col
            );

        // ----------------------------------
        // FINITE STATE MACHINE
        // ----------------------------------

        if (distance <= 7) {

            ghost.state = "CHASE";

        } else if (distance <= 11) {

            ghost.state = "SEARCH";

        } else {

            ghost.state = "PATROL";
        }

        // ----------------------------------
        // CHASE STATE
        // ----------------------------------

        if (ghost.state === "CHASE") {

            const path =
                aStar(
                    ghost,
                    player
                );

            if (path.length > 1) {

                const nextStep = path[1];

                ghost.row = nextStep.row;
                ghost.col = nextStep.col;
            }

            aiStatusElement.textContent = "CHASE";

            aiMessageElement.textContent =
                "👻 AI detected you! A* is calculating the shortest path...";

        }

        // ----------------------------------
        // SEARCH STATE
        // ----------------------------------

        else if (ghost.state === "SEARCH") {

            const path =
                aStar(
                    ghost,
                    {
                        row: player.row,
                        col: player.col
                    }
                );

            if (path.length > 1) {

                const nextStep = path[1];

                ghost.row = nextStep.row;
                ghost.col = nextStep.col;
            }

            aiStatusElement.textContent = "SEARCH";

            aiMessageElement.textContent =
                "🔎 AI is searching for your location...";
        }

        // ----------------------------------
        // PATROL STATE
        // ----------------------------------

        else {

            const directions = [
                { row: 1, col: 0 },
                { row: -1, col: 0 },
                { row: 0, col: 1 },
                { row: 0, col: -1 }
            ];

            const possibleMoves =
                directions.filter(move =>
                    isWalkable(
                        ghost.row + move.row,
                        ghost.col + move.col
                    )
                );

            if (possibleMoves.length > 0) {

                const randomMove =
                    possibleMoves[
                        Math.floor(
                            Math.random() *
                            possibleMoves.length
                        )
                    ];

                ghost.row += randomMove.row;
                ghost.col += randomMove.col;
            }

            aiStatusElement.textContent = "PATROL";

            aiMessageElement.textContent =
                "👻 Ghost AI is patrolling the maze...";
        }

    });

    checkGhostCollision();

    drawBoard();
}

// ------------------------------------------
// A* PATHFINDING ALGORITHM
// ------------------------------------------

function aStar(start, target) {

    const openList = [];

    const closedList = new Set();

    const startNode = {

        row: start.row,
        col: start.col,

        g: 0,

        h: heuristic(
            start,
            target
        ),

        parent: null
    };

    startNode.f =
        startNode.g +
        startNode.h;

    openList.push(startNode);

    while (openList.length > 0) {

        // Find lowest F score
        let currentIndex = 0;

        for (
            let i = 1;
            i < openList.length;
            i++
        ) {

            if (
                openList[i].f <
                openList[currentIndex].f
            ) {

                currentIndex = i;

            }

        }

        const current =
            openList.splice(
                currentIndex,
                1
            )[0];

        const currentKey =
            `${current.row},${current.col}`;

        closedList.add(currentKey);

        // Target reached
        if (
            current.row === target.row &&
            current.col === target.col
        ) {

            return reconstructPath(current);
        }

        const neighbors = [
            { row: 1, col: 0 },
            { row: -1, col: 0 },
            { row: 0, col: 1 },
            { row: 0, col: -1 }
        ];

        for (const direction of neighbors) {

            const newRow =
                current.row +
                direction.row;

            const newCol =
                current.col +
                direction.col;

            if (!isWalkable(newRow, newCol)) {
                continue;
            }

            const neighborKey =
                `${newRow},${newCol}`;

            if (closedList.has(neighborKey)) {
                continue;
            }

            const newG =
                current.g + 1;

            let existing =
                openList.find(
                    node =>
                        node.row === newRow &&
                        node.col === newCol
                );

            if (!existing) {

                existing = {

                    row: newRow,
                    col: newCol,

                    g: newG,

                    h: heuristic(
                        {
                            row: newRow,
                            col: newCol
                        },
                        target
                    ),

                    parent: current
                };

                existing.f =
                    existing.g +
                    existing.h;

                openList.push(existing);

            } else if (newG < existing.g) {

                existing.g = newG;

                existing.f =
                    existing.g +
                    existing.h;

                existing.parent = current;
            }
        }
    }

    return [];
}

// ------------------------------------------
// A* HEURISTIC
// ------------------------------------------

function heuristic(a, b) {

    return Math.abs(a.row - b.row) +
           Math.abs(a.col - b.col);
}

// ------------------------------------------
// RECONSTRUCT A* PATH
// ------------------------------------------

function reconstructPath(node) {

    const path = [];

    let current = node;

    while (current !== null) {

        path.unshift({
            row: current.row,
            col: current.col
        });

        current = current.parent;
    }

    return path;
}

// ------------------------------------------
// DISTANCE
// ------------------------------------------

function manhattanDistance(
    row1,
    col1,
    row2,
    col2
) {

    return Math.abs(row1 - row2) +
           Math.abs(col1 - col2);
}

// ------------------------------------------
// GHOST COLLISION
// ------------------------------------------

function checkGhostCollision() {

    ghosts.forEach(ghost => {

        if (
            ghost.row === player.row &&
            ghost.col === player.col
        ) {

            lives--;

            livesElement.textContent = lives;

            aiMessageElement.textContent =
                "👻 Ghost caught you!";

            // Reset player
            player = {
                row: 1,
                col: 1
            };

            if (lives <= 0) {

                gameOver(
                    "👻 The ghosts caught you!"
                );
            }
        }
    });
}

// ------------------------------------------
// GAME WIN
// ------------------------------------------

function gameWin() {

    gameRunning = false;

    clearInterval(gameTimer);
    clearInterval(ghostTimer);

    aiStatusElement.textContent = "WIN";

    aiMessageElement.textContent =
        "🏆 Amazing! You escaped the haunted maze!";

    setTimeout(() => {

        alert(
            "🎉 YOU WIN!\n\n" +
            "Score: " + score +
            "\nSouls Collected: " +
            (7 - souls.length)
        );

    }, 100);
}

// ------------------------------------------
// GAME OVER
// ------------------------------------------

function gameOver(message) {

    gameRunning = false;

    clearInterval(gameTimer);
    clearInterval(ghostTimer);

    aiStatusElement.textContent = "GAME OVER";

    aiMessageElement.textContent =
        message;

    setTimeout(() => {

        alert(
            message +
            "\n\nFinal Score: " +
            score
        );

    }, 100);
}

// ------------------------------------------
// INITIAL DRAW
// ------------------------------------------

createSouls();

drawBoard();
