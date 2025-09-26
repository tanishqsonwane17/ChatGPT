import React, { useEffect, useState } from 'react';
import { io } from "socket.io-client";
import ChatMobileBar from '../components/chat/ChatMobileBar.jsx';
import ChatSidebar from '../components/chat/ChatSidebar.jsx';
import ChatMessages from '../components/chat/ChatMessages.jsx';
import ChatComposer from '../components/chat/ChatComposer.jsx';
import '../components/chat/ChatLayout.css';
import { useDispatch, useSelector } from 'react-redux';
import { GoArrowRight } from "react-icons/go";
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../utils/Axios.jsx';
import {
  startNewChat,
  selectChat,
  setInput,
  sendingStarted,
  sendingFinished,
  setChats
} from '../store/chatSlice.js';

const Home = () => {
  const dispatch = useDispatch();
  const chats = useSelector(state => state.chat.chats);
  const activeChatId = useSelector(state => state.chat.activeChatId);
  const input = useSelector(state => state.chat.input);
  const isSending = useSelector(state => state.chat.isSending);
  const [ sidebarOpen, setSidebarOpen ] = useState(false);
  const [ socket, setSocket ] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [title, setTitle] = useState(""); // Modal input state
  const [user, setUser] = useState(null);
  const navigate = useNavigate();
  const activeChat = chats.find(c => c.id === activeChatId) || null;

  const [ messages, setMessages ] = useState([]);

  // Open modal instead of prompt
  const handleNewChat = async () => {
    if (!title.trim()) return;

    try {
      const response = await axiosInstance.post(
        "/chat",
        { title: title.trim() },
        { withCredentials: true }
      );

      getMessages(response.data.chat._id);
      dispatch(startNewChat(response.data.chat));
    } catch (err) {
      console.error(err);
    }

    setTitle("");
    setShowModal(false);
    setSidebarOpen(false);
  };

  useEffect(() => {
    axiosInstance.get("/chat", { withCredentials: true })
      .then(response => dispatch(setChats(response.data.chats.reverse())));

    const tempSocket = io("/", { withCredentials: true });

    tempSocket.on("ai-response", (messagePayload) => {
      setMessages(prev => [
        ...prev,
        { type: 'ai', content: messagePayload.content }
      ]);
      dispatch(sendingFinished());
    });

    setSocket(tempSocket);
  }, []);

  const sendMessage = async () => {
    const trimmed = input.trim();
    if (!trimmed || !activeChatId || isSending) return;

    dispatch(sendingStarted());

    const newMessages = [...messages, { type: 'user', content: trimmed }];
    setMessages(newMessages);
    dispatch(setInput(''));

    socket.emit("ai-message", { chat: activeChatId, content: trimmed });
  };

  useEffect(() => {
    const savedUser = localStorage.getItem("token");
    if (savedUser) setUser(JSON.parse(savedUser));
  }, []);

  const getMessages = async (chatId) => {
    const response = await axiosInstance.get(`/chat/messages/${chatId}`, { withCredentials: true });
    setMessages(response.data.messages.map(m => ({
      type: m.role === 'user' ? 'user' : 'ai',
      content: m.content
    })));
  };

  return (
    <div className="chat-layout minimal">
      <ChatMobileBar
        onToggleSidebar={() => setSidebarOpen(o => !o)}
        onNewChat={() => setShowModal(true)} // Open modal
      />
      <ChatSidebar
        chats={chats}
        activeChatId={activeChatId}
        onSelectChat={(id) => { dispatch(selectChat(id)); setSidebarOpen(false); getMessages(id); }}
        onNewChat={() => setShowModal(true)}
        open={sidebarOpen}
      />
      <main className="chat-main" role="main">
        <div className='nav'>
          {!user && (
            <div className='login' onClick={() => navigate("/login")}>
              <p>Login</p>
              <GoArrowRight className='arrow'/>
            </div>
          )}
        </div>


       {showModal && (
  <div className="modal-overlay">
    <div className="modal-content">
      <h2>New Chat</h2>
      <input
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Enter chat title..."
      />
      <div className="modal-buttons">
        <button onClick={() => setShowModal(false)}>Cancel</button>
        <button onClick={handleNewChat}>Create</button>
      </div>
    </div>
  </div>
)}

        {messages.length === 0 && (
          <div className="chat-welcome" aria-hidden="true">
            <div className="chip">Early Preview</div>
            <h1>ChatGPT Lite</h1>
            <p>Ask anything. Paste text, brainstorm ideas, or get quick explanations. Your chats stay in the sidebar so you can pick up where you left off.</p>
          </div>
        )}

        <ChatMessages messages={messages} isSending={isSending} />
        {activeChatId && (
          <ChatComposer
            input={input}
            setInput={(v) => dispatch(setInput(v))}
            onSend={sendMessage}
            isSending={isSending}
          />
        )}
      </main>

      {sidebarOpen && (
        <button
          className="sidebar-backdrop"
          aria-label="Close sidebar"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
};

export default Home;
