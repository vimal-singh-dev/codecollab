import { ChevronDown, Code, Hash, Terminal } from 'lucide-react'

const languages = [
    { id: 'javascript', name: 'JavaScript', icon: Code },
    { id: 'typescript', name: 'TypeScript', icon: Code },
    { id: 'python', name: 'Python', icon: Hash },
    { id: 'java', name: 'Java', icon: Code },
    { id: 'cpp', name: 'C++', icon: Code },
    { id: 'css', name: 'CSS', icon: Hash },
    { id: 'html', name: 'HTML', icon: Code },
]

interface LanguageSelectorProps {
    selected: string
    onSelect: (language: string) => void
}

export default function LanguageSelector({ selected, onSelect }: LanguageSelectorProps) {
    // Find selected icon
    const SelectedIcon = languages.find(l => l.id === selected)?.icon || Terminal

    return (
        <div className="relative group">
            <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none text-blue-400">
                <SelectedIcon className="w-4 h-4" />
            </div>
            <select
                value={selected}
                onChange={(e) => onSelect(e.target.value)}
                className="appearance-none bg-gray-800 hover:bg-gray-700 border border-gray-700 text-gray-200 rounded-lg pl-10 pr-10 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all cursor-pointer font-medium min-w-[140px]"
            >
                {languages.map((lang) => (
                    <option key={lang.id} value={lang.id} className="bg-gray-800 py-1">
                        {lang.name}
                    </option>
                ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none group-hover:text-gray-300 transition-colors" />
        </div>
    )
}
