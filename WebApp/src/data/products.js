// Product data organized by category
// Using Unsplash image URLs for high-quality product imagery

export const categories = [
  {
    id: "tshirts",
    name: "T-Shirts",
    description: "Premium cotton and blended tees for everyday style",
    image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800&q=80",
    hero: "https://images.unsplash.com/photo-1562157873-818bc0726f68?w=1200&q=80",
  },
  {
    id: "promotional",
    name: "Promotional T-Shirts",
    description: "Custom branded apparel for events, campaigns & giveaways",
    image: "https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?w=800&q=80",
    hero: "https://images.unsplash.com/photo-1529374255404-311a2a4f1fd9?w=1200&q=80",
  },
  {
    id: "sublimation",
    name: "Sublimation T-Shirts",
    description: "Vibrant all-over prints with cutting-edge sublimation tech",
    image: "https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=800&q=80",
    hero: "https://images.unsplash.com/photo-1618354691373-d851c5c3a990?w=1200&q=80",
  },
  {
    id: "uniforms",
    name: "Uniforms",
    description: "Professional uniforms for corporates, schools & institutions",
    image: "https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=800&q=80",
    hero: "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=1200&q=80",
  },
  {
    id: "tracks",
    name: "Tracks & Tracksuits",
    description: "Sporty tracks, joggers & complete tracksuits for active life",
    image: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=800&q=80",
    hero: "https://images.unsplash.com/photo-1556906781-9a412961c28c?w=1200&q=80",
  },
];

