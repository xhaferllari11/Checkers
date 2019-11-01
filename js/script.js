//constants
redStartingLocations = [1,3,5,7,
                    8,10,12,14,
                    17,19,21,23]; //Red locations used to calculate black also




//variables
var board;
var playerTurn;
var activatedPiece;
var lastPieceJumped;
var possibleDoubleJump;
var winner;
class Piece {
    constructor(color,isKing,locationOnBoard){
        this.color = color;
        this.isKing = isKing;
        this.locationOnBoard = locationOnBoard;
        this.possibleMoves = [];
    }
    findPossibleMoves(){

        // populate all possible moves and eliminate them, based on board.
        // other option: check each move and eliminate it one by one
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
    activatedPiece = null;
    lastPieceJumped = false;
    possibleDoubleJump = false;
    winner = null;
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
    //if player had chance to double jump but didn't execute
    if (possibleDoubleJump && (evt.target.getAttribute('src') != 'images/Target.png' )){
        togglePlayerTurn();
        activatedPiece = null;
        possibleDoubleJump = false;
        render();
        return;
    }
    // console.log(possibleDoubleJump);
    if (evt.target.tagName === 'section' || 
        !evt.target.hasAttribute('src') ||
        (evt.target.getAttribute('src') == 'images/Target.png' && !activatedPiece)) {
            return;
        }
    //update location
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
            // for (i=0; i<activatedPiece.possibleMoves.length;i++){
                possibleDoubleJump = activatedPiece.possibleMoves.some(function(possMove){
                    return Math.abs(possMove-activatedPiece.locationOnBoard)>10
                });
                console.log(possibleDoubleJump);
                //if doublejump available, remove single jump options
                if (possibleDoubleJump) {
                    activatedPiece.possibleMoves = activatedPiece.possibleMoves.filter(function(possMove){
                        return Math.abs(possMove-activatedPiece.locationOnBoard)>10;
                    });
                    render();
                    return;
                }
            // }
        }
        togglePlayerTurn();
        activatedPiece = null;
        render();
        return;
    }
    //activate piece, render will then show possible moves
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
            boardSpotsEl[idx].setAttribute('src',"../images/BlackKing.Png");        
        } else if (boardSpot.color === 'black' && !boardSpot.isKing) {
            boardSpotsEl[idx].setAttribute('src',"../images/Black.Png");        
        } else if (boardSpot.color === 'red' && boardSpot.isKing) {
            boardSpotsEl[idx].setAttribute('src',"../images/RedKing.Png");        
        } else if (boardSpot.color === 'red' && !boardSpot.isKing) {
            boardSpotsEl[idx].setAttribute('src',"../images/Red.Png");        
        }
    });
    if (activatedPiece){
        // activatedPiece.findPossibleMoves();
        for (let i=0; i<activatedPiece.possibleMoves.length; i++) {
            boardSpotsEl[activatedPiece.possibleMoves[i]].setAttribute('src','images/Target.png');
        }
    }
    //update message for players tunr or winner
    turnEl.textContent = (winner) ? `${winner} wins. CONGRATS!!!`:`${playerTurn}'s turn`; //Maybe capitalize the first letter here
    
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

function updateBoard(){

}


init();
