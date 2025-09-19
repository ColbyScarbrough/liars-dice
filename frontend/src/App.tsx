import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import GamePage from "./pages/GamePage"; // Adjust path if necessary
import "./App.css";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/game/:roomId/:playerHash" element={<GamePage />} />
      </Routes>
    </Router>
  );
}

export default App;