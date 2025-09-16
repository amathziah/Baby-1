import { useState, useEffect } from 'react';
import { Bot, X, MessageCircle, AlertTriangle, Lightbulb, Zap } from 'lucide-react';
import { aiService } from '../../services/aiService';

type AISuggestionData =
  | { action: 'send_reminder' }
  | { action: 'schedule_call' }
  | { suggestedQuantity: number };

interface AISuggestion {
  id: string;
  type: 'suggest' | 'warn' | 'auto';
  message: string;
  data?: AISuggestionData;
  priority: number;
}

export function AIAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [suggestions, setSuggestions] = useState<AISuggestion[]>([]);

  useEffect(() => {
    loadSuggestions();
    const interval = setInterval(loadSuggestions, 30000);
    return () => clearInterval(interval);
  }, []);

  const loadSuggestions = () => {
    const insights = aiService.getDashboardInsights();
    const inventoryInsights = aiService.getInventoryInsights();

    const allSuggestions = [...insights, ...inventoryInsights]
      .sort((a, b) => a.priority - b.priority)
      .slice(0, 10);

    setSuggestions(allSuggestions);
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'warn': return <AlertTriangle className="w-5 h-5 text-yellow-600" />;
      case 'suggest': return <Lightbulb className="w-5 h-5 text-violet-600" />;
      case 'auto': return <Zap className="w-5 h-5 text-green-600" />;
      default: return <MessageCircle className="w-5 h-5 text-gray-500" />;
    }
  };

  const getCardStyle = (type: string) => {
    switch (type) {
      case 'warn': return 'border-yellow-200 bg-yellow-50';
      case 'suggest': return 'border-violet-200 bg-violet-50';
      case 'auto': return 'border-green-200 bg-green-50';
      default: return 'border-gray-200 bg-gray-50';
    }
  };

  return (
    <>
      {/* AI Assistant Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 w-16 h-16 bg-violet-600 hover:bg-violet-700 text-white rounded-full shadow-lg flex items-center justify-center transition-all z-50"
      >
        {isOpen ? <X className="w-6 h-6" /> : <Bot className="w-6 h-6" />}
        {!isOpen && suggestions.length > 0 && (
          <span className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-semibold">
            {suggestions.length}
          </span>
        )}
      </button>

      {/* AI Assistant Panel */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 w-96 max-w-[calc(100vw-1.5rem)] bg-white rounded-xl shadow-2xl border border-gray-200 z-40 max-h-[75vh] flex flex-col">
          
          {/* Header */}
          <div className="p-4 border-b border-gray-200 flex flex-col space-y-1">
            <div className="flex items-center space-x-2">
              <Bot className="w-6 h-6 text-violet-600" />
              <h3 className="font-semibold text-gray-900 text-lg">AI Assistant</h3>
            </div>
            <p className="text-sm text-gray-600">Smart insights & recommendations for your business</p>
          </div>

          {/* Suggestions List */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {suggestions.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <Bot className="w-12 h-12 mx-auto mb-3" />
                <p className="text-gray-500">No suggestions at the moment.</p>
                <p className="text-sm text-gray-400">Everything looks healthy!</p>
              </div>
            ) : (
              suggestions.map((s) => (
                <div key={s.id} className={`p-3 rounded-lg border ${getCardStyle(s.type)} hover:shadow-md transition`}>
                  <div className="flex items-start space-x-3">
                    {getIcon(s.type)}
                    <div className="flex-1">
                      <p className="text-sm text-gray-700">{s.message}</p>
                      {s.data && (
                        <div className="mt-2 flex flex-wrap gap-2">
                          {'action' in s.data && s.data.action === 'send_reminder' && (
                            <button className="text-xs px-3 py-1 bg-violet-100 text-violet-700 rounded-md hover:bg-violet-200 transition">
                              Send Reminder
                            </button>
                          )}
                          {'action' in s.data && s.data.action === 'schedule_call' && (
                            <button className="text-xs px-3 py-1 bg-green-100 text-green-700 rounded-md hover:bg-green-200 transition">
                              Schedule Call
                            </button>
                          )}
                          {'suggestedQuantity' in s.data && (
                            <span className="text-xs px-3 py-1 bg-gray-100 text-gray-700 rounded-md">
                              Qty: {s.data.suggestedQuantity}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Refresh Button */}
          <div className="p-4 border-t border-gray-200">
            <button
              onClick={loadSuggestions}
              className="w-full px-4 py-2 text-sm bg-violet-600 text-white rounded-lg hover:bg-violet-700 transition"
            >
              Refresh Insights
            </button>
          </div>
        </div>
      )}
    </>
  );
}
