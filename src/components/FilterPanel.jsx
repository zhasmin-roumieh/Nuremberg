import { Search, X } from 'lucide-react'

const CATEGORIES = [
  { id: 'food',     label: 'Food & Drink', emoji: '🍽️' },
  { id: 'tourist',  label: 'Attractions',  emoji: '🏛️' },
  { id: 'history',  label: 'History',      emoji: '⚔️' },
  { id: 'shopping', label: 'Shopping',     emoji: '🛍️' },
]

const SUBTYPES = {
  food:     [{ id:'all',label:'All'},{ id:'cafe',label:'Café'},{ id:'restaurant',label:'Restaurant'},{ id:'bar',label:'Bar'},{ id:'bakery',label:'Bakery'},{ id:'icecream',label:'Ice Cream'},{ id:'fastfood',label:'Fast Food'}],
  tourist:  [{ id:'all',label:'All'},{ id:'museum',label:'Museum'},{ id:'attraction',label:'Attraction'},{ id:'viewpoint',label:'Viewpoint'},{ id:'gallery',label:'Gallery'},{ id:'zoo',label:'Zoo'},{ id:'theme_park',label:'Theme Park'}],
  history:  [{ id:'all',label:'All'},{ id:'castle',label:'Castle'},{ id:'church',label:'Church'},{ id:'monument',label:'Monument'},{ id:'memorial',label:'Memorial'},{ id:'ruins',label:'Ruins'},{ id:'building',label:'Historic Building'}],
  shopping: [{ id:'all',label:'All'},{ id:'market',label:'Market'},{ id:'mall',label:'Mall'},{ id:'boutique',label:'Clothes'},{ id:'souvenir',label:'Souvenirs'},{ id:'books',label:'Books'},{ id:'department',label:'Dept. Store'}],
}

const CUISINES = [
  { id:'any',label:'Any cuisine' },
  { id:'german',label:'🥨 German' },
  { id:'bavarian',label:'🍺 Bavarian' },
  { id:'italian',label:'🍕 Italian' },
  { id:'pizza',label:'🍕 Pizza' },
  { id:'turkish',label:'🫙 Turkish' },
  { id:'kebab',label:'🥙 Kebab' },
  { id:'asian',label:'🍜 Asian' },
  { id:'chinese',label:'🥡 Chinese' },
  { id:'japanese',label:'🍱 Japanese' },
  { id:'sushi',label:'🍣 Sushi' },
  { id:'thai',label:'🌶️ Thai' },
  { id:'vietnamese',label:'🍲 Vietnamese' },
  { id:'indian',label:'🍛 Indian' },
  { id:'mexican',label:'🌮 Mexican' },
  { id:'mediterranean',label:'🫒 Mediterranean' },
  { id:'greek',label:'🫒 Greek' },
  { id:'american',label:'🍔 American' },
  { id:'burger',label:'🍔 Burger' },
  { id:'steak_house',label:'🥩 Steak House' },
  { id:'coffee',label:'☕ Coffee' },
  { id:'cake',label:'🎂 Cake & Pastry' },
  { id:'ice_cream',label:'🍦 Ice Cream' },
  { id:'vegan',label:'🌱 Vegan' },
  { id:'vegetarian',label:'🥗 Vegetarian' },
  { id:'breakfast',label:'🍳 Breakfast' },
  { id:'sandwich',label:'🥪 Sandwich' },
]

const DIETARY  = [{ id:'any',label:'Any'},{ id:'vegetarian',label:'🥗 Vegetarian'},{ id:'vegan',label:'🌱 Vegan'},{ id:'halal',label:'☪️ Halal'}]
const BUDGETS  = [{ id:'any',label:'Any'},{ id:'€',label:'€'},{ id:'€€',label:'€€'},{ id:'€€€',label:'€€€'}]
const ENTRIES  = [{ id:'any',label:'Any'},{ id:'free',label:'Free'},{ id:'paid',label:'Paid'}]
const DISTANCES= [{ value:300,label:'300m'},{ value:500,label:'500m'},{ value:1000,label:'1 km'},{ value:2000,label:'2 km'},{ value:5000,label:'5 km'}]

