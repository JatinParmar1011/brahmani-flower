// Nav mega-menu: each category has columns, each column has a title + items
export const NAV_MENU = {
  Flowers: [
    { title: 'By Flower Type', items: [
      { label: 'Red Roses',       sub: 'Red Roses' },
      { label: 'Orchids',         sub: 'Orchids' },
      { label: 'Sunflowers',      sub: 'Sunflowers' },
      { label: 'White Lilies',    sub: 'White Lilies' },
      { label: 'Mixed Bouquets',  sub: 'Mixed Bouquets' },
    ]},
    { title: 'By Occasion', items: [
      { label: 'Birthday Flowers',   sub: 'Balloon Bouquets' },
      { label: 'Anniversary Blooms', sub: 'Rose Arrangements' },
      { label: 'Valentine Special',  sub: 'Valentine Day' },
      { label: 'Sympathy Flowers',   sub: 'White Lilies' },
    ]},
    { title: 'By Recipient', items: [
      { label: 'For Her',       sub: 'Red Roses' },
      { label: 'For Him',       sub: 'Mixed Bouquets' },
      { label: 'For Mom',       sub: "Mother's Day" },
      { label: 'For Friends',   sub: 'Sunflowers' },
    ]},
  ],
  Cakes: [
    { title: 'By Flavour', items: [
      { label: 'Chocolate Cakes',  sub: 'Chocolate Cakes' },
      { label: 'Red Velvet',       sub: 'Red Velvet' },
      { label: 'Fruit Cakes',      sub: 'Fruit Cakes' },
      { label: 'Cheesecakes',      sub: 'Cheesecakes' },
      { label: 'Butterscotch',     sub: 'Fruit Cakes' },
    ]},
    { title: 'By Occasion', items: [
      { label: 'Birthday Cakes',    sub: 'Cake & Roses' },
      { label: 'Anniversary Cakes', sub: 'Red Velvet' },
      { label: 'Wedding Cakes',     sub: 'Cheesecakes' },
      { label: 'Baby Shower',       sub: 'Fruit Cakes' },
    ]},
    { title: 'Special', items: [
      { label: 'Photo Cakes',       sub: 'Photo Cakes' },
      { label: 'Eggless Cakes',     sub: 'Chocolate Cakes' },
      { label: 'Designer Cakes',    sub: 'Red Velvet' },
      { label: 'Mini Cakes',        sub: 'Cheesecakes' },
    ]},
  ],
  Combos: [
    { title: 'Popular Combos', items: [
      { label: 'Flowers & Cake',    sub: 'Flowers & Cake' },
      { label: 'Roses & Choco',     sub: 'Roses & Choco' },
      { label: 'Teddy & Flowers',   sub: 'Teddy & Flowers' },
      { label: 'Wine & Roses',      sub: 'Wine & Roses' },
    ]},
    { title: 'Gift Combos', items: [
      { label: 'Spa & Flowers',     sub: 'Spa Kits' },
      { label: 'Balloon & Cake',    sub: 'Balloon Bouquets' },
      { label: 'Perfume & Flowers', sub: 'Premium Hampers' },
      { label: 'Candle & Flowers',  sub: 'Candle Sets' },
    ]},
    { title: 'By Occasion', items: [
      { label: 'Birthday Combos',     sub: 'Gift Hampers' },
      { label: 'Anniversary Combos',  sub: 'Champagne Combos' },
      { label: 'Valentine Combos',    sub: 'Valentine Day' },
      { label: 'Diwali Combos',       sub: 'Diwali Specials' },
    ]},
  ],
  Birthday: [
    { title: 'Birthday Specials', items: [
      { label: 'Balloon Bouquets',  sub: 'Balloon Bouquets' },
      { label: 'Flower Boxes',      sub: 'Flower Boxes' },
      { label: 'Cake & Roses',      sub: 'Cake & Roses' },
      { label: 'Gift Hampers',      sub: 'Gift Hampers' },
      { label: 'Chocolate Box',     sub: 'Ferrero Rocher' },
    ]},
    { title: 'Birthday Gifts For', items: [
      { label: 'For Her',       sub: 'Flower Boxes' },
      { label: 'For Him',       sub: 'Gift Hampers' },
      { label: 'For Kids',      sub: 'Balloon Bouquets' },
      { label: 'For Wife',      sub: 'Cake & Roses' },
      { label: 'For Husband',   sub: 'Gift Hampers' },
    ]},
    { title: 'By Milestone', items: [
      { label: '1st Birthday',   sub: 'Balloon Bouquets' },
      { label: '18th Birthday',  sub: 'Flower Boxes' },
      { label: '21st Birthday',  sub: 'Cake & Roses' },
      { label: '50th Birthday',  sub: 'Gift Hampers' },
    ]},
  ],
  Anniversary: [
    { title: 'Anniversary Gifts', items: [
      { label: 'Rose Arrangements', sub: 'Rose Arrangements' },
      { label: 'Romantic Sets',     sub: 'Romantic Sets' },
      { label: 'Infinity Boxes',    sub: 'Infinity Boxes' },
      { label: 'Champagne Combos',  sub: 'Champagne Combos' },
      { label: 'Heart Arrangements',sub: 'Rose Arrangements' },
    ]},
    { title: 'For Couples', items: [
      { label: 'For Wife',      sub: 'Rose Arrangements' },
      { label: 'For Husband',   sub: 'Champagne Combos' },
      { label: 'For Girlfriend',sub: 'Infinity Boxes' },
      { label: 'For Boyfriend', sub: 'Romantic Sets' },
    ]},
    { title: 'By Year', items: [
      { label: '1st Anniversary',  sub: 'Rose Arrangements' },
      { label: '5th Anniversary',  sub: 'Romantic Sets' },
      { label: '10th Anniversary', sub: 'Champagne Combos' },
      { label: '25th Anniversary', sub: 'Infinity Boxes' },
    ]},
  ],
  Gifts: [
    { title: 'Gift Types', items: [
      { label: 'Premium Hampers',  sub: 'Premium Hampers' },
      { label: 'Candle Sets',      sub: 'Candle Sets' },
      { label: 'Jewellery Boxes',  sub: 'Jewellery Boxes' },
      { label: 'Spa Kits',         sub: 'Spa Kits' },
      { label: 'Book & Blooms',    sub: 'Premium Hampers' },
    ]},
    { title: 'Gifts For', items: [
      { label: 'For Her',       sub: 'Jewellery Boxes' },
      { label: 'For Him',       sub: 'Premium Hampers' },
      { label: 'For Mom',       sub: 'Spa Kits' },
      { label: 'For Friends',   sub: 'Candle Sets' },
    ]},
    { title: 'By Budget', items: [
      { label: 'Under ₹500',    sub: 'Candle Sets' },
      { label: '₹500 - ₹1000', sub: 'Jewellery Boxes' },
      { label: '₹1000 - ₹2000',sub: 'Spa Kits' },
      { label: 'Above ₹2000',  sub: 'Premium Hampers' },
    ]},
  ],
  Personalised: [
    { title: 'Personalised Items', items: [
      { label: 'Name Flower Box',   sub: 'Name Flower Box' },
      { label: 'Photo Cakes',       sub: 'Photo Cakes' },
      { label: 'Custom Balloons',   sub: 'Custom Balloons' },
      { label: 'Engraved Frames',   sub: 'Engraved Frames' },
      { label: 'Custom Cushions',   sub: 'Name Flower Box' },
    ]},
    { title: 'For Occasions', items: [
      { label: 'Birthday',      sub: 'Custom Balloons' },
      { label: 'Anniversary',   sub: 'Engraved Frames' },
      { label: 'Valentine',     sub: 'Name Flower Box' },
      { label: 'Wedding',       sub: 'Photo Cakes' },
    ]},
  ],
  Plants: [
    { title: 'Plant Types', items: [
      { label: 'Indoor Plants',  sub: 'Indoor Plants' },
      { label: 'Succulents',     sub: 'Succulents' },
      { label: 'Lucky Plants',   sub: 'Lucky Plants' },
      { label: 'Bonsai Trees',   sub: 'Bonsai Trees' },
      { label: 'Air Purifiers',  sub: 'Indoor Plants' },
    ]},
    { title: 'By Purpose', items: [
      { label: 'Good Luck',     sub: 'Lucky Plants' },
      { label: 'Home Decor',    sub: 'Indoor Plants' },
      { label: 'Office Plants', sub: 'Succulents' },
      { label: 'Gift Plants',   sub: 'Bonsai Trees' },
    ]},
  ],
  Chocolates: [
    { title: 'Chocolate Types', items: [
      { label: 'Ferrero Rocher',   sub: 'Ferrero Rocher' },
      { label: 'Belgian Dark',     sub: 'Belgian Dark' },
      { label: 'Truffle Box',      sub: 'Truffle Box' },
      { label: 'White Chocolate',  sub: 'White Chocolate' },
      { label: 'Assorted Box',     sub: 'Truffle Box' },
    ]},
    { title: 'Gift Hampers', items: [
      { label: 'Choco Hamper',     sub: 'Ferrero Rocher' },
      { label: 'Luxury Box',       sub: 'Belgian Dark' },
      { label: 'Fondue Kit',       sub: 'Truffle Box' },
      { label: 'Premium Cocoa',    sub: 'White Chocolate' },
    ]},
  ],
  Occasions: [
    { title: 'Festivals', items: [
      { label: 'Diwali Specials',  sub: 'Diwali Specials' },
      { label: 'Holi Gifts',       sub: 'Diwali Specials' },
      { label: 'Christmas',        sub: 'New Year' },
      { label: 'New Year',         sub: 'New Year' },
      { label: 'Raksha Bandhan',   sub: 'Diwali Specials' },
    ]},
    { title: 'Special Days', items: [
      { label: 'Valentine Day',    sub: 'Valentine Day' },
      { label: "Mother's Day",     sub: "Mother's Day" },
      { label: "Father's Day",     sub: "Mother's Day" },
      { label: 'Friendship Day',   sub: 'Valentine Day' },
    ]},
  ],
  International: [
    { title: 'Destinations', items: [
      { label: 'USA Delivery',     sub: 'USA Delivery' },
      { label: 'UK Delivery',      sub: 'UK Delivery' },
      { label: 'Dubai Delivery',   sub: 'Dubai Delivery' },
      { label: 'Asia Pacific',     sub: 'Asia Pacific' },
      { label: 'Canada',           sub: 'USA Delivery' },
    ]},
    { title: 'Popular Gifts', items: [
      { label: 'Rose Bouquets',    sub: 'Red Roses' },
      { label: 'Luxury Hampers',   sub: 'Dubai Delivery' },
      { label: 'Orchid Box',       sub: 'Asia Pacific' },
      { label: 'Cherry Blossoms',  sub: 'Asia Pacific' },
    ]},
  ],
};

