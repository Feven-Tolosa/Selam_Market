'use client'

import { useState } from 'react'

export default function LanguageSwitcher() {
  const [lang, setLang] = useState('en')

  const changeLang = (language: string) => {
    setLang(language)
    localStorage.setItem('lang', language)
    window.location.reload()
  }

  return (
    <div className='flex gap-2'>
      <button onClick={() => changeLang('en')}>EN</button>
      <button onClick={() => changeLang('am')}>አማ</button>
      <button onClick={() => changeLang('om')}>OM</button>
    </div>
  )
}
