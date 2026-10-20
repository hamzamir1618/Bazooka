// SAMPLE DATA: names, descriptions, prices and allergens are placeholders. Confirm with the kitchen before launch.

export type Kind = 'wrap' | 'platter' | 'side' | 'drink';
export type Ink = 'vermilion' | 'cobalt' | 'pistachio' | 'ochre' | 'nile';

export interface Item {
  id: string;
  kind: Kind;
  name: string;
  /** Full Arabic name, set in Reem Kufi. */
  ar: string;
  /** One-line hook for cards. */
  hook: string;
  desc: string;
  price: number;
  img: string;
  ink: Ink;
  /** 0 (none) to 3 (napalm). */
  heat: number;
  /** What's inside, outermost first. Wraps only. */
  inside?: string[];
  serves?: number;
  allergens: string[];
  /** Ids of items that go well with this one. */
  pairs: string[];
}

const art = (name: string) => `/assets/${name}.webp`;

export const ITEMS: Item[] = [
  {
    id: 'original', kind: 'wrap', name: 'El-Bazooka Original', ar: 'صاروخ بازوكا الأصلي',
    hook: 'The one that started it.',
    desc: 'Charcoal-carved beef and chicken thigh, triple-whipped toum, beet-brined torshi and sumac fries, rolled tight in saj and seared in foil.',
    price: 850, img: art('saroukh-hero'), ink: 'vermilion', heat: 1,
    inside: ['Seared saj crust', 'Whipped toum ring', 'Spit-carved beef & thigh', 'Torshi turnip core', 'Sumac potato heart'],
    allergens: ['Gluten', 'Sesame'], pairs: ['torshi', 'jallab', 'fries'],
  },
  {
    id: 'shatta', kind: 'wrap', name: 'Shatta Napalm', ar: 'شطة نابالم حار',
    hook: 'Aleppo chilli, no mercy.',
    desc: 'Crushed red Aleppo shatta, blistered green chillies, charred onions and a roasted-garlic emulsion. Order a jallab with it.',
    price: 950, img: art('saroukh-shatta'), ink: 'cobalt', heat: 3,
    inside: ['Seared saj crust', 'Red shatta smear', 'Spit-carved chicken thigh', 'Blistered green chilli', 'Charred onion'],
    allergens: ['Gluten', 'Sesame'], pairs: ['jallab', 'toum', 'torshi'],
  },
  {
    id: 'lamb', kind: 'wrap', name: 'Dibs & Caramelised Lamb', ar: 'دبس رمان وغنم',
    hook: 'Slow lamb, sticky pomegranate.',
    desc: 'Slow-rendered lamb shoulder, pomegranate-molasses glaze, toasted pine nuts, parsley-onion biwaz and tahini.',
    price: 1150, img: art('saroukh-lamb'), ink: 'pistachio', heat: 1,
    inside: ['Seared saj crust', 'Tahini', 'Spit-rendered lamb shoulder', 'Pomegranate dibs', 'Pine nuts & biwaz'],
    allergens: ['Gluten', 'Sesame', 'Tree nuts'], pairs: ['torshi', 'jallab', 'shatta-oil'],
  },
  {
    id: 'toum-overdose', kind: 'wrap', name: 'Toum Overdose', ar: 'ثوم مضاعف بالهاون',
    hook: 'Garlic, then more garlic.',
    desc: 'A double-whipped brass-mortar garlic cloud, sumac potato batons, seared chicken and parsley.',
    price: 900, img: art('saroukh-toum'), ink: 'ochre', heat: 0,
    inside: ['Seared saj crust', 'Double toum cloud', 'Seared chicken', 'Sumac potato batons', 'Parsley'],
    allergens: ['Gluten'], pairs: ['fries', 'torshi', 'jallab'],
  },
  {
    id: 'box', kind: 'platter', name: 'Box El-Shilla Arabi', ar: 'بوكس الشلة عربي',
    hook: 'For the whole gang. شلة means crew.',
    desc: 'Eight butter-seared saj shawarma bites, spiced fries, pickled turnip spears and twin dipping cups of toum and shatta.',
    price: 1450, img: art('arabi-box'), ink: 'nile', heat: 1, serves: 2,
    allergens: ['Gluten', 'Sesame'], pairs: ['jallab', 'torshi', 'toum'],
  },
  {
    id: 'toum', kind: 'side', name: 'Whipped Brass Toum', ar: 'ثوم بالهاون',
    hook: 'Garlic artillery.',
    desc: 'Our garlic sauce, whipped by hand in a brass mortar until it stands up on its own.',
    price: 150, img: art('toum-mortar'), ink: 'vermilion', heat: 0, allergens: [], pairs: ['original', 'fries'],
  },
  {
    id: 'shatta-oil', kind: 'side', name: 'Fermented Aleppo Shatta', ar: 'شطة حلبية',
    hook: 'The fire starter.',
    desc: 'Crushed red chilli, fermented for a week and loosened with olive oil.',
    price: 150, img: art('chilli-splash'), ink: 'cobalt', heat: 3, allergens: [], pairs: ['original', 'lamb'],
  },
  {
    id: 'torshi', kind: 'side', name: 'Beet-Brined Torshi', ar: 'طرشي لفت',
    hook: 'Acid & crunch.',
    desc: 'Turnips pickled pink in beet brine with green chilli and garlic.',
    price: 200, img: art('pickle-jar'), ink: 'pistachio', heat: 1, allergens: [], pairs: ['original', 'box'],
  },
  {
    id: 'fries', kind: 'side', name: 'Sumac Fries', ar: 'بطاطا بالسماق',
    hook: 'Ruby-dusted batons.',
    desc: 'Thick-cut fries tossed in sumac and salt, with a cup of toum.',
    price: 300, img: art('garnish-1'), ink: 'ochre', heat: 0, allergens: [], pairs: ['toum-overdose', 'toum'],
  },
  {
    id: 'jallab', kind: 'drink', name: 'Iced Ruby Jallab', ar: 'جلاب بيروت',
    hook: 'The street elixir.',
    desc: 'Date and grape molasses with rose water over crushed ice, topped with toasted pine nuts and raisins.',
    price: 450, img: art('jallab-glass'), ink: 'nile', heat: 0, allergens: ['Tree nuts'], pairs: ['shatta', 'original'],
  },
];

export const FEATURES = ITEMS.filter(i => i.kind === 'wrap' || i.kind === 'platter');
export const SIDES = ITEMS.filter(i => i.kind === 'side' || i.kind === 'drink');
export const itemById = (id?: string) => ITEMS.find(i => i.id === id);

export const rupees = (n: number) => `Rs ${n.toLocaleString('en-US')}`;

/** The tray the night-window receipt on the home page orders. */
export const NIGHT_TRAY = ['original', 'box', 'jallab', 'toum', 'torshi'];
