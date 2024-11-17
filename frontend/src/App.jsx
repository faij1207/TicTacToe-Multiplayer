import React, { useEffect, useState } from "react";
import "./App.css";
import Square from "./Square/Square";

const renderForm = [
  [1, 2, 3],
  [4, 5, 6],
  [7, 8, 9],
];

export default function App() {
  const [gameState, setGameState] = useState(renderForm);

  const [currentPlayer, setCurrentPlayer] = useState("circle");
  const [finishedState, setFinishedState] = useState(false);
  const [finishedArrayState, setFinishedArrayState] = useState([]);

  const[playOnline, setPlayOnline] = useState(false);

  const checkWinner = () => {
    // row dynamic
    for (let row = 0; row < gameState.length; row++) {
      if (
        gameState[row][0] === gameState[row][1] &&
        gameState[row][1] === gameState[row][2]
      ) {
        setFinishedArrayState([row*3+1, row*3+2, row*3+3]);
        return gameState[row][0];
      }
    }

    // column dynamic
    for (let col = 0; col < gameState.length; col++) {
      if (
        gameState[0][col] === gameState[1][col] &&
        gameState[1][col] === gameState[2][col]
      ) {
        setFinishedArrayState([col+1, col+4, col+7]);
        return gameState[0][col];
      }
    }
    // diagonal checks
    if (
      gameState[0][0] === gameState[1][1] &&
      gameState[1][1] === gameState[2][2]
    ) {
      setFinishedArrayState([1, 5, 9]);
      return gameState[0][0];
    }

    if (
      gameState[0][2] === gameState[1][1] &&
      gameState[1][1] === gameState[2][0]
    ) {
      setFinishedArrayState([3, 5, 7]);
      return gameState[0][2];
    }

    // check for draw match
    const isDrawMatch = gameState.flat().every((e) => {
      if (e === "circle" || e === "cross") return true;
    });

    if (isDrawMatch) return "draw";

    return null;
  };

  useEffect(() => {
    const winner = checkWinner();
    if (winner) {
      setFinishedState(winner);
      console.log("winner is", winner);
    }
  }, [gameState]);

  if(!playOnline){
    return(
      <>
      <div className="main-div">
        <button className="playOnline">Play Online</button>
      </div>
      </>
    )
  }

  return (
    <div className="main-div">
      <div className="move-detection">
        <div className="left">Yourself</div>
        <div className="right">Opponent</div>
      </div>
      <div>
        <h1 className="game-heading water-background">Tic Tac Toe</h1>
        <div className="square-wrapper">
          {gameState.map((arr, rowIndex) => {
            return arr.map((e, colIndex) => {
              return (
                <Square
                  finishedArrayState={finishedArrayState}
                  finishedState={finishedState}
                  currentPlayer={currentPlayer}
                  setCurrentPlayer={setCurrentPlayer}
                  setGameState={setGameState}
                  id={rowIndex * 3 + colIndex + 1}
                  key={rowIndex * 3 + colIndex + 1}
                />
              );
            });
          })}
        </div>
        {finishedState && finishedState !== "draw" && (
          <h3 className="winner-state">{finishedState} won the game</h3>
        )}
        {finishedState === "draw" && (
          <h3 className="winner-state">Match Draw</h3>
        )}
      </div>
    </div>
  );
}
