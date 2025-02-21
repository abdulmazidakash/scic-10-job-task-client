import { useEffect, useState } from "react";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import { auth, googleProvider } from "../firebase/firebase";
import { signInWithPopup, signOut } from "firebase/auth";
import io from "socket.io-client";
import Swal from "sweetalert2";
import { FaTrash, FaPlus, FaEdit, FaSun, FaMoon } from "react-icons/fa";
import LoadingSpinner from "./LoadingSpinner";

// Configure Socket.io connection
const socket = io(import.meta.env.VITE_API_URL || "http://localhost:5000", {
  withCredentials: true,
  transports: ["websocket"],
});

const TaskBoard = () => {
  // Component State
  const [tasks, setTasks] = useState([]); // Stores all tasks
  const [newTask, setNewTask] = useState({ title: "", description: "" }); // New task input
  const [editingTask, setEditingTask] = useState(null); // Task being edited
  const [user, setUser] = useState(null); // Current authenticated user
  const [darkMode, setDarkMode] = useState(false); // Dark mode toggle
  const [loading, setLoading] = useState(true); // Loading state
  const [isAddingTask, setIsAddingTask] = useState(false); // Prevent duplicate task addition

  console.log('editing task----->',editingTask);

  // Fetch tasks from the backend API
  const fetchTasks = async (uid) => {
    try {
      setLoading(true);
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/tasks?uid=${uid}`
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setTasks(data.sort((a, b) => a.position - b.position)); // Sort tasks by position
    } catch (error) {
      showError("Failed to load tasks");
    } finally {
      setLoading(false);
    }
  };

  // WebSocket Event Handlers
  const handleTaskCreated = (newTask) => {
    setTasks((prev) => [...prev, newTask]);
  };

  const handleTaskUpdated = (updatedTask) => {
    setTasks((prev) =>
      prev.map((t) => (t._id === updatedTask._id ? updatedTask : t))
    );
  };

  const handleTaskDeleted = (deletedId) => {
    setTasks((prev) => prev.filter((t) => t._id !== deletedId));
  };

  // Authentication Handlers
  const handleAuth = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      await initializeUser(result.user);
      showSuccess("Logged in successfully!");
    } catch (error) {
      showError("Authentication failed");
    }
  };

  const initializeUser = async (user) => {
    try {
      // Register user in the backend
      await fetch(`${import.meta.env.VITE_API_URL}/users`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          uid: user.uid,
          email: user.email,
          name: user.displayName,
        }),
      });

      setUser(user);
      await fetchTasks(user.uid); // Fetch tasks for the user
    } catch (error) {
      showError("Failed to initialize user");
    }
  };

  // Drag and Drop Handler
  const handleDragEnd = async (result) => {
    if (!result.destination) return;

    const movedTask = tasks.find((t) => t._id === result.draggableId);
    const updatedTask = {
      ...movedTask,
      category: result.destination.droppableId,
      position: result.destination.index,
    };

    try {
      // Optimistic UI update
      setTasks((prev) =>
        prev.map((t) => (t._id === movedTask._id ? updatedTask : t))
      );

      // Persist to backend
      await fetch(`${import.meta.env.VITE_API_URL}/tasks/${movedTask._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedTask),
      });

      // Emit WebSocket event for real-time updates
      socket.emit("taskUpdated", updatedTask);
    } catch (error) {
      showError("Failed to save position");
      fetchTasks(user.uid); // Revert to server state
    }
  };

  // Task CRUD Operations
  const handleAddTask = async () => {
    if (isAddingTask) return; // Prevent duplicate task addition
    setIsAddingTask(true);

    try {
      if (!newTask.title.trim()) throw new Error("Title is required");

      const taskData = {
        ...newTask,
        uid: user.uid,
        category: "To-Do",
        position: tasks.filter((t) => t.category === "To-Do").length,
      };

      const response = await fetch(`${import.meta.env.VITE_API_URL}/tasks`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(taskData),
      });

      if (!response.ok) throw new Error("Failed to create task");

      const createdTask = await response.json();

      setNewTask({ title: "", description: "" });

      // Emit WebSocket event for real-time updates
      socket.emit("taskCreated", createdTask);

      // Optimistic UI update
      setTasks((prev) => [...prev, createdTask]);

      showSuccess("Task added successfully!");
    } catch (error) {
      showError(error.message);
    } finally {
      setIsAddingTask(false); // Re-enable the "Add" button
    }
  };

  const handleDeleteTask = async (taskId) => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Delete",
    });

    if (result.isConfirmed) {
      try {
        const response = await fetch(
          `${import.meta.env.VITE_API_URL}/tasks/${taskId}`,
          { method: "DELETE" }
        );

        if (!response.ok) throw new Error("Failed to delete task");

        // Emit WebSocket event for real-time updates
        socket.emit("taskDeleted", taskId);

        // Optimistic UI update
        setTasks((prev) => prev.filter((t) => t._id !== taskId));

        showSuccess("Task deleted successfully!");
      } catch (error) {
        showError(error.message);
      }
    }
  };
  
  const handleEditTask = async () => {
    try {
      // `_id` remove
      const { _id, ...taskData } = editingTask;
  
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/tasks/${_id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(taskData), // `_id` remove
        }
      );
  
      if (!response.ok) throw new Error("Failed to update task");
  
      const updatedTask = await response.json();
  
      setEditingTask(null);
  
      // Emit WebSocket event for real-time updates
      socket.emit("taskUpdated", updatedTask);
  
      // Optimistic UI update
      setTasks((prev) =>
        prev.map((t) => (t._id === updatedTask._id ? updatedTask : t))
      );
  
      showSuccess("Task updated successfully!");
    } catch (error) {
      showError(error.message);
    }
  };
  

  // Effect Hooks
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setUser(user);
      if (user) fetchTasks(user.uid);
    });

    // WebSocket listeners
    socket.on("taskCreated", handleTaskCreated);
    socket.on("taskUpdated", handleTaskUpdated);
    
    socket.on("taskDeleted", handleTaskDeleted);

    return () => {
      unsubscribe();
      socket.off("taskCreated");
      socket.off("taskUpdated");
      socket.off("taskDeleted");
      socket.disconnect();
    };
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", darkMode);
  }, [darkMode]);

  // Helper Functions
  const showError = (message) => Swal.fire("Error", message, "error");
  const showSuccess = (message) => Swal.fire("Success", message, "success");

  return (
    <div
      className={`min-h-screen p-4 transition-colors ${
        darkMode ? "bg-gray-900 text-white" : "bg-gray-50 text-gray-900"
      }`}
    >
      <div className="max-w-6xl mx-auto">
        {/* Header Section */}
        <div className="flex flex-wrap justify-between items-center mb-6 gap-4">
          <h1 className="text-2xl font-bold">Task Manager</h1>
          <div className="flex gap-2">
            <button
              onClick={() => setDarkMode(!darkMode)}
              className={`p-2 rounded-lg ${
                darkMode ? "bg-gray-700" : "bg-gray-200"
              }`}
            >
              {darkMode ? <FaSun /> : <FaMoon />}
            </button>
            {user ? (
              <button
                onClick={() => signOut(auth)}
                className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600"
              >
                Logout
              </button>
            ) : (
              <button
                onClick={handleAuth}
                className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600"
              >
                Login with Google
              </button>
            )}
          </div>
        </div>

        {/* Task Input */}
        {user && (
          <div className="mb-6 flex gap-2">
            <input
              value={newTask.title}
              onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
              placeholder="New task"
              className="flex-1 p-2 rounded-lg border"
              maxLength={50}
            />
            <button
              onClick={handleAddTask}
              disabled={isAddingTask}
              className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 disabled:opacity-50"
            >
              <FaPlus />
            </button>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          // <div className="text-center py-4 text-gray-500">Loading tasks...</div>
          <LoadingSpinner/>
        )}

        {/* Task Board */}
        {!loading && (
          <DragDropContext onDragEnd={handleDragEnd}>
            <div className="grid gap-4 md:grid-cols-3">
              {["To-Do", "In Progress", "Done"].map((category) => (
                <Droppable key={category} droppableId={category}>
                  {(provided) => (
                    <div
                      {...provided.droppableProps}
                      ref={provided.innerRef}
                      className={`p-4 rounded-lg ${
                        darkMode ? "bg-gray-800" : "bg-white"
                      }`}
                    >
                      <h2 className="text-lg font-semibold mb-4">{category}</h2>
                      {tasks
                        .filter((task) => task.category === category)
                        .sort((a, b) => a.position - b.position)
                        .map((task, index) => (
                          <Draggable
                            key={task._id}
                            draggableId={task._id}
                            index={index}
                          >
                            {(provided) => (
                              <div
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                {...provided.dragHandleProps}
                                className={`p-3 mb-2 rounded-lg ${
                                  darkMode ? "bg-gray-700" : "bg-gray-100"
                                }`}
                              >
                                <div className="flex justify-between items-center">
                                  <div>
                                   
                                    <h3 className="font-medium badge badge-info">Task: {index + 1}</h3>
                                    <h3 className="font-medium">{task.title}</h3>
                                    {task.description && (
                                      <p className="text-sm opacity-75 mt-1">
                                        {task.description}
                                      </p>
                                    )}
                                  </div>
                                  <div className="flex gap-2">
                                    <button
                                      onClick={() => setEditingTask(task)}
                                      className="text-yellow-500 hover:text-yellow-600"
                                    >
                                      <FaEdit />
                                    </button>
                                    <button
                                      onClick={() => handleDeleteTask(task._id)}
                                      className="text-red-500 hover:text-red-600"
                                    >
                                      <FaTrash />
                                    </button>
                                  </div>
                                </div>
                              </div>
                            )}
                          </Draggable>
                        ))}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              ))}
            </div>
          </DragDropContext>
        )}

        {/* Edit Modal */}
        {editingTask && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <div
              className={`p-6 rounded-lg ${
                darkMode ? "bg-gray-800" : "bg-white"
              } w-96`}
            >
              <h2 className="text-xl font-bold mb-4">Edit Task</h2>
              <input
                value={editingTask.title}
                onChange={(e) =>
                  setEditingTask({ ...editingTask, title: e.target.value })
                }
                className="w-full p-2 mb-4 border rounded"
                maxLength={50}
              />
              <textarea
                value={editingTask.description}
                onChange={(e) =>
                  setEditingTask({
                    ...editingTask,
                    description: e.target.value,
                  })
                }
                className="w-full p-2 mb-4 border rounded"
                placeholder="Description"
                maxLength={200}
                rows="3"
              />
              <div className="flex gap-2">
                <button
                  onClick={handleEditTask}
                  className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
                >
                  Save
                </button>
                <button
                  onClick={() => setEditingTask(null)}
                  className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TaskBoard;