import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import { Brain } from 'lucide-react'

export default function Home() {
  const router = useRouter()
  const [nickname, setNickname] = useState('')
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard' | null>(null)

  useEffect(() => {
    const initializeQuestions = async () => {
      try {
        const response = await fetch('/api/cron/generate-question')
        const data = await response.json()
        console.log('Sorular başlatıldı:', data)
      } catch (err) {
        console.log('Sorular başlatılmaya çalışıldı')
      }
    }
    initializeQuestions()
  }, [])

  const handleStartGame = async () => {
    if (!nickname.trim()) {
      alert('Lütfen bir kullanıcı adı girin')
      return
    }
    if (!difficulty) {
      alert('Lütfen bir zorluk seviyesi seçin')
      return
    }

    try {
      const response = await fetch('/api/game/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nickname, difficulty }),
      })

      if (response.ok) {
        const data = await response.json()
        router.push(`/game?sessionId=${data.sessionId}`)
      } else {
        const error = await response.json()
        alert(`Hata: ${error.error || 'Oyun başlatılamadı'}`)
      }
    } catch (error) {
      console.error('Oyun başlatma hatası:', error)
      alert('Oyun başlatılamadı. Lütfen tekrar deneyin.')
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-dark via-slate-900 to-darker flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <Brain className="w-16 h-16 text-blue-500" />
          </div>
          <h1 className="text-4xl font-bold mb-2">İnsan Avcısı</h1>
          <p className="text-gray-400 text-sm">
            Yapay zekanın ürettiği cevapları insanın yazıp yazmadığını tahmin et
          </p>
        </div>

        <div className="card mb-6">
          <div className="mb-6">
            <label className="block text-sm font-semibold mb-2">Kullanıcı Adı</label>
            <input
              type="text"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              placeholder="Bir takma ad gir"
              className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg focus:outline-none focus:border-blue-500 text-white"
            />
          </div>

          <div className="mb-6">
            <label className="block text-sm font-semibold mb-3">Zorluk Seviyesi</label>
            <div className="grid grid-cols-3 gap-3">
              {[
                { key: 'easy', label: 'Kolay', desc: 'Basit sorular' },
                { key: 'medium', label: 'Orta', desc: 'Orta zorluk' },
                { key: 'hard', label: 'Zor', desc: 'Zor sorular' },
              ].map((level) => (
                <button
                  key={level.key}
                  onClick={() => setDifficulty(level.key as any)}
                  className={`p-3 rounded-lg border-2 transition-all ${
                    difficulty === level.key
                      ? 'border-blue-500 bg-blue-500/20'
                      : 'border-slate-600 hover:border-slate-500'
                  }`}
                >
                  <div className="font-semibold text-sm">{level.label}</div>
                  <div className="text-xs text-gray-400">{level.desc}</div>
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={handleStartGame}
            className="btn-primary w-full"
          >
            Oyuna Başla
          </button>
        </div>

        <div className="text-center text-xs text-gray-500">
          <p>Yapay zeka ve insan yazısını ayırt edebilir misin?</p>
        </div>
      </div>
    </div>
  )
}
