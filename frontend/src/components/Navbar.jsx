import { useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";


function Navbar(){

    const navigate = useNavigate();

    const { user, setToken, setUser } = useContext(AuthContext);

    const handleLogout = () => {

        localStorage.removeItem("token");

        setToken(null);

        setUser(null);

        navigate("/login");

    };

    return (

        <header className="bg-white shadow p-4 flex justify-between items-center">


            <h3 className="text-xl font-semibold text-gray-800">
                Asset Management Dashboard
            </h3>

            <div className="flex items-center gap-4">

                {user && (
                    <span className="text-sm text-gray-500">
                        Hi, {user.name}
                    </span>
                )}

                <button
                onClick={handleLogout}
                className="text-sm bg-gray-200 px-3 py-1.5 rounded-lg hover:bg-gray-300 transition"
                >
                    Logout
                </button>

            </div>


        </header>

    );

}


export default Navbar;
