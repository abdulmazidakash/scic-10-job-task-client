import { useState } from "react";
import { FaMoon, FaSun } from "react-icons/fa";


const Header = () => {
	
	  const [darkMode, setDarkMode] = useState(false); // Dark mode toggle
	  
	return (
		<div>
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
		</div>
	);
};

export default Header;