// Subcategory → product id mapping
export const SUBCATEGORY_PRODUCTS = {
  // Flowers
  'Red Roses':        [1, 5, 33],
  'Orchids':          [3, 2, 7],
  'Sunflowers':       [6, 8, 4],
  'Mixed Bouquets':   [8, 4, 6, 1],
  'White Lilies':     [7, 2, 5],
  // Cakes
  'Chocolate Cakes':  [9, 12, 16],
  'Red Velvet':       [10, 9, 13],
  'Fruit Cakes':      [13, 14, 15],
  'Cheesecakes':      [16, 11, 15],
  // Combos
  'Flowers & Cake':   [18, 17, 24],
  'Roses & Choco':    [17, 20, 23],
  'Teddy & Flowers':  [19, 23, 21],
  'Wine & Roses':     [22, 17, 24],
  // Birthday
  'Balloon Bouquets': [25, 30, 32],
  'Flower Boxes':     [26, 30, 29],
  'Cake & Roses':     [27, 31, 26],
  'Gift Hampers':     [28, 29, 32],
  // Anniversary
  'Rose Arrangements':[33, 36, 40],
  'Romantic Sets':    [35, 37, 38],
  'Infinity Boxes':   [39, 33, 36],
  'Champagne Combos': [37, 35, 34],
  // Gifts
  'Premium Hampers':  [41, 45, 47],
  'Candle Sets':      [42, 41, 48],
  'Jewellery Boxes':  [44, 41, 47],
  'Spa Kits':         [45, 42, 46],
  // Personalised
  'Name Flower Box':  [49, 53, 56],
  'Photo Cakes':      [50, 49, 55],
  'Custom Balloons':  [52, 49, 54],
  'Engraved Frames':  [51, 55, 53],
  // Plants
  'Indoor Plants':    [57, 59, 64],
  'Succulents':       [58, 63, 62],
  'Lucky Plants':     [62, 59, 61],
  'Bonsai Trees':     [60, 57, 64],
  // Chocolates
  'Ferrero Rocher':   [65, 68, 72],
  'Belgian Dark':     [66, 67, 71],
  'Truffle Box':      [67, 65, 70],
  'White Chocolate':  [69, 66, 72],
  // Occasions
  'Diwali Specials':  [73, 76, 80],
  'Valentine Day':    [77, 73, 78],
  "Mother's Day":     [78, 77, 74],
  'New Year':         [76, 73, 79],
  // International
  'USA Delivery':     [81, 84, 85],
  'UK Delivery':      [82, 81, 88],
  'Dubai Delivery':   [83, 86, 88],
  'Asia Pacific':     [86, 87, 88, 85],
};

