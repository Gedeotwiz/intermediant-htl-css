
function Person(name) {
    this.name = name;
}

Person.prototype.sayName = function () {
    return this.name;
};

function Player(name, marker) {
    Person.call(this, name);

    this.marker = marker;
}
Object.setPrototypeOf(Player.prototype, Person.prototype);

Player.prototype.getMarker = function () {
    return this.marker;
};

const player1 = new Player("Gedeon", "X");
const player2 = new Player("Gad", "O");


function TicTacToe(player1, player2) {
    this.players = [player1, player2];
    this.board = ["", "", "", "", "", "", "", "", ""];
    this.currentPlayerIndex = 0;
    this.gameActive = true;

    this.winningCombinations = [
        [0, 1, 2],
        [3, 4, 5],
        [6, 7, 8],
        [0, 3, 6],
        [1, 4, 7],
        [2, 5, 8],
        [0, 4, 8],
        [2, 4, 6]
    ];
}

TicTacToe.prototype.getCurrentPlayer = function () {
    return this.players[this.currentPlayerIndex];
};
TicTacToe.prototype.switchPlayer = function () {
    this.currentPlayerIndex = this.currentPlayerIndex === 0 ? 1 : 0;
};
TicTacToe.prototype.checkWinner = function () {
    const marker = this.getCurrentPlayer().getMarker();

    return this.winningCombinations.some(combination => {
        const [a, b, c] = combination;

        return (
            this.board[a] === marker &&
            this.board[b] === marker &&
            this.board[c] === marker
        );
    });
};
TicTacToe.prototype.isDraw = function () {
    return this.board.every(cell => cell !== "");
};
TicTacToe.prototype.playMove = function (index) {
    if (!this.gameActive || this.board[index] !== "") {
        return;
    }

    const player = this.getCurrentPlayer();

    this.board[index] = player.getMarker();

    if (this.checkWinner()) {
        this.gameActive = false;

        return {
            type: "winner",
            player: player
        };
    }

    if (this.isDraw()) {
        this.gameActive = false;

        return {
            type: "draw"
        };
    }

    this.switchPlayer();

    return {
        type: "continue",
        player: this.getCurrentPlayer()
    };
};
TicTacToe.prototype.restart = function () {
    this.board = ["", "", "", "", "", "", "", "", ""];
    this.currentPlayerIndex = 0;
    this.gameActive = true;
};

const cells = document.querySelectorAll(".cell");
const statusText = document.querySelector("#status");
const restartBtn = document.querySelector("#restart-btn");

const game = new TicTacToe(player1, player2);

function updateStatus(player) {
    statusText.textContent =
        `${player.sayName()} (${player.getMarker()})'s turn`;
}

function handleCellClick(event) {
    const clickedCell = event.currentTarget;
    const index = Number(clickedCell.dataset.index);

    if (
        !game.gameActive ||
        !Number.isInteger(index) ||
        index < 0 ||
        index >= game.board.length ||
        game.board[index] !== ""
    ) {
        return;
    }

    const result = game.playMove(index);

    clickedCell.textContent = game.board[index];
    clickedCell.classList.add(game.board[index].toLowerCase());

    if (result.type === "winner") {
        statusText.textContent =
            `${result.player.sayName()} (${result.player.getMarker()}) wins!`;

        return;
    }

    if (result.type === "draw") {
        statusText.textContent = "It's a draw!";
        return;
    }

    updateStatus(result.player);
}
function restartGame() {
    game.restart();

    cells.forEach(cell => {
        cell.textContent = "";
        cell.classList.remove("x", "o");
    });

    updateStatus(game.getCurrentPlayer());
}

cells.forEach(cell => {
    cell.addEventListener("click", handleCellClick);
});

restartBtn.addEventListener("click", restartGame);
updateStatus(game.getCurrentPlayer());