import React from 'react'

export function Tabs({ tabs = [], activeTab, onChange, className = '' }) {
  return (
    <div
      className={`flex items-center gap-1.5 p-1 bg-cream-200/70 rounded overflow-x-auto ${className}`}
      role="tablist"
    >
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id
        return (
          <button
            key={tab.id}
            role="tab"
            aria-selected={isActive}
            onClick={() => onChange(tab.id)}
            className={`
              flex items-center gap-2 px-3.5 py-2 rounded text-sm font-medium font-ui
              whitespace-nowrap transition-all duration-200 touch-target
              ${
                isActive
                  ? 'bg-white text-burgundy-600 shadow-sm border border-gold-200/40'
                  : 'text-charcoal-600 hover:text-charcoal-900 hover:bg-cream-100/60'
              }
            `}
          >
            {tab.icon && <tab.icon className="w-4 h-4 shrink-0" />}
            <span>{tab.label}</span>
            {tab.count !== undefined && (
              <span
                className={`ml-1 text-xs px-1.5 py-0.5 rounded-full ${
                  isActive ? 'bg-burgundy-100 text-burgundy-700' : 'bg-cream-300/60 text-charcoal-600'
                }`}
              >
                {tab.count}
              </span>
            )}
          </button>
        )
      })}
    </div>
  )
}

export default Tabs
