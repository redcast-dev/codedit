import { Bot, Sparkles, Zap, Code2, FileCode, Wand2 } from 'lucide-react';
import { cn } from '../lib/utils';

/**
 * AI Agents Panel - Multi-agent system
 */
export default function AIAgentsPanel({ theme = 'dark', onAgentSelect }) {
    const bgColor = theme === 'dark' ? 'bg-[#252526]' : 'bg-[#f3f3f3]';
    const textColor = theme === 'dark' ? 'text-[#cccccc]' : 'text-[#333333]';

    const agents = [
        {
            id: 'code-generator',
            name: 'Code Generator',
            icon: Code2,
            description: 'Generate code from natural language descriptions',
            color: 'from-blue-500 to-indigo-600',
            status: 'active'
        },
        {
            id: 'refactor-agent',
            name: 'Refactor Agent',
            icon: Wand2,
            description: 'Improve code quality and structure',
            color: 'from-purple-500 to-pink-600',
            status: 'active'
        },
        {
            id: 'bug-fixer',
            name: 'Bug Fixer',
            icon: Zap,
            description: 'Detect and fix bugs automatically',
            color: 'from-red-500 to-orange-600',
            status: 'active'
        },
        {
            id: 'test-generator',
            name: 'Test Generator',
            icon: FileCode,
            description: 'Generate unit tests for your code',
            color: 'from-green-500 to-emerald-600',
            status: 'coming-soon'
        },
        {
            id: 'doc-writer',
            name: 'Documentation Writer',
            icon: Sparkles,
            description: 'Generate comprehensive documentation',
            color: 'from-yellow-500 to-amber-600',
            status: 'coming-soon'
        }
    ];

    return (
        <div className={cn("h-full flex flex-col", bgColor, textColor)}>
            {/* Header */}
            <div className="px-4 py-3 border-b border-[#3c3c3c]">
                <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                    AI Agents
                </h3>
                <p className="text-xs opacity-60">
                    Specialized AI assistants for different tasks
                </p>
            </div>

            {/* Agents List */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {agents.map((agent) => {
                    const Icon = agent.icon;
                    const isActive = agent.status === 'active';

                    return (
                        <div
                            key={agent.id}
                            onClick={() => isActive && onAgentSelect && onAgentSelect(agent.id)}
                            className={cn(
                                "p-4 rounded-lg border transition-all",
                                isActive
                                    ? cn(
                                        "cursor-pointer",
                                        theme === 'dark'
                                            ? 'bg-[#2a2a2a] border-[#3c3c3c] hover:border-blue-500 hover:bg-[#2d2d2d]'
                                            : 'bg-white border-gray-200 hover:border-blue-500'
                                    )
                                    : 'opacity-50 cursor-not-allowed border-[#3c3c3c]'
                            )}
                        >
                            <div className="flex items-start gap-3">
                                <div className={cn(
                                    "p-2 rounded-lg bg-gradient-to-br",
                                    agent.color
                                )}>
                                    <Icon className="w-5 h-5 text-white" />
                                </div>

                                <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-1">
                                        <h4 className="text-sm font-semibold">{agent.name}</h4>
                                        {!isActive && (
                                            <span className="px-2 py-0.5 bg-yellow-500/20 text-yellow-400 text-xs rounded">
                                                Coming Soon
                                            </span>
                                        )}
                                    </div>
                                    <p className="text-xs opacity-60">{agent.description}</p>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Info */}
            <div className="p-4 border-t border-[#3c3c3c]">
                <div className="p-3 bg-gradient-to-r from-blue-500/10 to-indigo-500/10 border border-blue-500/20 rounded">
                    <div className="flex items-start gap-2">
                        <Bot className="w-4 h-4 text-blue-400 mt-0.5" />
                        <div className="text-xs">
                            <p className="font-medium mb-1">Multi-Agent System</p>
                            <p className="opacity-80">
                                Each agent specializes in a specific task. Click on an active agent to use it in the AI chat.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
