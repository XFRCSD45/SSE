// src/App.js
import React, { useEffect, useRef, useState } from 'react';
import './App.css';
import 'tailwindcss/tailwind.css';

function App() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const chatRef = useRef(null);
  const sendMessage = async () => {
    if (input.trim()) {
      const userMessage = { text: input, sender: 'user' };
      setMessages((prevMessages) => [
        ...prevMessages,
        userMessage,
        { text: '', sender: 'bot' } // Placeholder for bot's response
      ]);
      setInput('');
      setIsTyping(true);

      await fetch('http://localhost:5000/api/chatbot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: input })
      });

      const eventSource = new EventSource('http://localhost:5000/api/chatbot/stream');
      let newMessage = "";

      eventSource.onmessage = (event) => {
        const char = event.data.trim();
        if (char) {
          newMessage +=`${char} `;
          setMessages((prevMessages) => {
            const updatedMessages = [...prevMessages];
            updatedMessages[updatedMessages.length - 1] = { text: newMessage, sender: 'bot' };
            return updatedMessages;
          });
        } else {
          setIsTyping(false);
          eventSource.close();
        }
      };

      eventSource.onerror = () => {
        setIsTyping(false);
        eventSource.close();
      };
    }
  };
  useEffect(()=>{
     if(chatRef.current)
      {
        chatRef.current.scrollIntoView ({behavior:"smooth"});
      }
  },[messages])
  return (
    <div className="flex flex-col items-center h-screen bg-gray-100 p-4 w-full mx-auto">
      <div className="w-5/6 bg-white shadow-lg rounded-lg p-4 flex flex-col h-full items-center">
        <div className="flex-1  w-full overflow-y-auto no-scrollbar ">
          {messages.map((msg, index) => (
            <div
              key={index}
              className={`flex my-2  ${
                msg.sender === 'user' ? 'justify-end' : 'justify-start'
              }`}
            >
              <div
                 ref={ index===messages.length-1 ?chatRef:null}
                className={`m-2 p-2 rounded-lg  max-w-[80%]  ${
                  msg.sender === 'user' ? 'bg-blue-500 text-white' : 'bg-gray-300 text-gray-900'
                }`}
              >
                {msg.text}
                {isTyping && msg.sender ==='bot' && index===messages.length-1 &&  (
           
           <div className="p-2 rounded-lg inline-block bg-gray-300 text-gray-900 typing-animation">
             <span>.</span>
             <span>.</span>
             <span>.</span>
           </div>
         
       )}
              </div>
             
            </div>
          ))}
          
        </div>
        <div className="flex mt-4 w-4/6 ">
          <input
            className="flex-1 p-2 border rounded-lg mr-2"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
            placeholder="Type a message..."
          />
          <button
            className="p-2 bg-blue-500 text-white rounded-lg"
            onClick={sendMessage}
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
}

export default App;
