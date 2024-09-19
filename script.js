// Get references to DOM elements
const board = document.getElementById('board');
const status = document.getElementById('status');
const resetBtn = document.getElementById('resetBtn');
const boardSizeSelect = document.getElementById('boardSize'); // Get the board size select element

// Initialize game variables
let currentPlayer = 'X';
let gameState = [];
let gameActive = true;
let vsComputer = true;
let aiDifficulty = 'easy';
let boardSize = 3;
let winningConditions = [];
const MAX_DEPTH = 5; // Set a maximum depth for the minimax algorithm

/**
 * Creates the game board based on the current board size.
 */
function createBoard() {
    board.innerHTML = ''; // Clear the board
    gameState = Array(boardSize * boardSize).fill(''); // Initialize game state
    const cellSize = 300 / boardSize; // Calculate cell size based on board size
    
    // Create cells for the board
    for (let i = 0; i < boardSize * boardSize; i++) {
        const cell = document.createElement('div');
        cell.classList.add('cell');
        cell.setAttribute('data-index', i);
        cell.addEventListener('click', handleCellClick);
        cell.style.width = `${cellSize}px`;
        cell.style.height = `${cellSize}px`;
        cell.style.fontSize = `${cellSize * 0.6}px`; // Adjust font size
        board.appendChild(cell);
    }
    
    // Update board style
    board.style.gridTemplateColumns = `repeat(${boardSize}, ${cellSize}px)`;
    board.style.gap = `${cellSize * 0.1}px`; // Adjust gap size
    
    // Update winning conditions
    updateWinningConditions();
    
    // Add event listeners to difficulty buttons
    const difficultyButtons = document.querySelectorAll('.difficulty-btn');
    difficultyButtons.forEach(btn => {
        btn.addEventListener('click', handleDifficultyChange);
    });
}

/**
 * Updates the winning conditions based on the current board size.
 */
function updateWinningConditions() {
    winningConditions = [];
    
    // Rows
    for (let i = 0; i < boardSize; i++) {
        winningConditions.push(Array.from({length: boardSize}, (_, j) => i * boardSize + j));
    }
    
    // Columns
    for (let i = 0; i < boardSize; i++) {
        winningConditions.push(Array.from({length: boardSize}, (_, j) => i + j * boardSize));
    }
    
    // Diagonals
    winningConditions.push(Array.from({length: boardSize}, (_, i) => i * (boardSize + 1)));
    winningConditions.push(Array.from({length: boardSize}, (_, i) => (i + 1) * (boardSize - 1)));
}

/**
 * Handles a cell click event.
 * @param {Event} e - The click event.
 */
function handleCellClick(e) {
    const clickedCell = e.target;
    const cellIndex = parseInt(clickedCell.getAttribute('data-index'));

    // Ignore click if the cell is already filled or the game is not active
    if (gameState[cellIndex] !== '' || !gameActive) return;

    makeMove(cellIndex);

    // If playing against the computer and the game is still active, make the computer move
    if (vsComputer && gameActive) {
        status.textContent = "Computer is thinking...";
        setTimeout(computerMove, 500);
    }
}

/**
 * Handles a change in AI difficulty.
 * @param {Event} e - The click event.
 */
function handleDifficultyChange(e) {
    const buttons = document.querySelectorAll('.difficulty-btn');
    buttons.forEach(btn => btn.classList.remove('active'));
    e.target.classList.add('active');
    aiDifficulty = e.target.getAttribute('data-difficulty');
    resetGame();
}

/**
 * Makes a move for the current player.
 * @param {number} cellIndex - The index of the cell to make a move in.
 */
function makeMove(cellIndex) {
    gameState[cellIndex] = currentPlayer;
    const cell = document.querySelector(`[data-index="${cellIndex}"]`);
    cell.textContent = currentPlayer;
    cell.style.color = currentPlayer === 'X' ? 'red' : 'blue';
    const winner = checkWinner();
    if (winner === currentPlayer) {
        status.textContent = currentPlayer === 'X' ? "You win!" : "Computer wins!";
        gameActive = false;
        highlightWinningCombination();
    } else if (winner === 'tie') {
        status.textContent = "It's a draw!";
        gameActive = false;
    } else {
        currentPlayer = currentPlayer === 'X' ? 'O' : 'X';
        if (!vsComputer || currentPlayer === 'X') {
            status.textContent = `Player ${currentPlayer}'s turn`;
        }
    }
}

/**
 * Makes a move for the computer based on the selected difficulty.
 */
