import React from "react";
import {GoogleAuthProvider, signInWithPopup} from 'firebase/auth';
import { auth, provider } from "../Auth/Firebase.config";
import {useNavigate} from "react-router-dom";
const HomePage = ({user}) => {
    const navigate = useNavigate();
    async function handleLogin() {
        const provider = new GoogleAuthProvider(); // Use 'GoogleAuthProvider' directly
        provider.setCustomParameters({ prompt: 'select_account' });
        try{
            const result=await signInWithPopup(auth, provider);
            user = result.user.displayName;
            console.log(user);
            navigate("/chatroom");
        } catch(error){
            console.error("Error in signing in", error);
        }
    }

    return (
        <div className=" flex flex-col items-center justify-center h-screen bg-black text-white">
            <h1 className="text-5xl font-bold text-center">Create your space now!</h1>
            <p className="mt-4 text-center text-gray-300 max-w-lg">
                You can create your space if you are a faculty or join if you are a
                student simply by logging in.
            </p>
            <div className="mt-6 flex space-x-4">
                <button onClick={handleLogin} className="px-6 py-3 bg-transparent text-white border border-gray-400 rounded-md hover:bg-white hover:text-black transition">
                    Login
                </button>
            </div>
        </div>
    );
};

export default HomePage;