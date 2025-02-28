'use client';

import { ToolInvocation } from 'ai';
import { useChat } from '@ai-sdk/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function Chat() {
  const { messages, input, handleInputChange, handleSubmit, addToolResult, isLoading } =
    useChat({
      api: '/api/bedrock-chat',
      maxSteps: 5,

      // run client-side tools that are automatically executed:
      async onToolCall({ toolCall }) {
        if (toolCall.toolName === 'getFigmaStatus') {
          // This is a client-side mock of the server-side tool
          // In a real app, you might want to call an API endpoint instead
          const designComponents = ['Navigation', 'Dashboard', 'User Profile', 'Settings', 'Analytics'];
          const statuses = ['In Progress', 'Ready for Review', 'Approved', 'Needs Revision', 'Not Started'];
          const designers = ['Alex', 'Jamie', 'Taylor', 'Morgan', 'Casey'];
          
          // Generate 3-5 random status items
          const numItems = Math.floor(Math.random() * 3) + 3; // 3-5 items
          const statusItems = [];
          
          for (let i = 0; i < numItems; i++) {
            const component = designComponents[Math.floor(Math.random() * designComponents.length)];
            const status = statuses[Math.floor(Math.random() * statuses.length)];
            const designer = designers[Math.floor(Math.random() * designers.length)];
            const progress = Math.floor(Math.random() * 101); // 0-100%
            
            statusItems.push({
              component,
              status,
              designer,
              progress,
              lastUpdated: new Date(Date.now() - Math.floor(Math.random() * 7 * 24 * 60 * 60 * 1000)).toISOString()
            });
          }
          
          return {
            status: 'success',
            data: statusItems,
            message: 'Current Figma design status retrieved successfully'
          };
        } else if (toolCall.toolName === 'getJIRA') {
          
          return {
            status: 'success',
            data: 'JIRA data retrieved successfully',
            message: 'JIRA data retrieved successfully'
          };
        }
      },
    });

  return (
    <div className="flex flex-col h-screen max-w-4xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-2">ChatRTG</h1>
      <p className="text-sm text-gray-500 mb-4">
        Connecting with Humans with Product
      </p>
      
      <div className="flex-1 overflow-y-auto mb-4 space-y-4 bg-gray-50 p-4 rounded-lg">
        {messages.length === 0 && (
          <div className="text-center text-gray-400 my-8">
            Start a conversation by typing a message below
          </div>
        )}
        
        {messages?.map(message => (
          <div 
            key={message.id}
            className={`p-4 rounded-lg ${
              message.role === 'user' ? 'bg-blue-100 ml-auto max-w-[80%]' : 'bg-white border border-gray-200 max-w-[80%] shadow-sm'
            }`}
          >
            <div className="font-semibold mb-2">
              {message.role === 'user' ? 'You' : 'AI Assistant'}
            </div>
            
            <div className="space-y-3">
              {message.parts.map((part, idx) => {
                switch (part.type) {
                  // render text parts as simple text:
                  case 'text':
                    return <div key={idx} className="whitespace-pre-wrap">{part.text}</div>;

                  // for tool invocations, distinguish between the tools and the state:
                  case 'tool-invocation': {
                    const callId = part.toolInvocation.toolCallId;

                    switch (part.toolInvocation.toolName) {
                      case 'askForConfirmation': {
                        switch (part.toolInvocation.state) {
                          case 'call':
                            return (
                              <div key={callId} className="bg-yellow-50 p-3 rounded-md border border-yellow-200">
                                <div className="font-medium mb-2">{part.toolInvocation.args.message}</div>
                                <div className="flex space-x-2">
                                  <Button
                                    size="sm"
                                    variant="default"
                                    onClick={() =>
                                      addToolResult({
                                        toolCallId: callId,
                                        result: 'Yes, confirmed.',
                                      })
                                    }
                                  >
                                    Yes
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() =>
                                      addToolResult({
                                        toolCallId: callId,
                                        result: 'No, denied',
                                      })
                                    }
                                  >
                                    No
                                  </Button>
                                </div>
                              </div>
                            );
                          case 'result':
                            return (
                              <div key={callId} className="bg-green-50 p-3 rounded-md border border-green-200">
                                <span className="font-medium">Confirmation:</span> {part.toolInvocation.result}
                              </div>
                            );
                        }
                        break;
                      }

                      case 'getLocation': {
                        switch (part.toolInvocation.state) {
                          case 'call':
                            return (
                              <div key={callId} className="bg-blue-50 p-3 rounded-md border border-blue-200 animate-pulse">
                                <span className="font-medium">Getting location...</span>
                              </div>
                            );
                          case 'result':
                            return (
                              <div key={callId} className="bg-blue-50 p-3 rounded-md border border-blue-200">
                                <span className="font-medium">Location:</span> {part.toolInvocation.result}
                              </div>
                            );
                        }
                        break;
                      }

                      case 'getWeatherInformation': {
                        switch (part.toolInvocation.state) {
                          case 'partial-call':
                            return (
                              <div key={callId} className="bg-purple-50 p-3 rounded-md border border-purple-200 font-mono text-sm">
                                <div className="font-medium mb-1">Preparing weather request...</div>
                                <pre className="overflow-x-auto">
                                  {JSON.stringify(part.toolInvocation, null, 2)}
                                </pre>
                              </div>
                            );
                          case 'call':
                            return (
                              <div key={callId} className="bg-purple-50 p-3 rounded-md border border-purple-200 animate-pulse">
                                <span className="font-medium">Getting weather for {part.toolInvocation.args.city}...</span>
                              </div>
                            );
                          case 'result':
                            return (
                              <div key={callId} className="bg-purple-50 p-3 rounded-md border border-purple-200">
                                <div className="font-medium">Weather Report</div>
                                <div>Location: {part.toolInvocation.args.city}</div>
                                <div>Condition: {part.toolInvocation.result}</div>
                              </div>
                            );
                        }
                        break;
                      }

                      case 'getFigmaStatus': {
                        switch (part.toolInvocation.state) {
                          case 'call':
                            return (
                              <div key={callId} className="bg-indigo-50 p-3 rounded-md border border-indigo-200 animate-pulse">
                                <span className="font-medium">Fetching Figma design status...</span>
                              </div>
                            );
                          case 'result':
                            const result = part.toolInvocation.result;
                            return (
                              <div key={callId} className="bg-indigo-50 p-3 rounded-md border border-indigo-200">
                                <div className="font-medium text-lg mb-3">Figma Design Status</div>
                                
                                {/* Summary Section */}
                                <div className="bg-white p-3 rounded-lg border border-indigo-100 mb-4">
                                  <div className="font-medium text-indigo-800 mb-2">Project Summary</div>
                                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                                    <div className="bg-indigo-50 p-2 rounded text-center">
                                      <div className="text-xs text-indigo-600">Total Projects</div>
                                      <div className="font-bold text-lg">{result.summary?.totalProjects || 5}</div>
                                    </div>
                                    <div className="bg-indigo-50 p-2 rounded text-center">
                                      <div className="text-xs text-indigo-600">Overall Completion</div>
                                      <div className="font-bold text-lg">{result.summary?.completionPercentage || 68}%</div>
                                    </div>
                                    <div className="bg-indigo-50 p-2 rounded text-center">
                                      <div className="text-xs text-indigo-600">Projects at Risk</div>
                                      <div className="font-bold text-lg">{result.summary?.projectsAtRisk || 1}</div>
                                    </div>
                                    <div className="bg-indigo-50 p-2 rounded text-center">
                                      <div className="text-xs text-indigo-600">Last Updated</div>
                                      <div className="font-bold text-sm">
                                        {result.summary?.lastUpdated 
                                          ? new Date(result.summary.lastUpdated).toLocaleDateString() 
                                          : new Date().toLocaleDateString()}
                                      </div>
                                    </div>
                                  </div>
                                </div>
                                
                                {/* Projects Section */}
                                <div className="space-y-3">
                                  {result.projects && result.projects.map((project, idx) => (
                                    <div key={idx} className="bg-white p-3 rounded-lg border border-indigo-100">
                                      <div className="flex justify-between items-center mb-2">
                                        <span className="font-medium text-indigo-800">{project.name}</span>
                                        <span className={`px-2 py-1 text-xs rounded-full ${
                                          project.status === 'Approved' ? 'bg-green-100 text-green-800' :
                                          project.status === 'In Progress' ? 'bg-blue-100 text-blue-800' :
                                          project.status === 'Ready for Review' ? 'bg-yellow-100 text-yellow-800' :
                                          project.status === 'Needs Revision' ? 'bg-red-100 text-red-800' :
                                          'bg-gray-100 text-gray-800'
                                        }`}>
                                          {project.status}
                                        </span>
                                      </div>
                                      
                                      <div className="grid grid-cols-2 gap-2 mb-2 text-sm">
                                        <div>
                                          <span className="text-gray-600">Designer:</span> {project.designer}
                                        </div>
                                        <div>
                                          <span className="text-gray-600">Priority:</span> 
                                          <span className={`ml-1 ${
                                            project.priority === 'High' ? 'text-red-600' :
                                            project.priority === 'Medium' ? 'text-yellow-600' :
                                            'text-green-600'
                                          }`}>
                                            {project.priority}
                                          </span>
                                        </div>
                                      </div>
                                      
                                      <div className="mb-3">
                                        <div className="flex justify-between text-xs text-gray-600 mb-1">
                                          <span>Progress</span>
                                          <span>{project.completionPercentage}%</span>
                                        </div>
                                        <div className="w-full bg-gray-200 rounded-full h-2">
                                          <div 
                                            className={`h-2 rounded-full ${
                                              project.completionPercentage >= 80 ? 'bg-green-500' :
                                              project.completionPercentage >= 40 ? 'bg-yellow-500' :
                                              'bg-red-500'
                                            }`}
                                            style={{ width: `${project.completionPercentage}%` }}
                                          ></div>
                                        </div>
                                      </div>
                                      
                                      {project.components && project.components.length > 0 && (
                                        <div className="mb-2">
                                          <div className="text-xs font-medium text-gray-600 mb-1">Components</div>
                                          <div className="space-y-1">
                                            {project.components.map((component, cidx) => (
                                              <div key={cidx} className="flex justify-between items-center text-xs bg-gray-50 p-1 rounded">
                                                <span>{component.name}</span>
                                                <div className="flex items-center">
                                                  <span className={`px-1.5 py-0.5 rounded-full text-xs mr-2 ${
                                                    component.status === 'Approved' ? 'bg-green-100 text-green-800' :
                                                    component.status === 'In Progress' ? 'bg-blue-100 text-blue-800' :
                                                    component.status === 'Ready for Review' ? 'bg-yellow-100 text-yellow-800' :
                                                    component.status === 'Needs Revision' ? 'bg-red-100 text-red-800' :
                                                    'bg-gray-100 text-gray-800'
                                                  }`}>
                                                    {component.status}
                                                  </span>
                                                  <span>{component.completionPercentage}%</span>
                                                </div>
                                              </div>
                                            ))}
                                          </div>
                                        </div>
                                      )}
                                      
                                      <div className="text-xs text-gray-500 flex justify-between">
                                        <span>Last updated: {new Date(project.lastUpdated).toLocaleDateString()}</span>
                                        {project.comments && <span>{project.comments} comments</span>}
                                      </div>
                                    </div>
                                  ))}
                                </div>
                                
                                {/* Recent Activity Section */}
                                {result.recentActivity && result.recentActivity.length > 0 && (
                                  <div className="mt-4 bg-white p-3 rounded-lg border border-indigo-100">
                                    <div className="font-medium text-indigo-800 mb-2">Recent Activity</div>
                                    <div className="space-y-2">
                                      {result.recentActivity.map((activity, idx) => (
                                        <div key={idx} className="text-sm border-b border-gray-100 pb-1 last:border-0">
                                          <div className="font-medium">{activity.user}</div>
                                          <div className="flex justify-between">
                                            <span className="text-gray-600">{activity.action}</span>
                                            <span className="text-xs text-gray-500">
                                              {new Date(activity.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                            </span>
                                          </div>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                )}
                              </div>
                            );
                        }
                        break;
                      }
                    }
                  }
                }
              })}
            </div>
          </div>
        ))}
        
        {isLoading && (
          <div className="p-4 rounded-lg bg-white border border-gray-200 max-w-[80%] shadow-sm">
            <div className="font-semibold mb-2">AI Assistant</div>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
            </div>
          </div>
        )}
      </div>
      
      <form onSubmit={handleSubmit} className="flex space-x-2">
        <Input
          value={input}
          onChange={handleInputChange}
          placeholder="Ask about the weather or locations..."
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