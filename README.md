 ```markdown
# Task Manager App

A real-time task management application with drag-and-drop functionality, user authentication, and WebSocket support for instant updates.

## 🌐 Live Links

- **Frontend:** [Netlify Deployment](https://scic-10-job-task-akash.netlify.app)  
- **Frontend:** [firebase Deployment](https://scic-10-job-task.web.app/)  
- **Backend:** [Render Deployment](https://scic-10-job-task-server.onrender.com)  

## 📜 Short Description

This project is a **Task Management Application** that allows users to **create, update, and delete tasks** with **real-time synchronization** using WebSockets. Users can sign in via Google authentication, manage tasks through a drag-and-drop interface, and experience a seamless UI.

## 🛠️ Technologies Used

### **Frontend**
- **React.js** – Component-based UI framework
- **Firebase Authentication** – Google authentication for users
- **Socket.io Client** – Real-time updates
- **React Beautiful DnD** – Drag-and-drop task management
- **Tailwind CSS** – Styling framework
- **SweetAlert2** – Custom alert pop-ups

### **Backend**
- **Node.js + Express.js** – Server-side framework
- **MongoDB + MongoClient** – NoSQL database for storing tasks
- **Socket.io** – WebSockets for real-time updates
- **CORS** – Handling cross-origin requests
- **dotenv** – Managing environment variables

## 📦 Dependencies

### **Frontend**
```json
{
  "dependencies": {
    "react": "^18.2.0",
    "react-beautiful-dnd": "^13.1.1",
    "firebase": "^10.4.0",
    "socket.io-client": "^4.7.2",
    "sweetalert2": "^11.7.12",
    "react-icons": "^4.11.0"
  }
}
```

### **Backend**
```json
{
  "dependencies": {
    "express": "^4.18.2",
    "mongodb": "^5.6.0",
    "cors": "^2.8.5",
    "dotenv": "^16.3.1",
    "socket.io": "^4.7.2"
  }
}
```

## 🚀 Installation Steps

### **Backend Setup**
1. **Clone the repository**  
   ```sh
   git clone https://github.com/abdulmazidakash/scic-10-job-task-server
   git clone https://github.com/abdulmazidakash/scic-10-job-task-client
   cd scic-10-job-task-server
   cd scic-10-job-task-client
   ```

2. **Install dependencies**  
   ```sh
   npm install
   ```

3. **Create a `.env` file and add the following variables:**
   ```env
   PORT=5000
   MONGO_URI=your_mongodb_connection_string
   CORS_ORIGIN=http://localhost:5173
   ```

4. **Start the server**  
   ```sh
   npm start
   ```
   The backend will run on `http://localhost:5000`

---

### **Frontend Setup**
1. **Navigate to frontend folder**  
   ```sh
   cd ../client
   ```

2. **Install dependencies**  
   ```sh
   npm install
   ```

3. **Create a `.env` file and add:**  
   ```env
   VITE_API_URL=http://localhost:5000
   ```

4. **Start the development server**  
   ```sh
   npm run dev
   ```
   The frontend will run on `http://localhost:5173`

## 🎯 Features

- **Real-time updates** via WebSockets  
- **Drag-and-drop** task management  
- **Google Authentication** for secure login  
- **Dark Mode Toggle**  
- **CRUD operations** (Create, Read, Update, Delete tasks)  
- **Optimistic UI updates**  

---

### 🎉 Enjoy using the Task Manager App! 🚀  
For any issues, feel free to raise an **issue** or contribute to the **repository**.  
```
