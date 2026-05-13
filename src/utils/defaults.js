// Default content for Dizain Constructions
// Used as fallback when no saved content exists

export const DEFAULT_CONTENT = {
  contact: {
    phone: '+91 89393 30941',
    whatsapp: '918939330941',
    whatsappEnabled: true,
    email: 'dizainconstruction@gmail.com',
    address: 'Chennai, Tamil Nadu',
    logoUrl: '/Logo.jpg',
  },

  hero: {
    badge: 'Trusted in Chennai since 2012',
    heading1: 'Build Your Dream Home',
    heading2: 'With Total Clarity',
    summary:
      'End-to-end construction — from design and approvals to final handover. Fixed pricing, milestone payments, and a 10-year structural warranty on every project.',
    trustPills: [
      { value: '120+', label: 'Homes built' },
      { value: '98%', label: 'On-time delivery' },
      { value: '10 yr', label: 'Warranty' },
    ],
    heroImageUrl:
      'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1600&h=900&fit=crop&q=85',
    heroImageAlt: 'Beautiful completed home by Dizain Constructions',
    heroImageCaption: 'G+2 Luxury Villa — Adyar, Chennai',
    heroImageSub: 'Delivered on schedule · Prestige Package · 3,200 sqft',
  },

  metrics: [
    { value: '120+', label: 'Homes Built', sub: 'Across Chennai & suburbs' },
    { value: '12+', label: 'Years of Experience', sub: 'Residential & commercial' },
    { value: '98%', label: 'On-Time Delivery', sub: 'Milestone-tracked projects' },
    { value: '10 Yr', label: 'Structural Warranty', sub: 'Full post-handover support' },
  ],

  trustBar: [
    '🏗️ End-to-end project management',
    '📋 Transparent — zero hidden costs',
    '🛡️ 10-year structural warranty',
    '🏆 RERA-compliant construction',
  ],

  services: [
    { icon: '🏠', title: 'Turnkey Home Construction', copy: 'We manage everything — design, approvals, material procurement, civil work, and final handover. One team, zero coordination headaches.', tag: 'Most Popular' },
    { icon: '🏛️', title: 'Villa & Premium Residences', copy: 'Architect-led planning for statement homes with high-end detailing, premium finishes, and dedicated site supervision from day one.', tag: '' },
    { icon: '🏢', title: 'Commercial Construction', copy: 'Office spaces, retail stores, and mixed-use buildings built with operational efficiency, code compliance, and a sharp eye on timelines.', tag: '' },
    { icon: '🔨', title: 'Renovation & Upgrades', copy: 'Floor additions, interior renovation, structural upgrades, and modern remodelling — executed without disrupting your daily life.', tag: '' },
    { icon: '📐', title: 'Architectural Design', copy: 'In-house architects create functional floor plans, 3D visualisations, and working drawings that reflect your lifestyle and budget.', tag: '' },
    { icon: '🏗️', title: 'Structural Consulting', copy: 'Expert structural design, soil testing, load calculations, and compliance documentation so your build is safe and approved faster.', tag: '' },
  ],

  gallery: [
    {
      id: 'gallery-10',
      src: '/gallery/Copy of Gray Minimalist Construction Company Services Presentation (10).jpg',
      alt: 'Project Photo 1',
      type: 'Project',
      title: 'Completed Project 1',
      desc: '',
      featured: true,
    },
    {
      id: 'gallery-11',
      src: '/gallery/Copy of Gray Minimalist Construction Company Services Presentation (11).jpg',
      alt: 'Project Photo 2',
      type: 'Project',
      title: 'Completed Project 2',
      desc: '',
      featured: false,
    },
    {
      id: 'gallery-12',
      src: '/gallery/Copy of Gray Minimalist Construction Company Services Presentation (12).jpg',
      alt: 'Project Photo 3',
      type: 'Project',
      title: 'Completed Project 3',
      desc: '',
      featured: false,
    },
    {
      id: 'gallery-3',
      src: '/gallery/Copy of Gray Minimalist Construction Company Services Presentation (3).jpg',
      alt: 'Project Photo 4',
      type: 'Project',
      title: 'Completed Project 4',
      desc: '',
      featured: false,
    },
    {
      id: 'gallery-8',
      src: '/gallery/Copy of Gray Minimalist Construction Company Services Presentation (8).jpg',
      alt: 'Project Photo 5',
      type: 'Project',
      title: 'Completed Project 5',
      desc: '',
      featured: false,
    },
  ],

  processSteps: [
    { num: '01', title: 'Free Consultation', desc: 'Call or fill the form. A project advisor reaches you within 20 minutes to understand your vision and budget.' },
    { num: '02', title: 'Site Assessment', desc: 'Our engineers visit your plot, assess soil conditions, orientation, and local bylaws to build a realistic plan.' },
    { num: '03', title: 'Design & Drawings', desc: 'Floor plans, 3D visualisations, and structural drawings prepared. You review and approve before we proceed.' },
    { num: '04', title: 'Transparent Quote', desc: 'A detailed quotation covering all materials, labour, and timelines — no hidden costs, ever.' },
    { num: '05', title: 'Construction & Tracking', desc: 'Milestone-based execution with dedicated site supervisors and regular photo/video updates to you.' },
    { num: '06', title: 'Handover & Warranty', desc: 'Full quality inspection, documentation handover, and a 10-year structural warranty on your new home.' },
  ],

  guarantees: [
    { icon: '🛡️', title: 'No Cost Overruns', desc: 'We lock in your budget before work starts. What is quoted is what you pay — guaranteed in writing.' },
    { icon: '📅', title: 'On-Time Completion', desc: 'Every project has a milestone schedule. We have a 98% on-time delivery rate across 120+ homes.' },
    { icon: '🔍', title: '200+ Quality Checks', desc: 'Structured quality inspections at every stage — foundation, structure, finishes, and handover.' },
    { icon: '💰', title: 'Milestone Payments', desc: 'Pay only when each verified stage is done. Your investment is always tied to real progress.' },
    { icon: '👷', title: 'Verified Site Team', desc: 'All workers and supervisors are background-checked, trained, and accountable to our quality standards.' },
    { icon: '🏆', title: '10-Year Warranty', desc: 'Written structural warranty on every project plus 1-year free maintenance post-handover.' },
  ],

  packages: [
    {
      name: 'Essential',
      price: '₹2,450',
      unit: '/sqft',
      tagline: 'A high-quality, budget-conscious solution that covers all the fundamental requirements for a durable and well-designed home.',
      badge: '',
      specs: [
        { category: '', items: [
          'Complete design: 2D plans, 3D elevation, electrical & working drawings',
          'M20 concrete | 10\' floor height | Standard structural design',
          'Chettinad/Dalmia cement & ARUN/GBR steel',
          'Malaysian teak main door (7ft, solid frame)',
          'Vitrified tiles up to ₹50/sqft',
          'Daily engineer visit + weekly project manager'
        ]},
      ],
    },
    {
      name: 'Signature',
      price: '₹2,700',
      unit: '/sqft',
      tagline: 'An upgraded offering featuring superior material brands, enhanced architectural support, and refined interior finishes.',
      badge: 'Most Chosen',
      specs: [
        { category: '', items: [
          'Structural + plumbing drawings & soil test included',
          'ARS FE 550D steel & Dalmia/Ramco cement',
          '10\' clear ceiling height (more spacious feel)',
          'Kajaria tiles up to ₹80/sqft + granite staircase',
          'Ghana teak main door (wider 4ft entry)',
          'Dedicated architect + stage-wise support'
        ]},
      ],
    },
    {
      name: 'Luxury',
      price: '₹3,199',
      unit: '/sqft',
      tagline: 'The ultimate package for homeowners seeking elite engineering, smart-home readiness, and comprehensive interior design.',
      badge: 'Premium',
      specs: [
        { category: '', items: [
          'Full 3D interiors, walkthrough & landscape design',
          'Tata steel + Ultratech cement | M25 concrete',
          '11\' ceiling height + 5ft basement',
          '6x6 premium tiles up to ₹160/sqft + marble staircase',
          'Designer 8ft main door with digital lock',
          'Dedicated architect support till project completion',
          'Interior design & home decor assistance',
          'Smart-ready: EV, lift, automation & unlimited electrical points'
        ]},
      ],
    },
  ],

  testimonials: [
    { name: 'Karthik Raman', title: 'Homeowner, Adyar', stars: 5, quote: 'They built our dream home exactly as planned — on time and within budget. The team was professional, responsive, and the quality of finish was outstanding.', project: 'G+1 Residential Home' },
    { name: 'Priya & Manoj', title: 'Villa clients, ECR Corridor', stars: 5, quote: 'Dizain turned our villa vision into reality. The architects listened closely, the site supervisor kept us updated daily, and the final handover was seamless.', project: 'Custom Villa Build' },
    { name: 'S. Harish', title: 'Business Owner, Velachery', stars: 5, quote: 'We needed our commercial space ready in a tight window. Dizain delivered on time with zero quality compromise. The cost transparency was something I had never experienced before.', project: 'Commercial Office Fit-out' },
  ],

  faqs: [
    { question: 'How do I get started?', answer: 'Fill in the contact form or call us directly. A project advisor will reach you within 20 minutes for a free consultation and cost estimate.' },
    { question: 'What is included in the package price?', answer: 'Each package clearly lists all materials, brands, labour, and scope. The sqft price is all-inclusive — no hidden charges added during construction.' },
    { question: 'Can I customise package materials?', answer: 'Yes. Packages are starting points. You can upgrade specific categories like flooring, doors, or electrical fittings with transparent per-item pricing.' },
    { question: 'How are payments structured?', answer: 'Payments are milestone-based — you release funds only when a verified stage is completed. This protects your investment throughout the build.' },
    { question: 'How long does construction take?', answer: 'A standard G+1 or G+2 home typically takes 10–14 months. We provide a detailed milestone schedule before work begins.' },
    { question: 'Is there a warranty after handover?', answer: 'Yes — every project comes with a 10-year structural warranty plus 1 year of free maintenance for electrical, plumbing, and finishing issues.' },
  ],

  comparison: [
    { factor: 'Detailed project scope before start', dizain: '✅ Always provided', typical: '❌ Rarely done' },
    { factor: 'Fixed price with no hidden costs', dizain: '✅ Written guarantee', typical: '⚠️ Often increases' },
    { factor: 'In-house architect & design', dizain: '✅ Included', typical: '❌ Extra cost' },
    { factor: 'Regular progress updates to client', dizain: '✅ Every stage', typical: '❌ Not standard' },
    { factor: 'Milestone-protected payments', dizain: '✅ All projects', typical: '❌ Lump sum only' },
    { factor: '10-year structural warranty', dizain: '✅ In writing', typical: '❌ Verbal / None' },
  ],

  sectionHeadings: {
    services: {
      eyebrow: 'What We Build',
      heading: 'Every Construction Need, One Trusted Team',
      description: 'From the first drawing to the final key - Dizain manages every stage so you never chase multiple vendors.'
    },
    gallery: {
      eyebrow: 'Our Projects',
      heading: "Homes We've Built Across Chennai",
      description: "Every photo is a family's dream - delivered on time, on budget, and beyond expectation.",
      ctaButton: '📸 Build Your Dream Home Like This →'
    },
    processSteps: {
      eyebrow: 'Our Process',
      heading: 'Your Home in 6 Clear Steps',
      description: 'No confusion, no surprises. Here is exactly what happens from your first call to the day you collect your keys.'
    },
    guarantees: {
      eyebrow: 'Our Commitments',
      heading: 'Promises We Put in Writing',
      description: 'Not marketing claims - written commitments in every contract, backed by 12 years and 120+ projects.'
    },
    packages: {
      eyebrow: 'Construction Packages',
      heading: 'Transparent Pricing for Every Budget',
      description: 'Choose the right package for your needs. All details are editable in the admin panel.'
    },
    testimonials: {
      eyebrow: 'Client Reviews',
      heading: 'What Our Homeowners Say',
      description: 'Real feedback from clients who trusted us to build their most important investment.'
    },
    comparison: {
      eyebrow: 'Why Dizain',
      heading: 'Us vs. Typical Contractors',
      description: 'The difference is not just quality - it is the entire experience from first call to final handover.',
      tableHeaders: {
        column1: 'What matters to you',
        column2: '🏆 Dizain Constructions',
        column3: 'Typical contractor'
      }
    },
    faqs: {
      eyebrow: 'FAQs',
      heading: 'Questions Homeowners Ask'
    },
    cta: {
      eyebrow: 'Start Today',
      heading: 'Ready to Build Your Dream Home?',
      description: 'Free consultation, free site visit, and a detailed cost estimate - all at zero obligation.'
    }
  }
}
