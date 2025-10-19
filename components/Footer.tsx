export default function Footer() {
  return (
    <footer className="bg-slate-900 border-t border-slate-800 py-6 mt-12">
      <div className="max-w-6xl mx-auto px-4 text-center text-sm text-gray-500">
        <p className="mb-2">© 2025 İnsan Avcısı - Online Turing Test</p>
        <a
          href="https://www.netlify.com"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 hover:text-gray-400 transition-colors"
        >
          <img
            src="https://www.netlify.com/v3/img/components/netlify-color-accent.svg"
            alt="Deploys by Netlify"
            className="h-4"
          />
        </a>
      </div>
    </footer>
  )
}
