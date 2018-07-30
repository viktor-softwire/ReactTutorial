import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';



const Square = (props) => {
	if (props.isWinner) {
		return (
			<button className="winner-square" onClick={props.onClick}>
				{props.value}
			</button>			
		)
	}
	return (
		<button className="square" onClick={props.onClick}>
			{props.value}
		</button>
	)
}

class Board extends React.Component {

    renderSquare(i) {
		const isWinner = this.props.winnerSquares ? this.props.winnerSquares.includes(i) : false;
		return <Square 
			value={this.props.squares[i]} 
			onClick={() => this.props.onClick(i)}
			isWinner={isWinner}  
		/>;
	}

	Row = (props) => {
		const cells = [];
		for (let i = 0; i < 3; i++) {
			cells.push(this.renderSquare(3*props.rowNum + i));
		}
		return <div className="board-row">{cells}</div>
	}
  
    render() {  

		const rows = [];
		for (let i = 0; i < 3; i++) {
			rows.push(<this.Row rowNum={i} />);
		}

    	return (
    		<div>{rows}</div>
    	);
	}
}

const Toggle = (props) => {
	return (
		<button onClick={props.onClick}>
			{props.isToggleOn ? 'Ascending' : 'Descending'}
		</button>
	);
}

class Game extends React.Component {

	constructor(props) {
		super(props);
		this.state = {
			history: [{
				squares: Array(9).fill(null),
				lastMove: null,
			}],
			stepNumber: 0,
			xIsNext: true,
			isToggleOn: false,
		}
	}

	handleClick(i) {
		const history = this.state.history;
		const current = history[history.length - 1];
		const squares = current.squares.slice();
		if (calculateWinner(squares) || squares[i]) return;
		squares[i] = this.state.xIsNext ? 'X' : 'O';
		this.setState({
			history: history.concat([{
				squares: squares,
				lastMove: i,
			}]),
			stepNumber: history.length,
			xIsNext: !this.state.xIsNext,
		});
	}

	toggleHandler() {
		this.setState({
			isToggleOn: !this.state.isToggleOn,
		});
	}

	jumpTo(step) {
		this.setState({
			stepNumber: step,
			xIsNext: (step % 2) === 0,
		})
	}

    render() {
		const history = this.state.history;
		const current = history[this.state.stepNumber];
		const nextPlayer = this.state.xIsNext ? 'X' : 'O';
		const winnerSquares = calculateWinner(current.squares);
		const winner = !!winnerSquares ? current.squares[winnerSquares[0]] : null;
		let status = !!winner ? `Winner: ${winner}` : `Next player: ${nextPlayer}`;

		// Getting the right hand side buttons (which jumps to a move)
		const moves = history.map((move, moveNum) => {
			const colPos = move.lastMove % 3;
			const rowPos = Math.floor(move.lastMove / 3);
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
		if (this.state.isToggleOn) {
			moves.reverse();
		}

		// Check draw condition (win condition has already been checked)
		if (this.state.stepNumber === 9 && !winner) {
			status = 'Draw';
		} 

		// Build up DOM
    	return (
        	<div className="game">
				<div className="game-board">
					<Board 
						squares={current.squares}
						onClick={(i) => this.handleClick(i)}
						winnerSquares={winnerSquares}
					/>
				</div>
				<div className="game-info">
					<div>{status}</div>
					<ol>{moves}</ol>
					<Toggle
						isToggleOn={this.state.isToggleOn}
						onClick={() => this.toggleHandler()}
					/>
				</div>
			</div>
	    );
    }
}


function calculateWinner(squares) {
	const lines =[
		[0, 1, 2],
		[3, 4, 5],
		[6, 7, 8],
		[0, 3, 6],
		[1, 4, 7],
		[2, 5, 8],
		[0, 4, 8],
		[2, 4, 6],
	]

	for (let i = 0; i < lines.length; i++) {
		const [a, b, c] = lines[i];
		if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) return [a, b, c];
	}

	return null;
}
  
  // ========================================
  
ReactDOM.render(
	<Game />,
    document.getElementById('root')
);