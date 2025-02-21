/* eslint-disable react/prop-types */


const EditModal = ({editingTask, darkMode, setEditingTask, handleEditTask}) => {
	
	return (
		<div>
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
	);
};

export default EditModal;