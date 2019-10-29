//constants
redStartingLocations = [2,4,6,8,
                    9,11,13,15,
                    18,20,22,24];




//variables
var board;
var playerTurn;
class Piece {
    constructor(color,isKing){
        this.color = color;
        this.isKing = isKing;
        this.possibleMoves = [];
        //this.location
    }
}


// cached elements
boardEl = document.querySelector('section');
turnEl = document.querySelector('h2');
restartBtn = document.querySelector('button');
boardSpotsEl = document.querySelectorAll('section img');



//event listeners
boardEl.addEventListener('click',pieceEventHandler);



//functions

function init() {
    playerTurn = 'red'
    board = [];
    while (board.length < 64) { board.push(null); }

    redStartingLocations.forEach(function(location){
        board[location - 1] = new Piece('red',false);
        board[64-location] = new Piece('black',false);
    });
    render();
}

function pieceEventHandler(evt){
    if (evt.target.tagName === 'section' || 
        !evt.target.hasAttribute('src')) {
            return;
        }
    console.log(evt.target);
}

//Maybe put this in the class, and pass in board
function findPossibleMoves(){
    
}

function render(){
    board.forEach(function(boardPiece, idx){
        if (boardPiece === null) {
            boardSpotsEl[idx].removeAttribute('src');
        } else if (boardPiece.color === 'black' && boardPiece.isKing) {
            boardSpotsEl[idx].setAttribute('src',"images/BlackKing.JPG");        
        } else if (boardPiece.color === 'black' && !boardPiece.isKing) {
            boardSpotsEl[idx].setAttribute('src',"images/Black.JPG");        
        } else if (boardPiece.color === 'red' && boardPiece.isKing) {
            boardSpotsEl[idx].setAttribute('src',"images/RedKing.JPG");        
        } else if (boardPiece.color === 'red' && !boardPiece.isKing) {
            boardSpotsEl[idx].setAttribute('src',"images/Red.JPG");        
        }
    });
    turnEl.textContent = `${playerTurn} Goes First`; //Maybe capitalize the first letter here
    checkWinner();
}

function checkWinner(){

}

init();