import type { FC } from 'react';
import { useState } from 'react';
import { CheckCircle, Copy, Key, AlertTriangle, Code } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/Card';
import { Button } from '../ui/Button';
import type { ApiKey } from '../../types/apiKeys';

interface ApiKeySuccessProps {
  apiKey: ApiKey;
  onDone: () => void;
}

export const ApiKeySuccess: FC<ApiKeySuccessProps> = ({ apiKey, onDone }) => {
  const [isCopied, setIsCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<'openai' | 'anthropic' | 'google' | 'curl'>('openai');

  const handleCopy = () => {
    navigator.clipboard.writeText(apiKey.key);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
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
    args.mcp_key = "${apiKey.key}";
    
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
    args.mcp_key = "${apiKey.key}";
    
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
    args.mcp_key = "${apiKey.key}";
    
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
    "mcp_key": "${apiKey.key}",
    "tool": "get_resume_summary"
  }'`;
      default:
        return '';
    }
  };

  return (
    <Card>
      <CardHeader className="bg-green-50 dark:bg-green-900/20 border-b border-green-100 dark:border-green-800">
        <div className="flex items-center space-x-2">
          <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400" />
          <div>
            <CardTitle>API Key Created Successfully</CardTitle>
            <CardDescription>Your new API key has been generated</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-6 space-y-6">
        {/* Key Display */}
        <div className="space-y-2">
          <div className="text-sm font-medium">Your API Key</div>
          <div className="flex items-center space-x-2">
            <div className="flex-1 font-mono text-sm bg-muted p-3 rounded-lg overflow-x-auto">
              {apiKey.key}
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleCopy}
              className="flex-shrink-0"
            >
              {isCopied ? <CheckCircle className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
            </Button>
          </div>
        </div>
        
        {/* Important Warning */}
        <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
          <div className="flex items-start space-x-3">
            <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="font-medium text-amber-800 dark:text-amber-300">
                Important: Save Your API Key Now
              </h4>
              <p className="text-sm text-amber-700 dark:text-amber-400 mt-1">
                This is the only time your full API key will be displayed. Please copy it and store it securely. You won't be able to retrieve it later.
              </p>
            </div>
          </div>
        </div>
        
        {/* Integration Examples */}
        <div className="space-y-4">
          <div className="text-lg font-medium">Integration Examples</div>
          
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
              onClick={() => navigator.clipboard.writeText(getCodeSnippet())}
              className="absolute top-2 right-2"
            >
              <Copy className="h-4 w-4" />
            </Button>
          </div>
        </div>
        
        {/* Done Button */}
        <div className="flex justify-end pt-4">
          <Button onClick={onDone}>
            Done
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};