export default function FilterPanel({ filters, setFilters, onSearch, loading }) {
  const set = (k, v) => setFilters(f => ({ ...f, [k]: v }))
  const isFood = filters.category === 'food'

  return (
    <div className="px-4 py-4 space-y-5">

      {/* Keyword */}
      <div className="relative">
        <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
        <input
          type="text"
          value={filters.keyword}
          onChange={e => set('keyword', e.target.value)}
          onKeyDown={e => e.key === 'Enter' && onSearch()}
          placeholder={isFood ? 'e.g. cosy café, schnitzel, rooftop bar…' : 'e.g. free museum, WWII history…'}
          className="w-full pl-9 pr-8 py-3 text-sm bg-gray-50 border border-gray-200 rounded-xl
            focus:outline-none focus:ring-2 focus:ring-primary-200 focus:border-primary-400 focus:bg-white transition-all"
        />
        {filters.keyword && (
          <button onClick={() => set('keyword', '')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
            <X size={14} />
          </button>
        )}
      </div>

      {/* Category */}
      <div className="grid grid-cols-2 gap-2">
        {CATEGORIES.map(cat => (
          <button key={cat.id}
            onClick={() => setFilters(f => ({ ...f, category: cat.id, subtype:'all', cuisine:'any', dietary:'any' }))}
            className={`flex items-center gap-2.5 px-3.5 py-3 rounded-2xl border-2 text-sm font-medium transition-all
              ${filters.category === cat.id
                ? 'border-primary-500 bg-primary-50 text-primary-700'
                : 'border-gray-100 bg-white text-gray-700 hover:border-gray-200 shadow-sm'}`}>
            <span className="text-xl">{cat.emoji}</span>
            <span className="leading-tight">{cat.label}</span>
          </button>
        ))}
      </div>

      {/* Sub-type */}
      <Field label="Type">
        <ChipRow items={SUBTYPES[filters.category] || []} value={filters.subtype}
          onSelect={v => set('subtype', v)} />
      </Field>

      {/* Cuisine */}
      {isFood && (
        <Field label="Cuisine">
          <select value={filters.cuisine} onChange={e => set('cuisine', e.target.value)}
            className="w-full px-3.5 py-2.5 text-sm bg-gray-50 border border-gray-200 rounded-xl
              focus:outline-none focus:ring-2 focus:ring-primary-200 focus:border-primary-400 focus:bg-white">
            {CUISINES.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
          </select>
        </Field>
      )}

      {/* Dietary */}
      {isFood && (
        <Field label="Dietary">
          <ChipRow items={DIETARY} value={filters.dietary} onSelect={v => set('dietary', v)} />
        </Field>
      )}

      {/* Budget */}
      {isFood && (
        <Field label="Budget">
          <ChipRow items={BUDGETS} value={filters.budget} onSelect={v => set('budget', v)} />
        </Field>
      )}

      {/* Entry */}
      {(filters.category === 'tourist' || filters.category === 'history') && (
        <Field label="Entry">
          <ChipRow items={ENTRIES} value={filters.entry} onSelect={v => set('entry', v)} />
        </Field>
      )}

      {/* Distance */}
      <Field label="Distance">
        <ChipRow items={DISTANCES.map(d => ({ id: d.value, label: d.label }))}
          value={filters.distance} onSelect={v => set('distance', v)} />
      </Field>

      {/* Search */}
      <button onClick={() => onSearch()} disabled={loading}
        className="w-full flex items-center justify-center gap-2 py-3.5 bg-primary-500 hover:bg-primary-600
          active:bg-primary-700 text-white font-semibold rounded-2xl shadow-md transition-all
          disabled:opacity-60 disabled:cursor-not-allowed">
        {loading
          ? <span className="w-5 h-5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
          : <Search size={17} />}
        {loading ? 'Searching…' : 'Find Places'}
      </button>
    </div>
  )
}

function Field({ label, children }) {
  return (
    <div className="space-y-2">
      <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">{label}</p>
      {children}
    </div>
  )
}

function ChipRow({ items, value, onSelect }) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {items.map(item => (
        <button key={item.id} onClick={() => onSelect(item.id)}
          className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all border
            ${String(value) === String(item.id)
              ? 'bg-primary-500 border-primary-500 text-white shadow-sm'
              : 'bg-white border-gray-200 text-gray-600 hover:border-gray-300'}`}>
          {item.label}
        </button>
      ))}
    </div>
  )
}
