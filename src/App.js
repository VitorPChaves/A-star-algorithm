import { useEffect, useState } from 'react';
import './App.css';
import { Board } from './Board';

function App() {
  const [puzzle, setPuzzle] = useState([
    [1, 2, 3],
    [4, 5, 6],
    [7, 8, 0],
  ]);
  const [solvedPuzzle, setSolvedPuzzle] = useState(null);
  const [solving, setSolving] = useState(false);
  const [visitedNodes, setVisitedNodes] = useState(0);

  useEffect(() => {
    // Starts the solving of the puzzle and calculates de time of process
    if (solving) {
      console.time('solvePuzzleExecution');
      const solution = solvePuzzle(puzzle);
      setSolvedPuzzle(solution);
      setSolving(false);
      console.timeEnd('solvePuzzleExecution');
    }
    // console.log(...this.state)
  }, [puzzle, solving]);

  const renderCell = (value) => {
    //  Empty cell
    if (value === 0) return ' ';
    return value;
  };

  const delay = (milliseconds) => {
    return new Promise(resolve => {
        setTimeout(resolve, milliseconds);
    });
  }

  const renderBoard = (board) => {
    console.log(board)
    console.log(typeof board)

    if (board.length >= 10) {
      return (
        <div className='board'>
          {board.map((item, index) => {
            delay(1000);

            return (
              <>
                <>{index+1}</>
                <div className="board-column">
                  {item.map((row, rowIndex) => (
                    <div className="row" key={rowIndex}>
                      {row.map((cell, colIndex) => (
                        <div className="cell" key={colIndex}>
                          {renderCell(cell)}
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              </>
            )
          })}  
        </div>
      );
    }

    return (
      <div className='board'>
        <div className="board-column">
        {board.map((row, rowIndex) => (
          <div className="row" key={rowIndex}>
            {row.map((cell, colIndex) => (
              <div className="cell" key={colIndex}>
                {renderCell(cell)}
              </div>
            ))}
          </div>
        ))}
      </div>
      </div>
     
    );
  };

  const shuffleBoard = async () => {
    // Implement puzzle shuffling logic here
    // This function should shuffle the puzzle tiles

    const boardSize = puzzle.length;
    const flattenedPuzzle = [].concat(...puzzle);
    let shuffledPuzzle = [...flattenedPuzzle];
  
    // Shuffle the puzzle by making a series of valid random moves
    for (let i = 0; i < 1000; i++) {
      const emptyIndex = shuffledPuzzle.indexOf(0);
      const neighbors = [];
  
      // Check the neighbors of the empty cell
      if (emptyIndex - boardSize >= 0) neighbors.push(emptyIndex - boardSize); // Up
      if (emptyIndex + boardSize < boardSize * boardSize) neighbors.push(emptyIndex + boardSize); // Down
      if (emptyIndex % boardSize !== 0) neighbors.push(emptyIndex - 1); // Left
      if ((emptyIndex + 1) % boardSize !== 0) neighbors.push(emptyIndex + 1); // Right
  
      // Randomly choose a neighbor to swap with the empty cell
      const randomNeighborIndex = neighbors[Math.floor(Math.random() * neighbors.length)];
      [shuffledPuzzle[emptyIndex], shuffledPuzzle[randomNeighborIndex]] = [
        shuffledPuzzle[randomNeighborIndex],
        shuffledPuzzle[emptyIndex],
      ];
    }
  
    // Convert the flattened array back to a 2D puzzle
    const newPuzzle = [];
    for (let i = 0; i < boardSize; i++) {
      newPuzzle.push(shuffledPuzzle.slice(i * boardSize, (i + 1) * boardSize));
    }

    // renderBoard(newPuzzle);

    console.log("new puzzle here:", newPuzzle)
    setPuzzle(newPuzzle)
    renderBoard(puzzle)
  };

  // A* algorithm logic
  const solvePuzzle = (initialPuzzle) => {
    const goalState = [
      [1, 2, 3],
      [4, 5, 6],
      [7, 8, 0],
    ];
    let visitedNodes = 0;
  
    // Helper function to calculate the Manhattan distance
    const manhattanDistance = (a, b) => {
      return Math.abs(a[0] - b[0]) + Math.abs(a[1] - b[1]);
    };
  
    // Define a node structure
    class Node {

      // To test the algorithm without heuristics just remove it from the sum of the cost
      // But there will be a lot more nodes visited
      constructor(state, parent = null, action = null, depth = 0) {
        this.state = state;
        this.parent = parent;
        this.action = action;
        this.depth = depth;
        this.heuristic = this.calculateHeuristic();
        this.cost = this.depth + this.heuristic;
      }

      // We could guarantee that we wont return to the same node for better heuristics
      calculateHeuristic() {
        // Calculate the sum of Manhattan distances for each tile
        // The manhattan distance is used as heuristics to calculate the sortest distance of a cell to its goal position
        let heuristic = 0;
        for (let i = 0; i < this.state.length; i++) {
          for (let j = 0; j < this.state[i].length; j++) {
            if (this.state[i][j] !== 0) {
              const goalPosition = findTile(goalState, this.state[i][j]);
              heuristic += manhattanDistance([i, j], goalPosition);
            }
          }
        }
        return heuristic;
      }
  
      expand() {
        const actions = ["left", "right", "up", "down"];
        const children = [];
        const [emptyRow, emptyCol] = findTile(this.state, 0);
        const biggestDepth = []
  
        for (const action of actions) {
          const newState = this.applyAction(action, emptyRow, emptyCol);
          if (newState) {
            children.push(
              new Node(newState, this, action, this.depth + 1)
            );
            // console.log("depth: ", this.depth)
            
          }
        }
        return children;
      }
  
      applyAction(action, emptyRow, emptyCol) {
        const newState = [...this.state.map(row => [...row])];
        switch (action) {
          case "left":
            if (emptyCol > 0) {
              [newState[emptyRow][emptyCol], newState[emptyRow][emptyCol - 1]] =
                [newState[emptyRow][emptyCol - 1], newState[emptyRow][emptyCol]];
              return newState;
            }
            break;
          case "right":
            if (emptyCol < 2) {
              [newState[emptyRow][emptyCol], newState[emptyRow][emptyCol + 1]] =
                [newState[emptyRow][emptyCol + 1], newState[emptyRow][emptyCol]];
              return newState;
            }
            break;
          case "up":
            if (emptyRow > 0) {
              [newState[emptyRow][emptyCol], newState[emptyRow - 1][emptyCol]] =
                [newState[emptyRow - 1][emptyCol], newState[emptyRow][emptyCol]];
              return newState;
            }
            break;
          case "down":
            if (emptyRow < 2) {
              [newState[emptyRow][emptyCol], newState[emptyRow + 1][emptyCol]] =
                [newState[emptyRow + 1][emptyCol], newState[emptyRow][emptyCol]];
              return newState;
            }
            break;
          default:
            break;
        }

        return null;
      }
    }
  
    // Helper function to find the position of a tile
    const findTile = (state, tile) => {
      for (let i = 0; i < state.length; i++) {
        for (let j = 0; j < state[i].length; j++) {
          if (state[i][j] === tile) {
            return [i, j];
          }
        }
      }
      return null;
    };
  
    // A* search
    const openSet = [new Node(initialPuzzle)];
    const closedSet = new Set();
  
    while (openSet.length > 0) {
      openSet.sort((a, b) => a.cost - b.cost);
      const currentNode = openSet.shift();
      const currentState = currentNode.state.toString();

      // Increment count of nodes
      visitedNodes++;
      setVisitedNodes(visitedNodes)
      console.log('VISITED NODES!!::', visitedNodes);
  
      if (currentState === goalState.toString()) {
        // Reconstruct the path to the solution
        const path = [];
        let current = currentNode;
        while (current !== null) {
          path.unshift(current.state);
          current = current.parent;
        }
        return path;
      }
  
      if (!closedSet.has(currentState)) {
        closedSet.add(currentState);
        const children = currentNode.expand();
        for (const child of children) {
          if (!closedSet.has(child.state.toString())) {
            openSet.push(child);
          }
        }
      }
    }
  
    return null; // No solution found
  };

  const handleShuffleClick = async () => {
    if (!solving) {
      // setPuzzle(shuffleBoard());
      shuffleBoard()
      setSolvedPuzzle(null);
    }
  };

  const handleSolveClick = () => {
    if (!solving) {
      setSolving(true);
    }
  };

  return (
    <div className="App">
      <h1>8-Puzzle Solver</h1>
      <div className="buttons">
        <button onClick={handleShuffleClick}>Shuffle</button>
        <button onClick={handleSolveClick}>Solve</button>
      </div>
      {renderBoard(puzzle)}
      {/* <Board board={puzzle}/> */}
      {solvedPuzzle && <div className="solution"><>Visited nodes: {visitedNodes}</>{renderBoard(solvedPuzzle)}</div>}
      {/* {solvedPuzzle && <div className="solution"><Board board={solvedPuzzle}/></div>} */}
    </div>
  );
}

export default App;
