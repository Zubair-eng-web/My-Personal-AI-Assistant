import React from 'react';
import { Code, Terminal, Compass, Lightbulb, ArrowUpRight } from 'lucide-react';
import { motion } from 'motion/react';

interface SuggestionsProps {
  onSelectSuggestion: (text: string) => void;
}

export default function Suggestions({ onSelectSuggestion }: SuggestionsProps) {
  const items = [
    {
      title: 'Coding Companion',
      description: 'Write customized functions, learn optimal design patterns, or refactor state hooks.',
      prompt: 'Write a React state hook that securely fetches API data with robust loading and error states.',
      icon: Code,
      badge: 'React / TS',
      color: 'from-blue-500/10 to-indigo-500/10 border-blue-500/20 text-blue-600 dark:text-blue-400',
    },
    {
      title: 'Review & Debug',
      description: 'Find logical bugs, memory leaks, security holes, and format code with explanations.',
      prompt: 'Here is a JavaScript loop that is running slowly. How do I optimize it for performance?\n\n```js\nfor (let i = 0; i < items.length; i++) {\n  // Let\'s optimize this logic\n}\n```',
      icon: Terminal,
      badge: 'Performance',
      color: 'from-amber-500/10 to-orange-500/10 border-amber-500/20 text-amber-600 dark:text-amber-400',
    },
    {
      title: 'Project Architect',
      description: 'Map out folder structures, design database systems, and compare technology frameworks.',
      prompt: 'Design a professional file structure and step-by-step project blueprint for an Express + React Full-Stack app, including standard state managers.',
      icon: Compass,
      badge: 'Architecture',
      color: 'from-emerald-500/10 to-teal-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400',
    },
    {
      title: 'General Knowledge',
      description: 'Compose creative writing, review textbook study topics, or brainstorm fresh product mockups.',
      prompt: 'Explain the concept of quantum computing in simple words with an engaging, easy-to-understand analogy.',
      icon: Lightbulb,
      badge: 'Explain Plainly',
      color: 'from-purple-500/10 to-fuchsia-500/10 border-purple-500/20 text-purple-600 dark:text-purple-400',
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 mt-8 max-w-4xl mx-auto" id="suggestions-grid">
      {items.map((item, index) => {
        const IconComponent = item.icon;
        return (
          <motion.button
            key={item.title}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.05 }}
            onClick={() => onSelectSuggestion(item.prompt)}
            className={`group relative text-left p-5 rounded-2xl border border-zinc-200/80 bg-white hover:bg-zinc-50/50 transition-all shadow-sm hover:shadow-md cursor-pointer flex flex-col justify-between active:scale-[0.99]`}
            id={`suggestion-card-${index}`}
          >
            <div>
              {/* Card Icon & Badge */}
              <div className="flex items-center justify-between mb-4.5">
                <div className={`p-2 rounded-xl bg-gradient-to-br ${item.color} border shrink-0`} id={`suggestion-icon-wrap-${index}`}>
                  <IconComponent className="h-5 w-5" />
                </div>
                <span className="font-mono text-[9px] font-semibold text-zinc-400 tracking-wider uppercase border border-zinc-100 bg-zinc-50 px-2 py-0.5 rounded-full">
                  {item.badge}
                </span>
              </div>

              {/* Title & Description */}
              <h3 className="font-display font-semibold text-sm text-zinc-900 group-hover:text-zinc-950 transition-colors">
                {item.title}
              </h3>
              <p className="text-zinc-500 text-xs mt-1.5 leading-relaxed pr-2">
                {item.description}
              </p>
            </div>

            {/* Quick Trigger Anchor */}
            <div className="mt-5 flex items-center justify-between text-[11px] font-medium text-zinc-400 group-hover:text-zinc-800 transition-colors">
              <span className="truncate italic font-normal text-zinc-400 max-w-[80%]">"{item.prompt.split('\n')[0]}"</span>
              <div className="flex items-center gap-0.5 shrink-0 bg-zinc-50 group-hover:bg-zinc-100 px-2 py-1 rounded-lg border border-zinc-100/50 transition-colors">
                <span>Try</span>
                <ArrowUpRight className="h-3.5 w-3.5" />
              </div>
            </div>
          </motion.button>
        );
      })}
    </div>
  );
}
