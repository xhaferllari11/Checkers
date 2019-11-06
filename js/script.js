//constants
const redStartingLocations = [1,3,5,7,
                            8,10,12,14,
                            17,19,21,23];   //Red locations used to calculate black also

const playTime = 5;                         //minutes

//variables
var timers;
var board;
var playerTurn;
var activatedPiece;
var lastPieceJumped;
var possibleDoubleJump;
var winner;
var timerFunc;
class Piece {
    constructor(color,isKing,locationOnBoard){
        this.color = color;
        this.isKing = isKing;
        this.locationOnBoard = locationOnBoard;
        this.possibleMoves = [];
    }
    findPossibleMoves(){

        // populate all possible moves and eliminate impossible moves, based on board layout.
        let possibleMoves = [this.locationOnBoard-9,    //NW move
                            this.locationOnBoard-7,     //NE move
                            this.locationOnBoard+7,     //SW move
                            this.locationOnBoard+9,     //SE move
                            this.locationOnBoard -18,   //NW jump
                            this.locationOnBoard -14,   //NE jump
                            this.locationOnBoard +14,   //SW jump
                            this.locationOnBoard + 18]; //SE jump
        // remove moves outside of begining and ending of board
        possibleMoves = possibleMoves.map(function(boardSpot){
            return (boardSpot<0 || boardSpot>63) ? null : boardSpot;
        })
        if (!(this.locationOnBoard%8)) {
            possibleMoves[0] = null;
            possibleMoves[2] = null;
            possibleMoves[4] = null;
            possibleMoves[6] = null;
        } else if (!((this.locationOnBoard-1)%8)) {
        //Eliminate possible moves outside of board (piece on edge)
        //Ex: eliminates West move/jump if piece on West(left) edge of board
            possibleMoves[4] = null;
            possibleMoves[6] = null;
        }
        // eliminate east move/jump if pice on East edge of board
        if (!((this.locationOnBoard+1)%8)) {
            possibleMoves[1] = null;
            possibleMoves[3] = null;
            possibleMoves[5] = null;
            possibleMoves[7] = null;
        } else if (!((this.locationOnBoard+2)%8)) {
            possibleMoves[5] = null;
            possibleMoves[7] = null;
        }
        //Eliminate move/jump of piece moving backwards
        if (this.color ==='red' && !this.isKing){
            possibleMoves[0] = null;
            possibleMoves[1] = null;
            possibleMoves[4] = null;
            possibleMoves[5] = null;
        } else if (this.color === 'black' && !this.isKing){
            possibleMoves[2] = null;
            possibleMoves[3] = null;
            possibleMoves[6] = null;
            possibleMoves[7] = null;
        }
        //check if there is a piece at new possible move location
        //look to use another array method other than for each
        possibleMoves.forEach(function(move,index){
            if (move){
                if (board[move]) {
                    possibleMoves[index] = null;    //eliminates jump/move on occupied space
                } else if (index<4) {
                    possibleMoves[index+4] = null   //eliminates jump of empty space
                }
            }
        });
        //eliminate jump of same color piece
        for (let i=4; i<possibleMoves.length; i++){
            if (possibleMoves[i]){
                if (board[(possibleMoves[i]+this.locationOnBoard)/2].color === this.color){
                    possibleMoves[i] = null;
                }
            }
        }
        return possibleMoves.filter(move => move);
    }
}

// cached elements
boardEl = document.querySelector('section');
winningMessageEl = document.querySelector('h1');
restartBtn = document.querySelector('button');
boardSpotsEl = document.querySelectorAll('section img');
redTimerImgEl = document.querySelector('div.buttonandtimer .redpiece');
blackTimerImgEl = document.querySelector('div.buttonandtimer .blackpiece');
redTimerEl = document.querySelector('.redtimer');
blackTimerEl = document.querySelector('.blacktimer');


//event listeners
boardEl.addEventListener('click', boardClickHandler);
restartBtn.addEventListener('click', init);

//functions
function init() {
    playerTurn = 'red'
    board = [];
    activatedPiece = null;
    lastPieceJumped = false;
    possibleDoubleJump = false;
    winner = null;
    timers = {
        'red': {'min':playTime, 'sec':00},
        'black': {'min':playTime, 'sec':00}
    }
    while (board.length < 64) { board.push(null); }
    //place objects pieces on board
    redStartingLocations.forEach(function(location){
        board[location] = new Piece('red',false,location);
        board[63-location] = new Piece('black',false,(63-location));
    });
    //find possible moves after objects placed
    board.forEach(function(obj,idx){
        if (obj){
            obj.possibleMoves = obj.findPossibleMoves();
        }
    });
    timerFunc = setInterval(updateTimer,1000);
    render();
}

