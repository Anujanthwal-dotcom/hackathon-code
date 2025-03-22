import React, { useEffect, useState, useRef } from "react";
import { over } from "stompjs";
import SockJS from "sockjs-client";
import { FaMicrophone, FaMicrophoneSlash } from "react-icons/fa";
import SimplePeer from "simple-peer";
import Whiteboard from "./Whiteboard.jsx";

var stompClient = null;

const ChatRoom = ({ user }) => {
  const [publicChats, setPublicChats] = useState([]);
  const [theme, setTheme] = useState(localStorage.getItem("theme") || "dark");
  const [userData, setUserData] = useState({
    username: "",
    connected: false,
    message: "",
  });


  const [isAudioOn, setIsAudioOn] = useState(false);
  const localStreamRef = useRef(null);
  const remoteAudioRef = useRef(null);
  const peerRef = useRef(null);
  const socketRef = useRef(null);

  useEffect(() => {
    localStorage.setItem("theme", theme);
  }, [theme]);

  const connect = () => {
    let Sock = new SockJS("http://localhost:8080/ws");
    stompClient = over(Sock);
    stompClient.connect({}, onConnected, onError);
  };

  const onConnected = () => {
    setUserData((prev) => ({ ...prev, connected: true }));
    stompClient.subscribe("/chatroom/public", onMessageReceived);
    userJoin();
  };

  const userJoin = () => {
    const chatMessage = { senderName: userData.username, status: "JOIN" };
    stompClient.send("/app/message", {}, JSON.stringify(chatMessage));
  };

  const onMessageReceived = (payload) => {
    const payloadData = JSON.parse(payload.body);
    if (payloadData.status === "MESSAGE") {
      setPublicChats((prevChats) => [...prevChats, payloadData]);
    }
  };

  const onError = (err) => {
    console.log(err);
  };

  const handleMessage = (event) => {
    setUserData((prev) => ({ ...prev, message: event.target.value }));
  };

  const sendValue = () => {
    if (stompClient && userData.message.trim() !== "") {
      var chatMessage = {
        senderName: userData.username,
        message: userData.message,
        status: "MESSAGE",
      };
      stompClient.send("/app/message", {}, JSON.stringify(chatMessage));
      setUserData((prev) => ({ ...prev, message: "" }));
    }
  };

  const handleUsername = (event) => {
    setUserData((prev) => ({ ...prev, username: event.target.value }));
  };

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };


  useEffect(() => {
    socketRef.current = new WebSocket("ws://localhost:9090/ws");

    socketRef.current.onmessage = async (event) => {
      const { type, signal } = JSON.parse(event.data);
      if (type === "offer") {
        const peer = new SimplePeer({ initiator: false, trickle: false });

        peer.on("signal", (data) => {
          socketRef.current.send(JSON.stringify({ type: "answer", signal: data }));
        });

        peer.on("stream", (stream) => {
          remoteAudioRef.current.srcObject = stream;
        });

        peer.signal(signal);
        peerRef.current = peer;
      }

      if (type === "answer" && peerRef.current) {
        peerRef.current.signal(signal);
      }
    };

    return () => socketRef.current.close();
  }, []);

  const toggleAudio = async () => {
    if (!isAudioOn) {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      localStreamRef.current = stream;

      const peer = new SimplePeer({ initiator: true, trickle: false, stream });

      peer.on("signal", (data) => {
        socketRef.current.send(JSON.stringify({ type: "offer", signal: data }));
      });

      peer.on("stream", (remoteStream) => {
        remoteAudioRef.current.srcObject = remoteStream;
      });

      peerRef.current = peer;
      setIsAudioOn(true);
    } else {
      if (peerRef.current) peerRef.current.destroy();
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach((track) => track.stop());
      }
      setIsAudioOn(false);
    }
  };

  return (
      <div className="flex w-full h-screen overflow-y-hidden">
        {/* Whiteboard Section */}
        <div className="w-[70%] h-full flex items-center justify-center bg-gray-200">
          <Whiteboard />
        </div>


        <div className={`w-[30%] h-full flex flex-col ${theme === "dark" ? "bg-gray-900 text-white" : "bg-white text-black"}`}>
          {userData.connected ? (
              <div className="flex flex-col h-full">
                {/* Header */}
                <div className="flex justify-between items-center p-4 shadow-md">
                  <h2 className="text-lg font-semibold">Group Chat</h2>
                  <div className="flex space-x-3">
                    <button onClick={toggleAudio} className="p-2 bg-gray-600 text-white rounded-md">
                      {isAudioOn ? <FaMicrophone /> : <FaMicrophoneSlash />}
                    </button>
                    <button onClick={toggleTheme} className="p-2 rounded-md bg-gray-600 text-white">
                      {theme === "dark" ? "Light Mode" : "Dark Mode"}
                    </button>
                  </div>
                </div>


                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  {publicChats.map((chat, index) => (
                      <div key={index} className={`flex ${chat.senderName === userData.username ? "justify-end" : "justify-start"}`}>
                        <div className={`px-4 py-2 rounded-lg ${chat.senderName === userData.username ? "bg-blue-500 text-white" : "bg-gray-700 text-white"}`}>
                          <p className="text-lg font-semibold">{chat.senderName} :</p>
                          <p>{chat.message}</p>
                        </div>
                      </div>
                  ))}
                </div>


                <div className="flex p-4 border-t border-gray-700">
                  <input
                      type="text"
                      className={`flex-1 p-2 rounded-l-lg focus:outline-none ${theme === "dark" ? "bg-gray-700" : "bg-gray-200"}`}
                      placeholder="Type a message..."
                      value={userData.message}
                      onChange={handleMessage}
                  />
                  <button
                      onClick={sendValue}
                      className="bg-orange-400 px-4 py-2 rounded-r-lg hover:bg-orange-500"
                  >
                    Send
                  </button>
                </div>
              </div>
          ) : (
              <div className="flex flex-col items-center justify-center h-full">
                <h1 className="text-3xl font-extrabold text-center tracking-wide p-4">Join group discussion here</h1>
                <div className="bg-black p-6 rounded-lg shadow-lg text-center space-x-2">
                  <input
                      className="p-2 rounded-md bg-gray-900 text-white mb-4"
                      placeholder="Enter your name"
                      value={userData.username}
                      onChange={handleUsername}
                  />
                  <button onClick={connect} className="bg-orange-400 px-4 py-2 rounded-lg hover:bg-orange-500">
                    Connect
                  </button>
                </div>
              </div>
          )}
        </div>
        <audio ref={remoteAudioRef} autoPlay />
      </div>
  );
};

export default ChatRoom;
