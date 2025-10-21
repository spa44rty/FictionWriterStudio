import React, { useState } from 'react'

function useApi() {
  async function heuristics(text: string) {
    const res = await fetch('http://127.0.0.1:8000/api/heuristics', {
      method: 'POST', headers: {'content-type': 'application/json'},
      body: JSON.stringify({ text, rules: { ban_em_dashes: true, narrative_contractions: false, max_sentence_words: 28 } })
    })
    return res.json()
  }
  async function minorEdit(text: string, model: string) {
    const res = await fetch('http://127.0.0.1:8000/api/minor_edit', {
      method: 'POST', headers: {'content-type': 'application/json'},
      body: JSON.stringify({ text, model, style: { tense: 'past', pov: 'close-third', narrative_contractions: false, dialogue_contractions: true, ban_em_dashes: true }, citations: [] })
    })
    return res.json()
  }
  return { heuristics, minorEdit }
}

export default function App() {
  const [text, setText] = useState<string>(`He was very cold. It was late.`)
  const [issues, setIssues] = useState<any[]>([])
  const [edits, setEdits] = useState<any[]>([])
  const { heuristics, minorEdit } = useApi()

  async function onAnalyze() {
    const r = await heuristics(text)
    setIssues(r.issues || [])
  }
  async function onMinorEdit() {
    const r = await minorEdit(text, 'llama3.1:8b')
    setEdits(r.edits || [])
  }
  function applyEdits() {
    if (edits.length === 0) return
    const lines = text.split('\n')
    for (const e of edits) {
      const idx = (e.line - 1) as number
      lines[idx] = e.new
    }
    setText(lines.join('\n'))
    setEdits([])
  }

  return (
    <div style={{display:'grid', gridTemplateColumns:'280px 1fr 320px', height:'100vh', fontFamily:'system-ui, sans-serif'}}>
      <aside style={{borderRight:'1px solid #ddd', padding:12}}>
        <h3>Story Bible</h3>
        <ul>
          <li>Braindump</li>
          <li>Synopsis</li>
          <li>Outline</li>
          <li>Characters</li>
          <li>Worldbuilding</li>
          <li>Genre</li>
          <li>Style Guide</li>
        </ul>
        <hr/>
        <h4>Controls</h4>
        <button onClick={onAnalyze}>Analyze</button>
        <button onClick={onMinorEdit} style={{marginLeft:8}}>Minor Edit</button>
        <button onClick={applyEdits} style={{marginLeft:8}}>Apply Edits</button>
      </aside>

      <main style={{padding:12}}>
        <h2>Scene Editor</h2>
        <textarea value={text} onChange={e=>setText(e.target.value)} style={{width:'100%', height:'80vh', fontFamily:'serif', fontSize:18, lineHeight:1.6}} />
      </main>

      <aside style={{borderLeft:'1px solid #ddd', padding:12, overflow:'auto'}}>
        <h3>Issues</h3>
        {issues.length===0? <p>No issues yet.</p>: (
          <ul>{issues.map((i,idx)=>(<li key={idx}><code>{i.kind}</code> [{i.start},{i.end}] — {i.message}</li>))}</ul>
        )}
        <h3 style={{marginTop:16}}>Edits</h3>
        {edits.length===0? <p>No pending edits.</p>: (
          <ul>{edits.map((e,idx)=>(<li key={idx}><strong>Line {e.line}</strong><br/><em>Old:</em> {e.old}<br/><em>New:</em> {e.new}<br/>{e.rationale}</li>))}</ul>
        )}
      </aside>
    </div>
  )
}
