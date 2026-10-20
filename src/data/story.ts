// PLACEHOLDER COPY: the brand story (including "since 1968") is invented for the design. Replace with the real one.

export interface Chapter { no: string; kicker: string; title: string; ar: string; text: string; img: string; quote?: string }

export const CHAPTERS: Chapter[] = [
  {
    no: '01', kicker: '1968 · CAIRO', title: 'Born under the marquee', ar: 'تحت الأضواء',
    text: 'The first Bazooka was rolled in a tin kiosk beside a downtown cinema. The late show let out at one in the morning, the crowd was hungry, and the cook needed something you could eat standing up, one-handed, in the dark.',
    img: '/assets/cinema-marquee.webp',
    quote: 'إذا جعت بعد السينما، الصاروخ جاهز',
  },
  {
    no: '02', kicker: 'WHY A ROCKET', title: 'Rolled tight, wrapped in foil', ar: 'ليش صاروخ؟',
    text: 'Long, tightly rolled and wrapped in foil, the saj looked like a shell. The street called it a saroukh, a rocket, and the bigger ones a bazooka. The name stuck to the kiosk and then to us.',
    img: '/assets/saroukh-hero.webp',
  },
  {
    no: '03', kicker: '450 °C · THE SPIT', title: 'Carved off the charcoal', ar: 'على الفحم',
    text: 'Every cone is stacked by hand in the afternoon and turns on real charcoal from opening to close. We carve to order, so the edges are always crisp, then the wrap is seared in a ribbed iron press.',
    img: '/assets/spit-cone.webp',
    quote: 'الفحم ما بيكذب',
  },
  {
    no: '04', kicker: '6 PM – 4 AM', title: 'The night window', ar: 'شباك آخر الليل',
    text: 'We open when the city clocks out and close just before the call to prayer. The window is lit, the tray is brass, and the receipt still prints on a thermal roll that smells faintly of garlic.',
    img: '/assets/night-shop.webp',
  },
];
