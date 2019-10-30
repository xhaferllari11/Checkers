//constants
redStartingLocations = [1,3,5,7,
                    8,10,12,14,
                    17,19,21,23]; //Red locations used to calculate black also




//variables
var board;
var playerTurn;
var activatedPiece = null;
class Piece {
    constructor(color,isKing,locationOnBoard){
        this.color = color;
        this.isKing = isKing;
        this.locationOnBoard = locationOnBoard;
        this.possibleMoves = [];
    }
    findPossibleMoves(){

        let possibleMoves = [this.locationOnBoard-9,    //NW jump
                            this.locationOnBoard-7,     //NE jump
                            this.locationOnBoard+7,     //SW jump
                            this.locationOnBoard+9];    //SE jump
        //Eliminate possible moves outside of board (piece on edge)
        //Ex: eliminates West jumps if piece on West(left) edge of board
        if (!(this.locationOnBoard%8)) {
            possibleMoves[0] = null;
            possibleMoves[2] = null;
        }
        if (!((this.locationOnBoard+1)%8)) {
            possibleMoves[1] = null;
            possibleMoves[3] = null;
        }
        //Eliminate jump of piece moving backwards
        if (this.color ==='red' && !this.isKing){
            possibleMoves[0] = null;
            possibleMoves[1] = null;
        } else if (this.color === 'black' && !this.isKing){
            possibleMoves[2] = null;
            possibleMoves[3] = null;
        }
        //check if there is a piece at new possible move location
        possibleMoves.forEach(function(move,index){
            if (move){
                if (board[move]) {possibleMoves[index] = null;}
            }
        });
        return possibleMoves.filter(move => move);

        //Need to add possible move for jumping a piece


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
    })
    render();
}

function pieceEventHandler(evt){
    if (evt.target.tagName === 'section' || 
        !evt.target.hasAttribute('src') ||
        (evt.target.getAttribute('src') == 'images/Target.png' && !activatedPiece)) {
            return;
        }
    //update location
    if (evt.target.getAttribute('src') == 'images/Target.png'){
        board[(parseInt(evt.target.className))] = activatedPiece;
        board[activatedPiece.locationOnBoard] = null;
        activatedPiece.locationOnBoard = (parseInt(evt.target.className));
        //update possible moves
        board.forEach(function(boardSpot,idc){
            if (boardSpot) {boardSpot.possibleMoves = boardSpot.findPossibleMoves()}
        });
        togglePlayerTurn();
        activatedPiece = null;
        render();
        return;
    }
    if (board[(parseInt(evt.target.className))].color === playerTurn) {
        activatedPiece = board[(parseInt(evt.target.className))];
    }
    console.log(activatedPiece);
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
            boardSpotsEl[idx].setAttribute('src',"images/BlackKing.Png");        
        } else if (boardSpot.color === 'black' && !boardSpot.isKing) {
            boardSpotsEl[idx].setAttribute('src',"images/Black.Png");        
        } else if (boardSpot.color === 'red' && boardSpot.isKing) {
            boardSpotsEl[idx].setAttribute('src',"images/RedKing.Png");        
        } else if (boardSpot.color === 'red' && !boardSpot.isKing) {
            boardSpotsEl[idx].setAttribute('src',"images/Red.Png");        
        }
    });
    if (activatedPiece){
        activatedPiece.findPossibleMoves();
        for (let i=0; i<activatedPiece.possibleMoves.length; i++) {
            boardSpotsEl[activatedPiece.possibleMoves[i]].setAttribute('src','images/Target.png');
        }
    }
    turnEl.textContent = `${playerTurn} Goes First`; //Maybe capitalize the first letter here
    checkWinner();
}

function checkWinner(){

}

function movePiece(){
    
}

function updateBoard(){

}

init();
