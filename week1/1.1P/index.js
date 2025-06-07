const BLACK = "1"
const WHITE = "2"
const EMPTY = "0"

const ONGOING = "0"
const BLACK_WON = "1"
const WHITE_WON = "2"
const DRAW = "3"

const BLACK_PAWN = '<img src="assets/blackpawn.png">'
const WHITE_PAWN = '<img src="assets/whitepawn.png">'

var startingGameState = "111000222"
var currentPlayer = WHITE
var currentStatus = ONGOING

var losingPathCount = 0
var winStreak = 0
var highestWinStreak = 0

const gameBoard = document.getElementById("gametable").tBodies[0]
const gameStatus = document.getElementById("gamestatus")
const moveInput = document.getElementById("movebox")
const moveButton = document.getElementById("movebutton")
const gamePlayer = document.getElementById("player")
const winStreakText = document.getElementById("winstreak")
const highestWinStreakText = document.getElementById("highestwinstreak")
const losingPathText = document.getElementById("losingpath")

var gameState = startingGameState

function renderGameState() {
	for(i=0; i<9; i++) {
		row = Math.floor(i/3)
		col = i % 3 + 1
		
		cell = gameBoard.rows[row].cells[col]

		if (gameState[i] === BLACK) {
			cell.innerHTML = BLACK_PAWN
		}
		else if (gameState[i] === WHITE) {
			cell.innerHTML = WHITE_PAWN
		} 
		else {
			cell.innerHTML = ""
		}
	}
}

function setGameState(newGameState) {
	var oldGameState = gameState
	gameState = newGameState
	if (oldGameState !== gameState) {
		renderGameState()
		checkWinner()
	}
}

function resetGame() {
	gameState = startingGameState
	currentPlayer = WHITE
	currentStatus = ONGOING

	renderGameState()
	renderGameStatuses()
	enableMoveButton()
}

function disableMoveButton() {
	moveButton.setAttribute("disabled", "disabled")
}

function enableMoveButton() {
	moveButton.removeAttribute("disabled")
}

function renderGameStatuses() {
	switch(currentStatus) {
		case WHITE_WON:
			gameStatus.innerHTML = "White won!"
			winStreak++;
			highestWinStreak = Math.max(winStreak, highestWinStreak);
			break;
		case BLACK_WON:
			gameStatus.innerHTML =  "Black won!"
			winStreak=0;
			break;
		default:
			gameStatus.innerHTML = "Ongoing"
	}

	if (currentPlayer === BLACK) {
		gamePlayer.innerHTML = "Black"
	}
	else {
		gamePlayer.innerHTML = "White"
	}

	winStreakText.innerHTML = winStreak
	highestWinStreakText.innerHTML = highestWinStreak
	losingPathText.innerHTML = losingPathCount
}

// Game logic
//

function allPossibleMoves(player) {
	var possibleMoves = []
	for (var i=0; i<gameState.length; i++) {
		if (gameState[i] === player) {
			var endPoses = validMoves(i)
			var fullMoves = endPoses.map((val) => {
				return [i, val]
			})
			possibleMoves = possibleMoves.concat(fullMoves)
		}
	}
	
	return possibleMoves
}

function endTurn() {
	renderGameState()
	flipPlayer()
	checkWinner()
	renderGameStatuses()
	if (currentStatus !== ONGOING) {
		// end of game
		return
	}

	if (currentPlayer == AIplayer) {
		AIMove()
	}
}

function checkWinner() {
	var blackRow = gameState.slice(0,3)	
	var whiteRow = gameState.slice(6)

	if (whiteRow.includes(BLACK)) {
		currentStatus = BLACK_WON
		disableMoveButton()
	}
	else if (blackRow.includes(WHITE)) {
		currentStatus = WHITE_WON
		disableMoveButton()
	}
	else if (allPossibleMoves(currentPlayer).length == 0) {
		if (currentPlayer === BLACK) {
			currentStatus = WHITE_WON
		}
		else {
			currentStatus = BLACK_WON
		}
		disableMoveButton()
	}
	else {
		currentStatus = ONGOING
	}
	
	AIOptimize()
}

