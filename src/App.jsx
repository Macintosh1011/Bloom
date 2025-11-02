import './App.css'
import Pages from "@/pages/index.jsx"
import { Toaster } from "@/components/ui/toaster"
import { captainChat } from "@/api/captainClient";

// Example Captain API usage: fetch a response for a demo question
async function getCaptainDemoResponse() {
  const messages = [
    { role: "system", content: "You are a helpful product assistant." },
    { role: "user", content: "Which widgets are in stock and under $20?" }
  ];
  const context = `Product Catalog:\n- Widget A: $10, In stock: 50\n- Widget B: $15, In stock: 30\n- Widget C: $20, Out of stock`;
  try {
    const response = await captainChat({ messages, context });
    return response.choices[0].message.content;
  } catch (err) {
    return "Captain API error: " + err.message;
  }
}

function App() {
  return (
    <>
      <Pages />
      <Toaster />
    </>
  )
}

export default App