import { useState } from 'react'
import { useStoryStore } from './store'
import { BibleSection } from './components/BibleSection'
import { CharacterList } from './components/CharacterList'
import { LIMITS } from './types'

type Section = 'braindump' | 'synopsis' | 'outline' | 'characters' | 'worldbuilding' | 'genre' | 'styleGuide' | 'editor'

function useApi() {
  const getApiUrl = () => {
    if (typeof window !== 'undefined') {
      const hostname = window.location.hostname;
      return hostname.includes('replit') 
        ? window.location.origin.replace(':5000', ':8000')
        : 'http://127.0.0.1:8000';
    }
    return 'http://127.0.0.1:8000';
  };

  async function heuristics(text: string) {
    const res = await fetch(`${getApiUrl()}/api/heuristics`, {
      method: 'POST', headers: {'content-type': 'application/json'},
      body: JSON.stringify({ text, rules: { ban_em_dashes: true, narrative_contractions: false, max_sentence_words: 28 } })
    })
    return res.json()
  }
  async function minorEdit(text: string, model: string) {
    const res = await fetch(`${getApiUrl()}/api/minor_edit`, {
      method: 'POST', headers: {'content-type': 'application/json'},
      body: JSON.stringify({ text, model, style: { tense: 'past', pov: 'close-third', narrative_contractions: false, dialogue_contractions: true, ban_em_dashes: true }, citations: [] })
    })
    return res.json()
  }
  return { heuristics, minorEdit }
}

