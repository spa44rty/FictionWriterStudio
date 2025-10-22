interface BibleSectionProps {
  title: string
  value: string
  onChange: (value: string) => void
  maxLength: number
  placeholder?: string
  actionButton?: {
    label: string
    onClick: () => void
    disabled?: boolean
  }
}

export function BibleSection({ title, value, onChange, maxLength, placeholder, actionButton }: BibleSectionProps) {
  const remaining = maxLength - value.length
  const isOverLimit = remaining < 0

  return (
    <div style={{ padding: 16, height: '100%', display: 'flex', flexDirection: 'column' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
        <h2 style={{ margin: 0 }}>{title}</h2>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          {actionButton && (
            <button
              onClick={actionButton.onClick}
              disabled={actionButton.disabled}
              style={{
                padding: '6px 12px',
                fontSize: 13,
                backgroundColor: actionButton.disabled ? '#ccc' : '#4CAF50',
                color: 'white',
                border: 'none',
                borderRadius: 4,
                cursor: actionButton.disabled ? 'not-allowed' : 'pointer',
                fontWeight: 500
              }}
            >
              {actionButton.label}
            </button>
          )}
          <span style={{ fontSize: 14, color: isOverLimit ? '#d32f2f' : '#666' }}>
            {remaining} characters remaining
          </span>
        </div>
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
