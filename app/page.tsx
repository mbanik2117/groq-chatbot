"use client";
import { useState, useEffect, useRef } from "react";

// ChatMessage type to structure the messages
type ChatMessage = {
  role: "user" | "assistant";
  content: string;
};

const ChatPage = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState("");
  const chatBoxRef = useRef<HTMLDivElement | null>(null);

  // Scroll to the bottom of the chat when a new message is added
  useEffect(() => {
    if (chatBoxRef.current) {
      chatBoxRef.current.scrollTop = chatBoxRef.current.scrollHeight;
    }
  }, [messages]);

  // Function to handle sending a message
  const sendMessage = async () => {
    if (!inputValue.trim()) return; // Do nothing if the input is empty
    const userMessage: ChatMessage = { role: "user", content: inputValue };

    // Update UI to show user's message
    setMessages((prevMessages) => [...prevMessages, userMessage]);
    setInputValue(""); // Clear input field

    try {
      // Send user message to the backend API
      const response = await fetch("/api/chatbot/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: userMessage.content,
        }),
      });

      const data = await response.json();

      // Get the assistant's message from response and update chat
      const assistantMessage: ChatMessage = {
        role: "assistant",
        content: data.choices[0].message.content,
      };

      // Update the chat with the assistant's message
      setMessages((prevMessages) => [...prevMessages, assistantMessage]);
    } catch (error) {
      console.error("Error fetching AI response:", error);
    }
  };

  // Function to handle copying AI response to clipboard
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert("AI response copied to clipboard!");
  };

  return (
    <div className="flex flex-col justify-between h-screen w-screen p-6 bg-gray-100">
      <div
        className="flex-1 overflow-y-auto p-5 space-y-4 bg-white rounded-lg shadow-lg"
        ref={chatBoxRef}
      >
        {messages.map((message, index) => (
          <div
            key={index}
            className={`flex ${
              message.role === "user" ? "justify-end" : "justify-start"
            }`}
          >
            <div
              className={`p-4 rounded-2xl w-[70%] break-words font-bold relative ${
                message.role === "user"
                  ? "bg-blue-500 text-white"
                  : "bg-gray-200 text-black"
              }`}
              style={{ whiteSpace: "pre-wrap" }}
            >
              {message.content}
              {message.role === "assistant" && (
                <button
                  onClick={() => copyToClipboard(message.content)}
                  className="absolute top-2 right-2 bg-gray-300 text-black px-2 py-1 rounded-lg text-sm hover:bg-gray-400"
                >
                  Copy
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="flex mt-4">
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder="Type a message..."
          className="flex-1 p-4 border rounded-2xl border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 font-bold text-black"
        />
        <button
          onClick={sendMessage}
          className="ml-4 px-6 py-4 bg-blue-500 text-white rounded-2xl hover:bg-blue-600"
        >
          Send
        </button>
      </div>
    </div>
  );
};

export default ChatPage;