function computerMove() {
    if (gameActive) {
        let bestMove;
        switch (aiDifficulty) {
            case 'easy':
                bestMove = findRandomMove();
                break;
            case 'medium':
                bestMove = Math.random() < 0.5 ? findRandomMove() : findBestMove();
                break;
            case 'hard':
                bestMove = findBestMove();
                break;
        }
        makeMove(bestMove);
    }
}

/**
 * Finds the best move for the computer using the minimax algorithm.
 * @returns {number} The index of the best move.
 */
function findBestMove() {
    let bestScore = -Infinity;
    let bestMove;
    for (let i = 0; i < gameState.length; i++) {
        if (gameState[i] === '') {
            gameState[i] = 'O';
            let score = minimax(gameState, 0, false);
            gameState[i] = '';
            if (score > bestScore) {
                bestScore = score;
                bestMove = i;
            }
        }
    }
    return bestMove;
}

/**
 * Finds a random move for the computer.
 * @returns {number} The index of a random move.
 */
function findRandomMove() {
    const availableMoves = gameState.reduce((acc, cell, index) => {
        if (cell === '') acc.push(index);
        return acc;
    }, []);
    return availableMoves[Math.floor(Math.random() * availableMoves.length)];
}

/**
 * Minimax algorithm to find the best move for the computer.
 * @param {Array} board - The current game state.
 * @param {number} depth - The current depth of the recursion.
 * @param {boolean} isMaximizing - Whether the current move is maximizing or minimizing.
 * @returns {number} The score of the move.
 */
function minimax(board, depth, isMaximizing) {
    let result = checkWinner();
    if (result !== null) {
        return result === 'O' ? 10 - depth : result === 'X' ? depth - 10 : 0;
    }

    if (depth >= MAX_DEPTH) {
        return 0; // Return a neutral score if the maximum depth is reached
    }

    if (isMaximizing) {
        let bestScore = -Infinity;
        for (let i = 0; i < board.length; i++) {
            if (board[i] === '') {
                board[i] = 'O';
                let score = minimax(board, depth + 1, false);
                board[i] = '';
                bestScore = Math.max(score, bestScore);
            }
        }
        return bestScore;
    } else {
        let bestScore = Infinity;
        for (let i = 0; i < board.length; i++) {
            if (board[i] === '') {
                board[i] = 'X';
                let score = minimax(board, depth + 1, true);
                board[i] = '';
                bestScore = Math.min(score, bestScore);
            }
        }
        return bestScore;
    }
}

/**
 * Checks if there is a winner or a tie.
 * @returns {string|null} The winner ('X' or 'O'), 'tie', or null if the game is still ongoing.
 */
function checkWinner() {
    for (let condition of winningConditions) {
        if (condition.every(index => gameState[index] && gameState[index] === gameState[condition[0]])) {
            return gameState[condition[0]];
        }
    }
    if (!gameState.includes('')) return 'tie';
    return null;
}

/**
 * Highlights the winning combination on the board.
 */
function highlightWinningCombination() {
    const winningCombo = winningConditions.find(condition => 
        condition.every(index => gameState[index] && gameState[index] === gameState[condition[0]])
    );

    if (winningCombo) {
        winningCombo.forEach(index => {
            const cell = document.querySelector(`[data-index="${index}"]`);
            cell.style.backgroundColor = 'black';
            cell.style.color = 'white';
        });

        // Flash effect
        let isBlack = true;
        const flashInterval = setInterval(() => {
            winningCombo.forEach(index => {
                const cell = document.querySelector(`[data-index="${index}"]`);
                cell.style.backgroundColor = isBlack ? 'white' : 'black';
                cell.style.color = isBlack ? 'black' : 'white';
            });
            isBlack = !isBlack;
        }, 250);

        // Stop flashing after 2 seconds
        setTimeout(() => {
            clearInterval(flashInterval);
            winningCombo.forEach(index => {
                const cell = document.querySelector(`[data-index="${index}"]`);
                cell.style.backgroundColor = '';
                cell.style.color = gameState[index] === 'X' ? 'red' : 'blue';
            });
        }, 2000);
    }
}

/**
 * Handles a change in board size.
 * @param {Event} e - The change event.
 */
function handleBoardSizeChange(e) {
    boardSize = parseInt(e.target.value);
    resetGame();
}

/**
 * Resets the game to its initial state.
 */
function resetGame() {
    currentPlayer = 'X';
    gameState = Array(boardSize * boardSize).fill('');
    gameActive = true;
    status.textContent = "Your turn";
    createBoard();
    updateWinningConditions();
}

// Ensure the event listener is added only once
boardSizeSelect.removeEventListener('change', handleBoardSizeChange);
boardSizeSelect.addEventListener('change', handleBoardSizeChange);

// Initialize the game
createBoard();
resetBtn.addEventListener('click', resetGame);
status.textContent = "Your turn";