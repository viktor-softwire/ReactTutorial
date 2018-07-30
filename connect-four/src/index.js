import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';



const Square = (props) => (
	<button className={props.buttonClass} onClick={props.onClick}>
		{props.value}
	</button>
)

const Player = Object.freeze({
    YELLOW: 'yellow-square',
    RED: 'red-square',
    EMPTY: 'empty-square'
})

class Board extends React.Component {

    renderSquare(i) {
		return <Square 
			buttonClass={this.props.squares[i]} 
			onClick={() => this.props.onClick(i)}
		/>;
	}

	Row = (props) => {
		const cells = [];
		for (let i = 0; i < 7; i++) {
			cells.push(this.renderSquare(7*props.rowNum + i));
		}
		return <div className="board-row">{cells}</div>
	}
  
    render() {  

		const rows = [];
		for (let i = 0; i < 6; i++) {
			rows.push(<this.Row rowNum={i} />);
		}

    	return (
    		<div>{rows}</div>
    	);
	}
}

class Game extends React.Component {

	constructor(props) {
		super(props);
		this.state = {
			history: [{
				squares: Array(42).fill(Player.EMPTY),
				lastMove: null,
			}],
			stepNumber: 0,
			redIsNext: true,
		}
	}

    
	handleClick(i) {

        
        // Get col and scan squares in it
		const history = this.state.history;
		const current = history[history.length - 1];
        const squares = current.squares.slice();

        // If game is over
        if (calculateWinner(squares)) return;

        const colPosition = i % 7;
        let rowCursor = 6;
        for (let i = 0; i < 6; i++) {
            if (squares[colPosition + i*7] === Player.EMPTY) rowCursor = i;
        }

        // Coloumn is full
        if (rowCursor === 6) return;

        const foundSquare = rowCursor * 7 + colPosition;
		squares[foundSquare] = this.state.redIsNext ? Player.RED : Player.YELLOW;
		this.setState({
			history: history.concat([{
				squares: squares,
				lastMove: foundSquare,
			}]),
			stepNumber: history.length,
			redIsNext: !this.state.redIsNext,
		});
	}

	jumpTo(step) {
		this.setState({
			stepNumber: step,
			redIsNext: (step % 2) === 0,
		})
	}

    render() {
		const history = this.state.history;
		const current = history[this.state.stepNumber];
        const nextPlayer = this.state.redIsNext ? 'RED' : 'YELLOW';
		const winner = calculateWinner(current.squares);
        const winnerColor = !!winner ? winner.winner : null;
        const winnerName = winnerColor === Player.RED ? 'RED' : 'YELLOW';
        let status = !!winnerColor ? `Winner: ${winnerName}` : `Next player: ${nextPlayer}`;
        if (winner) {
            console.log(winner.winnerSquares);
        }

		// Getting the right hand side buttons (which jumps to a move)
		const moves = history.map((move, moveNum) => {
			const colPos = move.lastMove % 7;
			const rowPos = Math.floor(move.lastMove / 7);
			const desc = moveNum ? `Go to move #${moveNum} (${colPos}, ${rowPos})` : 'Go to gamestart';
			if (moveNum === this.state.stepNumber) {
				return (
					<li key={moveNum}>
						<button onClick={() => this.jumpTo(moveNum)}><b>{desc}</b></button>
					</li>	
				)
			}
			return (
				<li key={moveNum}>
					<button onClick={() => this.jumpTo(moveNum)}>{desc}</button>
				</li>
			); 
		});
		// if (this.state.isToggleOn) {
		// 	moves.reverse();
        // }
        
        // Check draw condition (win condition has already been checked)
		if (this.state.stepNumber === 42 && !winner) {
			status = 'Draw';
		} 

        // Build up DOM
    	return (
        	<div className="game">
				<div className="game-board">
					<Board 
						squares={current.squares}
						onClick={(i) => this.handleClick(i)}
					/>
				</div>
				<div className="game-info">
					<div>{status}</div>
					<ol>{moves}</ol>
				</div>
			</div>
	    );
    }
}

function rowColToInt(row, col) {
    if (row < 0 || row > 6 || col < 0 || col > 6) return;
    return 7*row + col;
}

function intToPos(i) {
    return {row: Math.floor(i/7), col: i%7};
}

function scanFrom(start, direction, squares, limit = 4) {
    if (!squares[rowColToInt(start.row, start.col)] || squares[rowColToInt(start.row, start.col)] === Player.EMPTY) return;
    const first = squares[rowColToInt(start.row, start.col)];
    const cursor = start;
    for (let i = 1; i < limit; i++) {
        cursor.row += direction.row;
        cursor.col += direction.col;
        if (!squares[rowColToInt(cursor.row, cursor.col)] || squares[rowColToInt(cursor.row, cursor.col)] !== first) return;
    }
    return first;
}

function calculateWinner(squares) {
    const directions = [
        {row: 0, col: 1},
        {row: 1, col: 0},
        {row: 1, col: 1},
        {row: 1, col: -1},
    ]
    for (let i = 0; i < 42; i++) {
        for (let j = 0; j < directions.length; j++) {
            if (scanFrom(intToPos(i), directions[j], squares)) {
                console.log(`Winner announced ${squares[i]}`); 
                const winnerSquares = [];
                for (let k = 0; k < 4; k++) {
                    const start = intToPos(i);
                    winnerSquares.push(rowColToInt(start.row + directions[j].row * k, start.col + directions[j].col*k));
                }
                return {winner: squares[i], winnerSquares: winnerSquares};
            }
        }
    }
}


// ========================================
  
ReactDOM.render(
	<Game />,
    document.getElementById('root')
);