export const CATEGORY_META = {
  Flowers:       { emoji: '🌸', gradient: 'from-pink-50 to-rose-100',       accent: '#e91e8c', desc: 'Fresh handpicked blooms delivered to your door' },
  Cakes:         { emoji: '🎂', gradient: 'from-amber-50 to-yellow-100',    accent: '#f59e0b', desc: 'Delicious custom cakes for every celebration' },
  Combos:        { emoji: '🎁', gradient: 'from-purple-50 to-violet-100',   accent: '#8b5cf6', desc: 'Perfect gift combos for your special ones' },
  Birthday:      { emoji: '🎉', gradient: 'from-orange-50 to-amber-100',    accent: '#f97316', desc: 'Make every birthday unforgettable' },
  Anniversary:   { emoji: '💑', gradient: 'from-red-50 to-rose-100',        accent: '#ef4444', desc: 'Celebrate love with timeless arrangements' },
  Gifts:         { emoji: '🎀', gradient: 'from-teal-50 to-cyan-100',       accent: '#0d9488', desc: 'Thoughtful gifts for every occasion' },
  Personalised:  { emoji: '✨', gradient: 'from-indigo-50 to-blue-100',     accent: '#6366f1', desc: 'Custom creations made just for them' },
  Plants:        { emoji: '🌿', gradient: 'from-green-50 to-emerald-100',   accent: '#10b981', desc: 'Bring nature indoors with our plant collection' },
  Chocolates:    { emoji: '🍫', gradient: 'from-yellow-50 to-amber-100',    accent: '#92400e', desc: 'Premium chocolates for the sweetest moments' },
  Occasions:     { emoji: '🎊', gradient: 'from-sky-50 to-blue-100',        accent: '#0ea5e9', desc: 'Curated collections for every special event' },
  International: { emoji: '✈️', gradient: 'from-slate-50 to-gray-100',     accent: '#475569', desc: 'Send love across borders to 50+ countries' },
};

