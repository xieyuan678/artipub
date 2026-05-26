'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Globe, 
  Key, 
  Bell, 
  User,
  Sparkles
} from 'lucide-react';
import { PLATFORMS } from '@/lib/types';
import { AI_PROVIDERS, AIProviderType } from '@/lib/ai/providers';

export function SettingsPage() {
  const [selectedProvider, setSelectedProvider] = useState<AIProviderType>('openai');
  const [openaiKey, setOpenaiKey] = useState('');
  const [anthropicKey, setAnthropicKey] = useState('');
  const [deepseekKey, setDeepseekKey] = useState('');

  const handleProviderChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedProvider(event.target.value as AIProviderType);
  };

  const handleSaveKeys = () => {
    alert('API keys saved successfully!');
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Settings</h2>
        <p className="text-muted-foreground">
          Manage your account settings and platform configurations.
        </p>
      </div>

      {/* AI Provider Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5" />
            AI Provider Settings
          </CardTitle>
          <CardDescription>
            Choose your preferred AI service provider and configure API keys.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium mb-2">Default AI Provider</label>
              <select
                value={selectedProvider}
                onChange={handleProviderChange}
                className="w-[200px] p-2 border border-border bg-background text-foreground rounded focus:ring-1 focus:ring-ring focus:border-ring"
              >
                {AI_PROVIDERS.map((provider) => (
                  <option key={provider.type} value={provider.type}>
                    {provider.name}
                  </option>
                ))}
              </select>
              <p className="text-xs text-muted-foreground mt-2">
                Selected: {AI_PROVIDERS.find(p => p.type === selectedProvider)?.name}
              </p>
            </div>

            <div className="border-t pt-4">
              <h4 className="font-medium mb-4">API Keys Configuration</h4>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">OpenAI API Key</label>
                  <input
                    type="password"
                    value={openaiKey}
                    onChange={(e) => setOpenaiKey(e.target.value)}
                    placeholder="sk-..."
                    className="w-full p-2 border border-border bg-background text-foreground rounded focus:ring-1 focus:ring-ring focus:border-ring text-sm"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Required for OpenAI models (gpt-4o, gpt-4, etc.)
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Anthropic API Key</label>
                  <input
                    type="password"
                    value={anthropicKey}
                    onChange={(e) => setAnthropicKey(e.target.value)}
                    placeholder="sk-..."
                    className="w-full p-2 border border-border bg-background text-foreground rounded focus:ring-1 focus:ring-ring focus:border-ring text-sm"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Required for Anthropic models (Claude 3 series)
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">DeepSeek API Key</label>
                  <input
                    type="password"
                    value={deepseekKey}
                    onChange={(e) => setDeepseekKey(e.target.value)}
                    placeholder="sk-..."
                    className="w-full p-2 border border-border bg-background text-foreground rounded focus:ring-1 focus:ring-ring focus:border-ring text-sm"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Required for DeepSeek models (deepseek-chat, deepseek-r1)
                  </p>
                </div>
              </div>
              <Button variant="outline" size="sm" className="mt-4" onClick={handleSaveKeys}>
                Save API Keys
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Platform Configuration */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="w-5 h-5" />
            Platform Configuration
          </CardTitle>
          <CardDescription>
            Configure your publishing platforms and API credentials.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {PLATFORMS.map((platform) => (
              <div key={platform.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-3">
                  <div 
                    className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-semibold"
                    style={{ backgroundColor: platform.color }}
                  >
                    {platform.displayName.charAt(0)}
                  </div>
                  <div>
                    <h4 className="font-medium">{platform.displayName}</h4>
                    <p className="text-sm text-muted-foreground">
                      {platform.id === 'zhihu' ? 'Connected' : 'Not configured'}
                    </p>
                  </div>
                </div>
                <Button variant="outline" size="sm">
                  {platform.id === 'zhihu' ? 'Reconfigure' : 'Connect'}
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Notifications */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="w-5 h-5" />
            Notifications
          </CardTitle>
          <CardDescription>
            Configure how you want to be notified about publishing activities.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium">Email Notifications</h4>
                <p className="text-sm text-muted-foreground">Get notified when articles are published</p>
              </div>
              <Button variant="outline" size="sm">Enabled</Button>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium">Publishing Alerts</h4>
                <p className="text-sm text-muted-foreground">Alert when publishing fails</p>
              </div>
              <Button variant="outline" size="sm">Enabled</Button>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium">Weekly Reports</h4>
                <p className="text-sm text-muted-foreground">Weekly publishing performance summary</p>
              </div>
              <Button variant="outline" size="sm">Disabled</Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Profile */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="w-5 h-5" />
            Profile
          </CardTitle>
          <CardDescription>
            Manage your account information and preferences.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Display Name</label>
                <p className="text-sm text-muted-foreground mt-1">ArtiPub User</p>
              </div>
              <div>
                <label className="text-sm font-medium">Email</label>
                <p className="text-sm text-muted-foreground mt-1">user@artipub.ai</p>
              </div>
            </div>
            <Button variant="outline" size="sm">Edit Profile</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
