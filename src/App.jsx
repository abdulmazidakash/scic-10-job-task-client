// src/App.jsx
import { Routes, Route } from "react-router";
import TaskBoard from "./components/TaskBoard";

const App = () => {

  return (
    <Routes>
      <Route path="/" element={<TaskBoard/>} />
 
    </Routes>
  );
};

export default App;
