var canvas = document.querySelector('canvas');

/////////////////////////////////////////////////////////////////
let cellSide = 10; //pixels of the cell
let rows = 50
let columns = 50
let canvasWidth = columns * cellSide;
let canvasHeight = rows * cellSide;
let head = [Math.floor(rows / 2), Math.floor(columns / 2)]
let step = 0.2 //seconds
let body = [
    [head[0], head[1] - 2],
    [head[0], head[1] - 1],
    head
]
/////////////////////////////////////////////////////////////////

canvas.width = canvasWidth;
canvas.height = canvasHeight;
canvas.style.left = `${innerWidth / 2 - canvas.width / 2}px`;
canvas.style.top = `${innerHeight / 2 - canvas.height / 2}px`;
const cellStates = {
    dead: 'black',
    food: 'red',
    snake: 'lightgreen'
}

addEventListener(
    'resize', function(event){
        canvas.width = canvasWidth;
        canvas.height = canvasHeight;
        canvas.style.left = `${innerWidth / 2 - canvas.width / 2}px`;
        canvas.style.top = `${innerHeight / 2 - canvas.height / 2}px`;
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
        //this.draw() 
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
        this.direction = inputDirection;
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
        let tail = this.cells[0]
        let preTail = this.cells[1]
        this.cells.unshift([
            2 * tail[0] - preTail[0],
            2 * tail[1] - preTail[1]
        ])

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
    move(direction){
        if(!this.paused && !this.dead){
            let arrow0 = this.arrow(this.direction)
            let arrow1 = this.arrow(direction)
            let head = this.cells[this.cells.length - 1];
            let neck = this.cells[this.cells.length - 2];

            let newHead0 = [head[0] + arrow0[0], head[1] + arrow0[1]]
            let newHead1 = [head[0] + arrow1[0], head[1] + arrow1[1]]
            let newHead = undefined
            console.log(newHead0, newHead1)

            if(
                mapObj[newHead0] == undefined && 
                mapObj[newHead1] == undefined
            ){
                this.dead = true
                console.log('OH-OH')

            }else if(
                mapObj[newHead0] != undefined && 
                mapObj[newHead1] == undefined
            ){
                newHead = newHead0

            }else if(
                mapObj[newHead0] == undefined && 
                mapObj[newHead1] != undefined
            ){
                if(newHead1 == String(neck)){
                    this.dead
                }else{
                    newHead = newHead1
                    this.direction = direction
                }

            }else if(
                mapObj[newHead0] != undefined &&
                mapObj[newHead1] != undefined
            ){
                if(newHead1 == String(neck)){
                    newHead = newHead0
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
                console.log(this.cells)
                if(newHead != undefined){
                    switch(mapObj[newHead].state){
                        case 'snake':
                            this.dead = true
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
function animate() {
    requestAnimationFrame(animate)
    if(Date.now() - counter >= step * 1000){
        counter = Date.now()
        c.clearRect(0, 0, innerWidth, innerHeight)
        food.idle()
        snake.move(inputDirection)
        snake.draw()
    }
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

