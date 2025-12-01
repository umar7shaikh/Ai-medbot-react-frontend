import React, { useEffect, useRef, useState } from 'react'
import api from '../services/api'
import { useAuth } from '../context/AuthContext'
import {
  Image as ImageIcon,
  Mic,
  MicOff,
  Send,
  Globe2,
  Loader2,
  PauseCircle,
  PlayCircle,
} from 'lucide-react'

const ChatPage = () => {
  const { user } = useAuth()

  const [conversations, setConversations] = useState([])
  const [selectedConv, setSelectedConv] = useState(null)
  const [messages, setMessages] = useState([])

  const [input, setInput] = useState('')
  const [language, setLanguage] = useState(user?.preferredLanguage || 'en')

  const [loadingConvs, setLoadingConvs] = useState(true)
  const [sending, setSending] = useState(false)
  const [sendingImage, setSendingImage] = useState(false)
  const [voiceLoading, setVoiceLoading] = useState(false)
  const [recording, setRecording] = useState(false)

  const [pendingImage, setPendingImage] = useState(null) // { base64, mimeType }

  const mediaRecorderRef = useRef(null)
  const chunksRef = useRef([])
  const messagesEndRef = useRef(null)

  // TTS playback
  const [playingMsgId, setPlayingMsgId] = useState(null)
  const audioRef = useRef(null)

  const languageOptions = [
    { code: 'en', label: 'English' },
    { code: 'hi', label: 'Hindi' },
    { code: 'es', label: 'Spanish' },
    { code: 'fr', label: 'French' },
    { code: 'de', label: 'German' },
    { code: 'zh', label: 'Chinese' },
    { code: 'ar', label: 'Arabic' },
  ]

  // load conversation list once
  useEffect(() => {
    const loadConvs = async () => {
      try {
        setLoadingConvs(true)
        const res = await api.get('/chat')
        setConversations(res.data.conversations || [])
      } catch (err) {
        console.error('Failed to load conversations', err)
      } finally {
        setLoadingConvs(false)
      }
    }
    loadConvs()
  }, [])

  // load messages when conversation id changes
  useEffect(() => {
    const loadMessages = async () => {
      if (!selectedConv || !selectedConv._id) return
      try {
        const res = await api.get(`/chat/${selectedConv._id}`)
        setMessages(res.data.messages || [])
      } catch (err) {
        console.error('Failed to load messages', err)
      }
    }
    loadMessages()
  }, [selectedConv?._id])

  // auto-scroll to bottom
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }, [messages, sending, sendingImage])

  // attach TTS meta to assistant messages
  const attachTtsToMessages = (msgs, audioBase64, audioMimeType) => {
    if (!audioBase64) return msgs || []
    return (msgs || []).map((m) =>
      m.sender === 'assistant'
        ? { ...m, audioBase64, audioMimeType }
        : m
    )
  }

  // make sure selected conversation exists in state by id
  const ensureSelectedConversation = async (conversationId, fallbackTitle) => {
    if (selectedConv && selectedConv._id === conversationId) return

    try {
      const res = await api.get('/chat')
      const list = res.data.conversations || []
      setConversations(list)
      const conv = list.find((c) => c._id === conversationId)
      if (conv) {
        setSelectedConv(conv)
      } else {
        setSelectedConv({
          _id: conversationId,
          title: (fallbackTitle || 'Conversation').slice(0, 40),
        })
      }
    } catch (err) {
      console.error('ensureSelectedConversation error', err)
      setSelectedConv({
        _id: conversationId,
        title: (fallbackTitle || 'Conversation').slice(0, 40),
      })
    }
  }

  const handleSendText = async () => {
    if (!input.trim() && !pendingImage) return

    // CASE 1: image + optional text -> vision endpoint
    if (pendingImage) {
      setSendingImage(true)
      try {
        const payload = {
          imageBase64: pendingImage.base64,
          mimeType: pendingImage.mimeType,
          message: input.trim() || '',
          language,
        }
        if (selectedConv?._id) {
          payload.conversationId = selectedConv._id
        }

        const res = await api.post('/chat/vision', payload)
        const {
          conversationId,
          messages: newMsgs,
          audioBase64,
          audioMimeType,
        } = res.data

        const enhanced = attachTtsToMessages(
          newMsgs,
          audioBase64,
          audioMimeType
        )

        await ensureSelectedConversation(
          conversationId,
          payload.message || 'Image conversation'
        )

        setMessages((prev) => [...prev, ...enhanced])
        setInput('')
        setPendingImage(null)
      } catch (err) {
        console.error('Vision message error', err)
      } finally {
        setSendingImage(false)
      }
      return
    }

    // CASE 2: normal text chat
    setSending(true)
    try {
      const payload = {
        message: input.trim(),
        language,
      }
      if (selectedConv?._id) {
        payload.conversationId = selectedConv._id
      }

      const res = await api.post('/chat', payload)
      const {
        conversationId,
        messages: newMsgs,
        audioBase64,
        audioMimeType,
      } = res.data

      const enhanced = attachTtsToMessages(
        newMsgs,
        audioBase64,
        audioMimeType
      )

      await ensureSelectedConversation(conversationId, payload.message)

      setMessages((prev) => [...prev, ...enhanced])
      setInput('')
    } catch (err) {
      console.error('Send message error', err)
    } finally {
      setSending(false)
    }
  }

  // choose image but don't send yet
  const handleImageChange = (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onloadend = () => {
      const base64 = reader.result.split(',')[1]
      setPendingImage({ base64, mimeType: file.type })
    }
    reader.readAsDataURL(file)
  }

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const mediaRecorder = new MediaRecorder(stream)
      mediaRecorderRef.current = mediaRecorder
      chunksRef.current = []

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data)
        }
      }

      mediaRecorder.onstop = async () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' })
        chunksRef.current = []
        stream.getTracks().forEach((t) => t.stop())
        await sendVoice(blob)
      }

      mediaRecorder.start()
      setRecording(true)
    } catch (err) {
      console.error('Mic permission error', err)
    }
  }

  const stopRecording = () => {
    if (mediaRecorderRef.current && recording) {
      mediaRecorderRef.current.stop()
      setRecording(false)
    }
  }

  const sendVoice = async (blob) => {
    setVoiceLoading(true)
    try {
      const formData = new FormData()
      formData.append('audio', blob, 'voice.webm')

      const res = await api.post('/voice/transcribe', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })

      const text = res.data?.text || ''
      if (text) {
        setInput((prev) => (prev ? `${prev} ${text}` : text))
      }
    } catch (err) {
      console.error('Voice transcribe error', err)
    } finally {
      setVoiceLoading(false)
    }
  }

  // TTS controls
  const handlePlayPause = (msg) => {
    // stop if clicking the same message while playing
    if (playingMsgId === msg._id) {
      if (audioRef.current) {
        audioRef.current.pause()
        audioRef.current.currentTime = 0
      }
      setPlayingMsgId(null)
      return
    }

    // stop any current audio
    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current.currentTime = 0
    }

    const mime = msg.audioMimeType || 'audio/mpeg'
    const audio = new Audio(`data:${mime};base64,${msg.audioBase64}`)
    audioRef.current = audio
    setPlayingMsgId(msg._id)

    audio.onended = () => {
      setPlayingMsgId(null)
    }

    audio
      .play()
      .catch((err) => {
        console.error('Audio play error', err)
        setPlayingMsgId(null)
      })
  }

  const renderMessage = (msg) => {
    const isUser = msg.sender === 'user'
    const isPlaying = !isUser && playingMsgId === msg._id

    return (
      <div
        key={msg._id}
        className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}
      >
        <div
          className={`max-w-[75%] rounded-2xl px-3 py-2 text-sm ${
            isUser
              ? 'bg-blue-600 text-white rounded-br-sm'
              : 'bg-white text-slate-900 border border-slate-200 rounded-bl-sm'
          }`}
        >
          <div className="whitespace-pre-wrap break-words">{msg.content}</div>

          {!isUser && msg.audioBase64 && (
            <button
              type="button"
              onClick={() => handlePlayPause(msg)}
              className="mt-1 inline-flex items-center gap-1 text-[11px] text-blue-200 hover:text-white"
            >
              {isPlaying ? (
                <>
                  <PauseCircle className="h-3.5 w-3.5" />
                  Stop
                </>
              ) : (
                <>
                  <PlayCircle className="h-3.5 w-3.5" />
                  Listen
                </>
              )}
            </button>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-[calc(100vh-3.5rem)] bg-slate-50 py-4">
      <div className="max-w-6xl mx-auto h-[calc(100vh-5rem)] bg-white border border-slate-200 rounded-xl flex overflow-hidden">
        {/* Conversations list */}
        <aside className="w-64 border-r border-slate-200 hidden sm:flex flex-col">
          <div className="px-4 py-3 border-b border-slate-200">
            <p className="text-sm font-semibold text-slate-900">
              Conversations
            </p>
          </div>
          <div className="flex-1 overflow-y-auto">
            {loadingConvs ? (
              <div className="flex items-center justify-center h-full">
                <Loader2 className="h-5 w-5 text-slate-400 animate-spin" />
              </div>
            ) : conversations.length === 0 ? (
              <p className="text-xs text-slate-500 px-4 py-3">
                No conversations yet. Start by sending a message.
              </p>
            ) : (
              conversations.map((conv) => (
                <button
                  key={conv._id}
                  onClick={() => setSelectedConv(conv)}
                  className={`w-full text-left px-4 py-3 text-sm border-b border-slate-100 hover:bg-slate-50 ${
                    selectedConv?._id === conv._id ? 'bg-slate-50' : ''
                  }`}
                >
                  <p className="font-medium text-slate-900 line-clamp-1">
                    {conv.title || 'Conversation'}
                  </p>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    {new Date(
                      conv.updatedAt || conv.createdAt
                    ).toLocaleString()}
                  </p>
                </button>
              ))
            )}
          </div>
        </aside>

        {/* Chat area */}
        <section className="flex-1 flex flex-col">
          {/* Header */}
          <div className="px-4 py-3 border-b border-slate-200 flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-slate-900">
                MedBot assistant
              </p>
              <p className="text-xs text-slate-500">
                General health information only. Not a diagnosis.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Globe2 className="h-4 w-4 text-slate-500" />
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="text-xs border border-slate-200 rounded-md px-2 py-1 bg-white text-slate-700"
              >
                {languageOptions.map((l) => (
                  <option key={l.code} value={l.code}>
                    {l.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-4 py-3 space-y-2 bg-slate-50">
            {messages.length === 0 ? (
              <div className="h-full flex items-center justify-center">
                <p className="text-xs text-slate-500 text-center max-w-xs">
                  Start by typing a question, attaching a medical image or using
                  the microphone to talk to MedBot.
                </p>
              </div>
            ) : (
              messages.map((m) => renderMessage(m))
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input area */}
          <div className="border-t border-slate-200 px-3 py-2 bg-white">
            <div className="flex items-center gap-2">
              {/* image button */}
              <label className="inline-flex items-center justify-center h-9 w-9 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 cursor-pointer">
                <ImageIcon className="h-4 w-4" />
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleImageChange}
                />
              </label>

              {/* mic button */}
              <button
                type="button"
                onClick={recording ? stopRecording : startRecording}
                className={`inline-flex items-center justify-center h-9 w-9 rounded-lg border ${
                  recording
                    ? 'border-red-300 bg-red-50 text-red-600'
                    : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                {recording ? (
                  <MicOff className="h-4 w-4" />
                ) : (
                  <Mic className="h-4 w-4" />
                )}
              </button>

              {/* text input */}
              <div className="flex-1">
                <input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault()
                      if (!sending && !sendingImage) handleSendText()
                    }
                  }}
                  placeholder="Type your health question..."
                  className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              {/* send button */}
              <button
                type="button"
                disabled={
                  sending || sendingImage || (!input.trim() && !pendingImage)
                }
                onClick={handleSendText}
                className="inline-flex items-center justify-center h-9 px-3 rounded-lg bg-blue-600 text-white text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {sending || sendingImage ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </button>
            </div>

            {/* image queued info */}
            {pendingImage && (
              <div className="mt-1 flex items-center gap-2 text-[11px] text-slate-600">
                <span className="px-2 py-0.5 rounded-full bg-slate-100">
                  Image attached
                </span>
                <button
                  type="button"
                  onClick={() => setPendingImage(null)}
                  className="text-red-500 hover:underline"
                >
                  Remove
                </button>
              </div>
            )}

            {voiceLoading && (
              <p className="mt-1 text-[11px] text-slate-500">
                Transcribing voice...
              </p>
            )}
          </div>
        </section>
      </div>
    </div>
  )
}

export default ChatPage
