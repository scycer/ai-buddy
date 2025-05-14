import React, { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import type { Id } from "../../convex/_generated/dataModel";

const Chat: React.FC = () => {
  const [selectedThreadId, setSelectedThreadId] = useState<Id<"threads"> | null>(null);
  const [newThreadName, setNewThreadName] = useState("");
  const [newMessage, setNewMessage] = useState("");

  const threads = useQuery(api.threads.getThreads) || [];
  const messages = useQuery(api.messages.getMessages,
    selectedThreadId ? { threadId: selectedThreadId } : "skip"
  ) || [];

  const createThread = useMutation(api.threads.createThread);
  const addMessage = useMutation(api.messages.addMessage);

  const handleCreateThread = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newThreadName.trim()) {
      const threadId = await createThread({ name: newThreadName });
      setNewThreadName("");
      setSelectedThreadId(threadId);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedThreadId && newMessage.trim()) {
      await addMessage({
        threadId: selectedThreadId,
        content: newMessage,
      });
      setNewMessage("");
    }
  };

  return (
    <div className="flex ">
      {/* Thread List Sidebar */}
      <div className="w-1/4 bg-gray-100 p-4 border-r">
        <h2 className="text-xl font-bold mb-4">Threads</h2>

        <form onSubmit={handleCreateThread} className="mb-4">
          <input
            type="text"
            placeholder="New thread name"
            className="w-full p-2 border rounded mb-2"
            value={newThreadName}
            onChange={(e) => setNewThreadName(e.target.value)}
          />
          <button
            type="submit"
            className="w-full bg-blue-500 text-white p-2 rounded"
          >
            Create Thread
          </button>
        </form>

        <div className="space-y-2">
          {threads.map((thread) => (
            <div
              key={thread._id}
              className={`p-2 rounded cursor-pointer ${selectedThreadId === thread._id ? 'bg-blue-100' : 'hover:bg-gray-200'}`}
              onClick={() => setSelectedThreadId(thread._id)}
            >
              {thread.name}
            </div>
          ))}
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col">
        {selectedThreadId ? (
          <>
            {/* Messages */}
            <div className="flex-1 p-4 overflow-y-auto">
              {messages.length === 0 ? (
                <div className="text-center text-gray-500 mt-10">
                  No messages yet. Start the conversation!
                </div>
              ) : (
                <div className="space-y-4">
                  {messages.map((message) => (
                    <div key={message._id} className="bg-white p-3 rounded shadow">
                      {message.content}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Message Input */}
            <div className="border-t p-4">
              <form onSubmit={handleSendMessage} className="flex">
                <input
                  type="text"
                  placeholder="Type a message..."
                  className="flex-1 p-2 border rounded-l"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                />
                <button
                  type="submit"
                  className="bg-blue-500 text-white p-2 rounded-r"
                >
                  Send
                </button>
              </form>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-500">
            Select a thread or create a new one to start chatting
          </div>
        )}
      </div>
    </div>
  );
};

export default Chat;
