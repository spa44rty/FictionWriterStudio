import { useState } from 'react'
import { Chapter } from '../types'
import { ChapterForm } from './ChapterForm'

interface ChapterListProps {
  chapters: Chapter[]
  activeChapterId: string | null
  onAdd: (chapter: Chapter) => void
  onUpdate: (id: string, chapter: Partial<Chapter>) => void
  onDelete: (id: string) => void
  onSelect: (id: string) => void
}

export function ChapterList({ chapters, activeChapterId, onAdd, onUpdate, onDelete, onSelect }: ChapterListProps) {
  const [editingId, setEditingId] = useState<string | null>(null)
  const [showNewForm, setShowNewForm] = useState(false)

  const handleSave = (chapter: Chapter) => {
    if (editingId) {
      onUpdate(editingId, chapter)
      setEditingId(null)
    } else {
      onAdd(chapter)
      setShowNewForm(false)
    }
  }

  if (showNewForm) {
    return (
      <ChapterForm
        onSave={handleSave}
        onCancel={() => setShowNewForm(false)}
      />
    )
  }

  if (editingId) {
    const chapter = chapters.find(c => c.id === editingId)
    return (
      <ChapterForm
        chapter={chapter}
        onSave={handleSave}
        onCancel={() => setEditingId(null)}
      />
    )
  }

  const sortedChapters = [...chapters].sort((a, b) => a.number - b.number)

  const getStatusColor = (status: Chapter['status']) => {
    switch (status) {
      case 'planned': return '#9e9e9e'
      case 'draft': return '#ff9800'
      case 'revised': return '#2196f3'
      case 'final': return '#4caf50'
    }
  }

  return (
    <div style={{ padding: 16 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <h2 style={{ margin: 0 }}>Chapters</h2>
        <button 
          onClick={() => setShowNewForm(true)} 
          style={{ 
            padding: '8px 16px', 
            background: '#4CAF50',
            color: '#fff',
            border: 'none',
            borderRadius: 4,
            cursor: 'pointer',
            fontWeight: 'bold'
          }}
        >
          + Add Chapter
        </button>
      </div>

      {chapters.length === 0 ? (
        <p style={{ color: '#666', fontStyle: 'italic' }}>No chapters yet. Click "Add Chapter" to create one.</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {sortedChapters.map(chapter => (
            <div 
              key={chapter.id} 
              onClick={() => onSelect(chapter.id)}
              style={{ 
                border: chapter.id === activeChapterId ? '2px solid #2196f3' : '1px solid #ddd', 
                borderRadius: 4, 
                padding: 12,
                borderLeft: `4px solid ${getStatusColor(chapter.status)}`,
                cursor: 'pointer',
                background: chapter.id === activeChapterId ? '#e3f2fd' : '#fff',
                transition: 'all 0.2s ease'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: 8 }}>
                <div>
                  <h3 style={{ margin: '0 0 4px 0' }}>
                    Chapter {chapter.number}: {chapter.title}
                  </h3>
                  <div style={{ fontSize: 12, color: '#666', display: 'flex', gap: 12 }}>
                    <span style={{ 
                      background: getStatusColor(chapter.status), 
                      color: '#fff', 
                      padding: '2px 8px', 
                      borderRadius: 3,
                      textTransform: 'capitalize'
                    }}>
                      {chapter.status}
                    </span>
                    {chapter.wordCount > 0 && (
                      <span>{chapter.wordCount.toLocaleString()} words</span>
                    )}
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button 
                    onClick={(e) => { e.stopPropagation(); setEditingId(chapter.id); }} 
                    style={{ 
                      padding: '4px 12px', 
                      fontSize: 12, 
                      cursor: 'pointer',
                      background: '#2196f3',
                      color: '#fff',
                      border: 'none',
                      borderRadius: 3
                    }}
                  >
                    Edit
                  </button>
                  <button 
                    onClick={(e) => { e.stopPropagation(); onDelete(chapter.id); }} 
                    style={{ 
                      padding: '4px 12px', 
                      fontSize: 12, 
                      cursor: 'pointer',
                      background: '#f44336',
                      color: '#fff',
                      border: 'none',
                      borderRadius: 3
                    }}
                  >
                    Delete
                  </button>
                </div>
              </div>
              
              {chapter.summary && (
                <p style={{ margin: '8px 0 0 0', fontSize: 14, color: '#555' }}>
                  {chapter.summary}
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
