let canvas = document.getElementById('snake')
let pointsDiv = document.getElementById('points')
let speedSlider = document.getElementById('speedSlider')
let maxPoints = 0



/////////////////////////////////////////////////////////////////
let cellSide = 25; // ------------------------------------------- pixels of a cell
let rows = 25 // ------------------------------------------------ rows of the canvas
let columns = 25 // --------------------------------------------- columns of the canvas
let minSpeed = 1000
let head = [Math.floor(rows / 2), Math.floor(columns / 2)] // --- initial head of the snake
let body = [                 //
    [head[0], head[1] - 2],  //
    [head[0], head[1] - 1],  // --------------------------------- initial body
    head                     //
]                            //
/////////////////////////////////////////////////////////////////
speedSlider.min = 0
speedSlider.max = minSpeed
speedSlider.value =  4 * minSpeed / 5
let canvasWidth = columns * cellSide;
let canvasHeight = rows * cellSide;
canvas.width = canvasWidth;
canvas.height = canvasHeight;
const cellStates = {
    dead: '#67BC9A',
    food: '#F8F2AB',
    snake: '#B4D6A4'
}
const enviormentColors = {
    pageBackGround: '#0071A7', 
    border: '#13B0A5'
}
let pageBody = document.querySelector('body')
pageBody.style.backgroundColor = enviormentColors.pageBackGround
canvas.style.borderColor = enviormentColors.border
canvas.style.backgroundColor = cellStates.dead

addEventListener(
    'resize', function(event){
        canvas.width = canvasWidth;
        canvas.height = canvasHeight;
    }
)

let inputDirection = 'd'
addEventListener(
    'keypress', function(event){
        if('wasd'.includes(event.key)){
            inputDirection = event.key
        }
    }
)

var c = canvas.getContext('2d');
class Cell{
    constructor(x, y, state='dead'){
        this.x = x; //Coordinates representing cell position in the canvas of
        this.y = y; //dimensions canvasWidth x canvasHeight
        this.state = state
        this.draw() 
    };
    draw(){
        c.fillStyle = cellStates[this.state]
        c.fillRect(this.x, this.y, cellSide, cellSide);
        c.strokeStyle = 'white'
        c.stroke()
        c.fill()
    };
};
mapObj = {}
for(let row = 0; row < rows; row++){
    for(let column = 0; column < columns; column++){
        mapObj[[row, column]] = new Cell(column * cellSide, row * cellSide) 
    };
};

