import React, { useState, useRef, useEffect, useCallback } from 'react'
import { Send, Bot, User, Sparkles, AlertTriangle, ChevronRight } from 'lucide-react'
import { aiService } from '../services/api'
import { useLocation } from '../context/LocationContext'
import { useCurrentAQI } from '../hooks/useAirQuality'
import { sanitizeText } from '../utils/sanitize'
import { getAQICategory } from '../utils/aqi'
import LoadingSpinner from '../components/ui/LoadingSpinner'
import clsx from 'clsx'

const SUGGESTED_QUESTIONS = [
  'Is it safe to go outside today?',
  'How can I protect my family from pollution?',
  'What precautions should children take?',
  'How can I improve indoor air quality?',
  'What should I do during severe smog?',
  'Which sustainable alternatives should I adopt?',
]

// ─── Message Bubble ────────────────────────────────────────────────────────────
function Message({ msg }) {
  const isUser = msg.role === 'user'
  return (
    <div
      className={clsx('flex gap-3 animate-slide-up', isUser ? 'justify-end' : 'justify-start')}
      role="article"
      aria-label={`${isUser ? 'You' : 'BreatheWise AI'}: ${msg.content}`}
    >
      {!isUser && (
        <div
          className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 mt-1 shadow-sm"
          style={{ background: 'linear-gradient(135deg, #22c55e 0%, #0d9488 100%)' }}
          aria-hidden="true"
        >
          <Bot className="w-4 h-4 text-white" />
        </div>
      )}
      <div
        className={clsx(
          'max-w-[82%] rounded-2xl px-4 py-3 text-sm leading-relaxed',
          isUser
            ? 'bg-green-600 text-white rounded-br-sm shadow-sm'
            : 'bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 rounded-bl-sm shadow-sm border border-gray-100 dark:border-gray-700'
        )}
      >
        {msg.content.split('\n').map((line, i) => (
          <p key={i} className={i > 0 ? 'mt-1.5' : ''}>{line}</p>
        ))}
        {msg.fallback && (
          <p className="text-xs opacity-60 mt-2.5 flex items-center gap-1 border-t border-current/10 pt-2">
            <AlertTriangle className="w-3 h-3" aria-hidden="true" />
            Rule-based response — AI API not configured
          </p>
        )}
      </div>
      {isUser && (
        <div className="w-8 h-8 rounded-xl bg-gray-100 dark:bg-gray-700 flex items-center justify-center flex-shrink-0 mt-1">
          <User className="w-4 h-4 text-gray-500 dark:text-gray-400" aria-hidden="true" />
        </div>
      )}
    </div>
  )
}

function TypingIndicator() {
  return (
    <div className="flex gap-3 items-center" aria-live="polite" aria-label="AI is typing">
      <div
        className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
        style={{ background: 'linear-gradient(135deg, #22c55e 0%, #0d9488 100%)' }}
        aria-hidden="true"
      >
        <Bot className="w-4 h-4 text-white" />
      </div>
      <div className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 shadow-sm px-4 py-3 rounded-2xl rounded-bl-sm flex gap-1 items-center">
        {[0, 1, 2].map(i => (
          <div
            key={i}
            className="w-2 h-2 rounded-full bg-green-500 animate-bounce"
            style={{ animationDelay: `${i * 0.15}s` }}
            aria-hidden="true"
          />
        ))}
      </div>
    </div>
  )
}

// ─── AQI Context Badge ─────────────────────────────────────────────────────────
function AQIContextBadge({ aqi, city }) {
  if (aqi == null) return null
  const category = getAQICategory(aqi)
  return (
    <div
      className={clsx(
        'flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-medium border',
        category.bgColor, category.textColor, category.borderColor
      )}
      role="status"
      aria-label={`Current AQI in ${city}: ${Math.round(aqi)}, ${category.label}`}
    >
      <span aria-hidden="true">{category.icon}</span>
      <span>{city}: AQI {Math.round(aqi)} — {category.label}</span>
    </div>
  )
}

