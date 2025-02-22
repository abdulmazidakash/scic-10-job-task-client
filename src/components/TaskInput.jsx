/* eslint-disable react/prop-types */
import { FaPlus } from "react-icons/fa";


const TaskInput = ({user, newTask, setNewTask, isAddingTask, handleAddTask}) => {

	return (
		<div>
			<h2 className="font-semibold mb-2">Name: {user? `${user?.displayName}` : `not available user`}</h2>
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
		</div>
	);
};

export default TaskInput;