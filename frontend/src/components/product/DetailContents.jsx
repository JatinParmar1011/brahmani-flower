// Per-category product contains & description
const PRODUCT_DATA = {
  Flowers: {
    contains: ['Fresh seasonal flowers', 'Baby breath fillers', 'Decorative green leaves', 'Premium wrapping paper', 'Satin ribbon bow', 'Personalised message card'],
    desc: 'Our handpicked floral arrangements are crafted with the freshest blooms sourced daily from local farms. Each bouquet is carefully assembled by our expert florists to ensure maximum freshness and visual appeal. The vibrant colours and delicate fragrance make it a perfect gift for any occasion — from birthdays and anniversaries to just saying "I love you." Wrapped in premium tissue and tied with a satin ribbon, this bouquet arrives ready to impress.',
  },
  Cakes: {
    contains: ['Freshly baked cake (500g)', 'Premium frosting layer', 'Decorative fondant toppers', 'Candles included', 'Cake knife', 'Gift box packaging'],
    desc: 'Indulge in the rich, moist layers of our signature cake, baked fresh on the day of delivery. Made with the finest ingredients — real butter, farm-fresh eggs, and premium cocoa — every bite is a celebration. Our skilled bakers craft each cake with precision and love, ensuring a perfect texture and flavour. Whether it\'s a milestone birthday or a sweet surprise, this cake is guaranteed to delight.',
  },
  Combos: {
    contains: ['Premium flower bouquet', 'Assorted chocolates box', 'Greeting card', 'Decorative gift box', 'Satin ribbon', 'Tissue paper wrapping'],
    desc: 'The perfect combination of nature\'s beauty and sweet indulgence. This thoughtfully curated combo brings together fresh blooms and premium treats in an elegantly packaged gift set. Ideal for birthdays, anniversaries, or any occasion where you want to make someone feel truly special. Each item is carefully selected and beautifully presented to create a memorable gifting experience.',
  },
  Birthday: {
    contains: ['Birthday flower bouquet', 'Personalised birthday card', 'Decorative balloons (5 pcs)', 'Confetti packet', 'Gift wrapping', 'Ribbon bow'],
    desc: 'Make their birthday truly unforgettable with this vibrant and joyful birthday collection. Bursting with colour and festive energy, this arrangement captures the spirit of celebration perfectly. The bright blooms are paired with cheerful balloons and a personalised card to create a complete birthday surprise. Delivered fresh on the day, this gift is sure to bring a big smile to their face.',
  },
  Anniversary: {
    contains: ['Red rose bouquet (12 stems)', 'Romantic greeting card', 'Scented candle', 'Premium gift box', 'Satin ribbon', 'Dried petal confetti'],
    desc: 'Celebrate the beautiful journey of love with this exquisite anniversary collection. The deep red roses symbolise enduring passion and devotion, while the scented candle sets the mood for a romantic evening. Each element has been chosen to evoke warmth, intimacy, and heartfelt emotion. Whether it\'s your first anniversary or your fiftieth, this gift speaks the language of love eloquently.',
  },
  Gifts: {
    contains: ['Premium gift hamper box', 'Assorted luxury items', 'Decorative filler material', 'Personalised gift tag', 'Satin ribbon', 'Transparent gift wrap'],
    desc: 'A luxurious gift hamper curated with care and elegance. Each item inside has been handpicked to create a cohesive and delightful gifting experience. From premium treats to thoughtful keepsakes, this hamper is designed to impress even the most discerning recipient. Beautifully packaged in a sturdy gift box with a personalised tag, it\'s ready to be gifted straight from our hands to theirs.',
  },
  Personalised: {
    contains: ['Custom name/photo printed item', 'Protective packaging', 'Personalised message card', 'Gift wrapping', 'Ribbon bow', 'Certificate of authenticity'],
    desc: 'A truly one-of-a-kind gift made exclusively for your special someone. Our personalised creations are crafted with precision using high-quality materials and state-of-the-art printing technology. Every detail — from the font to the finish — is tailored to your specifications. This unique gift carries a personal touch that no store-bought item can replicate, making it a cherished keepsake for years to come.',
  },
  Plants: {
    contains: ['Healthy potted plant', 'Premium ceramic/terracotta pot', 'Nutrient-rich soil mix', 'Care instruction card', 'Decorative pebbles', 'Gift wrapping'],
    desc: 'Bring the beauty and tranquillity of nature into any space with our premium plant collection. Each plant is carefully nurtured in our nursery and arrives healthy, vibrant, and ready to thrive. Plants are known to purify air, reduce stress, and add a touch of green elegance to any room. Potted in a beautiful container and accompanied by a care guide, this is a gift that keeps growing.',
  },
  Chocolates: {
    contains: ['Premium chocolate assortment', 'Decorative gift box', 'Tissue paper lining', 'Personalised message card', 'Satin ribbon', 'Freshness seal'],
    desc: 'A divine collection of premium chocolates crafted for the true connoisseur. Each piece is made from the finest cocoa beans, carefully tempered and moulded into exquisite shapes. From rich dark chocolate to creamy milk and delicate white varieties, this assortment offers a journey through the world of fine chocolate. Elegantly boxed and beautifully presented, it\'s the ultimate indulgence for any occasion.',
  },
  Occasions: {
    contains: ['Festive flower arrangement', 'Traditional sweets/treats', 'Decorative elements', 'Festive greeting card', 'Gift packaging', 'Ribbon decoration'],
    desc: 'Celebrate every special occasion with this thoughtfully curated festive collection. Designed to capture the essence of the celebration, each element has been chosen to bring joy, colour, and warmth. Whether it\'s Diwali, Valentine\'s Day, or a family milestone, this collection sets the perfect festive mood. Beautifully packaged and ready to gift, it\'s the ideal way to show someone how much you care.',
  },
  International: {
    contains: ['Premium international flower box', 'Long-lasting preserved flowers', 'Luxury gift packaging', 'International greeting card', 'Tracking details', 'Freshness guarantee certificate'],
    desc: 'Send your love across borders with our premium international delivery service. Each arrangement is specially designed to withstand long-distance travel while maintaining its beauty and freshness. We partner with trusted florists in 50+ countries to ensure your gift arrives in perfect condition. From the moment you place your order to the smile on their face, we handle every detail with care and professionalism.',
  },
};

export default function DetailContents({ category, productName }) {
  const data = PRODUCT_DATA[category] || PRODUCT_DATA['Flowers'];

  return (
    <div className="border border-gray-200 rounded-2xl overflow-hidden">
      {/* Product Contains */}
      <div className="px-5 py-3.5 bg-gray-50 border-b border-gray-200">
        <p className="text-sm font-semibold text-gray-800">Product Contains</p>
      </div>
      <div className="px-5 py-4 border-b border-gray-200">
        <ul className="flex flex-col gap-2">
          {data.contains.map(item => (
            <li key={item} className="flex items-start gap-2 text-sm text-gray-700">
              <span className="mt-0.5 flex-shrink-0">•</span>
              {item}
            </li>
          ))}
        </ul>
      </div>

      {/* Description */}
      <div className="px-5 py-3.5 bg-gray-50 border-b border-gray-200">
        <p className="text-sm font-semibold text-gray-800">Description</p>
      </div>
      <div className="px-5 py-4">
        <p className="text-sm text-[#1a6b8a] leading-relaxed">{data.desc}</p>
      </div>
    </div>
  );
}
