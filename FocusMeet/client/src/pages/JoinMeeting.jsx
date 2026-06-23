import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { io } from "socket.io-client";

const socket = io(
  import.meta.env.VITE_SERVER_URL
);

function JoinMeeting() {

  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [meetingId, setMeetingId] = useState("");
  const [password, setPassword] = useState("");

  useEffect(() => {

    socket.on("join_success", (data) => {
      
localStorage.setItem(
  "startTime",
  data.startTime
);

      localStorage.setItem(
        "username",
        username
      );

      localStorage.setItem(
        "meetingId",
        meetingId
      );
      localStorage.setItem(
    "hostName",
    data.hostName
  );

      navigate("/meeting");

    });

    socket.on("join_error", (msg) => {

      alert(msg);

    });

    return () => {

      socket.off("join_success");
      socket.off("join_error");

    };

  }, [username, meetingId, navigate]);

  const joinMeeting = () => {

    if (
      !username ||
      !meetingId ||
      !password
    ) {
      alert("Fill all fields");
      return;
    }

    socket.emit("join_meeting", {
      username,
      meetingId,
      password,
    });

  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        background:
          "linear-gradient(135deg,#0f172a,#1e293b)",
      }}
    >
      <div
        style={{
          width: "450px",
          background: "white",
          padding: "40px",
          borderRadius: "20px",
          boxShadow:
            "0 20px 40px rgba(0,0,0,0.3)",
        }}
      >
        <h1
          style={{
            textAlign: "center",
          }}
        >
          Join Meeting
        </h1>

        <input
          placeholder="Username"
          value={username}
          onChange={(e) =>
            setUsername(e.target.value)
          }
          style={{
            width: "100%",
            padding: "12px",
            marginTop: "15px",
          }}
        />

        <input
          placeholder="Meeting ID"
          value={meetingId}
          onChange={(e) =>
            setMeetingId(e.target.value)
          }
          style={{
            width: "100%",
            padding: "12px",
            marginTop: "15px",
          }}
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) =>
            setPassword(e.target.value)
          }
          style={{
            width: "100%",
            padding: "12px",
            marginTop: "15px",
          }}
        />

        <button
          onClick={joinMeeting}
          style={{
            width: "100%",
            padding: "15px",
            marginTop: "20px",
            background: "#2563eb",
            color: "white",
            border: "none",
            borderRadius: "10px",
            cursor: "pointer",
          }}
        >
          Join Meeting
        </button>
      </div>
    </div>
  );
}

export default JoinMeeting;