import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Building, Users, Wrench, BarChart3, Calendar, AlertCircle, Command } from 'lucide-react';

interface CommandItem {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  action: () => void;
  category: 'navigation' | 'actions' | 'search';
}

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
}

const CommandPalette: React.FC<CommandPaletteProps> = ({ isOpen, onClose }) => {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const commands: CommandItem[] = [
    {
      id: 'dashboard',
      title: 'Dashboard',
      description: 'Go to dashboard overview',
      icon: <BarChart3 className="h-4 w-4" />,
      action: () => console.log('Navigate to dashboard'),
      category: 'navigation'
    },
    {
      id: 'properties',
      title: 'Properties',
      description: 'Manage your properties',
      icon: <Building className="h-4 w-4" />,
      action: () => console.log('Navigate to properties'),
      category: 'navigation'
    },
    {
      id: 'tenants',
      title: 'Tenants',
      description: 'Manage tenants',
      icon: <Users className="h-4 w-4" />,
      action: () => console.log('Navigate to tenants'),
      category: 'navigation'
    },
    {
      id: 'maintenance',
      title: 'Maintenance',
      description: 'Track maintenance tasks',
      icon: <Wrench className="h-4 w-4" />,
      action: () => console.log('Navigate to maintenance'),
      category: 'navigation'
    },
    {
      id: 'add-property',
      title: 'Add New Property',
      description: 'Register a new property',
      icon: <Building className="h-4 w-4" />,
      action: () => console.log('Add property'),
      category: 'actions'
    },
    {
      id: 'add-tenant',
      title: 'Add New Tenant',
      description: 'Register a new tenant',
      icon: <Users className="h-4 w-4" />,
      action: () => console.log('Add tenant'),
      category: 'actions'
    },
    {
      id: 'create-reminder',
      title: 'Create Reminder',
      description: 'Set up a new reminder',
      icon: <Calendar className="h-4 w-4" />,
      action: () => console.log('Create reminder'),
      category: 'actions'
    },
    {
      id: 'maintenance-task',
      title: 'Create Maintenance Task',
      description: 'Schedule maintenance work',
      icon: <Wrench className="h-4 w-4" />,
      action: () => console.log('Create maintenance task'),
      category: 'actions'
    },
  ];

  const filteredCommands = commands.filter(command => 
    command.title.toLowerCase().includes(query.toLowerCase()) ||
    command.description.toLowerCase().includes(query.toLowerCase())
  );

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => Math.min(prev + 1, filteredCommands.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => Math.max(prev - 1, 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (filteredCommands[selectedIndex]) {
        filteredCommands[selectedIndex].action();
        onClose();
      }
    } else if (e.key === 'Escape') {
      onClose();
    }
  };

  const getCategoryTitle = (category: string) => {
    switch (category) {
      case 'navigation': return 'Navigation';
      case 'actions': return 'Quick Actions';
      case 'search': return 'Search Results';
      default: return 'Commands';
    }
  };

  const groupedCommands = filteredCommands.reduce((acc, command) => {
    if (!acc[command.category]) {
      acc[command.category] = [];
    }
    acc[command.category].push(command);
    return acc;
  }, {} as Record<string, CommandItem[]>);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
            onClick={onClose}
          />
          
          {/* Command Palette */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -20 }}
            transition={{ duration: 0.2 }}
            className="fixed top-1/4 left-1/2 transform -translate-x-1/2 w-full max-w-2xl z-50"
          >
            <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden">
              {/* Search Input */}
              <div className="flex items-center gap-3 px-6 py-4 border-b border-gray-100">
                <Search className="h-5 w-5 text-gray-400" />
                <input
                  ref={inputRef}
                  type="text"
                  placeholder="Type a command or search..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={handleKeyDown}
                  className="flex-1 text-lg bg-transparent outline-none placeholder-gray-400"
                />
                <div className="flex items-center gap-1 text-xs text-gray-400">
                  <Command className="h-3 w-3" />
                  <span>+</span>
                  <span>K</span>
                </div>
              </div>

              {/* Commands List */}
              <div className="max-h-96 overflow-y-auto">
                {Object.keys(groupedCommands).length === 0 ? (
                  <div className="px-6 py-8 text-center text-gray-500">
                    <Search className="h-8 w-8 text-gray-300 mx-auto mb-2" />
                    <p>No commands found</p>
                  </div>
                ) : (
                  Object.entries(groupedCommands).map(([category, commands]) => (
                    <div key={category} className="px-2 py-2">
                      <div className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                        {getCategoryTitle(category)}
                      </div>
                      {commands.map((command, index) => {
                        const globalIndex = filteredCommands.indexOf(command);
                        return (
                          <motion.button
                            key={command.id}
                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors ${
                              selectedIndex === globalIndex
                                ? 'bg-blue-50 text-blue-900 border-blue-200'
                                : 'hover:bg-gray-50'
                            }`}
                            onClick={() => {
                              command.action();
                              onClose();
                            }}
                            whileHover={{ scale: 1.01 }}
                            whileTap={{ scale: 0.99 }}
                          >
                            <div className={`p-2 rounded-lg ${
                              selectedIndex === globalIndex
                                ? 'bg-blue-100 text-blue-600'
                                : 'bg-gray-100 text-gray-600'
                            }`}>
                              {command.icon}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="font-medium text-gray-900">{command.title}</div>
                              <div className="text-sm text-gray-500 truncate">{command.description}</div>
                            </div>
                            {selectedIndex === globalIndex && (
                              <div className="text-xs text-blue-600 font-medium">↵</div>
                            )}
                          </motion.button>
                        );
                      })}
                    </div>
                  ))
                )}
              </div>

              {/* Footer */}
              <div className="px-6 py-3 bg-gray-50 border-t border-gray-100">
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1">
                      <kbd className="px-2 py-1 bg-white rounded border border-gray-200">↑↓</kbd>
                      <span>Navigate</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <kbd className="px-2 py-1 bg-white rounded border border-gray-200">↵</kbd>
                      <span>Select</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <kbd className="px-2 py-1 bg-white rounded border border-gray-200">esc</kbd>
                      <span>Close</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default CommandPalette;
