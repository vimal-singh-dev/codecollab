import { ChevronDown, Code, Hash, Terminal } from 'lucide-react'

const languages = [
    { id: 'javascript', name: 'JavaScript', ext: 'JS' },
    { id: 'typescript', name: 'TypeScript', ext: 'TS' },
    { id: 'python', name: 'Python', ext: 'PY' },
    { id: 'java', name: 'Java', ext: 'JAVA' },
    { id: 'cpp', name: 'C++', ext: 'C++' },
    { id: 'c', name: 'C', ext: 'C' },
    { id: 'css', name: 'CSS', ext: 'CSS' },
    { id: 'html', name: 'HTML', ext: 'HTML' },
]

interface LanguageSelectorProps {
    selected: string
    onSelect: (language: string) => void
}

export default function LanguageSelector({ selected, onSelect }: LanguageSelectorProps) {
    const selectedLang = languages.find(l => l.id === selected) || languages[0]

    return (
        <select
            value={selected}
            onChange={(e) => onSelect(e.target.value)}
            className="bg-transparent text-white text-xs font-mono font-semibold cursor-pointer focus:outline-none hover:bg-white/10 px-1 rounded appearance-none pr-4"
            style={{ backgroundImage: 'none' }}
        >
            {languages.map((lang) => (
                <option key={lang.id} value={lang.id} className="bg-[#1e1e1e] text-white">
                    {lang.name}
                </option>
            ))}
        </select>
    )
}
