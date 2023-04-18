const registerForm = document.getElementById("register-form");
const callButton = document.getElementById("call-button");
const socket = io();

registerForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const username = document.getElementById("username").value;

  socket.emit("register", username);
});

callButton.addEventListener("click", () => {
  socket.emit("start-call");
});

socket.on("registration-success", () => {
  callButton.disabled = false;
});

socket.on("start-call", async () => {
  const connections = {};

  const users = await fetch("/users").then((res) => res.json());

  users.forEach((user) => {
    const connection = new RTCPeerConnection();
    connections[user.id] = connection;

    connection.onicecandidate = (event) => {
      if (event.candidate) {
        socket.emit("ice-candidate", user.id, event.candidate);
      }
    };

    connection.createOffer().then((offer) => {
      connection.setLocalDescription(offer);
      socket.emit("offer", user.id, offer);
    });
  });
});

socket.on("offer", (userId, offer) => {
  const connection = new RTCPeerConnection();
  connections[userId] = connection;

  connection.onicecandidate = (event) => {
    if (event.candidate) {
      socket.emit("ice-candidate", userId, event.candidate);
    }
  };

  connection.setRemoteDescription(offer);

  connection.createAnswer().then((answer) => {
    connection.setLocalDescription(answer);
    socket.emit("answer", userId, answer);
  });
});

socket.on("answer", (userId, answer) => {
  connections[userId].setRemoteDescription(answer);
});

socket.on("ice-candidate", (userId, candidate) => {
  connections[userId].addIceCandidate(candidate);
});