class Snake{
    constructor(cells){
        this.cells = cells; // array of arrays representing cells from mapObj. 
                            // cells[0] is the head of the snake
        this.paused = true;
        this.dead = false;
        this.won = false
        this.direction = inputDirection;
        this.speed = speedSlider.value
        
    };
    draw(){
        for(let i = 0; i < this.cells.length; i++){
            if(mapObj[this.cells[i]] != undefined){
                mapObj[this.cells[i]].state = 'snake'
                mapObj[this.cells[i]].draw();
            }
            
        }
    }
    eat(){
        console.log('yummy!')
        let growed = false // check if the snake was able to unshift a new tail
        let tail = this.cells[0]
        let preTail = this.cells[1]
        let head = this.cells[this.cells.length - 1]
        let neck = this.cells[this.cells.length - 2]
        // All possible directions //
        let arrows = [
            [0, -1],
            [0, 1],
            [-1, 0],
            [1, 0]
        ]
        // First check if the tail is available //
        let i = 0
        let predeterminedArrow = []
        while(!growed && i < arrows.length){
            let cell = [tail[0] + arrows[i][0], tail[1] + arrows[i][1]]
            if(mapObj[cell] != undefined && mapObj[cell].state != 'snake'){
                this.cells.unshift(cell)
                growed = true
            }
            i += 1
        }
        // If the snake couldn't grow, we try to push a new head //
        i = 0
        while(!growed && i < arrows.length){
            cell = [head[0] + arrows[i][0], head[1] + arrows[i][1]]
            if(mapObj[cell] != undefined && mapObj[cell].state != 'snake'){
                this.cells.push(cell)
                growed = true
            }
            i += 1
        }
        // If non of the above were possible, the player won //
        growed || this.win()

    }
    reset(){
        for(let row = 0; row < rows; row++){
            for(let column = 0; column < columns; column++){
                mapObj[[row, column]].state = 'dead' 
            };
        };
        this.cells = body.slice()
        this.paused = true
        this.dead = false
        inputDirection = 'd'
        this.draw()
    }
    pause(){
        if(!this.paused){
            this.paused = true;
        }else{
            this.paused = false;
        }
    }
    arrow(direction){
        let arrow = undefined
        switch(direction){
            case 'w':
                arrow = [-1, 0]
                break
            case 'a':
                arrow = [0, -1]
                break
            case 's':
                arrow = [1, 0]
                break
            case 'd':
                arrow = [0, 1]
            
        }
        return arrow
    }
    die(){
        this.dead = true
    }
    win(){
        this.won = true
        console.log('YOU WON')
    }
    move(direction){
        if(!this.paused && !this.dead){
            let arrow0 = this.arrow(this.direction)
            let arrow1 = this.arrow(direction)
            let head = this.cells[this.cells.length - 1];
            let neck = this.cells[this.cells.length - 2];

            let newHead0 = [head[0] + arrow0[0], head[1] + arrow0[1]]
            let newHead1 = [head[0] + arrow1[0], head[1] + arrow1[1]]
            let newHead = undefined

            if(mapObj[newHead1] == undefined){
                this.die()
            }else{
                if(newHead1 == String(neck)){
                    if(mapObj[newHead0] == undefined){
                        this.die()
                    }else{
                        newHead = newHead0
                    }
                }else{
                    newHead = newHead1
                    this.direction = direction
                }

            }

            if(!this.dead){
                let deceised = this.cells.shift()
                mapObj[deceised].state = 'dead'
                mapObj[deceised].draw()
                this.cells.push(newHead)
                if(newHead != undefined){
                    switch(mapObj[newHead].state){
                        case 'snake':
                            this.die()
                            break
                        case 'food':
                            this.eat()
                    }
                    if(mapObj[newHead].state == 'snake'){
                        this.dead = true
                    }
                    this.draw()
                }
                
        
            }
        
        }   
    }      
};

class Food{
    constructor(){
        this.x = undefined
        this.y = undefined
        this.newPosition()
    }
    isEaten(){
        return mapObj[[this.x, this.y]].state == 'snake'
    }
    idle(){
        if(this.isEaten()){
            this.newPosition()
        }
        mapObj[[this.x, this.y]].draw()
    }
    newPosition(){
        [this.x, this.y] = this.validPlace()
        mapObj[[this.x, this.y]].state = 'food'
        mapObj[[this.x, this.y]].draw()
    }
    validPlace(){
        let x = Math.floor(Math.random() * rows)
        let y = Math.floor(Math.random() * columns)
        while(mapObj[[x, y]].state == 'snake'){
            x = Math.floor(Math.random() * rows)
            y = Math.floor(Math.random() * columns)
        }
        return [x, y]
    }
}
let snake = new Snake(body.slice())
let food = new Food()
snake.draw()

addEventListener(
    'keypress', function(event){
        if(event.key == 'p'){
            snake.pause()
        }
    }   
)

let counter = Date.now()
addEventListener(
    'keypress', function(event){
        if(event.key == 'r'){
            snake.reset()
            food.newPosition()
        }
    }
)
function updatePoints(points) {
    if(points > maxPoints){
        maxPoints = points
    }
    pointsDiv.innerHTML = `<h1>POINTS = ${points}</h1>   <h2> Record = ${maxPoints}</h2>`
}

function animate() {
    requestAnimationFrame(animate)
    c.clearRect(0, 0, innerWidth, innerHeight)
    if(Date.now() - counter >= minSpeed - snake.speed){
        updatePoints(snake.cells.length - 3)
        snake.move(inputDirection)
        snake.speed = speedSlider.value
        counter = Date.now()
    }
    snake.draw()
    food.idle()
}
function stopAnimation(){
    cancelAnimationFrame(animate);
};
addEventListener(
    'keypress', function(event){
        if(event.key == 'C'){stopAnimation()}
    }
)

animate()

//Test change for github