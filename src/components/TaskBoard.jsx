import { useEffect, useState } from "react";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import { auth, googleProvider } from "../firebase/firebase";
import { signInWithPopup, signOut } from "firebase/auth";
import io from "socket.io-client";
import Swal from "sweetalert2";
import { FaTrash, FaPlus, FaEdit, FaSun, FaMoon } from "react-icons/fa";

const socket = io(import.meta.env.VITE_API_URL || "http://localhost:5000", {
  withCredentials: true,
  transports: ["websocket"],
});

const TaskBoard = () => {
  const [tasks, setTasks] = useState([]);
  const [newTask, setNewTask] = useState({ title: "", description: "" });
  const [editingTask, setEditingTask] = useState(null);
  const [user, setUser] = useState(null);
  const [darkMode, setDarkMode] = useState(false);
  const [loading, setLoading] = useState(true);

  // Fetch tasks for the logged-in user
  const fetchTasks = async (uid) => {
    try {
      setLoading(true);
      const res = await fetch(`${import.meta.env.VITE_API_URL}/tasks?uid=${uid}`);
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
      const data = await res.json();
      setTasks(data.sort((a, b) => a.position - b.position));
    } catch (error) {
      Swal.fire("Error", "Failed to load tasks", "error");
    } finally {
      setLoading(false);
    }
  };

  // Handle task updates from WebSocket
  const handleTaskUpdate = (updatedTask) => {
    setTasks((prev) =>
      prev.map((t) => (t._id === updatedTask._id ? updatedTask : t))
    );
  };

  // Handle task deletions from WebSocket
  const handleTaskDelete = (deletedId) => {
    setTasks((prev) => prev.filter((t) => t._id !== deletedId));
  };

  // Handle user authentication
  const handleAuth = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      setUser(result.user);
    } catch (error) {
      Swal.fire("Error", "Authentication failed", "error");
    }
  };

  // Handle drag-and-drop
  const handleDragEnd = async (result) => {
    if (!result.destination) return;

    const movedTask = tasks.find((t) => t._id === result.draggableId);
    const updatedTask = {
      ...movedTask,
      category: result.destination.droppableId,
      position: result.destination.index,
    };

    // Reorder tasks in the source and destination categories
    const updatedTasks = tasks.map((task) => {
      if (
        task.category === result.source.droppableId &&
        task.position >= result.source.index
      ) {
        return { ...task, position: task.position - 1 };
      }
      if (
        task.category === result.destination.droppableId &&
        task.position >= result.destination.index
      ) {
        return { ...task, position: task.position + 1 };
      }
      return task;
    });

    setTasks(updatedTasks);

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/tasks/${movedTask._id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(updatedTask),
        }
      );

      if (!response.ok) throw new Error("Failed to update task");
    } catch (error) {
      Swal.fire("Error", error.message, "error");
      fetchTasks(user.uid);
    }
  };

  // Handle task actions (add, edit, delete)
  const handleTaskAction = async (action, task = null) => {
    try {
      if (action === "add") {
        if (!newTask.title.trim()) throw new Error("Title is required");
        if (newTask.title.length > 50)
          throw new Error("Title must be less than 50 characters");

        const response = await fetch(`${import.meta.env.VITE_API_URL}/tasks`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...newTask,
            uid: user.uid,
            category: "To-Do",
            position: tasks.filter((t) => t.category === "To-Do").length,
          }),
        });

        if (!response.ok) throw new Error("Failed to create task");

        setNewTask({ title: "", description: "" });
        Swal.fire("Success", "Task added!", "success");
      }

      if (action === "delete") {
        const response = await fetch(
          `${import.meta.env.VITE_API_URL}/tasks/${task._id}`,
          {
            method: "DELETE",
          }
        );

        if (!response.ok) throw new Error("Failed to delete task");
        Swal.fire("Deleted!", "Task removed", "success");
      }

      if (action === "edit") {
        const response = await fetch(
          `${import.meta.env.VITE_API_URL}/tasks/${editingTask._id}`,
          {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(editingTask),
          }
        );

        if (!response.ok) throw new Error("Failed to update task");

        setEditingTask(null);
        Swal.fire("Updated!", "Task modified", "success");
      }
    } catch (error) {
      Swal.fire("Error", error.message, "error");
    }
  };

  // Listen for authentication state changes
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      setUser(user);
      if (user) {
        try {
          await fetch(`${import.meta.env.VITE_API_URL}/users`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              uid: user.uid,
              email: user.email,
              name: user.displayName,
            }),
          });
          await fetchTasks(user.uid);
        } catch (error) {
          Swal.fire("Error", "Failed to initialize user", "error");
        }
      }
      setLoading(false);
    });

    // Listen for WebSocket events
    socket.on("taskUpdated", handleTaskUpdate);
    socket.on("taskDeleted", handleTaskDelete);

    return () => {
      unsubscribe();
      socket.off("taskUpdated");
      socket.off("taskDeleted");
      socket.disconnect();
    };
  }, []);

  // Apply dark mode to the root element
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [darkMode]);

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
              onChange={(e) =>
                setNewTask({ ...newTask, title: e.target.value })
              }
              placeholder="New task"
              className="flex-1 p-2 rounded-lg border"
              maxLength={50}
            />
            <button
              onClick={() => handleTaskAction("add")}
              className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600"
            >
              <FaPlus />
            </button>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="text-center py-4 text-gray-500">Loading tasks...</div>
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
                                    <h3 className="font-medium">
                                      {task.title}
                                    </h3>
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
                                      onClick={() =>
                                        handleTaskAction("delete", task)
                                      }
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
                  onClick={() => handleTaskAction("edit")}
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