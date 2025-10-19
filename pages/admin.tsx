import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Head from 'next/head'
import { Trash2, Edit3, Save, X, Plus, Play, Eye, EyeOff, RotateCcw, LogOut } from 'lucide-react'

interface StoredQuestion {
  id: string
  question: string
  answerAI: string
  answerHuman: string
  source: string
  originalQuestion?: string
  originalAnswer?: string
  isTranslated?: boolean
}

export default function AdminPage() {
  const router = useRouter()
  const [isProcessing, setIsProcessing] = useState(false)
  const [result, setResult] = useState<string>('')
  const [count, setCount] = useState(1)
  const [adminKey, setAdminKey] = useState('')
  const [questions, setQuestions] = useState<StoredQuestion[]>([])
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editForm, setEditForm] = useState<StoredQuestion | null>(null)
  const [activeTab, setActiveTab] = useState<'process' | 'manage' | 'demo'>('process')
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  
  // Demo game state
  const [currentQuestion, setCurrentQuestion] = useState<StoredQuestion | null>(null)
  const [showAnswers, setShowAnswers] = useState(false)
  const [selectedAnswer, setSelectedAnswer] = useState<'human' | 'ai' | null>(null)
  const [demoScore, setDemoScore] = useState({ correct: 0, total: 0 })
  const [gameStarted, setGameStarted] = useState(false)

  // Authentication check
  const checkAuth = async () => {
    try {
      const response = await fetch('/api/admin/get-questions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ adminKey })
      })
      const data = await response.json()
      if (data.success) {
        setIsAuthenticated(true)
        setQuestions(data.questions)
        setResult('')
      } else {
        setResult('❌ Geçersiz admin key!')
        setIsAuthenticated(false)
      }
    } catch (error) {
      setResult('❌ Bağlantı hatası!')
      setIsAuthenticated(false)
    }
  }

  // Load questions from API
  const loadQuestions = async () => {
    try {
      const response = await fetch('/api/admin/get-questions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ adminKey })
      })
      const data = await response.json()
      if (data.success) {
        setQuestions(data.questions)
      }
    } catch (error) {
      console.error('Questions load error:', error)
    }
  }

  // Process new questions
  const processQuestions = async () => {
    if (!adminKey.trim()) {
      setResult('❌ Admin key gerekli!')
      return
    }

    setIsProcessing(true)
    setResult('🔄 Sorular işleniyor...')

    try {
      const response = await fetch('/api/admin/process-questions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          count: count,
          adminKey: adminKey
        })
      })

      const data = await response.json()

      if (data.success) {
        setResult(`✅ ${data.message}`)
        loadQuestions() // Refresh questions list
      } else {
        setResult(`❌ ${data.message}`)
      }
    } catch (error) {
      setResult(`❌ Hata: ${error instanceof Error ? error.message : 'Bilinmeyen hata'}`)
    } finally {
      setIsProcessing(false)
    }
  }

  // Delete question
  const deleteQuestion = async (questionId: string) => {
    if (!confirm('Bu soruyu silmek istediğinizden emin misiniz?')) return

    try {
      const response = await fetch('/api/admin/delete-question', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ adminKey, questionId })
      })
      const data = await response.json()
      if (data.success) {
        setQuestions(questions.filter(q => q.id !== questionId))
        setResult('✅ Soru silindi')
      } else {
        setResult(`❌ ${data.message}`)
      }
    } catch (error) {
      setResult('❌ Silme hatası')
    }
  }

  // Start editing
  const startEdit = (question: StoredQuestion) => {
    setEditingId(question.id)
    setEditForm({ ...question })
  }

  // Cancel editing
  const cancelEdit = () => {
    setEditingId(null)
    setEditForm(null)
  }

  // Save edited question
  const saveEdit = async () => {
    if (!editForm) return

    try {
      const response = await fetch('/api/admin/update-question', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ adminKey, question: editForm })
      })
      const data = await response.json()
      if (data.success) {
        setQuestions(questions.map(q => q.id === editForm.id ? editForm : q))
        setEditingId(null)
        setEditForm(null)
        setResult('✅ Soru güncellendi')
      } else {
        setResult(`❌ ${data.message}`)
      }
    } catch (error) {
      setResult('❌ Güncelleme hatası')
    }
  }

  // Demo game functions
  const startDemo = () => {
    if (questions.length === 0) {
      setResult('❌ Soru havuzunda soru yok!')
      return
    }
    setGameStarted(true)
    setDemoScore({ correct: 0, total: 0 })
    getNextQuestion()
  }

  const getNextQuestion = () => {
    const availableQuestions = questions.filter(q => q.id !== currentQuestion?.id)
    if (availableQuestions.length === 0) {
      setResult('✅ Tüm sorular tamamlandı!')
      setCurrentQuestion(null)
      setGameStarted(false)
      return
    }
    
    const randomQuestion = availableQuestions[Math.floor(Math.random() * availableQuestions.length)]
    setCurrentQuestion(randomQuestion)
    setSelectedAnswer(null)
    setShowAnswers(false)
  }

  const selectAnswer = (answer: 'human' | 'ai') => {
    setSelectedAnswer(answer)
    
    if (!showAnswers) {
      // Calculate score (human is correct answer)
      const isCorrect = answer === 'human'
      setDemoScore(prev => ({
        correct: prev.correct + (isCorrect ? 1 : 0),
        total: prev.total + 1
      }))
    }
  }

  const resetDemo = () => {
    setGameStarted(false)
    setCurrentQuestion(null)
    setSelectedAnswer(null)
    setShowAnswers(false)
    setDemoScore({ correct: 0, total: 0 })
  }

  const startEditFromDemo = () => {
    if (currentQuestion) {
      setEditingId(currentQuestion.id)
      setEditForm({ ...currentQuestion })
      setActiveTab('manage')
    }
  }

  // Logout function
  const handleLogout = () => {
    // Clear admin session cookie
    document.cookie = 'admin-session=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT'
    // Redirect to login
    router.push('/admin-login')
  }

  const deleteFromDemo = async () => {
    if (!currentQuestion) return
    
    if (!confirm('Bu soruyu silmek istediğinizden emin misiniz?')) return

    try {
      const response = await fetch('/api/admin/delete-question', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ adminKey, questionId: currentQuestion.id })
      })
      const data = await response.json()
      if (data.success) {
        // Remove from local questions array
        setQuestions(questions.filter(q => q.id !== currentQuestion.id))
        setResult('✅ Soru silindi')
        // Move to next question
        getNextQuestion()
      } else {
        setResult(`❌ ${data.message}`)
      }
    } catch (error) {
      setResult('❌ Silme hatası')
    }
  }

  return (
    <>
      <Head>
        <title>Admin Panel - Online Turing Test</title>
        <meta name="robots" content="noindex, nofollow, noarchive, nosnippet" />
        <meta name="googlebot" content="noindex, nofollow" />
      </Head>
      
      <div className="min-h-screen bg-gray-100 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900">
              Admin Panel
            </h1>
            <button
              onClick={handleLogout}
              className="flex items-center px-4 py-2 text-sm text-red-600 hover:text-red-700 hover:bg-red-50 rounded-md transition-colors"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Çıkış Yap
            </button>
          </div>

          {!isAuthenticated ? (
            <div className="max-w-md mx-auto bg-white rounded-lg shadow-md p-6">
              <div className="space-y-4">
                <div>
                  <label htmlFor="adminKey" className="block text-sm font-medium text-gray-700">
                    Admin Key
                  </label>
                  <input
                    type="password"
                    id="adminKey"
                    value={adminKey}
                    onChange={(e) => setAdminKey(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && checkAuth()}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Admin key girin"
                  />
                </div>
                <button
                  onClick={checkAuth}
                  className="w-full py-2 px-4 rounded-md text-white font-medium bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  Giriş Yap
                </button>
                {result && (
                  <div className="mt-4 p-3 bg-red-50 rounded-md">
                    <p className="text-sm text-red-800">{result}</p>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow-md">
              {/* Tab Navigation */}
              <div className="border-b border-gray-200">
                <nav className="-mb-px flex">
                  <button
                    onClick={() => setActiveTab('process')}
                    className={`py-2 px-4 border-b-2 font-medium text-sm ${
                      activeTab === 'process'
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    Soru İşleme
                  </button>
                  <button
                    onClick={() => setActiveTab('manage')}
                    className={`py-2 px-4 border-b-2 font-medium text-sm ${
                      activeTab === 'manage'
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    Soru Yönetimi ({questions.length})
                  </button>
                  <button
                    onClick={() => setActiveTab('demo')}
                    className={`py-2 px-4 border-b-2 font-medium text-sm ${
                      activeTab === 'demo'
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    Demo Oyun
                  </button>
                </nav>
              </div>

              <div className="p-6">
                {activeTab === 'process' && (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="count" className="block text-sm font-medium text-gray-700">
                          İşlenecek Soru Sayısı
                        </label>
                        <select
                          id="count"
                          value={count}
                          onChange={(e) => setCount(parseInt(e.target.value))}
                          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        >
                          {[1, 2, 3, 4, 5, 10].map(num => (
                            <option key={num} value={num}>{num} soru</option>
                          ))}
                        </select>
                      </div>
                      <div className="flex items-end">
                        <button
                          onClick={processQuestions}
                          disabled={isProcessing}
                          className={`w-full py-2 px-4 rounded-md text-white font-medium ${
                            isProcessing 
                              ? 'bg-gray-400 cursor-not-allowed' 
                              : 'bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500'
                          }`}
                        >
                          {isProcessing ? 'İşleniyor...' : 'Soruları İşle'}
                        </button>
                      </div>
                    </div>

                    <div className="bg-gray-50 rounded-md p-4">
                      <h3 className="text-lg font-medium text-gray-900 mb-3">Nasıl Çalışır?</h3>
                      <div className="text-sm text-gray-600 space-y-2">
                        <p><strong>1.</strong> filtrelenmis_soru_cevaplar.json'dan rastgele soru seçilir</p>
                        <p><strong>2.</strong> OpenRouter API ile Türkçeye çevrilir</p>
                        <p><strong>3.</strong> AI cevabı üretilir (forum kullanıcısı gibi)</p>
                        <p><strong>4.</strong> Soru havuzuna eklenir</p>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'manage' && (
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <h3 className="text-lg font-medium text-gray-900">
                        Soru Havuzu ({questions.length} soru)
                      </h3>
                      <button
                        onClick={loadQuestions}
                        className="px-4 py-2 text-sm bg-gray-600 text-white rounded-md hover:bg-gray-700"
                      >
                        Yenile
                      </button>
                    </div>

                    <div className="space-y-4 max-h-96 overflow-y-auto">
                      {questions.map((question) => (
                        <div key={question.id} className="border border-gray-200 rounded-lg p-4">
                          {editingId === question.id ? (
                            <div className="space-y-3">
                              <div>
                                <label className="block text-sm font-medium text-gray-700">Soru</label>
                                <textarea
                                  value={editForm?.question || ''}
                                  onChange={(e) => setEditForm(prev => prev ? {...prev, question: e.target.value} : null)}
                                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                  rows={2}
                                />
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-gray-700">İnsan Cevabı</label>
                                <textarea
                                  value={editForm?.answerHuman || ''}
                                  onChange={(e) => setEditForm(prev => prev ? {...prev, answerHuman: e.target.value} : null)}
                                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                  rows={2}
                                />
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-gray-700">AI Cevabı</label>
                                <textarea
                                  value={editForm?.answerAI || ''}
                                  onChange={(e) => setEditForm(prev => prev ? {...prev, answerAI: e.target.value} : null)}
                                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                  rows={2}
                                />
                              </div>
                              <div className="flex space-x-2">
                                <button
                                  onClick={saveEdit}
                                  className="flex items-center px-3 py-1 bg-green-600 text-white rounded-md hover:bg-green-700"
                                >
                                  <Save className="w-4 h-4 mr-1" />
                                  Kaydet
                                </button>
                                <button
                                  onClick={cancelEdit}
                                  className="flex items-center px-3 py-1 bg-gray-600 text-white rounded-md hover:bg-gray-700"
                                >
                                  <X className="w-4 h-4 mr-1" />
                                  İptal
                                </button>
                              </div>
                            </div>
                          ) : (
                            <div>
                              <div className="mb-2">
                                <h4 className="font-medium text-gray-900">Soru:</h4>
                                <p className="text-gray-700">{question.question}</p>
                              </div>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                                <div>
                                  <h5 className="font-medium text-green-700">İnsan Cevabı:</h5>
                                  <p className="text-sm text-gray-600">{question.answerHuman}</p>
                                </div>
                                <div>
                                  <h5 className="font-medium text-blue-700">AI Cevabı:</h5>
                                  <p className="text-sm text-gray-600">{question.answerAI}</p>
                                </div>
                              </div>
                              <div className="flex justify-between items-center">
                                <span className="text-xs text-gray-500">
                                  Kaynak: {question.source} | ID: {question.id}
                                </span>
                                <div className="flex space-x-2">
                                  <button
                                    onClick={() => startEdit(question)}
                                    className="flex items-center px-3 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                                  >
                                    <Edit3 className="w-4 h-4 mr-1" />
                                    Düzenle
                                  </button>
                                  <button
                                    onClick={() => deleteQuestion(question.id)}
                                    className="flex items-center px-3 py-1 bg-red-600 text-white rounded-md hover:bg-red-700"
                                  >
                                    <Trash2 className="w-4 h-4 mr-1" />
                                    Sil
                                  </button>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                      {questions.length === 0 && (
                        <div className="text-center py-8 text-gray-500">
                          Henüz soru bulunmuyor. Yukarıdaki "Soru İşleme" sekmesinden yeni sorular ekleyebilirsiniz.
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {activeTab === 'demo' && (
                  <div className="space-y-6">
                    <div className="flex justify-between items-center">
                      <h3 className="text-lg font-medium text-gray-900">
                        Demo Oyun - Turing Test
                      </h3>
                      <div className="flex items-center space-x-4">
                        {gameStarted && (
                          <div className="text-sm text-gray-600">
                            Skor: {demoScore.correct}/{demoScore.total} 
                            {demoScore.total > 0 && ` (${Math.round((demoScore.correct / demoScore.total) * 100)}%)`}
                          </div>
                        )}
                        <button
                          onClick={gameStarted ? resetDemo : startDemo}
                          className={`flex items-center px-4 py-2 rounded-md text-white font-medium ${
                            gameStarted 
                              ? 'bg-red-600 hover:bg-red-700' 
                              : 'bg-green-600 hover:bg-green-700'
                          }`}
                        >
                          {gameStarted ? (
                            <>
                              <RotateCcw className="w-4 h-4 mr-2" />
                              Sıfırla
                            </>
                          ) : (
                            <>
                              <Play className="w-4 h-4 mr-2" />
                              Demo Başlat
                            </>
                          )}
                        </button>
                      </div>
                    </div>

                    {!gameStarted ? (
                      <div className="text-center py-12 bg-gray-50 rounded-lg">
                        <Play className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                        <h4 className="text-lg font-medium text-gray-900 mb-2">Demo Oyun</h4>
                        <p className="text-gray-600 mb-4">
                          Soru havuzundaki soruları test edin. Hangi cevabın insan, hangisinin AI tarafından yazıldığını tahmin edin.
                        </p>
                        <p className="text-sm text-gray-500">
                          Toplam {questions.length} soru mevcut
                        </p>
                      </div>
                    ) : currentQuestion ? (
                      <div className="bg-white border border-gray-200 rounded-lg p-6">
                        <div className="mb-6">
                          <div className="flex justify-between items-start mb-4">
                            <h4 className="text-xl font-medium text-gray-900">
                              {currentQuestion.question}
                            </h4>
                            <div className="flex space-x-2">
                              <button
                                onClick={() => setShowAnswers(!showAnswers)}
                                className={`flex items-center px-3 py-1 rounded-md text-sm ${
                                  showAnswers 
                                    ? 'bg-orange-100 text-orange-700 hover:bg-orange-200' 
                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                }`}
                              >
                                {showAnswers ? (
                                  <>
                                    <EyeOff className="w-4 h-4 mr-1" />
                                    Cevapları Gizle
                                  </>
                                ) : (
                                  <>
                                    <Eye className="w-4 h-4 mr-1" />
                                    Cevapları Göster
                                  </>
                                )}
                              </button>
                              <button
                                onClick={startEditFromDemo}
                                className="flex items-center px-3 py-1 bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 text-sm"
                              >
                                <Edit3 className="w-4 h-4 mr-1" />
                                Düzenle
                              </button>
                              <button
                                onClick={deleteFromDemo}
                                className="flex items-center px-3 py-1 bg-red-100 text-red-700 rounded-md hover:bg-red-200 text-sm"
                              >
                                <Trash2 className="w-4 h-4 mr-1" />
                                Sil
                              </button>
                            </div>
                          </div>
                          
                          <div className="text-xs text-gray-500 mb-4">
                            ID: {currentQuestion.id} | Kaynak: {currentQuestion.source}
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                          <button
                            onClick={() => selectAnswer('human')}
                            className={`p-4 text-left border-2 rounded-lg transition-all ${
                              selectedAnswer === 'human'
                                ? showAnswers 
                                  ? 'border-green-500 bg-green-50'
                                  : 'border-blue-500 bg-blue-50'
                                : 'border-gray-200 hover:border-gray-300'
                            }`}
                          >
                            <div className="flex justify-between items-start mb-2">
                              <h5 className="font-medium text-gray-900">Cevap A</h5>
                              {showAnswers && (
                                <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">
                                  İNSAN
                                </span>
                              )}
                            </div>
                            <p className="text-sm text-gray-700">{currentQuestion.answerHuman}</p>
                          </button>

                          <button
                            onClick={() => selectAnswer('ai')}
                            className={`p-4 text-left border-2 rounded-lg transition-all ${
                              selectedAnswer === 'ai'
                                ? showAnswers 
                                  ? 'border-red-500 bg-red-50'
                                  : 'border-blue-500 bg-blue-50'
                                : 'border-gray-200 hover:border-gray-300'
                            }`}
                          >
                            <div className="flex justify-between items-start mb-2">
                              <h5 className="font-medium text-gray-900">Cevap B</h5>
                              {showAnswers && (
                                <span className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded">
                                  AI
                                </span>
                              )}
                            </div>
                            <p className="text-sm text-gray-700">{currentQuestion.answerAI}</p>
                          </button>
                        </div>

                        {selectedAnswer && (
                          <div className="flex justify-between items-center">
                            <div className="text-sm">
                              {showAnswers ? (
                                <span className={`font-medium ${
                                  selectedAnswer === 'human' ? 'text-green-600' : 'text-red-600'
                                }`}>
                                  {selectedAnswer === 'human' ? '✅ Doğru!' : '❌ Yanlış!'} 
                                  (İnsan cevabı: Cevap A)
                                </span>
                              ) : (
                                <span className="text-gray-600">
                                  Seçiminiz: Cevap {selectedAnswer === 'human' ? 'A' : 'B'}
                                </span>
                              )}
                            </div>
                            <button
                              onClick={getNextQuestion}
                              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                            >
                              Sonraki Soru
                            </button>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="text-center py-8 text-gray-500">
                        Soru yükleniyor...
                      </div>
                    )}
                  </div>
                )}

                {result && (
                  <div className="mt-6 p-3 bg-gray-50 rounded-md">
                    <pre className="text-sm text-gray-800 whitespace-pre-wrap">{result}</pre>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  )
}
