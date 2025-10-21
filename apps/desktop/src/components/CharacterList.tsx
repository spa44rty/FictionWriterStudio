import React, { useState } from 'react'
import { Character } from '../types'
import { CharacterForm } from './CharacterForm'

interface CharacterListProps {
  characters: Character[]
  onAdd: (character: Character) => void
  onUpdate: (id: string, character: Partial<Character>) => void
  onDelete: (id: string) => void
}

export function CharacterList({ characters, onAdd, onUpdate, onDelete }: CharacterListProps) {
  const [editingId, setEditingId] = useState<string | null>(null)
  const [showNewForm, setShowNewForm] = useState(false)

  const handleSave = (character: Character) => {
    if (editingId) {
      onUpdate(editingId, character)
      setEditingId(null)
    } else {
      onAdd(character)
      setShowNewForm(false)
    }
  }

  if (showNewForm) {
    return (
      <CharacterForm
        onSave={handleSave}
        onCancel={() => setShowNewForm(false)}
      />
    )
  }

  if (editingId) {
    const character = characters.find(c => c.id === editingId)
    return (
      <CharacterForm
        character={character}
        onSave={handleSave}
        onCancel={() => setEditingId(null)}
      />
    )
  }

  return (
    <div style={{ padding: 16 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <h2 style={{ margin: 0 }}>Characters</h2>
        <button onClick={() => setShowNewForm(true)} style={{ padding: '8px 16px', cursor: 'pointer' }}>
          + Add Character
        </button>
      </div>

      {characters.length === 0 ? (
        <p style={{ color: '#666', fontStyle: 'italic' }}>No characters yet. Click "Add Character" to create one.</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {characters.map(character => (
            <div key={character.id} style={{ border: '1px solid #ddd', borderRadius: 4, padding: 12 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: 8 }}>
                <div>
                  <h3 style={{ margin: '0 0 4px 0' }}>{character.name}</h3>
                  <span style={{ fontSize: 12, color: '#666', textTransform: 'capitalize' }}>
                    {character.characterType}
                  </span>
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button onClick={() => setEditingId(character.id)} style={{ padding: '4px 12px', fontSize: 12, cursor: 'pointer' }}>
                    Edit
                  </button>
                  <button onClick={() => onDelete(character.id)} style={{ padding: '4px 12px', fontSize: 12, cursor: 'pointer', color: '#d32f2f' }}>
                    Delete
                  </button>
                </div>
              </div>
              
              {character.description && (
                <p style={{ margin: '8px 0', fontSize: 14 }}>{character.description}</p>
              )}
              
              {character.voiceTone && (
                <p style={{ margin: '4px 0', fontSize: 13, color: '#555' }}>
                  <strong>Voice:</strong> {character.voiceTone}
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
