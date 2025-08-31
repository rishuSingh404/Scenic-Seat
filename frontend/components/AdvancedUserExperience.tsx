'use client';

import { useState, useEffect, useCallback } from 'react';

interface KeyboardShortcut {
  key: string;
  description: string;
  action: () => void;
  category: 'navigation' | 'map' | 'form' | 'general';
}

interface AccessibilitySettings {
  reducedMotion: boolean;
  highContrast: boolean;
  largeText: boolean;
  screenReader: boolean;
}

interface UserPreferences {
  theme: 'light' | 'dark' | 'auto';
  language: string;
  units: 'metric' | 'imperial';
  notifications: boolean;
}

interface AdvancedUserExperienceProps {
  className?: string;
}

export function AdvancedUserExperience({ className = '' }: AdvancedUserExperienceProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [activeTab, setActiveTab] = useState<'shortcuts' | 'accessibility' | 'preferences'>('shortcuts');
  const [accessibility, setAccessibility] = useState<AccessibilitySettings>({
    reducedMotion: false,
    highContrast: false,
    largeText: false,
    screenReader: false
  });
  const [preferences, setPreferences] = useState<UserPreferences>({
    theme: 'auto',
    language: 'en',
    units: 'metric',
    notifications: true
  });
  const [showShortcutHelp, setShowShortcutHelp] = useState(false);

  // Keyboard shortcuts
  const shortcuts: KeyboardShortcut[] = [
    // Navigation shortcuts
    {
      key: 'Ctrl + K',
      description: 'Focus search',
      action: () => (document.querySelector('input[type="text"]') as HTMLInputElement)?.focus(),
      category: 'navigation'
    },
    {
      key: 'Ctrl + M',
      description: 'Toggle map controls',
      action: () => setIsVisible(!isVisible),
      category: 'map'
    },
    {
      key: 'Ctrl + T',
      description: 'Toggle theme',
      action: () => {
        const newTheme = preferences.theme === 'light' ? 'dark' : 'light';
        setPreferences(prev => ({ ...prev, theme: newTheme }));
        document.documentElement.classList.toggle('dark');
      },
      category: 'general'
    },
    {
      key: 'Ctrl + F',
      description: 'Focus flight form',
      action: () => document.querySelector('form')?.focus(),
      category: 'form'
    },
    {
      key: 'Ctrl + R',
      description: 'Reset map view',
      action: () => console.log('Reset map view'),
      category: 'map'
    },
    {
      key: 'Ctrl + S',
      description: 'Save current view',
      action: () => console.log('Save current view'),
      category: 'map'
    },
    {
      key: 'Escape',
      description: 'Close all modals',
      action: () => setShowShortcutHelp(false),
      category: 'general'
    },
    {
      key: 'Ctrl + ?',
      description: 'Show this help',
      action: () => setShowShortcutHelp(!showShortcutHelp),
      category: 'general'
    }
  ];

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Don't trigger shortcuts when typing in input fields
      if (event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement) {
        return;
      }

      const isCtrl = event.ctrlKey || event.metaKey;
      const key = event.key.toLowerCase();

      shortcuts.forEach(shortcut => {
        const [modifier, shortcutKey] = shortcut.key.toLowerCase().split(' + ');
        
        if (modifier === 'ctrl' && isCtrl && key === shortcutKey) {
          event.preventDefault();
          shortcut.action();
        } else if (modifier === 'escape' && key === 'escape') {
          event.preventDefault();
          shortcut.action();
        }
      });
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [shortcuts]);

  // Apply accessibility settings
  useEffect(() => {
    document.documentElement.classList.toggle('reduced-motion', accessibility.reducedMotion);
    document.documentElement.classList.toggle('high-contrast', accessibility.highContrast);
    document.documentElement.classList.toggle('large-text', accessibility.largeText);
    
    // Update CSS custom properties
    if (accessibility.highContrast) {
      document.documentElement.style.setProperty('--contrast-multiplier', '1.5');
    } else {
      document.documentElement.style.setProperty('--contrast-multiplier', '1');
    }
  }, [accessibility]);

  // Apply user preferences
  useEffect(() => {
    // Apply theme
    if (preferences.theme === 'auto') {
      const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      document.documentElement.classList.toggle('dark', isDark);
    } else {
      document.documentElement.classList.toggle('dark', preferences.theme === 'dark');
    }

    // Apply language
    document.documentElement.lang = preferences.language;

    // Apply units
    document.documentElement.setAttribute('data-units', preferences.units);
  }, [preferences]);

  // Toggle accessibility setting
  const toggleAccessibility = (setting: keyof AccessibilitySettings) => {
    setAccessibility(prev => ({ ...prev, [setting]: !prev[setting] }));
  };

  // Update user preference
  const updatePreference = (setting: keyof UserPreferences, value: any) => {
    setPreferences(prev => ({ ...prev, [setting]: value }));
  };

  // Get shortcut category icon
  const getCategoryIcon = (category: KeyboardShortcut['category']): string => {
    switch (category) {
      case 'navigation': return '🧭';
      case 'map': return '🗺️';
      case 'form': return '📝';
      case 'general': return '⚙️';
      default: return '🔧';
    }
  };

  // Get shortcut category color
  const getCategoryColor = (category: KeyboardShortcut['category']): string => {
    switch (category) {
      case 'navigation': return 'text-blue-600 bg-blue-100 dark:bg-blue-900/50';
      case 'map': return 'text-green-600 bg-green-100 dark:bg-green-900/50';
      case 'form': return 'text-purple-600 bg-purple-100 dark:bg-purple-900/50';
      case 'general': return 'text-gray-600 bg-gray-100 dark:bg-gray-700';
      default: return 'text-gray-600 bg-gray-100 dark:bg-gray-700';
    }
  };

  return (
    <>
      {/* UX Toggle Button */}
      <div className={`fixed bottom-4 left-20 z-50 ${className}`}>
        <button
          onClick={() => setIsVisible(!isVisible)}
          className={`w-12 h-12 rounded-full shadow-lg border-2 transition-all duration-200 ${
            isVisible
              ? 'bg-green-600 text-white border-green-700'
              : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 border-gray-300 dark:border-gray-600 hover:bg-green-50 dark:hover:bg-green-900/50'
          }`}
          title="Advanced UX Features"
        >
          ✨
        </button>
      </div>

      {/* UX Panel */}
      {isVisible && (
        <div className="fixed bottom-20 left-4 z-50 w-80 bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-green-600 to-emerald-600 p-4 text-white">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Advanced UX Features</h3>
              <button
                onClick={() => setShowShortcutHelp(!showShortcutHelp)}
                className="px-3 py-1 bg-white/20 rounded-lg text-sm hover:bg-white/30 transition-colors"
              >
                ⌨️ Shortcuts
              </button>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="flex border-b border-gray-200 dark:border-gray-700">
            {[
              { id: 'shortcuts', label: 'Shortcuts', icon: '⌨️' },
              { id: 'accessibility', label: 'Accessibility', icon: '♿' },
              { id: 'preferences', label: 'Preferences', icon: '⚙️' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex-1 flex items-center justify-center space-x-2 px-3 py-2 text-sm font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-300 border-b-2 border-green-600'
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                <span>{tab.icon}</span>
                <span>{tab.label}</span>
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="p-4 max-h-96 overflow-y-auto">
            {activeTab === 'shortcuts' && (
              <div className="space-y-4">
                <div className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                  Use these keyboard shortcuts to navigate and control the application faster.
                </div>
                
                {(['navigation', 'map', 'form', 'general'] as const).map(category => (
                  <div key={category} className="space-y-2">
                    <h4 className="text-sm font-medium text-gray-900 dark:text-white capitalize">
                      {category} Shortcuts
                    </h4>
                    <div className="space-y-2">
                      {shortcuts
                        .filter(shortcut => shortcut.category === category)
                        .map((shortcut, index) => (
                          <div
                            key={index}
                            className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-700 rounded-lg"
                          >
                            <div className="flex items-center space-x-2">
                              <span className={`px-2 py-1 rounded text-xs ${getCategoryColor(category)}`}>
                                {getCategoryIcon(category)}
                              </span>
                              <span className="text-sm text-gray-700 dark:text-gray-300">
                                {shortcut.description}
                              </span>
                            </div>
                            <kbd className="px-2 py-1 bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-gray-200 rounded text-xs font-mono">
                              {shortcut.key}
                            </kbd>
                          </div>
                        ))}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'accessibility' && (
              <div className="space-y-4">
                <div className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                  Customize the application to better suit your accessibility needs.
                </div>
                
                {[
                  { key: 'reducedMotion', label: 'Reduced Motion', description: 'Reduce animations and transitions' },
                  { key: 'highContrast', label: 'High Contrast', description: 'Increase color contrast for better visibility' },
                  { key: 'largeText', label: 'Large Text', description: 'Increase text size throughout the application' },
                  { key: 'screenReader', label: 'Screen Reader', description: 'Optimize for screen reader compatibility' }
                ].map(setting => (
                  <div key={setting.key} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <div>
                      <div className="font-medium text-gray-900 dark:text-white">{setting.label}</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">{setting.description}</div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={accessibility[setting.key as keyof AccessibilitySettings]}
                        onChange={() => toggleAccessibility(setting.key as keyof AccessibilitySettings)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 dark:peer-focus:ring-green-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-green-600"></div>
                    </label>
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'preferences' && (
              <div className="space-y-4">
                <div className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                  Customize your application experience and preferences.
                </div>
                
                {/* Theme Preference */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-900 dark:text-white">Theme</label>
                  <select
                    value={preferences.theme}
                    onChange={(e) => updatePreference('theme', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    <option value="light">Light</option>
                    <option value="dark">Dark</option>
                    <option value="auto">Auto (System)</option>
                  </select>
                </div>

                {/* Language Preference */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-900 dark:text-white">Language</label>
                  <select
                    value={preferences.language}
                    onChange={(e) => updatePreference('language', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    <option value="en">English</option>
                    <option value="es">Español</option>
                    <option value="fr">Français</option>
                    <option value="de">Deutsch</option>
                    <option value="ja">日本語</option>
                    <option value="zh">中文</option>
                  </select>
                </div>

                {/* Units Preference */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-900 dark:text-white">Units</label>
                  <div className="flex space-x-2">
                    {['metric', 'imperial'].map(unit => (
                      <button
                        key={unit}
                        onClick={() => updatePreference('units', unit)}
                        className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                          preferences.units === unit
                            ? 'bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-300 border border-green-300 dark:border-green-700'
                            : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                        }`}
                      >
                        {unit.charAt(0).toUpperCase() + unit.slice(1)}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Notifications Preference */}
                <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div>
                    <div className="font-medium text-gray-900 dark:text-white">Notifications</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">Show notifications for updates and alerts</div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={preferences.notifications}
                      onChange={(e) => updatePreference('notifications', e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 dark:peer-focus:ring-green-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-green-600"></div>
                  </label>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Shortcut Help Modal */}
      {showShortcutHelp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl p-6 max-w-2xl max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Keyboard Shortcuts</h2>
              <button
                onClick={() => setShowShortcutHelp(false)}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                ✕
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {shortcuts.map((shortcut, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
                >
                  <div className="flex items-center space-x-2">
                    <span className={`px-2 py-1 rounded text-xs ${getCategoryColor(shortcut.category)}`}>
                      {getCategoryIcon(shortcut.category)}
                    </span>
                    <span className="text-sm text-gray-700 dark:text-gray-300">
                      {shortcut.description}
                    </span>
                  </div>
                  <kbd className="px-3 py-1 bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-gray-200 rounded text-sm font-mono">
                    {shortcut.key}
                  </kbd>
                </div>
              ))}
            </div>
            
            <div className="mt-6 text-center">
              <button
                onClick={() => setShowShortcutHelp(false)}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                Got it!
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