function boardClickHandler(evt){
    //if player had chance to double jump but didn't execute
    if (possibleDoubleJump && (evt.target.getAttribute('src') != 'images/Target.png' )){
        togglePlayerTurn();
        activatedPiece = null;
        possibleDoubleJump = false;
        render();
        return;
    }
    if (evt.target.tagName === 'section' || 
        !evt.target.hasAttribute('src') ||
        (evt.target.getAttribute('src') == 'images/Target.png' && !activatedPiece)) {
            return;
        }
    //update location if player clicked on a target move spot
    if (evt.target.getAttribute('src') == 'images/Target.png'){
        //move piece
        movePiece(activatedPiece, parseInt(evt.target.className));
        //update possible moves on board
        board.forEach(function(boardSpot){
            if (boardSpot) {boardSpot.possibleMoves = boardSpot.findPossibleMoves()}
        });
        //check if double jump available
        if (lastPieceJumped) {
            //checks all possible moves for doublejump.
            possibleDoubleJump = activatedPiece.possibleMoves.some(function(possMove){
                return Math.abs(possMove-activatedPiece.locationOnBoard)>10
            });
            //if doublejump available, remove single jump options
            if (possibleDoubleJump) {
                activatedPiece.possibleMoves = activatedPiece.possibleMoves.filter(function(possMove){
                    return Math.abs(possMove-activatedPiece.locationOnBoard)>10;
                });
                render();
                return;
            }
        }
        togglePlayerTurn();
        winner = checkStaleMate();
        console.log(winner);
        activatedPiece = null;
        render();
        return;
    }
    //if activated piece, show possible moves
    if (board[(parseInt(evt.target.className))].color === playerTurn) {
        activatedPiece = board[(parseInt(evt.target.className))];
    }
    render();
}

function togglePlayerTurn(){
    playerTurn = playerTurn === 'red' ? 'black' : 'red';
}

function render(){
    board.forEach(function(boardSpot, idx){
        if (boardSpot === null) {
            boardSpotsEl[idx].removeAttribute('src');
        } else if (boardSpot.color === 'black' && boardSpot.isKing) {
            boardSpotsEl[idx].setAttribute('src',"images/BlackKing.png");        
        } else if (boardSpot.color === 'black' && !boardSpot.isKing) {
            boardSpotsEl[idx].setAttribute('src',"images/Black.png");        
        } else if (boardSpot.color === 'red' && boardSpot.isKing) {
            boardSpotsEl[idx].setAttribute('src',"images/RedKing.png");        
        } else if (boardSpot.color === 'red' && !boardSpot.isKing) {
            boardSpotsEl[idx].setAttribute('src',"images/Red.png");        
        }
    });
    if (activatedPiece){
        for (let i=0; i<activatedPiece.possibleMoves.length; i++) {
            boardSpotsEl[activatedPiece.possibleMoves[i]].setAttribute('src','images/Target.png');
        }
    }
    //update message for players turn or winner
    winningMessageEl.textContent = (winner) ? `${winner} wins. CONGRATS!!!`:`Checkers`; //Maybe capitalize the first letter here
    winningMessageEl.textContent = (winner==0) ? `${playerTurn === 'red' ? 'black':'red'} wins by default. CONGRATS!!!`:`Checkers`; //Maybe capitalize the first letter here
    //update timer boxes
    if (playerTurn == 'red') {
        redTimerImgEl.style.backgroundColor = 'green';
        redTimerEl.style.backgroundColor = 'green';
        blackTimerImgEl.style.backgroundColor = 'white';
        blackTimerEl.style.backgroundColor = 'white';
    } else {
        redTimerImgEl.style.backgroundColor = 'white';
        redTimerEl.style.backgroundColor = 'white';
        blackTimerImgEl.style.backgroundColor = 'green';
        blackTimerEl.style.backgroundColor = 'green';
    }
}

function renderTimer(){
    redTimerEl.textContent = `${timers.red.min}:${(timers.red.sec<10) ? '0'+timers.red.sec:timers.red.sec}`;
    blackTimerEl.textContent = `${timers.black.min}:${(timers.black.sec<10) ? '0'+timers.black.sec:timers.black.sec}`;
}

function updateTimer(){
    if (timers[playerTurn]['sec']) {
        timers[playerTurn]['sec'] = timers[playerTurn]['sec'] -1;
    } else {
        timers[playerTurn]['sec'] = 59;
        timers[playerTurn]['min'] = timers[playerTurn]['min'] - 1;
    }
    renderTimer();
}

function movePiece(pieceToMove, newLocation){
    board[newLocation] = pieceToMove;
    //check if piece jumped
    lastPieceJumped = (Math.abs(newLocation-pieceToMove.locationOnBoard)>10) ? true : false;
    //remove piece that was jumped
    if (lastPieceJumped) {
        board[Math.abs(newLocation+pieceToMove.locationOnBoard)/2] = null;
        winner = checkWinner();
    }
    board[pieceToMove.locationOnBoard] = null;
    pieceToMove.locationOnBoard = newLocation;
    //check if piece reached end of board to be Kinged
    if ((newLocation>55 || newLocation<8) && !pieceToMove.isKing) {
        pieceToMove.isKing = true;
    }
}

function checkWinner(){
    let redsLeft = 0;
    let blacksLeft = 0;
    board.forEach(function(boardSpot){
        if (boardSpot){
            if (boardSpot.color == 'red'){
                redsLeft += 1;
            } else if (boardSpot.color == 'black'){
                blacksLeft += 1;
            }
        }
    });
    if (redsLeft == 0) {
        return 'black';
    } else if (blacksLeft == 0){
        return 'red';
    }
    return null;
}

function checkStaleMate(){
    let hasPossibleMoves = false;
    board.forEach(function(boardSpot){
        if (boardSpot) {
            console.log(boardSpot.color);
            console.log(playerTurn);
            if (boardSpot.color == playerTurn && boardSpot.possibleMoves.length) {
                console.log(boardSpot.possibleMoves)
                hasPossibleMoves = true;
            }
        }
    })
    return (hasPossibleMoves) ? null : 0;
}

init();