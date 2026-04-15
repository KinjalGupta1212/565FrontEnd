import { useState } from 'react'
import "@chatscope/chat-ui-kit-styles/dist/default/styles.min.css";
import {
  ChatContainer,
  MainContainer,
  Message,
  MessageList,
  MessageInput
} from '@chatscope/chat-ui-kit-react'
import './App.css'

// ✅ 1. Define message type
type ChatMessage = {
  message: string;
  direction: "incoming" | "outgoing";
  position: "single" | "first" | "normal" | "last";
};

function App() {
  // ✅ 2. Fix state typing
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');

  const sendMessage = async (message: string) => {
    if (!message.trim()) return;

    // outgoing message
    setMessages((prev) => [
      ...prev,
      {
        message,
        direction: "outgoing",
        position: "single"
      }
    ]);

    try {
      const response = await fetch('http://localhost:8000/chat', {
        method: 'POST',
        body: JSON.stringify({ query: message }),
        headers: {
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();

      // incoming message
      setMessages((prev) => [
        ...prev,
        {
          message: data.response,
          direction: "incoming",
          position: "single"
        }
      ]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          message: "Error: backend not reachable",
          direction: "incoming",
          position: "single"
        }
      ]);
    }
  };

  return (
    <div style={{ position: "relative", height: "500px" }}>
      <h2>Chat with the Data Annotation Agent</h2>

      <MainContainer>
        <ChatContainer>
          <MessageList>
            {messages.map((msg, index) => (
              <Message
                key={index}
                model={{
                  message: msg.message,
                  direction: msg.direction,
                  position: msg.position
                }}
              />
            ))}
          </MessageList>

          <MessageInput
            placeholder="Type message here"
            value={input}
            onChange={(val) => setInput(val)}
            onSend={() => {
              sendMessage(input);
              setInput('');
            }}
          />
        </ChatContainer>
      </MainContainer>
    </div>
  );
}

export default App;