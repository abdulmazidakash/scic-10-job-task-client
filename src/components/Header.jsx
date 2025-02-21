/* eslint-disable react/prop-types */

import { FaMoon, FaSun } from "react-icons/fa";
import { auth } from "../firebase/firebase";


const Header = ({user, handleAuth, signOut, darkMode, setDarkMode}) => {
	  
	return (
		<div>
			      <div className="flex flex-wrap justify-between items-center mb-6 gap-4">
          <h1 className="text-2xl font-bold">Task Manager</h1>
          <div className="flex gap-2">

            {/* dark and light mode toggle button  */}
            <button
              className="p-2 rounded-full hover:text-yellow-400 transition"
              onClick={() => setDarkMode(!darkMode)}
            >
              {darkMode ? <FaSun size={20} /> : <FaMoon size={20} />}
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