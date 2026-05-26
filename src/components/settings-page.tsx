'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Globe, 
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
  const [platformStatus, setPlatformStatus] = useState<Record<string, 'connected' | 'not-configured'>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');

  useEffect(() => {
    loadAIKeys();
    loadPlatformStatus();
  }, []);

  const loadAIKeys = async () => {
    try {
      const response = await fetch('/api/ai/keys?userId=default-user');
      if (response.ok) {
        const keys = await response.json();
        if (keys.openai_key) setOpenaiKey('*'.repeat(keys.openai_key.length));
        if (keys.anthropic_key) setAnthropicKey('*'.repeat(keys.anthropic_key.length));
        if (keys.deepseek_key) setDeepseekKey('*'.repeat(keys.deepseek_key.length));
      }
    } catch (error) {
      console.error('Failed to load AI keys:', error);
    }
  };

  const loadPlatformStatus = async () => {
    try {
      const response = await fetch('/api/platforms/credentials?userId=default-user');
      if (response.ok) {
        const credentials = await response.json();
        const status: Record<string, 'connected' | 'not-configured'> = {};
        PLATFORMS.forEach(p => {
          status[p.id] = credentials.some((c: { platform_id: string }) => c.platform_id === p.id) ? 'connected' : 'not-configured';
        });
        setPlatformStatus(status);
      }
    } catch (error) {
      console.error('Failed to load platform status:', error);
    }
  };

  const handleProviderChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedProvider(event.target.value as AIProviderType);
  };

  const handleSaveKeys = async () => {
    setIsSaving(true);
    setSaveMessage('');
    
    try {
      console.log('Saving API keys...');
      const response = await fetch('/api/ai/keys', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: 'default-user',
          openaiKey: openaiKey.includes('*') ? undefined : openaiKey,
          anthropicKey: anthropicKey.includes('*') ? undefined : anthropicKey,
          deepseekKey: deepseekKey.includes('*') ? undefined : deepseekKey,
        }),
      });

      console.log(`Response status: ${response.status}`);
      
      if (response.ok) {
        setSaveMessage('API keys saved successfully!');
        if (!openaiKey.includes('*')) setOpenaiKey('*'.repeat(openaiKey.length));
        if (!anthropicKey.includes('*')) setAnthropicKey('*'.repeat(anthropicKey.length));
        if (!deepseekKey.includes('*')) setDeepseekKey('*'.repeat(deepseekKey.length));
      } else {
        const errorData = await response.json();
        console.error('Error response:', errorData);
        setSaveMessage(`Failed to save API keys: ${errorData.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error saving AI keys:', error);
      setSaveMessage(`Failed to save API keys: ${(error as Error).message}`);
    } finally {
      setIsSaving(false);
      setTimeout(() => setSaveMessage(''), 5000);
    }
  };

  const handleConnectPlatform = async (platformId: string) => {
    const platform = PLATFORMS.find(p => p.id === platformId);
    if (!platform) return;

    setIsSaving(true);
    
    try {
      console.log(`Connecting to ${platformId}...`);
      const response = await fetch('/api/platforms/credentials', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: 'default-user',
          platformId: platformId,
          cookies: {},
          apiKey: '',
        }),
      });

      console.log(`Response status: ${response.status}`);
      
      if (response.ok) {
        setPlatformStatus(prev => ({ ...prev, [platformId]: 'connected' }));
        alert(`${platform.displayName} connected successfully!`);
        // Reload platform status to be sure
        await loadPlatformStatus();
      } else {
        const errorData = await response.json();
        console.error('Error response:', errorData);
        alert(`Failed to connect ${platform.displayName}: ${errorData.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error connecting platform:', error);
      alert(`Failed to connect ${platform.displayName}: ${(error as Error).message}`);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDisconnectPlatform = async (platformId: string) => {
    const platform = PLATFORMS.find(p => p.id === platformId);
    if (!platform) return;

    if (!confirm(`Are you sure you want to disconnect ${platform.displayName}?`)) {
      return;
    }

    try {
      const response = await fetch(`/api/platforms/credentials?userId=default-user&platformId=${platformId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setPlatformStatus(prev => ({ ...prev, [platformId]: 'not-configured' }));
        alert(`${platform.displayName} disconnected successfully!`);
      } else {
        alert(`Failed to disconnect ${platform.displayName}`);
      }
    } catch (error) {
      console.error('Error disconnecting platform:', error);
      alert(`Failed to disconnect ${platform.displayName}`);
    }
  };

  const handleToggleNotification = (notificationType: string) => {
    alert(`Toggling ${notificationType} notifications...`);
  };

  const handleEditProfile = () => {
    alert('Editing profile...');
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
              <div className="flex items-center gap-4 mt-4">
                <Button variant="outline" size="sm" onClick={handleSaveKeys} disabled={isSaving}>
                  {isSaving ? 'Saving...' : 'Save API Keys'}
                </Button>
                {saveMessage && (
                  <span className={`text-sm ${saveMessage.includes('successfully') ? 'text-green-600' : 'text-red-600'}`}>
                    {saveMessage}
                  </span>
                )}
              </div>
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
            {PLATFORMS.map((platform) => {
              const status = platformStatus[platform.id] || 'not-configured';
              return (
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
                        {status === 'connected' ? 'Connected' : 'Not configured'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {status === 'connected' && (
                      <Button variant="outline" size="sm" onClick={() => handleDisconnectPlatform(platform.id)}>
                        Disconnect
                      </Button>
                    )}
                    <Button variant="outline" size="sm" onClick={() => handleConnectPlatform(platform.id)}>
                      {status === 'connected' ? 'Reconfigure' : 'Connect'}
                    </Button>
                  </div>
                </div>
              );
            })}
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
              <Button variant="outline" size="sm" onClick={() => handleToggleNotification('email')}>Enabled</Button>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium">Publishing Alerts</h4>
                <p className="text-sm text-muted-foreground">Alert when publishing fails</p>
              </div>
              <Button variant="outline" size="sm" onClick={() => handleToggleNotification('publishing')}>Enabled</Button>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium">Weekly Reports</h4>
                <p className="text-sm text-muted-foreground">Weekly publishing performance summary</p>
              </div>
              <Button variant="outline" size="sm" onClick={() => handleToggleNotification('weekly')}>Disabled</Button>
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
            <Button variant="outline" size="sm" onClick={handleEditProfile}>Edit Profile</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
