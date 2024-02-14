const GameWindow = document.getElementById("gameWindow");
const UI = document.getElementById("UIcontainer");
const scoreElement = document.getElementById("scoreNum");
const blockDisplay = document.getElementById("blockDisplay");
const idleTime = 800;
const cellSide = 22;
const inputCD = 150;
const colorArr = [
    "color_0",
    "color_1",
    "color_2",
    "color_3",
    "color_4",
    "color_5",
    "color_6"
];

function getBlockShape(typeNum) {
    let cells;
    switch (typeNum) {
        case 0:
            cells = [
                [0, 5],
                [0, 4],
                [0, 6],
                [0, 7]
            ];
            break;
        case 1:
            cells = [
                [1, 4],
                [1, 3],
                [0, 4],
                [1, 5]
            ];
            break;
        case 2:
            cells = [
                [0, 4],
                [0, 5],
                [1, 4],
                [1, 5]
            ];
            break;
        case 3:
            cells = [
                [0, 5],
                [0, 4],
                [0, 6],
                [1, 6]
            ];
            break;
        case 4:
            cells = [
                [0, 5],
                [0, 4],
                [0, 6],
                [1, 4]
            ];
            break;
        case 5:
            cells = [
                [0, 5],
                [0, 4],
                [1, 5],
                [1, 6]
            ];
            break;
        case 6:
            cells = [
                [0, 4],
                [0, 5],
                [1, 3],
                [1, 4]
            ];
            break;
    }
    return cells;
}

class GameData {
    constructor(renderer) {
        this.renderer = renderer;
        this.block = new Block(this, Math.floor(Math.random() * 7));
        this.blockAvailable = false;
        this.intervalVariable = [];
        this.gameData = [];
        this.score = 0;

        for (let i = 0; i < 24; i++) {
            this.gameData.push([]);
            for (let j = 0; j < 10; j++) {
                this.gameData[i].push("e");
                // e for empty, p for placed, c for current block
            }
        }
        this.nextBlock = Math.floor(Math.random() * 7);
        this.renderer.setPreview(this.nextBlock);

        this.spawnBlock();
    }

    onUserInput(input = 0) {
        if (input == 2) {
            this.clearIdleInterval();
            this.block.moveDown();
            this.startIdleInterval();
        }
        if (input == 1) {
            this.block.moveLeft();
        } else if (input == 3) {
            this.block.moveRight();
        }
        if (input == 0) {
            this.block.rotate();
        }
    }

    clearIdleInterval() {
        this.intervalVariable.forEach(cd => {
            clearInterval(cd);
        });
    }
    startIdleInterval() {
        this.intervalVariable.push(
            setInterval(() => {
                this.onIntervalTrigger();
            }, idleTime)
        );
    }
    onIntervalTrigger() {
        this.block.moveDown();
        this.renderer.UpdateBlockVisual();
    }
    spawnBlock() {
        this.clearIdleInterval();
        if (this.block.canSpawn()) {
            this.block.cells.forEach(cell => {
                this.gameData[cell[0]][cell[1]] = "c";
            });
            this.blockAvailable = true;
            this.startIdleInterval();
        } else {
            this.onGameEnd();
        }
    }
    placeBlock() {
        this.block.cells.forEach(cell => {
            this.gameData[cell[0]][cell[1]] = "p";
        });

        this.blockAvailable = false;
        this.block = new Block(this, this.nextBlock);
        this.nextBlock = Math.floor(Math.random() * 7);
        this.renderer.setPreview(this.nextBlock);
        this.renderer.UpdateVisual();
        this.clearRows();
        this.spawnBlock();
    }

    clearRows() {
        for (let i = 23; i >= 0; i--) {
            let comboCounter = 0;
            for (let j = 0; j < 10; j++) {
                if (this.gameData[i][j] == "p") comboCounter++;
                else break;
            }
            if (comboCounter == 10) {
                this.renderer.removeElementsByDataRow(i);
                for (let k = i; k > 0; k--) {
                    this.gameData[k] = this.gameData[k - 1];
                    GameWindow.querySelectorAll(`[data-row="${k}"]`).forEach(
                        elm => {
                            elm.style.top = (k + 1) * cellSide + "px";
                            elm.setAttribute("data-row", k + 1);
                        }
                    );
                }
                this.gameData[0] = [
                    "e",
                    "e",
                    "e",
                    "e",
                    "e",
                    "e",
                    "e",
                    "e",
                    "e"
                ];

                this.onRowClear();
                i++;
            }
        }
    }

