export default function AgeGate({ onAccept, lang, onLangChange }) {
  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <div className="bg-zinc-900 border border-zinc-700 rounded-2xl max-w-md w-full p-8 text-center shadow-2xl">
        <div className="text-2xl font-bold mb-2">Seducecraft <span className="bg-orange-500 text-white px-2 py-0.5 rounded text-sm">AI</span></div>
        <h2 className="text-xl font-semibold mt-6 mb-3">{lang === 'ru' ? 'Этот сайт только для взрослых' : 'This site is for adults only'}</h2>
        <p className="text-sm text-zinc-400 mb-6 leading-relaxed">
          {lang === 'ru' 
            ? 'Входя на сайт, вы подтверждаете, что вам 18 лет или больше. Используя сайт, вы соглашаетесь с Условиями использования и Политикой конфиденциальности.'
            : 'By entering this website, you confirm that you are 18 years old or over. By using the site, you agree to our Terms of Service and Privacy Policy.'}
        </p>
        <div className="flex gap-3 justify-center mb-6">
          <button onClick={onAccept} className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-lg text-sm font-medium">{lang === 'ru' ? 'Мне 18 лет' : "I'm 18 years old"}</button>
          <button onClick={() => window.location.href = 'https://google.com'} className="border border-zinc-600 text-zinc-300 px-6 py-3 rounded-lg text-sm font-medium hover:border-zinc-500">{lang === 'ru' ? 'Мне нет 18' : "I'm underage"}</button>
        </div>
        <div className="flex justify-center gap-4">
          <button onClick={() => onLangChange?.('en')} className={`rounded overflow-hidden ${lang === 'en' ? 'ring-2 ring-orange-500' : 'opacity-60 hover:opacity-100'}`}>
            <img src="https://flagcdn.com/w40/us.png" alt="EN" className="w-8 h-6" />
          </button>
          <button onClick={() => onLangChange?.('ru')} className={`rounded overflow-hidden ${lang === 'ru' ? 'ring-2 ring-orange-500' : 'opacity-60 hover:opacity-100'}`}>
            <img src="https://flagcdn.com/w40/ru.png" alt="RU" className="w-8 h-6" />
          </button>
        </div>
      </div>
    </div>
  );
}
