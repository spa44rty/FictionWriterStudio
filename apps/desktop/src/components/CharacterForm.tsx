import React, { useState } from 'react'
import { Character, CharacterType } from '../types'

interface CharacterFormProps {
  character?: Character
  onSave: (character: Character) => void
  onCancel: () => void
}

export function CharacterForm({ character, onSave, onCancel }: CharacterFormProps) {
  const [formData, setFormData] = useState<Character>(
    character || {
      id: crypto.randomUUID(),
      name: '',
      description: '',
      voiceTone: '',
      characterType: 'secondary',
      personality: '',
      background: ''
    }
  )

  const updateField = (field: keyof Character, value: string | CharacterType) => {
    setFormData({ ...formData, [field]: value })
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (formData.name.trim()) {
      onSave(formData)
    }
  }

  return (
    <form onSubmit={handleSubmit} style={{ padding: 16 }}>
      <h3>{character ? 'Edit Character' : 'New Character'}</h3>
      
      <div style={{ marginBottom: 12 }}>
        <label style={{ display: 'block', marginBottom: 4, fontSize: 14, fontWeight: 500 }}>Name *</label>
        <input
          type="text"
          value={formData.name}
          onChange={(e) => updateField('name', e.target.value)}
          style={{ width: '100%', padding: 8, fontSize: 14, border: '1px solid #ddd', borderRadius: 4 }}
          required
        />
      </div>

      <div style={{ marginBottom: 12 }}>
        <label style={{ display: 'block', marginBottom: 4, fontSize: 14, fontWeight: 500 }}>Character Type</label>
        <select
          value={formData.characterType}
          onChange={(e) => updateField('characterType', e.target.value as CharacterType)}
          style={{ width: '100%', padding: 8, fontSize: 14, border: '1px solid #ddd', borderRadius: 4 }}
        >
          <option value="protagonist">Protagonist</option>
          <option value="antagonist">Antagonist</option>
          <option value="secondary">Secondary</option>
          <option value="support">Support</option>
          <option value="minor">Minor</option>
        </select>
      </div>

      <div style={{ marginBottom: 12 }}>
        <label style={{ display: 'block', marginBottom: 4, fontSize: 14, fontWeight: 500 }}>Description</label>
        <textarea
          value={formData.description}
          onChange={(e) => updateField('description', e.target.value)}
          rows={3}
          style={{ width: '100%', padding: 8, fontSize: 14, border: '1px solid #ddd', borderRadius: 4, fontFamily: 'system-ui' }}
        />
      </div>

      <div style={{ marginBottom: 12 }}>
        <label style={{ display: 'block', marginBottom: 4, fontSize: 14, fontWeight: 500 }}>Voice Tone</label>
        <input
          type="text"
          value={formData.voiceTone}
          onChange={(e) => updateField('voiceTone', e.target.value)}
          placeholder="e.g., sarcastic, formal, warm"
          style={{ width: '100%', padding: 8, fontSize: 14, border: '1px solid #ddd', borderRadius: 4 }}
        />
      </div>

      <div style={{ marginBottom: 12 }}>
        <label style={{ display: 'block', marginBottom: 4, fontSize: 14, fontWeight: 500 }}>Personality</label>
        <textarea
          value={formData.personality}
          onChange={(e) => updateField('personality', e.target.value)}
          rows={3}
          style={{ width: '100%', padding: 8, fontSize: 14, border: '1px solid #ddd', borderRadius: 4, fontFamily: 'system-ui' }}
        />
      </div>

      <div style={{ marginBottom: 12 }}>
        <label style={{ display: 'block', marginBottom: 4, fontSize: 14, fontWeight: 500 }}>Background</label>
        <textarea
          value={formData.background}
          onChange={(e) => updateField('background', e.target.value)}
          rows={3}
          style={{ width: '100%', padding: 8, fontSize: 14, border: '1px solid #ddd', borderRadius: 4, fontFamily: 'system-ui' }}
        />
      </div>

      <div style={{ display: 'flex', gap: 8 }}>
        <button type="submit" style={{ padding: '8px 16px', fontSize: 14, cursor: 'pointer' }}>
          Save Character
        </button>
        <button type="button" onClick={onCancel} style={{ padding: '8px 16px', fontSize: 14, cursor: 'pointer' }}>
          Cancel
        </button>
      </div>
    </form>
  )
}