const make = (id, name, price, original, off, rating, reviews, emoji, bg, category, tag = null, delivery = 'Tomorrow') =>
  ({ id, name, price, original, off, rating, reviews, emoji, bg, category, tag, delivery });

export const ALL_PRODUCTS = [
  // Flowers
  make(1,  '10 Red Roses Bouquet',              695,  779, 10, 4.9, 1645, '💐', '#fce4ec', 'Flowers',      'Bestseller'),
  make(2,  'Profuse Jade Terrarium',             695,  989, 31, 4.9,   68, '🌿', '#e8f5e9', 'Flowers'),
  make(3,  'Bellina Purple Orchid Bouquet',      795,  989, 21, 4.9,  676, '💜', '#f3e5f5', 'Flowers',      'Trending'),
  make(4,  'Pastel Blooms Of Serenity',          595,  795, 28, 5.0,    2, '🌸', '#fce4ec', 'Flowers',      'New'),
  make(5,  'Red Roses Wrapped Heartfelt',        545,  795, 32, 4.8,    4, '🌹', '#fce4ec', 'Flowers'),
  make(6,  'Sunflower Sunshine Bunch',           499,  699, 29, 4.7,  320, '🌻', '#fff8e1', 'Flowers',      'Popular'),
  make(7,  'White Lily Elegance',                649,  849, 24, 4.8,  215, '🤍', '#f5f5f5', 'Flowers'),
  make(8,  'Mixed Wildflower Bouquet',           449,  649, 31, 4.6,  189, '🌼', '#fffde7', 'Flowers'),
  // Cakes
  make(9,  'Chocolate Truffle Cake',             595,  745, 21, 4.9,  829, '🎂', '#fff8e1', 'Cakes',        'Bestseller'),
  make(10, 'Decadent Red Velvet Cake',           685,  885, 24, 4.9,  320, '🍰', '#fce4ec', 'Cakes',        'Popular'),
  make(11, 'Vanilla Butterscotch Cake',          545,  699, 22, 4.7,  412, '🧁', '#fffde7', 'Cakes'),
  make(12, 'Black Forest Delight',               625,  799, 22, 4.8,  567, '🍫', '#efebe9', 'Cakes',        'Trending'),
  make(13, 'Strawberry Cream Cake',              575,  749, 23, 4.7,  298, '🍓', '#fce4ec', 'Cakes'),
  make(14, 'Pineapple Fresh Cream Cake',         525,  699, 25, 4.6,  234, '🍍', '#fff9c4', 'Cakes'),
  make(15, 'Mango Mousse Cake',                  649,  849, 24, 4.9,  187, '🥭', '#fff8e1', 'Cakes',        'New'),
  make(16, 'Blueberry Cheesecake',               699,  899, 22, 4.8,  143, '🫐', '#e8eaf6', 'Cakes'),
  // Combos
  make(17, 'Roses & Chocolate Box Combo',        999, 1299, 23, 4.9,  543, '🎁', '#f3e5f5', 'Combos',       'Bestseller'),
  make(18, 'Flowers & Cake Surprise',           1199, 1599, 25, 4.8,  321, '🌹', '#fce4ec', 'Combos',       'Popular'),
  make(19, 'Teddy & Roses Combo',                849, 1099, 23, 4.7,  267, '🧸', '#fff8e1', 'Combos'),
  make(20, 'Candle & Flower Gift Set',           749,  999, 25, 4.8,  198, '🕯️', '#fffde7', 'Combos',      'Trending'),
  make(21, 'Spa & Flowers Hamper',              1299, 1699, 24, 4.9,  156, '🛁', '#e8f5e9', 'Combos'),
  make(22, 'Wine & Roses Combo',                1499, 1999, 25, 4.9,  234, '🍷', '#fce4ec', 'Combos',       'Premium'),
  make(23, 'Balloon & Cake Combo',               899, 1199, 25, 4.7,  312, '🎈', '#e3f2fd', 'Combos'),
  make(24, 'Perfume & Flowers Set',             1199, 1599, 25, 4.8,  178, '🌸', '#f3e5f5', 'Combos',       'New'),
  // Birthday
  make(25, 'Birthday Balloon Bouquet',           695,  895, 22, 4.8,  456, '🎈', '#e3f2fd', 'Birthday',     'Popular'),
  make(26, 'Happy Birthday Flower Box',          849, 1099, 23, 4.9,  389, '🎉', '#fff8e1', 'Birthday',     'Bestseller'),
  make(27, 'Birthday Cake & Roses',             1099, 1399, 21, 4.8,  267, '🎂', '#fce4ec', 'Birthday'),
  make(28, 'Surprise Gift Hamper',              1299, 1699, 24, 4.7,  198, '🎁', '#f3e5f5', 'Birthday',     'Trending'),
  make(29, 'Birthday Teddy Combo',               799,  999, 20, 4.6,  312, '🧸', '#fff9c4', 'Birthday'),
  make(30, 'Confetti Flower Arrangement',        649,  849, 24, 4.9,  145, '🌸', '#fce4ec', 'Birthday',     'New'),
  make(31, 'Birthday Chocolate Box',             549,  749, 27, 4.7,  423, '🍫', '#efebe9', 'Birthday'),
  make(32, 'Birthday Card & Flowers',            749,  999, 25, 4.8,  234, '💌', '#e8f5e9', 'Birthday'),
  // Anniversary
  make(33, 'Red Rose Heart Arrangement',         999, 1299, 23, 4.9,  678, '❤️', '#fce4ec', 'Anniversary',  'Bestseller'),
  make(34, 'Couple Photo Frame & Flowers',      1199, 1599, 25, 4.8,  345, '🖼️', '#f3e5f5', 'Anniversary', 'Popular'),
  make(35, 'Romantic Candle Night Set',         1499, 1999, 25, 4.9,  289, '🕯️', '#fff8e1', 'Anniversary', 'Premium'),
  make(36, 'Love Letter Flower Box',             849, 1099, 23, 4.8,  412, '💌', '#fce4ec', 'Anniversary'),
  make(37, 'Champagne & Roses Combo',           1799, 2299, 22, 4.9,  198, '🥂', '#f3e5f5', 'Anniversary',  'Luxury'),
  make(38, 'Heart Shaped Cake & Flowers',       1099, 1399, 21, 4.7,  267, '💝', '#fce4ec', 'Anniversary'),
  make(39, 'Infinity Rose Box',                 1299, 1699, 24, 4.9,  156, '♾️', '#fff3e0', 'Anniversary',  'Trending'),
  make(40, 'Couple Cushion & Flowers',           899, 1199, 25, 4.6,  312, '🛋️', '#e8f5e9', 'Anniversary'),
  // Gifts
  make(41, 'Premium Gift Hamper',               1499, 1999, 25, 4.9,  456, '🎀', '#f3e5f5', 'Gifts',        'Bestseller'),
  make(42, 'Scented Candle Gift Set',            699,  899, 22, 4.8,  389, '🕯️', '#fff8e1', 'Gifts',       'Popular'),
  make(43, 'Luxury Chocolate Box',               849, 1099, 23, 4.7,  312, '🍫', '#efebe9', 'Gifts'),
  make(44, 'Handmade Jewellery Box',             999, 1299, 23, 4.8,  234, '💍', '#fce4ec', 'Gifts',        'Trending'),
  make(45, 'Spa Relaxation Kit',                1199, 1599, 25, 4.9,  178, '🛁', '#e8f5e9', 'Gifts'),
  make(46, 'Personalized Mug & Flowers',         649,  849, 24, 4.7,  423, '☕', '#fff9c4', 'Gifts',        'New'),
  make(47, 'Silk Scarf & Flowers',               899, 1199, 25, 4.8,  198, '🧣', '#f3e5f5', 'Gifts'),
  make(48, 'Book & Blooms Gift Set',             749,  999, 25, 4.6,  267, '📚', '#e3f2fd', 'Gifts'),
  // Personalised
  make(49, 'Custom Name Flower Box',             999, 1299, 23, 4.9,  345, '✨', '#e8f5e9', 'Personalised', 'Bestseller'),
  make(50, 'Photo Printed Cake',                1099, 1399, 21, 4.8,  289, '📸', '#fff8e1', 'Personalised', 'Popular'),
  make(51, 'Engraved Wooden Frame & Flowers',   1199, 1599, 25, 4.9,  198, '🖼️', '#f3e5f5', 'Personalised','Trending'),
  make(52, 'Custom Message Balloon Bouquet',     799,  999, 20, 4.7,  412, '🎈', '#e3f2fd', 'Personalised'),
  make(53, 'Personalized Cushion & Roses',       849, 1099, 23, 4.8,  234, '🛋️', '#fce4ec', 'Personalised'),
  make(54, 'Name Printed Chocolate Box',         699,  899, 22, 4.7,  312, '🍫', '#efebe9', 'Personalised', 'New'),
  make(55, 'Custom Star Map & Flowers',         1299, 1699, 24, 4.9,  156, '⭐', '#e8eaf6', 'Personalised'),
  make(56, 'Handwritten Letter & Bouquet',       649,  849, 24, 4.6,  267, '💌', '#fce4ec', 'Personalised'),
  // Plants
  make(57, 'Peace Lily Indoor Plant',            549,  749, 27, 4.9,  567, '🌿', '#e8f5e9', 'Plants',       'Bestseller'),
  make(58, 'Succulent Garden Set',               449,  649, 31, 4.8,  423, '🌵', '#e8f5e9', 'Plants',       'Popular'),
  make(59, 'Money Plant in Ceramic Pot',         399,  549, 27, 4.7,  678, '🪴', '#e8f5e9', 'Plants'),
  make(60, 'Bonsai Tree Gift',                   799,  999, 20, 4.9,  234, '🌳', '#e8f5e9', 'Plants',       'Premium'),
  make(61, 'Air Purifying Plant Combo',          699,  899, 22, 4.8,  312, '🌱', '#e8f5e9', 'Plants',       'Trending'),
  make(62, 'Bamboo Lucky Plant',                 349,  499, 30, 4.7,  456, '🎋', '#e8f5e9', 'Plants'),
  make(63, 'Cactus Trio Set',                    449,  649, 31, 4.6,  289, '🌵', '#fff9c4', 'Plants',       'New'),
  make(64, 'Hanging Fern Basket',                599,  799, 25, 4.8,  198, '🌿', '#e8f5e9', 'Plants'),
  // Chocolates
  make(65, 'Ferrero Rocher Gift Box',            849, 1099, 23, 4.9,  789, '🍫', '#efebe9', 'Chocolates',   'Bestseller'),
  make(66, 'Belgian Dark Chocolate Box',         699,  899, 22, 4.8,  567, '🍫', '#d7ccc8', 'Chocolates',   'Popular'),
  make(67, 'Assorted Truffle Collection',        599,  799, 25, 4.7,  423, '🍬', '#efebe9', 'Chocolates'),
  make(68, 'Handmade Chocolate Hamper',          999, 1299, 23, 4.9,  312, '🎁', '#fff8e1', 'Chocolates',   'Trending'),
  make(69, 'White Chocolate Roses Box',          749,  999, 25, 4.8,  234, '🤍', '#fafafa', 'Chocolates'),
  make(70, 'Nutella Gift Jar Set',               649,  849, 24, 4.7,  345, '🫙', '#efebe9', 'Chocolates',   'New'),
  make(71, 'Chocolate Fondue Kit',               799,  999, 20, 4.8,  198, '🍯', '#fff8e1', 'Chocolates'),
  make(72, 'Premium Cocoa Hamper',              1199, 1599, 25, 4.9,  156, '🍫', '#efebe9', 'Chocolates',   'Luxury'),
  // Occasions
  make(73, 'Diwali Flower & Sweets Combo',      1299, 1699, 24, 4.9,  456, '🪔', '#fff8e1', 'Occasions',    'Bestseller'),
  make(74, 'Holi Color & Flowers Set',           799,  999, 20, 4.8,  312, '🎨', '#e3f2fd', 'Occasions',    'Popular'),
  make(75, 'Christmas Wreath & Gifts',          1099, 1399, 21, 4.7,  234, '🎄', '#e8f5e9', 'Occasions'),
  make(76, 'New Year Celebration Combo',        1499, 1999, 25, 4.9,  198, '🎆', '#e8eaf6', 'Occasions',    'Trending'),
  make(77, 'Valentine Rose Heart Box',           999, 1299, 23, 4.9,  567, '💝', '#fce4ec', 'Occasions',    'Popular'),
  make(78, "Mother's Day Flower Hamper",         849, 1099, 23, 4.8,  423, '👩', '#fce4ec', 'Occasions'),
  make(79, "Father's Day Gift Combo",            799,  999, 20, 4.7,  289, '👨', '#e3f2fd', 'Occasions',    'New'),
  make(80, 'Raksha Bandhan Special',             699,  899, 22, 4.8,  345, '🪢', '#fff9c4', 'Occasions'),
  // International
  make(81, 'USA Flower Delivery Combo',         2499, 3199, 22, 4.9,  234, '🌹', '#e3f2fd', 'International','Popular'),
  make(82, 'UK Premium Rose Box',               2299, 2999, 23, 4.8,  198, '💐', '#fce4ec', 'International'),
  make(83, 'Dubai Luxury Flower Hamper',        2999, 3999, 25, 4.9,  156, '🌸', '#fff8e1', 'International','Premium'),
  make(84, 'Canada Chocolate & Flowers',        2199, 2899, 24, 4.7,  178, '🍫', '#e8f5e9', 'International'),
  make(85, 'Australia Bloom Box',               2399, 3099, 23, 4.8,  145, '🌻', '#e8f5e9', 'International','Trending'),
  make(86, 'Singapore Orchid Arrangement',      2099, 2799, 25, 4.9,  167, '💜', '#f3e5f5', 'International'),
  make(87, 'Germany Tulip Bouquet',             2299, 2999, 23, 4.7,  134, '🌷', '#fff9c4', 'International','New'),
  make(88, 'Japan Cherry Blossom Box',          2599, 3399, 24, 4.9,  189, '🌸', '#fce4ec', 'International','Luxury'),
];
