import { generateText, Message, streamText } from 'ai';
import { createAmazonBedrock } from '@ai-sdk/amazon-bedrock';
import { z } from 'zod';

const bedrock = createAmazonBedrock({
  region: 'us-east-1',
});

export async function POST(req: Request) {
  const { messages } = await req.json();
  console.log('called POST');
  
  // Get the last user message
  const lastUserMessage = messages.filter(m => m.role === 'user').pop();
  
  if (!lastUserMessage) {
    return new Response('No user message found', { status: 400 });
  }
  
  // Generate a response using the actual user message
  // const { text } = await generateText({
  //   model: bedrock('us.anthropic.claude-3-7-sonnet-20250219-v1:0'),
  //   prompt: lastUserMessage.content,
  // });
  
  const result = streamText({
    model: bedrock('us.anthropic.claude-3-7-sonnet-20250219-v1:0'),
    system: 'You are a helpful assistant.',
    messages,
    tools: {
      // server-side tool with execute function:
      getFigmaStatus: {
        description: 'show the status of the UX designs',
        parameters: z.object({ city: z.string() }),
        execute: async ({ city }: { city: string }) => {
          // Simulate Figma data
          const mockFigmaData = {
            projects: [
              {
                name: "Mobile App Redesign",
                status: "In Progress",
                lastUpdated: new Date().toISOString(),
                designer: "Alex Chen",
                completionPercentage: 75
              },
              {
                name: "Website Homepage",
                status: "Review",
                lastUpdated: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
                designer: "Jamie Smith",
                completionPercentage: 90
              },
              {
                name: `${city} Landing Page`,
                status: "Planning",
                lastUpdated: new Date(Date.now() - 172800000).toISOString(), // 2 days ago
                designer: "Taylor Wong",
                completionPercentage: 15
              }
            ]
          };
          
          return mockFigmaData;
        },
      },
      // client-side tool that starts user interaction:
      askForConfirmation: {
        description: 'Ask the user for confirmation.',
        parameters: z.object({
          message: z.string().describe('The message to ask for confirmation.'),
        }),
      },
      // client-side tool that is automatically executed on the client:
      getJIRA: {
        description:
          'Get the JIRA status',
        parameters: z.object({}),
        execute: async () => {
          // Simulate JIRA data
          const response = await fetch('https://xwsdz7lqih.execute-api.us-east-1.amazonaws.com/team-4-backend')
          const data = await response.json();
          console.log('data', data);
          return data;
        },
      },
      getOrderHistory: {
        description:
          'Get the confluence pages',
        parameters: z.object({}),
        execute: async () => {
          // Simulate JIRA data
          const response = await fetch('https://xwsdz7lqih.execute-api.us-east-1.amazonaws.com/order-history')
          const data = await response.json();
          console.log('data', data);
          return data;
        },
      },
    },
  });
  // Return the text properly formatted for the AI SDK
  return result.toDataStreamResponse();
}