export default function App() {
  const [activeSection, setActiveSection] = useState<Section>('editor')
  const [text, setText] = useState<string>(`He waz very coldd. Then he realizd it was absolutly late. She walkked slowely and quietley through the darkk corrider—her hart beetingg. At the end of the day, it was realy just a mater of time before evrything was discovred.`)
  const [issues, setIssues] = useState<any[]>([])
  const { heuristics } = useApi()

  const store = useStoryStore()

  async function onAnalyze() {
    const r = await heuristics(text)
    setIssues(r.issues || [])
  }

  const navItems: { section: Section; label: string }[] = [
    { section: 'braindump', label: 'Braindump' },
    { section: 'synopsis', label: 'Synopsis' },
    { section: 'outline', label: 'Outline' },
    { section: 'characters', label: 'Characters' },
    { section: 'worldbuilding', label: 'Worldbuilding' },
    { section: 'genre', label: 'Genre' },
    { section: 'styleGuide', label: 'Style Guide' },
    { section: 'editor', label: '--- Scene Editor ---' }
  ]

  function renderContent() {
    switch (activeSection) {
      case 'braindump':
        return (
          <BibleSection
            title="Braindump"
            value={store.braindump}
            onChange={(v) => store.updateField('braindump', v)}
            maxLength={LIMITS.braindump}
            placeholder="Free-form brainstorming, ideas, random thoughts..."
          />
        )
      case 'synopsis':
        return (
          <BibleSection
            title="Synopsis"
            value={store.synopsis}
            onChange={(v) => store.updateField('synopsis', v)}
            maxLength={LIMITS.synopsis}
            placeholder="High-level summary of your story..."
          />
        )
      case 'outline':
        return (
          <BibleSection
            title="Outline"
            value={store.outline}
            onChange={(v) => store.updateField('outline', v)}
            maxLength={LIMITS.outline}
            placeholder="Story structure, plot points, chapter breakdown..."
          />
        )
      case 'worldbuilding':
        return (
          <BibleSection
            title="Worldbuilding"
            value={store.worldbuilding}
            onChange={(v) => store.updateField('worldbuilding', v)}
            maxLength={LIMITS.worldbuilding}
            placeholder="World rules, setting details, magic systems, technology..."
          />
        )
      case 'genre':
        return (
          <BibleSection
            title="Genre"
            value={store.genre}
            onChange={(v) => store.updateField('genre', v)}
            maxLength={LIMITS.genre}
            placeholder="e.g., Science Fiction, Fantasy, Thriller"
          />
        )
      case 'styleGuide':
        return (
          <BibleSection
            title="Style Guide"
            value={store.styleGuide}
            onChange={(v) => store.updateField('styleGuide', v)}
            maxLength={LIMITS.styleGuide}
            placeholder="Writing style preferences, tone, voice, grammar rules..."
          />
        )
      case 'characters':
        return (
          <CharacterList
            characters={store.characters}
            onAdd={store.addCharacter}
            onUpdate={store.updateCharacter}
            onDelete={store.deleteCharacter}
          />
        )
      case 'editor':
        return (
          <div style={{ padding: 12, height: '100%', display: 'flex', flexDirection: 'column' }}>
            <h2>Scene Editor</h2>
            <textarea
              value={text}
              onChange={e => setText(e.target.value)}
              style={{
                flex: 1,
                width: '100%',
                fontFamily: 'serif',
                fontSize: 18,
                lineHeight: 1.6,
                padding: 12,
                border: '1px solid #ddd',
                borderRadius: 4,
                resize: 'none'
              }}
            />
          </div>
        )
    }
  }

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr 320px', height: '100vh', fontFamily: 'system-ui, sans-serif' }}>
      <aside style={{ borderRight: '1px solid #ddd', padding: 12, overflow: 'auto' }}>
        <h3 style={{ marginTop: 0 }}>Story Bible</h3>
        <ul style={{ listStyle: 'none', padding: 0 }}>
          {navItems.map(item => (
            <li key={item.section} style={{ marginBottom: 4 }}>
              <button
                onClick={() => setActiveSection(item.section)}
                style={{
                  width: '100%',
                  textAlign: 'left',
                  padding: '8px 12px',
                  border: 'none',
                  background: activeSection === item.section ? '#e3f2fd' : 'transparent',
                  cursor: 'pointer',
                  borderRadius: 4,
                  fontSize: 14,
                  fontWeight: item.section === 'editor' ? 'bold' : 'normal'
                }}
              >
                {item.label}
              </button>
            </li>
          ))}
        </ul>
        
        {activeSection === 'editor' && (
          <>
            <hr style={{ margin: '16px 0' }} />
            <h4 style={{ marginBottom: 8 }}>Editor Controls</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <button onClick={onAnalyze} style={{ padding: '8px 12px', cursor: 'pointer' }}>
                Analyze
              </button>
            </div>
          </>
        )}
      </aside>

      <main style={{ overflow: 'auto', background: '#fafafa' }}>
        {renderContent()}
      </main>

      <aside style={{ borderLeft: '1px solid #ddd', padding: 12, overflow: 'auto' }}>
        {activeSection === 'editor' ? (
          <>
            <h3>Issues ({issues.length})</h3>
            {issues.length === 0 ? <p>No issues found. Your prose looks clean!</p> : (
              <ul style={{ fontSize: 13, listStyle: 'none', padding: 0 }}>
                {issues.map((i, idx) => {
                  const severityColors = {
                    error: '#dc3545',
                    warning: '#ff9800',
                    info: '#2196f3'
                  };
                  const color = severityColors[i.severity as keyof typeof severityColors] || '#666';
                  return (
                    <li key={idx} style={{ marginBottom: 12, paddingBottom: 12, borderBottom: '1px solid #eee' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                        <span style={{ 
                          fontSize: 10, 
                          fontWeight: 'bold', 
                          color: '#fff',
                          background: color,
                          padding: '2px 6px',
                          borderRadius: 3,
                          textTransform: 'uppercase'
                        }}>{i.severity}</span>
                        <code style={{ fontSize: 11, color: '#666' }}>{i.kind}</code>
                      </div>
                      <div style={{ fontSize: 12, marginTop: 4 }}>{i.message}</div>
                    </li>
                  );
                })}
              </ul>
            )}
          </>
        ) : (
          <div style={{ padding: 16, color: '#666', fontSize: 14 }}>
            <h3>Reference Panel</h3>
            <p>This panel shows issues when analyzing scenes in the Scene Editor.</p>
            <p style={{ marginTop: 16 }}>Your Story Bible data is saved automatically as you type.</p>
          </div>
        )}
      </aside>
    </div>
  )
}
