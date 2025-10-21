import React from 'react'

interface BibleSectionProps {
  title: string
  value: string
  onChange: (value: string) => void
  maxLength: number
  placeholder?: string
}

export function BibleSection({ title, value, onChange, maxLength, placeholder }: BibleSectionProps) {
  const remaining = maxLength - value.length
  const isOverLimit = remaining < 0

  return (
    <div style={{ padding: 16, height: '100%', display: 'flex', flexDirection: 'column' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
        <h2 style={{ margin: 0 }}>{title}</h2>
        <span style={{ fontSize: 14, color: isOverLimit ? '#d32f2f' : '#666' }}>
          {remaining} characters remaining
        </span>
      </div>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        style={{
          flex: 1,
          fontFamily: 'system-ui, sans-serif',
          fontSize: 14,
          padding: 12,
          border: `1px solid ${isOverLimit ? '#d32f2f' : '#ddd'}`,
          borderRadius: 4,
          resize: 'none',
          outline: 'none'
        }}
      />
    </div>
  )
}
