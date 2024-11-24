import React, { useEffect, useState } from "react";
import "./App.css";
import Square from "./Square/Square";
import io from "socket.io-client";
import Swal from "sweetalert2";

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

  const [playOnline, setPlayOnline] = useState(false);
  const [playerName, setPlayerName] = useState("");
  const [opponentName, setOpponentName] = useState(null);

  const [socket, setSocket] = useState(null);
  const [playingAs, setPlayingAs] = useState(null);

  const checkWinner = () => {
    // row dynamic
    for (let row = 0; row < gameState.length; row++) {
      if (
        gameState[row][0] === gameState[row][1] &&
        gameState[row][1] === gameState[row][2]
      ) {
        setFinishedArrayState([row * 3 + 1, row * 3 + 2, row * 3 + 3]);
        return gameState[row][0];
      }
    }

    // column dynamic
    for (let col = 0; col < gameState.length; col++) {
      if (
        gameState[0][col] === gameState[1][col] &&
        gameState[1][col] === gameState[2][col]
      ) {
        setFinishedArrayState([col + 1, col + 4, col + 7]);
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
    }
  }, [gameState]);

  const takePlayerName = async () => {
    const result = await Swal.fire({
      title: "Enter your Name",
      input: "text",
      showCancelButton: true,
      inputValidator: (value) => {
        if (!value) {
          return "You need to write something!";
        }
      },
    });
    return result;
  };

  useEffect(() => {
    if (socket) {
      socket.on("opponentLeftMatch", () => {
        setFinishedState("opponentLeftMatch");
      });

      socket.on("playerMoveFromServer", (data) => {
        const id = data.state.id;
        setGameState((prevState) => {
          let newState = [...prevState];
          const row = Math.floor((id - 1) / 3);
          const col = (id - 1) % 3;
          newState[row][col] = data.state.sign;
          return newState;
        });
        setCurrentPlayer(data.state.sign === "circle" ? "cross" : "circle");
      });

      socket.on("connect", () => {
        setPlayOnline(true);
      });

      socket.on("disconnect", () => {
        setPlayOnline(false);
      });
      socket.on("OpponentFound", (data) => {
        setPlayingAs(data.playingAs);
        setOpponentName(data.opponentName);
      });
      socket.on("OpponentNotFound", () => {
        setOpponentName(false);
      });
    }

    return () => {
      if (socket) {
        socket.off("connect");
        socket.off("disconnect");
      }
    };
  }, [socket]);

  async function clickPlayOnline() {
    const result = await takePlayerName();

    if (!result.isConfirmed) return;

    const username = result.value;
    setPlayerName(username);

    const newSocket = io("http://localhost:3000", {
      autoConnect: true,
    });

    newSocket?.emit("request_to_play", {
      playerName: username,
    });

    setSocket(newSocket);
  }

  if (!playOnline) {
    return (
      <>
        <div className="main-div">
          <button onClick={clickPlayOnline} className="playOnline">
            Play Online
          </button>
        </div>
      </>
    );
  }

  if (playOnline && !opponentName) {
    return (
      <>
        <div className="main-div">
          <h1 className="game-heading">Waiting for Opponent...</h1>
        </div>
      </>
    );
  }

  return (
    <div className="main-div">
      <div className="move-detection">
        <div
          className={`left ${
            currentPlayer === playingAs ? "current-move-" + currentPlayer : ""
          }`}
        >
          {playerName}
        </div>
        <div
          className={`right ${
            currentPlayer !== playingAs ? "current-move-" + currentPlayer : ""
          }`}
        >
          {opponentName}
        </div>
      </div>
      <div>
        <h1 className="game-heading water-background">Tic Tac Toe</h1>
        <div className="square-wrapper">
          {gameState.map((arr, rowIndex) => {
            return arr.map((e, colIndex) => {
              return (
                <Square
                  socket={socket}
                  playingAs={playingAs}
                  gameState={gameState}
                  finishedArrayState={finishedArrayState}
                  finishedState={finishedState}
                  currentPlayer={currentPlayer}
                  setCurrentPlayer={setCurrentPlayer}
                  setGameState={setGameState}
                  id={rowIndex * 3 + colIndex + 1}
                  key={rowIndex * 3 + colIndex + 1}
                  currentElement={e}
                />
              );
            });
          })}
        </div>
        {finishedState &&
          finishedState !== "opponentLeftMatch" &&
          finishedState !== "draw" && (
            <h3 className="winner-state">
              {finishedState === playingAs ? "you" : finishedState} won the game
            </h3>
          )}
        {finishedState &&
          finishedState !== "opponentLeftMatch" &&
          finishedState === "draw" && (
            <h3 className="winner-state">Match Draw</h3>
          )}
      </div>
      {!finishedState && opponentName && (
        <h3 className="winner-state">You are playing against {opponentName}</h3>
      )}
      {finishedState && finishedState === "opponentLeftMatch" && (
        <h3 className="winner-state">
          You won the match ,Opponent Left the Match
        </h3>
      )}
    </div>
  );
}
