const socket = io();
const spacing = 50;
var selectedBuyableTower = null

var selectedTower = null

const gameBoard = document.getElementById('gameBoard');
const ctx = gameBoard.getContext('2d');
var towerShop = document.getElementById("gameShopMenu");
towerList = [

    'basic', 'sniper', 'machineGun'

];
console.log()
getShopItems(programBox);


function drawGrid(grid, rows, cols) {
    for (let i = 0; i < rows; i++) {
        for (let j = 0; j < cols; j++) {
            if (grid[i][j].hasPath) {
                if (grid[i][j].isStart) {
                    ctx.fillStyle = 'lightblue';
                } else if (grid[i][j].isEnd) {
                    ctx.fillStyle = 'lightcoral';
                } else {
                    ctx.fillStyle = 'black';
                }
            } else {
                ctx.fillStyle = 'darkgreen';
            }
            ctx.fillRect(j * spacing, i * spacing, spacing, spacing);
        }
    }
}

function drawEnemy(enemy) {
    const { x, y, color, size, healthBorder, borderColor } = enemy;
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(x * spacing + spacing / 2, y * spacing + spacing / 2, size / 2, 0, 2 * Math.PI);
    ctx.fill();
    if (healthBorder) {
        ctx.strokeStyle = borderColor;
        ctx.lineWidth = 2;
        ctx.stroke();
    }
}


function selectTower() {
    const selectHandler = (event) => {
        const rect = gameBoard.getBoundingClientRect();
        const cellWidth = rect.width / 32;
        const cellHeight = rect.height / 20;
        const x = Math.floor((event.clientX - (rect.left + window.scrollX)) / cellWidth);
        const y = Math.floor((event.clientY - (rect.top + window.scrollY)) / cellHeight);
        socket.emit('towerSelect', { x, y })
    }

    gameBoard.addEventListener('click', selectHandler);
}
selectTower()


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
    console.log(towerList)
    towerList.forEach(tower => {
        const item = document.createElement('button');
        item.name = tower;
        item.innerHTML = tower;
        item.style.width = "100px";
        item.style.height = "100px";
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
            console.log("Got Tower")
            if (selectedBuyableTower == item.name) {
                selectedBuyableTower = null
            } else {
                selectedBuyableTower = item.name
            }
            console.log(selectedBuyableTower)
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


            } else {
                console.log("hey there mr guy")
            }
        });
        towerShop.appendChild(item);
    })
}

function getProgram() {
    const programBox = document.getElementById('programBox');
    console.log(programBox.towerID);
    
    socket.emit('userProgram', programBox.value, selectedTower.index);
}

socket.on('gameData', (data) => {
    const grid = data[0].grid
    const rows = data[0].rows
    const cols = data[0].cols
    const enemies = data[1]
    const towers = data[2]

    gameBoard.width = cols * spacing;
    gameBoard.height = rows * spacing;
    drawGrid(grid, rows, cols);
    enemies.forEach(enemy => {
        drawEnemy(enemy);
    });
    towers.forEach(tower => {
        drawTower(tower)
    })
});

socket.on('towerSelected', (data) => {
    const towerX = data.x;
    const towerY = data.y;
    let towerMenu = document.getElementById('towerMenu');
    let programMenu = document.getElementById('programBox');
    let towerRange = document.getElementById('towerRange');
    console.log(data);
    

    if (selectedTower == null) {
        towerMenu.style.display = 'block';
        selectedTower = data;
        if (selectedTower.userCode != null) {
            programMenu.value = selectedTower.userCode;
            towerRange.value = selectedTower.range;
        } else {
            programMenu.value = '';
            towerRange.value = '';
        }

    } else {
        towerMenu.style.display = 'none';
        selectedTower = null

    }
    
    

})