    onRowClear() {
        //animate things here
        this.score += 10;
        scoreElement.innerText = this.score;
    }

    onGameEnd() {
        scoreElement.innerText = "Game Over, score: " + this.score;
    }
}

class Block {
    constructor(gameData, type = 0) {
        this.game = gameData;
        this.type = type;
        this.cells = [];
        this.cells = getBlockShape(this.type);
    }

    canSpawn() {
        for (let i = 0; i < 4; i++) {
            if (this.game.gameData[this.cells[i][0]][this.cells[i][1]] == "p") {
                return false;
            }
        }
        return true;
    }

    canMoveDown() {
        let thereIsSpace = true;
        let spaceIsFull = false;

        this.cells.forEach(cell => {
            if (cell[0] >= 23) {
                thereIsSpace = false;
            } else if (this.game.gameData[cell[0] + 1][cell[1]] == "p") {
                spaceIsFull = true;
            }
        });

        return thereIsSpace && !spaceIsFull;
    }
    canMoveLeft() {
        let thereIsSpace = true;
        let spaceIsFull = false;

        this.cells.forEach(cell => {
            if (cell[1] <= 0) {
                thereIsSpace = false;
            } else if (this.game.gameData[cell[0]][cell[1] - 1] == "p") {
                spaceIsFull = true;
            }
        });

        return thereIsSpace && !spaceIsFull;
    }
    canMoveRight() {
        let thereIsSpace = true;
        let spaceIsFull = false;

        this.cells.forEach(cell => {
            if (cell[1] >= 9) {
                thereIsSpace = false;
            } else if (this.game.gameData[cell[0]][cell[1] + 1] == "p") {
                spaceIsFull = true;
            }
        });

        return thereIsSpace && !spaceIsFull;
    }
    canRotate() {
        let rotationAxis = this.cells[0];
        let canRotate = true;

        // Check if rotation is possible within game bounds
        for (let i = 1; i < 4; i++) {
            let currentPiece = this.cells[i];
            let theoreticalRotatedCoord = [
                rotationAxis[1] + rotationAxis[0] - currentPiece[1],
                rotationAxis[1] - rotationAxis[0] + currentPiece[0]
            ];
            if (
                theoreticalRotatedCoord[0] < 0 ||
                theoreticalRotatedCoord[0] > 23 ||
                theoreticalRotatedCoord[1] < 0 ||
                theoreticalRotatedCoord[1] > 9
            ) {
                canRotate = false;
                break;
            }
        }

        // Check if rotation is possible without overlapping existing pieces
        if (canRotate) {
            for (let i = 1; i < 4; i++) {
                let currentPiece = this.cells[i];
                let theoreticalRotatedCoord = [
                    rotationAxis[1] + rotationAxis[0] - currentPiece[1],
                    rotationAxis[1] - rotationAxis[0] + currentPiece[0]
                ];
                if (
                    this.cells.some(
                        cell =>
                            cell[0] === theoreticalRotatedCoord[0] &&
                            cell[1] === theoreticalRotatedCoord[1]
                    )
                ) {
                    continue;
                }
                if (
                    this.game.gameData[theoreticalRotatedCoord[0]][
                        theoreticalRotatedCoord[1]
                    ] === "p"
                ) {
                    canRotate = false;
                    break;
                }
            }
        } else {
            canRotate = false;
        }
        return canRotate;
    }

    moveDown() {
        if (this.canMoveDown()) {
            for (let i = 0; i < 4; i++) {
                this.game.gameData[this.cells[i][0]][this.cells[i][1]] = "e";
            }
            for (let i = 0; i < 4; i++) {
                this.cells[i][0]++;
            }
            for (let i = 0; i < 4; i++) {
                this.game.gameData[this.cells[i][0]][this.cells[i][1]] = "c";
            }
        } else {
            this.game.placeBlock();
        }
    }

