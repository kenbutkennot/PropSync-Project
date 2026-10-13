"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function LandingPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"map" | "whatsapp" | "boundary" | "vault">("map");
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const sampleMessages = [
    {
      label: "Industrial Land (Shah Alam)",
      raw: "WTS: Industrial Land @ Seksyen 15 Shah Alam. Freehold, 5.2 acres, flat land with infra ready. Zoning medium industrial. Asking RM 95 psf negotiable. Direct owner.",
      extracted: {
        title: "Industrial Land @ Seksyen 15",
        category: "Land",
        status: "On Market",
        location: "Seksyen 15, Shah Alam, Selangor",
        tenure: "Freehold",
        acre: "5.2 Acres",
        sqft: "226,512 sqft",
        asking_psf: "RM 95.00 psf",
        total_price: "RM 21,518,640",
      },
    },
    {
      label: "Commercial Lot (Bukit Bintang)",
      raw: "Commercial 4-sty corner shoplot Bukit Bintang near MRT. Built up 8,800 sqft, land area 2,400 sqft. Fully tenanted ROI 4.8%. Asking RM 13.5M. Urgent sale!",
      extracted: {
        title: "4-Sty Corner Shoplot near MRT",
        category: "Commercial",
        status: "On Market",
        location: "Bukit Bintang, Kuala Lumpur",
        tenure: "Freehold",
        acre: "0.055 Acres",
        sqft: "8,800 sqft",
        asking_psf: "RM 1,534 psf",
        total_price: "RM 13,500,000",
      },
    },
  ];

  const [activeSampleIndex, setActiveSampleIndex] = useState(0);

  const faqs = [
    {
      question: "How does the bi-directional Map + Sheet sync work?",
      answer:
        "Every listing row in your database is automatically tied to geospatial coordinates. When you click a row in the table, the map instantly glides to the property, highlights its cadastral parcel boundary, and reveals location insights. Selecting a pin on the map scrolls straight to the property record in your sheet.",
    },
    {
      question: "How does WhatsApp AI extraction convert chat messages?",
      answer:
        "Real estate negotiations happen on WhatsApp. With PropSync, simply copy any messy WhatsApp message, forward, or listing blurb and paste it into the extraction box. Our intelligent parser identifies property type, asking price, psf, land area, tenure, mukim, and lot numbers in milliseconds, ready for one-click saving.",
    },
    {
      question: "Can I draw custom cadastral boundaries for land parcels?",
      answer:
        "Yes! PropSync includes an interactive polygon tool built on Google Maps. You can plot polygon corners directly onto satellite or road views, and PropSync automatically computes acreage, hectares, and square footage while storing the boundary geometry.",
    },
    {
      question: "What file types can I store in the Document Vault?",
      answer:
        "Store cover photos, title deeds (geran tanah), architectural layouts, site plans, valuation reports, and agency agreements directly inside each listing's dedicated vault. Everything is centralized so you never have to search through chat archives or phone camera rolls.",
    },
    {
      question: "Is PropSync built for individual brokers or entire agencies?",
      answer:
        "PropSync is built for both independent commercial brokers and multi-agent agencies who need a fast, real-time shared source of truth for their land and commercial inventory.",
    },
  ];

  return (
    <div className="min-h-full bg-slate-50 text-slate-900 selection:bg-indigo-500 selection:text-white font-sans">
      {/* Search Engine Structured Data (JSON-LD) */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@graph": [
              {
                "@type": "SoftwareApplication",
                "name": "PropSync",
                "applicationCategory": "BusinessApplication",
                "operatingSystem": "Web",
                "description":
                  "The modern command center for land and commercial real estate brokers. Sync spreadsheet listings to Google Maps, draw parcel boundaries, and parse WhatsApp messages straight into structured deals.",
                "offers": {
                  "@type": "Offer",
                  "price": "0",
                  "priceCurrency": "USD",
                },
              },
              {
                "@type": "Organization",
                "name": "PropSync",
                "url": "https://propsync-test.vercel.app",
              },
            ],
          }),
        }}
      />

      {/* Background Decorative Gradients */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[1000px] h-[550px] bg-gradient-to-tr from-indigo-200/40 via-blue-100/30 to-purple-100/40 blur-3xl opacity-70 rounded-full" />
        <div className="absolute top-[600px] -right-40 w-[600px] h-[500px] bg-gradient-to-bl from-indigo-100/40 via-sky-100/20 to-transparent blur-3xl opacity-60 rounded-full" />
      </div>

      {/* Navigation Header */}
      <header className="sticky top-0 z-50 backdrop-blur-md bg-white/80 border-b border-slate-200/80 transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-8">
            <Link href="/" className="flex items-center gap-2.5 group">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-600 to-indigo-700 flex items-center justify-center text-white shadow-md shadow-indigo-500/20 group-hover:scale-105 transition-transform">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                </svg>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-xl tracking-tight text-slate-900">PropSync</span>
                <span className="text-[11px] font-medium tracking-wide uppercase px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200/60">
                  GIS & AI
                </span>
              </div>
            </Link>

            <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600">
              <a href="#features" className="hover:text-indigo-600 transition-colors">Features</a>
              <a href="#how-it-works" className="hover:text-indigo-600 transition-colors">How It Works</a>
              <a href="#extractor-demo" className="hover:text-indigo-600 transition-colors">WhatsApp AI</a>
              <a href="#faq" className="hover:text-indigo-600 transition-colors">FAQ</a>
            </nav>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/login"
              onMouseEnter={() => router.prefetch("/login")}
              className="text-sm font-medium text-slate-700 hover:text-indigo-600 px-3 py-2 transition-colors"
            >
              Sign In
            </Link>
            <Link
              href="/login"
              onMouseEnter={() => router.prefetch("/login")}
              className="inline-flex items-center gap-1.5 text-sm font-medium px-4 py-2 rounded-lg bg-indigo-600 text-white shadow-sm hover:bg-indigo-700 active:scale-[0.98] transition-all"
            >
              <span>Open App</span>
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-16 pb-20 md:pt-24 md:pb-28 overflow-hidden">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 text-center space-y-8">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white border border-indigo-100 shadow-sm text-xs font-medium text-indigo-700">
            <span className="flex h-2 w-2 rounded-full bg-indigo-600 animate-pulse" />
            <span>Built for Commercial & Land Real Estate Brokers</span>
            <span className="text-slate-300">|</span>
            <span className="text-slate-500 font-normal">WhatsApp to GIS Sync</span>
          </div>

          {/* Headline */}
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-slate-900 leading-[1.12]">
            Property listings, mapped & managed in{" "}
            <span className="bg-gradient-to-r from-indigo-600 via-indigo-700 to-blue-600 bg-clip-text text-transparent">
              one unified sheet
            </span>
          </h1>

          {/* Subtitle */}
          <p className="max-w-2xl mx-auto text-lg sm:text-xl text-slate-600 leading-relaxed font-normal">
            Turn disorganized WhatsApp chats into structured property deals, plot cadastral land boundaries on interactive maps, and keep all attachments synced in real-time.
          </p>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <Link
              href="/login"
              onMouseEnter={() => router.prefetch("/login")}
              className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-base shadow-lg shadow-indigo-600/25 hover:shadow-indigo-600/35 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
            >
              <span>Get Started Free</span>
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </Link>
            <a
              href="#extractor-demo"
              className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-white hover:bg-slate-50 text-slate-700 font-medium text-base border border-slate-200/90 shadow-sm active:scale-[0.98] transition-all flex items-center justify-center gap-2"
            >
              <svg className="w-5 h-5 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>Try WhatsApp Extractor</span>
            </a>
          </div>

          {/* Key Value Micro-Tags */}
          <div className="pt-4 flex flex-wrap items-center justify-center gap-y-2 gap-x-6 text-xs text-slate-500">
            <span className="flex items-center gap-1.5">
              <svg className="w-4 h-4 text-emerald-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              Google Maps & GIS Polygons
            </span>
            <span className="flex items-center gap-1.5">
              <svg className="w-4 h-4 text-emerald-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              Instant AI WhatsApp Parser
            </span>
            <span className="flex items-center gap-1.5">
              <svg className="w-4 h-4 text-emerald-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              Full Document & Geran Vault
            </span>
          </div>

          {/* Interactive Hero Product Mockup */}
          <div className="relative pt-6">
            <div className="relative mx-auto max-w-5xl rounded-2xl bg-white border border-slate-200/90 shadow-2xl shadow-indigo-950/10 overflow-hidden text-left">
              {/* Window Header */}
              <div className="h-10 bg-slate-100/90 border-b border-slate-200 px-4 flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-rose-400" />
                  <div className="w-3 h-3 rounded-full bg-amber-400" />
                  <div className="w-3 h-3 rounded-full bg-emerald-400" />
                </div>
                <div className="flex items-center gap-2 bg-white/90 border border-slate-200/80 rounded-md px-3 py-0.5 text-xs text-slate-500 font-mono">
                  <svg className="w-3.5 h-3.5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                  <span>propsync.app/properties</span>
                </div>
                <div className="text-[11px] font-medium text-emerald-600 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded">
                  Live Synced
                </div>
              </div>

              {/* Main App Canvas Mockup */}
              <div className="grid grid-cols-1 lg:grid-cols-12 min-h-[420px] bg-slate-50">
                {/* Left: Interactive Table View */}
                <div className="lg:col-span-7 bg-white border-r border-slate-200 flex flex-col">
                  {/* Table Control Bar */}
                  <div className="p-3 border-b border-slate-200 bg-slate-50/60 flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold uppercase tracking-wider text-slate-600">Properties</span>
                      <span className="text-xs px-2 py-0.5 rounded-full bg-slate-200 text-slate-700 font-medium">32 listings</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs bg-indigo-50 text-indigo-700 border border-indigo-200 px-2.5 py-1 rounded-md font-medium flex items-center gap-1">
                        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        WhatsApp Extract
                      </span>
                    </div>
                  </div>

                  {/* Table Rows */}
                  <div className="divide-y divide-slate-100 text-xs flex-1">
                    {/* Row 1 (Selected) */}
                    <div className="p-3.5 bg-indigo-50/70 border-l-4 border-indigo-600 flex items-start justify-between transition-colors">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-slate-900 text-sm">Shah Alam Seksyen 15 Heavy Industrial</span>
                          <span className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-emerald-100 text-emerald-800">
                            On Market
                          </span>
                        </div>
                        <div className="text-slate-500 flex items-center gap-3">
                          <span>Lot 1042 • Freehold</span>
                          <span>•</span>
                          <span>5.20 Acres</span>
                          <span>•</span>
                          <span className="font-medium text-slate-700">RM 95 / psf</span>
                        </div>
                        <div className="text-[11px] text-indigo-700 font-medium pt-0.5">
                          Total: RM 21,518,640 • 2 Documents Attached
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="inline-block text-[10px] font-semibold text-indigo-600 bg-white border border-indigo-200 rounded px-2 py-1 shadow-2xs">
                          Active Pin 📍
                        </span>
                      </div>
                    </div>

                    {/* Row 2 */}
                    <div className="p-3.5 hover:bg-slate-50 flex items-start justify-between transition-colors">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-slate-800 text-sm">Bukit Bintang 4-Storey Commercial Shoplot</span>
                          <span className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-emerald-100 text-emerald-800">
                            On Market
                          </span>
                        </div>
                        <div className="text-slate-500 flex items-center gap-3">
                          <span>Commercial • Freehold</span>
                          <span>•</span>
                          <span>8,800 sqft</span>
                          <span>•</span>
                          <span className="font-medium text-slate-700">RM 1,534 / psf</span>
                        </div>
                        <div className="text-[11px] text-slate-500">
                          Total: RM 13,500,000 • Tenanted (ROI 4.8%)
                        </div>
                      </div>
                    </div>

                    {/* Row 3 */}
                    <div className="p-3.5 hover:bg-slate-50 flex items-start justify-between transition-colors">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-slate-800 text-sm">Cyberjaya Tech Park Development Parcel</span>
                          <span className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-amber-100 text-amber-800">
                            Negotiation
                          </span>
                        </div>
                        <div className="text-slate-500 flex items-center gap-3">
                          <span>Commercial Land • Leasehold</span>
                          <span>•</span>
                          <span>3.50 Acres</span>
                          <span>•</span>
                          <span className="font-medium text-slate-700">RM 120 / psf</span>
                        </div>
                        <div className="text-[11px] text-slate-500">
                          Total: RM 18,295,200 • Plot Ratio 1:4
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right: Map & Polygon Mockup */}
                <div className="lg:col-span-5 bg-slate-100 relative overflow-hidden flex flex-col items-center justify-center p-4">
                  {/* Mock Map Background Grid */}
                  <div className="absolute inset-0 bg-[radial-gradient(#cbd5e1_1px,transparent_1px)] [background-size:16px_16px] opacity-70" />

                  {/* Mock Road Lines */}
                  <svg className="absolute inset-0 w-full h-full text-slate-300 stroke-current opacity-60" fill="none">
                    <line x1="0" y1="80" x2="500" y2="120" strokeWidth="6" />
                    <line x1="120" y1="0" x2="160" y2="400" strokeWidth="8" />
                    <line x1="320" y1="0" x2="280" y2="400" strokeWidth="5" />
                    <line x1="0" y1="280" x2="500" y2="240" strokeWidth="6" />
                  </svg>

                  {/* Cadastral Polygon Highlight */}
                  <div className="relative z-10 w-full max-w-xs bg-indigo-600/15 border-2 border-indigo-600 rounded-xl p-4 shadow-lg backdrop-blur-xs">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-full bg-indigo-600 animate-ping" />
                        <span className="font-bold text-xs text-indigo-900">Lot 1042 Boundary</span>
                      </div>
                      <span className="text-[10px] font-semibold bg-indigo-600 text-white px-2 py-0.5 rounded">
                        5.20 Acres
                      </span>
                    </div>

                    <div className="bg-white/95 rounded-lg p-2.5 text-xs text-slate-700 space-y-1 shadow-sm border border-slate-100">
                      <div className="font-semibold text-slate-900">Seksyen 15, Shah Alam</div>
                      <div className="text-[11px] text-slate-500">Cadastral Boundary Computed</div>
                      <div className="grid grid-cols-2 gap-1 pt-1 font-mono text-[10px] text-slate-600">
                        <div>LAT: 3.0618° N</div>
                        <div>LNG: 101.5284° E</div>
                      </div>
                    </div>
                  </div>

                  {/* Floating Marker 2 */}
                  <div className="absolute top-12 right-12 z-10 bg-white border border-slate-200 px-2 py-1 rounded shadow-md text-[10px] font-medium text-slate-700 flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                    Bukit Bintang Shoplot
                  </div>

                  {/* Floating Marker 3 */}
                  <div className="absolute bottom-10 left-8 z-10 bg-white border border-slate-200 px-2 py-1 rounded shadow-md text-[10px] font-medium text-slate-700 flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-amber-500" />
                    Cyberjaya Parcel
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Proof Bar */}
      <section className="border-y border-slate-200/80 bg-white py-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-3xl font-extrabold text-indigo-600">10x Faster</div>
              <div className="text-sm font-medium text-slate-600 mt-1">Listing Ingestion</div>
              <div className="text-xs text-slate-400 mt-0.5">From WhatsApp note to database</div>
            </div>
            <div>
              <div className="text-3xl font-extrabold text-slate-900">100% Synced</div>
              <div className="text-sm font-medium text-slate-600 mt-1">GIS Map & Sheet</div>
              <div className="text-xs text-slate-400 mt-0.5">Bi-directional pinpointing</div>
            </div>
            <div>
              <div className="text-3xl font-extrabold text-indigo-600">0 Spreadsheets</div>
              <div className="text-sm font-medium text-slate-600 mt-1">Version Headaches</div>
              <div className="text-xs text-slate-400 mt-0.5">Single source of broker truth</div>
            </div>
            <div>
              <div className="text-3xl font-extrabold text-slate-900">1-Click Draw</div>
              <div className="text-sm font-medium text-slate-600 mt-1">Cadastral Boundaries</div>
              <div className="text-xs text-slate-400 mt-0.5">Auto sqft & acre conversion</div>
            </div>
          </div>
        </div>
      </section>

      {/* Core Features Bento Section */}
      <section id="features" className="py-20 max-w-6xl mx-auto px-4 sm:px-6">
        <div className="text-center max-w-3xl mx-auto space-y-4 mb-16">
          <h2 className="text-xs font-bold uppercase tracking-wider text-indigo-600">Built For Professional Dealmakers</h2>
          <p className="text-3xl sm:text-4xl font-bold tracking-tight text-slate-900">
            Everything commercial brokers need in a single workspace
          </p>
          <p className="text-base text-slate-600">
            Real estate inventory management without the clutter of generic CRMs. Tailored specifically for land, industrial, and commercial listings.
          </p>
        </div>

        {/* Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1: WhatsApp Extractor (Spans 2 cols) */}
          <div className="md:col-span-2 bg-white rounded-2xl border border-slate-200/90 p-8 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden flex flex-col justify-between">
            <div className="space-y-4">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center font-bold text-lg">
                💬
              </div>
              <div>
                <h3 className="text-xl font-bold text-slate-900">Instant WhatsApp & Chat Extraction</h3>
                <p className="text-sm text-slate-600 mt-1">
                  Don't retype property details from co-agent broadcasts or owner texts. Paste the raw message and our AI extracts asking price, tenure, acre/sqft, lot numbers, and location instantly.
                </p>
              </div>
            </div>

            <div className="mt-6 bg-slate-50 border border-slate-200 rounded-xl p-4 text-xs font-mono space-y-2">
              <div className="text-slate-400 uppercase text-[10px] font-sans font-semibold">Raw WhatsApp Message</div>
              <div className="text-slate-700 bg-white p-2.5 rounded border border-slate-200/60 leading-relaxed">
                "Direct owner: Industrial land Seksyen 15 Shah Alam, 5.2ac freehold, asking 95psf nego..."
              </div>
              <div className="flex flex-wrap items-center gap-2 pt-1 font-sans text-xs">
                <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded font-medium">✓ Area: 5.2 Acres</span>
                <span className="bg-indigo-50 text-indigo-700 border border-indigo-200 px-2 py-0.5 rounded font-medium">✓ Price: RM 95 PSF</span>
                <span className="bg-slate-100 text-slate-700 border border-slate-200 px-2 py-0.5 rounded font-medium">✓ Tenure: Freehold</span>
                <span className="bg-slate-100 text-slate-700 border border-slate-200 px-2 py-0.5 rounded font-medium">✓ Mukim: Shah Alam</span>
              </div>
            </div>
          </div>

          {/* Card 2: Interactive Map Sync */}
          <div className="bg-white rounded-2xl border border-slate-200/90 p-8 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between">
            <div className="space-y-4">
              <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-200 text-indigo-600 flex items-center justify-center font-bold text-lg">
                🗺️
              </div>
              <div>
                <h3 className="text-xl font-bold text-slate-900">Map + Sheet in Dual View</h3>
                <p className="text-sm text-slate-600 mt-1">
                  Never lose track of where your land sits. Synchronized Google Maps viewer highlights nearby infrastructure, road access, and competing plots.
                </p>
              </div>
            </div>

            <div className="mt-6 bg-indigo-50/50 rounded-xl p-4 border border-indigo-100 text-xs text-indigo-950 space-y-2">
              <div className="font-semibold flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-indigo-600" />
                Real-Time Coordinate Pinning
              </div>
              <p className="text-slate-600 text-xs">
                Click any row in your table to auto-pan and zoom directly to the site coordinates with zero lag.
              </p>
            </div>
          </div>

          {/* Card 3: Boundary Drawer */}
          <div className="bg-white rounded-2xl border border-slate-200/90 p-8 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between">
            <div className="space-y-4">
              <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center font-bold text-lg">
                📐
              </div>
              <div>
                <h3 className="text-xl font-bold text-slate-900">Cadastral Boundary Drawer</h3>
                <p className="text-sm text-slate-600 mt-1">
                  Draw exact parcel polygons on satellite imagery. PropSync automatically translates boundary polygons into hectares, acres, and square feet.
                </p>
              </div>
            </div>

            <div className="mt-6 border border-slate-200 rounded-xl p-3 bg-slate-50 flex items-center justify-between text-xs">
              <span className="text-slate-600 font-medium">Automatic Unit Conversion</span>
              <span className="bg-white px-2 py-1 rounded shadow-2xs font-mono text-[11px] text-slate-700 border">
                Acres ⇄ Hectares ⇄ Sqft
              </span>
            </div>
          </div>

          {/* Card 4: Document & Title Vault (Spans 2 cols) */}
          <div className="md:col-span-2 bg-white rounded-2xl border border-slate-200/90 p-8 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between">
            <div className="space-y-4">
              <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-200 text-blue-600 flex items-center justify-center font-bold text-lg">
                📂
              </div>
              <div>
                <h3 className="text-xl font-bold text-slate-900">Centralized Document & Title Vault</h3>
                <p className="text-sm text-slate-600 mt-1">
                  Attach cover photos, grant titles (geran), zoning plans, and brochures directly to the listing. Share curated packages with serious buyers in seconds.
                </p>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div className="p-3 rounded-lg border border-slate-200 bg-slate-50/50 flex items-center gap-2.5">
                <span className="text-lg">📜</span>
                <div>
                  <div className="font-semibold text-slate-800">Land Title (Geran)</div>
                  <div className="text-[11px] text-slate-400">PDF • Secure Storage</div>
                </div>
              </div>
              <div className="p-3 rounded-lg border border-slate-200 bg-slate-50/50 flex items-center gap-2.5">
                <span className="text-lg">🖼️</span>
                <div>
                  <div className="font-semibold text-slate-800">Cover & Drone Photos</div>
                  <div className="text-[11px] text-slate-400">High-res aerial imagery</div>
                </div>
              </div>
              <div className="p-3 rounded-lg border border-slate-200 bg-slate-50/50 flex items-center gap-2.5">
                <span className="text-lg">📊</span>
                <div>
                  <div className="font-semibold text-slate-800">Valuation & Plans</div>
                  <div className="text-[11px] text-slate-400">Ready for buyer review</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Interactive WhatsApp Extraction Live Showcase */}
      <section id="extractor-demo" className="py-20 bg-slate-100/70 border-t border-slate-200/80">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="text-center max-w-2xl mx-auto space-y-3 mb-12">
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-600">Experience The Flow</span>
            <h2 className="text-3xl font-bold text-slate-900">See WhatsApp to Listing Extraction in Action</h2>
            <p className="text-sm text-slate-600">
              Select an example WhatsApp message to see how PropSync parses unstructured broker notes into clean property metrics.
            </p>
          </div>

          {/* Interactive Demo Box */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xl overflow-hidden">
            {/* Sample Selector Tabs */}
            <div className="flex border-b border-slate-200 bg-slate-50 px-4 pt-3 gap-2 overflow-x-auto">
              {sampleMessages.map((sample, idx) => (
                <button
                  key={sample.label}
                  onClick={() => setActiveSampleIndex(idx)}
                  className={`px-4 py-2 text-xs font-medium rounded-t-lg transition-colors border-t border-x ${
                    activeSampleIndex === idx
                      ? "bg-white text-indigo-700 border-slate-200 -mb-px font-semibold shadow-2xs"
                      : "text-slate-600 border-transparent hover:text-slate-900"
                  }`}
                >
                  {sample.label}
                </button>
              ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-slate-200">
              {/* Left: WhatsApp Chat View */}
              <div className="p-6 bg-slate-50/40 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                      Incoming WhatsApp Message
                    </span>
                    <span className="text-[11px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded font-medium">
                      Unstructured
                    </span>
                  </div>
                  <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm relative">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-6 h-6 rounded-full bg-emerald-500 text-white flex items-center justify-center text-[10px] font-bold">
                        WA
                      </div>
                      <span className="text-xs font-medium text-slate-700">Land Broker Network</span>
                      <span className="text-[10px] text-slate-400 ml-auto">10:42 AM</span>
                    </div>
                    <p className="text-xs text-slate-800 leading-relaxed font-sans">
                      {sampleMessages[activeSampleIndex].raw}
                    </p>
                  </div>
                </div>

                <div className="mt-6 text-xs text-slate-500 flex items-center gap-2">
                  <svg className="w-4 h-4 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  <span>AI parses tenure, asking PSF, acreage & coordinates in &lt;1s</span>
                </div>
              </div>

              {/* Right: Structured Output Card */}
              <div className="p-6 bg-white flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-xs font-semibold text-indigo-600 uppercase tracking-wider">
                      Extracted Structured Record
                    </span>
                    <span className="text-[11px] bg-indigo-50 text-indigo-700 border border-indigo-200 px-2 py-0.5 rounded font-medium">
                      Ready to Save
                    </span>
                  </div>

                  <div className="space-y-3">
                    <div className="border border-slate-200 rounded-lg p-3 bg-slate-50/50">
                      <div className="text-[10px] text-slate-400 uppercase font-semibold">Title</div>
                      <div className="text-sm font-bold text-slate-900">
                        {sampleMessages[activeSampleIndex].extracted.title}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="border border-slate-200 rounded-lg p-2.5 bg-slate-50/30">
                        <div className="text-[10px] text-slate-400 uppercase">Tenure</div>
                        <div className="font-semibold text-slate-800">
                          {sampleMessages[activeSampleIndex].extracted.tenure}
                        </div>
                      </div>
                      <div className="border border-slate-200 rounded-lg p-2.5 bg-slate-50/30">
                        <div className="text-[10px] text-slate-400 uppercase">Category</div>
                        <div className="font-semibold text-slate-800">
                          {sampleMessages[activeSampleIndex].extracted.category}
                        </div>
                      </div>
                      <div className="border border-slate-200 rounded-lg p-2.5 bg-slate-50/30">
                        <div className="text-[10px] text-slate-400 uppercase">Size / Area</div>
                        <div className="font-semibold text-slate-800">
                          {sampleMessages[activeSampleIndex].extracted.acre} ({sampleMessages[activeSampleIndex].extracted.sqft})
                        </div>
                      </div>
                      <div className="border border-slate-200 rounded-lg p-2.5 bg-slate-50/30">
                        <div className="text-[10px] text-slate-400 uppercase">Asking Price / PSF</div>
                        <div className="font-semibold text-indigo-600">
                          {sampleMessages[activeSampleIndex].extracted.asking_psf}
                        </div>
                      </div>
                    </div>

                    <div className="border border-slate-200 rounded-lg p-2.5 bg-indigo-50/50 flex items-center justify-between text-xs">
                      <span className="text-indigo-900 font-medium">Estimated Total Price:</span>
                      <span className="font-bold text-indigo-700 font-mono text-sm">
                        {sampleMessages[activeSampleIndex].extracted.total_price}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="mt-6 pt-3 border-t border-slate-100 flex items-center justify-end">
                  <Link
                    href="/login"
                    onMouseEnter={() => router.prefetch("/login")}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-600 hover:text-indigo-700"
                  >
                    <span>Try with your own listings</span>
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Step Process */}
      <section id="how-it-works" className="py-20 max-w-6xl mx-auto px-4 sm:px-6">
        <div className="text-center max-w-3xl mx-auto space-y-4 mb-16">
          <h2 className="text-xs font-bold uppercase tracking-wider text-indigo-600">Simple 3-Step Workflow</h2>
          <p className="text-3xl font-bold tracking-tight text-slate-900">
            From raw listing note to mapped inventory in seconds
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
          {/* Step 1 */}
          <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-sm relative">
            <div className="w-8 h-8 rounded-full bg-indigo-600 text-white font-bold text-sm flex items-center justify-center mb-4">
              1
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">Paste or Input</h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              Copy-paste WhatsApp messages, co-agent listings, or draft manually. PropSync's smart parser automatically maps fields into your schema.
            </p>
          </div>

          {/* Step 2 */}
          <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-sm relative">
            <div className="w-8 h-8 rounded-full bg-indigo-600 text-white font-bold text-sm flex items-center justify-center mb-4">
              2
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">Pin & Draw Boundaries</h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              Geocode the parcel location and plot the cadastral boundary polygon directly on the satellite map to visually confirm plot limits.
            </p>
          </div>

          {/* Step 3 */}
          <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-sm relative">
            <div className="w-8 h-8 rounded-full bg-indigo-600 text-white font-bold text-sm flex items-center justify-center mb-4">
              3
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">Attach & Pitch</h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              Store title deeds, layout drawings, and cover photos in the listing vault. Present a unified property dossier to prospective buyers.
            </p>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="py-20 bg-slate-50 border-t border-slate-200/80">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <div className="text-center space-y-3 mb-12">
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-600">Frequently Asked Questions</span>
            <h2 className="text-3xl font-bold text-slate-900">Got questions? We've got answers.</h2>
          </div>

          <div className="space-y-3">
            {faqs.map((faq, i) => {
              const isOpen = openFaq === i;
              return (
                <div
                  key={faq.question}
                  className="bg-white border border-slate-200 rounded-xl overflow-hidden transition-all shadow-2xs"
                >
                  <button
                    onClick={() => setOpenFaq(isOpen ? null : i)}
                    className="w-full px-6 py-4 text-left font-medium text-slate-900 flex items-center justify-between gap-4 hover:bg-slate-50/50"
                  >
                    <span className="text-sm sm:text-base font-semibold">{faq.question}</span>
                    <svg
                      className={`w-5 h-5 text-indigo-600 shrink-0 transition-transform ${
                        isOpen ? "rotate-180" : ""
                      }`}
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  {isOpen && (
                    <div className="px-6 pb-4 pt-1 text-sm text-slate-600 border-t border-slate-100 leading-relaxed">
                      {faq.answer}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Bottom CTA Banner */}
      <section className="py-16 max-w-6xl mx-auto px-4 sm:px-6">
        <div className="relative rounded-3xl bg-gradient-to-br from-indigo-700 via-indigo-600 to-indigo-900 p-8 sm:p-12 text-center text-white overflow-hidden shadow-xl shadow-indigo-950/20">
          {/* Subtle Decorative Circle */}
          <div className="absolute -top-24 -right-24 w-72 h-72 bg-white/10 rounded-full blur-2xl pointer-events-none" />
          <div className="absolute -bottom-24 -left-24 w-72 h-72 bg-indigo-400/20 rounded-full blur-2xl pointer-events-none" />

          <div className="relative z-10 max-w-2xl mx-auto space-y-6">
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
              Ready to bring order to your property listings?
            </h2>
            <p className="text-indigo-100 text-base leading-relaxed">
              Stop juggling disjointed chat notes and unmapped spreadsheets. Start managing your land and commercial deals with PropSync today.
            </p>
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link
                href="/login"
                onMouseEnter={() => router.prefetch("/login")}
                className="w-full sm:w-auto px-7 py-3.5 rounded-xl bg-white text-indigo-700 font-semibold text-sm shadow-md hover:bg-slate-50 active:scale-[0.98] transition-all"
              >
                Sign In to Workspace
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-200/90 bg-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-6 text-sm text-slate-500">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-indigo-600 flex items-center justify-center text-white shadow-xs">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
              </svg>
            </div>
            <span className="font-bold text-slate-900 text-base">PropSync</span>
            <span className="text-slate-400">|</span>
            <span className="text-xs text-slate-500">Geospatial Sheet & Listing Intelligence</span>
          </div>

          <div className="flex items-center gap-6 text-xs text-slate-500">
            <a href="#features" className="hover:text-indigo-600 transition-colors">Features</a>
            <a href="#how-it-works" className="hover:text-indigo-600 transition-colors">Workflow</a>
            <a href="#extractor-demo" className="hover:text-indigo-600 transition-colors">WhatsApp AI</a>
            <a href="#faq" className="hover:text-indigo-600 transition-colors">FAQ</a>
            <Link href="/login" className="hover:text-indigo-600 transition-colors">Sign In</Link>
          </div>

          <div className="text-xs text-slate-400">
            © {new Date().getFullYear()} PropSync. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
