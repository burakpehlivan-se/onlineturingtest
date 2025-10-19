export default function AdminPanel() {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md mx-auto">
        <div className="bg-white rounded-lg shadow-md p-8 text-center">
          <div className="mb-6">
            <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
              <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
          
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            🔒 Admin Panel Devre Dışı
          </h1>
          
          <p className="text-gray-600 mb-6">
            Güvenlik nedeniyle online admin panel kapatılmıştır. 
            Tüm soru yönetimi işlemleri artık yerel admin paneli üzerinden yapılmaktadır.
          </p>
          
          <div className="bg-blue-50 border border-blue-200 rounded-md p-4 mb-6">
            <h3 className="font-medium text-blue-800 mb-2">Yerel Admin Panel</h3>
            <p className="text-sm text-blue-700">
              Soru ekleme, düzenleme ve yönetim işlemleri için yerel bilgisayarınızda 
              <code className="bg-blue-100 px-1 rounded">local-admin.html</code> dosyasını kullanın.
            </p>
          </div>
          
          <a 
            href="/"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
          >
            Ana Sayfaya Dön
          </a>
        </div>
      </div>
    </div>
  )
}
