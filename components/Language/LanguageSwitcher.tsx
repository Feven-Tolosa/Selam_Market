'use client'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

import { Globe } from 'lucide-react'

export default function LanguageSwitcher() {
  const changeLanguage = (lang: string) => {
    localStorage.setItem('lang', lang)
    window.location.reload()
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger>
        <Globe size={20} />
      </DropdownMenuTrigger>

      <DropdownMenuContent align='end'>
        <DropdownMenuItem onClick={() => changeLanguage('en')}>
          English
        </DropdownMenuItem>

        <DropdownMenuItem onClick={() => changeLanguage('am')}>
          አማርኛ
        </DropdownMenuItem>

        <DropdownMenuItem onClick={() => changeLanguage('om')}>
          Afaan Oromo
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
