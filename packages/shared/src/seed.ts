// Seed data for Kingpin OS. Every name, place, product, and number is invented
// for a cartoon parody. Amounts are in Kingpin Bucks (KB$), not real money.

import type {
  CrewMember,
  CrewStatus,
  FrontBusiness,
  ProductLine,
  RivalOutfit,
  SeedData,
  Territory,
  WeeklyRevenue,
} from './types';

export const territories: Territory[] = [
  { id: 't-pigeon', name: 'Pigeon Heights' },
  { id: 't-gravy', name: 'Gravy Docks' },
  { id: 't-noodle', name: 'Noodle Flats' },
  { id: 't-marmalade', name: 'Marmalade Row' },
  { id: 't-sock', name: 'Lost Sock Valley' },
  { id: 't-waffle', name: 'Waffle Iron District' },
  { id: 't-pickle', name: 'Pickle Point' },
  { id: 't-velvet', name: 'Velvet Cul-de-sac' },
];

export const productLines: ProductLine[] = [
  { id: 'p-gummies', name: "Grandma's Contraband Gummies", sku: 'KP-GCG-001' },
  { id: 'p-croissant', name: 'Smuggled Croissants', sku: 'KP-SMC-002' },
  { id: 'p-glitter', name: 'Unlicensed Glitter', sku: 'KP-ULG-003' },
  { id: 'p-hotsauce', name: 'Illegally Spicy Hot Sauce', sku: 'KP-ISH-004' },
  { id: 'p-mixtape', name: 'Bootleg Kazoo Mixtapes', sku: 'KP-BKM-005' },
  { id: 'p-socks', name: 'Knockoff Designer Socks', sku: 'KP-KDS-006' },
];

// [codename, territory, product, loyalty, status]
type CrewRow = [string, string, string, number, CrewStatus];

const crewRows: CrewRow[] = [
  ['Lil Ledger', 't-pigeon', 'p-gummies', 97, 'active'],
  ['Tony Two-Phones', 't-gravy', 'p-mixtape', 88, 'active'],
  ['Big Spreadsheet', 't-noodle', 'p-croissant', 91, 'active'],
  ['Marco the Mumbler', 't-marmalade', 'p-hotsauce', 64, 'lying-low'],
  ['Fingers McGee', 't-sock', 'p-socks', 72, 'active'],
  ['Sweet Tooth Sally', 't-pigeon', 'p-gummies', 85, 'active'],
  ['No-Receipts Ricky', 't-waffle', 'p-glitter', 58, 'lying-low'],
  ['The Accountant (Not Really)', 't-pickle', 'p-croissant', 79, 'active'],
  ['Pinky Promise', 't-velvet', 'p-socks', 12, 'flipped'],
  ['Vinnie Voicemail', 't-gravy', 'p-mixtape', 83, 'active'],
  ['Double Dip Dolores', 't-noodle', 'p-hotsauce', 90, 'active'],
  ['Kazoo Kevin', 't-marmalade', 'p-mixtape', 77, 'active'],
  ['Biscuit', 't-sock', 'p-croissant', 69, 'active'],
  ['Shady Sadie', 't-waffle', 'p-glitter', 55, 'lying-low'],
  ['Three-Hats Harold', 't-pickle', 'p-socks', 81, 'active'],
  ['Glitterbomb Gina', 't-velvet', 'p-glitter', 93, 'active'],
  ['Stapler Steve', 't-pigeon', 'p-gummies', 21, 'flipped'],
  ['Frankie Footnotes', 't-gravy', 'p-hotsauce', 74, 'active'],
  ['Mittens Malone', 't-noodle', 'p-socks', 86, 'active'],
  ['Louie Lukewarm', 't-marmalade', 'p-croissant', 61, 'lying-low'],
  ['Captain Coupon', 't-sock', 'p-gummies', 89, 'active'],
  ['Big Nap Nadia', 't-waffle', 'p-mixtape', 67, 'active'],
  ['Pretzel Pete', 't-pickle', 'p-croissant', 94, 'active'],
  ['Sneaky Sneakers', 't-velvet', 'p-socks', 76, 'active'],
  ['Dottie Dotted-Line', 't-pigeon', 'p-glitter', 80, 'active'],
  ['Hot Sauce Hector', 't-gravy', 'p-hotsauce', 92, 'active'],
  ['Wobbly Wanda', 't-noodle', 'p-gummies', 18, 'flipped'],
  ['Eddie Eyebrows', 't-marmalade', 'p-mixtape', 70, 'active'],
  ['Cousin Cashflow', 't-sock', 'p-glitter', 84, 'active'],
  ['Mumbles Junior', 't-waffle', 'p-hotsauce', 59, 'lying-low'],
  ['Penny Pincher', 't-pickle', 'p-gummies', 87, 'active'],
  ['The Quiet Kazoo', 't-velvet', 'p-mixtape', 73, 'active'],
  ['Benny Backdoor', 't-pigeon', 'p-socks', 66, 'lying-low'],
  ['Crumbs Callahan', 't-gravy', 'p-croissant', 82, 'active'],
  ['Flip-Flop Phil', 't-noodle', 'p-socks', 9, 'flipped'],
  ['Sparkles Sullivan', 't-marmalade', 'p-glitter', 78, 'active'],
  ['Ghost Pepper Gus', 't-sock', 'p-hotsauce', 88, 'active'],
  ['Rita Rubber-Stamp', 't-waffle', 'p-croissant', 75, 'active'],
  ['Teflon Ted', 't-pickle', 'p-mixtape', 95, 'active'],
  ['Nanna Knuckles', 't-velvet', 'p-gummies', 99, 'active'],
];

