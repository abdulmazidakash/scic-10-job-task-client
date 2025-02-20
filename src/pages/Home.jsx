import { useEffect, useState } from 'react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import io from 'socket.io-client';

const socket = io('http://localhost:5000');

const Home = () => {
  const [tasks, setTasks] = useState([]);

  useEffect(() => {
    fetch('http://localhost:5000/tasks')
      .then(res => res.json())
      .then(setTasks);

    socket.on('taskUpdated', () => {
      fetch('http://localhost:5000/tasks')
        .then(res => res.json())
        .then(setTasks);
    });
  }, []);

  const onDragEnd = (result) => {
    if (!result.destination) return;

    const newTasks = [...tasks];
    const [movedTask] = newTasks.splice(result.source.index, 1);
    movedTask.category = result.destination.droppableId;
    newTasks.splice(result.destination.index, 0, movedTask);

    setTasks(newTasks);

    fetch(`http://localhost:5000/tasks/${movedTask._id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(movedTask),
    });
  };

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      {['To-Do', 'In Progress', 'Done'].map((category) => (
        <Droppable droppableId={category} key={category}>
          {(provided) => (
            <div ref={provided.innerRef} {...provided.droppableProps}>
              <h2>{category}</h2>
              {tasks
                .filter(task => task.category === category)
                .map((task, index) => (
                  <Draggable key={task._id} draggableId={task._id} index={index}>
                    {(provided) => (
                      <div ref={provided.innerRef} {...provided.draggableProps} {...provided.dragHandleProps}>
                        <h3>{task.title}</h3>
                        <p>{task.description}</p>
                      </div>
                    )}
                  </Draggable>
                ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      ))}
    </DragDropContext>
  );
};

export default Home;