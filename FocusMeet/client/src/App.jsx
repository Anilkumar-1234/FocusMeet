import {
  BrowserRouter,
  Routes,
  Route,
} from "react-router-dom";

import Dashboard from "./pages/Dashboard";
import CreateMeeting from "./pages/CreateMeeting";
import JoinMeeting from "./pages/JoinMeeting";
import MeetingRoom from "./pages/MeetingRoom";
import MeetingHistory
from "./pages/MeetingHistory";

function App() {
  return (
    <BrowserRouter>

      <Routes>

        <Route
          path="/"
          element={<Dashboard />}
        />

        <Route
          path="/create"
          element={<CreateMeeting />}
        />

        <Route
          path="/join"
          element={<JoinMeeting />}
        />

        <Route
          path="/meeting"
          element={<MeetingRoom />}
        />
        <Route
  path="/history"
  element={
    <MeetingHistory />
  }
/>

      </Routes>

    </BrowserRouter>
  );
}

export default App;