const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");
const meetings = {};


const app = express();

app.use(cors());

const server = http.createServer(app);
require("dotenv").config();
console.log(
  "GROQ KEY:",
  process.env.GROQ_API_KEY
);
const Groq = require("groq-sdk");

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

const roomUsers = {};
const attendance = {};
const roomAnalytics = {};

io.on("connection", (socket) => {
  socket.on(
  "generate_ai_insights",
  async (data) => {
    console.log(
  "AI REQUEST RECEIVED"
);

    try {

      const prompt = `
Analyze this meeting.

Duration:
${data.duration}

Average Focus:
${data.averageFocus}

Participants Joined:
${data.joined}

Participants Left:
${data.left}

Top Performer:
${data.topPerformer}

Generate:
1. Meeting Summary
2. Engagement Analysis
3. Recommendations

Keep it under 150 words.
`;

      const completion =
        await groq.chat.completions.create({

          model:
            "llama-3.3-70b-versatile",

          messages: [
            {
              role: "user",
              content: prompt,
            },
          ],

        });
        console.log(
          completion.choices[0]
    .message.content
);
      socket.emit(
        "ai_insights_result",
        completion.choices[0]
          .message.content
      );

    } catch (err) {

      console.log(
  "GROQ ERROR:",
  err.message
);

      socket.emit(
        "ai_insights_result",
        "Unable to generate AI insights."
      );

    }

  }
);
  socket.on("create_meeting", (data) => {
    const meetingId =
    "FM" + Math.floor(100000 + Math.random() * 900000);

  meetings[meetingId] = {
    hostId: socket.id,
    hostName: data.hostName,
    password: data.password,
    startTime: Date.now(),
  participants: [ {
    socketId: socket.id,
    username: data.hostName,
  },],
  };
socket.join(meetingId);
io.to(meetingId).emit(
  "participants_update",
  meetings[meetingId].participants
);
  console.log("CREATED:", meetingId);
console.log("PASSWORD:", data.password);
console.log("MEETINGS:", meetings);

  socket.emit("meeting_created", {
  meetingId,
  startTime: meetings[meetingId].startTime,
});

});
socket.on(
  "webrtc_offer",
  (data) => {

    io.to(data.target).emit(
      "webrtc_offer",
      {
        offer: data.offer,
        sender: socket.id,
      }
    );

  }
);

socket.on(
  "webrtc_answer",
  (data) => {
    if (
  data.answer?.type !== "answer"
) {

  console.log(
    "IGNORING NON-ANSWER:",
    data.answer?.type
  );

  return;

}

    console.log(
      "SERVER RECEIVED ANSWER:",
      data
    );

    console.log(
      "SERVER SENDING ANSWER:",
      {
        answer: data.answer,
        sender: socket.id,
      }
    );

    io.to(data.target).emit(
      "webrtc_answer",
      {
        answer: data.answer,
        sender: socket.id,
      }
    );

  }
);

socket.on(
  "ice_candidate",
  (data) => {
    console.log(
      "SERVER ICE RELAY"
    );


    io.to(data.target).emit(
      "ice_candidate",
      {
        candidate:
          data.candidate,
        sender: socket.id,
      }
    );

  }
);



socket.on("join_meeting", (data) => {
  console.log("JOIN REQUEST:", data);
console.log("FOUND MEETING:", meetings[data.meetingId]);

  const meeting = meetings[data.meetingId];

  if (!meeting) {
    socket.emit("join_error", "Meeting not found");
    return;
  }

  if (meeting.password !== data.password) {
    socket.emit("join_error", "Wrong password");
    return;
  }

  socket.join(data.meetingId);

  meeting.participants.push({
    socketId: socket.id,
    username: data.username,
  });
  console.log(
  "PARTICIPANTS UPDATE EMITTED:",
  meeting.participants
);

  io.to(data.meetingId).emit(
    "participants_update",
    meeting.participants
  );

  socket.emit("join_success", {
  hostName: meeting.hostName,
  startTime: meeting.startTime,
});
socket.emit(
  "participants_update",
  meeting.participants
);
});

  // JOIN ROOM
  socket.on("join_room", (data) => {
   console.log(
    "JOIN_ROOM DATA:",
    data
  );

     const room = data.room;
  const username = data.username;

  socket.room = room;
  socket.username = username;

  socket.join(room);

    if (!roomUsers[room]) {
      roomUsers[room] = [];
    }
    if (!attendance[room]) {

  attendance[room] = {
    joined: [],
    left: [],
  };

}

    if (!roomUsers[room].includes(socket.id)) {
      roomUsers[room].push(socket.id);
    }
    attendance[room].joined.push(
  username
);

    console.log(`${socket.id} joined room ${room}`);
    console.log(
  "EMITTING ROOM USERS:",
  roomUsers[room]
);

    io.to(room).emit("room_users", roomUsers[room]);
    const meeting =
  meetings[room];

if (meeting) {
  console.log(
  "EMITTING PARTICIPANTS:",
  meeting?.participants
);

  io.to(room).emit(
    "participants_update",
    meeting.participants
  );

}
    io.to(room).emit(
  "attendance_update",
  attendance[room]
);

  });

  // CHAT MESSAGE
socket.on("send_message", (data) => {

  console.log(
    "CHAT RECEIVED:",
    data
  );

  io.to(data.room).emit(
    "receive_message",
    data
  );

});

  
//Analytics Dashboard
  socket.on("focus_update", (data) => {

  roomAnalytics[socket.id] = {
    username: data.username,
    room: data.room,
    focusStatus: data.focusStatus,
    focusScore: data.focusScore,
  };

  const roomData = {};

  Object.entries(roomAnalytics)
    .forEach(([id, user]) => {

      if (
        user.room === data.room
      ) {
        roomData[id] = user;
      }

    });

  io.to(data.room).emit(
    "analytics_update",
    roomData
  );

});
socket.on("leave_room", (data) => {

  socket.leave(data.room);

  if (roomUsers[data.room]) {

    roomUsers[data.room] =
      roomUsers[data.room].filter(
        (id) => id !== socket.id
      );

    io.to(data.room).emit(
      "room_users",
      roomUsers[data.room]
    );

  }

});

  // DISCONNECT
  // DISCONNECT
socket.on("disconnect", () => {

  delete roomAnalytics[socket.id];

  console.log(
    "User Disconnected:",
    socket.id
  );
  for (const meetingId in meetings) {

  const meeting =
    meetings[meetingId];

  meeting.participants =
    meeting.participants.filter(
      (p) =>
        p.socketId !== socket.id
    );
    console.log(
  "UPDATED PARTICIPANTS:",
  meeting.participants
);

  io.to(meetingId).emit(
    "participants_update",
    meeting.participants
  );

}

  io.emit(
    "analytics_update",
    roomAnalytics
  );

  // Attendance tracking
  if (
    socket.room &&
    attendance[socket.room]
  ) {

    attendance[
      socket.room
    ].left.push(
      socket.username
    );

    io.to(
      socket.room
    ).emit(
      "attendance_update",
      attendance[
        socket.room
      ]
    );

  }

  // Remove user from rooms
  for (const room in roomUsers) {

    roomUsers[room] =
      roomUsers[room].filter(
        (id) =>
          id !== socket.id
      );

    io.to(room).emit(
      "room_users",
      roomUsers[room]
    );

    if (
      roomUsers[room]
        .length === 0
    ) {
      delete roomUsers[room];
    }

  }

});

    
socket.on(
  "end_meeting",
  async (room) => {
    console.log(
  "SERVER RECEIVED END_MEETING:",
  room
);
     console.log(
      "ENDING ROOM:",
      room
    );

    io.to(room).emit(
      "meeting_ended"
    );
    console.log(
  "MEETING_ENDED EMITTED"
);
socket.on(
  "meeting_ended",
  () => {

    console.log(
      "MEETING_ENDED RECEIVED"
    );

    alert(
      "Meeting ended by host"
    );

    navigate("/");

  }
);

    const sockets =
      await io
        .in(room)
        .fetchSockets();

    for (const s of sockets) {
      s.leave(room);
    }

    delete roomUsers[room];
     console.log(
      "Meeting Ended:",
      room
    );


  }
);
});

server.listen(
  5000,
  "0.0.0.0",
  () => {
    console.log(
      "Server running on port 5000"
    );
  }
);