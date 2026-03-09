// ─── Ticker → Sector Mapping ──────────────────────────────────────────────────
// Covers ~300 popular tickers across all GICS sectors.
// Used for auto-populating sector on ticker entry.
// Falls back to manual selection for unknown tickers.

const TICKER_SECTORS: Record<string, string> = {
  // Technology
  AAPL: "Technology", MSFT: "Technology", NVDA: "Technology", TSM: "Technology",
  AVGO: "Technology", ORCL: "Technology", CRM: "Technology", ADBE: "Technology",
  AMD: "Technology", CSCO: "Technology", ACN: "Technology", INTC: "Technology",
  IBM: "Technology", TXN: "Technology", QCOM: "Technology", INTU: "Technology",
  AMAT: "Technology", NOW: "Technology", PANW: "Technology", ADI: "Technology",
  MU: "Technology", LRCX: "Technology", KLAC: "Technology", SNPS: "Technology",
  CDNS: "Technology", MRVL: "Technology", FTNT: "Technology", CRWD: "Technology",
  WDAY: "Technology", TEAM: "Technology", DDOG: "Technology", ZS: "Technology",
  SNOW: "Technology", NET: "Technology", HUBS: "Technology", SHOP: "Technology",
  SQ: "Technology", PLTR: "Technology", U: "Technology", DELL: "Technology",
  HPQ: "Technology", HPE: "Technology", SMCI: "Technology", ARM: "Technology",
  MSTR: "Technology", COIN: "Technology", ANET: "Technology", MCHP: "Technology",
  ON: "Technology", NXPI: "Technology", SWKS: "Technology", MPWR: "Technology",
  KEYS: "Technology", ZBRA: "Technology", TER: "Technology", EPAM: "Technology",
  GLOB: "Technology", DOCU: "Technology", ZEN: "Technology", OKTA: "Technology",
  MDB: "Technology", VEEV: "Technology", BILL: "Technology", TTD: "Technology",
  TWLO: "Technology", ROKU: "Technology", PATH: "Technology", CFLT: "Technology",
  ESTC: "Technology", SAMSF: "Technology", RIOT: "Technology", MARA: "Technology",
  RDDT: "Technology", APP: "Technology", IOT: "Technology", GDDY: "Technology",
  GEN: "Technology", CTSH: "Technology", SPLK: "Technology",

  // Healthcare
  UNH: "Healthcare", LLY: "Healthcare", JNJ: "Healthcare", ABBV: "Healthcare",
  MRK: "Healthcare", TMO: "Healthcare", ABT: "Healthcare", DHR: "Healthcare",
  PFE: "Healthcare", AMGN: "Healthcare", BMY: "Healthcare", ISRG: "Healthcare",
  GILD: "Healthcare", MDT: "Healthcare", ELV: "Healthcare", CI: "Healthcare",
  SYK: "Healthcare", VRTX: "Healthcare", REGN: "Healthcare", BSX: "Healthcare",
  ZTS: "Healthcare", BDX: "Healthcare", HCA: "Healthcare", MCK: "Healthcare",
  EW: "Healthcare", IDXX: "Healthcare", IQV: "Healthcare", A: "Healthcare",
  DXCM: "Healthcare", GEHC: "Healthcare", RMD: "Healthcare", MTD: "Healthcare",
  MRNA: "Healthcare", BIIB: "Healthcare", ILMN: "Healthcare", ALGN: "Healthcare",
  HOLX: "Healthcare", PODD: "Healthcare", CNC: "Healthcare",
  HUM: "Healthcare", MOH: "Healthcare", CAH: "Healthcare", COR: "Healthcare",
  RVTY: "Healthcare", WAT: "Healthcare", TFX: "Healthcare", INCY: "Healthcare",
  NBIX: "Healthcare", EXAS: "Healthcare", SRPT: "Healthcare", PCVX: "Healthcare",
  HIMS: "Healthcare",

  // Financials
  BRK: "Financials", JPM: "Financials", V: "Financials", MA: "Financials",
  BAC: "Financials", WFC: "Financials", GS: "Financials", MS: "Financials",
  SPGI: "Financials", BLK: "Financials", C: "Financials", AXP: "Financials",
  SCHW: "Financials", CB: "Financials", PGR: "Financials", CME: "Financials",
  ICE: "Financials", AON: "Financials", MMC: "Financials", USB: "Financials",
  PNC: "Financials", TFC: "Financials", AIG: "Financials", MET: "Financials",
  PRU: "Financials", ALL: "Financials", TRV: "Financials", AJG: "Financials",
  AFL: "Financials", FIS: "Financials", FITB: "Financials", MTB: "Financials",
  KEY: "Financials", RF: "Financials", CFG: "Financials", HBAN: "Financials",
  STT: "Financials", NTRS: "Financials", DFS: "Financials", SYF: "Financials",
  COF: "Financials", ALLY: "Financials", HOOD: "Financials", SOFI: "Financials",
  "BRK.B": "Financials", "BRK.A": "Financials", PYPL: "Financials",

  // Consumer Discretionary
  AMZN: "Consumer Discretionary", TSLA: "Consumer Discretionary",
  HD: "Consumer Discretionary", MCD: "Consumer Discretionary",
  NKE: "Consumer Discretionary", LOW: "Consumer Discretionary",
  BKNG: "Consumer Discretionary", SBUX: "Consumer Discretionary",
  TJX: "Consumer Discretionary", CMG: "Consumer Discretionary",
  ABNB: "Consumer Discretionary", MAR: "Consumer Discretionary",
  ORLY: "Consumer Discretionary", AZO: "Consumer Discretionary",
  ROST: "Consumer Discretionary", DHI: "Consumer Discretionary",
  LEN: "Consumer Discretionary", GM: "Consumer Discretionary",
  F: "Consumer Discretionary", RIVN: "Consumer Discretionary",
  LCID: "Consumer Discretionary", YUM: "Consumer Discretionary",
  DPZ: "Consumer Discretionary", DARDEN: "Consumer Discretionary",
  LULU: "Consumer Discretionary", DECK: "Consumer Discretionary",
  ULTA: "Consumer Discretionary", BBY: "Consumer Discretionary",
  EBAY: "Consumer Discretionary", ETSY: "Consumer Discretionary",
  W: "Consumer Discretionary", RCL: "Consumer Discretionary",
  CCL: "Consumer Discretionary", NCLH: "Consumer Discretionary",
  LVS: "Consumer Discretionary", WYNN: "Consumer Discretionary",
  MGM: "Consumer Discretionary", DRI: "Consumer Discretionary",
  POOL: "Consumer Discretionary", PHM: "Consumer Discretionary",
  TOL: "Consumer Discretionary", NVR: "Consumer Discretionary",
  DKS: "Consumer Discretionary", FIVE: "Consumer Discretionary",
  BIRK: "Consumer Discretionary", ONON: "Consumer Discretionary",
  CROX: "Consumer Discretionary", DASH: "Consumer Discretionary",
  UBER: "Consumer Discretionary", LYFT: "Consumer Discretionary",

  // Consumer Staples
  PG: "Consumer Staples", KO: "Consumer Staples", PEP: "Consumer Staples",
  COST: "Consumer Staples", WMT: "Consumer Staples", PM: "Consumer Staples",
  MO: "Consumer Staples", MDLZ: "Consumer Staples", CL: "Consumer Staples",
  KMB: "Consumer Staples", GIS: "Consumer Staples", HSY: "Consumer Staples",
  K: "Consumer Staples", SJM: "Consumer Staples", CAG: "Consumer Staples",
  KHC: "Consumer Staples", STZ: "Consumer Staples", BF: "Consumer Staples",
  ADM: "Consumer Staples", TSN: "Consumer Staples", HRL: "Consumer Staples",
  KR: "Consumer Staples", SYY: "Consumer Staples", TGT: "Consumer Staples",
  DG: "Consumer Staples", DLTR: "Consumer Staples", EL: "Consumer Staples",
  CLX: "Consumer Staples", CHD: "Consumer Staples", MKC: "Consumer Staples",
  MNST: "Consumer Staples",

  // Energy
  XOM: "Energy", CVX: "Energy", COP: "Energy", SLB: "Energy",
  EOG: "Energy", MPC: "Energy", PSX: "Energy", VLO: "Energy",
  PXD: "Energy", OXY: "Energy", HES: "Energy", DVN: "Energy",
  WMB: "Energy", KMI: "Energy", OKE: "Energy", HAL: "Energy",
  BKR: "Energy", FANG: "Energy", CTRA: "Energy", APA: "Energy",
  MRO: "Energy", EQT: "Energy", AR: "Energy", SWN: "Energy",
  XEC: "Energy", TRGP: "Energy", ET: "Energy", EPD: "Energy",
  MPLX: "Energy", LNG: "Energy",

  // Industrials
  CAT: "Industrials", GE: "Industrials", UNP: "Industrials",
  HON: "Industrials", RTX: "Industrials", BA: "Industrials",
  LMT: "Industrials", DE: "Industrials", UPS: "Industrials",
  ADP: "Industrials", MMM: "Industrials", GD: "Industrials",
  NOC: "Industrials", ITW: "Industrials", ETN: "Industrials",
  WM: "Industrials", RSG: "Industrials", EMR: "Industrials",
  FDX: "Industrials", CSX: "Industrials", NSC: "Industrials",
  PCAR: "Industrials", JCI: "Industrials", TT: "Industrials",
  CARR: "Industrials", OTIS: "Industrials", ROK: "Industrials",
  CMI: "Industrials", PH: "Industrials", IR: "Industrials",
  GWW: "Industrials", FAST: "Industrials", VRSK: "Industrials",
  AXON: "Industrials", TDG: "Industrials", PWR: "Industrials",
  AME: "Industrials", CPRT: "Industrials", WAB: "Industrials",
  ODFL: "Industrials", XYL: "Industrials", DAL: "Industrials",
  UAL: "Industrials", LUV: "Industrials", AAL: "Industrials",

  // Materials
  LIN: "Materials", APD: "Materials", SHW: "Materials",
  ECL: "Materials", FCX: "Materials", NEM: "Materials",
  NUE: "Materials", DOW: "Materials", DD: "Materials",
  PPG: "Materials", VMC: "Materials", MLM: "Materials",
  ALB: "Materials", CTVA: "Materials", CF: "Materials",
  MOS: "Materials", IFF: "Materials", FMC: "Materials",
  CE: "Materials", EMN: "Materials", BALL: "Materials",
  PKG: "Materials", IP: "Materials", GOLD: "Materials",
  RGLD: "Materials", WPM: "Materials",

  // Real Estate
  PLD: "Real Estate", AMT: "Real Estate", CCI: "Real Estate",
  EQIX: "Real Estate", SPG: "Real Estate", PSA: "Real Estate",
  O: "Real Estate", WELL: "Real Estate", DLR: "Real Estate",
  VICI: "Real Estate", AVB: "Real Estate", EQR: "Real Estate",
  VTR: "Real Estate", ARE: "Real Estate", MAA: "Real Estate",
  ESS: "Real Estate", UDR: "Real Estate", CPT: "Real Estate",
  INVH: "Real Estate", IRM: "Real Estate", SBAC: "Real Estate",
  EXR: "Real Estate", CUBE: "Real Estate", HST: "Real Estate",
  KIM: "Real Estate", REG: "Real Estate",

  // Utilities
  NEE: "Utilities", SO: "Utilities", DUK: "Utilities",
  CEG: "Utilities", AEP: "Utilities", D: "Utilities",
  SRE: "Utilities", PCG: "Utilities", EXC: "Utilities",
  XEL: "Utilities", ED: "Utilities", WEC: "Utilities",
  ES: "Utilities", AWK: "Utilities", DTE: "Utilities",
  ETR: "Utilities", FE: "Utilities", PPL: "Utilities",
  AES: "Utilities", CMS: "Utilities", CNP: "Utilities",
  NI: "Utilities", EVRG: "Utilities", ATO: "Utilities",
  VST: "Utilities", NRG: "Utilities",

  // Communication Services
  GOOGL: "Communication Services", GOOG: "Communication Services",
  META: "Communication Services", NFLX: "Communication Services",
  DIS: "Communication Services", CMCSA: "Communication Services",
  TMUS: "Communication Services", VZ: "Communication Services",
  T: "Communication Services", CHTR: "Communication Services",
  EA: "Communication Services", ATVI: "Communication Services",
  TTWO: "Communication Services", MTCH: "Communication Services",
  ZG: "Communication Services", PINS: "Communication Services",
  SNAP: "Communication Services", RBLX: "Communication Services",
  SPOT: "Communication Services", WBD: "Communication Services",
  PARA: "Communication Services", LYV: "Communication Services",
  OMC: "Communication Services", IPG: "Communication Services",
};

/**
 * Look up the GICS sector for a given ticker symbol.
 * Returns the sector string or null if unknown.
 */
export function lookupSector(ticker: string): string | null {
  const normalized = ticker.toUpperCase().trim();
  return TICKER_SECTORS[normalized] ?? null;
}

/**
 * Check if a ticker exists in our mapping.
 */
export function isKnownTicker(ticker: string): boolean {
  return ticker.toUpperCase().trim() in TICKER_SECTORS;
}

export default TICKER_SECTORS;
