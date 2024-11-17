import { createServer } from "http";
import { Server } from "socket.io";

const httpServer = createServer();
const io = new Server(httpServer, {
    cors:  "http://localhost:5174",
});

io.on("connection", (socket) => {
  console.log("a user connected");
  console.log(socket.id);
});

httpServer.listen(3000);