const socket = io();
const spacing = 32; //change this to change the size of the grid cell and quality of each cell
var selectedBuyableTower = null

var selectedTower = null

const gameBoard = document.getElementById('gameBoard');
const ctx = gameBoard.getContext('2d');
var towerShop = document.getElementById("gameShopMenu");
towerList = [

    'basic', 'sniper', 'machineGun'

];
getShopItems(programBox);

const cellPlaceableImage = new Image();
cellPlaceableImage.src = '/images/pathAndCells/cellPlaceable1.png'; // Path to the image in the images folder

const pathUpDownImage = new Image();
pathUpDownImage.src = '/images/pathAndCells/pathUpDown.png'; // Path to the image in the images folder

const pathLeftRightImage = new Image();
pathLeftRightImage.src = '/images/pathAndCells/pathLeftRight.png'; // Path to the image in the images folder

const pathDownLeftImage = new Image();
pathDownLeftImage.src = '/images/pathAndCells/pathDownLeft.png'; // Path to the image in the images folder

const pathDownRightImage = new Image();
pathDownRightImage.src = '/images/pathAndCells/pathDownRight.png'; // Path to the image in the images folder

const pathFourWayImage = new Image();
pathFourWayImage.src = '/images/pathAndCells/pathFourWay.png'; // Path to the image in the images folder

const pathUpLeftImage = new Image();
pathUpLeftImage.src = '/images/pathAndCells/pathUpLeft.png'; // Path to the image in the images folder

const pathUpRightImage = new Image();
pathUpRightImage.src = '/images/pathAndCells/pathUpRight.png'; // Path to the image in the images folder

const enemyCamoImage = new Image();
enemyCamoImage.src = '/images/enemySprites/popupEnemy.png'; // Path to the image in the images folder

function drawGrid(grid, rows, cols) {
    for (let i = 0; i < rows; i++) {
        for (let j = 0; j < cols; j++) {
            if (grid[i][j].hasPath) {
                if (grid[i][j].isStart) {
                    ctx.fillStyle = 'lightblue';
                    ctx.fillRect(j * spacing, i * spacing, spacing, spacing);
                } else if (grid[i][j].isEnd) {
                    ctx.fillStyle = 'lightcoral';
                    ctx.fillRect(j * spacing, i * spacing, spacing, spacing);
                } else {
                    // ctx.fillStyle = 'black';
                    // ctx.fillRect(j * spacing, i * spacing, spacing, spacing);
                    switch (grid[i][j].direction) {
                        case 'up-down':
                            ctx.drawImage(pathUpDownImage, j * spacing, i * spacing, spacing, spacing);
                            break;
                        case 'left-right':
                            ctx.drawImage(pathLeftRightImage, j * spacing, i * spacing, spacing, spacing);
                            break;
                        case 'down-left':
                            ctx.drawImage(pathDownLeftImage, j * spacing, i * spacing, spacing, spacing);
                            break;
                        case 'down-right':
                            ctx.drawImage(pathDownRightImage, j * spacing, i * spacing, spacing, spacing);
                            break;
                        case 'four-way':
                            ctx.drawImage(pathFourWayImage, j * spacing, i * spacing, spacing, spacing);
                            break;
                        case 'up-left':
                            ctx.drawImage(pathUpLeftImage, j * spacing, i * spacing, spacing, spacing);
                            break;
                        case 'up-right':
                            ctx.drawImage(pathUpRightImage, j * spacing, i * spacing, spacing, spacing);
                            break;
                    }
                }
            } else {
                // Use the preloaded image
                if (cellPlaceableImage.complete) {
                    ctx.drawImage(cellPlaceableImage, j * spacing, i * spacing, spacing, spacing);
                } else {
                    // Fallback in case the image hasn't loaded yet
                    cellPlaceableImage.onload = () => {
                        ctx.drawImage(cellImage, j * spacing, i * spacing, spacing, spacing);
                    };
                }
            }
        }
    }
}

function drawEnemy(enemy) {
    const { x, y, color, size, healthBorder, borderColor } = enemy;
    // ctx.fillStyle = color;
    // ctx.beginPath();
    // ctx.arc(x * spacing + spacing / 2, y * spacing + spacing / 2, size / 2, 0, 2 * Math.PI);
    // ctx.fill();
    // if (healthBorder) {
    //     ctx.strokeStyle = borderColor;
    //     ctx.lineWidth = 2;
    //     ctx.stroke();
    // }
    if (enemyCamoImage.complete) {
        ctx.drawImage(enemyCamoImage, x * spacing, y * spacing, size, size);
    } else {
        // Fallback in case the image hasn't loaded yet
        enemyCamoImage.onload = () => {
            ctx.drawImage(enemyCamoImage, x * spacing, y * spacing, size, size);
        };
    }
}


