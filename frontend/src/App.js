// src/App.js
import React, { useState } from "react";
import "./App.css";

function App() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);

  const sendMessage = async () => {
    if (input.trim()) {
      setMessages([...messages, { text: input, sender: "user" }]);
      setInput("");
      setIsTyping(true);

      await fetch("http://localhost:5000/api/chatbot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: input }),
      });

      const eventSource = new EventSource(
        "http://localhost:5000/api/chatbot/stream"
      );
      let newMessage = "";
      eventSource.onmessage = (event) => {
        const word = event.data.trim();
        if (word === "$end$") {
          setIsTyping(false);
          eventSource.close();
          return;
        }
        console.log(word);
        if (word) {
          newMessage += `${word} `;
          setMessages((prevMessages) => [
            ...prevMessages.slice(0, -1),
            { text: newMessage, sender: "bot" },
          ]);
        } else {
          console.log("finishedd");
          setIsTyping(false);
          eventSource.close();
        }
      };
      eventSource.onerror = () => {
        eventSource.close();
      };
      const handleEventSourceClose = () => {
        setIsTyping(false); // Set isTyping to false when all messages are received
      };
      eventSource.onclose = handleEventSourceClose;
    }
  };

  return (
    <div className="App">
      <div className="chat-container">
        <div className="chat-window">
          {messages.map((msg, index) => (
            <div key={index} className={`message ${msg.sender}`}>
              {msg.text}
              {isTyping && (
                <span>
                  <div class="spinner">
                    <div class="bounce1"></div>
                    <div class="bounce2"></div>
                    <div class="bounce3"></div>
                  </div>
                </span>
              )}
            </div>
          ))}
          {/* {isTyping && <div className="typing-animation">...</div>} */}
        </div>
        <div className="input-container">
          <input
            className="input-field"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && sendMessage()}
            placeholder="Type a message..."
          />
          <button className="send-button" onClick={sendMessage}>
            Send
          </button>
        </div>
      </div>
    </div>
  );
}

export default App;
