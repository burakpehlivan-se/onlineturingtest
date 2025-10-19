import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import { Heart, Share2, RotateCcw, Home } from 'lucide-react'

interface GameState {
  score: number
  lives: number
  currentQuestion: {
    id: string
    question: string
    answerA: string
    answerB: string
    correctAnswer: 'A' | 'B'
    directive: 'Bunlardan hangisi AI yazımı?' | 'Bunlardan hangisi İnsan yazımı?'
  } | null
  gameOver: boolean
}

export default function Game() {
  const router = useRouter()
  const { sessionId } = router.query
  const [gameState, setGameState] = useState<GameState>({
    score: 0,
    lives: 3,
    currentQuestion: null,
    gameOver: false,
  })
  const [loading, setLoading] = useState(true)
  const [feedback, setFeedback] = useState<{ type: 'correct' | 'wrong' | null; message: string }>({
    type: null,
    message: '',
  })
  const [answered, setAnswered] = useState(false)

  useEffect(() => {
    if (!sessionId) return
    loadNextQuestion()
  }, [sessionId])

  const loadNextQuestion = async () => {
    if (!sessionId) return
    setLoading(true)
    setFeedback({ type: null, message: '' })
    setAnswered(false)

    try {
      console.log('🔍 Frontend - Soru yükleniyor, sessionId:', sessionId)
      const response = await fetch(`/api/game/next-question?sessionId=${sessionId}`)
      
      console.log('🔍 Frontend - API Response Status:', response.status)
      
      if (!response.ok) {
        const errorText = await response.text()
        console.error('❌ Frontend - API Error:', response.status, errorText)
        throw new Error(`HTTP ${response.status}: ${errorText}`)
      }
      
      const data = await response.json()
      console.log('🔍 Frontend - API Response Data:', data)

      if (data.error) {
        console.error('❌ Frontend - Data Error:', data.error)
        setFeedback({ type: 'wrong', message: data.error })
        return
      }

      if (data.gameOver) {
        setGameState((prev) => ({ ...prev, gameOver: true }))
      } else if (data.question) {
        // Cevapları kontrol et
        if (!data.question.answerA || !data.question.answerB) {
          setFeedback({ type: 'wrong', message: 'Soru verileri eksik. Lütfen yöneticiye başvurun.' })
          return
        }
        
        const directive = Math.random() > 0.5 ? 'Bunlardan hangisi AI yazımı?' : 'Bunlardan hangisi İnsan yazımı?'
        setGameState((prev) => ({
          ...prev,
          currentQuestion: {
            ...data.question,
            directive,
          },
          score: data.score,
          lives: data.lives,
        }))
      } else {
        setFeedback({ type: 'wrong', message: 'Soru verisi alınamadı' })
      }
    } catch (error) {
      setFeedback({ type: 'wrong', message: 'Soru yüklenemedi. Lütfen sayfayı yenileyin.' })
    } finally {
      setLoading(false)
    }
  }

  const handleAnswer = async (choice: 'A' | 'B') => {
    if (!sessionId || !gameState.currentQuestion || answered) return

    setAnswered(true)

    try {
      const response = await fetch('/api/game/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId,
          choice,
          questionId: gameState.currentQuestion.id,
          correctAnswer: gameState.currentQuestion.correctAnswer,
        }),
      })

      const data = await response.json()

      if (data.correct) {
        setFeedback({
          type: 'correct',
          message: `✓ Doğru! +${data.pointsEarned} puan`,
        })
        setGameState((prev) => ({
          ...prev,
          score: data.newScore,
          lives: data.newLives,
        }))
      } else {
        setFeedback({
          type: 'wrong',
          message: `✗ Yanlış! Doğru cevap: ${data.correctAnswer}`,
        })
        setGameState((prev) => ({
          ...prev,
          lives: data.newLives,
        }))
      }

      setTimeout(() => {
        if (data.newLives <= 0) {
          setGameState((prev) => ({ ...prev, gameOver: true }))
        } else {
          loadNextQuestion()
        }
      }, 2000)
    } catch (error) {
      console.error('Cevap gönderme hatası:', error)
      setFeedback({ type: 'wrong', message: 'Bir hata oluştu' })
    }
  }

  const handleShare = () => {
    const text = `İnsan Avcısı oyununda ${gameState.score} puan aldım! Sence sen AI'ı insandan ayırabilir misin?`
    const url = window.location.origin

    const shareOptions = [
      { name: 'Twitter', url: `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)} ${url}` },
      { name: 'Facebook', url: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}` },
      { name: 'WhatsApp', url: `https://wa.me/?text=${encodeURIComponent(text + ' ' + url)}` },
    ]

    const choice = prompt('Paylaş: Twitter (1), Facebook (2), WhatsApp (3)')
    if (choice === '1') window.open(shareOptions[0].url, '_blank')
    else if (choice === '2') window.open(shareOptions[1].url, '_blank')
    else if (choice === '3') window.open(shareOptions[2].url, '_blank')
  }

  if (!sessionId) {
    return <div className="min-h-screen bg-dark flex items-center justify-center">Yükleniyor...</div>
  }

  if (gameState.gameOver) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-dark via-slate-900 to-darker flex items-center justify-center p-4">
        <div className="max-w-md w-full text-center">
          <h1 className="text-4xl font-bold mb-4">Oyun Bitti!</h1>
          <div className="card mb-6">
            <p className="text-gray-400 mb-2">Final Skorunuz</p>
            <p className="text-6xl font-bold text-blue-500 mb-4">{gameState.score}</p>
            <p className="text-sm text-gray-400">
              {gameState.score < 50
                ? 'Daha çok pratik yapmalısın!'
                : gameState.score < 100
                ? 'İyi bir performans!'
                : 'Harika! AI uzmanı gibisin!'}
            </p>
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => router.push('/')}
              className="btn-secondary flex-1 flex items-center justify-center gap-2"
            >
              <RotateCcw className="w-4 h-4" />
              Tekrar Oyna
            </button>
            <button
              onClick={handleShare}
              className="btn-primary flex-1 flex items-center justify-center gap-2"
            >
              <Share2 className="w-4 h-4" />
              Paylaş
            </button>
          </div>
        </div>
      </div>
    )
  }

  if (loading || !gameState.currentQuestion) {
    return (
      <div className="min-h-screen bg-dark flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-400">Soru yükleniyor...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-dark via-slate-900 to-darker p-4">
      <div className="max-w-2xl mx-auto">
        <div className="flex justify-between items-center mb-8 relative">
          <button
            onClick={() => router.push('/')}
            className="absolute right-0 top-0 p-2 rounded-lg bg-slate-700 hover:bg-slate-600 transition-colors flex items-center gap-2 text-sm"
            title="Ana Sayfaya Dön"
          >
            <Home className="w-4 h-4" />
            <span className="hidden sm:inline">Ana Sayfa</span>
          </button>
          <div className="flex gap-1">
            {Array.from({ length: 3 }).map((_, i) => (
              <Heart
                key={i}
                className={`w-6 h-6 ${i < gameState.lives ? 'fill-red-500 text-red-500' : 'text-gray-600'}`}
              />
            ))}
          </div>
          <div className="text-2xl font-bold text-blue-500">Puan: {gameState.score}</div>
        </div>

        <div className="card mb-8">
          <div className="mb-4 p-3 bg-blue-500/20 border border-blue-500 rounded-lg text-center">
            <p className="text-sm font-semibold text-blue-300">{gameState.currentQuestion?.directive}</p>
          </div>
          <h2 className="text-xl font-semibold mb-6 text-center">
            {gameState.currentQuestion?.question}
          </h2>

          <div className="grid grid-cols-1 gap-4 mb-6">
            {['A', 'B'].map((choice) => (
              <button
                key={choice}
                onClick={() => handleAnswer(choice as 'A' | 'B')}
                disabled={answered}
                className={`p-4 rounded-lg border-2 text-left transition-all ${
                  answered
                    ? gameState.currentQuestion?.correctAnswer === choice
                      ? 'border-green-500 bg-green-500/20'
                      : 'border-red-500 bg-red-500/20'
                    : 'border-slate-600 hover:border-blue-500 hover:bg-slate-700/50'
                } ${answered ? 'cursor-default' : 'cursor-pointer'}`}
              >
                <div className="font-semibold mb-2">Cevap {choice}</div>
                <p className="text-sm text-gray-300">
                  {choice === 'A'
                    ? gameState.currentQuestion?.answerA
                    : gameState.currentQuestion?.answerB}
                </p>
              </button>
            ))}
          </div>

          {feedback.type && (
            <div
              className={`p-4 rounded-lg text-center font-semibold ${
                feedback.type === 'correct'
                  ? 'bg-green-500/20 text-green-400 border border-green-500'
                  : 'bg-red-500/20 text-red-400 border border-red-500'
              }`}
            >
              {feedback.message}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