function selectTower(rows, cols) {
    const selectHandler = (event) => {
        const rect = gameBoard.getBoundingClientRect();
        const cellWidth = rect.width / cols;
        const cellHeight = rect.height / rows;
        const x = Math.floor((event.clientX - (rect.left + window.scrollX)) / cellWidth);
        const y = Math.floor((event.clientY - (rect.top + window.scrollY)) / cellHeight);
        socket.emit('towerSelect', { x, y })
    }

    gameBoard.addEventListener('click', selectHandler);
}
selectTower(20, 32)


function drawTower(tower) {
    const { x, y, color, size } = tower;
    ctx.fillStyle = color;
    ctx.fillRect(x * spacing, y * spacing, spacing, spacing);
    ctx.strokeStyle = 'black';
    ctx.strokeRect(x * spacing, y * spacing, spacing, spacing);
    if (tower.shootLocation != null) {
        // Calculate the angle between the tower and the shoot location
        const dx = tower.shootLocation.x - tower.x;
        const dy = tower.shootLocation.y - tower.y;
        const angle = Math.atan2(dy, dx);

        // Draw the line
        ctx.strokeStyle = 'yellow';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(tower.x * spacing + spacing / 2, tower.y * spacing + spacing / 2);
        ctx.lineTo(tower.shootLocation.x * spacing + spacing / 2, tower.shootLocation.y * spacing + spacing / 2);
        ctx.stroke();
    } else {
        return;
    }
}




function getShopItems() {
    towerList.forEach(tower => {
        const item = document.createElement('button');
        item.name = tower;
        item.innerHTML = tower;
        item.style.width = "50px";
        item.style.height = "50px";
        item.style.backgroundColor = "white"
        item.addEventListener('mouseover', function () {
            item.style.backgroundColor = "gray";
            item.style.cursor = "pointer";
        });
        item.addEventListener('mouseout', function () {
            item.style.backgroundColor = "white";
            item.style.cursor = "default";
        });
        item.addEventListener('click', function () {
            if (selectedBuyableTower == item.name) {
                selectedBuyableTower = null
            } else {
                selectedBuyableTower = item.name
            }
            // the if statement below is supposed to be for selecting a grid square
            if (selectedBuyableTower != null) {
                const handleClick = (event) => {
                    const rect = gameBoard.getBoundingClientRect();
                    const cellWidth = rect.width / 32;
                    const cellHeight = rect.height / 20;
                    const x = (event.clientX - (rect.left + window.scrollX)) / cellWidth;
                    const y = (event.clientY - (rect.top + window.scrollY)) / cellHeight;
                    let tower = item.name;

                    socket.emit('towerPlace', { x, y, tower });
                    selectedBuyableTower = null
                    gameBoard.removeEventListener('click', handleClick)
                };



                gameBoard.addEventListener('click', handleClick);


            }
        });
        towerShop.appendChild(item);
    })
}

function getProgram() {
    const programBox = document.getElementById('programBox');
    socket.emit('userProgram', programBox.value, selectedTower.index);
}

socket.on('gameData', (data) => {
    const grid = data.gridData.grid
    const rows = data.gridData.rows
    const cols = data.gridData.cols
    const enemies = data.enemyData
    const towers = data.towerData
    const gameOver = data.gameOverStatus
    const gameRunning = data.gameRunningStatus

    gameBoard.width = cols * spacing;
    gameBoard.height = rows * spacing;
    if (!gameOver && gameRunning) {
        drawGrid(grid, rows, cols);
        enemies.forEach(enemy => {
            drawEnemy(enemy);
        });
        towers.forEach(tower => {
            drawTower(tower)
        })
    } else {
        if (gameOver) {
            ctx.clearRect(0, 0, gameBoard.width, gameBoard.height);
            drawGrid(grid, rows, cols);
            enemies.forEach(enemy => {
                drawEnemy(enemy);
            });
            towers.forEach(tower => {
                drawTower(tower)
            })
            ctx.fillStyle = 'rgba(0, 0, 0, 0.25)';
            ctx.fillRect(0, 0, gameBoard.width, gameBoard.height);
        }
    }
});

socket.on('towerSelected', (data) => {
    const towerX = data.x;
    const towerY = data.y;
    let towerMenu = document.getElementById('towerMenu');
    let programMenu = document.getElementById('programBox');
    let towerRange = document.getElementById('towerRange');
    if (selectedTower == null) {
        towerMenu.style.transition = 'transform 0.3s ease-in-out';
        towerMenu.style.transform = 'translate(100%, 0)';
        selectedTower = data;
        if (selectedTower.userCode != null) {
            programMenu.value = selectedTower.userCode;
            towerRange.value = selectedTower.range;
        } else {
            programMenu.value = '';
            towerRange.value = '';
        }

    } else {
        selectedTower = null
        towerMenu.style.transition = 'transform 0.3s ease-in-out';
        towerMenu.style.transform = 'translate(0, 0)';

    };
});

socket.on('codeWillNotBeExecuted', (information) => {
    console.log(information.text)
})