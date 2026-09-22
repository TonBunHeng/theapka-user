import React from 'react'

export function Tabs({
  tabs = [],
  activeTab,
  onChange,
  variant = 'pills',
  className = '',
}) {
  if (variant === 'underline') {
    return (
      <div className={`border-b border-slate-200 flex space-x-6 overflow-x-auto ${className}`} role="tablist">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id
          const Icon = tab.icon
          return (
            <button
              key={tab.id}
              role="tab"
              type="button"
              aria-selected={isActive}
              onClick={() => onChange(tab.id)}
              className={`group relative flex items-center gap-2 py-3 text-xs font-semibold border-b-2 transition-colors cursor-pointer whitespace-nowrap ${
                isActive
                  ? 'border-brand-emerald-700 text-brand-emerald-800'
                  : 'border-transparent text-slate-500 hover:text-slate-900 hover:border-slate-300'
              }`}
            >
              {Icon && <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-brand-emerald-700' : 'text-slate-400 group-hover:text-slate-600'}`} />}
              <span>{tab.label}</span>
              {(tab.count !== undefined || tab.badge !== undefined) && (
                <span className={`ml-1 px-1.5 py-0.2 rounded-full text-[10px] font-medium ${
                  isActive ? 'bg-brand-emerald-100 text-brand-emerald-800' : 'bg-slate-100 text-slate-600'
                }`}>
                  {tab.count ?? tab.badge}
                </span>
              )}
            </button>
          )
        })}
      </div>
    )
  }

  return (
    <div
      className={`flex items-center gap-1.5 p-1 bg-slate-100 rounded border border-slate-200/60 overflow-x-auto ${className}`}
      role="tablist"
    >
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id
        const Icon = tab.icon
        return (
          <button
            key={tab.id}
            role="tab"
            type="button"
            aria-selected={isActive}
            onClick={() => onChange(tab.id)}
            className={`
              flex items-center gap-2 px-3.5 py-1.5 rounded text-xs font-semibold
              whitespace-nowrap transition-all duration-200 cursor-pointer
              ${
                isActive
                  ? 'bg-brand-emerald-700 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
              }
            `}
          >
            {Icon && <Icon className="w-3.5 h-3.5 shrink-0" />}
            <span>{tab.label}</span>
            {(tab.count !== undefined || tab.badge !== undefined) && (
              <span
                className={`ml-1 text-[10px] px-1.5 py-0.2 rounded-full ${
                  isActive ? 'bg-brand-emerald-800 text-white' : 'bg-slate-200 text-slate-700'
                }`}
              >
                {tab.count ?? tab.badge}
              </span>
            )}
          </button>
        )
      })}
    </div>
  )
}

export default Tabs
