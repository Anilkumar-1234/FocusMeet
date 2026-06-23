import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { io } from "socket.io-client";

const socket = io(
  import.meta.env.VITE_SERVER_URL
);

function CreateMeeting() {
  const navigate = useNavigate();

  const [hostName, setHostName] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {

    socket.on("meeting_created", (data) => {
     
      localStorage.setItem(
  "startTime",
  data.startTime
);

  
      localStorage.setItem(
        "meetingId",
        data.meetingId
      );

      localStorage.setItem(
        "hostName",
        hostName
      );

      localStorage.setItem(
        "username",
        hostName
      );

      localStorage.setItem(
        "password",
        password
      );

      setLoading(false);

      alert(
        `Meeting Created Successfully\n\nMeeting ID: ${data.meetingId}`
      );

      navigate("/meeting");

    });

    return () => {
      socket.off("meeting_created");
    };

  }, [hostName, password, navigate]);

  const createMeeting = () => {

    if (!hostName || !password) {
      alert("Please fill all fields");
      return;
    }

    setLoading(true);

    socket.emit("create_meeting", {
      hostName,
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
          background: "#fff",
          padding: "40px",
          borderRadius: "20px",
          boxShadow:
            "0 20px 50px rgba(0,0,0,0.25)",
        }}
      >
        <h1
          style={{
            textAlign: "center",
            marginBottom: "10px",
          }}
        >
          Create Meeting
        </h1>

        <p
          style={{
            textAlign: "center",
            color: "#64748b",
            marginBottom: "30px",
          }}
        >
          Create a secure FocusMeet session
        </p>

        <input
          type="text"
          placeholder="Host Name"
          value={hostName}
          onChange={(e) =>
            setHostName(e.target.value)
          }
          style={{
            width: "100%",
            padding: "12px",
            marginBottom: "15px",
            borderRadius: "10px",
            border: "1px solid #ccc",
          }}
        />

        <input
          type="password"
          placeholder="Meeting Password"
          value={password}
          onChange={(e) =>
            setPassword(e.target.value)
          }
          style={{
            width: "100%",
            padding: "12px",
            marginBottom: "20px",
            borderRadius: "10px",
            border: "1px solid #ccc",
          }}
        />

        <button
          onClick={createMeeting}
          disabled={loading}
          style={{
            width: "100%",
            padding: "14px",
            background: "#2563eb",
            color: "white",
            border: "none",
            borderRadius: "10px",
            fontWeight: "bold",
            cursor: "pointer",
          }}
        >
          {loading
            ? "Creating..."
            : "Create Meeting"}
        </button>
      </div>
    </div>
  );
}

export default CreateMeeting;