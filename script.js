const board = document.getElementById('board');
const status = document.getElementById('status');
const resetBtn = document.getElementById('resetBtn');
let currentPlayer = 'X';
let gameState = ['', '', '', '', '', '', '', '', ''];
let gameActive = true;
let vsComputer = true;

const winningConditions = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6]
];

function createBoard() {
    for (let i = 0; i < 9; i++) {
        const cell = document.createElement('div');
        cell.classList.add('cell');
        cell.setAttribute('data-index', i);
        cell.addEventListener('click', handleCellClick);
        board.appendChild(cell);
    }
}

function handleCellClick(e) {
    const clickedCell = e.target;
    const cellIndex = parseInt(clickedCell.getAttribute('data-index'));

    if (gameState[cellIndex] !== '' || !gameActive) return;

    makeMove(cellIndex);

    if (vsComputer && gameActive) {
        status.textContent = "Computer is thinking...";
        setTimeout(computerMove, 500);
    }
}

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

function computerMove() {
    if (gameActive) {
        const bestMove = findBestMove();
        makeMove(bestMove);
    }
}

function findBestMove() {
    let bestScore = -Infinity;
    let bestMove;
    for (let i = 0; i < 9; i++) {
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

function minimax(board, depth, isMaximizing) {
    let result = checkWinner();
    if (result !== null) {
        return result === 'O' ? 10 - depth : result === 'X' ? depth - 10 : 0;
    }

    if (isMaximizing) {
        let bestScore = -Infinity;
        for (let i = 0; i < 9; i++) {
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
        for (let i = 0; i < 9; i++) {
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

function checkWinner() {
    for (let i = 0; i < winningConditions.length; i++) {
        const [a, b, c] = winningConditions[i];
        if (gameState[a] && gameState[a] === gameState[b] && gameState[a] === gameState[c]) {
            return gameState[a];
        }
    }
    if (!gameState.includes('')) return 'tie';
    return null;
}

function highlightWinningCombination() {
    const winningCombo = winningConditions.find(([a, b, c]) => 
        gameState[a] && gameState[a] === gameState[b] && gameState[a] === gameState[c]
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

function resetGame() {
    currentPlayer = 'X';
    gameState = ['', '', '', '', '', '', '', '', ''];
    gameActive = true;
    status.textContent = "Your turn";
    document.querySelectorAll('.cell').forEach(cell => {
        cell.textContent = '';
        cell.style.backgroundColor = '';
        cell.style.color = '';
    });
}

createBoard();
resetBtn.addEventListener('click', resetGame);
status.textContent = "Your turn";