
export interface Location {
  latitude: number;
  longitude: number;
}

export type PlaceType = 'market' | 'service' | 'emergency' | 'lifestyle';

export interface Review {
  id: string;
  rating: number;
  text: string;
  author: string;
  createdAt: number;
  placeTitle?: string;
  placeUri?: string;
}

export interface Report {
  id: string;
  placeTitle: string;
  placeUri: string;
  reason: string;
  timestamp: number;
  status: 'pending' | 'resolved';
}

export interface PlatformInsights {
  totalSearches: number;
  totalStoreClicks: number;
  categoryEngagement: Record<string, number>;
  topSearchTerms: Record<string, number>;
  dailyActivity: { date: string; searches: number; clicks: number }[];
}

export interface PlaceResult {
  title: string;
  uri: string;
  description?: string;
  isPromoted?: boolean;
  isVerified?: boolean;
  lat?: number;
  lng?: number;
  type?: PlaceType;
  distance?: string;
  reviews?: Review[];
}

export interface RecentPlace extends PlaceResult {
  viewedAt: number;
}

export interface WeatherData {
  temp: string;
  condition: string;
  emoji: string;
  locationName: string;
}

export interface SearchResponse {
  text: string;
  places: PlaceResult[];
  error?: string;
}

export interface Category {
  id: string;
  label: string;
  icon: string;
}

export type BillingStatus = 'paid' | 'overdue' | 'trial';

export interface MerchantRequest {
  id: string;
  businessName: string;
  status: 'pending' | 'active';
  bidAmount: number;
  category: string;
  appliedDate: string;
  contactEmail?: string;
  address?: string;
  billingStatus?: BillingStatus;
  visibilityScore?: number;
}

export const CATEGORIES: Category[] = [
  { id: 'food', label: 'Food & Drink', icon: '🍔' },
  { id: 'services', label: 'Pro Services', icon: '🛠️' },
  { id: 'shopping', label: 'Local Markets', icon: '🛍️' },
  { id: 'health', label: 'Medical', icon: '🏥' },
  { id: 'emergency', label: 'Emergency', icon: '🚨' },
  { id: 'tech', label: 'Electronics', icon: '💻' }
];

export const SEARCH_SUGGESTIONS = [
  "Farmers markets", "Reliable plumbers", "24/7 Pharmacies", "Auto repair shops", "Tailors near me", "Fresh produce"
];

export type InfoType = 'terms' | 'privacy' | 'contact' | 'help' | 'economics' | 'infrastructure';

// Localization System
export type LanguageCode = 'en' | 'pidgin' | 'hausa' | 'igbo' | 'yoruba' | 'fr' | 'es' | 'sw';

export interface Language {
  code: LanguageCode;
  label: string;
  flag: string;
}

export const LANGUAGES: Language[] = [
  { code: 'en', label: 'English', flag: '🇺🇸' },
  { code: 'pidgin', label: 'Pidgin', flag: '🇳🇬' },
  { code: 'hausa', label: 'Hausa', flag: '🇳🇬' },
  { code: 'igbo', label: 'Igbo', flag: '🇳🇬' },
  { code: 'yoruba', label: 'Yoruba', flag: '🇳🇬' },
  { code: 'fr', label: 'Français', flag: '🇫🇷' },
  { code: 'es', label: 'Español', flag: '🇪🇸' },
  { code: 'sw', label: 'Swahili', flag: '🇰🇪' },
];

