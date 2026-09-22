import React from 'react'

export function Table({ children, className = '', containerClassName = '' }) {
  return (
    <div className={`w-full overflow-x-auto rounded border border-slate-200 bg-white ${containerClassName}`}>
      <table className={`w-full text-left text-xs text-slate-800 border-collapse ${className}`}>
        {children}
      </table>
    </div>
  )
}

export function TableHeader({ children, className = '' }) {
  return (
    <thead className={`bg-slate-50 text-slate-600 font-semibold border-b border-slate-200 sticky top-0 z-1 ${className}`}>
      {children}
    </thead>
  )
}

export function TableBody({ children, className = '' }) {
  return <tbody className={`divide-y divide-slate-100 bg-white ${className}`}>{children}</tbody>
}

export function TableRow({ children, className = '', ...props }) {
  return (
    <tr
      className={`hover:bg-slate-50/80 transition-colors duration-150 ${className}`}
      {...props}
    >
      {children}
    </tr>
  )
}

export function TableHead({ children, className = '', ...props }) {
  return (
    <th
      scope="col"
      className={`py-3 px-4 text-xs font-semibold uppercase tracking-wider text-slate-700 ${className}`}
      {...props}
    >
      {children}
    </th>
  )
}

export function TableCell({ children, className = '', ...props }) {
  return (
    <td className={`py-3 px-4 text-xs whitespace-nowrap text-slate-800 ${className}`} {...props}>
      {children}
    </td>
  )
}

export default Table