function validMoves(position) {
	if (gameState[position] !== currentPlayer || currentStatus !== EMPTY) {
		return []
	}

	var possibleMoves = []
	var nextRowInc = 3;
	var opponent = WHITE
	
	if (currentPlayer === WHITE) {
		nextRowInc = -3
		opponent = BLACK
	}

	var normalMove = position + nextRowInc
	if (gameState[normalMove] == EMPTY) { // can only move up if there's nothing on it
		possibleMoves.push(normalMove)
	}

	var diagonals = [normalMove - 1, normalMove + 1]
	// can only move diagonally if 1. it's a valid cell and 2. There's an enemy at that position
	// edge checking
	if ((parseInt(position) % 3) === 0) { // left edge
		diagonals.shift()
	}
	else if ((parseInt(position) % 3) === 2) { // right edge
		diagonals.pop()
	}
	
	// enemy checking
	for (i=0; i<diagonals.length; i++) {
		if (gameState[diagonals[i]] == opponent) {
			possibleMoves.push(diagonals[i])
		}
	}

	return possibleMoves
}

function convertGameCellToPosition(gameCell) {
	// example cell: a2
	var row = parseInt(gameCell[1]) - 1
	var colAlpha = gameCell[0]
	
	col = colAlpha.charCodeAt(0) - "a".charCodeAt(0)

	return row*3 + col
}

function flipPlayer() {
	if (currentPlayer === WHITE) {
		currentPlayer = BLACK
		//disableMoveButton()
	}
	else {
		currentPlayer = WHITE
		//enableMoveButton()
	}
}

// helper function to change game state
function setCharAt(str,index,chr) {
    if(index > str.length-1) return str;
    return str.substring(0,index) + chr + str.substring(index+1);
}

function move(startPos, endPos) {

	var isMovable = validMoves(startPos).includes(endPos)

	if (isMovable) {
		gameState = setCharAt(gameState, endPos, gameState[startPos])
		gameState = setCharAt(gameState, startPos, "0")

		return 0

	}

	return 1
}

function movePlayer() {
	const validRegexMoveCommand = /^[a-c][1-3][a-c][1-3]$/
	var aMove = moveInput.value
	if (!validRegexMoveCommand.test(aMove)) {
		alert("Invalid move command")
		return
	}

	// example: a2b2
	var startPos = convertGameCellToPosition(aMove.slice(0,2))
	var endPos = convertGameCellToPosition(aMove.slice(2,4))

	if (move(startPos, endPos) !== 0) {
		alert("Invalid move!")
		return
	}
	
	endTurn()
}


// ===================== AI implementation =============================

const AIplayer = BLACK

var AIspace = {}
var lastMove = {
	gameState: "",
	startPos: "",
	endPos: ""
}

// example of a key in the space:
// "111020202": { // the game state
// 	possibleMoves: [ // contains the possible (winning) moves
// 		[0, 3] // startPos, endPos
// 	],
// 	losingMoves: [ // contains known losing moves
// 		[2, 5]
// 	]
// }

// Choose a move, initialize the move space if has not yet initialized
//
function AIMove() {
	if (currentPlayer !== AIplayer) {
		// wrong turn
		return
	}

	if (!(gameState in AIspace)){
		initializeMoveSpace()
	}

	var searchSpace = AIspace[gameState].possibleMoves
	
	if (searchSpace == 0) {
		// already is in a losing state
		console.log("Sure loss")
		searchSpace = AIspace[gameState].losingMoves
		removeLastMoveFromAISpace()
	}		

	var aMove = randElementArray(searchSpace)
	lastMove.gameState = gameState
	lastMove.startPos = aMove[0]
	lastMove.endPos = aMove[1]
	move(aMove[0], aMove[1])

	endTurn()
	return aMove
}

function randElementArray(array) {
	// helper to get a random element
	randIndex = Math.floor(Math.random() * array.length)
	return array[randIndex]
}


function initializeMoveSpace() {
	AIspace[gameState] = {
		possibleMoves: allPossibleMoves(AIplayer),
		losingMoves: []
	}
}

function removeLastMoveFromAISpace() {
	var aMove = [lastMove.startPos, lastMove.endPos]
	var gameKey = AIspace[lastMove.gameState].possibleMoves
	var index = -1

	for (var i=0; i<gameKey.length; i++) {
		if ((aMove[0] === gameKey[i][0]) && (aMove[1] === gameKey[i][1])) {
			index = i
			break
		}
	}
	
	if (index != -1) {
		// move exists
		losingPathCount++;
		AIspace[lastMove.gameState].possibleMoves.splice(index, 1)
		AIspace[lastMove.gameState].losingMoves.push(aMove)
		return
	}
}

function AIOptimize() {
	if (currentStatus === ONGOING) {
		// wrong call
		return
	}

	if (currentStatus === BLACK_WON) {
		// already optimized
		return
	}

	removeLastMoveFromAISpace()
}
