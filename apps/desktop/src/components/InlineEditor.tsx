import { useState, useRef, useEffect } from 'react'

interface Issue {
  kind: string
  severity: 'error' | 'warning' | 'info'
  message: string
  position?: { start: number, end: number }
  text?: string
}

interface Suggestion {
  line: number
  old: string
  new: string
  rationale?: string
  position?: { start: number, end: number }
}

interface InlineEditorProps {
  value: string
  onChange: (value: string) => void
  issues: Issue[]
  suggestions: Suggestion[]
  onIgnoreIssue: (issue: Issue) => void
  onApplySuggestion: (suggestion: Suggestion) => void
  onIgnoreSuggestion: (suggestion: Suggestion) => void
}

export function InlineEditor({
  value,
  onChange,
  issues,
  suggestions,
  onIgnoreIssue,
  onApplySuggestion,
  onIgnoreSuggestion
}: InlineEditorProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const [activeTooltip, setActiveTooltip] = useState<{ type: 'issue' | 'suggestion', item: any, rect: DOMRect } | null>(null)
  const [highlights, setHighlights] = useState<Array<{ start: number, end: number, type: 'issue' | 'suggestion', severity?: string, item: any }>>([])

  // Update highlights when issues or suggestions change
  useEffect(() => {
    const newHighlights: typeof highlights = []
    
    // Add issue highlights
    issues.forEach(issue => {
      if (issue.position) {
        newHighlights.push({
          start: issue.position.start,
          end: issue.position.end,
          type: 'issue',
          severity: issue.severity,
          item: issue
        })
      }
    })
    
    // Add suggestion highlights
    suggestions.forEach(suggestion => {
      if (suggestion.position) {
        newHighlights.push({
          start: suggestion.position.start,
          end: suggestion.position.end,
          type: 'suggestion',
          item: suggestion
        })
      }
    })
    
    setHighlights(newHighlights)
  }, [issues, suggestions])

  const handleTextareaClick = (e: React.MouseEvent<HTMLTextAreaElement>) => {
    const textarea = e.currentTarget
    const cursorPos = textarea.selectionStart
    
    // Find if cursor is on a highlight
    const highlight = highlights.find(h => cursorPos >= h.start && cursorPos <= h.end)
    
    if (highlight) {
      // Get the bounding rect for tooltip positioning
      const rect = textarea.getBoundingClientRect()
      setActiveTooltip({
        type: highlight.type,
        item: highlight.item,
        rect
      })
    } else {
      setActiveTooltip(null)
    }
  }

  const renderHighlightedText = () => {
    if (highlights.length === 0) return null

    const parts: Array<{ text: string, highlight?: typeof highlights[0] }> = []
    let lastIndex = 0

    // Sort highlights by start position
    const sortedHighlights = [...highlights].sort((a, b) => a.start - b.start)

    sortedHighlights.forEach(highlight => {
      // Add text before highlight
      if (highlight.start > lastIndex) {
        parts.push({ text: value.substring(lastIndex, highlight.start) })
      }
      
      // Add highlighted text
      parts.push({
        text: value.substring(highlight.start, highlight.end),
        highlight
      })
      
      lastIndex = highlight.end
    })

    // Add remaining text
    if (lastIndex < value.length) {
      parts.push({ text: value.substring(lastIndex) })
    }

    return (
      <div
        style={{
          position: 'absolute',
          top: 12,
          left: 12,
          right: 12,
          bottom: 12,
          fontFamily: 'serif',
          fontSize: 18,
          lineHeight: 1.6,
          whiteSpace: 'pre-wrap',
          wordWrap: 'break-word',
          color: 'transparent',
          pointerEvents: 'none',
          overflow: 'hidden'
        }}
      >
        {parts.map((part, idx) => {
          if (part.highlight) {
            const severityColors = {
              error: '#dc3545',
              warning: '#ff9800',
              info: '#2196f3'
            }
            const color = part.highlight.type === 'issue' 
              ? severityColors[part.highlight.severity as keyof typeof severityColors] || '#ff9800'
              : '#4caf50'
            
            return (
              <span
                key={idx}
                style={{
                  backgroundColor: `${color}20`,
                  borderBottom: `2px wavy ${color}`,
                  color: 'transparent'
                }}
              >
                {part.text}
              </span>
            )
          }
          return <span key={idx}>{part.text}</span>
        })}
      </div>
    )
  }

  return (
    <div style={{ position: 'relative', flex: 1, display: 'flex', flexDirection: 'column' }}>
      <div style={{ position: 'relative', flex: 1 }}>
        <textarea
          ref={textareaRef}
          value={value}
          onChange={e => onChange(e.target.value)}
          onClick={handleTextareaClick}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            fontFamily: 'serif',
            fontSize: 18,
            lineHeight: 1.6,
            padding: 12,
            border: '1px solid #ddd',
            borderRadius: 4,
            resize: 'none',
            backgroundColor: 'transparent',
            zIndex: 2
          }}
        />
        {renderHighlightedText()}
      </div>

      {/* Tooltip */}
      {activeTooltip && (
        <div
          style={{
            position: 'fixed',
            bottom: 20,
            left: '50%',
            transform: 'translateX(-50%)',
            maxWidth: 500,
            backgroundColor: '#fff',
            border: '2px solid #333',
            borderRadius: 8,
            padding: 16,
            boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
            zIndex: 1000
          }}
        >
          {activeTooltip.type === 'issue' ? (
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                <span style={{
                  fontSize: 11,
                  fontWeight: 'bold',
                  color: '#fff',
                  background: activeTooltip.item.severity === 'error' ? '#dc3545' : 
                             activeTooltip.item.severity === 'warning' ? '#ff9800' : '#2196f3',
                  padding: '3px 8px',
                  borderRadius: 4,
                  textTransform: 'uppercase'
                }}>
                  {activeTooltip.item.severity}
                </span>
                <code style={{ fontSize: 12, color: '#666' }}>{activeTooltip.item.kind}</code>
              </div>
              <p style={{ fontSize: 14, margin: '8px 0' }}>{activeTooltip.item.message}</p>
              <button
                onClick={() => {
                  onIgnoreIssue(activeTooltip.item)
                  setActiveTooltip(null)
                }}
                style={{
                  padding: '8px 16px',
                  background: '#666',
                  color: '#fff',
                  border: 'none',
                  borderRadius: 4,
                  cursor: 'pointer',
                  fontSize: 13
                }}
              >
                Ignore
              </button>
            </div>
          ) : (
            <div>
              <div style={{ fontSize: 13, fontWeight: 'bold', marginBottom: 8, color: '#333' }}>
                AI Suggestion
              </div>
              <div style={{ fontSize: 13, padding: 8, background: '#ffe0e0', borderRadius: 4, marginBottom: 6 }}>
                <strong>Old:</strong> {activeTooltip.item.old}
              </div>
              <div style={{ fontSize: 13, padding: 8, background: '#e0ffe0', borderRadius: 4, marginBottom: 8 }}>
                <strong>New:</strong> {activeTooltip.item.new}
              </div>
              {activeTooltip.item.rationale && (
                <p style={{ fontSize: 12, color: '#666', fontStyle: 'italic', margin: '8px 0' }}>
                  {activeTooltip.item.rationale}
                </p>
              )}
              <div style={{ display: 'flex', gap: 8 }}>
                <button
                  onClick={() => {
                    onApplySuggestion(activeTooltip.item)
                    setActiveTooltip(null)
                  }}
                  style={{
                    flex: 1,
                    padding: '8px 16px',
                    background: '#4caf50',
                    color: '#fff',
                    border: 'none',
                    borderRadius: 4,
                    cursor: 'pointer',
                    fontSize: 13
                  }}
                >
                  Apply
                </button>
                <button
                  onClick={() => {
                    onIgnoreSuggestion(activeTooltip.item)
                    setActiveTooltip(null)
                  }}
                  style={{
                    flex: 1,
                    padding: '8px 16px',
                    background: '#f44336',
                    color: '#fff',
                    border: 'none',
                    borderRadius: 4,
                    cursor: 'pointer',
                    fontSize: 13
                  }}
                >
                  Ignore
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