export const crew: CrewMember[] = crewRows.map(
  ([codename, territoryId, productLineId, loyalty, status], i) => ({
    id: `c-${String(i + 1).padStart(2, '0')}`,
    codename,
    territoryId,
    productLineId,
    loyalty,
    status,
  }),
);

export const rivals: RivalOutfit[] = [
  { id: 'r-1', name: 'The Pastry Syndicate', boss: 'Madame Éclair', turf: 'Noodle Flats', threat: 'high' },
  { id: 'r-2', name: 'Los Calcetines', boss: 'El Argyle', turf: 'Lost Sock Valley', threat: 'moderate' },
  { id: 'r-3', name: 'The Coupon Clippers', boss: 'Granny Discount', turf: 'Pickle Point', threat: 'low' },
  { id: 'r-4', name: 'Velvet Glove Gang', boss: 'Lady Plush', turf: 'Velvet Cul-de-sac', threat: 'extreme' },
  { id: 'r-5', name: 'The Gravy Boat Boys', boss: 'Captain Ladle', turf: 'Gravy Docks', threat: 'high' },
  { id: 'r-6', name: 'Waffle House of Cards', boss: 'The Syrup Baron', turf: 'Waffle Iron District', threat: 'moderate' },
  { id: 'r-7', name: 'The Mime Mob', boss: '(silence)', turf: 'Marmalade Row', threat: 'low' },
  { id: 'r-8', name: 'Pigeon Coop Collective', boss: 'Coo-Coo Carla', turf: 'Pigeon Heights', threat: 'moderate' },
  { id: 'r-9', name: 'The Kazoo Cartel', boss: 'Buzzy Malone', turf: 'Marmalade Row', threat: 'high' },
  { id: 'r-10', name: 'Spreadsheet Sharks', boss: 'Pivot Table Pauline', turf: 'Noodle Flats', threat: 'extreme' },
];

export const fronts: FrontBusiness[] = [
  { id: 'f-1', name: 'Squeaky Clean Car Wash', kind: 'Car wash', territoryId: 't-gravy', cleanedThisWeek: 18400 },
  { id: 'f-2', name: 'Spin Cycle Laundromat', kind: 'Laundromat', territoryId: 't-sock', cleanedThisWeek: 22750 },
  { id: 'f-3', name: 'Totally Legit Froyo', kind: 'Frozen yogurt shop', territoryId: 't-pigeon', cleanedThisWeek: 15200 },
  { id: 'f-4', name: 'Nothing To See Here Nails', kind: 'Nail salon', territoryId: 't-velvet', cleanedThisWeek: 9800 },
  { id: 'f-5', name: 'Honest Abe’s Arcade', kind: 'Arcade', territoryId: 't-waffle', cleanedThisWeek: 12600 },
  { id: 'f-6', name: 'Pickle Point Pet Spa', kind: 'Pet groomer', territoryId: 't-pickle', cleanedThisWeek: 7400 },
  { id: 'f-7', name: 'Marmalade Mini Golf', kind: 'Mini golf', territoryId: 't-marmalade', cleanedThisWeek: 11300 },
  { id: 'f-8', name: 'Noodle Flats Knitting Circle', kind: 'Craft store', territoryId: 't-noodle', cleanedThisWeek: 5600 },
];

const weeklyAmounts = [
  61200, 64800, 59900, 70300, 73100, 68800, 77400, 81900, 79200, 86500, 91300, 88700,
];

export const revenue: WeeklyRevenue[] = weeklyAmounts.map((amount, i) => ({
  week: i + 1,
  amount,
}));

export const seed: SeedData = {
  territories,
  productLines,
  crew,
  rivals,
  fronts,
  revenue,
  heatLevel: 82,
};
