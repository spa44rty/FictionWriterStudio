import { useState, useEffect, useRef } from 'react'
import { useStoryStore } from './store'
import { BibleSection } from './components/BibleSection'
import { CharacterList } from './components/CharacterList'
import { InlineEditor, InlineEditorRef } from './components/InlineEditor'
import { LIMITS } from './types'

type Section = 'braindump' | 'synopsis' | 'outline' | 'characters' | 'worldbuilding' | 'genre' | 'styleGuide' | 'settings' | 'editor'

function useApi() {
  const getApiUrl = () => {
    if (typeof window !== 'undefined') {
      const hostname = window.location.hostname;
      if (hostname.includes('replit')) {
        const origin = window.location.origin;
        const baseUrl = origin.replace(/:\d+/, '');
        return `${baseUrl}:8000`;
      }
      return 'http://127.0.0.1:8000';
    }
    return 'http://127.0.0.1:8000';
  };

  async function heuristics(text: string) {
    const apiUrl = getApiUrl();
    console.log('Calling API:', `${apiUrl}/api/heuristics`);
    const res = await fetch(`${apiUrl}/api/heuristics`, {
      method: 'POST', headers: {'content-type': 'application/json'},
      body: JSON.stringify({ text, rules: { ban_em_dashes: true, narrative_contractions: false, max_sentence_words: 28 } })
    })
    if (!res.ok) {
      console.error('API error:', res.status, res.statusText);
      throw new Error(`API returned ${res.status}`);
    }
    return res.json()
  }
  async function minorEdit(text: string, model: string) {
    const res = await fetch(`${getApiUrl()}/api/minor_edit`, {
      method: 'POST', headers: {'content-type': 'application/json'},
      body: JSON.stringify({ text, model, style: { tense: 'past', pov: 'close-third', narrative_contractions: false, dialogue_contractions: true, ban_em_dashes: true }, citations: [] })
    })
    if (!res.ok) {
      throw new Error(`API returned ${res.status}: ${res.statusText}`)
    }
    return res.json()
  }
  async function chat(prompt: string, model: string, context?: string) {
    const res = await fetch(`${getApiUrl()}/api/chat`, {
      method: 'POST', headers: {'content-type': 'application/json'},
      body: JSON.stringify({ prompt, model, context })
    })
    return res.json()
  }
  return { heuristics, minorEdit, chat }
}

interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
}

