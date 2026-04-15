import { Search, X } from 'lucide-react'

const CATEGORIES = [
  { id: 'food',     label: 'Food & Drink', emoji: '🍽️' },
  { id: 'tourist',  label: 'Attractions',  emoji: '🏛️' },
  { id: 'history',  label: 'History',      emoji: '⚔️' },
  { id: 'shopping', label: 'Shopping',     emoji: '🛍️' },
]

const SUBTYPES = {
  food: [
    { id: 'all',        label: 'All'       },
    { id: 'cafe',       label: 'Café'      },
    { id: 'restaurant', label: 'Restaurant'},
    { id: 'bar',        label: 'Bar'       },
    { id: 'bakery',     label: 'Bakery'    },
    { id: 'icecream',   label: 'Ice Cream' },
    { id: 'fastfood',   label: 'Fast Food' },
  ],
  tourist: [
    { id: 'all',        label: 'All'        },
    { id: 'museum',     label: 'Museum'     },
    { id: 'attraction', label: 'Attraction' },
    { id: 'viewpoint',  label: 'Viewpoint'  },
    { id: 'gallery',    label: 'Gallery'    },
    { id: 'zoo',        label: 'Zoo'        },
    { id: 'theme_park', label: 'Theme Park' },
  ],
  history: [
    { id: 'all',      label: 'All'              },
    { id: 'castle',   label: 'Castle'           },
    { id: 'church',   label: 'Church'           },
    { id: 'monument', label: 'Monument'         },
    { id: 'memorial', label: 'Memorial'         },
    { id: 'ruins',    label: 'Ruins'            },
    { id: 'building', label: 'Historic Building'},
  ],
  shopping: [
    { id: 'all',        label: 'All'              },
    { id: 'market',     label: 'Market'           },
    { id: 'mall',       label: 'Shopping Mall'    },
    { id: 'boutique',   label: 'Clothes'          },
    { id: 'souvenir',   label: 'Souvenirs'        },
    { id: 'books',      label: 'Books'            },
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

const CUISINES = [
  { id: 'any',           label: 'Any cuisine'       },
  { id: 'german',        label: '🥨 German'          },
  { id: 'bavarian',      label: '🍺 Bavarian'        },
  { id: 'italian',       label: '🍕 Italian'         },
  { id: 'pizza',         label: '🍕 Pizza'           },
  { id: 'turkish',       label: '🫙 Turkish'         },
  { id: 'kebab',         label: '🥙 Kebab'           },
  { id: 'asian',         label: '🍜 Asian'           },
  { id: 'chinese',       label: '🥡 Chinese'         },
  { id: 'japanese',      label: '🍱 Japanese'        },
  { id: 'sushi',         label: '🍣 Sushi'           },
  { id: 'thai',          label: '🌶️ Thai'            },
  { id: 'vietnamese',    label: '🍲 Vietnamese'      },
  { id: 'indian',        label: '🍛 Indian'          },
  { id: 'mexican',       label: '🌮 Mexican'         },
  { id: 'mediterranean', label: '🫒 Mediterranean'   },
  { id: 'greek',         label: '🫒 Greek'           },
  { id: 'american',      label: '🍔 American'        },
  { id: 'burger',        label: '🍔 Burger'          },
  { id: 'steak_house',   label: '🥩 Steak House'     },
  { id: 'fish_and_chips',label: '🐟 Fish & Chips'    },
  { id: 'coffee',        label: '☕ Coffee'          },
  { id: 'cake',          label: '🎂 Cake & Pastry'   },
  { id: 'ice_cream',     label: '🍦 Ice Cream'       },
  { id: 'vegan',         label: '🌱 Vegan'           },
  { id: 'vegetarian',    label: '🥗 Vegetarian'      },
  { id: 'breakfast',     label: '🍳 Breakfast'       },
  { id: 'sandwich',      label: '🥪 Sandwich'        },
  { id: 'chinese;japanese', label: '🍜 Pan-Asian'   },
]

const DIETARY = [
  { id: 'any',        label: 'No filter'    },
  { id: 'vegetarian', label: '🥗 Vegetarian' },
  { id: 'vegan',      label: '🌱 Vegan'      },
  { id: 'halal',      label: '☪️ Halal'      },
]

const BUDGETS = [
  { id: 'any', label: 'Any'         },
  { id: '€',   label: '€ Budget'    },
  { id: '€€',  label: '€€ Mid'      },
  { id: '€€€', label: '€€€ Upscale' },
]

const ENTRIES = [
  { id: 'any',  label: 'Any'        },
  { id: 'free', label: 'Free Entry' },
  { id: 'paid', label: 'Paid Entry' },
]

export default function FilterPanel({ filters, setFilters, onSearch, loading }) {
  const set = (key, val) => setFilters(f => ({ ...f, [key]: val }))

  const isFood = filters.category === 'food'

  return (
    <div className="p-4 space-y-5">

      {/* ── Keyword search ─────────────────────────────────── */}
      <Section label="Describe what you want">
        <div className="relative">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={filters.keyword}
            onChange={e => set('keyword', e.target.value)}
            placeholder={isFood ? 'e.g. cosy café, rooftop bar, schnitzel…' : 'e.g. WW2 history, free museum…'}
            className="w-full pl-9 pr-8 py-2.5 text-sm border border-gray-200 rounded-xl bg-gray-50
              focus:outline-none focus:ring-2 focus:ring-primary-300 focus:border-primary-400"
          />
          {filters.keyword && (
            <button
              onClick={() => set('keyword', '')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <X size={14} />
            </button>
          )}
        </div>
      </Section>

      {/* ── Category ───────────────────────────────────────── */}
      <Section label="Category">
        <div className="grid grid-cols-2 gap-2">
          {CATEGORIES.map(cat => (
            <button
              key={cat.id}
              onClick={() => setFilters(f => ({
                ...f,
                category: cat.id,
                subtype: 'all',
                cuisine: 'any',
                dietary: 'any',
              }))}
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

      {/* ── Sub-type ───────────────────────────────────────── */}
      <Section label="Type">
        <div className="flex flex-wrap gap-2">
          {(SUBTYPES[filters.category] || []).map(s => (
            <Chip key={s.id} active={filters.subtype === s.id} onClick={() => set('subtype', s.id)}>
              {s.label}
            </Chip>
          ))}
        </div>
      </Section>

      {/* ── Cuisine (food only) ────────────────────────────── */}
      {isFood && (
        <Section label="Cuisine">
          <select
            value={filters.cuisine}
            onChange={e => set('cuisine', e.target.value)}
            className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl bg-gray-50
              focus:outline-none focus:ring-2 focus:ring-primary-300 focus:border-primary-400"
          >
            {CUISINES.map(c => (
              <option key={c.id} value={c.id}>{c.label}</option>
            ))}
          </select>
        </Section>
      )}

      {/* ── Dietary preference (food only) ────────────────── */}
      {isFood && (
        <Section label="Dietary preference">
          <div className="flex flex-wrap gap-2">
            {DIETARY.map(d => (
              <Chip key={d.id} active={filters.dietary === d.id} onClick={() => set('dietary', d.id)}>
                {d.label}
              </Chip>
            ))}
          </div>
        </Section>
      )}

      {/* ── Budget (food only) ────────────────────────────── */}
      {isFood && (
        <Section label="Budget">
          <div className="flex gap-2 flex-wrap">
            {BUDGETS.map(b => (
              <Chip key={b.id} active={filters.budget === b.id} onClick={() => set('budget', b.id)}>
                {b.label}
              </Chip>
            ))}
          </div>
        </Section>
      )}

      {/* ── Entry (tourist / history) ─────────────────────── */}
      {(filters.category === 'tourist' || filters.category === 'history') && (
        <Section label="Entry">
          <div className="flex gap-2 flex-wrap">
            {ENTRIES.map(e => (
              <Chip key={e.id} active={filters.entry === e.id} onClick={() => set('entry', e.id)}>
                {e.label}
              </Chip>
            ))}
          </div>
        </Section>
      )}

      {/* ── Distance ──────────────────────────────────────── */}
      <Section label="Distance from you">
        <div className="flex gap-2 flex-wrap">
          {DISTANCES.map(d => (
            <Chip key={d.value} active={filters.distance === d.value} onClick={() => set('distance', d.value)}>
              {d.label}
            </Chip>
          ))}
        </div>
      </Section>

      {/* ── Search button ─────────────────────────────────── */}
      <button
        onClick={() => onSearch()}
        disabled={loading}
        className="w-full flex items-center justify-center gap-2 py-3.5 bg-primary-500 hover:bg-primary-600
          text-white font-semibold rounded-xl shadow-md transition-colors disabled:opacity-60"
      >
        {loading
          ? <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
          : <Search size={18} />
        }
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