// ─── Main Component ────────────────────────────────────────────────────────────
export default function AIAssistant() {
  const { location } = useLocation()
  const { data: aqiData } = useCurrentAQI()
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: `Hello! I'm BreatheWise AI, your personal air quality advisor for ${location.city}.\n\nI can help you with pollution safety, indoor air quality tips, low-emission travel, and sustainable lifestyle recommendations.\n\nWhat would you like to know?`,
      id: 'welcome',
    },
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const bottomRef = useRef(null)
  const inputRef = useRef(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  const sendMessage = useCallback(async (text) => {
    const clean = sanitizeText(text, 500)
    if (!clean || loading) return

    const userMsg = { role: 'user', content: clean, id: Date.now().toString() }
    setMessages(prev => [...prev, userMsg])
    setInput('')
    setLoading(true)

    try {
      const response = await aiService.chat({
        message: clean,
        location: location.city,
        aqi: aqiData?.aqi,
        history: messages.slice(-6).map(m => ({ role: m.role, content: m.content })),
      })
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: response.message || response.response || 'I could not generate a response.',
        fallback: response.fallback || false,
        id: Date.now().toString() + '-r',
      }])
    } catch {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: getFallbackResponse(clean, location.city, aqiData?.aqi),
        fallback: true,
        id: Date.now().toString() + '-e',
      }])
    } finally {
      setLoading(false)
      inputRef.current?.focus()
    }
  }, [loading, messages, location, aqiData])

  function handleSubmit(e) {
    e.preventDefault()
    sendMessage(input)
  }

  const showSuggestions = messages.length <= 1

  return (
    <div className="flex flex-col h-[calc(100vh-9rem)] animate-fade-in" aria-label="AI Pollution Assistant">
      {/* Header */}
      <div className="flex items-start justify-between gap-3 mb-4 flex-wrap">
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center shadow-sm flex-shrink-0"
            style={{ background: 'linear-gradient(135deg, #22c55e 0%, #0d9488 100%)' }}
            aria-hidden="true"
          >
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="section-title leading-none">AI Pollution Assistant</h1>
            <p className="section-subtitle text-sm">Ask anything about air quality in {location.city}</p>
          </div>
        </div>
        <AQIContextBadge aqi={aqiData?.aqi} city={location.city} />
      </div>

      {/* Chat area */}
      <div
        className="flex-1 overflow-y-auto card p-4 space-y-4 mb-4 min-h-0"
        role="log"
        aria-live="polite"
        aria-label="Conversation history"
      >
        {messages.map(msg => <Message key={msg.id} msg={msg} />)}
        {loading && <TypingIndicator />}
        <div ref={bottomRef} />
      </div>

      {/* Suggested questions */}
      {showSuggestions && (
        <div className="mb-3">
          <p className="text-xs text-gray-400 dark:text-gray-500 mb-2 font-medium">Suggested questions:</p>
          <div className="flex flex-wrap gap-2">
            {SUGGESTED_QUESTIONS.map(q => (
              <button
                key={q}
                onClick={() => sendMessage(q)}
                disabled={loading}
                className="text-xs px-3 py-1.5 rounded-full border border-green-200 dark:border-green-800
                           text-green-700 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/20
                           transition-colors disabled:opacity-50 flex items-center gap-1 group"
              >
                {q}
                <ChevronRight className="w-3 h-3 opacity-0 group-hover:opacity-60 transition-opacity" aria-hidden="true" />
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input */}
      <form onSubmit={handleSubmit} className="flex gap-2" aria-label="Send message">
        <label htmlFor="chat-input" className="sr-only">Type your question</label>
        <input
          id="chat-input"
          ref={inputRef}
          type="text"
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder="Ask about air quality, health tips, routes…"
          className="input-field flex-1"
          maxLength={500}
          disabled={loading}
          aria-label="Message input"
          autoComplete="off"
        />
        <button
          type="submit"
          disabled={!input.trim() || loading}
          className="btn-primary px-4 flex items-center gap-2"
          aria-label="Send message"
        >
          {loading
            ? <LoadingSpinner size="sm" label="Sending…" />
            : <Send className="w-4 h-4" aria-hidden="true" />
          }
        </button>
      </form>

      {/* Character count */}
      {input.length > 400 && (
        <p className="text-xs text-right text-gray-400 mt-1" aria-live="polite">
          {input.length}/500
        </p>
      )}
    </div>
  )
}

function getFallbackResponse(question, city, aqi) {
  const q = question.toLowerCase()
  const aqiNum = aqi || 0

  if (q.includes('safe') || q.includes('outside') || q.includes('go out') || q.includes('outdoor')) {
    if (aqiNum <= 50) return `The air quality in ${city} is currently Good (AQI ~${aqiNum}). It is safe to go outside and enjoy outdoor activities without restriction.`
    if (aqiNum <= 100) return `The air quality in ${city} is Moderate (AQI ~${aqiNum}). Most people can go outside, but those with respiratory conditions should consider limiting prolonged exertion.`
    if (aqiNum <= 150) return `Air quality is Unhealthy for Sensitive Groups (AQI ~${aqiNum}). Children, elderly, and those with asthma should reduce time outdoors. Healthy adults can go outside but should avoid strenuous exercise.`
    return `Air quality in ${city} is currently Unhealthy (AQI ~${aqiNum}). It is advisable to stay indoors, wear an N95 mask if outdoor activity is necessary, and keep windows closed.`
  }
  if (q.includes('child') || q.includes('kid') || q.includes('children') || q.includes('family')) {
    return `To protect children in ${city}:\n• Keep them indoors during high-pollution periods.\n• Ensure well-fitting N95 masks when outside.\n• Schedule outdoor play in morning or evening when pollution is typically lower.\n• Watch for coughing, wheezing, or eye irritation.\n• Consult a pediatrician if respiratory symptoms develop.`
  }
  if (q.includes('indoor') || q.includes('inside') || q.includes('home') || q.includes('house')) {
    return `To improve indoor air quality:\n• Use HEPA air purifiers in frequently used rooms.\n• Ventilate when outdoor AQI is below 50.\n• Avoid smoking indoors.\n• Use exhaust fans while cooking.\n• Add air-purifying plants (spider plant, peace lily).\n• Vacuum regularly with a HEPA-filter vacuum.`
  }
  if (q.includes('smog') || q.includes('severe') || q.includes('emergency') || q.includes('hazard')) {
    return `During severe smog conditions:\n• Stay indoors and seal gaps around doors/windows.\n• Run air purifiers continuously.\n• Avoid all outdoor exercise.\n• Wear N95 masks if you must go outside.\n• Monitor air quality apps for real-time updates.\n• Seek medical attention if breathing difficulties develop.`
  }
  if (q.includes('sustainable') || q.includes('alternative') || q.includes('eco') || q.includes('green')) {
    return `Sustainable alternatives to reduce your contribution to air pollution:\n• Use public transport, cycling, or walk for short trips.\n• Switch to electric or hybrid vehicles when feasible.\n• Carpool to reduce per-person emissions.\n• Avoid burning waste or using wood fires.\n• Switch to induction cooking.\n• Reduce, reuse, and recycle to lower waste incineration.`
  }
  if (q.includes('mask') || q.includes('n95') || q.includes('filter')) {
    return `Mask guidance for ${city} (AQI ~${aqiNum}):\n• AQI 0–100: No mask needed for most people.\n• AQI 101–150: Sensitive groups should consider an N95 mask outdoors.\n• AQI 151–200: Everyone should wear an N95 mask for outdoor activity.\n• AQI 200+: N95 or higher mask is essential. Minimize outdoor time.\n\nSurgical masks do not filter fine particles (PM2.5). Use certified N95/KN95 respirators.`
  }
  return `I'm here to help with air quality information for ${city} (current AQI: ~${aqiNum}).\n\nI can advise on:\n• Safety of outdoor activities given current conditions\n• Protecting children and vulnerable family members\n• Indoor air quality improvement\n• Low-emission transport alternatives\n• Actions during severe smog episodes\n• Sustainable practices to reduce pollution\n\nPlease ask a specific question for tailored advice.`
}
