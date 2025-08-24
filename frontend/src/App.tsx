import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import EnterName from "./pages/EnterName";
import GamePage from "./pages/GamePage"; // Adjust path if necessary
import "./App.css";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/enter-name" element={<EnterName />} />
        <Route path="/enter-name/:roomId" element={<EnterName />} />
        <Route path="/game/:roomId/:playerName" element={<GamePage />} />
      </Routes>
    </Router>
  );
}

export default App;