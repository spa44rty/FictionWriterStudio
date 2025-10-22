import { useState, useEffect, useRef } from 'react'
import { useStoryStore } from './store'
import { BibleSection } from './components/BibleSection'
import { CharacterList } from './components/CharacterList'
import { ChapterList } from './components/ChapterList'
import { InlineEditor, InlineEditorRef } from './components/InlineEditor'
import { LIMITS } from './types'

type Section = 'chapters' | 'braindump' | 'synopsis' | 'outline' | 'characters' | 'worldbuilding' | 'genre' | 'styleGuide' | 'settings' | 'editor'

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
  async function minorEdit(text: string, model: string, issues?: any[]) {
    const res = await fetch(`${getApiUrl()}/api/minor_edit`, {
      method: 'POST', headers: {'content-type': 'application/json'},
      body: JSON.stringify({ text, model, style: { tense: 'past', pov: 'close-third', narrative_contractions: false, dialogue_contractions: true, ban_em_dashes: true }, citations: [], issues })
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


export default function App() {
  const [activeSection, setActiveSection] = useState<Section>('editor')
  const [text, setText] = useState<string>(`He waz very coldd. Then he realizd it was absolutly late. She walkked slowely and quietley through the darkk corrider—her hart beetingg. At the end of the day, it was realy just a mater of time before evrything was discovred.`)
  const [chapterResponse, setChapterResponse] = useState<string>('')
  const [chatInput, setChatInput] = useState('')
  const [loadingChat, setLoadingChat] = useState(false)
  const [leftWidth, setLeftWidth] = useState(280)
  const [isDraggingLeft, setIsDraggingLeft] = useState(false)
  const [generatingOutline, setGeneratingOutline] = useState(false)
  const editorRef = useRef<InlineEditorRef>(null)
  const { chat } = useApi()

  const store = useStoryStore()

  useEffect(() => {
    if (store.activeChapterId) {
      const chapter = store.chapters.find(c => c.id === store.activeChapterId)
      if (chapter && chapter.content !== undefined) {
        setText(chapter.content)
        setChapterResponse('')
      }
    }
  }, [store.activeChapterId])


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
    
    const userPrompt = chatInput
    setChatInput('')
    setLoadingChat(true)
    setChapterResponse('Analyzing your chapter...')

    try {
      const selectedModel = selectModelForPrompt(userPrompt)
      
      const modelInfo = selectedModel === store.models.large ? 'large model' : 
                       selectedModel === store.models.medium ? 'medium model' : 
                       selectedModel === store.models.small ? 'small model' : ''
      
      const contextParts = []
      
      contextParts.push('=== STORY BIBLE ===')
      if (store.genre) contextParts.push(`Genre: ${store.genre}`)
      if (store.synopsis) contextParts.push(`\nSynopsis:\n${store.synopsis}`)
      if (store.outline) contextParts.push(`\nOutline:\n${store.outline}`)
      if (store.worldbuilding) contextParts.push(`\nWorldbuilding:\n${store.worldbuilding}`)
      if (store.styleGuide) contextParts.push(`\nStyle Guide:\n${store.styleGuide}`)
      
      if (store.characters.length > 0) {
        contextParts.push('\nCharacters:')
        store.characters.forEach(char => {
          contextParts.push(`\n- ${char.name} (${char.characterType})`)
          if (char.description) contextParts.push(`  Description: ${char.description}`)
          if (char.personality) contextParts.push(`  Personality: ${char.personality}`)
          if (char.voiceTone) contextParts.push(`  Voice: ${char.voiceTone}`)
          if (char.background) contextParts.push(`  Background: ${char.background}`)
        })
      }
      
      const currentChapter = store.chapters.find(c => c.id === store.activeChapterId)
      if (currentChapter) {
        const previousChapters = store.chapters
          .filter(c => c.number < currentChapter.number)
          .sort((a, b) => a.number - b.number)
        
        if (previousChapters.length > 0) {
          contextParts.push('\n\n=== PREVIOUS CHAPTERS (SUMMARIES) ===')
          previousChapters.forEach(ch => {
            contextParts.push(`\nChapter ${ch.number}: ${ch.title}`)
            if (ch.summary) {
              contextParts.push(ch.summary)
            } else {
              contextParts.push('(No summary available)')
            }
          })
        }
        
        contextParts.push(`\n\n=== CURRENT CHAPTER (Chapter ${currentChapter.number}: ${currentChapter.title}) ===`)
      } else {
        contextParts.push('\n\n=== CURRENT TEXT ===')
      }
      
      contextParts.push(text)
      
      const fullContext = contextParts.join('\n')
      
      const response = await chat(userPrompt, selectedModel, fullContext)
      const fullResponse = `${response.response}\n\n[Model used: ${modelInfo}]`
      setChapterResponse(fullResponse)
    } catch (err) {
      console.error('Chat error:', err)
      setChapterResponse('Sorry, I cannot respond right now. Make sure Ollama is running with a model installed.')
    } finally {
      setLoadingChat(false)
    }
  }

  async function onGenerateOutline() {
    if (!store.synopsis.trim()) {
      alert('Please write a synopsis first before generating an outline.')
      return
    }
    
    setGeneratingOutline(true)
    try {
      const prompt = `Based on this story synopsis, create a detailed outline with major plot points, acts, and key scenes. Format it clearly with bullet points or numbered sections.

Synopsis:
${store.synopsis}

Generate a comprehensive story outline:`

      const response = await chat(prompt, store.models.medium)
      store.updateField('outline', response.response)
      setActiveSection('outline')
    } catch (err) {
      console.error('Outline generation error:', err)
      alert('Could not generate outline. Make sure Ollama is running with the medium model installed.')
    } finally {
      setGeneratingOutline(false)
    }
  }

  async function autoGenerateSummary(chapterId: string, content: string) {
    const chapter = store.chapters.find(c => c.id === chapterId)
    if (!chapter || !content.trim()) return
    
    try {
      const prompt = `Summarize this chapter in 2-3 concise sentences. Focus on key events, character development, and plot progression. Keep it brief but informative.

Chapter ${chapter.number}: ${chapter.title}

${content}

Summary:`

      const response = await chat(prompt, store.models.small)
      store.updateChapter(chapterId, { summary: response.response.trim() })
    } catch (err) {
      console.error('Auto-summary generation error:', err)
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
    { section: 'chapters', label: 'Chapters' },
    { section: 'braindump', label: 'Braindump' },
    { section: 'synopsis', label: 'Synopsis' },
    { section: 'outline', label: 'Outline' },
    { section: 'characters', label: 'Characters' },
    { section: 'worldbuilding', label: 'Worldbuilding' },
    { section: 'genre', label: 'Genre' },
    { section: 'styleGuide', label: 'Style Guide' },
    { section: 'settings', label: 'AI Models' },
    { section: 'editor', label: '--- Chapter Editor ---' }
  ]

  function renderContent() {
    switch (activeSection) {
      case 'chapters':
        return (
          <ChapterList
            chapters={store.chapters}
            activeChapterId={store.activeChapterId}
            onAdd={store.addChapter}
            onUpdate={store.updateChapter}
            onDelete={store.deleteChapter}
            onSelect={store.setActiveChapter}
            onNavigateToEditor={() => setActiveSection('editor')}
          />
        )
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
            actionButton={{
              label: generatingOutline ? 'Generating...' : 'Generate Outline',
              onClick: onGenerateOutline,
              disabled: generatingOutline || !store.synopsis.trim()
            }}
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
                  Used for: "Copy Editor Critique" button and fix/improve prompts in chat
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
            {/* Chapter Editor */}
            <div style={{ flex: 1, padding: 12, display: 'flex', flexDirection: 'column' }}>
              {!activeChapter && (
                <p style={{ color: '#666', fontSize: 14, fontStyle: 'italic', marginBottom: 16 }}>
                  Select a chapter from the Chapters section to start editing
                </p>
              )}
              <InlineEditor
                ref={editorRef}
                value={text}
                onChange={setText}
                issues={[]}
                suggestions={[]}
                onIgnoreIssue={() => {}}
                onApplySuggestion={() => {}}
                onIgnoreSuggestion={() => {}}
              />
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
            </div>
          </div>
        )
    }
  }

  const activeChapter = store.chapters.find(c => c.id === store.activeChapterId)

  return (
    <div style={{ display: 'flex', height: '100vh', fontFamily: 'system-ui, sans-serif' }}>
      <aside style={{ width: leftWidth, borderRight: '1px solid #ddd', padding: 12, overflow: 'auto', flexShrink: 0 }}>
        {activeChapter && activeSection === 'editor' && (
          <div style={{ marginBottom: 16, padding: 12, background: '#e3f2fd', borderRadius: 4, border: '2px solid #2196f3' }}>
            <div style={{ fontSize: 11, color: '#666', textTransform: 'uppercase', marginBottom: 4 }}>Active Chapter</div>
            <div style={{ fontWeight: 'bold', fontSize: 14, marginBottom: 4 }}>
              Chapter {activeChapter.number}: {activeChapter.title}
            </div>
            {activeChapter.wordCount > 0 && (
              <div style={{ fontSize: 12, color: '#666' }}>
                {activeChapter.wordCount.toLocaleString()} words
              </div>
            )}
          </div>
        )}
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
              {activeChapter && (
                <>
                  <button 
                    onClick={() => {
                      store.updateChapterContent(activeChapter.id, text)
                      autoGenerateSummary(activeChapter.id, text)
                      alert('Chapter saved! AI summary will be generated in the background.')
                    }}
                    style={{ 
                      padding: '8px 12px', 
                      cursor: 'pointer',
                      background: '#2196f3',
                      color: '#fff',
                      border: 'none',
                      borderRadius: 4,
                      fontWeight: 'bold'
                    }}
                  >
                    Save Chapter
                  </button>
                  <div style={{ fontSize: 11, color: '#666', marginTop: -4 }}>
                    Saves content and auto-generates summary for AI context
                  </div>
                </>
              )}
              
              <div style={{ marginTop: 8 }}>
                <h5 style={{ margin: '0 0 8px 0', color: '#555' }}>Chapter Response</h5>
                <div 
                  style={{ 
                    minHeight: 200, 
                    maxHeight: 400,
                    padding: 12, 
                    background: '#fff', 
                    border: '1px solid #ddd', 
                    borderRadius: 4,
                    overflow: 'auto',
                    fontSize: 13,
                    lineHeight: 1.6,
                    color: '#333',
                    whiteSpace: 'pre-wrap'
                  }}
                >
                  {chapterResponse || 'Chat responses about your chapter will appear here...'}
                </div>
                <div style={{ fontSize: 11, color: '#666', marginTop: 4 }}>
                  Use the AI Assistant below to ask questions and get feedback about your chapter
                </div>
              </div>
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
