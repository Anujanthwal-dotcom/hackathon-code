import React from "react";
import { useNavigate } from "react-router-dom";

const MSpaces = () => {
    const navigate = useNavigate();

    function login() {
        navigate("/login");
    }

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-black text-white">


            <div className="text-center px-6 md:px-12 mt-12">
                <h1 className="text-6xl font-extrabold leading-tight mb-4 text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-purple-500 animate-gradient">
                    Create Your Own <br /> Virtual Space
                </h1>

                <p className="text-lg max-w-2xl mx-auto mb-6 text-gray-300">
                    Build online spaces for teacher-student collaboration, professional meetings, and more. Seamlessly connect and collaborate.
                </p>
                <button
                    onClick={login}
                    className="inline-block bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold px-6 py-3 rounded-lg shadow-lg hover:shadow-blue-500/50 transition transform hover:scale-105"
                >
                    Explore Now
                </button>
            </div>
        </div>
    );
};

export default MSpaces;
