import { createServer } from "http";
import { Server } from "socket.io";

const httpServer = createServer();
const io = new Server(httpServer, {
  cors: "http://localhost:5174",
});

const allUsers = {};

io.on("connection", (socket) => {
  allUsers[socket.id] = {
    id: socket.id,
    online: true,
  };

  socket.on("request_to_play", (data) => {
    const currentUser = allUsers[socket.id];
    currentUser.playerName = data.playerName;

    let opponentPlayer;

    for (const key in allUsers) {
      const user = allUsers[key];
      if (user.online && !user.playing && socket.id !== key) {
        opponentPlayer = user;
        break;
      }
    }

    if (opponentPlayer) {
      socket.to(opponentPlayer.id).emit("OpponentFound", {
        opponentName: currentUser.playerName,
      });
      socket.emit("OpponentFound", {
        opponentName: opponentPlayer.playerName,
      });
    } else {
      socket.emit("OpponentNotFound");
    }
  });

  socket.on("disconnect", function () {
    const currentUser = allUsers[socket.id];
    currentUser.online = false;
  });
  console.log(socket.id);
});

httpServer.listen(3000);