    moveLeft() {
        if (this.canMoveLeft()) {
            for (let i = 0; i < 4; i++) {
                this.game.gameData[this.cells[i][0]][this.cells[i][1]] = "e";
            }
            for (let i = 0; i < 4; i++) {
                this.cells[i][1]--;
            }
            for (let i = 0; i < 4; i++) {
                this.game.gameData[this.cells[i][0]][this.cells[i][1]] = "c";
            }
        }
    }
    moveRight() {
        if (this.canMoveRight()) {
            for (let i = 0; i < 4; i++) {
                this.game.gameData[this.cells[i][0]][this.cells[i][1]] = "e";
            }
            for (let i = 0; i < 4; i++) {
                this.cells[i][1]++;
            }
            for (let i = 0; i < 4; i++) {
                this.game.gameData[this.cells[i][0]][this.cells[i][1]] = "c";
            }
        }
    }
    rotate() {
        if (this.canRotate()) {
            let rotationAxis = this.cells[0];
            for (let c = 1; c < 4; c++) {
                this.game.gameData[this.cells[c][0]][this.cells[c][1]] = "e";
            }
            for (let i = 1; i < 4; i++) {
                let currentPiece = this.cells[i];
                let a = rotationAxis[1] + rotationAxis[0] - currentPiece[1];
                let b = rotationAxis[1] - rotationAxis[0] + currentPiece[0];
                this.cells[i][0] = a;
                this.cells[i][1] = b;
                this.game.gameData[this.cells[i][0]][this.cells[i][1]] = "c";
            }
        }
    }
}

class GameRenderer {
    constructor(dataObject = new GameData(this)) {
        this.cellElements = []; //the html div elements that represent placed blocks in the game
        this.dataObject = dataObject;
        this.blockCells = []; //the html div elements that represent the falling block

        //initialize the first block
        let firstColorClass = colorArr[Math.floor(Math.random() * 7)];
        this.dataObject.block.cells.forEach(cell => {
            let tempCell = document.createElement("div");
            tempCell.setAttribute("class", "cell " + firstColorClass);
            tempCell.style.left = cell[1] * cellSide + "px";
            tempCell.style.top = cell[0] * cellSide + "px";
            tempCell.setAttribute("data-row", cell[0]);
            this.blockCells.push(tempCell);
            GameWindow.appendChild(tempCell);
        });
    }

    UpdateVisual() {
        //block placement update (final position)
        for (let i = 0; i < 4; i++) {
            this.cellElements.push(this.blockCells[i]);
        }
        this.blockCells = [];
        let colorClass = colorArr[Math.floor(Math.random() * 7)];
        for (let j = 0; j < 4; j++) {
            let tempCell = document.createElement("div");
            tempCell.setAttribute("class", "cell " + colorClass);

            let posData = this.dataObject.block.cells[j];
            tempCell.style.left = posData[1] * cellSide + "px";
            tempCell.style.top = posData[0] * cellSide + "px";
            tempCell.setAttribute("data-row", posData[0]);

            this.blockCells.push(tempCell);

            GameWindow.appendChild(tempCell);
        }
    }
    UpdateBlockVisual() {
        //block falling and movement update
        this.blockCells.forEach((cell, index) => {
            cell.style.top =
                this.dataObject.block.cells[index][0] * cellSide + "px";
            cell.style.left =
                this.dataObject.block.cells[index][1] * cellSide + "px";
            cell.setAttribute(
                "data-row",
                this.dataObject.block.cells[index][0]
            );
        });
    }

    // Function to remove HTML elements by data-row attribute value (ChatGPT code)
    removeElementsByDataRow(dataRowValue) {
        // Get all elements with the specified data-row value
        const elementsToRemove = GameWindow.querySelectorAll(
            `[data-row="${dataRowValue}"]`
        );

        // Remove each element
        elementsToRemove.forEach(element => {
            element.parentNode.removeChild(element);
        });
    }
    setPreview(typeNum) {
        blockDisplay.innerHTML = "";
        let newType = getBlockShape(typeNum);
        for (let i = 0; i < 4; i++) {
            let temp = document.createElement("div");
            temp.setAttribute("class", "cell");
            temp.style.top = (newType[i][0] + 2) * cellSide + "px";
            temp.style.left = (newType[i][1] - 1) * cellSide + "px";
            blockDisplay.appendChild(temp);
        }
    }
}

const MainRenderer = new GameRenderer();

const keyDict = { w: 0, a: 1, s: 2, d: 3 };

let onCooldown = false;

window.addEventListener("keydown", e => {
    if (["w", "a", "s", "d"].includes(e.key) && !onCooldown) {
        onCooldown = true;
        MainRenderer.dataObject.onUserInput(keyDict[e.key]);
        MainRenderer.UpdateBlockVisual();
        setTimeout(() => {
            onCooldown = false;
        }, inputCD);
    }
});
