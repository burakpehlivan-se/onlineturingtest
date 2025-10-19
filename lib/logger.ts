const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  dim: '\x1b[2m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
}

export function logGameStart(nickname: string, difficulty: string, sessionId: string) {
  console.log(
    `\n${colors.bright}${colors.green}🎮 OYUN BAŞLATILDI${colors.reset}`,
    `\n  Kullanıcı: ${colors.cyan}${nickname}${colors.reset}`,
    `\n  Zorluk: ${colors.yellow}${difficulty.toUpperCase()}${colors.reset}`,
    `\n  Session ID: ${colors.magenta}${sessionId}${colors.reset}\n`
  )
}

export function logQuestionRequested(sessionId: string) {
  console.log(
    `${colors.bright}${colors.blue}📝 SORU İSTENDİ${colors.reset}`,
    `\n  Session: ${colors.magenta}${sessionId}${colors.reset}\n`
  )
}

export function logQuestionRetrieved(questionId: string, question: string, difficulty: string) {
  console.log(
    `${colors.bright}${colors.green}✓ SORU GETİRİLDİ${colors.reset}`,
    `\n  ID: ${colors.magenta}${questionId}${colors.reset}`,
    `\n  Zorluk: ${colors.yellow}${difficulty}${colors.reset}`,
    `\n  Soru: "${colors.cyan}${question.substring(0, 60)}..."${colors.reset}\n`
  )
}

export function logAnswerSubmitted(sessionId: string, choice: string, questionId: string) {
  console.log(
    `${colors.bright}${colors.blue}🎯 CEVAP GÖNDERİLDİ${colors.reset}`,
    `\n  Session: ${colors.magenta}${sessionId}${colors.reset}`,
    `\n  Seçim: ${colors.yellow}${choice}${colors.reset}`,
    `\n  Question ID: ${colors.magenta}${questionId}${colors.reset}\n`
  )
}

export function logAnswerResult(
  isCorrect: boolean,
  choice: string,
  correctAnswer: string,
  points: number,
  newScore: number,
  newLives: number
) {
  const resultColor = isCorrect ? colors.green : colors.red
  const resultText = isCorrect ? '✓ DOĞRU' : '✗ YANLIŞ'

  console.log(
    `${colors.bright}${resultColor}${resultText}${colors.reset}`,
    `\n  Seçim: ${colors.yellow}${choice}${colors.reset}`,
    `\n  Doğru Cevap: ${colors.yellow}${correctAnswer}${colors.reset}`,
    `\n  Kazanılan Puan: ${colors.green}+${points}${colors.reset}`,
    `\n  Toplam Puan: ${colors.cyan}${newScore}${colors.reset}`,
    `\n  Kalan Can: ${colors.red}${newLives}❤️${colors.reset}\n`
  )
}

export function logGameOver(nickname: string, finalScore: number) {
  console.log(
    `\n${colors.bright}${colors.red}🏁 OYUN BİTTİ${colors.reset}`,
    `\n  Oyuncu: ${colors.cyan}${nickname}${colors.reset}`,
    `\n  Final Skor: ${colors.bright}${colors.green}${finalScore}${colors.reset}\n`
  )
}

export function logQuestionsGenerated(count: number, totalQuestions: number) {
  console.log(
    `${colors.bright}${colors.green}📚 SORULAR OLUŞTURULDU${colors.reset}`,
    `\n  Yeni Sorular: ${colors.yellow}${count}${colors.reset}`,
    `\n  Toplam Soru: ${colors.cyan}${totalQuestions}${colors.reset}\n`
  )
}

export function logAICommand(difficulty: string, question: string) {
  const prompts: Record<string, string> = {
    easy: 'Net, bilgilendirici, listeleme yaparak ve resmi bir dille cevapla',
    medium: 'Bir uzmanın blog yazısı gibi cevapla. Anlaşılır, akıcı ve bilgilendirici ol',
    hard: 'Bir internet forumunda yazıyormuş gibi cevap ver. Samimi ol, biraz kişisel görüş katabilirsin',
  }

  console.log(
    `${colors.bright}${colors.magenta}🤖 AI KOMUTU${colors.reset}`,
    `\n  Zorluk: ${colors.yellow}${difficulty.toUpperCase()}${colors.reset}`,
    `\n  Soru: "${colors.cyan}${question}${colors.reset}"`,
    `\n  Talimat: "${colors.dim}${prompts[difficulty]}${colors.reset}"\n`
  )
}

export function logAPIRequest(method: string, endpoint: string, status: number, duration: number) {
  const statusColor = status >= 200 && status < 300 ? colors.green : colors.red
  console.log(
    `${colors.bright}${statusColor}${method} ${endpoint}${colors.reset}`,
    `→ ${statusColor}${status}${colors.reset}`,
    `(${colors.dim}${duration}ms${colors.reset})`
  )
}

export function logError(title: string, error: any) {
  console.error(
    `\n${colors.bright}${colors.red}❌ HATA: ${title}${colors.reset}`,
    `\n${colors.red}${error}${colors.reset}\n`
  )
}