export default function App() {
  const [activeSection, setActiveSection] = useState<Section>('editor')
  const [text, setText] = useState<string>(`He waz very coldd. Then he realizd it was absolutly late. She walkked slowely and quietley through the darkk corrider—her hart beetingg. At the end of the day, it was realy just a mater of time before evrything was discovred.`)
  const [issues, setIssues] = useState<any[]>([])
  const [suggestions, setSuggestions] = useState<any[]>([])
  const [loadingSuggestions, setLoadingSuggestions] = useState(false)
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([])
  const [chatInput, setChatInput] = useState('')
  const [loadingChat, setLoadingChat] = useState(false)
  const [leftWidth, setLeftWidth] = useState(280)
  const [isDraggingLeft, setIsDraggingLeft] = useState(false)
  const editorRef = useRef<InlineEditorRef>(null)
  const { heuristics, minorEdit, chat } = useApi()

  const store = useStoryStore()

  async function onAnalyze() {
    setLoadingSuggestions(true)
    setIssues([])
    setSuggestions([])
    
    try {
      const r = await heuristics(text)
      // Map issues to include position in the format expected by InlineEditor
      const mappedIssues = (r.issues || []).map((issue: any) => ({
        ...issue,
        position: { start: issue.start, end: issue.end },
        text: text.substring(issue.start, issue.end)
      }))
      setIssues(mappedIssues)
      
      if (r.issues && r.issues.length > 0) {
        try {
          const aiResult = await minorEdit(text, store.models.medium)
          // Map suggestions to include positions by finding the old text
          const mappedSuggestions = (aiResult.edits || []).map((edit: any) => {
            const lines = text.split('\n')
            if (edit.line > 0 && edit.line <= lines.length) {
              const lineIndex = edit.line - 1
              const lineStart = lines.slice(0, lineIndex).join('\n').length + (lineIndex > 0 ? 1 : 0)
              const oldTextIndex = lines[lineIndex].indexOf(edit.old)
              if (oldTextIndex !== -1) {
                return {
                  ...edit,
                  position: {
                    start: lineStart + oldTextIndex,
                    end: lineStart + oldTextIndex + edit.old.length
                  }
                }
              }
            }
            return edit
          })
          setSuggestions(mappedSuggestions)
        } catch (aiErr) {
          console.error('AI suggestion error:', aiErr)
          alert('Found issues, but could not get AI suggestions. Make sure Ollama is running with the medium model installed.')
        }
      }
    } catch (err) {
      console.error('Analysis error:', err)
      alert('Could not run analysis. Check that the backend is running on port 8000.')
    } finally {
      setLoadingSuggestions(false)
    }
  }

  function applySuggestion(edit: any) {
    if (edit.position) {
      // Apply using position
      const before = text.substring(0, edit.position.start)
      const after = text.substring(edit.position.end)
      setText(before + edit.new + after)
    } else {
      // Fallback to line-based
      const lines = text.split('\n')
      if (edit.line > 0 && edit.line <= lines.length) {
        lines[edit.line - 1] = edit.new
        setText(lines.join('\n'))
      }
    }
    setSuggestions(suggestions.filter(s => s !== edit))
  }

  function rejectSuggestion(edit: any) {
    setSuggestions(suggestions.filter(s => s !== edit))
  }

  function ignoreIssue(issue: any) {
    setIssues(issues.filter(i => i !== issue))
  }

  function selectModelForPrompt(prompt: string): string {
    const lower = prompt.toLowerCase()
    
    const hasKeyword = (keywords: string[]) => {
      return keywords.some(keyword => {
        const pattern = new RegExp(`\\b${keyword.replace('-', '[-\\s]?')}\\b`, 'i')
        return pattern.test(lower)
      })
    }
    
    const largeModelKeywords = [
      'rewrite', 're-write', 'regenerate', 'completely rewrite', 'complete rewrite',
      'major rewrite', 'major change', 'major restructure', 'comprehensive rewrite',
      'rebuild', 'restructure', 'transform completely', 'start over', 'from scratch'
    ]
    const mediumModelKeywords = [
      'fix', 'correct', 'improve', 'suggest', 'edit', 'revise', 'polish', 'refine', 
      'enhance', 'better phrasing', 'rephrase', 'adjust', 'tweak', 'modify'
    ]
    
    if (hasKeyword(largeModelKeywords)) {
      return store.models.large
    }
    
    if (hasKeyword(mediumModelKeywords)) {
      return store.models.medium
    }
    
    return store.models.small
  }

  async function onSendChat() {
    if (!chatInput.trim()) return
    
    const userMessage: ChatMessage = { role: 'user', content: chatInput }
    const userPrompt = chatInput
    setChatMessages(prev => [...prev, userMessage])
    setChatInput('')
    setLoadingChat(true)

    try {
      const selectedModel = selectModelForPrompt(userPrompt)
      
      const modelInfo = selectedModel === store.models.large ? ' (using large model)' : 
                       selectedModel === store.models.medium ? ' (using medium model)' : ''
      
      const response = await chat(userPrompt, selectedModel, text)
      const assistantMessage: ChatMessage = { 
        role: 'assistant', 
        content: response.response + (modelInfo ? `\n\n_${modelInfo}_` : '')
      }
      setChatMessages(prev => [...prev, assistantMessage])
    } catch (err) {
      console.error('Chat error:', err)
      const errorMessage: ChatMessage = {
        role: 'assistant',
        content: 'Sorry, I cannot respond right now. Make sure Ollama is running with a model installed.'
      }
      setChatMessages(prev => [...prev, errorMessage])
    } finally {
      setLoadingChat(false)
    }
  }

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDraggingLeft) {
        const newWidth = Math.max(200, Math.min(500, e.clientX))
        setLeftWidth(newWidth)
      }
    }

    const handleMouseUp = () => {
      setIsDraggingLeft(false)
    }

    if (isDraggingLeft) {
      document.addEventListener('mousemove', handleMouseMove)
      document.addEventListener('mouseup', handleMouseUp)
      document.body.style.cursor = 'col-resize'
      document.body.style.userSelect = 'none'
    } else {
      document.body.style.cursor = ''
      document.body.style.userSelect = ''
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
    }
  }, [isDraggingLeft])

  const navItems: { section: Section; label: string }[] = [
    { section: 'braindump', label: 'Braindump' },
    { section: 'synopsis', label: 'Synopsis' },
    { section: 'outline', label: 'Outline' },
    { section: 'characters', label: 'Characters' },
    { section: 'worldbuilding', label: 'Worldbuilding' },
    { section: 'genre', label: 'Genre' },
    { section: 'styleGuide', label: 'Style Guide' },
    { section: 'settings', label: 'AI Models' },
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
      case 'settings':
        return (
          <div style={{ padding: 12 }}>
            <h2>AI Model Configuration</h2>
            <p style={{ color: '#666', fontSize: 14, marginBottom: 24 }}>
              Configure which Ollama models to use for different tasks. Make sure you've installed these models with `ollama pull &lt;model-name&gt;`.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              <div>
                <label style={{ display: 'block', fontWeight: 'bold', marginBottom: 8 }}>
                  Small Model (Quick Chat Responses)
                </label>
                <input
                  type="text"
                  value={store.models.small}
                  onChange={e => store.updateModel('small', e.target.value)}
                  style={{ width: '100%', padding: '8px 12px', border: '1px solid #ddd', borderRadius: 4, fontSize: 14 }}
                  placeholder="e.g., llama3.2:3b, phi3"
                />
                <div style={{ fontSize: 12, color: '#666', marginTop: 4 }}>
                  Used for: Quick questions and explanations in chat
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontWeight: 'bold', marginBottom: 8 }}>
                  Medium Model (Analysis & Minor Edits)
                </label>
                <input
                  type="text"
                  value={store.models.medium}
                  onChange={e => store.updateModel('medium', e.target.value)}
                  style={{ width: '100%', padding: '8px 12px', border: '1px solid #ddd', borderRadius: 4, fontSize: 14 }}
                  placeholder="e.g., llama3.2:latest, mistral"
                />
                <div style={{ fontSize: 12, color: '#666', marginTop: 4 }}>
                  Used for: "Analyze & Suggest Fixes" button and fix/improve prompts in chat
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontWeight: 'bold', marginBottom: 8 }}>
                  Large Model (Major Rewrites & Generation)
                </label>
                <input
                  type="text"
                  value={store.models.large}
                  onChange={e => store.updateModel('large', e.target.value)}
                  style={{ width: '100%', padding: '8px 12px', border: '1px solid #ddd', borderRadius: 4, fontSize: 14 }}
                  placeholder="e.g., llama3:70b, qwen2.5:72b"
                />
                <div style={{ fontSize: 12, color: '#666', marginTop: 4 }}>
                  Used for: "Rewrite" or "regenerate" prompts in chat
                </div>
              </div>
            </div>

            <div style={{ marginTop: 32, padding: 16, background: '#e3f2fd', borderRadius: 4 }}>
              <h4 style={{ marginTop: 0 }}>Recommended Models:</h4>
              <ul style={{ fontSize: 14, color: '#555' }}>
                <li><strong>Small:</strong> llama3.2:3b, phi3, gemma2:2b</li>
                <li><strong>Medium:</strong> llama3.2:latest, mistral, qwen2.5:7b</li>
                <li><strong>Large:</strong> llama3:70b, qwen2.5:72b, mixtral:8x7b</li>
              </ul>
              <div style={{ fontSize: 13, color: '#666', marginTop: 12 }}>
                Install models with: <code style={{ background: '#fff', padding: '2px 6px', borderRadius: 3 }}>ollama pull &lt;model-name&gt;</code>
              </div>
            </div>
          </div>
        )
      case 'editor':
        return (
          <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            {/* Top Half: Scene Editor */}
            <div style={{ flex: '1 1 50%', padding: 12, borderBottom: '1px solid #ddd', display: 'flex', flexDirection: 'column' }}>
              <h2 style={{ marginTop: 0, marginBottom: 8 }}>Scene Editor</h2>
              <InlineEditor
                ref={editorRef}
                value={text}
                onChange={setText}
                issues={issues}
                suggestions={suggestions}
                onIgnoreIssue={ignoreIssue}
                onApplySuggestion={applySuggestion}
                onIgnoreSuggestion={rejectSuggestion}
              />
            </div>

            {/* Lower Half: Issues & Suggestions */}
            <div style={{ flex: '1 1 50%', padding: 12, borderBottom: '2px solid #ddd', overflow: 'auto', display: 'flex', flexDirection: 'column' }}>
              <h3 style={{ marginTop: 0, marginBottom: 12 }}>Issues & Suggestions</h3>
              
              {/* Issues */}
              <div style={{ marginBottom: 16 }}>
                <h4 style={{ fontSize: 14, marginBottom: 8, color: '#666' }}>Issues ({issues.length})</h4>
                {issues.length === 0 ? (
                  <p style={{ fontSize: 13, color: '#999' }}>No issues found. Your prose looks clean!</p>
                ) : (
                  <ul style={{ fontSize: 13, listStyle: 'none', padding: 0, margin: 0 }}>
                    {issues.map((i, idx) => {
                      const severityColors = {
                        error: '#dc3545',
                        warning: '#ff9800',
                        info: '#2196f3'
                      };
                      const color = severityColors[i.severity as keyof typeof severityColors] || '#666';
                      return (
                        <li 
                          key={idx} 
                          onClick={() => {
                            if (i.position && editorRef.current) {
                              editorRef.current.jumpToPosition(i.position, i, 'issue')
                            }
                          }}
                          style={{ 
                            marginBottom: 12, 
                            paddingBottom: 12, 
                            borderBottom: '1px solid #eee',
                            cursor: i.position ? 'pointer' : 'default',
                            transition: 'background 0.2s'
                          }}
                          onMouseEnter={(e) => {
                            if (i.position) {
                              e.currentTarget.style.backgroundColor = '#f5f5f5'
                            }
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = 'transparent'
                          }}
                        >
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
              </div>

              {/* AI Suggestions */}
              {suggestions.length > 0 && (
                <div>
                  <h4 style={{ fontSize: 14, marginBottom: 8, color: '#666' }}>AI Suggestions ({suggestions.length})</h4>
                  <ul style={{ fontSize: 13, listStyle: 'none', padding: 0, margin: 0 }}>
                    {suggestions.map((edit, idx) => (
                      <li 
                        key={idx} 
                        onClick={() => {
                          if (edit.position && editorRef.current) {
                            editorRef.current.jumpToPosition(edit.position, edit, 'suggestion')
                          }
                        }}
                        style={{ 
                          marginBottom: 16, 
                          paddingBottom: 16, 
                          borderBottom: '1px solid #eee',
                          cursor: edit.position ? 'pointer' : 'default',
                          transition: 'background 0.2s'
                        }}
                        onMouseEnter={(e) => {
                          if (edit.position) {
                            e.currentTarget.style.backgroundColor = '#f5f5f5'
                          }
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = 'transparent'
                        }}
                      >
                        <div style={{ fontSize: 11, color: '#666', marginBottom: 4 }}>
                          Line {edit.line} {edit.position && '· Click to jump'}
                        </div>
                        <div style={{ fontSize: 12, padding: 8, background: '#ffe0e0', borderRadius: 4, marginBottom: 4 }}>
                          <strong>Old:</strong> {edit.old}
                        </div>
                        <div style={{ fontSize: 12, padding: 8, background: '#e0ffe0', borderRadius: 4, marginBottom: 8 }}>
                          <strong>New:</strong> {edit.new}
                        </div>
                        {edit.rationale && (
                          <div style={{ fontSize: 11, color: '#666', fontStyle: 'italic', marginBottom: 8 }}>
                            {edit.rationale}
                          </div>
                        )}
                        <div style={{ display: 'flex', gap: 8 }}>
                          <button 
                            onClick={() => applySuggestion(edit)}
                            style={{ 
                              flex: 1, 
                              padding: '6px 12px', 
                              background: '#4caf50', 
                              color: '#fff', 
                              border: 'none', 
                              borderRadius: 4, 
                              cursor: 'pointer',
                              fontSize: 12
                            }}
                          >
                            Apply
                          </button>
                          <button 
                            onClick={() => rejectSuggestion(edit)}
                            style={{ 
                              flex: 1, 
                              padding: '6px 12px', 
                              background: '#f44336', 
                              color: '#fff', 
                              border: 'none', 
                              borderRadius: 4, 
                              cursor: 'pointer',
                              fontSize: 12
                            }}
                          >
                            Reject
                          </button>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Bottom: Chat Prompt Line */}
            <div style={{ padding: 12, background: '#fafafa' }}>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <span style={{ fontSize: 14, fontWeight: 'bold', color: '#666', minWidth: 120 }}>AI Assistant:</span>
                <input
                  type="text"
                  value={chatInput}
                  onChange={e => setChatInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && !loadingChat && onSendChat()}
                  placeholder="Ask about your writing (auto-selects best model)..."
                  disabled={loadingChat}
                  style={{
                    flex: 1,
                    padding: '10px 12px',
                    border: '1px solid #ddd',
                    borderRadius: 4,
                    fontSize: 14
                  }}
                />
                <button
                  onClick={onSendChat}
                  disabled={loadingChat || !chatInput.trim()}
                  style={{
                    padding: '10px 20px',
                    background: loadingChat || !chatInput.trim() ? '#ccc' : '#2196f3',
                    color: '#fff',
                    border: 'none',
                    borderRadius: 4,
                    cursor: loadingChat || !chatInput.trim() ? 'not-allowed' : 'pointer',
                    fontSize: 14,
                    fontWeight: 'bold'
                  }}
                >
                  {loadingChat ? 'Thinking...' : 'Ask'}
                </button>
              </div>
              {chatMessages.length > 0 && (
                <div style={{ marginTop: 8, padding: 8, background: '#fff', borderRadius: 4, maxHeight: 80, overflow: 'auto' }}>
                  <div style={{ fontSize: 12, color: '#666' }}>
                    <strong>Last response:</strong> {chatMessages[chatMessages.length - 1].content.substring(0, 150)}
                    {chatMessages[chatMessages.length - 1].content.length > 150 ? '...' : ''}
                  </div>
                </div>
              )}
            </div>
          </div>
        )
    }
  }

  return (
    <div style={{ display: 'flex', height: '100vh', fontFamily: 'system-ui, sans-serif' }}>
      <aside style={{ width: leftWidth, borderRight: '1px solid #ddd', padding: 12, overflow: 'auto', flexShrink: 0 }}>
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
              <button 
                onClick={onAnalyze} 
                disabled={loadingSuggestions}
                style={{ 
                  padding: '8px 12px', 
                  cursor: loadingSuggestions ? 'wait' : 'pointer',
                  background: loadingSuggestions ? '#ccc' : '#4caf50',
                  color: '#fff',
                  border: 'none',
                  borderRadius: 4,
                  fontWeight: 'bold'
                }}
              >
                {loadingSuggestions ? 'Analyzing...' : 'Analyze & Suggest Fixes'}
              </button>
            </div>
            <div style={{ marginTop: 12, fontSize: 11, color: '#666', lineHeight: 1.4 }}>
              <div>Flags issues and suggests AI-powered corrections</div>
            </div>
          </>
        )}
      </aside>

      <div 
        style={{ 
          width: 5, 
          cursor: 'col-resize', 
          background: '#ddd',
          flexShrink: 0,
          transition: isDraggingLeft ? 'none' : 'background 0.2s'
        }}
        onMouseDown={() => setIsDraggingLeft(true)}
      />

      <main style={{ flex: 1, overflow: 'hidden', background: '#fafafa' }}>
        {renderContent()}
      </main>
    </div>
  )
}
