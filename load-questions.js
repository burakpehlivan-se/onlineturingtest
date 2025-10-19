const fs = require('fs');
const path = require('path');

// Soru havuzunu oku
const questionsPath = path.join(__dirname, '.questions-pool.json');
const questions = JSON.parse(fs.readFileSync(questionsPath, 'utf8'));

console.log('Soru havuzu yüklendi:', questions.length, 'soru');

// HTML dosyası oluştur
const htmlContent = `
<!DOCTYPE html>
<html>
<head>
    <title>Soru Yükleme</title>
</head>
<body>
    <h1>Soru Havuzu Yükleniyor...</h1>
    <script>
        const questions = ${JSON.stringify(questions, null, 2)};
        localStorage.setItem('turingTestQuestions', JSON.stringify(questions));
        console.log('✅', questions.length, 'soru localStorage\'a kaydedildi!');
        
        // 2 saniye sonra local-admin.html'e yönlendir
        setTimeout(() => {
            window.location.href = 'local-admin.html';
        }, 2000);
    </script>
</body>
</html>
`;

fs.writeFileSync(path.join(__dirname, 'load-questions.html'), htmlContent);
console.log('✅ load-questions.html oluşturuldu!');
console.log('Tarayıcıda açın: http://localhost:8080/load-questions.html');