export const products = {
  tshirts: [
    {
      name: "Classic Cotton Crew",
      image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=600&q=80",
      description: "100% combed cotton, pre-shrunk, available in 20+ colors.",
      tag: "Bestseller",
    },
    {
      name: "Premium Supima Tee",
      image: "https://images.unsplash.com/photo-1618354691373-d851c5c3a990?w=600&q=80",
      description: "Ultra-soft Supima cotton with a luxurious drape.",
      tag: "Premium",
    },
    {
      name: "Poly-Cotton Blend",
      image: "https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=600&q=80",
      description: "Wrinkle-resistant blend perfect for daily wear.",
      tag: "Popular",
    },
    {
      name: "V-Neck Essential",
      image: "https://images.unsplash.com/photo-1622445275576-721325763afe?w=600&q=80",
      description: "Sleek V-neck cut in breathable cotton jersey.",
      tag: "New",
    },
    {
      name: "Oversized Streetwear",
      image: "https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?w=600&q=80",
      description: "Relaxed oversized fit for the modern streetwear look.",
      tag: "Trending",
    },
    {
      name: "Henley Neck Tee",
      image: "https://images.unsplash.com/photo-1581655353564-df123a1eb820?w=600&q=80",
      description: "Classic henley with button placket, casual yet refined.",
      tag: null,
    },
  ],
  promotional: [
    {
      name: "Event Promo Tee",
      image: "https://images.unsplash.com/photo-1529374255404-311a2a4f1fd9?w=600&q=80",
      description: "Bulk-ready tees with custom logo printing for events.",
      tag: "Bulk Deal",
    },
    {
      name: "Campaign Special",
      image: "https://images.unsplash.com/photo-1562157873-818bc0726f68?w=600&q=80",
      description: "Eye-catching designs for marketing campaigns.",
      tag: "Popular",
    },
    {
      name: "Corporate Giveaway",
      image: "https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=600&q=80",
      description: "Premium branded tees for corporate gifting.",
      tag: "Corporate",
    },
    {
      name: "Election & Rally Tee",
      image: "https://images.unsplash.com/photo-1564859228273-274232fdb516?w=600&q=80",
      description: "High-visibility prints for political and social campaigns.",
      tag: "Custom",
    },
    {
      name: "Festival Merch",
      image: "https://images.unsplash.com/photo-1556906781-9a412961c28c?w=600&q=80",
      description: "Vibrant festival merchandise with DTF & screen printing.",
      tag: "Trending",
    },
    {
      name: "Charity Run Tee",
      image: "https://images.unsplash.com/photo-1571945153237-4929e783af4a?w=600&q=80",
      description: "Lightweight performance tees for charity runs & marathons.",
      tag: "Sports",
    },
  ],
  sublimation: [
    {
      name: "Full Print Galaxy",
      image: "https://images.unsplash.com/photo-1618354691373-d851c5c3a990?w=600&q=80",
      description: "All-over galaxy print using advanced sublimation.",
      tag: "Bestseller",
    },
    {
      name: "Abstract Art Tee",
      image: "https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=600&q=80",
      description: "Wearable art with vivid abstract sublimation prints.",
      tag: "Art",
    },
    {
      name: "Photo Print Tee",
      image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=600&q=80",
      description: "Photo-realistic prints that never fade or crack.",
      tag: "Premium",
    },
    {
      name: "Ethnic Sublimation",
      image: "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=600&q=80",
      description: "Traditional ethnic patterns with modern sublimation tech.",
      tag: "Cultural",
    },
    {
      name: "Sports Jersey Print",
      image: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=600&q=80",
      description: "Custom sports jerseys with number & name sublimation.",
      tag: "Sports",
    },
    {
      name: "Neon Glow Design",
      image: "https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?w=600&q=80",
      description: "Neon-inspired designs that pop with sublimation vibrancy.",
      tag: "New",
    },
  ],
  uniforms: [
    {
      name: "Corporate Polo",
      image: "https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=600&q=80",
      description: "Professional polo shirts with embroidered company logos.",
      tag: "Corporate",
    },
    {
      name: "School Uniform Set",
      image: "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=600&q=80",
      description: "Durable, comfortable school uniforms in custom colors.",
      tag: "Education",
    },
    {
      name: "Hospital Scrubs",
      image: "https://images.unsplash.com/photo-1581655353564-df123a1eb820?w=600&q=80",
      description: "Antimicrobial scrubs for healthcare professionals.",
      tag: "Healthcare",
    },
    {
      name: "Restaurant Staff Tee",
      image: "https://images.unsplash.com/photo-1562157873-818bc0726f68?w=600&q=80",
      description: "Stain-resistant tees for hospitality & food service.",
      tag: "Hospitality",
    },
    {
      name: "Security Crew Uniform",
      image: "https://images.unsplash.com/photo-1564859228273-274232fdb516?w=600&q=80",
      description: "High-visibility uniforms for security personnel.",
      tag: "Security",
    },
    {
      name: "Industrial Workwear",
      image: "https://images.unsplash.com/photo-1571945153237-4929e783af4a?w=600&q=80",
      description: "Heavy-duty workwear built for tough environments.",
      tag: "Industrial",
    },
  ],
  tracks: [
    {
      name: "Classic Track Pant",
      image: "https://images.unsplash.com/photo-1556906781-9a412961c28c?w=600&q=80",
      description: "Comfortable polyester track pants with side stripes.",
      tag: "Bestseller",
    },
    {
      name: "Premium Tracksuit Set",
      image: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=600&q=80",
      description: "Complete tracksuit with jacket and matching pants.",
      tag: "Premium",
    },
    {
      name: "Jogger Slim Fit",
      image: "https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=600&q=80",
      description: "Modern slim-fit joggers with tapered ankle.",
      tag: "Trending",
    },
    {
      name: "School Sports Track",
      image: "https://images.unsplash.com/photo-1529374255404-311a2a4f1fd9?w=600&q=80",
      description: "Durable tracks for school sports and PE classes.",
      tag: "Education",
    },
    {
      name: "Gym Performance Set",
      image: "https://images.unsplash.com/photo-1571945153237-4929e783af4a?w=600&q=80",
      description: "Moisture-wicking gym wear for peak performance.",
      tag: "Sports",
    },
    {
      name: "Winter Fleece Track",
      image: "https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=600&q=80",
      description: "Warm fleece-lined tracks for cold weather comfort.",
      tag: "Seasonal",
    },
  ],
};

export const testimonials = [
  {
    name: "Rajesh K.",
    role: "Event Manager",
    text: "KPJ delivered 500 custom tees for our corporate event in just 3 days. The quality and print were outstanding.",
  },
  {
    name: "Priya M.",
    role: "School Principal",
    text: "We've been ordering school uniforms from KPJ for 2 years. Consistent quality and great pricing every time.",
  },
  {
    name: "Anil S.",
    role: "Gym Owner",
    text: "The sublimation jerseys for our gym are incredible. Vibrant colors that don't fade even after months of washing.",
  },
  {
    name: "Sneha R.",
    role: "Marketing Head",
    text: "Our promotional campaign tees were a huge hit. KPJ's team helped us with design and delivered on time.",
  },
];

export const stats = [
  { value: "50K+", label: "T-Shirts Delivered" },
  { value: "500+", label: "Happy Clients" },
  { value: "48hr", label: "Express Delivery" },
  { value: "100%", label: "Satisfaction Rate" },
];
