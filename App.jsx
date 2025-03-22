import { useState } from 'react'
import ChatRoom from './components/ChatRoom'
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./components/Home.jsx";
import EntryPage from "./components/EntryPage.jsx";


function App() {
  const [user,setUser] = useState("");
  return (
    <>
        <BrowserRouter>
            <Routes>
                <Route path='/' element={<EntryPage/>}/>
                <Route path="/login" element={<Home user = {user}/>}/>
                <Route path="/chatroom" element={<ChatRoom user={user}/>} />
            </Routes>
        </BrowserRouter>
    </>
  )
}

export default App;
