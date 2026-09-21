import React from 'react'

export function Table({ children, className = '', containerClassName = '' }) {
  return (
    <div className={`w-full overflow-x-auto rounded border border-cream-200/80 ${containerClassName}`}>
      <table className={`w-full text-left text-sm text-charcoal-800 font-ui border-collapse ${className}`}>
        {children}
      </table>
    </div>
  )
}

export function TableHeader({ children, className = '' }) {
  return (
    <thead className={`bg-cream-100/90 text-charcoal-700 font-semibold border-b border-cream-200 ${className}`}>
      {children}
    </thead>
  )
}

export function TableBody({ children, className = '' }) {
  return <tbody className={`divide-y divide-cream-200/60 bg-white ${className}`}>{children}</tbody>
}

export function TableRow({ children, className = '', ...props }) {
  return (
    <tr
      className={`hover:bg-cream-50/70 transition-colors duration-150 ${className}`}
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
      className={`px-4 py-3.5 text-xs uppercase tracking-wider font-medium text-charcoal-600 ${className}`}
      {...props}
    >
      {children}
    </th>
  )
}

export function TableCell({ children, className = '', ...props }) {
  return (
    <td className={`px-4 py-3.5 text-sm whitespace-nowrap text-charcoal-800 ${className}`} {...props}>
      {children}
    </td>
  )
}

export default Table
