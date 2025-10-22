import { useState } from 'react'
import { Chapter } from '../types'

interface ChapterFormProps {
  chapter?: Chapter
  onSave: (chapter: Chapter) => void
  onCancel: () => void
}

export function ChapterForm({ chapter, onSave, onCancel }: ChapterFormProps) {
  const [number, setNumber] = useState(chapter?.number || 1)
  const [title, setTitle] = useState(chapter?.title || '')
  const [summary, setSummary] = useState(chapter?.summary || '')
  const [wordCount, setWordCount] = useState(chapter?.wordCount || 0)
  const [status, setStatus] = useState<Chapter['status']>(chapter?.status || 'planned')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    onSave({
      id: chapter?.id || `ch-${Date.now()}`,
      number,
      title,
      summary,
      wordCount,
      status
    })
  }

  return (
    <div style={{ padding: 16 }}>
      <h2>{chapter ? 'Edit Chapter' : 'New Chapter'}</h2>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div>
          <label style={{ display: 'block', marginBottom: 4, fontWeight: 'bold' }}>
            Chapter Number *
          </label>
          <input
            type="number"
            value={number}
            onChange={(e) => setNumber(parseInt(e.target.value) || 1)}
            min={1}
            required
            style={{ width: '100%', padding: 8, border: '1px solid #ddd', borderRadius: 4 }}
          />
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: 4, fontWeight: 'bold' }}>
            Title *
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            placeholder="e.g., The Beginning"
            style={{ width: '100%', padding: 8, border: '1px solid #ddd', borderRadius: 4 }}
          />
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: 4, fontWeight: 'bold' }}>
            Summary
          </label>
          <textarea
            value={summary}
            onChange={(e) => setSummary(e.target.value)}
            placeholder="Brief summary of what happens in this chapter..."
            rows={4}
            style={{ width: '100%', padding: 8, border: '1px solid #ddd', borderRadius: 4, fontFamily: 'inherit', resize: 'vertical' }}
          />
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: 4, fontWeight: 'bold' }}>
            Word Count
          </label>
          <input
            type="number"
            value={wordCount}
            onChange={(e) => setWordCount(parseInt(e.target.value) || 0)}
            min={0}
            style={{ width: '100%', padding: 8, border: '1px solid #ddd', borderRadius: 4 }}
          />
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: 4, fontWeight: 'bold' }}>
            Status
          </label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as Chapter['status'])}
            style={{ width: '100%', padding: 8, border: '1px solid #ddd', borderRadius: 4 }}
          >
            <option value="planned">Planned</option>
            <option value="draft">Draft</option>
            <option value="revised">Revised</option>
            <option value="final">Final</option>
          </select>
        </div>

        <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
          <button 
            type="submit" 
            style={{ 
              flex: 1, 
              padding: '10px 16px', 
              background: '#4CAF50', 
              color: '#fff', 
              border: 'none', 
              borderRadius: 4, 
              cursor: 'pointer',
              fontWeight: 'bold'
            }}
          >
            Save Chapter
          </button>
          <button 
            type="button"
            onClick={onCancel} 
            style={{ 
              flex: 1, 
              padding: '10px 16px', 
              background: '#f44336', 
              color: '#fff', 
              border: 'none', 
              borderRadius: 4, 
              cursor: 'pointer',
              fontWeight: 'bold'
            }}
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  )
}
