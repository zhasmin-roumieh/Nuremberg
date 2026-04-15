import { Search } from 'lucide-react'

const CATEGORIES = [
  { id: 'food',     label: 'Food & Drink', emoji: '🍽️' },
  { id: 'tourist',  label: 'Attractions',  emoji: '🏛️' },
  { id: 'history',  label: 'History',      emoji: '⚔️' },
  { id: 'shopping', label: 'Shopping',     emoji: '🛍️' },
]

const SUBTYPES = {
  food: [
    { id: 'all',        label: 'All'         },
    { id: 'cafe',       label: 'Café'        },
    { id: 'restaurant', label: 'Restaurant'  },
    { id: 'bar',        label: 'Bar'         },
    { id: 'bakery',     label: 'Bakery'      },
    { id: 'icecream',   label: 'Ice Cream'   },
    { id: 'fastfood',   label: 'Fast Food'   },
  ],
  tourist: [
    { id: 'all',        label: 'All'         },
    { id: 'museum',     label: 'Museum'      },
    { id: 'attraction', label: 'Attraction'  },
    { id: 'viewpoint',  label: 'Viewpoint'   },
    { id: 'gallery',    label: 'Gallery'     },
    { id: 'zoo',        label: 'Zoo'         },
    { id: 'theme_park', label: 'Theme Park'  },
  ],
  history: [
    { id: 'all',        label: 'All'         },
    { id: 'castle',     label: 'Castle'      },
    { id: 'church',     label: 'Church'      },
    { id: 'monument',   label: 'Monument'    },
    { id: 'memorial',   label: 'Memorial'    },
    { id: 'ruins',      label: 'Ruins'       },
    { id: 'building',   label: 'Historic Building' },
  ],
  shopping: [
    { id: 'all',        label: 'All'         },
    { id: 'market',     label: 'Market'      },
    { id: 'mall',       label: 'Shopping Mall' },
    { id: 'boutique',   label: 'Clothes'     },
    { id: 'souvenir',   label: 'Souvenirs'   },
    { id: 'books',      label: 'Books'       },
    { id: 'department', label: 'Department Store' },
  ],
}

const DISTANCES = [
  { value: 300,  label: '300m' },
  { value: 500,  label: '500m' },
  { value: 1000, label: '1 km' },
  { value: 2000, label: '2 km' },
  { value: 5000, label: '5 km' },
]

const BUDGETS = [
  { id: 'any', label: 'Any' },
  { id: '€',   label: '€ Budget' },
  { id: '€€',  label: '€€ Mid-range' },
  { id: '€€€', label: '€€€ Upscale' },
]

const ENTRIES = [
  { id: 'any',  label: 'Any' },
  { id: 'free', label: 'Free Entry' },
  { id: 'paid', label: 'Paid Entry' },
]

export default function FilterPanel({ filters, setFilters, onSearch, loading }) {
  const set = (key, val) => setFilters(f => ({ ...f, [key]: val }))

  return (
    <div className="p-4 space-y-5">
      {/* Category */}
      <Section label="What are you looking for?">
        <div className="grid grid-cols-2 gap-2">
          {CATEGORIES.map(cat => (
            <button
              key={cat.id}
              onClick={() => set('category', cat.id)}
              className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border-2 text-sm font-medium transition-all
                ${filters.category === cat.id
                  ? 'border-primary-500 bg-primary-50 text-primary-700'
                  : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
                }`}
            >
              <span className="text-lg">{cat.emoji}</span>
              {cat.label}
            </button>
          ))}
        </div>
      </Section>

      {/* Sub-type */}
      <Section label="Type">
        <div className="flex flex-wrap gap-2">
          {(SUBTYPES[filters.category] || []).map(s => (
            <Chip
              key={s.id}
              active={filters.subtype === s.id}
              onClick={() => set('subtype', s.id)}
            >
              {s.label}
            </Chip>
          ))}
        </div>
      </Section>

      {/* Distance */}
      <Section label="Distance from you">
        <div className="flex gap-2 flex-wrap">
          {DISTANCES.map(d => (
            <Chip
              key={d.value}
              active={filters.distance === d.value}
              onClick={() => set('distance', d.value)}
            >
              {d.label}
            </Chip>
          ))}
        </div>
      </Section>

      {/* Food extras */}
      {filters.category === 'food' && (
        <Section label="Budget">
          <div className="flex gap-2 flex-wrap">
            {BUDGETS.map(b => (
              <Chip
                key={b.id}
                active={filters.budget === b.id}
                onClick={() => set('budget', b.id)}
              >
                {b.label}
              </Chip>
            ))}
          </div>
        </Section>
      )}

      {/* Tourist / History entry */}
      {(filters.category === 'tourist' || filters.category === 'history') && (
        <Section label="Entry">
          <div className="flex gap-2 flex-wrap">
            {ENTRIES.map(e => (
              <Chip
                key={e.id}
                active={filters.entry === e.id}
                onClick={() => set('entry', e.id)}
              >
                {e.label}
              </Chip>
            ))}
          </div>
        </Section>
      )}

      {/* Search button */}
      <button
        onClick={() => onSearch()}
        disabled={loading}
        className="w-full flex items-center justify-center gap-2 py-3.5 bg-primary-500 hover:bg-primary-600
          text-white font-semibold rounded-xl shadow-md transition-colors disabled:opacity-60"
      >
        {loading ? (
          <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
        ) : (
          <Search size={18} />
        )}
        {loading ? 'Searching…' : 'Find Places'}
      </button>
    </div>
  )
}

function Section({ label, children }) {
  return (
    <div className="space-y-2">
      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">{label}</p>
      {children}
    </div>
  )
}

function Chip({ active, onClick, children }) {
  return (
    <button
      onClick={onClick}
      className={`px-3 py-1.5 rounded-full text-sm font-medium border transition-all
        ${active
          ? 'bg-primary-500 border-primary-500 text-white'
          : 'bg-white border-gray-200 text-gray-600 hover:border-gray-400'
        }`}
    >
      {children}
    </button>
  )
}
