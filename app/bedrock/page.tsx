'use client';

import { useChat } from 'ai/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function BedrockPage() {
  const { messages, input, handleInputChange, handleSubmit, isLoading, error } = useChat({
    api: '/api/bedrock-chat',
    onError: (err) => {
      console.error('Chat error:', err);
    }
  });

  return (
    <div className="flex flex-col w-full max-w-xl mx-auto stretch p-4">
      <h1 className="text-2xl font-bold mb-4">AWS Bedrock Chat Demo</h1>
      <p className="text-sm text-gray-500 mb-4">
        This is a demo of AWS Bedrock with Claude 3 Sonnet. No authentication required.
      </p>
      
      {error && (
        <div className="p-3 mb-4 bg-red-100 text-red-800 rounded-lg">
          Error: {error.message}
        </div>
      )}
      
      <div className="flex-1 overflow-y-auto mb-4 space-y-4 max-h-[60vh]">
        {messages.length === 0 && (
          <div className="text-center text-gray-400 my-8">
            Start a conversation by typing a message below
          </div>
        )}
        {messages.map((message) => (
          <div 
            key={message.id} 
            className={`p-3 rounded-lg ${
              message.role === 'user' ? 'bg-blue-100 ml-auto' : 'bg-gray-100'
            } max-w-[80%]`}
          >
            <div className="font-semibold">
              {message.role === 'user' ? 'You' : 'AI'}
            </div>
            <div className="whitespace-pre-wrap">{message.content}</div>
          </div>
        ))}
        {isLoading && (
          <div className="p-3 rounded-lg bg-gray-100 max-w-[80%]">
            <div className="font-semibold">AI</div>
            <div className="animate-pulse">Thinking...</div>
          </div>
        )}
      </div>
      
      <form onSubmit={handleSubmit} className="flex space-x-2">
        <Input
          value={input}
          onChange={handleInputChange}
          placeholder="Ask something..."
          className="flex-1"
          disabled={isLoading}
        />
        <Button type="submit" disabled={isLoading || !input.trim()}>
          {isLoading ? 'Thinking...' : 'Send'}
        </Button>
      </form>
    </div>
  );
}
