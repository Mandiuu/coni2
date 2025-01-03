const words = ["MANDI", "MELI", "FERNI", "MABE", "AHUMI", "CONI", "CARLA", "LONGA", "TITA", "MACA", "FRAN"];
const gridSize = 10;
const gridContainer = document.getElementById("grid-container");
const wordList = document.querySelectorAll("#word-list li");
let grid = [];
let selectedCells = [];
let isSelecting = false;

// Generate empty grid
function generateGrid() {
    for (let i = 0; i < gridSize; i++) {
        grid[i] = [];
        for (let j = 0; j < gridSize; j++) {
            grid[i][j] = { letter: "", usedInWords: [] }; // Track letter and words
        }
    }
}

// Place words in grid
function placeWords() {
    words.forEach((word) => {
        let placed = false;
        while (!placed) {
            const direction = Math.random() > 0.5 ? "horizontal" : "vertical";
            const row = Math.floor(Math.random() * gridSize);
            const col = Math.floor(Math.random() * gridSize);

            if (canPlaceWord(word, row, col, direction)) {
                placeWord(word, row, col, direction);
                placed = true;
            }
        }
    });
}

// Check if word fits
function canPlaceWord(word, row, col, direction) {
    if (direction === "horizontal" && col + word.length > gridSize) return false;
    if (direction === "vertical" && row + word.length > gridSize) return false;

    for (let i = 0; i < word.length; i++) {
        const currentRow = direction === "vertical" ? row + i : row;
        const currentCol = direction === "horizontal" ? col + i : col;

        const cell = grid[currentRow][currentCol];
        if (cell.letter && cell.letter !== word[i] && !cell.usedInWords.includes(word)) {
            return false;
        }
    }
    return true;
}

// Place word in grid
function placeWord(word, row, col, direction) {
    for (let i = 0; i < word.length; i++) {
        const currentRow = direction === "vertical" ? row + i : row;
        const currentCol = direction === "horizontal" ? col + i : col;

        const cell = grid[currentRow][currentCol];
        cell.letter = word[i];
        if (!cell.usedInWords.includes(word)) {
            cell.usedInWords.push(word); // Track word usage
        }
    }
}

// Fill remaining cells with random letters
function fillRandomLetters() {
    const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    for (let i = 0; i < gridSize; i++) {
        for (let j = 0; j < gridSize; j++) {
            if (!grid[i][j].letter) {
                grid[i][j].letter = alphabet[Math.floor(Math.random() * alphabet.length)];
            }
        }
    }
}

// Render grid
function renderGrid() {
    gridContainer.innerHTML = "";
    grid.forEach((row, rowIndex) => {
        row.forEach((cell, colIndex) => {
            const div = document.createElement("div");
            div.classList.add("grid-cell");
            div.textContent = cell.letter;
            div.dataset.row = rowIndex;
            div.dataset.col = colIndex;

            // Add touch/mouse listeners
            div.addEventListener("mousedown", (e) => startSelection(e, rowIndex, colIndex));
            div.addEventListener("mouseenter", (e) => extendSelection(e, rowIndex, colIndex));
            div.addEventListener("touchstart", (e) => handleTouchStart(e, rowIndex, colIndex));
            div.addEventListener("touchmove", (e) => handleTouchMove(e));

            gridContainer.appendChild(div);
        });
    });

    // Add global listeners
    document.addEventListener("mouseup", () => handleSelectionEnd());
    document.addEventListener("touchend", () => handleSelectionEnd());
}

// Start selecting cells
function startSelection(e, row, col) {
    e.preventDefault();
    isSelecting = true;
    selectedCells = [];
    highlightCell(row, col);
}

// Extend selection as the mouse moves
function extendSelection(e, row, col) {
    if (isSelecting) {
        highlightCell(row, col);
    }
}

// Handle touch start
function handleTouchStart(e, row, col) {
    e.preventDefault();
    const touch = e.touches[0];
    const target = document.elementFromPoint(touch.clientX, touch.clientY);
    if (target && target.dataset.row && target.dataset.col) {
        startSelection(e, parseInt(target.dataset.row), parseInt(target.dataset.col));
    }
}

// Handle touch move
function handleTouchMove(e) {
    const touch = e.touches[0];
    const target = document.elementFromPoint(touch.clientX, touch.clientY);
    if (target && target.dataset.row && target.dataset.col) {
        extendSelection(e, parseInt(target.dataset.row), parseInt(target.dataset.col));
    }
}

// Highlight a cell
function highlightCell(row, col) {
    const cell = document.querySelector(`[data-row='${row}'][data-col='${col}']`);
    if (cell && !cell.classList.contains("selected")) {
        cell.classList.add("selected");
        selectedCells.push({ row, col });
    }
}

// Handle selection end
function handleSelectionEnd() {
    if (isSelecting) {
        checkSelection();
        isSelecting = false;
    }
}

// Check if the selected cells form a word
function checkSelection() {
    const selectedWord = selectedCells
        .map(({ row, col }) => grid[row][col].letter)
        .join("");

    if (words.includes(selectedWord)) {
        selectedCells.forEach(({ row, col }) => {
            const cell = document.querySelector(`[data-row='${row}'][data-col='${col}']`);
            cell.classList.add("found");
        });

        // Mark the word as found in the word list
        wordList.forEach((li) => {
            if (li.textContent.toUpperCase() === selectedWord) {
                li.classList.add("found");
            }
        });

        // Check if all words are found
        const allWordsFound = Array.from(wordList).every((li) => li.classList.contains("found"));
        if (allWordsFound) {
            triggerConfetti(); // Launch confetti
        }
    } else {
        // Deselect invalid selections
        selectedCells.forEach(({ row, col }) => {
            const cell = document.querySelector(`[data-row='${row}'][data-col='${col}']`);
            cell.classList.remove("selected");
        });
    }

    // Clear selectedCells array
    selectedCells = [];
}

// Confetti function
function triggerConfetti() {
    confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
    });
}

// Initialize game
function init() {
    generateGrid();
    placeWords();
    fillRandomLetters();
    renderGrid();
}

init();
