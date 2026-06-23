import { useEffect, useRef, useState } from "react";
import * as faceapi from "face-api.js";
import { io } from "socket.io-client";
import Dashboard from "./Dashboard";
import { jsPDF } from "jspdf";
import { useNavigate } from "react-router-dom";

const socket = io(
  import.meta.env.VITE_SERVER_URL
);


socket.on("connect", () => {
  
});


socket.on("connect_error", (err) => {
  console.log(
    "SOCKET CONNECTION ERROR:",
    err.message
  );
});
 

function MeetingRoom() {
  
  const [remoteStreams, setRemoteStreams] =
  useState([]);
  const navigate = useNavigate();
  
const startTime =
  Number(
    localStorage.getItem(
      "startTime"
    )
  ) || Date.now();
  const [meetingDuration,
  setMeetingDuration] =
  useState(0);

  const meetingId =
    localStorage.getItem("meetingId") || "Not Found";
   

  const hostName =
    localStorage.getItem("hostName") || "Unknown Host";
  
  const username =
    localStorage.getItem("username") || "Host";
  const isHost =
  username === hostName;

 

  const videoRef = useRef(null);
const peerConnections = useRef({});

const [focusStatus, setFocusStatus] =
    useState("Loading AI...");

const [focusScore, setFocusScore] =
    useState(100);
const [analytics, setAnalytics] =
  useState({});
  const [aiInsights,
  setAiInsights] =
  useState("");

  const focusedSeconds = useRef(0);
  const totalSeconds = useRef(0);

 const [participants, setParticipants] = useState([]);
 
 const createPeerConnection = (
  socketId
) => {
  if (
  peerConnections.current[
    socketId
  ]
) {

  return peerConnections.current[
    socketId
  ];

}
  const peer =
    new RTCPeerConnection({
      iceServers: [
        {
          urls:
            "stun:stun.l.google.com:19302",
        },
      ],
    });
    
    peerConnections.current[
  socketId
] = peer;

  if (!window.localStream) {

  

} else {

  window.localStream
    .getTracks()
    .forEach((track) => {

      peer.addTrack(
        track,
        window.localStream
      );

    });

}
  peer.ontrack = (event) => {
    

    const stream =
      event.streams[0];

    setRemoteStreams((prev) => {

      const exists =
        prev.find(
          (s) =>
            s.id === stream.id
        );

      if (exists) return prev;

      return [...prev, stream];

    });

  };

  peer.onicecandidate = (
  event
) => {

  if (!event.candidate) {
    return;
  }


    

    socket.emit(
      "ice_candidate",
      {
        target: socketId,
        candidate:
          event.candidate,
      }
    );

  }


  peerConnections.current[
    socketId
  ] = peer;

  peer.onconnectionstatechange = () => {

  

};

peer.oniceconnectionstatechange = () => {

  

};
  return peer;

};

  const [message, setMessage] =
    useState("");

  const [messages, setMessages] = useState([]);
  const [attendanceData,
  setAttendanceData] =
  useState({
    joined: [],
    left: [],
  });
  const [showSummary, setShowSummary] =
  useState(false);
  
  // Chat listener
  useEffect(() => {

  socket.on(
    "receive_message",
    (data) => {

      

      setMessages((prev) => [
        ...prev,
        data,
      ]);

    }
  );

  return () => {
    socket.off(
      "receive_message"
    );
  };

}, []);
useEffect(() => {

  const timer =
    setInterval(() => {

      const elapsed =
        Math.floor(
          (
            Date.now() -
            startTime
          ) / 1000
        );

      setMeetingDuration(
        elapsed
      );

    }, 1000);

  return () =>
    clearInterval(timer);

}, [startTime]);

//Timer
useEffect(() => {

  const timer =
    setInterval(() => {

      setMeetingDuration(
        (prev) => prev + 1
      );

    }, 1000);

  return () =>
    clearInterval(timer);

}, []);
//Ai Insights Listener
useEffect(() => {

  socket.on(
    "ai_insights_result",
    (data) => {

      

      setAiInsights(
        data
      );

    }
  );

  return () => {

    socket.off(
      "ai_insights_result"
    );

  };

}, []);

  
  // Auto join meeting room
  useEffect(() => {

  

  

}, []);

useEffect(() => {
  
  socket.on(
  "webrtc_offer",
  async (data) => {

    
    let peer =
      createPeerConnection(
        data.sender
      );

    

    if (!peer) {
      
      return;
    }

    if (
      peer.signalingState !== "stable"
    ) {

      
      return;
    }

    await peer.setRemoteDescription(
      new RTCSessionDescription(
        data.offer
      )
    );

    
let answer;
    try {


 answer =
  await peer.createAnswer();

  

} catch (err) {

  console.error(
    "CREATE ANSWER ERROR:",
    err
  );

}
if (!answer) {

  
  return;
}
    await peer.setLocalDescription(
      answer
    );

    
  

  





socket.emit(
  "webrtc_answer",
  {
    target: data.sender,
    answer: peer.localDescription,
  }
);
    

    

  }
);

  return () => {
    socket.off("webrtc_offer");
  };

}, []);

useEffect(() => {

 
socket.on(
    "room_users",
    async (users) => {

      
      

      if (!isHost) {
        return;
      }

      users.forEach(
        async (userId) => {

          if (
            userId === socket.id
          ) return;

          

          const peer =
            createPeerConnection(
              userId
            );

          if (!peer) return;

          const offer =
            await peer.createOffer();

          await peer.setLocalDescription(
            offer
          );

          socket.emit(
            "webrtc_offer",
            {
              target: userId,
              offer,
            }
          );

          

        }
      );

    }
  );
socket.on(
  "participants_update",
  (list) => {

    

    setParticipants(
      list
    );

  }
);

  return () => {

    socket.off(
      "room_users"
    );

    socket.off(
      "participants_update"
    );

  };

}, []);
useEffect(() => {

  socket.on(
    "webrtc_answer",
    async (data) => {

      
      

    

   

      const peer =
        peerConnections.current[
          data.sender
        ];

      if (peer) {

        try {

  await peer.setRemoteDescription(
  new RTCSessionDescription(
    data.answer
  )
);

  

} catch (err) {

  console.error(
    "REMOTE DESCRIPTION ERROR:",
    err
  );

}

      }

    }
  );

  return () => {
    socket.off("webrtc_answer");
  };

}, []);
useEffect(() => {

  socket.on(
    "meeting_ended",
    () => {

      // Host should stay
      if (isHost) return;

      

      alert(
        "Meeting ended by host"
      );

      window.location.href = "/";

    }
  );

  return () => {

    socket.off(
      "meeting_ended"
    );

  };

}, [isHost]);
useEffect(() => {

  socket.on(
  "ice_candidate",
  async (data) => {

    

    const peer =
      peerConnections.current[
        data.sender
      ];

    if (peer) {

      await peer.addIceCandidate(
        data.candidate
      );
      

    }

  }
);

  return () => {
    socket.off("ice_candidate");
  };

}, []);
//Analytics Dashboard
useEffect(() => {

  const interval = setInterval(() => {

    socket.emit("focus_update", {
      room: meetingId,
      username,
      focusStatus,
      focusScore,
    });

  }, 3000);

  return () => clearInterval(interval);

}, [
  meetingId,
  username,
  focusStatus,
  focusScore,
]);
//Attendance Update
useEffect(() => {

  socket.on(
    "attendance_update",
    (data) => {

      

      setAttendanceData(
        data
      );

    }
  );

  return () => {

    socket.off(
      "attendance_update"
    );

  };

}, []);
useEffect(() => {

  socket.on(
    "analytics_update",
    (data) => {

      

      setAnalytics(data);

    }
  );

  return () => {

    socket.off(
      "analytics_update"
    );

  };

}, []);

const sendMessage = () => {

   if (!message.trim()) return;

  console.log("SENDING:", {
    room: meetingId,
    username,
    message,
  });

  socket.emit("send_message", {
    room: meetingId,
    username,
    message,
  });

  setMessage("");

};
const leaveMeeting = () => {

  // Stop camera
  if (videoRef.current?.srcObject) {

    const tracks =
      videoRef.current.srcObject.getTracks();

    tracks.forEach((track) =>
      track.stop()
    );

  }

  // Disconnect socket
  socket.disconnect();

  // Clear user data
  localStorage.removeItem("username");

  // Go back to Home
  window.location.href = "/";

};
  useEffect(() => {
  loadModels();
}, []);

  const loadModels = async () => {

  try {

    await faceapi.nets.tinyFaceDetector.loadFromUri(
      "/models"
    );

    

    startVideo();

  } catch (err) {

  console.error(err);

  setFocusStatus(
    "Camera Disabled"
  );

 

 



socket.emit(
  "join_room",
  {
    room: meetingId,
    username: username,
  }
);

}

};
 const startVideo = async () => {
    try {
       const stream =
  await navigator.mediaDevices.getUserMedia({
    video: true,
    audio: false,
  });

videoRef.current.srcObject = stream;
window.localStream = stream;
     


socket.emit(
  "join_room",
  {
    room: meetingId,
    username,
  }
);



      videoRef.current.onloadedmetadata = () => {
        detectFace();
      };

    } catch (err) {

  console.error(err);

  setFocusStatus(
    "Camera Disabled"
  );

  

  

  socket.emit(
  "join_room",
  {
    room: meetingId,
    username,
  }
);

}
  };

  const detectFace = () => {
    let missedFrames = 0;

    setInterval(async () => {

      if (!videoRef.current) return;

      const detections =
        await faceapi.detectAllFaces(
          videoRef.current,
          new faceapi.TinyFaceDetectorOptions()
        );

      totalSeconds.current++;

      if (detections.length > 0) {

        missedFrames = 0;

        focusedSeconds.current++;

        setFocusStatus("Focused ✅");

      } else {

        missedFrames++;

        if (missedFrames >= 3) {
          setFocusStatus("Distracted ❌");
        }

      }
      

      const score =
        (focusedSeconds.current /
          totalSeconds.current) *
        100;

      setFocusScore(score.toFixed(1));

    }, 1000);
  };
  const totalTracked =
  Object.keys(analytics).length;

const distractedCount =
  Object.values(analytics).filter(
    (user) =>
      user.focusStatus.includes(
        "Distracted"
      )
  ).length;

const focusedCount =
  totalTracked - distractedCount;
  



const rankedUsers =
  Object.values(analytics)
    .sort(
      (a, b) =>
        Number(b.focusScore) -
        Number(a.focusScore)
    );

const showAlert =
  totalTracked > 0 &&
  distractedCount /
    totalTracked >
    0.5;

const averageFocus =
  rankedUsers.length > 0
    ? (
        rankedUsers.reduce(
          (sum, user) =>
            sum +
            Number(
              user.focusScore
            ),
          0
        ) / rankedUsers.length
      ).toFixed(1)
    : 0;
    
const endMeeting = () => {
  setAiInsights(
  generateInsights()
);

  
  socket.emit(
  "generate_ai_insights",
  {
    duration:
      formatTime(
        meetingDuration
      ),

    averageFocus,

    joined:
      attendanceData.joined
        .length,

    left:
      attendanceData.left
        .length,

    topPerformer:
      topUser?.username ||
      "N/A",
  }
);

  setShowSummary(true);
  const report = {

  meetingId,

  date: new Date()
    .toLocaleString(),

  duration: formatTime(
    meetingDuration
  ),

  averageFocus,

  topPerformer:
    topUser?.username ||
    "N/A",

  aiInsights,

};

const reports =
  JSON.parse(
    localStorage.getItem(
      "meetingHistory"
    )
  ) || [];

reports.push(report);

localStorage.setItem(
  "meetingHistory",
  JSON.stringify(
    reports
  )
);

  socket.emit(
    "end_meeting",
    meetingId
  );

};
const topUser =
  rankedUsers.length > 0
    ? rankedUsers[0]
    : null;
    const generateInsights = () => {

  const avg =
    Number(averageFocus);

  let effectiveness =
    "Average";

  if (avg >= 80)
    effectiveness =
      "Excellent";

  else if (avg >= 60)
    effectiveness =
      "Good";

  else
    effectiveness =
      "Needs Improvement";

  return `
Meeting Effectiveness: ${effectiveness}

Attendance:
${attendanceData.joined.length} participants attended.

Engagement:
Average focus was ${averageFocus}%.

Top Performer:
${topUser?.username || "N/A"} achieved ${
    topUser?.focusScore || 0
  }% focus.

Observation:
${
  avg >= 80
    ? "Participants remained highly attentive."
    : avg >= 60
    ? "Moderate engagement was observed."
    : "Frequent distractions were detected."
}

Recommendation:
${
  avg >= 80
    ? "Meeting was productive."
    : "Consider shorter meetings and more interaction."
}
`;

};
   


const downloadReport = () => {

  const doc =
    new jsPDF();

  doc.setFontSize(20);

  doc.text(
    "FocusMeet Meeting Report",
    20,
    20
  );

  doc.setFontSize(12);

  doc.text(
    `Meeting ID: ${meetingId}`,
    20,
    40
  );

  doc.text(
    `Duration: ${formatTime(meetingDuration)}`,
    20,
    50
  );

  doc.text(
    `Participants Joined: ${attendanceData.joined.length}`,
    20,
    60
  );

  doc.text(
    `Participants Left: ${attendanceData.left.length}`,
    20,
    70
  );

  doc.text(
    `Average Focus: ${averageFocus}%`,
    20,
    80
  );

  if (topUser) {

    doc.text(
      `Top Performer: ${topUser.username} (${topUser.focusScore}%)`,
      20,
      90
    );

  }

  let y = 110;

  doc.text(
    "Leaderboard",
    20,
    y
  );

  y += 10;

  rankedUsers.forEach(
    (user, index) => {

      doc.text(
        `${index + 1}. ${user.username} - ${user.focusScore}%`,
        20,
        y
      );

      y += 10;

    }
  );

  doc.save(
    "FocusMeet_Report.pdf"
  );

};
const formatTime = (seconds) => {

  const hrs = Math.floor(
    seconds / 3600
  );

  const mins = Math.floor(
    (seconds % 3600) / 60
  );

  const secs =
    seconds % 60;

  return `${String(hrs).padStart(2,"0")}:${String(mins).padStart(2,"0")}:${String(secs).padStart(2,"0")}`;

};

return (
  <>
    {/* Embedded professional CSS – responsive, animated, expressive */}
    <style>{`
      :root {
        --primary: #4f46e5;
        --primary-hover: #4338ca;
        --danger: #dc2626;
        --danger-hover: #b91c1c;
        --success: #16a34a;
        --warning: #f59e0b;
        --bg: #f8fafc;
        --card-bg: #ffffff;
        --text: #1e293b;
        --text-light: #64748b;
        --border: #e2e8f0;
        --shadow-sm: 0 1px 2px 0 rgb(0 0 0 / 0.05);
        --shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1);
        --shadow-md: 0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1);
        --radius: 12px;
        --transition: 0.2s ease;
      }

      * {
        box-sizing: border-box;
      }

      body {
        margin: 0;
        background: #f1f5f9;
        font-family: 'Inter', system-ui, -apple-system, sans-serif;
        color: var(--text);
      }

      .meeting-room {
        max-width: 1400px;
        margin: 0 auto;
        padding: 24px;
        display: grid;
        grid-template-columns: 1fr 340px;
        gap: 24px;
      }

      @media (max-width: 1024px) {
        .meeting-room {
          grid-template-columns: 1fr;
        }
      }

      @media (max-width: 640px) {
        .meeting-room {
          padding: 16px;
        }
      }

      /* Header */
      .meeting-header {
        grid-column: 1 / -1;
        background: white;
        border-radius: var(--radius);
        padding: 20px 24px;
        box-shadow: var(--shadow);
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        justify-content: space-between;
        gap: 16px;
        animation: fadeSlideDown 0.4s ease-out;
      }

      @keyframes fadeSlideDown {
        from { opacity: 0; transform: translateY(-12px); }
        to { opacity: 1; transform: translateY(0); }
      }

      .meeting-title {
        font-size: 1.5rem;
        font-weight: 700;
        margin: 0;
        background: linear-gradient(135deg, var(--primary), #7c3aed);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-clip: text;
      }

      .meeting-meta {
        display: flex;
        align-items: center;
        gap: 20px;
        flex-wrap: wrap;
      }

      .duration-badge {
        background: #ede9fe;
        color: #5b21b6;
        padding: 6px 14px;
        border-radius: 30px;
        font-weight: 600;
        font-size: 0.9rem;
        display: flex;
        align-items: center;
        gap: 6px;
      }

      .host-actions {
        display: flex;
        gap: 10px;
      }

      /* Buttons */
      .btn {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        padding: 10px 18px;
        border-radius: 8px;
        font-weight: 600;
        font-size: 0.9rem;
        cursor: pointer;
        border: none;
        transition: all var(--transition);
        text-decoration: none;
        line-height: 1;
        background: white;
        color: var(--text);
        border: 1px solid var(--border);
        box-shadow: var(--shadow-sm);
      }

      .btn:hover {
        transform: translateY(-1px);
        box-shadow: var(--shadow-md);
      }

      .btn:active {
        transform: translateY(0);
        box-shadow: var(--shadow-sm);
      }

      .btn-primary {
        background: var(--primary);
        color: white;
        border-color: var(--primary);
      }

      .btn-primary:hover {
        background: var(--primary-hover);
      }

      .btn-danger {
        background: var(--danger);
        color: white;
        border-color: var(--danger);
      }

      .btn-danger:hover {
        background: var(--danger-hover);
      }

      .btn-outline {
        background: transparent;
        border: 1px solid var(--border);
      }

      .btn-outline:hover {
        background: #f1f5f9;
      }

      .btn-lg {
        padding: 12px 24px;
        font-size: 1rem;
      }

      /* Main grid areas */
      .main-content {
        display: flex;
        flex-direction: column;
        gap: 24px;
      }

      .sidebar {
        display: flex;
        flex-direction: column;
        gap: 24px;
      }

      @media (max-width: 1024px) {
        .sidebar {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
        }
      }

      @media (max-width: 640px) {
        .sidebar {
          grid-template-columns: 1fr;
        }
      }

      /* Card styling */
      .card {
        background: var(--card-bg);
        border-radius: var(--radius);
        padding: 20px;
        box-shadow: var(--shadow);
        border: 1px solid var(--border);
        transition: box-shadow var(--transition), transform var(--transition);
        animation: fadeIn 0.3s ease-out;
      }

      @keyframes fadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
      }

      .card:hover {
        box-shadow: var(--shadow-md);
      }

      .card-header {
        font-size: 1.25rem;
        font-weight: 700;
        margin: 0 0 16px 0;
        display: flex;
        align-items: center;
        gap: 8px;
      }

      /* Video containers */
      .video-grid {
        display: flex;
        flex-wrap: wrap;
        gap: 16px;
      }

      .video-wrapper {
        border-radius: var(--radius);
        overflow: hidden;
        box-shadow: var(--shadow);
        background: #000;
        transition: transform var(--transition);
      }

      .video-wrapper:hover {
        transform: scale(1.02);
      }

      .main-video {
        width: 100%;
        max-width: 640px;
        height: auto;
        aspect-ratio: 16/9;
        object-fit: cover;
      }

      .participant-video {
        width: 240px;
        height: auto;
        aspect-ratio: 4/3;
        object-fit: cover;
      }

      @media (max-width: 640px) {
        .participant-video {
          width: 100%;
        }
      }

      /* Focus score & status */
      .focus-display {
        display: flex;
        align-items: center;
        gap: 20px;
        flex-wrap: wrap;
      }

      .focus-score-circle {
        width: 90px;
        height: 90px;
        border-radius: 50%;
        background: conic-gradient(var(--primary) calc(var(--score) * 1%), #e2e8f0 0);
        display: flex;
        align-items: center;
        justify-content: center;
        font-weight: 800;
        font-size: 1.5rem;
        box-shadow: var(--shadow);
        transition: all 0.3s ease;
      }

      .focus-status-badge {
        background: #fef9c3;
        color: #854d0e;
        padding: 6px 16px;
        border-radius: 30px;
        font-weight: 600;
        animation: pulse 2s infinite;
      }

      @keyframes pulse {
        0% { box-shadow: 0 0 0 0 rgba(250, 204, 21, 0.4); }
        70% { box-shadow: 0 0 0 10px rgba(250, 204, 21, 0); }
        100% { box-shadow: 0 0 0 0 rgba(250, 204, 21, 0); }
      }

      /* Alert */
      .alert {
        background: #fee2e2;
        border: 2px solid #ef4444;
        padding: 14px;
        border-radius: var(--radius);
        display: flex;
        align-items: center;
        gap: 10px;
        animation: shake 0.5s ease-in-out;
      }

      @keyframes shake {
        0%,100% { transform: translateX(0); }
        25% { transform: translateX(-6px); }
        75% { transform: translateX(6px); }
      }

      /* Leaderboard & participants */
      .list-item {
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 10px 0;
        border-bottom: 1px solid var(--border);
        transition: background var(--transition);
      }

      .list-item:last-child {
        border-bottom: none;
      }

      .list-item:hover {
        background: #f8fafc;
        border-radius: 6px;
        padding-left: 6px;
        padding-right: 6px;
      }

      .medal {
        font-size: 1.4rem;
        width: 30px;
        text-align: center;
      }

      /* Chat */
      .chat-box {
        height: 260px;
        overflow-y: auto;
        background: #f8fafc;
        padding: 12px;
        border-radius: var(--radius);
        border: 1px solid var(--border);
      }

      .chat-input-group {
        display: flex;
        gap: 8px;
        margin-top: 12px;
      }

      .chat-input {
        flex: 1;
        padding: 10px 14px;
        border: 1px solid var(--border);
        border-radius: 8px;
        font-size: 0.95rem;
        transition: border-color var(--transition);
      }

      .chat-input:focus {
        outline: none;
        border-color: var(--primary);
        box-shadow: 0 0 0 3px rgba(79,70,229,0.1);
      }

      /* AI Insights */
      .insights-box {
        background: linear-gradient(135deg, #f0f4ff, #f5f3ff);
        border-left: 4px solid var(--primary);
        white-space: pre-wrap;
        font-size: 0.95rem;
        line-height: 1.6;
      }

      .generating-text {
        animation: fadeText 1.5s infinite;
      }

      @keyframes fadeText {
        0% { opacity: 0.5; }
        50% { opacity: 1; }
        100% { opacity: 0.5; }
      }

      /* Attendance */
      .attendance-grid {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 12px;
      }

      @media (max-width: 640px) {
        .attendance-grid {
          grid-template-columns: 1fr;
        }
      }

      .attendance-col {
        background: #f8fafc;
        border-radius: 8px;
        padding: 12px;
      }

      /* Top performer highlight */
      .top-performer {
        background: linear-gradient(135deg, #fffbeb, #fef3c7);
        border: 2px solid #f59e0b;
        padding: 12px 16px;
        border-radius: var(--radius);
        font-weight: 600;
        animation: glow 2s infinite alternate;
      }

      @keyframes glow {
        from { box-shadow: 0 0 5px #fbbf24; }
        to { box-shadow: 0 0 15px #f59e0b; }
      }

      /* Meeting Summary */
      .summary-card {
        border: 2px solid var(--success);
      }

      .download-btn {
        background: var(--success);
        color: white;
        margin-top: 12px;
      }

      .download-btn:hover {
        background: #15803d;
      }
    `}</style>

    <div className="meeting-room">
      {/* HEADER */}
      <header className="meeting-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
          <h1 className="meeting-title">📹 Meeting Room</h1>
          <div className="meeting-meta">
            <span className="duration-badge">
              ⏱ {formatTime(meetingDuration)}
            </span>
            <span style={{ fontSize: '0.9rem', color: 'var(--text-light)' }}>
              ID: {meetingId}
            </span>
            <span style={{ fontSize: '0.9rem', color: 'var(--text-light)' }}>
              👤 {username}
            </span>
          </div>
        </div>
        <div className="host-actions">
          {isHost && showSummary && (
            <button className="btn download-btn" onClick={downloadReport}>
              📄 Download Report
            </button>
          )}
          {isHost && (
            <button className="btn btn-danger" onClick={endMeeting}>
              ⏹ End Meeting
            </button>
          )}
          <button className="btn btn-danger" onClick={leaveMeeting}>
            🚪 Leave
          </button>
          <button className="btn btn-outline" onClick={() => navigate('/history')}>
            📜 History
          </button>
        </div>
      </header>

      {/* MAIN CONTENT (left column) */}
      <div className="main-content">
        {/* AI Camera + Focus */}
        <div className="card">
          <h2 className="card-header">🤖 AI Camera</h2>
          <div className="video-wrapper" style={{ maxWidth: '640px' }}>
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="main-video"
            />
          </div>
          <div style={{ marginTop: '16px' }} className="focus-display">
            <div className="focus-score-circle" style={{ '--score': focusScore }}>
              {focusScore}%
            </div>
            <span className="focus-status-badge">{focusStatus}</span>
          </div>
        </div>

        {/* Remote Participants Video */}
        <div className="card">
          <h2 className="card-header">👥 Participants Video</h2>
          <div className="video-grid">
            {remoteStreams.map((stream, index) => (
              <div key={index} className="video-wrapper">
                <video
                  autoPlay
                  playsInline
                  ref={(video) => { if (video) video.srcObject = stream; }}
                  className="participant-video"
                />
              </div>
            ))}
            {remoteStreams.length === 0 && (
              <p style={{ color: 'var(--text-light)', fontStyle: 'italic' }}>No remote streams yet</p>
            )}
          </div>
        </div>

        {/* Host-only sections: AI Insights, Leaderboard, Analytics, Alert */}
        {isHost && (
          <>
            {showSummary && (
              <div className="card">
                <h2 className="card-header">🤖 AI Meeting Insights</h2>
                <div className="insights-box">
                  {aiInsights || <span className="generating-text">Generating AI insights...</span>}
                </div>
              </div>
            )}

            {showAlert && (
              <div className="alert">
                ⚠️ Attention Dropping – participant focus decreasing
              </div>
            )}

            {rankedUsers.length > 0 && (
              <div className="top-performer">
                🏆 Top Performer: <strong>{rankedUsers[0].username}</strong> ({rankedUsers[0].focusScore}%)
              </div>
            )}

            <div className="card">
              <h2 className="card-header">🏆 Focus Leaderboard</h2>
              {rankedUsers.map((user, index) => {
                let medal = '';
                if (index === 0) medal = '🥇';
                else if (index === 1) medal = '🥈';
                else if (index === 2) medal = '🥉';
                return (
                  <div key={`${user.username}-${index}`} className="list-item">
                    <span className="medal">{medal || `#${index + 1}`}</span>
                    <span>👤 {user.username}</span>
                    <span style={{ marginLeft: 'auto', fontWeight: 700 }}>{user.focusScore}%</span>
                  </div>
                );
              })}
            </div>

            {Object.entries(analytics).length > 0 && (
              <div className="card">
                <h2 className="card-header">📊 Real‑time Analytics</h2>
                {Object.entries(analytics).map(([id, user]) => (
                  <div key={id} className="list-item">
                    <strong>{user.username}</strong>
                    <span style={{ marginLeft: 'auto' }}>{user.focusStatus} – {user.focusScore}%</span>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {/* Meeting Summary (visible to all) */}
        {showSummary && (
          <div className="card summary-card">
            <h2 className="card-header">📊 Meeting Summary</h2>
            <p><strong>Participants:</strong> {rankedUsers.length}</p>
            <p><strong>Average Focus:</strong> {averageFocus}%</p>
            {topUser && (
              <p>🏆 Most Focused: <strong>{topUser.username}</strong> ({topUser.focusScore}%)</p>
            )}
            <h3 style={{ margin: '16px 0 8px' }}>Rankings</h3>
            {rankedUsers.map((user, index) => (
              <div key={user.username} className="list-item">
                {index + 1}. {user.username} — {user.focusScore}%
              </div>
            ))}
          </div>
        )}
      </div>

      {/* SIDEBAR (right column) */}
      <aside className="sidebar">
        {/* Participants */}
        <div className="card">
          <h2 className="card-header">👥 Participants ({participants.length})</h2>
          {participants.length === 0 ? (
            <p style={{ color: 'var(--text-light)', fontStyle: 'italic' }}>No participants joined yet</p>
          ) : (
            participants.map((p, index) => (
              <div key={index} className="list-item">
                👤 {p.username}
              </div>
            ))
          )}
        </div>

        {/* Attendance */}
        <div className="card">
          <h2 className="card-header">📋 Attendance</h2>
          <div className="attendance-grid">
            <div className="attendance-col">
              <strong>✅ Joined ({attendanceData.joined.length})</strong>
              {attendanceData.joined.map((user, i) => <div key={i}>✅ {user}</div>)}
            </div>
            <div className="attendance-col">
              <strong>❌ Left ({attendanceData.left.length})</strong>
              {attendanceData.left.map((user, i) => <div key={i}>❌ {user}</div>)}
            </div>
          </div>
        </div>

        {/* Chat */}
        <div className="card">
          <h2 className="card-header">💬 Chat</h2>
          <div className="chat-box">
            {messages.map((msg, index) => (
              <div key={index} style={{ marginBottom: '4px' }}>
                <strong>{msg.username}</strong>: {msg.message}
              </div>
            ))}
          </div>
          <div className="chat-input-group">
            <input
              className="chat-input"
              type="text"
              placeholder="Type a message..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
            />
            <button className="btn btn-primary" onClick={sendMessage}>
              Send
            </button>
          </div>
        </div>
      </aside>
    </div>
  </>
);
}
export default MeetingRoom;
