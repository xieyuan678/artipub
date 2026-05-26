'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { getPlatformById } from "../lib/types";
import { PublishingTask } from '@/lib/types';

export function PublishingDashboard() {
  const [tasks, setTasks] = useState<PublishingTask[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    loadTasks();
  }, []);

  const loadTasks = async () => {
    setIsRefreshing(true);
    try {
      const response = await fetch('/api/publish');
      if (response.ok) {
        const data = await response.json();
        setTasks(data.sort((a: PublishingTask, b: PublishingTask) => 
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        ));
      }
    } catch (error) {
      console.error('Failed to load tasks:', error);
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleCancelTask = async (taskId: string) => {
    try {
      const response = await fetch(`/api/publish/${taskId}`, {
        method: 'DELETE',
      });
      if (response.ok) {
        loadTasks();
      }
    } catch (error) {
      console.error('Failed to cancel task:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-green-600 bg-green-50';
      case 'failed': return 'text-red-600 bg-red-50';
      case 'pending': return 'text-yellow-600 bg-yellow-50';
      case 'processing': return 'text-blue-600 bg-blue-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return '✅';
      case 'failed': return '❌';
      case 'pending': return '⏳';
      case 'processing': return '🔄';
      default: return '⚪';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">📊 Publishing Dashboard</h2>
        <Button onClick={loadTasks} variant="outline" disabled={isRefreshing}>
          {isRefreshing ? (
            <>
              <span className="animate-spin mr-2">🔄</span>
              Refreshing...
            </>
          ) : (
            <>🔄 Refresh</>
          )}
        </Button>
      </div>

      {tasks.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <div className="text-gray-500 text-lg mb-4">📝</div>
            <div className="text-gray-600">No publishing tasks yet</div>
            <div className="text-sm text-gray-500 mt-2">
              Create an article to see publishing tasks here
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {tasks.map((task) => (
            <Card key={task.id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      {getStatusIcon(task.status)}
                      Task {task.id.substring(0, 8)}...
                    </CardTitle>
                    <div className="text-sm text-gray-500 mt-1">
                      Created: {new Date(task.createdAt).toLocaleString()}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(task.status)}`}>
                      {task.status.toUpperCase()}
                    </span>
                    {task.status === 'pending' && (
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleCancelTask(task.id)}
                      >
                        Cancel
                      </Button>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {/* Platform Results */}
                <div className="grid gap-3">
                  <div className="font-medium text-gray-900">Platform Publishing Status:</div>
                  {task.platforms.map((platformId) => {
                    const platform = getPlatformById(platformId);
                    const result = task.results?.[platformId];
                    
                    if (!platform) return null;

                    return (
                      <div key={platformId} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center gap-3">
                          <div
                            className="w-4 h-4 rounded-full"
                            style={{ backgroundColor: platform.color }}
                          />
                          <span className="font-medium">{platform.displayName}</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(result?.status || 'pending')}`}>
                            {getStatusIcon(result?.status || 'pending')} {(result?.status || 'pending').toUpperCase()}
                          </span>
                          {result?.url && (
                            <a
                              href={result.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:underline text-sm"
                            >
                              View Post
                            </a>
                          )}
                          {result?.error && (
                            <span className="text-red-600 text-xs" title={result.error}>
                              Error
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Publishing Progress */}
                {task.status === 'processing' && (
                  <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                    <div className="flex items-center gap-2 text-amber-800">
                      <span className="animate-spin">⚙️</span>
                      <span className="font-medium">AI is optimizing and publishing your content...</span>
                    </div>
                    <div className="text-sm text-amber-700 mt-1">
                      This may take a few moments as AI analyzes your content and determines the best publishing strategy.
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Statistics */}
      {tasks.length > 0 && (
        <Card className="bg-gradient-to-r from-green-50 to-blue-50">
          <CardHeader>
            <CardTitle>📈 Publishing Statistics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {tasks.filter(t => t.status === 'completed').length}
                </div>
                <div className="text-sm text-gray-600">Completed</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {tasks.filter(t => t.status === 'processing').length}
                </div>
                <div className="text-sm text-gray-600">Processing</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-600">
                  {tasks.filter(t => t.status === 'pending').length}
                </div>
                <div className="text-sm text-gray-600">Pending</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">
                  {tasks.filter(t => t.status === 'failed').length}
                </div>
                <div className="text-sm text-gray-600">Failed</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
