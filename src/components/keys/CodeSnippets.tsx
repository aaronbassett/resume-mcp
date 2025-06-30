import type { FC } from 'react';
import { useState } from 'react';
import { Copy, CheckCircle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/Card';
import { Button } from '../ui/Button';

interface CodeSnippetsProps {
  apiKey: string;
}

export const CodeSnippets: FC<CodeSnippetsProps> = ({ apiKey }) => {
  const [activeTab, setActiveTab] = useState<'openai' | 'anthropic' | 'google' | 'curl'>('openai');
  const [copiedTab, setCopiedTab] = useState<string | null>(null);

  const handleCopy = (tab: string, code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedTab(tab);
    setTimeout(() => setCopiedTab(null), 2000);
  };

  const getCodeSnippet = () => {
    switch (activeTab) {
      case 'openai':
        return `
// OpenAI ChatGPT integration
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: 'your-openai-api-key',
});

async function getResumeInfo() {
  const completion = await openai.chat.completions.create({
    model: "gpt-4",
    messages: [
      {
        role: "system",
        content: "You are a helpful assistant that can access resume information via MCP."
      },
      {
        role: "user",
        content: "Tell me about your work experience."
      }
    ],
    tools: [
      {
        type: "function",
        function: {
          name: "get_resume_info",
          description: "Get information from a resume using MCP",
          parameters: {
            type: "object",
            properties: {
              mcp_key: {
                type: "string",
                description: "The MCP API key"
              },
              tool: {
                type: "string",
                enum: ["get_resume_summary", "get_experience_blocks", "get_skills_blocks"],
                description: "The tool to call"
              }
            },
            required: ["mcp_key", "tool"]
          }
        }
      }
    ],
    tool_choice: "auto"
  });

  // Handle the tool call
  const toolCall = completion.choices[0]?.message?.tool_calls?.[0];
  if (toolCall?.type === 'function' && toolCall.function.name === 'get_resume_info') {
    const args = JSON.parse(toolCall.function.arguments);
    
    // Replace with your actual MCP key
    args.mcp_key = "${apiKey}";
    
    // Make the MCP API call
    const mcpResponse = await fetch('https://api.resumemcp.com/v1/tool', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(args)
    });
    
    const mcpData = await mcpResponse.json();
    
    // Send the tool response back to OpenAI
    const secondCompletion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: "You are a helpful assistant that can access resume information via MCP."
        },
        {
          role: "user",
          content: "Tell me about your work experience."
        },
        completion.choices[0].message,
        {
          role: "tool",
          tool_call_id: toolCall.id,
          name: "get_resume_info",
          content: JSON.stringify(mcpData)
        }
      ]
    });
    
    console.log(secondCompletion.choices[0].message.content);
  }
}

getResumeInfo();`;
      case 'anthropic':
        return `
// Anthropic Claude integration
import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({
  apiKey: 'your-anthropic-api-key',
});

async function getResumeInfo() {
  const message = await anthropic.messages.create({
    model: "claude-3-opus-20240229",
    max_tokens: 1000,
    system: "You are a helpful assistant that can access resume information via MCP.",
    messages: [
      {
        role: "user",
        content: "Tell me about your work experience."
      }
    ],
    tools: [
      {
        name: "get_resume_info",
        description: "Get information from a resume using MCP",
        input_schema: {
          type: "object",
          properties: {
            mcp_key: {
              type: "string",
              description: "The MCP API key"
            },
            tool: {
              type: "string",
              enum: ["get_resume_summary", "get_experience_blocks", "get_skills_blocks"],
              description: "The tool to call"
            }
          },
          required: ["mcp_key", "tool"]
        }
      }
    ]
  });

  // Handle the tool use
  const toolUse = message.content[0]?.type === 'tool_use' ? message.content[0] : null;
  
  if (toolUse && toolUse.name === 'get_resume_info') {
    const args = toolUse.input;
    
    // Replace with your actual MCP key
    args.mcp_key = "${apiKey}";
    
    // Make the MCP API call
    const mcpResponse = await fetch('https://api.resumemcp.com/v1/tool', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(args)
    });
    
    const mcpData = await mcpResponse.json();
    
    // Send the tool response back to Claude
    const secondMessage = await anthropic.messages.create({
      model: "claude-3-opus-20240229",
      max_tokens: 1000,
      system: "You are a helpful assistant that can access resume information via MCP.",
      messages: [
        {
          role: "user",
          content: "Tell me about your work experience."
        },
        {
          role: "assistant",
          content: [toolUse]
        },
        {
          role: "user",
          content: [
            {
              type: "tool_result",
              tool_use_id: toolUse.id,
              content: JSON.stringify(mcpData)
            }
          ]
        }
      ]
    });
    
    console.log(secondMessage.content);
  }
}

getResumeInfo();`;
      case 'google':
        return `
// Google Gemini integration
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI('your-google-api-key');

async function getResumeInfo() {
  const model = genAI.getGenerativeModel({ model: "gemini-pro" });
  
  const chat = model.startChat({
    systemInstruction: "You are a helpful assistant that can access resume information via MCP.",
    tools: [
      {
        functionDeclarations: [
          {
            name: "get_resume_info",
            description: "Get information from a resume using MCP",
            parameters: {
              type: "OBJECT",
              properties: {
                mcp_key: {
                  type: "STRING",
                  description: "The MCP API key"
                },
                tool: {
                  type: "STRING",
                  enum: ["get_resume_summary", "get_experience_blocks", "get_skills_blocks"],
                  description: "The tool to call"
                }
              },
              required: ["mcp_key", "tool"]
            }
          }
        ]
      }
    ]
  });

  const result = await chat.sendMessage("Tell me about your work experience.");
  
  // Check if there's a function call
  const functionCalls = result.functionCalls || [];
  
  if (functionCalls.length > 0 && functionCalls[0].name === 'get_resume_info') {
    const args = JSON.parse(functionCalls[0].args);
    
    // Replace with your actual MCP key
    args.mcp_key = "${apiKey}";
    
    // Make the MCP API call
    const mcpResponse = await fetch('https://api.resumemcp.com/v1/tool', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(args)
    });
    
    const mcpData = await mcpResponse.json();
    
    // Send the function response back to Gemini
    const secondResult = await chat.sendMessage({
      functionResponse: {
        name: "get_resume_info",
        response: { body: JSON.stringify(mcpData) }
      }
    });
    
    console.log(secondResult.text());
  }
}

getResumeInfo();`;
      case 'curl':
        return `
# Direct API call using curl
curl -X POST https://api.resumemcp.com/v1/tool \\
  -H "Content-Type: application/json" \\
  -d '{
    "mcp_key": "${apiKey}",
    "tool": "get_resume_summary"
  }'`;
      default:
        return '';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Integration Examples</CardTitle>
        <CardDescription>
          Code snippets for integrating your API key with different LLM providers
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Tabs */}
        <div className="flex space-x-2 border-b">
          <button
            onClick={() => setActiveTab('openai')}
            className={`px-4 py-2 text-sm font-medium ${
              activeTab === 'openai' 
                ? 'border-b-2 border-primary text-primary' 
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            OpenAI
          </button>
          <button
            onClick={() => setActiveTab('anthropic')}
            className={`px-4 py-2 text-sm font-medium ${
              activeTab === 'anthropic' 
                ? 'border-b-2 border-primary text-primary' 
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Anthropic
          </button>
          <button
            onClick={() => setActiveTab('google')}
            className={`px-4 py-2 text-sm font-medium ${
              activeTab === 'google' 
                ? 'border-b-2 border-primary text-primary' 
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Google
          </button>
          <button
            onClick={() => setActiveTab('curl')}
            className={`px-4 py-2 text-sm font-medium ${
              activeTab === 'curl' 
                ? 'border-b-2 border-primary text-primary' 
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            cURL
          </button>
        </div>
        
        {/* Code Snippet */}
        <div className="relative">
          <pre className="bg-muted p-4 rounded-lg overflow-x-auto text-sm">
            <code>{getCodeSnippet()}</code>
          </pre>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleCopy(activeTab, getCodeSnippet())}
            className="absolute top-2 right-2"
          >
            {copiedTab === activeTab ? (
              <CheckCircle className="h-4 w-4 text-green-500" />
            ) : (
              <Copy className="h-4 w-4" />
            )}
          </Button>
        </div>
        
        {/* Instructions */}
        <div className="bg-muted/30 p-4 rounded-lg">
          <h4 className="font-medium mb-2">How to use this code</h4>
          <ol className="list-decimal list-inside space-y-2 text-sm text-muted-foreground">
            <li>Replace <code className="bg-muted px-1 py-0.5 rounded text-xs">'your-openai-api-key'</code> with your actual API key for the LLM provider</li>
            <li>The MCP key is already populated with your newly created key</li>
            <li>Modify the user prompt and system message as needed</li>
            <li>Adjust the available tools based on what you want to expose</li>
          </ol>
        </div>
      </CardContent>
    </Card>
  );
};