export const TRANSLATIONS: Record<LanguageCode, Record<string, string>> = {
  en: {
    heroTitle: "Find any Market or Service near you.",
    heroSub: "Global AI discovery. Real-time market data. Verified trust.",
    searchPlaceholder: "Ex: 'Plumbers', 'Italian food'...",
    exploreBtn: "Explore Now",
    analyzing: "Analyzing Area...",
    conciergeTitle: "AI Concierge Analysis",
    pulseActive: "AI Discovery Pulse Active",
    viewStore: "View Store",
    report: "Report",
    favorites: "Favorites",
    history: "Your Favorites",
    gridFeed: "Grid Feed",
    mapOverlay: "Map Overlay",
    bizPartners: "Business Partners",
    applyVerify: "Apply for Verification",
    biddingModel: "Bidding Model",
    helpCenter: "Partner Help Center",
    lujoraCore: "Lujora Core",
    globalSolutions: "Global AI Solutions",
    keepExploring: "Keep Exploring",
    noFavorites: "No favorites saved",
    clickHeart: "Click the heart icon on any business card to save it for later.",
    invite: "Invite",
    inviteCopied: "Invite copied!",
    marketDynamics: "Market Dynamics",
    domainMapping: "Domain Mapping",
    infrastructure: "Infrastructure",
    cat_food: "Food & Drink",
    cat_services: "Pro Services",
    cat_shopping: "Local Markets",
    cat_health: "Medical",
    cat_emergency: "Emergency",
    cat_tech: "Electronics"
  },
  pidgin: {
    heroTitle: "Find any Market or Service for your area.",
    heroSub: "Better AI search. Real-time market gist. Legit business dem.",
    searchPlaceholder: "Write wetin you dey find...",
    exploreBtn: "Check am Now",
    analyzing: "I de check area...",
    conciergeTitle: "AI Concierge Gist",
    pulseActive: "AI Discovery de work",
    viewStore: "Check Store",
    report: "Report am",
    favorites: "Fav dem",
    history: "Your Fav Dem",
    gridFeed: "List View",
    mapOverlay: "Map View",
    bizPartners: "Business People",
    applyVerify: "Apply to be Legit",
    biddingModel: "Money Matter",
    helpCenter: "Help Center",
    lujoraCore: "Lujora Main",
    globalSolutions: "World AI Solution",
    keepExploring: "Continue to Check",
    noFavorites: "No fav for here",
    clickHeart: "Press heart for any business card to save am.",
    invite: "Invite Person",
    inviteCopied: "I don copy am!",
    marketDynamics: "Market Matter",
    domainMapping: "Domain Settings",
    infrastructure: "System Settings",
    cat_food: "Chow & Drink",
    cat_services: "Oga Work",
    cat_shopping: "Local Market",
    cat_health: "Hospital",
    cat_emergency: "Urgent Wahala",
    cat_tech: "Computer & Phone"
  },
  hausa: {
    heroTitle: "Nemo kowace Kasuwa ko Sabis kusa da ku.",
    heroSub: "Binciken AI na duniya. Bayanan kasuwa na lokaci-lokaci. Amintaccen tabbaci.",
    searchPlaceholder: "Misali: 'Plumbers', 'Abincin gargajiya'...",
    exploreBtn: "Bincika Yanzu",
    analyzing: "Ana nazarin yankin...",
    conciergeTitle: "Nazarin AI Concierge",
    pulseActive: "Binciken AI yana aiki",
    viewStore: "Duba Shago",
    report: "Kai Kara",
    favorites: "Abubuwan So",
    history: "Abubuwan da ka so",
    gridFeed: "Jerin Grid",
    mapOverlay: "Taswirar Map",
    bizPartners: "Abokan Kasuwanci",
    applyVerify: "Nemi Tabbaci",
    biddingModel: "Tsarin Bidding",
    helpCenter: "Cibiyar Taimako",
    lujoraCore: "Lujora Core",
    globalSolutions: "Hanyoyin AI na Duniya",
    keepExploring: "Ci gaba da bincike",
    noFavorites: "Babu abin so da aka ajiye",
    clickHeart: "Danna alamar zuciya akan kowane katin kasuwanci don adanawa.",
    invite: "Gayyata",
    inviteCopied: "An kwafi gayyata!",
    marketDynamics: "Yanayin Kasuwa",
    domainMapping: "Taswirar Domain",
    infrastructure: "Kayan Aiki",
    cat_food: "Abinci da Abin sha",
    cat_services: "Sabis na Kwararru",
    cat_shopping: "Kasuwannin Gida",
    cat_health: "Lafiya",
    cat_emergency: "Gaggawa",
    cat_tech: "Na'urorin Lantarki"
  },
  igbo: {
    heroTitle: "Chọta ahịa ọ bụla ma ọ bụ ọrụ dị gị nso.",
    heroSub: "Nchọpụta AI zuru ụwa ọnụ. Data ahịa oge. Ntụkwasị obi enyochara.",
    searchPlaceholder: "Dịka: 'Ndị na-arụ mmiri', 'Nri anyị'...",
    exploreBtn: "Chọpụta Ugbu a",
    analyzing: "Na-enyocha mpaghara...",
    conciergeTitle: "Nnyocha AI Concierge",
    pulseActive: "Nchọpụta AI na-arụ ọrụ",
    viewStore: "Lee Ụlọ Ahịa",
    report: "Kpesa",
    favorites: "Ihe kacha amasị",
    history: "Ihe ndị kacha amasị gị",
    gridFeed: "Nlele Grid",
    mapOverlay: "Nlele Map",
    bizPartners: "Ndị mmekọ azụmahịa",
    applyVerify: "Tinye maka nkwenye",
    biddingModel: "Ụdị Bidding",
    helpCenter: "Ebe enyemaka",
    lujoraCore: "Lujora Core",
    globalSolutions: "Ngwọta AI zuru ụwa ọnụ",
    keepExploring: "Gaa n'ihu na-achọgharị",
    noFavorites: "Enweghị ihe amasị echekwara",
    clickHeart: "Pịa akara obi na kaadị azụmahịa ọ bụla iji chekwaa ya.",
    invite: "Kpọọ mmadụ",
    inviteCopied: "Edegharịrị òkù!",
    marketDynamics: "Ọnọdụ Ahịa",
    domainMapping: "Nhazi Domain",
    infrastructure: "Akụrụngwa",
    cat_food: "Nri na Ihe ọṅụṅụ",
    cat_services: "Ọrụ Ndị Ọkachamara",
    cat_shopping: "Ahịa Mpaghara",
    cat_health: "Ahụike",
    cat_emergency: "Ihe mberede",
    cat_tech: "Ngwaọrụ eletrọnịkị"
  },
  yoruba: {
    heroTitle: "Wa ọja tabi iṣẹ eyikeyi nitosi rẹ.",
    heroSub: "Iwari AI agbaye. Data ọja akoko gidi. Igbẹkẹle ti a fọwọsi.",
    searchPlaceholder: "Bi: 'Plumbers', 'Ounje Yoruba'...",
    exploreBtn: "Ṣawari Bayi",
    analyzing: "Ṣiṣayẹwo agbegbe...",
    conciergeTitle: "Itupalẹ AI Concierge",
    pulseActive: "Iwari AI n ṣiṣẹ",
    viewStore: "Wo Ile-itaja",
    report: "Jabo",
    favorites: "Awọn ayanfẹ",
    history: "Awọn ayanfẹ rẹ",
    gridFeed: "Grid kikọ",
    mapOverlay: "Map kikọ",
    bizPartners: "Awọn alabaṣepọ Iṣowo",
    applyVerify: "Waye fun Ijẹrisi",
    biddingModel: "Awoṣe Bidding",
    helpCenter: "Ile-iṣẹ Iranlọwọ",
    lujoraCore: "Lujora Core",
    globalSolutions: "Awọn ojutu AI Agbaye",
    keepExploring: "Tẹsiwaju iṣawari",
    noFavorites: "Ko si ayanfẹ ti a fipamọ",
    clickHeart: "Tẹ aami ọkan lori eyikeyi kaadi iṣowo lati fipamọ.",
    invite: "Pe eniyan",
    inviteCopied: "A ti daakọ ipe!",
    marketDynamics: "Yiyi Ọja",
    domainMapping: "Eto Domain",
    infrastructure: "Amayederun",
    cat_food: "Ounjẹ ati Ohun mimu",
    cat_services: "Awọn iṣẹ Amọdaju",
    cat_shopping: "Awọn ọja agbegbe",
    cat_health: "Ilera",
    cat_emergency: "Pajawiri",
    cat_tech: "Awọn ẹrọ Itanna"
  },
  fr: {
    heroTitle: "Trouvez n'importe quel marché ou service près de chez vous.",
    heroSub: "Découverte IA mondiale. Données de marché en temps réel. Confiance vérifiée.",
    searchPlaceholder: "Ex : 'Plombiers', 'Cuisine italienne'...",
    exploreBtn: "Explorer maintenant",
    analyzing: "Analyse de la zone...",
    conciergeTitle: "Analyse de la conciergerie IA",
    pulseActive: "Pulsion de découverte IA active",
    viewStore: "Voir la boutique",
    report: "Signaler",
    favorites: "Favoris",
    history: "Vos favoris",
    gridFeed: "Grille",
    mapOverlay: "Carte",
    bizPartners: "Partenaires commerciaux",
    applyVerify: "Demander une vérification",
    biddingModel: "Modèle d'enchères",
    helpCenter: "Centre d'aide partenaire",
    lujoraCore: "Lujora Core",
    globalSolutions: "Solutions IA mondiales",
    keepExploring: "Continuer à explorer",
    noFavorites: "Aucun favori enregistré",
    clickHeart: "Cliquez sur l'icône de cœur pour enregistrer une entreprise.",
    invite: "Inviter",
    inviteCopied: "Invitation copiée !",
    marketDynamics: "Dynamique du marché",
    domainMapping: "Mappage de domaine",
    infrastructure: "Infrastructure",
    cat_food: "Alimentation",
    cat_services: "Services Pro",
    cat_shopping: "Marchés locaux",
    cat_health: "Médical",
    cat_emergency: "Urgence",
    cat_tech: "Électronique"
  },
  es: {
    heroTitle: "Encuentra cualquier mercado o servicio cerca de ti.",
    heroSub: "Descubrimiento de IA global. Datos de mercado en tiempo real. Confianza verificada.",
    searchPlaceholder: "Ej: 'Fontaneros', 'Comida italiana'...",
    exploreBtn: "Explorar ahora",
    analyzing: "Analizando área...",
    conciergeTitle: "Análisis de conserjería de IA",
    pulseActive: "Pulso de descubrimiento de IA activo",
    viewStore: "Ver tienda",
    report: "Reportar",
    favorites: "Favoritos",
    history: "Tus favoritos",
    gridFeed: "Vista de cuadrícula",
    mapOverlay: "Mapa",
    bizPartners: "Socios comerciales",
    applyVerify: "Solicitar verificación",
    biddingModel: "Modelo de subasta",
    helpCenter: "Centro de ayuda",
    lujoraCore: "Lujora Core",
    globalSolutions: "Soluciones de IA globales",
    keepExploring: "Seguir explorando",
    noFavorites: "No hay favoritos guardados",
    clickHeart: "Haz clic en el corazón de cualquier tarjeta para guardarla.",
    invite: "Invitar",
    inviteCopied: "¡Invitación copiada!",
    marketDynamics: "Dinámica de mercado",
    domainMapping: "Mapeo de dominio",
    infrastructure: "Infraestructura",
    cat_food: "Comida y bebida",
    cat_services: "Servicios profesionales",
    cat_shopping: "Mercados locales",
    cat_health: "Salud",
    cat_emergency: "Emergencias",
    cat_tech: "Electrónica"
  },
  sw: {
    heroTitle: "Pata soko au huduma yoyote karibu nawe.",
    heroSub: "Ugunduzi wa AI duniani. Data ya soko ya wakati halisi. Imani iliyothibitishwa.",
    searchPlaceholder: "Mfano: 'Fundi bomba', 'Chakula cha asili'...",
    exploreBtn: "Gundua Sasa",
    analyzing: "Inachambua eneo...",
    conciergeTitle: "Uchambuzi wa AI",
    pulseActive: "Ugunduzi wa AI unafanya kazi",
    viewStore: "Angalia Duka",
    report: "Ripoti",
    favorites: "Vipendwa",
    history: "Vipendwa vyako",
    gridFeed: "Gridi",
    mapOverlay: "Ramani",
    bizPartners: "Washirika wa Biashara",
    applyVerify: "Omba Uhakiki",
    biddingModel: "Mfumo wa Zabuni",
    helpCenter: "Kituo cha Msaada",
    lujoraCore: "Lujora Core",
    globalSolutions: "Suluhisho za AI Duniani",
    keepExploring: "Endelea kugundua",
    noFavorites: "Hakuna vipendwa vilivyohifadhiwa",
    clickHeart: "Bofya ikoni ya moyo kwenye kadi yoyote ya biashara ili kuhifadhi.",
    invite: "Alika",
    inviteCopied: "Mwaliko umenakiliwa!",
    marketDynamics: "Mienendo ya Soko",
    domainMapping: "Mipangilio ya Kikoa",
    infrastructure: "Miundombinu",
    cat_food: "Chakula na Vinywaji",
    cat_services: "Huduma za Kitaalamu",
    cat_shopping: "Masoko ya Ndani",
    cat_health: "Afya",
    cat_emergency: "Dharura",
    cat_tech: "Vifaa vya Kielektroniki"
  }
};
