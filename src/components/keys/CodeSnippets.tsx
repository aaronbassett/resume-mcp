import type { FC } from 'react';
import { useState } from 'react';
import { Copy, CheckCircle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/Card';
import { Button } from '../ui/Button';

interface CodeSnippetsProps {
  apiKey: string;
}

export const CodeSnippets: FC<CodeSnippetsProps> = ({ apiKey }) => {
  const [copiedTab, setCopiedTab] = useState<string | null>(null);

  const handleCopy = (tab: string, code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedTab(tab);
    setTimeout(() => setCopiedTab(null), 2000);
  };

  const clientConfigs = [
    {
      id: 'cursor',
      name: 'Cursor (Global config)',
      code: `{
  "mcpServers": {
    "resume": {
      "command": "npx",
      "args": ["@aaronbassett/resume"],
      "env": {
        "SUPABASE_URL": "https://pruzlurpdhlqphlqeobf.supabase.co/functions/v1/mcp",
        "API_KEY": "${apiKey}"
      }
    }
  }
}`
    },
    {
      id: 'windsurfer',
      name: 'Windsurfer',
      code: `{
  "mcpServers": {
    "resume": {
      "command": "npx",
      "args": ["@aaronbassett/resume"],
      "env": {
        "SUPABASE_URL": "https://pruzlurpdhlqphlqeobf.supabase.co/functions/v1/mcp",
        "API_KEY": "${apiKey}"
      }
    }
  }
}`
    },
    {
      id: 'claude-desktop',
      name: 'Claude Desktop',
      code: `{
  "mcpServers": {
    "resume": {
      "command": "npx",
      "args": ["@aaronbassett/resume"],
      "env": {
        "SUPABASE_URL": "https://pruzlurpdhlqphlqeobf.supabase.co/functions/v1/mcp",
        "API_KEY": "${apiKey}"
      }
    }
  }
}`
    },
    {
      id: 'claude-code',
      name: 'Claude Code',
      code: `claude mcp add resume --transport stdio -- npx @aaronbassett/resume
# Then set env vars in your VS Code \`settings.json\` or \`.env\``
    },
    {
      id: 'cline',
      name: 'Cline',
      code: `{
  "mcpServers": {
    "resume": {
      "command": "npx",
      "args": ["@aaronbassett/resume"],
      "env": {
        "SUPABASE_URL": "https://pruzlurpdhlqphlqeobf.supabase.co/functions/v1/mcp",
        "API_KEY": "${apiKey}"
      }
    }
  }
}`
    },
    {
      id: 'gemini-cli',
      name: 'Gemini CLI',
      code: `{
  "mcpServers": {
    "resume": {
      "command": "npx",
      "args": ["@aaronbassett/resume"],
      "env": {
        "SUPABASE_URL": "https://pruzlurpdhlqphlqeobf.supabase.co/functions/v1/mcp",
        "API_KEY": "${apiKey}"
      }
    }
  }
}`
    }
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Client-Specific Setup</CardTitle>
        <CardDescription>
          Configure your LLM clients to use your new API key
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {clientConfigs.map((client) => (
          <div key={client.id} className="space-y-2">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium">{client.name}</h3>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleCopy(client.id, client.code)}
              >
                {copiedTab === client.id ? (
                  <CheckCircle className="h-4 w-4 text-green-500" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </Button>
            </div>
            
            {client.id === 'cursor' && (
              <p className="text-sm text-muted-foreground">Add to <code className="bg-muted px-1 py-0.5 rounded">~/.cursor/mcp.json</code>:</p>
            )}
            
            {client.id === 'windsurfer' && (
              <p className="text-sm text-muted-foreground">In your Windsurfer MCP config:</p>
            )}
            
            {client.id === 'claude-desktop' && (
              <p className="text-sm text-muted-foreground">In <code className="bg-muted px-1 py-0.5 rounded">claude_desktop_config.json</code>:</p>
            )}
            
            {client.id === 'claude-code' && (
              <p className="text-sm text-muted-foreground">Run this in your terminal:</p>
            )}
            
            {client.id === 'cline' && (
              <p className="text-sm text-muted-foreground">In your Cline settings:</p>
            )}
            
            {client.id === 'gemini-cli' && (
              <p className="text-sm text-muted-foreground">Add this to <code className="bg-muted px-1 py-0.5 rounded">~/.gemini/settings.json</code>:</p>
            )}
            
            <pre className="bg-muted p-3 rounded-lg overflow-x-auto text-sm">
              <code>{client.code}</code>
            </pre>
            
            <hr className="border-t border-border my-4" />
          </div>
        ))}
      </CardContent>
    </Card>
  );
};