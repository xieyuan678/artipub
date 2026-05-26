'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PLATFORMS, Article } from '@/lib/types';

export function ArticleEditor() {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([]);
  const [isPublishing, setIsPublishing] = useState(false);
  const [publishingResult, setPublishingResult] = useState<string | null>(null);
  const [isOptimizing, setIsOptimizing] = useState(false);

  const handlePlatformToggle = (platformId: string) => {
    setSelectedPlatforms(prev => 
      prev.includes(platformId) 
        ? prev.filter(id => id !== platformId)
        : [...prev, platformId]
    );
  };

  const handleOptimize = async () => {
    if (!title.trim() || !content.trim()) {
      alert('Please fill in title and content');
      return;
    }

    setIsOptimizing(true);

    try {
      const response = await fetch('/api/ai/optimize', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title,
          content,
        }),
      });

      if (response.ok) {
        const result = await response.json();
        setTitle(result.title || title);
        setContent(result.platformSpecificContent?.zhihu || content);
        alert('Article optimized successfully!');
      } else {
        alert('Optimization failed, using fallback');
      }
    } catch (error) {
      console.error('Optimization failed:', error);
      alert('Optimization failed, please try again');
    } finally {
      setIsOptimizing(false);
    }
  };

  const handleSaveDraft = async () => {
    if (!title.trim() || !content.trim()) {
      alert('Please fill in title and content');
      return;
    }

    try {
      const response = await fetch('/api/articles', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title,
          content,
          userId: 'default-user',
        }),
      });

      if (response.ok) {
        alert('Draft saved successfully!');
      } else {
        alert('Failed to save draft');
      }
    } catch (error) {
      console.error('Save draft failed:', error);
      alert('Failed to save draft');
    }
  };

  const handlePublish = async () => {
    if (!title.trim() || !content.trim() || selectedPlatforms.length === 0) {
      alert('Please fill in all fields and select at least one platform');
      return;
    }

    setIsPublishing(true);
    setPublishingResult(null);

    try {
      const articleResponse = await fetch('/api/articles', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title,
          content,
          userId: 'default-user',
        }),
      });

      if (!articleResponse.ok) {
        throw new Error('Failed to create article');
      }

      const article = await articleResponse.json();

      const publishResponse = await fetch('/api/publish', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          articleId: article.id,
          platformIds: selectedPlatforms,
          userId: 'default-user',
        }),
      });

      if (publishResponse.ok) {
        const result = await publishResponse.json();
        setPublishingResult(result.taskId);
        
        setTitle('');
        setContent('');
        setSelectedPlatforms([]);
      } else {
        throw new Error('Failed to create publishing task');
      }
    } catch (error) {
      console.error('Publishing failed:', error);
      alert('Publishing failed. Please try again.');
    } finally {
      setIsPublishing(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>✍️ Create New Article</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button
              onClick={handleSaveDraft}
              disabled={!title.trim() || !content.trim()}
              variant="outline"
            >
              💾 Save Draft
            </Button>
            <Button
              onClick={handleOptimize}
              disabled={!title.trim() || !content.trim() || isOptimizing}
              variant="outline"
            >
              {isOptimizing ? (
                <>
                  <span className="animate-spin mr-2">⚡</span>
                  Optimizing...
                </>
              ) : (
                <>
                  ✨ AI Optimize
                </>
              )}
            </Button>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Article Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter your article title..."
              className="w-full p-3 border border-border bg-background text-foreground rounded focus:ring-1 focus:ring-ring focus:border-ring"
              maxLength={100}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Article Content</label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Write your article content here... (Markdown supported)"
              rows={12}
              className="w-full p-3 border border-border bg-background text-foreground rounded focus:ring-1 focus:ring-ring focus:border-ring resize-none font-mono text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-3">Select Publishing Platforms</label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {PLATFORMS.map((platform) => (
                <div
                  key={platform.id}
                  className={`p-3 border rounded cursor-pointer transition-all ${
                    selectedPlatforms.includes(platform.id)
                      ? 'border-primary bg-primary/10'
                      : 'border-border hover:border-primary/50'
                  }`}
                  onClick={() => handlePlatformToggle(platform.id)}
                >
                  <div className="flex items-center space-x-2">
                    <div
                      className="w-4 h-4 rounded-full"
                      style={{ backgroundColor: platform.color }}
                    />
                    <span className="font-medium">{platform.displayName}</span>
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    {platform.supportsMarkdown ? 'Markdown' : 'HTML'} • Max {platform.maxTitleLength} chars
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end pt-4">
            <Button 
              onClick={handlePublish}
              disabled={isPublishing || !title.trim() || !content.trim() || selectedPlatforms.length === 0}
              size="lg"
            >
              {isPublishing ? (
                <>
                  <span className="animate-spin mr-2">⚙️</span>
                  Publishing with AI...
                </>
              ) : (
                <>
                  🚀 Publish with AI
                </>
              )}
            </Button>
          </div>

          {publishingResult && (
            <div className="mt-4 p-4 bg-accent border border-border rounded">
              <div className="text-accent-foreground font-medium">
                ✅ Publishing task created successfully!
              </div>
              <div className="text-sm text-muted-foreground mt-1">
                Task ID: {publishingResult}
              </div>
              <div className="text-xs text-muted-foreground mt-2">
                You can check the status in the Publishing Dashboard
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
