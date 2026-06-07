import { useState, useEffect, useCallback, useRef } from "react";
import FinGuide from "./FinGuide.jsx";
import CanvasBackground from "./CanvasBackground.jsx";
import "./AppBackground.css";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar, Legend,
  LineChart, Line, ComposedChart, ReferenceLine
} from "recharts";
import {
  LayoutDashboard, TrendingUp, TrendingDown, Wallet, Target, CreditCard,
  BarChart2, ArrowLeftRight, Settings, Plus, X, Edit2, Trash2,
  Briefcase, ExternalLink, CheckCircle, Clock, XCircle, AlertCircle,
  RefreshCw, DollarSign, Euro, Star, Send, Eye, Filter, Search,
  Zap, Repeat, ArrowRight
} from "lucide-react";

// �"?�"?�"? THEME �"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?
// ╔══════════════════════════════════════════════════════════════════════╗
// ║  THÈME — Couleurs par défaut (surchargées par THEME_PRESETS au runtime) ║
// ╚══════════════════════════════════════════════════════════════════════╝
const C = {
  sidebar: "#0B1829", sidebarText: "#7A95AF", sidebarBorder: "rgba(255,255,255,0.07)",
  sidebarHover: "rgba(255,255,255,0.04)", sidebarActive: "rgba(99,102,241,0.18)",
  sidebarActiveBorder: "#6366F1", sidebarActiveText: "#C7D2FE",
  bg: "#EEF2F8", card: "#FFFFFF", border: "#E4E9F2",
  text: "#1A2637", muted: "#64748B", faint: "#F4F7FB",
  blue: "#3B82F6", indigo: "#6366F1", green: "#10B981",
  red: "#EF4444", amber: "#F59E0B", purple: "#8B5CF6",
  teal: "#0EA5E9", pink: "#EC4899", gray: "#94A3B8",
};


// ── PERSISTANCE ─────────────────────────────────────────────────────────
const STORAGE_KEY = "fintrack.app.state";

// CURRENCY CONFIG

// ── DEVISES & TAUX ───────────────────────────────────────────────────────
const CURRENCIES = {
  MGA: { symbol: "Ar",   label: "Ariary (MGA)",         flag: "🇲🇬" },
  EUR: { symbol: "€",    label: "Euro (EUR)",            flag: "🇪🇺" },
  USD: { symbol: "$",    label: "Dollar US (USD)",       flag: "🇺🇸" },
  GBP: { symbol: "£",    label: "Livre sterling (GBP)",  flag: "🇬🇧" },
  CHF: { symbol: "CHF",  label: "Franc suisse (CHF)",    flag: "🇨🇭" },
  CAD: { symbol: "CA$",  label: "Dollar canadien (CAD)", flag: "🇨🇦" },
  AUD: { symbol: "A$",   label: "Dollar australien (AUD)", flag: "🇦🇺" },
  JPY: { symbol: "¥",    label: "Yen japonais (JPY)",    flag: "🇯🇵" },
  CNY: { symbol: "¥",    label: "Yuan chinois (CNY)",    flag: "🇨🇳" },
  INR: { symbol: "₹",    label: "Roupie indienne (INR)", flag: "🇮🇳" },
  ZAR: { symbol: "R",    label: "Rand sud-africain (ZAR)", flag: "🇿🇦" },
  KES: { symbol: "KSh",  label: "Shilling kényan (KES)", flag: "🇰🇪" },
  NGN: { symbol: "₦",    label: "Naira nigérian (NGN)",  flag: "🇳🇬" },
  GHS: { symbol: "₵",    label: "Cedi ghanéen (GHS)",    flag: "🇬🇭" },
  XOF: { symbol: "CFA",  label: "Franc CFA Ouest (XOF)", flag: "🌍" },
  XAF: { symbol: "FCFA", label: "Franc CFA Centre (XAF)", flag: "🌍" },
  MAD: { symbol: "MAD",  label: "Dirham marocain (MAD)", flag: "🇲🇦" },
  EGP: { symbol: "E£",   label: "Livre égyptienne (EGP)", flag: "🇪🇬" },
  MUR: { symbol: "₨",    label: "Roupie mauricienne (MUR)", flag: "🇲🇺" },
  AED: { symbol: "د.إ",  label: "Dirham des EAU (AED)",  flag: "🇦🇪" },
  SGD: { symbol: "S$",   label: "Dollar de Singapour (SGD)", flag: "🇸🇬" },
  BRL: { symbol: "R$",   label: "Réal brésilien (BRL)",  flag: "🇧🇷" },
};

// Taux de conversion par défaut (MGA par unité de devise étrangère)
const DEFAULT_RATES_EXTENDED = {
  EUR: 4912, USD: 4500, GBP: 5700, CHF: 5050, CAD: 3300,
  AUD: 2900, JPY: 30,   CNY: 620,  INR: 54,   ZAR: 245,
  KES: 35,   NGN: 3,    GHS: 320,  XOF: 7,    XAF: 7,
  MAD: 450,  EGP: 92,   MUR: 100,  AED: 1225, SGD: 3350,
  BRL: 880,
};

// FREELANCE PLATFORMS

// ── DONNÉES INITIALES & RÉFÉRENTIELS ────────────────────────────────────
const PLATFORMS = [
  { id: "upwork",    name: "Upwork",       url: "https://www.upwork.com",         color: "#14a800", emoji: "UP", desc: "Plateforme leader mondiale, ideal pour les missions long terme" },
  { id: "freelancer",name: "Freelancer",   url: "https://www.freelancer.com",     color: "#0083CA", emoji: "FR", desc: "Grande variete de projets, appels d'offres en temps reel" },
  { id: "malt",      name: "Malt",         url: "https://www.malt.com",           color: "#FC4B08", emoji: "MT", desc: "Top plateforme francophone, fort en Europe et a Madagascar" },
  { id: "fiverr",    name: "Fiverr",       url: "https://www.fiverr.com",         color: "#1DBF73", emoji: "FV", desc: "Services a la demande, forfaits fixes, ideal pour debuter" },
  { id: "toptal",    name: "Toptal",       url: "https://www.toptal.com",         color: "#204ECF", emoji: "TT", desc: "Top 3% des freelances, tarifs premium, selection stricte" },
  { id: "99designs", name: "99designs",    url: "https://99designs.com",          color: "#8B5CF6", emoji: "99", desc: "Specialise design graphique, logo, identite visuelle" },
  { id: "guru",      name: "Guru",         url: "https://www.guru.com",           color: "#F59E0B", emoji: "⭐", desc: "Profil détaillé, workrooms collaboratifs" },
  { id: "linkedin",  name: "LinkedIn Jobs",url: "https://www.linkedin.com/jobs",  color: "#0A66C2", emoji: "LI", desc: "Reseau professionnel, offres CDI et freelance" },
  { id: "remote",    name: "Remote.co",    url: "https://remote.co/remote-jobs",  color: "#00B4D8", emoji: "RM", desc: "Jobs 100% remote, ideal depuis Madagascar" },
  { id: "weworkremotely", name: "We Work Remotely", url: "https://weworkremotely.com", color: "#4ADE80", emoji: "WR", desc: "Meilleures offres remote tech et design" },
  { id: "dynamiteJobs", name: "Dynamite Jobs", url: "https://dynamitejobs.com",   color: "#F97316", emoji: "DJ", desc: "Jobs remote tries sur le volet" },
  { id: "jobboard",  name: "Madagascar Job Board", url: "https://www.tanjoby.com",color: "#E63946", emoji: "MG", desc: "Offres locales Madagascar, BPO et services" },
  { id: "contra",    name: "Contra",       url: "https://contra.com",             color: "#111827", emoji: "CT", desc: "Portfolios premium et missions sans commission cote freelance" },
  { id: "peopleperhour", name: "PeoplePerHour", url: "https://www.peopleperhour.com", color: "#FF6B6B", emoji: "PH", desc: "Plateforme flexible pour missions courtes et clients PME" },
  { id: "wellfound", name: "Wellfound",    url: "https://wellfound.com/jobs",     color: "#7C3AED", emoji: "WF", desc: "Startups internationales, remote et opportunites croissance" },
  { id: "indeed",    name: "Indeed",       url: "https://www.indeed.com",         color: "#2557A7", emoji: "ID", desc: "Grand volume d'offres, utile pour les postes operations et analyste" },
  { id: "remotive",  name: "Remotive",     url: "https://remotive.com",           color: "#06B6D4", emoji: "RV", desc: "Selection remote qualifiee pour support, ops, data et marketing" },
  { id: "workingnomads", name: "Working Nomads", url: "https://www.workingnomads.com/jobs", color: "#16A34A", emoji: "WN", desc: "Remote international avec filtres clairs par metier" },
  { id: "flexjobs",  name: "FlexJobs",     url: "https://www.flexjobs.com",       color: "#1D4ED8", emoji: "FX", desc: "Remote et hybride plus qualitatif, pratique pour le moyen terme" },
  { id: "arc",       name: "Arc",          url: "https://arc.dev/remote-jobs",     color: "#0F172A", emoji: "AR", desc: "Missions remote tech, filtre par stack et niveau d'experience" },
  { id: "gunio",     name: "Gun.io",       url: "https://gun.io",                   color: "#0EA5E9", emoji: "GN", desc: "Missions premium pour devs freelance, matching qualifie" },
  { id: "himalayas", name: "Himalayas",    url: "https://himalayas.app/jobs",       color: "#14B8A6", emoji: "HM", desc: "Offres remote internationales avec recherche par fuseau" },
  { id: "otta",      name: "Otta",         url: "https://otta.com/jobs",            color: "#7C3AED", emoji: "OT", desc: "Startups et scale-ups, bon pour roles operations et produit" },
  { id: "glassdoor", name: "Glassdoor",    url: "https://www.glassdoor.com/Job",    color: "#10B981", emoji: "GD", desc: "Volume d'offres eleve et infos salaires/entreprises" },
  { id: "simplyhired", name: "SimplyHired",url: "https://www.simplyhired.com",      color: "#2563EB", emoji: "SH", desc: "Agregateur d'offres utile pour multiplier les candidatures" },
  { id: "jooble",    name: "Jooble",       url: "https://jooble.org",               color: "#F97316", emoji: "JB", desc: "Moteur d'emploi global pour trouver plus d'annonces rapidement" },
  { id: "talent",    name: "Talent.com",   url: "https://www.talent.com",           color: "#DC2626", emoji: "TL", desc: "Offres internationales avec couverture large par metier" },
  { id: "jobgether", name: "Jobgether",    url: "https://jobgether.com",            color: "#8B5CF6", emoji: "JG", desc: "Plateforme focalisee remote avec matching par preferences" },
  { id: "nodesk",    name: "NoDesk",       url: "https://nodesk.co/remote-jobs",    color: "#06B6D4", emoji: "ND", desc: "Selection d'offres remote, pratique pour veille quotidienne" },
  { id: "comeup",    name: "ComeUp",       url: "https://www.comeup.com",         color: "#EC4899", emoji: "CU", desc: "Services packagés francophones, utile pour debuter et tester des offres" },
];

const JOB_STATUSES = [
  { id: "applied",   label: "Candidate",   color: "#3B82F6", icon: "AP", bg: "#EFF6FF" },
  { id: "pending",   label: "En attente",  color: "#F59E0B", icon: "⏳", bg: "#FFFBEB" },
  { id: "interview", label: "Entretien",   color: "#8B5CF6", icon: "ITV", bg: "#F5F3FF" },
  { id: "offer",     label: "Offre recue", color: "#10B981", icon: "OFF", bg: "#ECFDF5" },
  { id: "accepted",  label: "Accepte",     color: "#10B981", icon: "OK", bg: "#ECFDF5" },
  { id: "rejected",  label: "Rejete",      color: "#EF4444", icon: "NO", bg: "#FEF2F2" },
  { id: "withdrawn", label: "Retire",      color: "#94A3B8", icon: "RET", bg: "#F8FAFC" },
];

const JOB_TYPES = ["Freelance", "CDI", "CDD", "Temps partiel", "Stage", "Projet ponctuel"];

// FREQUENCES POUR TRANSACTIONS
const TX_FREQUENCIES = [
  { id: "once", label: "Ponctuel", multiplier: 1 },
  { id: "daily", label: "Journalier", multiplier: 30 },
  { id: "weekly", label: "Hebdomadaire", multiplier: 4.33 },
  { id: "monthly", label: "Mensuel", multiplier: 1 },
  { id: "yearly", label: "Annuel", multiplier: 1/12 },
];

// �"?�"?�"? INITIAL DATA �"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?
const initTx = [];

const initGoals = [];

const initJobs = [];

const initRecurring = [];


// ── OPTIONS INTERFACE ────────────────────────────────────────────────────
const ACCENT_OPTIONS = [
  "#6366F1", "#3B82F6", "#0EA5E9", "#10B981", "#F59E0B", "#EF4444", "#EC4899", "#8B5CF6",
];

const DEFAULT_CHART_SERIES_CONFIG = [
  { key: "rPast",   label: "Revenus reçus",         type: "bar",  color: "#10B981", visible: true },
  { key: "rFuture", label: "Revenus à venir",       type: "bar",  color: "#F59E0B", visible: true },
  { key: "dPaid",   label: "Dépenses effectuées",   type: "bar",  color: "#EF4444", visible: true },
  { key: "dUnpaid", label: "Dépenses à venir",      type: "bar",  color: "#FB923C", visible: true },
  { key: "e",       label: "Solde réel",            type: "line", color: "#3B82F6", visible: true },
];

const DEFAULT_STATBARS_CONFIG = [
  { key: "r", label: "Revenus",  type: "bar",  color: "#10B981", visible: true },
  { key: "d", label: "Dépenses", type: "bar",  color: "#EF4444", visible: true },
];

const DEFAULT_STATSAV_CONFIG = [
  { key: "net",  label: "Solde net", type: "bar",  color: "#10B981", negColor: "#EF4444", visible: true },
  { key: "line", label: "Courbe",    type: "line", color: "#3B82F6", visible: true },
];

const CHART_VISUAL_VARIANTS = [
  { id: "classic", label: "Classique", barSizeDay: 18, barSize: 36, barGap: 2,  barCategoryGap: "20%", barRadius: [4, 4, 0, 0], barOpacity: 0.86, barShadow: false, barGradient: false, gridDash: "3 3", lineType: "monotone", lineWidth: 2.4, lineDot: 3, areaOpacity: 0.25 },
  { id: "soft", label: "Soft", barSizeDay: 16, barSize: 32, barGap: 4,  barCategoryGap: "24%", barRadius: [8, 8, 0, 0], barOpacity: 0.78, barShadow: false, barGradient: true,  gridDash: "2 3", lineType: "monotone", lineWidth: 2.2, lineDot: 2, areaOpacity: 0.2 },
  { id: "shadow", label: "Ombres", barSizeDay: 18, barSize: 34, barGap: 3,  barCategoryGap: "22%", barRadius: [6, 6, 0, 0], barOpacity: 0.9,  barShadow: true,  barGradient: false, gridDash: "3 3", lineType: "monotone", lineWidth: 2.6, lineDot: 3, areaOpacity: 0.22 },
  { id: "capsule", label: "Capsule", barSizeDay: 14, barSize: 28, barGap: 6,  barCategoryGap: "28%", barRadius: [14, 14, 0, 0], barOpacity: 0.88, barShadow: true,  barGradient: true,  gridDash: "4 4", lineType: "monotone", lineWidth: 2.1, lineDot: 2, areaOpacity: 0.18 },
  { id: "dense", label: "Dense", barSizeDay: 22, barSize: 40, barGap: 1,  barCategoryGap: "8%",  barRadius: [3, 3, 0, 0], barOpacity: 0.84, barShadow: false, barGradient: false, gridDash: "2 2", lineType: "linear",   lineWidth: 2.1, lineDot: 2, areaOpacity: 0.16 },
  { id: "thin", label: "Fin", barSizeDay: 10, barSize: 20, barGap: 8,  barCategoryGap: "32%", barRadius: [4, 4, 0, 0], barOpacity: 0.82, barShadow: false, barGradient: true,  gridDash: "1 4", lineType: "linear",   lineWidth: 1.9, lineDot: 2, areaOpacity: 0.14 },
  { id: "step", label: "Escaliers", barSizeDay: 17, barSize: 34, barGap: 2,  barCategoryGap: "18%", barRadius: [5, 5, 0, 0], barOpacity: 0.86, barShadow: true,  barGradient: false, gridDash: "3 3", lineType: "stepAfter", lineWidth: 2.5, lineDot: 2, areaOpacity: 0.2 },
  { id: "spark", label: "Spark", barSizeDay: 12, barSize: 24, barGap: 6,  barCategoryGap: "30%", barRadius: [10, 10, 0, 0], barOpacity: 0.8,  barShadow: true,  barGradient: true,  gridDash: "2 5", lineType: "monotone", lineWidth: 2.8, lineDot: 4, areaOpacity: 0.28 },
  { id: "clean", label: "Clean", barSizeDay: 15, barSize: 30, barGap: 3,  barCategoryGap: "24%", barRadius: [4, 4, 0, 0], barOpacity: 0.8,  barShadow: false, barGradient: false, gridDash: "0 0", lineType: "linear",   lineWidth: 2.3, lineDot: 0, areaOpacity: 0.16 },
  { id: "contrast", label: "Contraste", barSizeDay: 18, barSize: 36, barGap: 2,  barCategoryGap: "18%", barRadius: [6, 6, 0, 0], barOpacity: 0.95, barShadow: true,  barGradient: true,  gridDash: "3 2", lineType: "monotone", lineWidth: 3,   lineDot: 4, areaOpacity: 0.3 },
  { id: "volume", label: "Volume", barSizeDay: 20, barSize: 42, barGap: 0,  barCategoryGap: "12%", barRadius: [7, 7, 0, 0], barOpacity: 0.88, barShadow: true,  barGradient: false, gridDash: "2 3", lineType: "step",    lineWidth: 2.4, lineDot: 2, areaOpacity: 0.22 },
  { id: "neon", label: "Neon", barSizeDay: 16, barSize: 30, barGap: 4,  barCategoryGap: "26%", barRadius: [8, 8, 0, 0], barOpacity: 0.9,  barShadow: true,  barGradient: true,  gridDash: "1 3", lineType: "monotone", lineWidth: 2.9, lineDot: 5, areaOpacity: 0.32 },
];


// ── THÈMES VISUELS ───────────────────────────────────────────────────────
const THEME_PRESETS = {
  ocean: {
    id: "ocean",
    label: "Ocean",
    sidebar: "#0B1829",
    sidebarText: "#7A95AF",
    sidebarBorder: "rgba(255,255,255,0.07)",
    sidebarActiveText: "#C7D2FE",
    bg: "#EEF2F8",
    card: "#FFFFFF",
    border: "#E4E9F2",
    text: "#1A2637",
    muted: "#64748B",
    faint: "#F4F7FB",
  },
  graphite: {
    id: "graphite",
    label: "Graphite",
    sidebar: "#111827",
    sidebarText: "#94A3B8",
    sidebarBorder: "rgba(255,255,255,0.08)",
    sidebarActiveText: "#E5E7EB",
    bg: "#F3F4F6",
    card: "#FFFFFF",
    border: "#D1D5DB",
    text: "#111827",
    muted: "#6B7280",
    faint: "#F9FAFB",
  },
  sunrise: {
    id: "sunrise",
    label: "Sunrise",
    sidebar: "#1F2937",
    sidebarText: "#C4B5FD",
    sidebarBorder: "rgba(255,255,255,0.08)",
    sidebarActiveText: "#F5F3FF",
    bg: "#FFF7ED",
    card: "#FFFFFF",
    border: "#FED7AA",
    text: "#3F2A1D",
    muted: "#8A6B57",
    faint: "#FFF1E6",
  },
  forest: {
    id: "forest",
    label: "Forest",
    sidebar: "#0F172A",
    sidebarText: "#A7F3D0",
    sidebarBorder: "rgba(255,255,255,0.08)",
    sidebarActiveText: "#ECFDF5",
    bg: "#ECFDF5",
    card: "#FFFFFF",
    border: "#BBF7D0",
    text: "#163127",
    muted: "#4B6B60",
    faint: "#F0FDF4",
  },
};

const APP_DESIGN_PRESETS = [
  {
    id: "classic",
    label: "Classique",
    description: "Fond clair standard FinTrack",
  },
  {
    id: "portfolio",
    label: "Neon",
    description: "Fond sombre avec glow et particules",
  },
];

const NEON_THEME_OVERRIDES = {
  sidebar: "#05070E",
  sidebarText: "rgba(232,234,246,0.68)",
  sidebarBorder: "rgba(255,255,255,0.12)",
  sidebarActiveText: "#E8EAF6",
  bg: "#050508",
  card: "rgba(255,255,255,0.03)",
  border: "rgba(255,255,255,0.14)",
  text: "#E8EAF6",
  muted: "rgba(232,234,246,0.56)",
  faint: "rgba(255,255,255,0.015)",
  blue: "#52A7FF",
  green: "#00FFA3",
  red: "#FF6B6B",
  amber: "#FF9F43",
  purple: "#A78BFA",
  teal: "#22D3EE",
  pink: "#FF7AC6",
  gray: "#94A3B8",
};

const JOB_PAYMENT_MODES = [
  { id: "none", label: "Aucun ajout auto" },
  { id: "monthly", label: "Salaire mensuel" },
  { id: "one_time", label: "Paiement unique" },
  { id: "per_mission", label: "Paiement par mission" },
];


// ── CATÉGORIES & MÉTADONNÉES ─────────────────────────────────────────────
const CATEGORIES = ["Logement","Alimentation","Transport","Loisirs","Sante","Abonnements","Revenu","Autres","Epargne"];
const RECURRING_TYPE_OPTIONS = [
  { id: "expense", label: "Depense" },
  { id: "income", label: "Revenu" },
];
const RECURRING_EXPENSE_CATEGORIES = [
  "Logement",
  "Loyer",
  "Dette",
  "Remboursement dette",
  "Dette familiale",
  "Dette ami",
  "Dette bancaire",
  "Pret",
  "Pret immobilier",
  "Pret personnel",
  "Remboursement pret",
  "Credit auto",
  "Credit consommation",
  "Carte de credit",
  "Microcredit",
  "Decouvert bancaire",
  "Facture eau",
  "Facture electricite",
  "Facture internet",
  "Facture telephone",
  "Assurance",
  "Impot",
  "Taxe",
  "Alimentation",
  "Transport",
  "Sante",
  "Abonnements",
  "Epargne",
  "Autres",
];
const RECURRING_EXPENSE_CATEGORY_OPTIONS = Array.from(
  new Set([...RECURRING_EXPENSE_CATEGORIES, ...CATEGORIES.filter(c => c !== "Revenu")])
);
const CURRENT_YEAR = new Date().getFullYear();
const MONTHS = Array.from({ length: 12 }, (_, i) =>
  new Date(CURRENT_YEAR, i, 1).toLocaleDateString("fr-FR", { month: "long", year: "numeric" })
    .replace(/^./, c => c.toUpperCase())
);




// ── PROFIL PAR DÉFAUT ────────────────────────────────────────────────────
const PROFILE_DEFAULT = {
  fullName: "",
  email: "",
  phone: "",
  location: "",
};


// ── CATÉGORIES DE DÉPENSES (couleurs & icônes) ───────────────────────────
const CATEGORY_META = [
  { name: "Logement", color: C.blue },
  { name: "Alimentation", color: C.green },
  { name: "Transport", color: C.amber },
  { name: "Loisirs", color: C.purple },
  { name: "Sante", color: C.teal },
  { name: "Abonnements", color: C.pink },
  { name: "Autres", color: C.gray },
  { name: "Epargne", color: C.indigo },
];

const normalizeCategory = (value = "") => value.normalize("NFD").replace(/[\u0300-\u036f]/g, "");

const CATEGORY_COLOR_MAP = CATEGORY_META.reduce((acc, item) => {
  acc[item.name] = item.color;
  acc[normalizeCategory(item.name)] = item.color; // clé normalisée aussi
  return acc;
}, {});


// ── BUDGETS INITIAUX ─────────────────────────────────────────────────────
const INITIAL_BUDGETS = [];


// ── UTILITAIRES DATE ─────────────────────────────────────────────────────
const formatDateValue = (date) => {
  const offset = date.getTimezoneOffset() * 60000;
  return new Date(date.getTime() - offset).toISOString().split("T")[0];
};

const getToday = () => formatDateValue(new Date());


// ── FACTORIES FORMULAIRES ────────────────────────────────────────────────
const createTxForm = (type = "expense") => ({
  type,
  desc: "",
  cat: type === "income" ? "Revenu" : "Alimentation",
  amount: "",
  date: getToday(),
  frequency: "once",
});

const createGoalForm = () => ({
  name: "",
  target: "",
  saved: "",
  emoji: "OBJ",
  deadline: "",
  color: C.blue,
});

const createJobForm = (defaultPlatform = "upwork") => ({
  title: "",
  company: "",
  platform: defaultPlatform,
  type: "Freelance",
  status: "applied",
  appliedDate: getToday(),
  salary: "",
  salaryCurrency: "MGA",
  paymentMode: "none",
  paymentAutoAdd: false,
  paymentStartDate: "",
  paymentEndDate: "",
  notes: "",
  link: "",
});

const createRecurringForm = () => ({
  desc: "",
  type: "expense",
  cat: "Logement",
  amount: "",
  startDate: getToday(),
  endDate: "",
  dayOfMonth: new Date().getDate(),
  frequency: "monthly",
  active: true,
  kind: "standard",
  penaltyAmount: 25000,
  loanTotalAmount: "",
  paymentStatuses: {},
});

const createPlatformForm = () => ({
  name: "",
  url: "",
  emoji: "PF",
  color: C.indigo,
  desc: "",
});


// ── PERSISTANCE LOCALE ───────────────────────────────────────────────────
const loadStoredValue = (key, fallback) => {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return fallback;
    const parsed = JSON.parse(raw);
    return parsed?.[key] ?? fallback;
  } catch {
    return fallback;
  }
};

// Fonction pour afficher les données brutes du localStorage dans la console
window.showRawData = () => {
  if (typeof window === "undefined") return;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      console.log("Aucune donnée trouvée dans localStorage");
      return;
    }
    console.log("=== DONNÉES BRUTES LOCALSTORAGE ===");
    console.log(JSON.parse(raw));
    console.log("=== FIN ===");
  } catch (e) {
    console.error("Erreur lecture localStorage:", e);
  }
};


// ── NAVIGATION ───────────────────────────────────────────────────────────
const NAV = [
  { id: "dashboard",    label: "Tableau de bord", icon: LayoutDashboard, section: "workspace" },
  { id: "revenus",      label: "Revenus",         icon: TrendingUp,      section: "workspace" },
  { id: "depenses",     label: "Dépenses",        icon: TrendingDown,    section: "workspace" },
  { id: "budget",       label: "Budget",          icon: CreditCard,      section: "workspace" },
  { id: "objectifs",    label: "Objectifs",       icon: Target,          section: "workspace" },
  { id: "transactions", label: "Transactions",    icon: ArrowLeftRight,  section: "workspace" },
  { id: "plan_action",  label: "Plan d'action",   icon: BarChart2,       section: "workspace" },
  { id: "suivi_taf",    label: "Suivi de Taf",    icon: Briefcase,       section: "preferences" },
  { id: "parametres",   label: "Paramètres",      icon: Settings,        section: "preferences" },
];

// �"?�"?�"? HELPERS �"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?

// ── UTILITAIRES FORMATAGE ────────────────────────────────────────────────
const addSpaces = (num) =>
  Math.round(Math.abs(num)).toString().replace(/\B(?=(\d{3})+(?!\d))/g, "\u202F");

const fmt = (n, currency, rates) => {
  const abs = Math.abs(n);
  if (currency === "MGA") return addSpaces(abs) + "\u00A0Ar";
  const currInfo = CURRENCIES[currency];
  const rate = rates?.[currency] || DEFAULT_RATES_EXTENDED[currency] || 1;
  const v = abs / rate;
  const sym = currInfo?.symbol || currency;
  return sym + "\u00A0" + addSpaces(v);
};

const fmtCompact = (n, currency, rates) => {
  const abs = Math.abs(n);
  const compact = (val, suffix) => {
    if (val >= 1e9) return (val / 1e9).toFixed(1).replace(".", ",") + "\u00A0G" + suffix;
    if (val >= 1e6) return (val / 1e6).toFixed(1).replace(".", ",") + "\u00A0M" + suffix;
    if (val >= 1e3) return (val / 1e3).toFixed(0) + "\u00A0k" + suffix;
    return Math.round(val) + "\u00A0" + suffix;
  };
  if (currency === "MGA") return compact(abs, "Ar");
  const currInfo = CURRENCIES[currency];
  const rate = rates?.[currency] || DEFAULT_RATES_EXTENDED[currency] || 1;
  const sym = currInfo?.symbol || currency;
  return compact(abs / rate, sym);
};


const hexToRgba = (hex, alpha) => {
  const clean = hex.replace("#", "");
  if (clean.length !== 6) return hex;
  const r = parseInt(clean.slice(0, 2), 16);
  const g = parseInt(clean.slice(2, 4), 16);
  const b = parseInt(clean.slice(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

const shiftHexColor = (hex, amount) => {
  const clean = hex.replace("#", "");
  if (clean.length !== 6) return hex;
  const clamp = (val) => Math.max(0, Math.min(255, val));
  const r = clamp(parseInt(clean.slice(0, 2), 16) + amount);
  const g = clamp(parseInt(clean.slice(2, 4), 16) + amount);
  const b = clamp(parseInt(clean.slice(4, 6), 16) + amount);
  return `#${[r, g, b].map(v => v.toString(16).padStart(2, "0")).join("")}`;
};

const ThreeDBarShape = ({ x, y, width, height, fill, opacity = 1, shadow = false }) => {
  if (width <= 0 || height <= 0) return null;
  const depth = Math.max(3, Math.min(8, Math.round(width * 0.17)));
  const frontColor = fill;
  const topColor = shiftHexColor(fill, 28);
  const sideColor = shiftHexColor(fill, -22);
  const shadowColor = shiftHexColor(fill, -55);
  return (
    <g>
      {shadow && (
        <ellipse
          cx={x + width / 2 + depth / 2}
          cy={y + height + 3}
          rx={Math.max(8, width * 0.55)}
          ry={3.5}
          fill={shadowColor}
          opacity={0.18}
        />
      )}
      <rect x={x} y={y} width={width} height={height} fill={frontColor} fillOpacity={opacity} rx={2} />
      <path d={`M${x} ${y} L${x + depth} ${y - depth} L${x + width + depth} ${y - depth} L${x + width} ${y} Z`} fill={topColor} fillOpacity={Math.min(1, opacity + 0.06)} />
      <path d={`M${x + width} ${y} L${x + width + depth} ${y - depth} L${x + width + depth} ${y + height - depth} L${x + width} ${y + height} Z`} fill={sideColor} fillOpacity={Math.max(0.55, opacity - 0.05)} />
    </g>
  );
};


// ── UTILITAIRES CLÉS MOIS ────────────────────────────────────────────────
const monthKeyFromDate = (date) => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;


// ── CONSTRUCTION DES TRANSACTIONS RÉCURRENTES ────────────────────────────
const buildRecurringTransactions = (items, baseDate) => items.flatMap(item => {
  if (!item.active || !item.startDate) return [];
  const freq = item.frequency || "monthly";
  const startDate = new Date(item.startDate);
  // Normaliser en heure locale pour éviter le bug UTC (date ISO parsée minuit UTC ≠ minuit local)
  const startDateNorm = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate());

  // Calculer la date limite selon la fréquence pour couvrir une fenêtre étendue
  const today = new Date(baseDate);
  today.setHours(0, 0, 0, 0);
  let limitDate = new Date(today);
  limitDate.setHours(23, 59, 59, 999);

  if (freq === "daily") {
    // Couvrir toute l'année en cours (365 jours)
    limitDate = new Date(today.getFullYear(), 11, 31, 23, 59, 59, 999);
  } else if (freq === "weekly") {
    // Couvrir toute l'année en cours
    limitDate = new Date(today.getFullYear(), 11, 31, 23, 59, 59, 999);
  } else if (freq === "monthly") {
    // Couvrir toute l'année en cours
    limitDate = new Date(today.getFullYear(), 11, 31, 23, 59, 59, 999);
  } else if (freq === "yearly") {
    // Couvrir 5 ans (A à A+4)
    limitDate = new Date(today.getFullYear() + 5, 11, 31);
    limitDate.setHours(23, 59, 59, 999);
  }
  
  const rawEndDate = item.endDate ? new Date(item.endDate) : limitDate;
  const endDate = rawEndDate > limitDate ? limitDate : rawEndDate;
  if (startDateNorm > endDate) return [];

  const freqLabels = { daily: "Journalier", weekly: "Hebdomadaire", monthly: "Mensuel", yearly: "Annuel" };
  const freqLabel = freqLabels[freq] || "Mensuel";
  const autoLabel = item.kind === "loan" ? `${freqLabel} prêt` : `${freqLabel} automatique`;

  // Fabrique une transaction pour une date donnée
  const makeEntry = (date) => {
    const monthKey = monthKeyFromDate(date);
    const statusKey = (freq === "daily" || freq === "weekly") ? formatDateValue(date) : monthKey;
    const paymentStatus = item.paymentStatuses?.[statusKey] || "pending";
    const penalty = item.kind === "loan" && paymentStatus === "late" ? Math.abs(Number(item.penaltyAmount) || 0) : 0;
    const baseAmount = Math.abs(Number(item.amount) || 0);
    const totalAmount = baseAmount + penalty;
    const accountedAmount = (item.kind === "loan" && paymentStatus === "pending") ? 0 : totalAmount;
    return {
      id: `rec-${item.id}-${formatDateValue(date)}`,
      sourceId: item.id,
      desc: item.desc,
      cat: item.cat,
      type: item.type,
      frequency: freq,
      amount: item.type === "income" ? accountedAmount : -accountedAmount,
      displayAmount: item.type === "income" ? totalAmount : -totalAmount,
      date: formatDateValue(date),
      isRecurring: true,
      sourceType: "recurring",
      isLoan: item.kind === "loan",
      autoLabel,
      paymentStatus,
      penaltyApplied: penalty,
      baseAmount,
      monthKey: statusKey,
    };
  };

  const entries = [];
  const cursor = new Date(startDateNorm); // partir de la date normalisée

  if (freq === "daily") {
    while (cursor <= endDate) {
      entries.push(makeEntry(new Date(cursor)));
      cursor.setDate(cursor.getDate() + 1);
    }
  } else if (freq === "weekly") {
    while (cursor <= endDate) {
      entries.push(makeEntry(new Date(cursor)));
      cursor.setDate(cursor.getDate() + 7);
    }
  } else if (freq === "yearly") {
    while (cursor <= endDate) {
      entries.push(makeEntry(new Date(cursor)));
      cursor.setFullYear(cursor.getFullYear() + 1);
    }
  } else {
    const startDateNorm2 = startDateNorm; // alias pour clarté
    cursor.setDate(1);
    while (cursor <= endDate) {
      const daysInMonth = new Date(cursor.getFullYear(), cursor.getMonth() + 1, 0).getDate();
      const targetDay = Math.min(Number(item.dayOfMonth) || startDateNorm.getDate(), daysInMonth);
      const candidate = new Date(cursor.getFullYear(), cursor.getMonth(), targetDay);
      if (candidate >= startDateNorm2 && candidate <= endDate) {
        entries.push(makeEntry(candidate));
      }
      cursor.setMonth(cursor.getMonth() + 1);
    }
  }

  return entries;
});


// ── CONSTRUCTION DES REVENUS JOB (versements auto) ──────────────────────
const buildJobIncomeTransactions = (jobs, untilDate, ratesParam = {}, nowDate = new Date()) => jobs.flatMap(job => {
  if (job.status !== "accepted" || !job.paymentAutoAdd || !job.salary || !job.paymentStartDate || job.paymentMode === "none") {
    return [];
  }

  const rawSalary = Math.abs(Number(job.salary) || 0);
  // Convertir en MGA avec les taux reçus en paramètre
  const salCurrency = job.salaryCurrency || "MGA";
  const amount = (salCurrency === "MGA" || !ratesParam[salCurrency])
    ? rawSalary
    : Math.round(rawSalary * (ratesParam[salCurrency] || 1));
  if (!amount) return [];

  const autoLabel = job.paymentMode === "monthly"
    ? "Salaire auto"
    : job.paymentMode === "per_mission"
      ? "Paiement mission"
      : "Paiement job";

  const startDate = new Date(job.paymentStartDate);
  // Normaliser en heure locale pour éviter le décalage UTC (ex: UTC+3 = minuit UTC → 03h local)
  const startDateNorm = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate());

  // Toujours couvrir jusqu'à fin d'année pour la vue annuelle
  const yearEnd    = new Date(startDate.getFullYear() > nowDate.getFullYear() ? startDate.getFullYear() : nowDate.getFullYear(), 11, 31, 23, 59, 59);
  const limitDate  = new Date(Math.max(new Date(untilDate).getTime(), yearEnd.getTime()));
  limitDate.setHours(23, 59, 59, 999);
  const rawEndDate = job.paymentEndDate ? new Date(job.paymentEndDate) : limitDate;
  const endDate    = rawEndDate > limitDate ? limitDate : rawEndDate;

  const makeJobEntry = (date) => {
    const statusKey = job.paymentMode === "monthly"
      ? `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,"0")}`
      : formatDateValue(date);
    const paymentStatus = (job.paymentStatuses || {})[statusKey] || "pending";
    return {
      id: `job-${job.id}-${formatDateValue(date)}`,
      sourceId: job.id,
      desc: `${job.title}${job.company ? ` — ${job.company}` : ""}`,
      cat: "Revenu",
      type: "income",
      amount,
      date: formatDateValue(date),
      isRecurring: true,
      sourceType: "job",
      autoLabel,
      isPastPayment: date < new Date(),
      paymentStatus,
      monthKey: statusKey,
    };
  };

  if (job.paymentMode === "one_time" || job.paymentMode === "per_mission") {
    // Toujours générer, qu'elle soit passée ou future
    return [makeJobEntry(startDateNorm)];
  }

  // monthly : générer toutes les occurrences jusqu'à endDate
  const entries = [];
  const cursor = new Date(startDateNorm.getFullYear(), startDateNorm.getMonth(), 1);
  while (cursor <= endDate) {
    const daysInMonth = new Date(cursor.getFullYear(), cursor.getMonth() + 1, 0).getDate();
    const targetDay = Math.min(startDateNorm.getDate(), daysInMonth);
    const candidate = new Date(cursor.getFullYear(), cursor.getMonth(), targetDay);
    if (candidate >= startDateNorm && candidate <= endDate) {
      entries.push(makeJobEntry(candidate));
    }
    cursor.setMonth(cursor.getMonth() + 1);
  }
  return entries;
});

// �"?�"?�"? MAIN APP �"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?


// ── Composants UI partagés du Dashboard ───────────────────────────────────
const DashBH = ({ title, sub, action, C }) => (
  <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:12, flexShrink:0 }}>
    <div>
      <div style={{ fontSize:12.5, fontWeight:800, color:C.text, letterSpacing:0, lineHeight:1.2, textShadow:`0 1px 0 ${hexToRgba(C.card, 0.9)}` }}>{title}</div>
      {sub && <div style={{ fontSize:10, color:C.muted, marginTop:3, letterSpacing:0, lineHeight:1.35 }}>{sub}</div>}
    </div>
    {action && <button onClick={action.fn} style={{ fontSize:10, fontWeight:700, color:C.indigo, background:`${C.indigo}12`, border:`1px solid ${C.indigo}30`, borderRadius:6, padding:"3px 9px", cursor:"pointer", flexShrink:0 }}>{action.label}</button>}
  </div>
);
const DashTag = ({ label, color }) => (
  <span style={{ fontSize:8.5, fontWeight:700, color, background:`${color}18`, border:`1px solid ${color}30`, borderRadius:4, padding:"1px 6px", whiteSpace:"nowrap" }}>{label}</span>
);
const DashTrend = ({ val, label, inverted, C }) => {
  const up = inverted ? val < 0 : val > 0;
  const color = val===0 ? C.muted : up ? C.green : C.red;
  return (
    <span style={{ fontSize:9.5, fontWeight:700, color }}>
      {val>0?"▲":val<0?"▼":"●"} {Math.abs(val)}% <span style={{ color:C.muted, fontWeight:400 }}>{label}</span>
    </span>
  );
};

// ── Composant horloge isolé — hooks valides car vrai composant JSX ──

// ╔══════════════════════════════════════════════════════════════════════╗
// ║  COMPOSANTS GLOBAUX (hors App — pas de hooks React) ║
// ╚══════════════════════════════════════════════════════════════════════╝

function LiveClock({ paused }) {
  const [time, setTime] = useState(() => new Date().toLocaleTimeString("fr-FR"));
  useEffect(() => {
    if (paused) return;
    const t = window.setInterval(() => setTime(new Date().toLocaleTimeString("fr-FR")), 1000);
    return () => window.clearInterval(t);
  }, [paused]);
  return <>{time}</>;
}

// ── Composant solde flottant ──
function FloatingBalance({ balance, currency, rates, onToggle, isVisible }) {
  if (!isVisible) return null;
  
  const [position, setPosition] = useState({ x: null, y: null }); // null = snap aux bords
  const [isDragging, setIsDragging] = useState(false);
  const dragRef = useRef(null);
  const startPosRef = useRef({ x: 0, y: 0 });
  const startOffsetRef = useRef({ x: 0, y: 0 });
  
  const f = (n) => {
    const abs = Math.abs(n);
    let formatted;
    if (currency === "MGA") formatted = abs.toLocaleString() + " Ar";
    else if (currency === "EUR") formatted = "EUR " + abs.toLocaleString();
    else if (currency === "USD") formatted = "$" + abs.toLocaleString();
    else formatted = abs.toLocaleString();
    return n < 0 ? "-" + formatted : formatted;
  };
  
  const snapToEdge = (x, y) => {
    const w = window.innerWidth;
    const h = window.innerHeight;
    const margin = 20;
    
    // Calculer les distances aux 4 bords
    const distLeft = x;
    const distRight = w - x - 220; // 220 ≈ largeur du widget
    const distTop = y;
    const distBottom = h - y - 100; // 100 ≈ hauteur du widget
    
    const minDist = Math.min(distLeft, distRight, distTop, distBottom);
    
    if (minDist === distLeft) return { x: margin, y };
    if (minDist === distRight) return { x: w - 220 - margin, y };
    if (minDist === distTop) return { x, y: margin };
    return { x, y: h - 100 - margin };
  };
  
  const handleMouseDown = (e) => {
    setIsDragging(true);
    startPosRef.current = { x: e.clientX, y: e.clientY };
    const currentX = position.x !== null ? position.x : window.innerWidth - 240;
    const currentY = position.y !== null ? position.y : window.innerHeight - 120;
    startOffsetRef.current = { x: currentX, y: currentY };
    e.preventDefault();
  };
  
  const handleMouseMove = useCallback((e) => {
    if (!isDragging) return;
    const dx = e.clientX - startPosRef.current.x;
    const dy = e.clientY - startPosRef.current.y;
    setPosition({
      x: startOffsetRef.current.x + dx,
      y: startOffsetRef.current.y + dy,
    });
  }, [isDragging]);
  
  const handleMouseUp = useCallback(() => {
    if (!isDragging) return;
    setIsDragging(false);
    // Snap au bord le plus proche
    const snapped = snapToEdge(position.x, position.y);
    setPosition(snapped);
  }, [isDragging, position]);
  
  useEffect(() => {
    if (isDragging) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
      return () => {
        document.removeEventListener("mousemove", handleMouseMove);
        document.removeEventListener("mouseup", handleMouseUp);
      };
    }
  }, [isDragging, handleMouseMove, handleMouseUp]);
  
  // Position par défaut (bas-droite) ou position sauvegardée
  const left = position.x !== null ? position.x : window.innerWidth - 240;
  const top = position.y !== null ? position.y : window.innerHeight - 120;
  
  return (
    <div
      ref={dragRef}
      onMouseDown={handleMouseDown}
      style={{
        position: "fixed",
        left,
        top,
        zIndex: 9999,
        background: balance < 0 ? "linear-gradient(135deg, #EF4444 0%, #DC2626 100%)" : "linear-gradient(135deg, #6366F1 0%, #8B5CF6 100%)",
        borderRadius: 16,
        padding: "16px 20px",
        boxShadow: balance < 0 ? "0 8px 32px rgba(239, 68, 68, 0.4)" : "0 8px 32px rgba(99, 102, 241, 0.4)",
        minWidth: 180,
        backdropFilter: "blur(10px)",
        cursor: isDragging ? "grabbing" : "grab",
        userSelect: "none",
        transition: isDragging ? "none" : "left 0.3s ease, top 0.3s ease, background 0.3s ease",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
        <span style={{ fontSize: 11, color: "rgba(255,255,255,0.8)", fontWeight: 600 }}>SOLDE ACTUEL</span>
        <button onClick={onToggle} style={{ background: "none", border: "none", color: "rgba(255,255,255,0.6)", cursor: "pointer", fontSize: 14 }}>×</button>
      </div>
      <div style={{ fontSize: 24, fontWeight: 900, color: "#fff" }}>
        {f(balance)}
      </div>
      <div style={{ fontSize: 11, color: "rgba(255,255,255,0.7)", marginTop: 4 }}>
        {balance >= 0 ? "✓ Positif" : "⚠ Négatif"}
      </div>
    </div>
  );
}


// ╔══════════════════════════════════════════════════════════════════════╗
// ║  COMPOSANT APP — Point d'entrée principal                            ║
// ╚══════════════════════════════════════════════════════════════════════╝
export default function App() {

  // ── ÉTATS : THÈME & APPARENCE ─────────────────────────────────────────
  const [themeMode, setThemeMode] = useState(() => loadStoredValue("themeMode", "ocean"));
  const [accentColor, setAccentColor] = useState(() => loadStoredValue("accentColor", "#6366F1"));
  const [appDesign, setAppDesign] = useState(() => loadStoredValue("appDesign", "classic"));
  const isNeonDesign = appDesign === "portfolio";
  const activeTheme = THEME_PRESETS[themeMode] || THEME_PRESETS.ocean;
  const effectiveAccent = isNeonDesign ? "#00FFA3" : accentColor;
  Object.assign(C, {
    ...C,
    ...activeTheme,
    ...(isNeonDesign ? NEON_THEME_OVERRIDES : {}),
    indigo: isNeonDesign ? "#7B6EFF" : accentColor,
    sidebarHover: hexToRgba(effectiveAccent, 0.1),
    sidebarActive: hexToRgba(isNeonDesign ? "#7B6EFF" : accentColor, 0.2),
    sidebarActiveBorder: effectiveAccent,
  });


  // ── ÉTATS : NAVIGATION ───────────────────────────────────────────────
  const [active, setActive]         = useState("dashboard");
  const [showFinGuide, setShowFinGuide] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [month, setMonth]           = useState("Mai 2026");
  const [showEntryHubModal, setShowEntryHubModal] = useState(false);

  // ── ÉTATS : DONNÉES MÉTIER ────────────────────────────────────────────
  const [txList, setTxList]         = useState(() => loadStoredValue("txList", initTx));
  const [goals, setGoals]           = useState(() => loadStoredValue("goals", initGoals));
  const [jobs, setJobs]             = useState(() => loadStoredValue("jobs", initJobs));
  const [platforms, setPlatforms]   = useState(() => loadStoredValue("platforms", PLATFORMS));
  const [recurringItems, setRecurringItems] = useState(() => loadStoredValue("recurringItems", initRecurring));

  // ── ÉTATS : FILTRES & UI TRANSACTIONS ────────────────────────────────
  const [txFilter, setTxFilter]     = useState("all");

  // ── ÉTATS : DEVISES & TAUX ────────────────────────────────────────────
  const [currency, setCurrency]     = useState(() => loadStoredValue("currency", "MGA"));
  const [rates, setRates]           = useState(() => loadStoredValue("rates", DEFAULT_RATES_EXTENDED)); // MGA per foreign unit
  const [ratesUpdated, setRatesUpdated] = useState(() => loadStoredValue("ratesUpdated", null));
  const [ratesSourceUpdatedAt, setRatesSourceUpdatedAt] = useState(() => loadStoredValue("ratesSourceUpdatedAt", null));
  const [ratesCheckedAt, setRatesCheckedAt] = useState(() => loadStoredValue("ratesCheckedAt", null));
  const [ratesLoading, setRatesLoading] = useState(false);

  // ── ÉTATS : ÉDITION EN COURS ──────────────────────────────────────────
  const [editTx, setEditTx]         = useState(null);
  const [showModal, setShowModal]   = useState(false);
  const [editGoal, setEditGoal]     = useState(null);
  const [showGoalModal, setShowGoalModal] = useState(false);
  const [showJobModal, setShowJobModal] = useState(false);
  const [showRecurringModal, setShowRecurringModal] = useState(false);
  const [showPlatformModal, setShowPlatformModal] = useState(false);
  const [editJob, setEditJob]       = useState(null);
  const [editRecurring, setEditRecurring] = useState(null);
  const [editPlatform, setEditPlatform] = useState(null);

  // ── ÉTATS : FILTRES SUIVI TAF ─────────────────────────────────────────
  const [jobFilter, setJobFilter]   = useState("all");
  const [jobSearch, setJobSearch]   = useState("");

  // ── ÉTATS : PROFIL & PERSISTANCE ──────────────────────────────────────
  const [profile, setProfile]       = useState(() => loadStoredValue("profile", PROFILE_DEFAULT));
  const [lastSavedAt, setLastSavedAt] = useState(() => loadStoredValue("lastSavedAt", null));

  // ── ÉTATS : HORLOGE TEMPS RÉEL ────────────────────────────────────────
  const [now, setNow] = useState(() => new Date());
  const autosaveReadyRef = useRef(false);

  // ── ÉTATS : TABLEAU DE BORD (layout, drag, grille) ───────────────────
  const dashDragRef   = useRef(null);
  const dashResizeRef = useRef(null);
  const dashGridRef   = useRef(null);
  const dashboardScrollTopRef = useRef(0);
  
  const [dashLayout,   setDashLayout]   = useState(() => loadStoredValue("dashLayout", null));
  const [dashEditMode, setDashEditMode] = useState(false);
  const [dashAddPanel, setDashAddPanel] = useState(false);
  const [dashAddPanelHeight, setDashAddPanelHeight] = useState(() => loadStoredValue("dashAddPanelHeight", 140));

  // États pour le graphique filtrable

  // ── ÉTATS : GRAPHIQUES ────────────────────────────────────────────────
  const [chartFilter, setChartFilter] = useState("monthly"); // daily, weekly, monthly, yearly
  const [chartMonth, setChartMonth] = useState(MONTHS[new Date().getMonth()]);
  const [showSeriesPanel, setShowSeriesPanel] = useState(false);
  const [chartUse3D, setChartUse3D] = useState(() => loadStoredValue("chartUse3D", false));
  const [chartVisualVariantId, setChartVisualVariantId] = useState(() =>
    loadStoredValue("chartVisualVariantId", CHART_VISUAL_VARIANTS[0].id)
  );
  const [chartSeriesConfig, setChartSeriesConfig] = useState(() => {
    const stored = loadStoredValue("chartSeriesConfig", DEFAULT_CHART_SERIES_CONFIG);
    const merged = DEFAULT_CHART_SERIES_CONFIG.map(def => {
      const found = stored.find(s => s.key === def.key);
      return found ? { ...def, ...found } : def;
    });
    return merged;
  });
  const [showStatbarsPanel, setShowStatbarsPanel] = useState(false);
  const [statbarsConfig, setStatbarsConfig] = useState(() => loadStoredValue("statbarsConfig", DEFAULT_STATBARS_CONFIG));
  const [showStatsavPanel, setShowStatsavPanel] = useState(false);
  const [statsavConfig, setStatsavConfig] = useState(() => loadStoredValue("statsavConfig", DEFAULT_STATSAV_CONFIG));

  // ── ÉTATS : WIDGET FLOTTANT ───────────────────────────────────────────
  const [showFloatingBalance, setShowFloatingBalance] = useState(true);
  const [showRatesMenu, setShowRatesMenu] = useState(() => loadStoredValue("showRatesMenu", true));
  const [ratesSearch, setRatesSearch] = useState("");
  
  

  // ── ÉTATS : COULEURS PERSONNALISÉES ──────────────────────────────────
  const [categoryColors, setCategoryColors] = useState(() =>
    loadStoredValue("categoryColors", Object.fromEntries(CATEGORY_META.map(c => [c.name, c.color])))
  );
  const [chartColors, setChartColors] = useState(() =>
    loadStoredValue("chartColors", { income: C.green, expense: C.red, savings: C.indigo })
  );

  // ── ÉTATS : BUDGETS ───────────────────────────────────────────────────
  const [budgets, setBudgets]               = useState(() => {
    const stored = loadStoredValue("budgets", null);
    // Migration : ancien format avait { id, name, budget, val, color } au lieu de { category, limit }
    if (Array.isArray(stored) && stored.length > 0 && stored[0].category !== undefined) {
      return stored; // nouveau format OK
    }
    if (Array.isArray(stored) && stored.length > 0 && stored[0].name !== undefined) {
      // Migrer l'ancien format
      return stored.map(b => ({ category: b.name, limit: b.budget ?? b.val ?? 0 })).filter(b => b.category && b.limit > 0);
    }
    return INITIAL_BUDGETS;
  });
  const [showBudgetModal, setShowBudgetModal] = useState(false);
  const [showColorModal, setShowColorModal]   = useState(false);
  const [editBudget, setEditBudget]         = useState(null);
  const [budgetForm, setBudgetForm]         = useState({ category: "", limit: "" });

    const [form, setForm] = useState(() => createTxForm());

  // ── ÉTATS : FORMULAIRES (valeurs courantes) ───────────────────────────
  const [goalForm, setGoalForm] = useState(() => createGoalForm());
  const [jobForm, setJobForm] = useState(() => createJobForm(platforms[0]?.id ?? ""));
  const [recurringForm, setRecurringForm] = useState(() => createRecurringForm());
  const [platformForm, setPlatformForm] = useState(() => createPlatformForm());

  // �"?�"? FETCH LIVE RATES �"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?

  // ── ACTIONS : DEVISES ─────────────────────────────────────────────────
  const fetchRates = useCallback(async ({ silent = false } = {}) => {
    if (!silent) setRatesLoading(true);
    let success = false;
    // Tentative 1 : open.er-api (base MGA) — retourne tous les taux en une requête
    try {
      const res = await fetch("https://open.er-api.com/v6/latest/MGA");
      if (res.ok) {
        const data = await res.json();
        if (data.rates && data.rates.EUR && data.rates.USD) {
          const syncedAt = new Date();
          // Convertir tous les taux : 1 devise étrangère = X MGA
          const newRates = { ...DEFAULT_RATES_EXTENDED };
          Object.keys(CURRENCIES).forEach(code => {
            if (code !== "MGA" && data.rates[code]) {
              newRates[code] = Math.round(1 / data.rates[code]);
            }
          });
          setRates(newRates);
          setRatesUpdated(new Intl.DateTimeFormat("fr-FR", { timeStyle: "medium" }).format(syncedAt));
          setRatesCheckedAt(syncedAt.toISOString());
          setRatesSourceUpdatedAt(data.time_last_update_utc || null);
          success = true;
        }
      }
    } catch { /* continue */ }
    // Tentative 2 : frankfurter (base EUR) si la 1ère échoue
    if (!success) {
      try {
        const foreignCodes = Object.keys(CURRENCIES).filter(c => c !== "MGA").join(",");
        const res = await fetch(`https://api.frankfurter.app/latest?from=EUR&to=${foreignCodes}`);
        if (res.ok) {
          const data = await res.json();
          if (data.rates?.USD) {
            const syncedAt = new Date();
            const fallbackEUR = 4912;
            const newRates = { ...DEFAULT_RATES_EXTENDED, EUR: fallbackEUR };
            // Calculer les taux MGA via EUR comme pivot
            Object.entries(data.rates).forEach(([code, rateVsEur]) => {
              if (CURRENCIES[code]) newRates[code] = Math.round(fallbackEUR / rateVsEur);
            });
            setRates(newRates);
            setRatesUpdated(new Intl.DateTimeFormat("fr-FR", { timeStyle: "medium" }).format(syncedAt));
            setRatesCheckedAt(syncedAt.toISOString());
            setRatesSourceUpdatedAt(data.date || null);
          }
        }
      } catch { /* keep defaults */ }
    }
    if (!silent) setRatesLoading(false);
  }, []); // ← dépendance vide : pas de boucle infinie lors de la mise à jour des taux

  useEffect(() => {
    fetchRates();
    const timer = window.setInterval(() => fetchRates({ silent: true }), 15 * 60 * 1000);
    return () => window.clearInterval(timer);
  }, [fetchRates]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const seedKey = "fintrack.platforms.seed.v2";
    if (window.localStorage.getItem(seedKey) === "1") return;
    setPlatforms(prev => {
      const known = new Set(prev.map(platform => platform.id));
      const additions = PLATFORMS.filter(platform => !known.has(platform.id));
      return additions.length ? [...prev, ...additions] : prev;
    });
    window.localStorage.setItem(seedKey, "1");
  }, []);

  useEffect(() => {
    // Update `now` once per minute for calendar/date computations; clock uses DOM ref instead
    const timer = window.setInterval(() => setNow(new Date()), 60000);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    if (!platforms.length) return;
    setJobForm(prev => {
      if (!prev.platform || platforms.some(platform => platform.id === prev.platform)) return prev;
      return { ...prev, platform: platforms[0].id };
    });
  }, [platforms]);


  // ── EFFETS : SAUVEGARDE AUTOMATIQUE ───────────────────────────────────
  useEffect(() => {
    if (!autosaveReadyRef.current) {
      autosaveReadyRef.current = true;
      return;
    }

    const savedAt = new Date().toISOString();
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify({
      txList,
      goals,
      jobs,
      platforms,
      recurringItems,
      budgets,
      categoryColors,
      chartColors,
      chartUse3D,
      chartVisualVariantId,
      chartSeriesConfig,
      statbarsConfig,
      statsavConfig,
      showRatesMenu,
      currency,
      rates,
      ratesUpdated,
      ratesSourceUpdatedAt,
      ratesCheckedAt,
      profile,
      accentColor,
      themeMode,
      appDesign,
      dashLayout,
      dashAddPanelHeight,
      lastSavedAt: savedAt,
    }));
    setLastSavedAt(savedAt);
  }, [txList, goals, jobs, platforms, recurringItems, budgets, categoryColors, chartColors, chartUse3D, chartVisualVariantId, chartSeriesConfig, showRatesMenu, currency, rates, ratesUpdated, ratesSourceUpdatedAt, ratesCheckedAt, profile, accentColor, themeMode, appDesign, dashLayout, dashAddPanelHeight]);


  // ═══════════════════════════════════════════════════════════════════════════
  // MOTEUR DE CALCUL UNIFIÉ
  // Règles cohérentes appliquées partout :
  //   • Revenu = toutes sources (manuel + récurrent + job accepté) sur la date réelle
  //   • Dépense = toutes sources sur la date réelle
  //   • Mois sélectionné = fenêtre de référence pour tous les KPIs
  //   • Réalisé = date ≤ aujourd'hui  |  Planifié = date > aujourd'hui
  // ═══════════════════════════════════════════════════════════════════════════

  // ── Fenêtre de génération ──────────────────────────────────────────────────

  // ══════════════════════════════════════════════════════════════════════
  // CALCULS FINANCIERS — Données dérivées des états
  // ══════════════════════════════════════════════════════════════════════
  const futureLimit = new Date(now.getFullYear(), now.getMonth() + 2, 0);
  const todayStr    = formatDateValue(now);

  // ── Toutes les transactions (3 sources fusionnées) ─────────────────────────
  const recurringTransactions   = buildRecurringTransactions(recurringItems, futureLimit);
  const acceptedJobTransactions = buildJobIncomeTransactions(jobs, futureLimit, rates, now);
  const normalizedManualTx      = txList.map(tx => ({ ...tx, cat: normalizeCategory(tx.cat) }));
  const allTxList = [
    ...normalizedManualTx,
    ...recurringTransactions,
    ...acceptedJobTransactions,
  ].sort((a, b) => `${b.date}-${b.id}`.localeCompare(`${a.date}-${a.id}`));

  const trendBaseDate = new Date(now.getFullYear(), now.getMonth(), 1);

  // ── Helpers de calcul ──────────────────────────────────────────────────────
  const sumIncome  = (txs) => txs.filter(t => t.type === "income").reduce((s, t) => s + t.amount, 0);
  const sumExpense = (txs) => Math.abs(txs.filter(t => t.type === "expense").reduce((s, t) => s + t.amount, 0));

  // ── Mois sélectionné ──────────────────────────────────────────────────────
  const parseMonthLabel = (label) => {
    const MNAMES = ["janvier","février","mars","avril","mai","juin","juillet","août","septembre","octobre","novembre","décembre"];
    const parts  = label.trim().split(/\s+/);
    const year   = parseInt(parts[parts.length - 1]) || now.getFullYear();
    const mi     = MNAMES.indexOf(parts[0].toLowerCase());
    return { year, monthIndex: mi >= 0 ? mi : now.getMonth() };
  };
  const { year: selYear, monthIndex: selMonthIndex } = parseMonthLabel(month);
  const selectedMonthKey = `${selYear}-${String(selMonthIndex + 1).padStart(2, "0")}`;
  const previousSelDate  = new Date(selYear, selMonthIndex - 1, 1);
  const previousSelKey   = `${previousSelDate.getFullYear()}-${String(previousSelDate.getMonth() + 1).padStart(2, "0")}`;

  // ── Transactions par mois ──────────────────────────────────────────────────
  const selectedMonthTx    = allTxList.filter(tx => tx.date.slice(0, 7) === selectedMonthKey);
  const previousSelMonthTx = allTxList.filter(tx => tx.date.slice(0, 7) === previousSelKey);

  // ── KPIs du mois sélectionné ──────────────────────────────────────────────
  // Réalisé  : date ≤ aujourd'hui
  // Planifié : date > aujourd'hui (mais dans le mois sélectionné)
  // TOTAL    : réalisé + planifié → visibilité complète sur le mois


  // ── HELPERS STATUT PAIEMENT ───────────────────────────────────────────
  const isConfirmed = (tx) => {
    if (!tx.isRecurring && tx.sourceType !== "job" && tx.sourceType !== "recurring") {
      // Transaction manuelle : paid/on_time explicite OU date passée sans statut
      if (tx.paymentStatus === "paid" || tx.paymentStatus === "on_time") return true;
      if (tx.paymentStatus === "pending") return false;
      return tx.date <= todayStr; // sans statut = réel si passé
    }
    // Récurrente ou job : UNIQUEMENT si marqué on_time ou paid
    return tx.paymentStatus === "on_time" || tx.paymentStatus === "paid";
  };

  // Revenus confirmés (reçus) — basé sur isConfirmed
  // ── Revenus et dépenses CONFIRMÉS (isConfirmed = payé/reçu) ──────────────
  const summarizePeriod = (txs) => {
    const incomeRealized = txs
      .filter(t => t.type === "income" && isConfirmed(t))
      .reduce((s, t) => s + t.amount, 0);
    const incomePlanned = txs
      .filter(t => t.type === "income" && !isConfirmed(t))
      .reduce((s, t) => s + (t.displayAmount ?? t.amount), 0);
    const expenseRealized = txs
      .filter(t => t.type === "expense" && isConfirmed(t))
      .reduce((s, t) => s + Math.abs(t.amount), 0);
    const expensePlanned = txs
      .filter(t => t.type === "expense" && !isConfirmed(t))
      .reduce((s, t) => s + Math.abs(t.displayAmount ?? t.amount), 0);

    const incomeProjected = incomeRealized + incomePlanned;
    const expenseProjected = expenseRealized + expensePlanned;
    const netRealized = incomeRealized - expenseRealized;
    const netProjected = incomeProjected - expenseProjected;
    const paidRatio = expenseProjected > 0 ? expenseRealized / expenseProjected : 0;

    return {
      incomeRealized,
      incomePlanned,
      incomeProjected,
      expenseRealized,
      expensePlanned,
      expenseProjected,
      netRealized,
      netProjected,
      paidRatio,
    };
  };

  const selectedMonthSummary = summarizePeriod(selectedMonthTx);
  const previousMonthSummary = summarizePeriod(previousSelMonthTx);


  // ── KPIs MOIS SÉLECTIONNÉ ─────────────────────────────────────────────
  const totalIncomeRealized   = selectedMonthSummary.incomeRealized;
  const totalExpenseRealized  = selectedMonthSummary.expenseRealized;

  // ── Revenus et dépenses EN ATTENTE (non confirmés) ──────────────────────
  // displayAmount pour capturer le vrai montant prévu (jobs futurs, prêts pending)
  const totalIncomePlanned    = selectedMonthSummary.incomePlanned;
  const totalExpensePlanned   = selectedMonthSummary.expensePlanned;

  // Projeté = confirmé + planifié (displayAmount déjà appliqué dans totalIncomePlanned)
  const totalIncome       = selectedMonthSummary.incomeProjected;
  const totalIncomeFuture = totalIncomePlanned;
  const totalExpenses     = selectedMonthSummary.expenseProjected;
  // Solde projeté = si tout est payé/reçu
  const projectedSavings  = selectedMonthSummary.netProjected;
  const projectedRate     = totalIncome > 0 ? (projectedSavings / totalIncome * 100).toFixed(1) : "0.0";
  const savings           = selectedMonthSummary.netRealized; // solde réel mois
  const savingsForecast   = selectedMonthSummary.netProjected;
  // Solde global réel = toutes tx confirmées tous mois confondus

  // ── SOLDE GLOBAL (toutes périodes) ────────────────────────────────────
  const globalRealBalance = allTxList
    .filter(tx => isConfirmed(tx))
    .reduce((sum, tx) => tx.type === "income" ? sum + tx.amount : sum - Math.abs(tx.amount), 0);
  const savingsRate       = totalIncome > 0 ? ((savingsForecast / totalIncome) * 100).toFixed(1) : "0.0";

  // Mois précédent (mêmes règles)
  const prevIncome  = previousMonthSummary.incomeProjected;
  const prevExpense = previousMonthSummary.expenseProjected;
  const prevSavings = previousMonthSummary.netProjected;

  // ── Filtres ────────────────────────────────────────────────────────────────
  const filteredTx = txFilter === "all" ? allTxList : allTxList.filter(t => t.type === txFilter);

  // ── Catégories (mois sélectionné) ─────────────────────────────────────────

  // ── CATÉGORIES DÉPENSES (pour graphiques Pie) ────────────────────────
  const expenseCategories = CATEGORY_META.map(({ name }) => {
    const color = categoryColors[name] || CATEGORY_COLOR_MAP[name];
    const val   = sumExpense(selectedMonthTx.filter(tx => tx.cat === normalizeCategory(name)));
    const pct   = totalExpenses > 0 ? Math.round((val / totalExpenses) * 100) : 0;
    return { name, val, pct, color };
  }).filter(item => item.val > 0);

  const budgetData = expenseCategories.map(item => {
    const stored = budgets?.[item.name];
    const budget = stored > 0 ? stored : Math.round(item.val * 1.2);
    return { ...item, budget, pct: budget > 0 ? Math.round((item.val / budget) * 100) : 0 };
  });

  // ── Données du graphique ──────────────────────────────────────────────────
  // generateChartData : centré sur le mois SÉLECTIONNÉ (pas sur now)
  const generateChartData = (filter) => {
    const baseTx = [...allTxList].sort((a, b) => a.date.localeCompare(b.date));

    // Expansion des transactions manuelles avec fréquence (les récurrents sont déjà expansés)
    const expandTx = (txArr, startDate, endDate) => {
      const result = [];
      for (const tx of txArr) {
        if (tx.isRecurring || tx.sourceType === "job") { result.push(tx); continue; }
        const freq = tx.frequency || "once";
        if (freq === "once" || !freq) { result.push(tx); continue; }
        const txDate = new Date(tx.date);
        const cursor = new Date(txDate);
        const winStart = new Date(Math.max(txDate.getTime(), startDate.getTime()));
        const winEnd = new Date(endDate);
        if (freq === "daily") {
          cursor.setTime(winStart.getTime());
          while (cursor <= winEnd) { result.push({ ...tx, date: formatDateValue(cursor), _x: true }); cursor.setDate(cursor.getDate() + 1); }
        } else if (freq === "weekly") {
          const diff = Math.ceil((winStart - txDate) / (7 * 86400000));
          cursor.setDate(txDate.getDate() + Math.max(0, diff) * 7);
          while (cursor <= winEnd) { result.push({ ...tx, date: formatDateValue(cursor), _x: true }); cursor.setDate(cursor.getDate() + 7); }
        } else if (freq === "monthly") {
          cursor.setFullYear(winStart.getFullYear(), winStart.getMonth(), txDate.getDate());
          if (cursor < winStart) cursor.setMonth(cursor.getMonth() + 1);
          while (cursor <= winEnd) { result.push({ ...tx, date: formatDateValue(cursor), _x: true }); cursor.setMonth(cursor.getMonth() + 1); }
        } else if (freq === "yearly") {
          cursor.setFullYear(winStart.getFullYear(), txDate.getMonth(), txDate.getDate());
          if (cursor < winStart) cursor.setFullYear(cursor.getFullYear() + 1);
          while (cursor <= winEnd) { result.push({ ...tx, date: formatDateValue(cursor), _x: true }); cursor.setFullYear(cursor.getFullYear() + 1); }
        }
      }
      return result;
    };

    // Centre du graphique = mois sélectionné
    const centerDate = new Date(selYear, selMonthIndex, 1);

    if (filter === "daily") {
      const daysInMonth = new Date(selYear, selMonthIndex + 1, 0).getDate();
      const winStart = new Date(selYear, selMonthIndex, 1);
      const winEnd   = new Date(selYear, selMonthIndex, daysInMonth, 23, 59, 59);
      const sortedTx = expandTx(baseTx, winStart, winEnd);
      const days = [];
      let cumul = baseTx.filter(tx => tx.date < formatDateValue(winStart) && isConfirmed(tx))
        .reduce((s, tx) => s + (tx.type === "income" ? tx.amount : -Math.abs(tx.amount)), 0);
      for (let d = 1; d <= daysInMonth; d++) {
        const dk = `${selYear}-${String(selMonthIndex+1).padStart(2,"0")}-${String(d).padStart(2,"0")}`;
        const dayTx = sortedTx.filter(tx => tx.date === dk);
        const r = sumIncome(dayTx);
        const exp = sumExpense(dayTx);
        // Solde réel = seulement les confirmés
        const rConfDay = dayTx.filter(t => t.type==="income"  && isConfirmed(t)).reduce((s,t)=>s+t.amount,0);
        const eConfDay = dayTx.filter(t => t.type==="expense" && isConfirmed(t)).reduce((s,t)=>s+Math.abs(t.amount),0);
        cumul += rConfDay - eConfDay;
        const _dPaid   = Math.abs(dayTx.filter(t=>t.type==="expense"&&isConfirmed(t)).reduce((s,t)=>s+t.amount,0));
        const _dUnpaid = Math.abs(dayTx.filter(t=>t.type==="expense"&&!isConfirmed(t)).reduce((s,t)=>s+t.amount,0));
        const _rConf   = dayTx.filter(t=>t.type==="income"&&isConfirmed(t)).reduce((s,t)=>s+t.amount,0);
        const _rPlan   = dayTx.filter(t=>t.type==="income"&&!isConfirmed(t)).reduce((s,t)=>s+(t.displayAmount||t.amount),0);
        days.push({ m: String(d), r, rPast: _rConf, rFuture: _rPlan, d: exp, dPaid: _dPaid, dUnpaid: _dUnpaid, e: cumul, isFuture: dk > todayStr });
      }
      return days;

    } else if (filter === "weekly") {
      const weeks = [];
      const dayOfWeek = (now.getDay() + 6) % 7;
      const currentWeekStart = new Date(now); currentWeekStart.setDate(now.getDate() - dayOfWeek); currentWeekStart.setHours(0,0,0,0);
      const winStart = new Date(currentWeekStart); winStart.setDate(currentWeekStart.getDate() - 14);
      const winEnd   = new Date(currentWeekStart); winEnd.setDate(currentWeekStart.getDate() + 13); winEnd.setHours(23,59,59,999);
      const sortedTx = expandTx(baseTx, winStart, winEnd);
      let cumul = baseTx.filter(tx => tx.date < formatDateValue(winStart) && isConfirmed(tx))
        .reduce((s, tx) => s + (tx.type === "income" ? tx.amount : -Math.abs(tx.amount)), 0);
      for (let i = -2; i <= 1; i++) {
        const wStart = new Date(currentWeekStart); wStart.setDate(currentWeekStart.getDate() + i*7);
        const wEnd   = new Date(wStart); wEnd.setDate(wStart.getDate()+6); wEnd.setHours(23,59,59,999);
        const wTx = sortedTx.filter(tx => { const d = new Date(tx.date); return d >= wStart && d <= wEnd; });
        const r   = sumIncome(wTx);
        const exp = sumExpense(wTx);
        const rConf = wTx.filter(t => t.type==="income"  && isConfirmed(t)).reduce((s,t)=>s+t.amount,0);
        const eConf = wTx.filter(t => t.type==="expense" && isConfirmed(t)).reduce((s,t)=>s+Math.abs(t.amount),0);
        cumul += rConf - eConf;
        const label = i===0 ? "Cette sem." : i===1 ? "Sem. suiv." : `${String(wStart.getDate()).padStart(2,"0")}/${String(wStart.getMonth()+1).padStart(2,"0")}`;
        const _dPaid   = Math.abs(wTx.filter(t=>t.type==="expense"&&isConfirmed(t)).reduce((s,t)=>s+t.amount,0));
        const _dUnpaid = Math.abs(wTx.filter(t=>t.type==="expense"&&!isConfirmed(t)).reduce((s,t)=>s+t.amount,0));
        const _rConf   = wTx.filter(t=>t.type==="income"&&isConfirmed(t)).reduce((s,t)=>s+t.amount,0);
        const _rPlan   = wTx.filter(t=>t.type==="income"&&!isConfirmed(t)).reduce((s,t)=>s+(t.displayAmount||t.amount),0);
        weeks.push({ m: label, r, rPast: _rConf, rFuture: _rPlan, d: exp, dPaid: _dPaid, dUnpaid: _dUnpaid, e: cumul, isFuture: wStart > now });
      }
      return weeks;

    } else if (filter === "yearly") {
      const years = [];
      const winStart = new Date(selYear, 0, 1);
      const winEnd   = new Date(selYear, 11, 31, 23, 59, 59);
      const sortedTx = expandTx(baseTx, winStart, winEnd);
      let cumul = baseTx.filter(tx => tx.date < formatDateValue(winStart) && isConfirmed(tx))
        .reduce((s, tx) => s + (tx.type === "income" ? tx.amount : -Math.abs(tx.amount)), 0);
      for (let mo = 0; mo < 12; mo++) {
        const mk = `${selYear}-${String(mo+1).padStart(2,"0")}`;
        const moTx = sortedTx.filter(tx => tx.date.slice(0,7) === mk);
        const r   = sumIncome(moTx);
        const exp = sumExpense(moTx);
        const rConf = moTx.filter(t => t.type==="income"  && isConfirmed(t)).reduce((s,t)=>s+t.amount,0);
        const eConf = moTx.filter(t => t.type==="expense" && isConfirmed(t)).reduce((s,t)=>s+Math.abs(t.amount),0);
        cumul += rConf - eConf;
        const isFut = new Date(selYear, mo, 1) > now;
        const _dPaid   = Math.abs(moTx.filter(t=>t.type==="expense"&&isConfirmed(t)).reduce((s,t)=>s+t.amount,0));
        const _dUnpaid = Math.abs(moTx.filter(t=>t.type==="expense"&&!isConfirmed(t)).reduce((s,t)=>s+t.amount,0));
        const _rConf   = moTx.filter(t=>t.type==="income"&&isConfirmed(t)).reduce((s,t)=>s+t.amount,0);
        const _rPlan   = moTx.filter(t=>t.type==="income"&&!isConfirmed(t)).reduce((s,t)=>s+(t.displayAmount||t.amount),0);
        years.push({ m: new Intl.DateTimeFormat("fr-FR",{month:"short"}).format(new Date(selYear,mo,1)), r, rPast: _rConf, rFuture: _rPlan, d: exp, dPaid: _dPaid, dUnpaid: _dUnpaid, e: cumul, isFuture: isFut });
      }
      return years;

    } else {
      // monthly — 2 mois avant selectedMonth, selectedMonth, 1 mois après
      const months = [];
      const winStart = new Date(selYear, selMonthIndex - 2, 1);
      const winEnd   = new Date(selYear, selMonthIndex + 2, 0, 23, 59, 59);
      const sortedTx = expandTx(baseTx, winStart, winEnd);
      let cumul = baseTx.filter(tx => tx.date < formatDateValue(winStart) && isConfirmed(tx))
        .reduce((s, tx) => s + (tx.type === "income" ? tx.amount : -Math.abs(tx.amount)), 0);
      for (let i = -2; i <= 1; i++) {
        const d  = new Date(selYear, selMonthIndex + i, 1);
        const mk = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}`;
        const moTx = sortedTx.filter(tx => tx.date.slice(0,7) === mk);
        const r   = sumIncome(moTx);
        const exp = sumExpense(moTx);
        const rConf = moTx.filter(t => t.type==="income"  && isConfirmed(t)).reduce((s,t)=>s+t.amount,0);
        const eConf = moTx.filter(t => t.type==="expense" && isConfirmed(t)).reduce((s,t)=>s+Math.abs(t.amount),0);
        cumul += rConf - eConf;
        const isFut = d > now;
        const label = i===1
          ? new Intl.DateTimeFormat("fr-FR",{month:"short"}).format(d) + " >"
          : new Intl.DateTimeFormat("fr-FR",{month:"short"}).format(d);
        const _dPaid   = Math.abs(moTx.filter(t=>t.type==="expense"&&isConfirmed(t)).reduce((s,t)=>s+t.amount,0));
        const _dUnpaid = Math.abs(moTx.filter(t=>t.type==="expense"&&!isConfirmed(t)).reduce((s,t)=>s+t.amount,0));
        const _rConf   = moTx.filter(t=>t.type==="income"&&isConfirmed(t)).reduce((s,t)=>s+t.amount,0);
        const _rPlan   = moTx.filter(t=>t.type==="income"&&!isConfirmed(t)).reduce((s,t)=>s+(t.displayAmount||t.amount),0);
        months.push({ m: label, r, rPast: _rConf, rFuture: _rPlan, d: exp, dPaid: _dPaid, dUnpaid: _dUnpaid, e: cumul, isFuture: isFut });
      }
      return months;
    }
  };


  // ── DONNÉES GRAPHIQUES ────────────────────────────────────────────────
  const trendData = generateChartData(chartFilter);
  const activeChartVariant = CHART_VISUAL_VARIANTS.find(v => v.id === chartVisualVariantId) || CHART_VISUAL_VARIANTS[0];

  // Historique 6 mois (pour les graphiques comparatifs)

  // ── DONNÉES GRAPHIQUES 6 MOIS (indépendantes du filtre) ───────────────
  const monthlyTrend6 = (() => {
    const result = [];
    for (let i = -5; i <= 0; i++) {
      const periodStart = new Date(selYear, selMonthIndex + i, 1);
      const mk = `${periodStart.getFullYear()}-${String(periodStart.getMonth()+1).padStart(2,"0")}`;
      const txs = allTxList.filter(tx => tx.date.slice(0,7) === mk);
      const summary = summarizePeriod(txs);
      result.push({
        m: new Intl.DateTimeFormat("fr-FR",{month:"short"}).format(periodStart),
        rPast: summary.incomeRealized,
        rFuture: summary.incomePlanned,
        r: summary.incomeProjected,
        dPaid: summary.expenseRealized,
        dUnpaid: summary.expensePlanned,
        d: summary.expenseProjected,
        net: summary.netRealized,
        netProjected: summary.netProjected,
        paidRatio: summary.paidRatio,
        e: summary.netRealized,
        isFuture: periodStart > now,
      });
    }
    return result;
  })();

  const monthlyTrendYear = (() => {
    const result = [];
    for (let mo = 0; mo < 12; mo++) {
      const periodStart = new Date(selYear, mo, 1);
      const mk = `${selYear}-${String(mo+1).padStart(2,"0")}`;
      const txs = allTxList.filter(tx => tx.date.slice(0,7) === mk);
      const summary = summarizePeriod(txs);
      result.push({
        m: new Intl.DateTimeFormat("fr-FR",{month:"short"}).format(periodStart),
        rPast: summary.incomeRealized,
        rFuture: summary.incomePlanned,
        r: summary.incomeProjected,
        dPaid: summary.expenseRealized,
        dUnpaid: summary.expensePlanned,
        d: summary.expenseProjected,
        net: summary.netRealized,
        netProjected: summary.netProjected,
        paidRatio: summary.paidRatio,
        e: summary.netRealized,
        isFuture: periodStart > now,
      });
    }
    return result;
  })();

  // ── Indicateurs de tendance ────────────────────────────────────────────────
  const f = (n) => fmt(n, currency, rates);
  const hasTransactions = allTxList.length > 0;
  const liveMonthKey = monthKeyFromDate(now);

  const currentPeriod  = { m: month, r: totalIncome, d: totalExpenses, e: projectedSavings };
  const previousPeriod = { m: previousSelKey, r: prevIncome, d: prevExpense, e: prevSavings };

  const currentMonthKey  = selectedMonthKey;
  const previousMonthKey = previousSelKey;
  const currentMonthTx   = selectedMonthTx;
  const previousMonthTx  = previousSelMonthTx;

  const currentIncomeTx     = currentMonthTx.filter(tx => tx.type === "income");
  const previousIncomeTx    = previousMonthTx.filter(tx => tx.type === "income");
  const currentExpenseTx    = currentMonthTx.filter(tx => tx.type === "expense");
  const previousExpenseTx   = previousMonthTx.filter(tx => tx.type === "expense");
  const currentIncomeAverage  = currentIncomeTx.length  ? totalIncome / currentIncomeTx.length  : 0;
  const previousIncomeAverage = previousIncomeTx.length ? prevIncome / previousIncomeTx.length : 0;
  const currentExpenseAverage  = currentExpenseTx.length  ? totalExpenses / currentExpenseTx.length  : 0;
  const previousExpenseAverage = previousExpenseTx.length ? prevExpense / previousExpenseTx.length : 0;

  const currentSavingsRate  = currentPeriod.r  > 0 ? (currentPeriod.e  / currentPeriod.r)  * 100 : 0;
  const previousSavingsRate = previousPeriod.r > 0 ? (previousPeriod.e / previousPeriod.r) * 100 : 0;

  const comparePeriods = (cur, prev) => !prev ? 0 : Number((((cur - prev) / Math.abs(prev)) * 100).toFixed(1));
  const compareInverse = (cur, prev) => !prev ? 0 : Number((((prev - cur) / Math.abs(prev)) * 100).toFixed(1));

  const comparisonLabel    = "vs mois préc.";

  // ── TENDANCES & COMPARAISONS ──────────────────────────────────────────
  const incomeTrend        = comparePeriods(currentPeriod.r, previousPeriod.r);
  const expenseTrend       = compareInverse(currentPeriod.d, previousPeriod.d);
  const savingsTrend       = comparePeriods(currentPeriod.e, previousPeriod.e);
  const savingsRateTrend   = comparePeriods(currentSavingsRate, previousSavingsRate);
  const incomeCountTrend   = comparePeriods(currentIncomeTx.length, previousIncomeTx.length);
  const incomeAverageTrend = comparePeriods(currentIncomeAverage, previousIncomeAverage);
  const expenseCountTrend  = compareInverse(currentExpenseTx.length, previousExpenseTx.length);
  const expenseAverageTrend = compareInverse(currentExpenseAverage, previousExpenseAverage);

  const budgetTotal     = budgetData.reduce((s, item) => s + item.budget, 0);
  const budgetRemaining = budgetTotal - totalExpenses;
  const budgetRemainingCurrent  = budgetTotal - currentPeriod.d;
  const budgetRemainingPrevious = budgetTotal - previousPeriod.d;
  const budgetRemainingTrend    = comparePeriods(budgetRemainingCurrent, budgetRemainingPrevious);
  const budgetSpentTrend        = expenseTrend;

  // ── Stats globales ─────────────────────────────────────────────────────────
  const bestMonth = monthlyTrend6.length
    ? monthlyTrend6.reduce((best, item) => item.net > best.net ? item : best, monthlyTrend6[0])
    : null;
  const largestExpense = hasTransactions
    ? allTxList.filter(tx => tx.type === "expense").reduce((max, tx) => Math.max(max, Math.abs(tx.amount)), 0)
    : 0;
  const maxSavingsRate = monthlyTrend6.length
    ? monthlyTrend6.reduce((max, item) => {
        const r = item.rPast > 0 ? (item.net / item.rPast) * 100 : 0;
        return Math.max(max, r);
      }, 0)
    : 0;

  // ── Balance automatique (récurrents + jobs) ────────────────────────────────
  const autoIncomeMonth   = sumIncome(  recurringTransactions.filter(tx => tx.date.slice(0,7) === selectedMonthKey));
  const autoExpenseMonth  = sumExpense( recurringTransactions.filter(tx => tx.date.slice(0,7) === selectedMonthKey));
  const jobIncomeMonth    = sumIncome(  acceptedJobTransactions.filter(tx => tx.date.slice(0,7) === selectedMonthKey));
  const totalAutoBalance  = autoIncomeMonth + jobIncomeMonth - autoExpenseMonth;

  // ── Anciens alias (compatibilité avec les vues) ────────────────────────────
  const monthlyFreqIncome  = autoIncomeMonth;
  const monthlyFreqExpense = autoExpenseMonth;
  const totalAutoIncome    = autoIncomeMonth  + jobIncomeMonth;
  const totalAutoExpense   = autoExpenseMonth;

  // ── Divers ─────────────────────────────────────────────────────────────────
  const goalCompletionRate   = goals.length ? Math.round((goals.filter(g => g.saved >= g.target).length / goals.length) * 100) : 0;
  const currentMonthExpenses = sumExpense(currentMonthTx);
  const topExpenseCategory   = expenseCategories.slice().sort((a,b) => b.val - a.val)[0]?.name || "Aucune";

  const lastSavedLabel = lastSavedAt
    ? new Intl.DateTimeFormat("fr-FR", { dateStyle: "short", timeStyle: "medium" }).format(new Date(lastSavedAt))
    : "Pas encore de sauvegarde";
  const ratesCheckedLabel = ratesCheckedAt
    ? new Intl.DateTimeFormat("fr-FR", { dateStyle: "short", timeStyle: "medium" }).format(new Date(ratesCheckedAt))
    : "Jamais synchronisé";
  const ratesSourceLabel = ratesSourceUpdatedAt
    ? new Intl.DateTimeFormat("fr-FR", { dateStyle: "short", timeStyle: "medium" }).format(new Date(ratesSourceUpdatedAt))
    : "Source inconnue";
  const normalizeSearchText = (value = "") =>
    value.toString().toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  const filteredRatesEntries = Object.entries(CURRENCIES)
    .filter(([code]) => code !== "MGA")
    .filter(([code, info]) => {
      const haystack = normalizeSearchText(`${code} ${info.label} ${info.symbol || ""}`);
      return haystack.includes(normalizeSearchText(ratesSearch));
    });

  // ── Calendrier ────────────────────────────────────────────────────────────
  const calendarMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const calendarMonthEnd   = new Date(now.getFullYear(), now.getMonth() + 1, 0);
  const calendarStart      = new Date(calendarMonthStart);
  calendarStart.setDate(calendarMonthStart.getDate() - ((calendarMonthStart.getDay() + 6) % 7));
  const calendarEnd = new Date(calendarMonthEnd);
  calendarEnd.setDate(calendarMonthEnd.getDate() + (7 - ((calendarMonthEnd.getDay() + 6) % 7) - 1));

  // ── CALENDRIER ────────────────────────────────────────────────────────
  const calendarDays = [];
  const calendarEntriesByDate = allTxList.reduce((acc, tx) => {
    if (!acc[tx.date]) acc[tx.date] = [];
    acc[tx.date].push(tx);
    return acc;
  }, {});

  // ── Upcoming timeline ─────────────────────────────────────────────────────
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());


  // ── TIMELINE ÉCHÉANCES ────────────────────────────────────────────────
  const upcomingRecurring = recurringItems
    .filter(item => item.active)
    .map(item => {
      const startDate = new Date(item.startDate);
      if (item.endDate && new Date(item.endDate) < today) return null;
      let nextRun = new Date(now.getFullYear(), now.getMonth(),
        Math.min(Number(item.dayOfMonth) || startDate.getDate(), new Date(now.getFullYear(), now.getMonth()+1,0).getDate()));
      if (nextRun < today) {
        nextRun = new Date(now.getFullYear(), now.getMonth()+1,
          Math.min(Number(item.dayOfMonth) || startDate.getDate(), new Date(now.getFullYear(), now.getMonth()+2,0).getDate()));
      }
      if (nextRun < startDate) nextRun = new Date(startDate);
      return {
        ...item, nextRun,
        scheduleLabel: item.kind==="loan" ? "Échéance prêt" : item.type==="income" ? "Entrée auto" : "Sortie auto",
      };
    })
    .filter(Boolean);

  const upcomingJobPayouts = jobs
    .filter(job => job.status === "accepted" && job.paymentAutoAdd && job.paymentMode !== "none" && job.salary && job.paymentStartDate)
    .flatMap(job => {
      const amount    = Math.abs(Number(job.salary) || 0);
      if (!amount) return [];
      const startDate = new Date(job.paymentStartDate);
      if (job.paymentEndDate && new Date(job.paymentEndDate) < today) return [];
      const results = [];

      if (job.paymentMode === "one_time" || job.paymentMode === "per_mission") {
        const daysDiff = Math.floor((today - startDate) / 86400000);
        const isPast   = startDate < today;
        // Afficher si futur OU passé de moins de 60 jours
        if (!isPast || daysDiff <= 60) {
          results.push({
            id: `job-upcoming-${job.id}`,
            desc: `${job.title}${job.company ? ` — ${job.company}` : ""}`,
            type: "income", amount, nextRun: startDate, sourceType: "job", isPast,
            scheduleLabel: isPast ? "Versement effectué" : "Versement prévu",
          });
        }
      } else {
        // monthly : prochain versement
        let nextRun = new Date(now.getFullYear(), now.getMonth(),
          Math.min(startDate.getDate(), new Date(now.getFullYear(), now.getMonth()+1,0).getDate()));
        if (nextRun < today) {
          nextRun = new Date(now.getFullYear(), now.getMonth()+1,
            Math.min(startDate.getDate(), new Date(now.getFullYear(), now.getMonth()+2,0).getDate()));
        }
        if (nextRun < startDate) nextRun = new Date(startDate);
        results.push({
          id: `job-upcoming-${job.id}`,
          desc: `${job.title}${job.company ? ` — ${job.company}` : ""}`,
          type: "income", amount, nextRun, sourceType: "job", isPast: false,
          scheduleLabel: "Salaire automatique",
        });
      }
      return results;
    })
    .filter(Boolean);

  const upcomingTimeline = [...upcomingRecurring, ...upcomingJobPayouts]
    .sort((a, b) => a.nextRun - b.nextRun);

  // Versements job hors mois sélectionné (alerte dashboard)
  const missedJobPayments = acceptedJobTransactions.filter(tx =>
    tx.sourceType === "job" && tx.date.slice(0,7) !== selectedMonthKey
  );

  const goalAlerts = goals
    .map(goal => ({ ...goal, remaining: Math.max(goal.target - goal.saved, 0) }))
    .sort((a, b) => a.remaining - b.remaining)
    .slice(0, 3);

  for (let day = new Date(calendarStart); day <= calendarEnd; day.setDate(day.getDate() + 1)) {
    const dateKey = formatDateValue(day);
    calendarDays.push({
      key: dateKey,
      dayNumber: day.getDate(),
      isCurrentMonth: day.getMonth() === now.getMonth(),
      isToday: dateKey === formatDateValue(now),
      entries: calendarEntriesByDate[dateKey] || [],
      incomeTotal:  (calendarEntriesByDate[dateKey]||[]).filter(e => e.type==="income").reduce((s,e)=>s+Math.abs(e.amount),0),
      expenseTotal: (calendarEntriesByDate[dateKey]||[]).filter(e => e.type==="expense").reduce((s,e)=>s+Math.abs(e.amount),0),
    });
  }



  // �"?�"? TX CRUD �"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?
  const addOrUpdateTx = () => {
    if (!form.desc || !form.amount) return;
    const raw = parseFloat(form.amount);
    const tx = {
      id: editTx ? editTx.id : Date.now(),
      desc: form.desc, cat: form.cat, type: form.type,
      amount: form.type === "income" ? Math.abs(raw) : -Math.abs(raw),
      date: form.date,
      frequency: form.frequency || "once",
    };
    if (editTx) {
      setTxList(p => p.map(t => t.id === editTx.id ? tx : t));
    } else {
      setTxList(p => [tx, ...p]);
    }
    closeTxModal();
  };
  const deleteTx = (id) => setTxList(p => p.filter(t => t.id !== id));
  const [wizardSlide, setWizardSlide] = useState(0); // 0 = menu, 1 = formulaire
  const [wizardForm, setWizardForm] = useState(null); // 'tx' ou 'recurring'
  
  const openEntryHub = () => {
    setWizardSlide(0);
    setWizardForm(null);
    setShowEntryHubModal(true);
  };
  const closeEntryHub = () => {
    setWizardSlide(0);
    setWizardForm(null);
    setShowEntryHubModal(false);
    // Fermer aussi les modaux internes si ouverts
    setShowModal(false);
    setShowRecurringModal(false);
    setEditTx(null);
    setEditRecurring(null);
  };
  const openQuickAction = (action) => {
    setWizardSlide(1);
    if (action === "income" || action === "expense") {
      openNewTx(action === "income" ? "income" : "expense");
      setWizardForm('tx');
    }
    if (action === "income_recurring" || action === "expense_recurring") {
      openNewRecurring(action === "income_recurring" ? "income" : "expense");
      setWizardForm('recurring');
    }
  };
  const openNewTx = (type = "expense") => {
    setEditTx(null);
    setForm(createTxForm(type));
    setShowModal(true);
  };

  // ── ACTIONS : TRANSACTIONS MANUELLES ──────────────────────────────────
  const openEditTx = (tx) => {
    setEditTx(tx);
    setForm({ type: tx.type, desc: tx.desc, cat: tx.cat, amount: Math.abs(tx.amount), date: tx.date, frequency: tx.frequency || "once" });
    // Ouvrir dans le wizard au lieu du modal
    setShowEntryHubModal(true);
    setWizardSlide(1);
    setWizardForm('tx');
  };
  const closeTxModal = () => {
    setShowModal(false);
    setEditTx(null);
    setForm(createTxForm());
  };


  // ── ACTIONS : RÉCURRENCES ─────────────────────────────────────────────
  const addOrUpdateRecurring = () => {
    if (!recurringForm.desc || !recurringForm.amount || !recurringForm.startDate) return;
    const entry = {
      id: editRecurring ? editRecurring.id : Date.now(),
      desc: recurringForm.desc,
      type: recurringForm.type,
      cat: recurringForm.type === "income" ? "Revenu" : recurringForm.cat,
      amount: Math.abs(parseFloat(recurringForm.amount)),
      startDate: recurringForm.startDate,
      endDate: recurringForm.endDate,
      dayOfMonth: Number(recurringForm.dayOfMonth) || new Date(recurringForm.startDate).getDate(),
      frequency: recurringForm.frequency || "monthly",
      active: recurringForm.active,
      kind: recurringForm.kind,
      penaltyAmount: recurringForm.type === "income" ? 0 : (Number(recurringForm.penaltyAmount) || 0),
      loanTotalAmount: recurringForm.loanTotalAmount === "" ? "" : Number(recurringForm.loanTotalAmount),
      paymentStatuses: editRecurring?.paymentStatuses || {},
    };
    if (editRecurring) {
      setRecurringItems(prev => prev.map(item => item.id === editRecurring.id ? entry : item));
    } else {
      setRecurringItems(prev => [entry, ...prev]);
    }
    closeRecurringModal();
  };
  const openNewRecurring = (type = "expense") => {
    setEditRecurring(null);
    setRecurringForm({
      ...createRecurringForm(),
      type,
      cat: type === "income" ? "Revenu" : "Logement",
    });
    // Ouvrir dans le wizard au lieu du modal
    setShowEntryHubModal(true);
    setWizardSlide(1);
    setWizardForm('recurring');
  };
  const openEditRecurring = (item) => {
    setEditRecurring(item);
    setRecurringForm({
      desc: item.desc,
      type: item.type,
      cat: item.cat,
      amount: item.amount,
      startDate: item.startDate,
      endDate: item.endDate || "",
      dayOfMonth: item.dayOfMonth,
      frequency: item.frequency || "monthly",
      active: item.active,
      kind: item.kind || "standard",
      penaltyAmount: item.penaltyAmount ?? 25000,
      loanTotalAmount: item.loanTotalAmount ?? "",
      paymentStatuses: item.paymentStatuses || {},
    });
    // Ouvrir dans le wizard au lieu du modal
    setShowEntryHubModal(true);
    setWizardSlide(1);
    setWizardForm('recurring');
  };
  const closeRecurringModal = () => {
    setShowRecurringModal(false);
    setEditRecurring(null);
    setRecurringForm(createRecurringForm());
  };
  const deleteRecurring = (id) => setRecurringItems(prev => prev.filter(item => item.id !== id));
  const toggleRecurring = (id) => setRecurringItems(prev => prev.map(item => item.id === id ? { ...item, active: !item.active } : item));
  const setRecurringPaymentStatus = (id, monthKey, status) => setRecurringItems(prev => prev.map(item => {
    if (item.id !== id) return item;
    const nextStatuses = { ...(item.paymentStatuses || {}) };
    if (status === "pending") { delete nextStatuses[monthKey]; }
    else { nextStatuses[monthKey] = status; }
    return { ...item, paymentStatuses: nextStatuses };
  }));

  const setJobPaymentStatus = (id, statusKey, status) => setJobs(prev => prev.map(job => {
    if (job.id !== id) return job;
    const nextStatuses = { ...(job.paymentStatuses || {}) };
    if (status === "pending") { delete nextStatuses[statusKey]; }
    else { nextStatuses[statusKey] = status; }
    return { ...job, paymentStatuses: nextStatuses };
  }));

  // �"?�"? GOAL CRUD �"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?

  // ── ACTIONS : OBJECTIFS ───────────────────────────────────────────────
  const addOrUpdateGoal = () => {
    if (!goalForm.name || !goalForm.target) return;
    const g = {
      id: editGoal ? editGoal.id : Date.now(),
      name: goalForm.name,
      target: parseFloat(goalForm.target),
      saved: parseFloat(goalForm.saved) || 0,
      emoji: goalForm.emoji,
      deadline: goalForm.deadline,
      color: goalForm.color,
    };
    if (editGoal) {
      setGoals(p => p.map(x => x.id === editGoal.id ? g : x));
    } else {
      setGoals(p => [...p, g]);
    }
    closeGoalModal();
  };
  const openNewGoal = () => {
    setEditGoal(null);
    setGoalForm(createGoalForm());
    setShowGoalModal(true);
  };
  const openEditGoal = (g) => {
    setEditGoal(g);
    setGoalForm({ name: g.name, target: g.target, saved: g.saved, emoji: g.emoji, deadline: g.deadline, color: g.color });
    setShowGoalModal(true);
  };
  const deleteGoal = (id) => setGoals(p => p.filter(g => g.id !== id));
  const closeGoalModal = () => {
    setShowGoalModal(false);
    setEditGoal(null);
    setGoalForm(createGoalForm());
  };

  // �"?�"? JOB CRUD �"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?

  // ── ACTIONS : SUIVI TAF ───────────────────────────────────────────────
  const addOrUpdateJob = () => {
    if (!jobForm.title) return;
    const j = { id: editJob ? editJob.id : Date.now(), ...jobForm };
    if (editJob) {
      setJobs(p => p.map(x => x.id === editJob.id ? j : x));
    } else {
      setJobs(p => [j, ...p]);
    }
    closeJobModal();
  };
  const openNewJob = () => {
    setEditJob(null);
    setJobForm(createJobForm(platforms[0]?.id ?? ""));
    setShowJobModal(true);
  };
  const openEditJob = (j) => {
    setEditJob(j);
    setJobForm({
      title: j.title,
      company: j.company,
      platform: j.platform,
      type: j.type,
      status: j.status,
      appliedDate: j.appliedDate,
      salary: j.salary,
      salaryCurrency: j.salaryCurrency || "MGA",
      paymentMode: j.paymentMode || "none",
      paymentAutoAdd: !!j.paymentAutoAdd,
      paymentStartDate: j.paymentStartDate || "",
      paymentEndDate: j.paymentEndDate || "",
      notes: j.notes,
      link: j.link,
    });
    setShowJobModal(true);
  };
  const deleteJob = (id) => setJobs(p => p.filter(j => j.id !== id));
  const closeJobModal = () => {
    setShowJobModal(false);
    setEditJob(null);
    setJobForm(createJobForm(platforms[0]?.id ?? ""));
  };


  // ── ACTIONS : PLATEFORMES ─────────────────────────────────────────────
  const addOrUpdatePlatform = () => {
    if (!platformForm.name || !platformForm.url) return;
    const entry = {
      id: editPlatform ? editPlatform.id : `${platformForm.name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-${Date.now()}`,
      name: platformForm.name,
      url: platformForm.url,
      color: platformForm.color,
      emoji: platformForm.emoji || "PF",
      desc: platformForm.desc,
    };
    if (editPlatform) {
      setPlatforms(prev => prev.map(item => item.id === editPlatform.id ? entry : item));
    } else {
      setPlatforms(prev => [entry, ...prev]);
    }
    closePlatformModal();
  };
  const openNewPlatform = () => {
    setEditPlatform(null);
    setPlatformForm(createPlatformForm());
    setShowPlatformModal(true);
  };
  const openEditPlatform = (platform) => {
    setEditPlatform(platform);
    setPlatformForm({
      name: platform.name,
      url: platform.url,
      emoji: platform.emoji,
      color: platform.color,
      desc: platform.desc,
    });
    setShowPlatformModal(true);
  };
  const closePlatformModal = () => {
    setShowPlatformModal(false);
    setEditPlatform(null);
    setPlatformForm(createPlatformForm());
  };
  const deletePlatform = (id) => {
    setPlatforms(prev => prev.filter(platform => platform.id !== id));
    setJobs(prev => prev.map(job => job.platform === id ? { ...job, platform: "" } : job));
  };


  // ── ACTIONS : BUDGETS ─────────────────────────────────────────────────
  const addOrUpdateBudget = () => {
    if (!budgetForm.category || !budgetForm.limit || isNaN(parseFloat(budgetForm.limit))) return;
    const newEntry = {
      category: budgetForm.category.trim(),
      limit: parseFloat(budgetForm.limit),
    };
    if (editBudget) {
      setBudgets(prev => prev.map(b => b.category === editBudget.category ? newEntry : b));
    } else {
      setBudgets(prev => {
        const exists = prev.some(b => b.category.toLowerCase() === newEntry.category.toLowerCase());
        return exists ? prev.map(b => b.category.toLowerCase() === newEntry.category.toLowerCase() ? newEntry : b) : [...prev, newEntry];
      });
    }
    setShowBudgetModal(false);
    setEditBudget(null);
    setBudgetForm({ category: "", limit: "" });
  };

  const openEditBudget = (b) => {
    setEditBudget(b);
    setBudgetForm({ category: b.category, limit: b.limit.toString() });
    setShowBudgetModal(true);
  };

  const deleteBudget = (category) => {
    setBudgets(prev => prev.filter(b => b.category !== category));
  };

  
  // ── FILTRES DÉRIVÉS ───────────────────────────────────────────────────
  const filteredJobs = jobs.filter(j => {
    const matchStatus = jobFilter === "all" || j.status === jobFilter;
    const platformName = platforms.find(platform => platform.id === j.platform)?.name || "";
    const matchSearch = jobSearch === "" || j.title.toLowerCase().includes(jobSearch.toLowerCase()) || j.company.toLowerCase().includes(jobSearch.toLowerCase()) || platformName.toLowerCase().includes(jobSearch.toLowerCase());
    return matchStatus && matchSearch;
  });

  // �"?�"?�"? INPUT STYLE �"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?
  const inputStyle = {
    width: "100%", padding: "9px 12px", border: `1px solid ${C.border}`,
    borderRadius: 8, fontSize: 13, color: C.text, background: C.card,
    outline: "none", boxSizing: "border-box", fontFamily: "inherit",
  };
  const labelStyle = {
    display: "block", fontSize: 10.5, fontWeight: 800, color: C.muted,
    marginBottom: 5, textTransform: "uppercase", letterSpacing: "0.07em"
  };

  // �"?�"? CURRENCY BAR �"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?

  // ══════════════════════════════════════════════════════════════════════
  // SOUS-COMPOSANTS — Définis dans App pour accéder aux states
  // ══════════════════════════════════════════════════════════════════════
  const SearchableCurrencySelect = ({ value, onChange, mode = "default", fullWidth = false }) => {
    const [open, setOpen] = useState(false);
    const [query, setQuery] = useState("");
    const rootRef = useRef(null);

    useEffect(() => {
      if (!open) return;
      const handleOutsideClick = (event) => {
        if (!rootRef.current?.contains(event.target)) {
          setOpen(false);
          setQuery("");
        }
      };
      window.addEventListener("mousedown", handleOutsideClick);
      return () => window.removeEventListener("mousedown", handleOutsideClick);
    }, [open]);

    const entries = Object.entries(CURRENCIES);
    const filter = normalizeSearchText(query);
    const filtered = entries.filter(([code, info]) =>
      normalizeSearchText(`${code} ${info.label} ${info.symbol || ""}`).includes(filter)
    );
    const selected = CURRENCIES[value] || CURRENCIES.MGA;

    const compact = mode === "compact";
    const triggerStyle = compact
      ? {
          padding: "5px 32px 5px 10px",
          borderRadius: 8,
          border: `1.5px solid ${C.indigo}`,
          background: hexToRgba(C.indigo, 0.08),
          color: C.indigo,
          fontSize: 12.5,
          fontWeight: 700,
          minWidth: 190,
        }
      : {
          ...inputStyle,
          padding: "9px 36px 9px 12px",
          borderRadius: 8,
          border: `1px solid ${C.border}`,
          minWidth: 220,
        };

    return (
      <div ref={rootRef} style={{ position: "relative", width: fullWidth ? "100%" : "auto" }}>
        <button
          type="button"
          onClick={() => setOpen(p => !p)}
          style={{
            ...triggerStyle,
            width: fullWidth ? "100%" : (compact ? "auto" : "100%"),
            textAlign: "left",
            fontFamily: "inherit",
            cursor: "pointer",
            outline: "none",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 8,
            boxSizing: "border-box",
          }}
        >
          <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {compact
              ? `${selected.flag} ${value} — ${selected.label.split(" (")[0]}`
              : `${selected.flag} ${selected.label}`}
          </span>
          <span style={{ fontSize: 10, color: compact ? C.indigo : C.muted, marginLeft: 8 }}>▼</span>
        </button>
        {open && (
          <div style={{ position: "absolute", top: "calc(100% + 6px)", left: 0, right: 0, minWidth: compact ? 280 : 280, background: C.card, border: `1px solid ${C.border}`, borderRadius: 10, boxShadow: "0 12px 30px rgba(15,23,42,0.18)", padding: 8, zIndex: 1400 }}>
            <input
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Rechercher devise…"
              autoFocus
              style={{ ...inputStyle, padding: "8px 10px", fontSize: 12, marginBottom: 8 }}
            />
            <div style={{ maxHeight: 220, overflowY: "auto", display: "grid", gap: 4 }}>
              {filtered.length === 0 && (
                <div style={{ fontSize: 11.5, color: C.muted, padding: "8px 10px" }}>Aucun résultat.</div>
              )}
              {filtered.map(([code, info]) => (
                <button
                  key={code}
                  type="button"
                  onClick={() => {
                    onChange(code);
                    setOpen(false);
                    setQuery("");
                  }}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    gap: 8,
                    width: "100%",
                    border: `1px solid ${code === value ? `${C.indigo}45` : C.border}`,
                    background: code === value ? `${C.indigo}10` : C.card,
                    color: code === value ? C.indigo : C.text,
                    borderRadius: 8,
                    padding: "7px 9px",
                    cursor: "pointer",
                    fontFamily: "inherit",
                  }}
                >
                  <span style={{ fontSize: 12.5, fontWeight: 700, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {info.flag} {code} — {info.label.split(" (")[0]}
                  </span>
                  <span style={{ fontSize: 11, color: C.muted }}>{info.symbol}</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  const CurrencyBar = () => {
    const currInfo = CURRENCIES[currency];
    const rate = currency !== "MGA" ? (rates[currency] || DEFAULT_RATES_EXTENDED[currency] || 1) : null;
    return (
      <div style={{ display: "flex", alignItems: "center", gap: 8, background: C.faint, border: `1px solid ${C.border}`, borderRadius: 10, padding: "6px 10px" }}>
        <SearchableCurrencySelect value={currency} onChange={setCurrency} mode="compact" />
        {/* Taux affiché pour la devise sélectionnée */}
        {currency !== "MGA" && rate && (
          <span style={{ fontSize: 11, color: C.muted, whiteSpace: "nowrap" }}>
            1 {currInfo?.symbol || currency} = {addSpaces(rate)} Ar
          </span>
        )}
        <div style={{ width: 1, height: 18, background: C.border }} />
        <button onClick={fetchRates} style={{ display: "flex", alignItems: "center", gap: 5, background: "none", border: "none", cursor: "pointer", color: C.muted, fontSize: 11 }}>
          <RefreshCw size={12} style={{ animation: ratesLoading ? "spin 1s linear infinite" : "none", color: ratesLoading ? C.indigo : C.muted }} />
          <span style={{ color: ratesLoading ? C.indigo : C.muted }}>
            {ratesLoading ? "Synchro…" : ratesUpdated ? ratesUpdated : "Actualiser"}
          </span>
        </button>
      </div>
    );
  };

  // �"?�"? SIDEBAR �"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?
  const Sidebar = () => (
    <div style={{ width:sidebarCollapsed?55:235, minWidth:sidebarCollapsed?55:235, background:C.sidebar, display:"flex", flexDirection:"column", height:"100vh", borderRight:`1px solid ${C.sidebarBorder}`, overflow:"hidden", transition:"width 0.3s cubic-bezier(0.4,0,0.2,1), min-width 0.3s cubic-bezier(0.4,0,0.2,1)" }}>

      {/* Profil — toujours dans le DOM, texte animé CSS */}
      <div style={{ width:sidebarCollapsed?"55px":"235px", height:"77px", boxSizing:"border-box", padding:sidebarCollapsed?"8px 8px 10px":"12px 14px 10px", borderBottom:`1px solid ${C.sidebarBorder}`, flexShrink:0, transition:"padding 0.3s ease, height 0.3s ease, width 0.3s ease" }}>
        {sidebarCollapsed ? (
          <div style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:6 }}>
            <button className="ft-hamburger" onClick={()=>setSidebarCollapsed(c=>!c)} style={{ background:"transparent", border:"none", cursor:"pointer", padding:4, borderRadius:8, color:C.sidebarText, display:"flex", alignItems:"center", justifyContent:"center" }}>
              <span style={{ fontSize:16 }}>☰</span>
            </button>
            <div style={{ width:28, height:28, borderRadius:"50%", background:`linear-gradient(135deg,${C.blue},${C.indigo})`, display:"flex", alignItems:"center", justifyContent:"center", color:"#fff", fontSize:9, fontWeight:800, flexShrink:0, cursor:"pointer" }}>
              {(()=>{ const n=profile.fullName||""; return n.split(" ").map(w=>w[0]).join("").toUpperCase().slice(0,2)||"??"; })()}
            </div>
          </div>
        ) : (
          <div style={{ display:"flex", alignItems:"center", gap:8 }}>
            <div style={{ width:28, height:28, borderRadius:"50%", background:`linear-gradient(135deg,${C.blue},${C.indigo})`, display:"flex", alignItems:"center", justifyContent:"center", color:"#fff", fontSize:9, fontWeight:800, flexShrink:0, cursor:"pointer" }}>
              {(()=>{ const n=profile.fullName||""; return n.split(" ").map(w=>w[0]).join("").toUpperCase().slice(0,2)||"??"; })()}
            </div>
            <div style={{ overflow:"hidden", flex:1, minWidth:0, whiteSpace:"nowrap", transition:"opacity 0.22s ease, max-width 0.28s cubic-bezier(0.4,0,0.2,1)" }}>
              <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", gap:8 }}>
                <div style={{ color:"#E2E8F0", fontSize:11, fontWeight:600, overflow:"hidden", textOverflow:"ellipsis" }}>{profile.fullName||"Utilisateur"}</div>
                <button className="ft-hamburger" onClick={()=>setSidebarCollapsed(c=>!c)} style={{ background:"transparent", border:"none", cursor:"pointer", padding:4, borderRadius:8, color:C.sidebarText, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
                  <span style={{ fontSize:16 }}>✕</span>
                </button>
              </div>
              <div style={{ color:C.sidebarText, fontSize:9.5, marginTop:1 }}>Espace personnel</div>
            </div>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav style={{ flex:1, padding:"8px 6px", overflowY:"auto", overflowX:"hidden" }}>
        {[
          { id: "workspace", label: "Espace de travail" },
          { id: "preferences", label: "Préférences" },
        ].map((section, sectionIndex) => (
          <div key={section.id}>
            <p style={{ color:C.sidebarText, fontSize:9, fontWeight:800, letterSpacing:"0.12em", textTransform:"uppercase", padding:sectionIndex===0?"10px 8px 6px":"6px 8px 6px", whiteSpace:"nowrap", opacity:sidebarCollapsed?0:1, maxHeight:sidebarCollapsed?0:32, overflow:"hidden", transition:"opacity 0.2s ease, max-height 0.28s cubic-bezier(0.4,0,0.2,1)" }}>
              {section.label}
            </p>
            {NAV.filter(item => item.section === section.id).map(({ id, label, icon: Icon })=>{ const on=active===id; return (
              <button key={id} onClick={()=>setActive(id)} className="ft-nav-btn" style={{ display:"flex", alignItems:"center", gap:9, justifyContent:sidebarCollapsed?"center":"flex-start", width:"100%", padding:sidebarCollapsed?"10px 0":"8px 10px", marginBottom:2, background:on?C.sidebarActive:"transparent", border:"none", borderLeft:`2.5px solid ${on?C.sidebarActiveBorder:"transparent"}`, borderRadius:"0 9px 9px 0", color:on?C.sidebarActiveText:C.sidebarText, cursor:"pointer", fontSize:12.5, fontWeight:on?700:500, transition:"background 0.18s, color 0.18s, padding 0.28s cubic-bezier(0.4,0,0.2,1)" }}>
                <span style={{ flexShrink:0, width:16, height:16, display:"inline-flex", alignItems:"center", justifyContent:"center" }}>{Icon ? <Icon size={15} strokeWidth={2} /> : null}</span>
                <span style={{ opacity:sidebarCollapsed?0:1, maxWidth:sidebarCollapsed?0:160, overflow:"hidden", whiteSpace:"nowrap", transform:sidebarCollapsed?"translateX(-6px)":"translateX(0)", transition:"opacity 0.22s ease, max-width 0.28s cubic-bezier(0.4,0,0.2,1), transform 0.22s ease", display:"inline-flex", alignItems:"center", gap:6 }}>
                  {label}
                  {id==="suivi_taf" && jobs.filter(j=>j.status==="interview"||j.status==="offer").length>0 && (
                    <span style={{ background:C.green, color:"#fff", fontSize:9, fontWeight:800, padding:"2px 6px", borderRadius:10, flexShrink:0 }}>{jobs.filter(j=>j.status==="interview"||j.status==="offer").length}</span>
                  )}
                </span>
              </button>
            );})}
            {sectionIndex === 0 && <div style={{ height:1, background:C.sidebarBorder, margin:"10px 4px", opacity:sidebarCollapsed?0:1, transition:"opacity 0.2s ease" }} />}
          </div>
        ))}
      </nav>

      {/* Bouton FinGuide */}
      <div style={{ padding: sidebarCollapsed ? "8px 6px" : "8px 10px", flexShrink:0, transition:"padding 0.3s ease" }}>
        <button onClick={() => setShowFinGuide(true)} style={{ display:"flex", alignItems:"center", gap:9, justifyContent:sidebarCollapsed?"center":"flex-start", width:"100%", padding:sidebarCollapsed?"10px 0":"9px 10px", background:"linear-gradient(135deg,rgba(99,102,241,0.18),rgba(59,130,246,0.12))", border:"1px solid rgba(99,102,241,0.35)", borderRadius:9, color:"#A5B4FC", cursor:"pointer", fontSize:12.5, fontWeight:700, transition:"all 0.2s ease" }}>
          <span style={{ flexShrink:0, fontSize:16 }}>📚</span>
          <span style={{ opacity:sidebarCollapsed?0:1, maxWidth:sidebarCollapsed?0:160, overflow:"hidden", whiteSpace:"nowrap", transform:sidebarCollapsed?"translateX(-6px)":"translateX(0)", transition:"opacity 0.22s ease, max-width 0.28s cubic-bezier(0.4,0,0.2,1), transform 0.22s ease" }}>Guide Financier</span>
        </button>
      </div>

      {/* Panneau bas */}
      <div style={{ overflow:"hidden", maxHeight:sidebarCollapsed?0:120, opacity:sidebarCollapsed?0:1, padding:sidebarCollapsed?"0 16px":"14px 16px", borderTop:`1px solid ${C.sidebarBorder}`, transition:"max-height 0.3s cubic-bezier(0.4,0,0.2,1), opacity 0.22s ease, padding 0.28s ease", flexShrink:0 }}>
        <div style={{ background:`linear-gradient(135deg,${hexToRgba(C.indigo,0.22)},${hexToRgba(C.blue,0.14)})`, borderRadius:12, padding:"12px 14px", border:`1px solid ${hexToRgba(C.indigo,0.35)}`, boxShadow:`0 4px 16px ${hexToRgba(C.indigo,0.15)}` }}>
          <div style={{ color:hexToRgba("#E2E8F0",0.7), fontSize:9.5, fontWeight:800, textTransform:"uppercase", letterSpacing:"0.1em", marginBottom:4 }}>Taux net épargne</div>
          <div style={{ color:"#F8FAFC", fontSize:28, fontWeight:900, letterSpacing:0, lineHeight:1 }}>{savingsRate}%</div>
          <div style={{ color:"#CBD5E1", fontSize:10, marginTop:5 }}>
            <span style={{ color:savingsRateTrend>0?C.green:savingsRateTrend<0?"#F87171":"#94A3B8", fontWeight:700 }}>{savingsRateTrend>0?"▲":savingsRateTrend<0?"▼":"●"} {Math.abs(savingsRateTrend)}%</span> {comparisonLabel}
          </div>
        </div>
      </div>
    </div>
  );
  const PageHeader = ({ title, sub, actions }) => (
    <div className="ft-page-header" style={{ background: C.card, borderBottom: `1px solid ${C.border}`, padding: "15px 28px", position: "sticky", top: 0, zIndex: 10 }}>
      <div className="ft-page-header-inner" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 10, minHeight: 48 }}>
        <div className="ft-page-header-title-wrap">
          <h1 style={{ fontSize: 19, fontWeight: 900, color: C.text, letterSpacing: 0, lineHeight: 1.18, textShadow:`0 1px 0 ${hexToRgba(C.card, 0.95)}` }}>{title}</h1>
          <p style={{ fontSize: 11.5, color: C.muted, marginTop: 3, lineHeight: 1.35, letterSpacing: 0 }}>{sub}</p>
        </div>
        <div className="ft-page-header-actions" style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
          <CurrencyBar />
          {actions}
        </div>
      </div>
    </div>
  );

  // �"?�"? KPI CARD �"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?
  const KPI = ({ label, value, icon, color, trend, tLabel, scale = 1, borderRadius = null }) => (
    <div className="ft-card ft-hover" style={{
      background: `linear-gradient(145deg, ${C.card} 60%, ${hexToRgba(color, 0.07)} 100%)`,
      borderRadius: borderRadius !== null ? borderRadius : 14 * scale, padding: `${20 * scale}px ${22 * scale}px`,
      border: `1px solid ${hexToRgba(color, 0.18)}`,
      boxShadow: `0 2px 12px ${hexToRgba(color, 0.09)}, 0 1px 3px rgba(0,0,0,0.04)`,
      borderTop: `3px solid ${color}`, position: "relative", overflow: "hidden",
    }}>
      <div style={{
        position: "absolute", top: -18 * scale, right: -18 * scale, width: 72 * scale, height: 72 * scale,
        borderRadius: "50%", background: hexToRgba(color, 0.08),
        pointerEvents: "none",
      }} />
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 * scale }}>
        <span style={{ fontSize: 11 * scale, color: C.muted, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em" }}>{label}</span>
        <span style={{ width: 34 * scale, height: 34 * scale, borderRadius: 10 * scale, background: hexToRgba(color, 0.14), display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13 * scale, fontWeight: 800, color }}>
          {icon}
        </span>
      </div>
      <div className="ft-value" style={{ fontSize: 22 * scale, fontWeight: 900, color: C.text, letterSpacing: 0, marginBottom: 8 * scale }}>{value}</div>
      <div style={{ display: "flex", alignItems: "center", gap: 5 * scale }}>
        <span style={{ fontSize: 11 * scale, fontWeight: 700, color: trend > 0 ? C.green : trend < 0 ? C.red : C.muted, background: trend > 0 ? `${C.green}18` : trend < 0 ? `${C.red}18` : C.faint, padding: `${2 * scale}px ${7 * scale}px`, borderRadius: 5 * scale }}>
          {trend > 0 ? `▲ ${Math.abs(trend)}%` : trend < 0 ? `▼ ${Math.abs(trend)}%` : "0%"}
        </span>
        <span style={{ fontSize: 11 * scale, color: C.muted }}>{tLabel}</span>
      </div>
    </div>
  );

  // �"?�"? DARK TOOLTIP �"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?
  const DarkTooltip = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null;
    return (
      <div style={{ background: "#1E293B", borderRadius: 8, padding: "10px 14px", border: "1px solid #334155" }}>
        <p style={{ color: "#94A3B8", fontSize: 11, marginBottom: 6, fontWeight: 600 }}>{label}</p>
        {payload.map((p, i) => (
          <p key={i} style={{ color: p.color, fontSize: 12, fontWeight: 600, marginBottom: 2 }}>
            {p.name}: {p.value < 0 ? "−" : ""}{fmt(Math.abs(p.value), currency, rates)}
          </p>
        ))}
      </div>
    );
  };


  // ── VUE : TABLEAU DE BORD ─────────────────────────────────────────────
  const Dashboard = () => {
    // ═══════════════════════════════════════════════════════════════
    // GRILLE 12×N  —  système à la Grafana
    // col/row : index 1-based  |  colSpan/rowSpan : nb de cases
    // GRID_COLS = 12 colonnes (A…L)
    // CELL_H    = hauteur d'une ligne en px
    // GAP       = espace entre les cases
    // ═══════════════════════════════════════════════════════════════
    const GRID_COLS = 12;
    const CELL_H    = 64;
    const GAP       = 8;
    const LAYOUT_V  = 4; // incrémenter = reset automatique des anciens layouts

    const currentDateLabel = now.toLocaleDateString("fr-FR", {
      weekday: "long", day: "numeric", month: "long", year: "numeric",
    });
    // ── Score santé basé sur les transactions CONFIRMÉES uniquement ──────────
    // (on_time / late pour récurrents+jobs, date passée pour manuels)
    const realizedSavings     = totalIncomeRealized - totalExpenseRealized;
    const realSavingsRate     = totalIncomeRealized > 0
      ? (realizedSavings / totalIncomeRealized) * 100 : 0;

    const srScore    = Math.min(40, Math.round(realSavingsRate * 1.2));
    const expRatio   = totalIncomeRealized > 0
      ? totalExpenseRealized / totalIncomeRealized : 1;
    const expScore   = Math.max(0, Math.round((1 - expRatio) * 40));
    const goalScore  = goals.length > 0
      ? Math.round((goals.filter(g => g.saved / g.target >= 0.5).length / goals.length) * 20)
      : 10;
    // Bonus : % de récurrents/jobs confirmés ce mois (encourage à marquer "Reçu/Payé")
    const recurringThisMonth  = selectedMonthTx.filter(t => t.isRecurring);
    const confirmedRec        = recurringThisMonth.filter(t => isConfirmed(t)).length;
    const confirmBonus        = recurringThisMonth.length > 0
      ? Math.round((confirmedRec / recurringThisMonth.length) * 10) : 5;

    const monthlyHealthScore  = Math.max(0, Math.min(100,
      srScore + expScore + goalScore + confirmBonus));

    // ── Disposition par défaut ──────────────────────────────────────
    const DEFAULT_BLOCK_DEFS = [
      // Ligne 1-2 : KPIs pleine largeur
      { id:"kpis",       label:"KPIs principaux",       col:1,  row:1,  colSpan:12, rowSpan:2 },
      // Ligne 3-8 : Graphique (8 cols) | Santé (4 cols haut) + Échéances (4 cols bas)
      { id:"chart_main", label:"Graphique Évolution",   col:1,  row:3,  colSpan:8,  rowSpan:7 },
      { id:"health",     label:"Santé financière",      col:9,  row:3,  colSpan:4,  rowSpan:3 },
      { id:"upcoming",   label:"Prochaines échéances",  col:9,  row:6,  colSpan:4,  rowSpan:4 },
      // Ligne 10-15 : Transactions | Objectifs | Calendrier (4-4-4)
      { id:"txrecent",   label:"Transactions récentes", col:1,  row:10, colSpan:4,  rowSpan:6 },
      { id:"goals",      label:"Objectifs clés",        col:5,  row:10, colSpan:4,  rowSpan:6 },
      { id:"calendar",   label:"Calendrier du mois",    col:9,  row:10, colSpan:4,  rowSpan:6 },
      // Ligne 16-20 : Graphiques comparatifs (6-6)
      { id:"statbars",   label:"Revenus vs Dépenses",   col:1,  row:16, colSpan:6,  rowSpan:5 },
      { id:"statsav",    label:"Solde net mensuel",     col:7,  row:16, colSpan:6,  rowSpan:5 },
      // Ligne 21-23 : Stats rapides pleine largeur
      { id:"quickstats", label:"Statistiques rapides",  col:1,  row:21, colSpan:12, rowSpan:3 },
    ];

    const ALL_BLOCK_DEFS = [
      ...DEFAULT_BLOCK_DEFS,
      { id:"savingsrate", label:"Taux d'épargne",       col:1, row:1, colSpan:3, rowSpan:2 },
      { id:"piecat",      label:"Répartition dépenses", col:1, row:1, colSpan:4, rowSpan:5 },
      { id:"autobalance", label:"Balance automatique",  col:1, row:1, colSpan:3, rowSpan:2 },
    ];

    const createBlockInstanceId = (typeId, suffix = "") => {
      const randomPart = Math.random().toString(36).slice(2, 8);
      const stamp = Date.now().toString(36);
      return `${typeId}-${stamp}${suffix ? `-${suffix}` : ""}-${randomPart}`;
    };

    const createBlockFromDef = (def, overrides = {}) => ({
      id: createBlockInstanceId(def.id),
      typeId: def.id,
      label: def.label,
      col: def.col,
      row: def.row,
      colSpan: def.colSpan,
      rowSpan: def.rowSpan,
      v: LAYOUT_V,
      ...overrides,
    });

    const normalizeBlocks = (list) => {
      const seen = new Set();
      return (list || []).map((block, index) => {
        const typeId = block.typeId || block.id || `bloc-${index + 1}`;
        const def = ALL_BLOCK_DEFS.find(item => item.id === typeId);
        let id = block.id || createBlockInstanceId(typeId, String(index));
        if (seen.has(id)) id = createBlockInstanceId(typeId, `dup${index}`);
        seen.add(id);
        return {
          id,
          typeId,
          label: block.label || def?.label || typeId,
          col: Math.max(1, Number(block.col) || def?.col || 1),
          row: Math.max(1, Number(block.row) || def?.row || 1),
          colSpan: Math.max(1, Number(block.colSpan) || def?.colSpan || 1),
          rowSpan: Math.max(1, Number(block.rowSpan) || def?.rowSpan || 1),
          v: LAYOUT_V,
        };
      });
    };

    const DEFAULT_BLOCKS = DEFAULT_BLOCK_DEFS.map(def => ({
      ...def,
      id: def.id,
      typeId: def.id,
      v: LAYOUT_V,
    }));

    // Auto-reset si version obsolète
    const storedValid = Array.isArray(dashLayout) && dashLayout.length > 0 && dashLayout[0]?.v === LAYOUT_V;
    const blocks = storedValid ? normalizeBlocks(dashLayout) : DEFAULT_BLOCKS;

    const layoutHistoryRef = useRef([]);
    const layoutHistoryIndexRef = useRef(-1);
    const editSessionStartRef = useRef(null);
    const addPanelResizeRef = useRef(null);

    const toLayoutSnapshot = (list) =>
      list.map(({ id, typeId, label, col, row, colSpan, rowSpan, v }) => ({ id, typeId, label, col, row, colSpan, rowSpan, v }));

    const setBlocks = (updater) => {
      setDashLayout(prevState => {
        const baseBlocks = (Array.isArray(prevState) && prevState.length > 0 && prevState[0]?.v === LAYOUT_V)
          ? normalizeBlocks(prevState)
          : DEFAULT_BLOCKS.map(item => ({ ...item }));
        const nextBlocks = typeof updater === "function" ? updater(baseBlocks) : updater;
        const normalized = normalizeBlocks(nextBlocks).map(b => ({ ...b, v: LAYOUT_V }));
        if (dashEditMode) {
          const snapshot = toLayoutSnapshot(normalized);
          const history = layoutHistoryRef.current;
          const index = layoutHistoryIndexRef.current;
          const current = index >= 0 ? history[index] : null;
          if (!current || JSON.stringify(current) !== JSON.stringify(snapshot)) {
            const trimmed = index >= 0 ? history.slice(0, index + 1) : [];
            trimmed.push(snapshot);
            layoutHistoryRef.current = trimmed.slice(-80);
            layoutHistoryIndexRef.current = layoutHistoryRef.current.length - 1;
          }
        }
        return normalized;
      });
    };

    const canUndoLayout = dashEditMode && layoutHistoryIndexRef.current > 0;
    const canRedoLayout = dashEditMode && layoutHistoryIndexRef.current >= 0 && layoutHistoryIndexRef.current < (layoutHistoryRef.current.length - 1);
    const applyHistoryLayout = (index) => {
      const snapshot = layoutHistoryRef.current[index];
      if (!snapshot) return;
      layoutHistoryIndexRef.current = index;
      setDashLayout(snapshot.map(item => ({ ...item, v: LAYOUT_V })));
    };
    const undoLayout = () => {
      if (!canUndoLayout) return;
      applyHistoryLayout(layoutHistoryIndexRef.current - 1);
    };
    const redoLayout = () => {
      if (!canRedoLayout) return;
      applyHistoryLayout(layoutHistoryIndexRef.current + 1);
    };
    const cancelLayoutEdits = () => {
      const initial = editSessionStartRef.current || layoutHistoryRef.current[0];
      if (initial?.length) {
        setDashLayout(initial.map(item => ({ ...item, v: LAYOUT_V })));
      }
      setDashAddPanel(false);
      setDashEditMode(false);
    };

    useEffect(() => {
      if (!storedValid || !Array.isArray(dashLayout)) return;
      const migrated = normalizeBlocks(dashLayout);
      if (JSON.stringify(migrated) !== JSON.stringify(dashLayout)) {
        setDashLayout(migrated);
      }
    }, [storedValid, dashLayout]);

    useEffect(() => {
      if (!dashEditMode) {
        layoutHistoryRef.current = [];
        layoutHistoryIndexRef.current = -1;
        editSessionStartRef.current = null;
        return;
      }
      const initial = toLayoutSnapshot(blocks.map(b => ({ ...b, v: LAYOUT_V })));
      editSessionStartRef.current = initial;
      layoutHistoryRef.current = [initial];
      layoutHistoryIndexRef.current = 0;
    }, [dashEditMode]);

    const removeBlock    = (id)  => setBlocks(prev => prev.filter(b => b.id !== id));
    const resetLayout    = ()    => setBlocks(DEFAULT_BLOCKS.map(block => ({ ...block })));
    const availableToAdd = ALL_BLOCK_DEFS;
    const addBlock = (def) => {
      setBlocks(prev => {
        const maxRow = prev.reduce((m, b) => Math.max(m, b.row + b.rowSpan), 0);
        return [...prev, createBlockFromDef(def, { row: maxRow })];
      });
    };
    const startResizeAddPanel = (e) => {
      e.preventDefault();
      e.stopPropagation();
      const startY = e.clientY;
      const startHeight = dashAddPanelHeight;
      addPanelResizeRef.current = true;
      const onMove = (ev) => {
        const delta = ev.clientY - startY;
        const nextHeight = Math.max(110, Math.min(480, startHeight + delta));
        setDashAddPanelHeight(nextHeight);
      };
      const onUp = () => {
        addPanelResizeRef.current = null;
        window.removeEventListener("mousemove", onMove);
        window.removeEventListener("mouseup", onUp);
      };
      window.addEventListener("mousemove", onMove);
      window.addEventListener("mouseup", onUp);
    };

    // ── Collision  ──────────────────────────────────────────────────
    const overlaps = (a, b) =>
      a.id !== b.id &&
      a.col < b.col + b.colSpan && a.col + a.colSpan > b.col &&
      a.row < b.row + b.rowSpan && a.row + a.rowSpan > b.row;

    const resolveCollisions = (all, movedId) => {
      const result = all.map(b => ({ ...b }));
      let changed = true, iter = 0;
      while (changed && iter++ < 80) {
        changed = false;
        result.sort((a, b) => a.row - b.row);
        for (const a of result) {
          for (const b of result) {
            if (!overlaps(a, b)) continue;
            // b est poussé sous a
            const newRow = a.row + a.rowSpan;
            if (b.row < newRow) { b.row = newRow; changed = true; }
          }
        }
      }
      return result;
    };

    const gridRef = dashGridRef;

    // ── Drag pour déplacer ─────────────────────────────────────────
    const startDrag = (e, id) => {
      if (!dashEditMode) return;
      e.preventDefault();
      const block = blocks.find(b => b.id === id);
      const rect = gridRef.current?.getBoundingClientRect();
      if (!rect) return;
      const cellW = rect.width / GRID_COLS;
      const cellH = CELL_H + GAP;
      // Offset de la souris dans le bloc (en cases)
      const offC = Math.min(block.colSpan - 1, Math.max(0, Math.floor((e.clientX - (rect.left + (block.col - 1) * cellW)) / cellW)));
      const offR = Math.min(block.rowSpan - 1, Math.max(0, Math.floor((e.clientY - (rect.top  + (block.row - 1) * cellH)) / cellH)));

      let lastCol = block.col, lastRow = block.row;

      const onMove = (ev) => {
        const r = gridRef.current?.getBoundingClientRect();
        if (!r) return;
        const cw = r.width / GRID_COLS;
        const ch = CELL_H + GAP;
        const newCol = Math.max(1, Math.min(GRID_COLS - block.colSpan + 1,
          Math.round((ev.clientX - r.left) / cw) - offC + 1));
        const newRow = Math.max(1,
          Math.round((ev.clientY - r.top) / ch) - offR + 1);
        if (newCol === lastCol && newRow === lastRow) return;
        lastCol = newCol; lastRow = newRow;
        setBlocks(prev => {
          const upd = prev.map(b => b.id === id ? { ...b, col: newCol, row: newRow } : b);
          return resolveCollisions(upd, id);
        });
      };
      const onUp = () => {
        window.removeEventListener("mousemove", onMove);
        window.removeEventListener("mouseup", onUp);
      };
      window.addEventListener("mousemove", onMove);
      window.addEventListener("mouseup", onUp);
    };

    // ── Resize côté droit (colSpan) ─────────────────────────────────
    const startResizeCol = (e, id) => {
      if (!dashEditMode) return;
      e.preventDefault(); e.stopPropagation();
      const block = blocks.find(b => b.id === id);
      const onMove = (ev) => {
        const r = gridRef.current?.getBoundingClientRect();
        if (!r) return;
        const cw = r.width / GRID_COLS;
        const mouseCol = Math.floor((ev.clientX - r.left) / cw) + 1;
        const newColSpan = Math.max(1, Math.min(GRID_COLS - block.col + 1, mouseCol - block.col + 1));
        setBlocks(prev => {
          const upd = prev.map(b => b.id === id ? { ...b, colSpan: newColSpan } : b);
          return resolveCollisions(upd, id);
        });
      };
      const onUp = () => {
        window.removeEventListener("mousemove", onMove);
        window.removeEventListener("mouseup", onUp);
      };
      window.addEventListener("mousemove", onMove);
      window.addEventListener("mouseup", onUp);
    };

    // ── Resize bord bas (rowSpan) ───────────────────────────────────
    const startResizeRow = (e, id) => {
      if (!dashEditMode) return;
      e.preventDefault(); e.stopPropagation();
      const block = blocks.find(b => b.id === id);
      const onMove = (ev) => {
        const r = gridRef.current?.getBoundingClientRect();
        if (!r) return;
        const ch = CELL_H + GAP;
        const mouseRow = Math.floor((ev.clientY - r.top) / ch) + 1;
        const newRowSpan = Math.max(1, mouseRow - block.row + 1);
        setBlocks(prev => {
          const upd = prev.map(b => b.id === id ? { ...b, rowSpan: newRowSpan } : b);
          return resolveCollisions(upd, id);
        });
      };
      const onUp = () => {
        window.removeEventListener("mousemove", onMove);
        window.removeEventListener("mouseup", onUp);
      };
      window.addEventListener("mousemove", onMove);
      window.addEventListener("mouseup", onUp);
    };

    // ── Rendu du contenu de chaque bloc ────────────────────────────
    const renderBlockContent = (block) => {
      // Aliases locaux pour les helpers de niveau module (C passé en prop)
      const BH    = (props) => <DashBH    {...props} C={C} />;
      const Tag   = (props) => <DashTag   {...props} />;
      const Trend = (props) => <DashTrend {...props} C={C} />;

      switch (block.typeId || block.id) {

        // ═══════════════════════════════════════════════════════════
        // KPIs
        // ═══════════════════════════════════════════════════════════
        case "kpis": {
          const prevIncomeReal  = previousMonthSummary.incomeRealized;
          const prevExpenseReal = previousMonthSummary.expenseRealized;
          const prevSavingsReal = previousMonthSummary.netRealized;
          const prevRateReal    = prevIncomeReal > 0 ? (prevSavingsReal / prevIncomeReal) * 100 : 0;
          const trendRI = comparePeriods(totalIncomeRealized, prevIncomeReal);
          const trendRE = compareInverse(totalExpenseRealized, prevExpenseReal);
          const trendRS = comparePeriods(realizedSavings, prevSavingsReal);
          const trendRR = comparePeriods(realSavingsRate, prevRateReal);

          const KCard = ({ label, icon, main, mainColor, pending, pendingLabel, trend, inverted }) => (
            <div style={{ background:C.card, borderRadius:12, padding:"14px 15px", border:`1px solid ${C.border}`, borderLeft:`3px solid ${mainColor}`, display:"flex", flexDirection:"column", gap:10, height:"100%", boxShadow:"0 1px 6px rgba(0,0,0,0.04)" }}>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                <span style={{ fontSize:10, fontWeight:800, color:C.muted, textTransform:"uppercase", letterSpacing:"0.08em" }}>{label}</span>
                <span style={{ fontSize:16 }}>{icon}</span>
              </div>
              <div>
                <div style={{ fontSize:19, fontWeight:900, color:mainColor, letterSpacing:0, lineHeight:1 }}>{main}</div>
                {pending > 0 && (
                  <div style={{ display:"flex", alignItems:"center", gap:4, marginTop:5 }}>
                    <Tag label="EN ATTENTE" color={C.amber} />
                    <span style={{ fontSize:10, color:C.amber, fontWeight:700 }}>{f(pending)}</span>
                  </div>
                )}
              </div>
              <div style={{ marginTop:"auto" }}>
                <Trend val={trend} label={comparisonLabel} inverted={inverted} />
              </div>
            </div>
          );

          return (
            <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:10, height:"100%" }}>
              <KCard label="Revenus reçus"     icon="↑" main={f(totalIncomeRealized)}  mainColor={C.green}  pending={totalIncomePlanned}  pendingLabel="à recevoir" trend={trendRI} inverted={false} />
              <KCard label="Dépenses payées"   icon="↓" main={f(totalExpenseRealized)} mainColor={C.red}    pending={totalExpensePlanned} pendingLabel="à payer"    trend={trendRE} inverted={true}  />
              <div style={{ background:C.card, borderRadius:12, padding:"14px 15px", border:`1px solid ${C.border}`, borderLeft:`3px solid ${realizedSavings>=0?C.blue:C.red}`, display:"flex", flexDirection:"column", gap:10, height:"100%", boxShadow:"0 1px 6px rgba(0,0,0,0.04)" }}>
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                  <span style={{ fontSize:10, fontWeight:800, color:C.muted, textTransform:"uppercase", letterSpacing:"0.08em" }}>Solde réel</span>
                  <span style={{ fontSize:16 }}>⚖</span>
                </div>
                <div>
                  <div style={{ fontSize:19, fontWeight:900, color:realizedSavings>=0?C.blue:C.red, letterSpacing:0, lineHeight:1 }}>{realizedSavings>=0?"+":""}{f(realizedSavings)}</div>
                  {totalIncomePlanned + totalExpensePlanned > 0 && (
                    <div style={{ marginTop:5, display:"flex", alignItems:"center", gap:4 }}>
                      <Tag label="FORECAST" color={C.indigo} />
                      <span style={{ fontSize:10, color:C.indigo, fontWeight:700 }}>{projectedSavings>=0?"+":""}{f(projectedSavings)}</span>
                    </div>
                  )}
                </div>
                <div style={{ marginTop:"auto" }}><Trend val={trendRS} label={comparisonLabel} inverted={false} /></div>
              </div>
              <div style={{ background:C.card, borderRadius:12, padding:"14px 15px", border:`1px solid ${C.border}`, borderLeft:`3px solid ${C.indigo}`, display:"flex", flexDirection:"column", gap:10, height:"100%", boxShadow:"0 1px 6px rgba(0,0,0,0.04)" }}>
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                  <span style={{ fontSize:10, fontWeight:800, color:C.muted, textTransform:"uppercase", letterSpacing:"0.08em" }}>Taux réel</span>
                  <span style={{ fontSize:16 }}>%</span>
                </div>
                <div>
                  <div style={{ fontSize:19, fontWeight:900, color:C.indigo, letterSpacing:0, lineHeight:1 }}>{realSavingsRate.toFixed(1)}%</div>
                  {Math.abs(parseFloat(projectedRate) - realSavingsRate) > 0.5 && (
                    <div style={{ marginTop:5, display:"flex", alignItems:"center", gap:4 }}>
                      <Tag label="FORECAST" color={C.indigo} />
                      <span style={{ fontSize:10, color:C.indigo, fontWeight:700 }}>{projectedRate}%</span>
                    </div>
                  )}
                </div>
                <div style={{ marginTop:"auto" }}><Trend val={trendRR} label={comparisonLabel} inverted={false} /></div>
              </div>
            </div>
          );
        }

        // ═══════════════════════════════════════════════════════════
        // GRAPHIQUE PRINCIPAL
        // ═══════════════════════════════════════════════════════════
        case "chart_main": return (
          <div style={{ display:"flex", flexDirection:"column", height:"100%" }}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:8, flexWrap:"wrap", gap:6, flexShrink:0 }}>
              <div>
                <div style={{ fontSize:12.5, fontWeight:800, color:C.text }}>Revenus & Dépenses {chartFilter==="daily"&&`· ${chartMonth}`}</div>
                <div style={{ fontSize:10, color:C.muted, marginTop:2, display:"flex", gap:8, flexWrap:"wrap" }}>
                  <span style={{ color:C.green, fontWeight:700 }}>● Réalisé</span>
                  <span style={{ color:C.amber, fontWeight:700 }}>● À venir</span>
                  <span style={{ color:C.red, fontWeight:700 }}>● Dépenses</span>
                  <span style={{ color:C.blue, fontWeight:700 }}>— Solde</span>
                  <span style={{ color:C.indigo, fontWeight:700 }}>{CHART_VISUAL_VARIANTS.length} variantes</span>
                </div>
              </div>
              <div style={{ display:"flex", gap:5, flexWrap:"wrap" }}>
                {[{id:"daily",label:"Jour"},{id:"weekly",label:"Sem."},{id:"monthly",label:"Mois"},{id:"yearly",label:"An"}].map(fi => (
                  <button key={fi.id} onClick={()=>setChartFilter(fi.id)} style={{ padding:"3px 10px", borderRadius:6, border:`1px solid ${chartFilter===fi.id?C.indigo:C.border}`, background:chartFilter===fi.id?C.indigo:C.card, color:chartFilter===fi.id?"#fff":C.muted, fontSize:10, fontWeight:700, cursor:"pointer", transition:"all 0.15s" }}>{fi.label}</button>
                ))}
                <select value={chartVisualVariantId} onChange={e=>setChartVisualVariantId(e.target.value)} style={{ padding:"3px 8px", borderRadius:6, border:`1px solid ${C.border}`, background:C.card, color:C.text, fontSize:10, fontWeight:700, cursor:"pointer", fontFamily:"inherit" }}>
                  {CHART_VISUAL_VARIANTS.map(variant => (
                    <option key={variant.id} value={variant.id}>{variant.label}</option>
                  ))}
                </select>
                <button onClick={()=>setChartUse3D(v=>!v)} style={{ padding:"3px 10px", borderRadius:6, border:`1px solid ${chartUse3D?C.teal:C.border}`, background:chartUse3D?`${C.teal}20`:C.card, color:chartUse3D?C.teal:C.muted, fontSize:10, fontWeight:700, cursor:"pointer" }}>
                  {chartUse3D ? "3D ON" : "3D OFF"}
                </button>
                <button onClick={()=>setShowSeriesPanel(p=>!p)} style={{ padding:"3px 10px", borderRadius:6, border:`1px solid ${showSeriesPanel?C.indigo:C.border}`, background:showSeriesPanel?C.indigo:C.card, color:showSeriesPanel?"#fff":C.muted, fontSize:10, fontWeight:700, cursor:"pointer" }}>⚙ Séries</button>
              </div>
            </div>
            {showSeriesPanel && (
              <div style={{ marginBottom:8, padding:"10px 12px", background:C.faint, borderRadius:8, border:`1px solid ${C.border}`, flexShrink:0 }}>
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", gap:8, marginBottom:8 }}>
                  <div style={{ fontSize:11, fontWeight:800, color:C.text }}>Séries du graphique</div>
                  <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                    <div style={{ fontSize:10, color:C.muted }}>Style actif : {activeChartVariant.label}</div>
                    <button onClick={()=>setChartSeriesConfig(DEFAULT_CHART_SERIES_CONFIG)} style={{ fontSize:10, fontWeight:700, color:C.indigo, background:`${C.indigo}12`, border:`1px solid ${C.indigo}30`, borderRadius:6, padding:"2px 8px", cursor:"pointer" }}>Réinitialiser</button>
                  </div>
                </div>
                <div style={{ display:"flex", flexDirection:"column", gap:6 }}>
                  {chartSeriesConfig.map((s,si) => (
                    <div key={s.key} style={{ display:"flex", alignItems:"center", gap:8 }}>
                      <input type="checkbox" checked={s.visible} onChange={e=>{const n=[...chartSeriesConfig];n[si]={...n[si],visible:e.target.checked};setChartSeriesConfig(n);}} />
                      <div style={{ position:"relative", width:20, height:20, borderRadius:5, background:s.color, border:`2px solid ${s.color}`, overflow:"hidden", flexShrink:0 }}>
                        <input type="color" value={s.color} onChange={e=>{const n=[...chartSeriesConfig];n[si]={...n[si],color:e.target.value};setChartSeriesConfig(n);}} style={{ position:"absolute", inset:"-4px", width:"calc(100% + 8px)", height:"calc(100% + 8px)", border:"none", padding:0, cursor:"pointer" }} />
                      </div>
                      <span style={{ fontSize:11, fontWeight:600, color:C.text, flex:1 }}>{s.label}</span>
                      <select value={s.type} onChange={e=>{const n=[...chartSeriesConfig];n[si]={...n[si],type:e.target.value};setChartSeriesConfig(n);}} style={{ fontSize:10, padding:"2px 5px", borderRadius:5, border:`1px solid ${C.border}`, background:C.card, color:C.text, fontFamily:"inherit" }}>
                        <option value="bar">Barres</option><option value="line">Ligne</option><option value="area">Zone</option>
                      </select>
                    </div>
                  ))}
                </div>
              </div>
            )}
            <div style={{ flex:1, minHeight:0 }}>
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart
                  data={trendData}
                  barSize={chartFilter==="daily" ? activeChartVariant.barSizeDay : activeChartVariant.barSize}
                  barGap={activeChartVariant.barGap}
                  barCategoryGap={activeChartVariant.barCategoryGap}
                >
                  <defs>
                    <filter id="chartBarShadow" x="-20%" y="-20%" width="160%" height="160%">
                      <feDropShadow dx="0" dy="2" stdDeviation="2" floodColor="#0F172A" floodOpacity="0.26" />
                    </filter>
                    {chartSeriesConfig.map(s => s.type==="area" && s.visible && (
                      <linearGradient key={`ag-${s.key}`} id={`ag-${s.key}`} x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={s.color} stopOpacity={activeChartVariant.areaOpacity} />
                        <stop offset="95%" stopColor={s.color} stopOpacity={0} />
                      </linearGradient>
                    ))}
                    {chartSeriesConfig.map(s => s.type==="bar" && s.visible && activeChartVariant.barGradient && (
                      <linearGradient key={`bg-${s.key}`} id={`bg-${s.key}`} x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor={s.color} stopOpacity="1" />
                        <stop offset="100%" stopColor={s.color} stopOpacity="0.62" />
                      </linearGradient>
                    ))}
                  </defs>
                  <CartesianGrid strokeDasharray={activeChartVariant.gridDash} stroke={C.border} vertical={false} />
                  <XAxis dataKey="m" tick={{ fontSize:10, fill:C.muted }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize:9, fill:C.muted }} axisLine={false} tickLine={false} tickFormatter={v=>fmt(v,currency,rates)} width={90} />
                  <Tooltip content={({active,payload,label})=>{
                    if (!active||!payload?.length) return null;
                    const d=payload[0]?.payload||{};
                    const visSeries = chartSeriesConfig.filter(s=>s.visible);
                    const eSeries   = chartSeriesConfig.find(s=>s.key==="e" && s.visible);
                    const otherSeries = visSeries.filter(s=>s.key!=="e");
                    return (
                      <div style={{ background:"#1E293B", border:"1px solid #334155", borderRadius:10, padding:"10px 14px", minWidth:180 }}>
                        <div style={{ fontSize:11, color:"#94A3B8", marginBottom:8, fontWeight:700, textTransform:"uppercase", letterSpacing:"0.05em" }}>{label}</div>
                        {otherSeries.map(s => {
                          const val = d[s.key];
                          if (val === undefined || val === null || val === 0) return null;
                          const isExpense = s.key==="dPaid" || s.key==="dUnpaid" || s.key==="d";
                          const sign = isExpense ? "-" : "+";
                          const indicator = s.type==="bar"
                            ? <span style={{ width:8, height:8, borderRadius:"50%", background:s.color, flexShrink:0 }} />
                            : s.type==="line"
                            ? <span style={{ width:10, height:2, borderRadius:2, background:s.color, flexShrink:0 }} />
                            : <span style={{ width:8, height:8, borderRadius:2, background:s.color, opacity:0.7, flexShrink:0 }} />;
                          return (
                            <div key={s.key} style={{ display:"flex", alignItems:"center", gap:7, fontSize:11.5, fontWeight:700, color:"#F1F5F9", marginBottom:4 }}>
                              {indicator}
                              <span style={{ color:"#94A3B8", fontWeight:500, flex:1 }}>{s.label}</span>
                              <span style={{ color:s.color }}>{sign}{fmt(Math.abs(val),currency,rates)}</span>
                            </div>
                          );
                        })}
                        {eSeries && d.e!==undefined && (
                          <div style={{ display:"flex", alignItems:"center", gap:7, fontSize:11.5, fontWeight:700, borderTop:"1px solid #334155", paddingTop:6, marginTop:4 }}>
                            <span style={{ width:10, height:2, borderRadius:2, background:eSeries.color, flexShrink:0 }} />
                            <span style={{ color:"#94A3B8", fontWeight:500, flex:1 }}>Solde</span>
                            <span style={{ color:eSeries.color }}>{d.e<0?"-":""}{fmt(Math.abs(d.e),currency,rates)}</span>
                          </div>
                        )}
                      </div>
                    );
                  }} />
                  {chartSeriesConfig.map(s=>{
                    if(!s.visible) return null;
                    if(s.type==="bar") {
                      const barFill = (activeChartVariant.barGradient && !chartUse3D) ? `url(#bg-${s.key})` : s.color;
                      return (
                        <Bar
                          key={s.key}
                          dataKey={s.key}
                          name={s.label}
                          fill={barFill}
                          radius={activeChartVariant.barRadius}
                          fillOpacity={activeChartVariant.barOpacity}
                          filter={!chartUse3D ? "url(#chartBarShadow)" : undefined}
                          shape={chartUse3D ? (shapeProps => (
                            <ThreeDBarShape
                              {...shapeProps}
                              fill={s.color}
                              opacity={activeChartVariant.barOpacity}
                              shadow={true}
                            />
                          )) : undefined}
                        />
                      );
                    }
                    if(s.type==="line") {
                      const dotSize = activeChartVariant.lineDot;
                      return (
                        <Line
                          key={s.key}
                          type={activeChartVariant.lineType}
                          dataKey={s.key}
                          name={s.label}
                          stroke={s.color}
                          strokeWidth={activeChartVariant.lineWidth}
                          dot={dotSize > 0 ? { r: dotSize, fill: s.color } : false}
                          activeDot={dotSize > 0 ? { r: dotSize + 2 } : false}
                        />
                      );
                    }
                    if(s.type==="area") return <Area key={s.key} type={activeChartVariant.lineType} dataKey={s.key} name={s.label} stroke={s.color} fill={`url(#ag-${s.key})`} strokeWidth={Math.max(1.6, activeChartVariant.lineWidth - 0.2)} />;
                    return null;
                  })}
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </div>
        );

        // ═══════════════════════════════════════════════════════════
        // SANTÉ FINANCIÈRE
        // ═══════════════════════════════════════════════════════════
        case "health": {
          const scoreColor = monthlyHealthScore>=70?C.green:monthlyHealthScore>=40?C.amber:C.red;
          const scoreLabel = monthlyHealthScore>=70?"Bonne santé":monthlyHealthScore>=40?"À surveiller":"Attention";
          return (
            <div style={{ height:"100%", display:"flex", flexDirection:"column" }}>
              {/* Score */}
              <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:12, flexShrink:0 }}>
                <div style={{ width:52, height:52, borderRadius:"50%", background:`conic-gradient(${scoreColor} ${monthlyHealthScore*3.6}deg, ${C.faint} 0deg)`, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
                  <div style={{ width:38, height:38, borderRadius:"50%", background:C.card, display:"flex", alignItems:"center", justifyContent:"center" }}>
                    <span style={{ fontSize:13, fontWeight:900, color:scoreColor }}>{monthlyHealthScore}</span>
                  </div>
                </div>
                <div>
                  <div style={{ fontSize:12.5, fontWeight:800, color:C.text }}>Santé financière</div>
                  <Tag label={scoreLabel} color={scoreColor} />
                </div>
                <div style={{ fontSize:10, color:C.muted, marginLeft:"auto" }}>{month}</div>
              </div>

              {/* Métriques */}
              <div style={{ display:"flex", flexDirection:"column", gap:7, flex:1, overflowY:"auto" }}>
                {/* Revenus */}
                <div style={{ background:C.faint, borderRadius:8, padding:"8px 11px", border:`1px solid ${C.border}` }}>
                  <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom: totalIncomePlanned>0?4:0 }}>
                    <span style={{ fontSize:10.5, fontWeight:700, color:C.muted }}>Revenus confirmés</span>
                    <span style={{ fontSize:12, fontWeight:800, color:C.green }}>{f(totalIncomeRealized)}</span>
                  </div>
                  {totalIncomePlanned>0&&<div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                    <span style={{ fontSize:9.5, color:C.muted }}>⏳ En attente</span>
                    <span style={{ fontSize:10, fontWeight:700, color:C.amber }}>+{f(totalIncomePlanned)}</span>
                  </div>}
                </div>

                {/* Dépenses */}
                <div style={{ background:C.faint, borderRadius:8, padding:"8px 11px", border:`1px solid ${C.border}` }}>
                  <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom: totalExpensePlanned>0?4:0 }}>
                    <span style={{ fontSize:10.5, fontWeight:700, color:C.muted }}>Dépenses confirmées</span>
                    <span style={{ fontSize:12, fontWeight:800, color:C.red }}>{f(totalExpenseRealized)}</span>
                  </div>
                  {totalExpensePlanned>0&&<div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                    <span style={{ fontSize:9.5, color:C.muted }}>⏳ À payer</span>
                    <span style={{ fontSize:10, fontWeight:700, color:C.amber }}>+{f(totalExpensePlanned)}</span>
                  </div>}
                </div>

                {/* Solde réel */}
                <div style={{ background:realizedSavings>=0?`${C.green}10`:`${C.red}08`, borderRadius:8, padding:"8px 11px", border:`1px solid ${realizedSavings>=0?C.green+"35":C.red+"35"}` }}>
                  <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                    <span style={{ fontSize:10.5, fontWeight:700, color:C.muted }}>Solde réel confirmé</span>
                    <span style={{ fontSize:13, fontWeight:900, color:realizedSavings>=0?C.green:C.red }}>{realizedSavings>=0?"+":""}{f(realizedSavings)}</span>
                  </div>
                </div>

                {/* Grille double */}
                <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:6 }}>
                  <div style={{ background:C.faint, borderRadius:8, padding:"8px 10px", textAlign:"center", border:`1px solid ${C.border}` }}>
                    <div style={{ fontSize:17, fontWeight:900, color:C.indigo }}>{goalCompletionRate}%</div>
                    <div style={{ fontSize:9.5, color:C.muted, marginTop:2 }}>Objectifs atteints</div>
                  </div>
                  <div style={{ background:C.faint, borderRadius:8, padding:"8px 10px", textAlign:"center", border:`1px solid ${C.border}` }}>
                    <div style={{ fontSize:17, fontWeight:900, color:confirmedRec>0?C.green:C.muted }}>{confirmedRec}/{recurringThisMonth.length}</div>
                    <div style={{ fontSize:9.5, color:C.muted, marginTop:2 }}>Récurrents confirmés</div>
                  </div>
                </div>
              </div>
            </div>
          );
        }

        // ═══════════════════════════════════════════════════════════
        // PROCHAINES ÉCHÉANCES
        // ═══════════════════════════════════════════════════════════
        case "upcoming": {
          const hasAlerts = missedJobPayments?.length > 0;
          return (
            <div style={{ height:"100%", display:"flex", flexDirection:"column" }}>
              <BH title="Échéances & versements" sub="À venir · Récents" action={{ label:"Suivi taf →", fn:()=>setActive("suivi_taf") }} />
              {hasAlerts && (
                <div style={{ marginBottom:8, padding:"6px 10px", background:`${C.amber}14`, border:`1px solid ${C.amber}40`, borderRadius:7, fontSize:10.5, color:C.amber, fontWeight:700, flexShrink:0 }}>
                  ⚠ {missedJobPayments.length} versement{missedJobPayments.length>1?"s":""} hors du mois sélectionné
                </div>
              )}
              <div style={{ flex:1, overflowY:"auto", display:"flex", flexDirection:"column", gap:6 }}>
                {upcomingTimeline.length===0 && <div style={{ flex:1, display:"flex", alignItems:"center", justifyContent:"center", color:C.muted, fontSize:11 }}>Aucune échéance planifiée</div>}
                {upcomingTimeline.map(item=>{
                  const isPast = item.isPast;
                  const color = item.type==="income"?C.green:C.red;
                  return (
                    <div key={item.id} style={{ background:isPast?`${C.amber}08`:C.faint, borderRadius:9, padding:"9px 11px", border:`1px solid ${isPast?C.amber+"40":C.border}` }}>
                      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:4 }}>
                        <span style={{ fontSize:11.5, fontWeight:700, color:C.text, flex:1, minWidth:0, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap", marginRight:8 }}>{item.desc}</span>
                        <span style={{ fontSize:12, fontWeight:900, color, flexShrink:0 }}>{item.type==="income"?"+":"-"}{f(item.amount)}</span>
                      </div>
                      <div style={{ display:"flex", alignItems:"center", gap:6 }}>
                        {isPast ? <Tag label="EFFECTUÉ" color={C.amber} /> : <Tag label="À VENIR" color={C.indigo} />}
                        <span style={{ fontSize:9.5, color:C.muted }}>{item.scheduleLabel} · {item.nextRun.toLocaleDateString("fr-FR")}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        }

        // ═══════════════════════════════════════════════════════════
        // CALENDRIER
        // ═══════════════════════════════════════════════════════════
        case "calendar": return (
          <div style={{ height:"100%", display:"flex", flexDirection:"column" }}>
            <BH title="Calendrier du mois" sub={now.toLocaleString("fr-FR",{month:"long",year:"numeric"})} />
            <div style={{ display:"grid", gridTemplateColumns:"repeat(7,1fr)", gap:3, flex:1 }}>
              {["L","M","M","J","V","S","D"].map((d,i)=>(
                <div key={i} style={{ textAlign:"center", fontSize:9, fontWeight:700, color:C.muted, paddingBottom:3 }}>{d}</div>
              ))}
              {calendarDays.map(day=>{
                const hasIncome = day.entries.some(e=>e.type==="income");
                const hasExpense = day.entries.some(e=>e.type==="expense");
                return (
                  <div key={day.key} style={{ minHeight:24, borderRadius:6, padding:"3px 4px", background:day.isToday?hexToRgba(C.indigo,0.13):day.incomeTotal>day.expenseTotal&&day.incomeTotal>0?hexToRgba(C.green,0.09):day.expenseTotal>0?hexToRgba(C.red,0.07):day.isCurrentMonth?C.card:C.faint, border:`1px solid ${day.isToday?hexToRgba(C.indigo,0.45):C.border}`, boxShadow:day.isToday?`0 0 0 2px ${hexToRgba(C.indigo,0.18)}`:"none" }}>
                    <div style={{ fontSize:9, fontWeight:day.isToday?900:600, color:day.isToday?C.indigo:day.isCurrentMonth?C.text:C.muted }}>{day.dayNumber}</div>
                    {(hasIncome||hasExpense)&&<div style={{ display:"flex", gap:2, marginTop:2 }}>
                      {hasIncome&&<span style={{ width:4, height:4, borderRadius:"50%", background:C.green, display:"inline-block" }} />}
                      {hasExpense&&<span style={{ width:4, height:4, borderRadius:"50%", background:C.red, display:"inline-block" }} />}
                    </div>}
                  </div>
                );
              })}
            </div>
          </div>
        );

        // ═══════════════════════════════════════════════════════════
        // TRANSACTIONS RÉCENTES
        // ═══════════════════════════════════════════════════════════
        case "txrecent": return (
          <div style={{ height:"100%", display:"flex", flexDirection:"column" }}>
            <BH title="Transactions récentes" sub={`${allTxList.length} opérations au total`} action={{ label:"Voir tout", fn:()=>setActive("transactions") }} />
            <div style={{ overflowY:"auto", maxHeight: 5*46 }}>
              {allTxList.slice(0,20).map(tx=>{
                const confirmed = isConfirmed(tx);
                const color = tx.type==="income"?C.green:C.red;
                return (
                  <div key={tx.id} style={{ display:"flex", alignItems:"center", height:46, borderBottom:`1px solid ${C.faint}`, gap:8 }}>
                    <div style={{ width:30, height:30, borderRadius:9, background:`${color}15`, border:`1px solid ${color}30`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:10, fontWeight:900, color, flexShrink:0 }}>
                      {tx.type==="income"?"▲":"▼"}
                    </div>
                    <div style={{ flex:1, minWidth:0 }}>
                      <div style={{ fontSize:11.5, fontWeight:600, color:C.text, whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>{tx.desc}</div>
                      <div style={{ fontSize:9.5, color:C.muted, display:"flex", gap:6, alignItems:"center" }}>
                        <span>{tx.cat}</span>
                        <span>·</span>
                        <span>{tx.date}</span>
                        {tx.isRecurring && <Tag label={confirmed?"✓ OK":"⏳ EN ATTENTE"} color={confirmed?C.green:C.amber} />}
                      </div>
                    </div>
                    <div style={{ fontSize:12, fontWeight:800, color, flexShrink:0 }}>{tx.type==="income"?"+":"-"}{f(tx.amount)}</div>
                  </div>
                );
              })}
            </div>
          </div>
        );

        // ═══════════════════════════════════════════════════════════
        // OBJECTIFS
        // ═══════════════════════════════════════════════════════════
        case "goals": return (
          <div style={{ height:"100%", display:"flex", flexDirection:"column" }}>
            <BH title="Objectifs clés" sub={`${goalCompletionRate}% complétés`} action={{ label:"Gérer", fn:()=>setActive("objectifs") }} />
            <div style={{ flex:1, overflowY:"auto", display:"flex", flexDirection:"column", gap:11 }}>
              {goals.length===0&&<div style={{ flex:1, display:"flex", alignItems:"center", justifyContent:"center", color:C.muted, fontSize:11 }}>Aucun objectif défini</div>}
              {goals.slice(0,8).map(g=>{
                const pct = Math.min(Math.round((g.saved/g.target)*100), 100);
                const done = pct >= 100;
                return (
                  <div key={g.id}>
                    <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:5 }}>
                      <div style={{ display:"flex", alignItems:"center", gap:6 }}>
                        <div style={{ width:8, height:8, borderRadius:"50%", background:g.color, flexShrink:0 }} />
                        <span style={{ fontSize:11.5, fontWeight:700, color:C.text }}>{g.name}</span>
                        {done&&<Tag label="✓ ATTEINT" color={C.green} />}
                      </div>
                      <span style={{ fontSize:11, fontWeight:900, color:g.color }}>{pct}%</span>
                    </div>
                    <div style={{ height:6, background:C.faint, borderRadius:999, overflow:"hidden", marginBottom:3 }}>
                      <div style={{ width:`${pct}%`, height:"100%", background:g.color, borderRadius:999, transition:"width 0.4s ease" }} />
                    </div>
                    <div style={{ fontSize:9.5, color:C.muted }}>{f(g.saved)} / {f(g.target)}</div>
                  </div>
                );
              })}
            </div>
          </div>
        );

        // ═══════════════════════════════════════════════════════════
        // REVENUS vs DÉPENSES (barres)
        // ═══════════════════════════════════════════════════════════
        case "statbars": return (
          <div style={{ height:"100%", display:"flex", flexDirection:"column" }}>
            <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", flexShrink:0, marginBottom:4 }}>
              <BH title="Revenus vs Dépenses" sub={`Année ${selYear}`} />
              <button onClick={()=>setShowStatbarsPanel(p=>!p)} style={{ padding:"3px 9px", borderRadius:6, border:`1px solid ${showStatbarsPanel?C.indigo:C.border}`, background:showStatbarsPanel?C.indigo:C.card, color:showStatbarsPanel?"#fff":C.muted, fontSize:10, fontWeight:700, cursor:"pointer", flexShrink:0, marginRight:4 }}>⚙ Séries</button>
            </div>
            {showStatbarsPanel && (
              <div style={{ marginBottom:6, padding:"8px 10px", background:C.faint, borderRadius:8, border:`1px solid ${C.border}`, flexShrink:0 }}>
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:6 }}>
                  <span style={{ fontSize:11, fontWeight:800, color:C.text }}>Séries</span>
                  <button onClick={()=>setStatbarsConfig(DEFAULT_STATBARS_CONFIG)} style={{ fontSize:10, fontWeight:700, color:C.indigo, background:`${C.indigo}12`, border:`1px solid ${C.indigo}30`, borderRadius:6, padding:"2px 8px", cursor:"pointer" }}>Réinitialiser</button>
                </div>
                {statbarsConfig.map((s,si)=>(
                  <div key={s.key} style={{ display:"flex", alignItems:"center", gap:8, marginBottom:4 }}>
                    <input type="checkbox" checked={s.visible} onChange={e=>{const n=[...statbarsConfig];n[si]={...n[si],visible:e.target.checked};setStatbarsConfig(n);}} />
                    <div style={{ position:"relative", width:18, height:18, borderRadius:4, background:s.color, overflow:"hidden", flexShrink:0 }}>
                      <input type="color" value={s.color} onChange={e=>{const n=[...statbarsConfig];n[si]={...n[si],color:e.target.value};setStatbarsConfig(n);}} style={{ position:"absolute", inset:"-4px", width:"calc(100% + 8px)", height:"calc(100% + 8px)", border:"none", padding:0, cursor:"pointer" }} />
                    </div>
                    <span style={{ fontSize:11, fontWeight:600, color:C.text, flex:1 }}>{s.label}</span>
                    <select value={s.type} onChange={e=>{const n=[...statbarsConfig];n[si]={...n[si],type:e.target.value};setStatbarsConfig(n);}} style={{ fontSize:10, padding:"2px 5px", borderRadius:5, border:`1px solid ${C.border}`, background:C.card, color:C.text, fontFamily:"inherit" }}>
                      <option value="bar">Barres</option><option value="line">Ligne</option><option value="area">Zone</option>
                    </select>
                  </div>
                ))}
              </div>
            )}
            <div style={{ flex:1, minHeight:0 }}>
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={monthlyTrendYear} barCategoryGap="30%" barGap={3}>
                  <defs>
                    {statbarsConfig.map(s => s.type==="area" && s.visible && (
                      <linearGradient key={`sbag-${s.key}`} id={`sbag-${s.key}`} x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={s.color} stopOpacity={0.25}/><stop offset="95%" stopColor={s.color} stopOpacity={0}/>
                      </linearGradient>
                    ))}
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke={C.border} vertical={false} />
                  <XAxis dataKey="m" tick={{ fontSize:10, fill:C.muted }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize:9, fill:C.muted }} axisLine={false} tickLine={false} tickFormatter={v=>fmt(v,currency,rates)} width={85} />
                  <Tooltip content={({active,payload,label})=>{
                    if(!active||!payload?.length) return null;
                    const d=payload[0]?.payload||{};
                    return (
                      <div style={{ background:"#1E293B", border:"1px solid #334155", borderRadius:9, padding:"9px 13px", minWidth:160 }}>
                        <div style={{ fontSize:10.5, color:"#94A3B8", marginBottom:6, fontWeight:700, textTransform:"uppercase" }}>{label}</div>
                        {statbarsConfig.filter(s=>s.visible).map(s=>{
                          const val=d[s.key]; if(!val) return null;
                          const isExp=s.key==="d"; const sign=isExp?"-":"+";
                          const ind = s.type==="bar" ? <span style={{width:8,height:8,borderRadius:"50%",background:s.color,display:"inline-block",marginRight:5}}/> : <span style={{width:10,height:2,borderRadius:2,background:s.color,display:"inline-block",marginRight:5}}/>;
                          return <div key={s.key} style={{ display:"flex", alignItems:"center", fontSize:12, fontWeight:700, color:"#F1F5F9", marginBottom:3 }}>{ind}<span style={{flex:1,color:"#94A3B8",fontWeight:500}}>{s.label}</span><span style={{color:s.color}}>{sign}{fmt(Math.abs(val),currency,rates)}</span></div>;
                        })}
                        <div style={{ fontSize:11, color:C.blue, fontWeight:700, marginTop:4, borderTop:"1px solid #334155", paddingTop:4 }}>Solde : {fmt((d.r||0)-(d.d||0),currency,rates)}</div>
                      </div>
                    );
                  }} />
                  {statbarsConfig.map(s=>{
                    if(!s.visible) return null;
                    if(s.type==="bar") return <Bar key={s.key} dataKey={s.key} name={s.label} fill={s.color} radius={[4,4,0,0]} fillOpacity={0.8} />;
                    if(s.type==="line") return <Line key={s.key} type="monotone" dataKey={s.key} name={s.label} stroke={s.color} strokeWidth={2.5} dot={{r:3,fill:s.color}} activeDot={{r:5}} />;
                    if(s.type==="area") return <Area key={s.key} type="monotone" dataKey={s.key} name={s.label} stroke={s.color} fill={`url(#sbag-${s.key})`} strokeWidth={2} />;
                    return null;
                  })}
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </div>
        );

        // ═══════════════════════════════════════════════════════════
        // SOLDE NET MENSUEL
        // ═══════════════════════════════════════════════════════════
        case "statsav": return (
          <div style={{ height:"100%", display:"flex", flexDirection:"column" }}>
            <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", flexShrink:0, marginBottom:4 }}>
              <BH title="Solde net mensuel" sub={`Année ${selYear} · Réalisé vs planifié`} />
              <button onClick={()=>setShowStatsavPanel(p=>!p)} style={{ padding:"3px 9px", borderRadius:6, border:`1px solid ${showStatsavPanel?C.indigo:C.border}`, background:showStatsavPanel?C.indigo:C.card, color:showStatsavPanel?"#fff":C.muted, fontSize:10, fontWeight:700, cursor:"pointer", flexShrink:0, marginRight:4 }}>⚙ Séries</button>
            </div>
            {showStatsavPanel && (
              <div style={{ marginBottom:6, padding:"8px 10px", background:C.faint, borderRadius:8, border:`1px solid ${C.border}`, flexShrink:0 }}>
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:6 }}>
                  <span style={{ fontSize:11, fontWeight:800, color:C.text }}>Séries</span>
                  <button onClick={()=>setStatsavConfig(DEFAULT_STATSAV_CONFIG)} style={{ fontSize:10, fontWeight:700, color:C.indigo, background:`${C.indigo}12`, border:`1px solid ${C.indigo}30`, borderRadius:6, padding:"2px 8px", cursor:"pointer" }}>Réinitialiser</button>
                </div>
                {statsavConfig.map((s,si)=>(
                  <div key={s.key} style={{ display:"flex", alignItems:"center", gap:8, marginBottom:4 }}>
                    <input type="checkbox" checked={s.visible} onChange={e=>{const n=[...statsavConfig];n[si]={...n[si],visible:e.target.checked};setStatsavConfig(n);}} />
                    <div style={{ position:"relative", width:18, height:18, borderRadius:4, background:s.color, overflow:"hidden", flexShrink:0 }}>
                      <input type="color" value={s.color} onChange={e=>{const n=[...statsavConfig];n[si]={...n[si],color:e.target.value};setStatsavConfig(n);}} style={{ position:"absolute", inset:"-4px", width:"calc(100% + 8px)", height:"calc(100% + 8px)", border:"none", padding:0, cursor:"pointer" }} />
                    </div>
                    <span style={{ fontSize:11, fontWeight:600, color:C.text, flex:1 }}>{s.label}</span>
                    {s.key==="net" && (
                      <>
                        <span style={{ fontSize:10, color:C.muted }}>Négatif :</span>
                        <div style={{ position:"relative", width:18, height:18, borderRadius:4, background:s.negColor||"#EF4444", overflow:"hidden", flexShrink:0 }}>
                          <input type="color" value={s.negColor||"#EF4444"} onChange={e=>{const n=[...statsavConfig];n[si]={...n[si],negColor:e.target.value};setStatsavConfig(n);}} style={{ position:"absolute", inset:"-4px", width:"calc(100% + 8px)", height:"calc(100% + 8px)", border:"none", padding:0, cursor:"pointer" }} />
                        </div>
                      </>
                    )}
                    {s.key!=="net" && (
                      <select value={s.type} onChange={e=>{const n=[...statsavConfig];n[si]={...n[si],type:e.target.value};setStatsavConfig(n);}} style={{ fontSize:10, padding:"2px 5px", borderRadius:5, border:`1px solid ${C.border}`, background:C.card, color:C.text, fontFamily:"inherit" }}>
                        <option value="line">Ligne</option><option value="bar">Barres</option><option value="area">Zone</option>
                      </select>
                    )}
                  </div>
                ))}
              </div>
            )}
            <div style={{ flex:1, minHeight:0 }}>
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={monthlyTrendYear} barCategoryGap="30%">
                  <defs>
                    {(()=>{
                      const netS = statsavConfig.find(s=>s.key==="net");
                      const lineS = statsavConfig.find(s=>s.key==="line");
                      if (!lineS?.visible) return null;
                      const vals = (monthlyTrendYear||[]).map(d=>d.net||0);
                      const minV = Math.min(...vals, 0);
                      const maxV = Math.max(...vals, 0);
                      const range = maxV - minV || 1;
                      const zeroPct = ((maxV) / range * 100).toFixed(2);
                      const posColor = netS?.color  || C.green;
                      const negColor = netS?.negColor || C.red;
                      return (
                        <>
                          <linearGradient id="ssag-stroke" x1="0" y1="0" x2="0" y2="1">
                            <stop offset={`${zeroPct}%`} stopColor={posColor} stopOpacity={1}/>
                            <stop offset={`${zeroPct}%`} stopColor={negColor} stopOpacity={1}/>
                          </linearGradient>
                          <linearGradient id="ssag-fill" x1="0" y1="0" x2="0" y2="1">
                            <stop offset={`${zeroPct}%`} stopColor={posColor} stopOpacity={0.22}/>
                            <stop offset={`${zeroPct}%`} stopColor={negColor} stopOpacity={0.22}/>
                            <stop offset="100%" stopColor={negColor} stopOpacity={0}/>
                          </linearGradient>
                        </>
                      );
                    })()}
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke={C.border} vertical={false} />
                  <XAxis dataKey="m" tick={{ fontSize:10, fill:C.muted }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize:9, fill:C.muted }} axisLine={false} tickLine={false} tickFormatter={v=>fmt(v,currency,rates)} width={85} />
                  <ReferenceLine y={0} stroke={C.border} strokeDasharray="4 4" />
                  <Tooltip content={({active,payload,label})=>{
                    if(!active||!payload?.length) return null;
                    const d=payload[0]?.payload||{};
                    const net=d.net||0;
                    const netSeries=statsavConfig.find(s=>s.key==="net");
                    const lineSeries=statsavConfig.find(s=>s.key==="line");
                    return (
                      <div style={{ background:"#1E293B", border:"1px solid #334155", borderRadius:9, padding:"9px 13px", minWidth:160 }}>
                        <div style={{ fontSize:10.5, color:"#94A3B8", marginBottom:6, fontWeight:700, textTransform:"uppercase" }}>{label}</div>
                        {netSeries?.visible && <div style={{ display:"flex", alignItems:"center", gap:6, fontSize:13, fontWeight:800, color:net>=0?(netSeries.color||C.green):(netSeries.negColor||C.red), marginBottom:3 }}><span style={{width:8,height:8,borderRadius:"50%",background:net>=0?(netSeries.color||C.green):(netSeries.negColor||C.red)}} /><span style={{flex:1,color:"#94A3B8",fontWeight:500,fontSize:11}}>Solde net</span><span>{net>=0?"+":"-"}{fmt(Math.abs(net),currency,rates)}</span></div>}
                        {lineSeries?.visible && <div style={{ display:"flex", alignItems:"center", gap:6, fontSize:11, fontWeight:700, color:"#94A3B8", marginBottom:3 }}><span style={{width:10,height:2,borderRadius:2,background:lineSeries.color,display:"inline-block"}} /><span style={{flex:1,fontWeight:500}}>Courbe</span><span style={{color:lineSeries.color}}>{net>=0?"+":"-"}{fmt(Math.abs(net),currency,rates)}</span></div>}
                        <div style={{ fontSize:10, color:"#94A3B8", marginTop:3, borderTop:"1px solid #334155", paddingTop:3 }}>Rev. réels : {fmt(d.rPast||0,currency,rates)} · Dép : {fmt(d.dPaid||0,currency,rates)}</div>
                      </div>
                    );
                  }} />
                  {(()=>{
                    const netS=statsavConfig.find(s=>s.key==="net");
                    const lineS=statsavConfig.find(s=>s.key==="line");
                    return (
                      <>
                        {netS?.visible && (
                          <Bar dataKey="net" name="Solde net" radius={[4,4,0,0]}>
                            {(monthlyTrendYear||[]).map((entry,i)=><Cell key={i} fill={entry.net>=0?(netS.color||C.green):(netS.negColor||C.red)} fillOpacity={0.75}/>)}
                          </Bar>
                        )}
                        {lineS?.visible && lineS.type==="line" && <Line type="monotone" dataKey="net" name="Courbe" stroke="url(#ssag-stroke)" strokeWidth={2.5} dot={(props)=>{ const {cx,cy,payload}=props; const netS2=statsavConfig.find(s=>s.key==="net"); const col=(payload.net>=0)?(netS2?.color||C.green):(netS2?.negColor||C.red); return <circle key={cx} cx={cx} cy={cy} r={3} fill={col} stroke="none"/>; }} activeDot={{r:5}} />}
                        {lineS?.visible && lineS.type==="area" && <Area type="monotone" dataKey="net" name="Courbe" stroke="url(#ssag-stroke)" fill="url(#ssag-fill)" strokeWidth={2.5} dot={(props)=>{ const {cx,cy,payload}=props; const netS2=statsavConfig.find(s=>s.key==="net"); const col=(payload.net>=0)?(netS2?.color||C.green):(netS2?.negColor||C.red); return <circle key={cx} cx={cx} cy={cy} r={3} fill={col} stroke="none"/>; }} />}
                      </>
                    );
                  })()}
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </div>
        );

        // ═══════════════════════════════════════════════════════════
        // STATISTIQUES RAPIDES
        // ═══════════════════════════════════════════════════════════
        case "quickstats": return (
          <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:10, height:"100%", alignContent:"center" }}>
            {[
              { label:"Mois le + rentable",  val:bestMonth?bestMonth.m:"—",   sub:bestMonth?`${f(bestMonth.e)} d'épargne`:"Pas de données", color:C.amber  },
              { label:"Plus grosse dépense", val:f(largestExpense),            sub:topExpenseCategory||"Aucune catégorie",                  color:C.red    },
              { label:"Meilleur taux (6m)",  val:`${maxSavingsRate.toFixed(1)}%`, sub:"Taux d'épargne maximum",                            color:C.green  },
              { label:"Objectifs actifs",    val:`${goals.filter(g=>g.saved<g.target).length}/${goals.length}`, sub:`${goalCompletionRate}% complétés`, color:C.indigo },
            ].map((s,i)=>(
              <div key={i} style={{ background:C.card, borderRadius:12, padding:"14px 16px", border:`1px solid ${C.border}`, borderTop:`3px solid ${s.color}`, display:"flex", flexDirection:"column", gap:6, boxShadow:"0 1px 6px rgba(0,0,0,0.04)" }}>
                <div style={{ fontSize:9.5, color:C.muted, fontWeight:800, textTransform:"uppercase", letterSpacing:"0.07em" }}>{s.label}</div>
                <div style={{ fontSize:20, fontWeight:900, color:s.color, letterSpacing:0 }}>{s.val}</div>
                <div style={{ fontSize:10.5, color:C.muted, marginTop:"auto" }}>{s.sub}</div>
              </div>
            ))}
          </div>
        );

        // ═══════════════════════════════════════════════════════════
        // BLOCS OPTIONNELS
        // ═══════════════════════════════════════════════════════════
        case "savingsrate": return (
          <div style={{ height:"100%", display:"flex", alignItems:"center", gap:16 }}>
            <div style={{ width:64, height:64, borderRadius:"50%", background:`conic-gradient(${C.indigo} ${realSavingsRate*3.6}deg,${C.faint} 0deg)`, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
              <div style={{ width:48, height:48, borderRadius:"50%", background:C.card, display:"flex", alignItems:"center", justifyContent:"center", flexDirection:"column" }}>
                <span style={{ fontSize:12, fontWeight:900, color:C.indigo, lineHeight:1 }}>{realSavingsRate.toFixed(0)}%</span>
              </div>
            </div>
            <div style={{ flex:1 }}>
              <div style={{ fontSize:10, fontWeight:800, color:C.muted, textTransform:"uppercase", marginBottom:4 }}>Taux d'épargne réel</div>
              <div style={{ fontSize:22, fontWeight:900, color:C.indigo }}>{realSavingsRate.toFixed(1)}%</div>
              {Math.abs(parseFloat(projectedRate)-realSavingsRate)>0.5&&<div style={{ fontSize:10, color:C.muted, marginTop:3 }}>Projeté : <strong style={{ color:C.indigo }}>{projectedRate}%</strong></div>}
            </div>
          </div>
        );

        case "piecat": return (
          <div style={{ height:"100%", display:"flex", flexDirection:"column" }}>
            <BH title="Répartition dépenses" sub={month} />
            <div style={{ flex:1, minHeight:0 }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart><Pie data={expenseCategories} dataKey="val" nameKey="name" cx="50%" cy="50%" innerRadius="40%" outerRadius="68%" paddingAngle={3}>{expenseCategories.map((e,i)=><Cell key={i} fill={e.color}/>)}</Pie><Tooltip formatter={v=>f(v)}/></PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        );

        case "autobalance": return (
          <div style={{ height:"100%", display:"flex", alignItems:"center", gap:14 }}>
            <div style={{ width:48, height:48, borderRadius:14, background:totalAutoBalance>=0?`${C.green}15`:`${C.red}10`, border:`1px solid ${totalAutoBalance>=0?C.green+"30":C.red+"30"}`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:22, flexShrink:0 }}>
              {totalAutoBalance>=0?"↑":"↓"}
            </div>
            <div style={{ flex:1 }}>
              <div style={{ fontSize:10, fontWeight:800, color:C.muted, textTransform:"uppercase", marginBottom:4 }}>Balance automatique</div>
              <div style={{ fontSize:20, fontWeight:900, color:totalAutoBalance>=0?C.green:C.red }}>{totalAutoBalance>=0?"+":""}{f(totalAutoBalance)}</div>
              <div style={{ fontSize:10, color:C.muted, marginTop:3 }}>{recurringItems.filter(i=>i.active).length} opérations récurrentes actives</div>
            </div>
          </div>
        );

        default: return (
          <div style={{ display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", height:"100%", gap:6 }}>
            <span style={{ fontSize:24, opacity:0.3 }}>□</span>
            <span style={{ color:C.muted, fontSize:11 }}>Bloc inconnu</span>
          </div>
        );
      }
    };


    // ── Rendu principal ─────────────────────────────────────────────
    return (
      <div
        ref={(node) => {
          if (!node) return;
          if (node.scrollTop !== dashboardScrollTopRef.current) {
            node.scrollTop = dashboardScrollTopRef.current;
          }
        }}
        onScroll={(e) => {
          dashboardScrollTopRef.current = e.currentTarget.scrollTop;
        }}
        style={{ flex:1, overflowY:"auto", height:"100vh" }}
      >
        <PageHeader
          title="Tableau de bord"
          sub={`Bonjour · ${currentDateLabel}`}
          actions={
            <div style={{ display:"flex", alignItems:"center", gap:10 }}>
              <div style={{ display:"flex", alignItems:"center", gap:6, padding:"6px 10px", borderRadius:10, background:C.faint, border:`1px solid ${C.border}`, height:34 }}>
                <RefreshCw size={12} style={{ color:C.muted, flexShrink:0 }} />
                <span style={{ fontSize:13, color:C.text, fontWeight:700, fontVariantNumeric:"tabular-nums", whiteSpace:"nowrap" }}><LiveClock /></span>
              </div>
              <select value={month} onChange={e=>setMonth(e.target.value)} style={{ padding:"7px 10px", border:`1px solid ${C.border}`, borderRadius:8, fontSize:12, color:C.text, background:C.card, cursor:"pointer", outline:"none", fontFamily:"inherit" }}>
                {MONTHS.map(m=><option key={m}>{m}</option>)}
              </select>
              {dashEditMode && (
                <>
                  <button onClick={undoLayout} disabled={!canUndoLayout} style={{ padding:"7px 12px", background:canUndoLayout?C.card:C.faint, color:canUndoLayout?C.text:C.muted, border:`1px solid ${C.border}`, borderRadius:8, fontSize:12, fontWeight:700, cursor:canUndoLayout?"pointer":"not-allowed", opacity:canUndoLayout?1:0.6 }}>
                    Precedent
                  </button>
                  <button onClick={redoLayout} disabled={!canRedoLayout} style={{ padding:"7px 12px", background:canRedoLayout?C.card:C.faint, color:canRedoLayout?C.text:C.muted, border:`1px solid ${C.border}`, borderRadius:8, fontSize:12, fontWeight:700, cursor:canRedoLayout?"pointer":"not-allowed", opacity:canRedoLayout?1:0.6 }}>
                    Suivant
                  </button>
                  <button onClick={()=>setDashAddPanel(p=>!p)} style={{ display:"flex", alignItems:"center", gap:6, padding:"7px 14px", background:C.green, color:"#fff", border:"none", borderRadius:8, fontSize:12, fontWeight:700, cursor:"pointer" }}><Plus size={13}/> Ajouter</button>
                  <button onClick={resetLayout} style={{ padding:"7px 14px", background:`${C.amber}20`, color:C.amber, border:`1px solid ${C.amber}40`, borderRadius:8, fontSize:12, fontWeight:700, cursor:"pointer" }}>Réinitialiser</button>
                </>
              )}
              <button onClick={()=>{ if (dashEditMode) setDashEditMode(false); else setDashEditMode(true); setDashAddPanel(false); }} style={{ display:"flex", alignItems:"center", gap:6, padding:"7px 14px", background:dashEditMode?C.indigo:C.card, color:dashEditMode?"#fff":C.text, border:`1px solid ${dashEditMode?C.indigo:C.border}`, borderRadius:8, fontSize:12, fontWeight:700, cursor:"pointer" }}>
                {dashEditMode?"✓ Terminer":"✏️ Modifier"}
              </button>
            </div>
          }
        />

        {/* Panneau ajout de blocs */}
        {dashAddPanel && (
          <div style={{ margin:"0 28px 14px", position:"sticky", top:8, zIndex:30 }}>
            <div style={{ background:C.card, borderRadius:12, padding:"16px 20px 26px", border:`1px solid ${C.indigo}40`, boxShadow:"0 10px 26px rgba(15,23,42,0.14)", height:dashAddPanelHeight, maxHeight:"58vh", overflowY:"auto", position:"relative" }}>
              <div style={{ display:"flex", alignItems:"baseline", justifyContent:"space-between", gap:10, marginBottom:10 }}>
                <div style={{ fontSize:12, fontWeight:800, color:C.text }}>Blocs disponibles</div>
                <div style={{ fontSize:10, color:C.muted }}>Ajout multiple autorisé</div>
              </div>
              {availableToAdd.length===0
                ? <div style={{ fontSize:12, color:C.muted }}>Tous les blocs sont déjà affichés.</div>
                : <div style={{ display:"flex", flexWrap:"wrap", gap:8 }}>
                    {availableToAdd.map(def=>(
                      <button key={def.id} onClick={()=>addBlock(def)} style={{ display:"flex", alignItems:"center", gap:6, padding:"6px 12px", background:`${C.indigo}12`, border:`1px solid ${C.indigo}30`, borderRadius:8, fontSize:12, fontWeight:700, color:C.indigo, cursor:"pointer" }}>
                        <Plus size={11}/> {def.label}
                      </button>
                    ))}
                  </div>
              }
              <div
                onMouseDown={startResizeAddPanel}
                title="Glisser pour redimensionner"
                style={{ position:"absolute", left:"50%", bottom:6, transform:"translateX(-50%)", width:54, height:12, cursor:"ns-resize", display:"flex", alignItems:"center", justifyContent:"center", borderRadius:999, background:`${C.indigo}14`, border:`1px solid ${C.indigo}2E` }}
              >
                <div style={{ width:24, height:3, borderRadius:999, background:C.indigo, opacity:0.65 }} />
              </div>
            </div>
          </div>
        )}

        {/* Guide mode édition */}
        {dashEditMode && (
          <div style={{ margin:"0 28px 10px", padding:"8px 14px", background:`${C.amber}12`, border:`1px solid ${C.amber}35`, borderRadius:8, fontSize:11.5, color:C.amber, fontWeight:700 }}>
            ✏️ Mode édition — <strong>Barre ⠿</strong> pour déplacer · <strong>Bord droit →</strong> pour largeur · <strong>Bord bas ↓</strong> pour hauteur · <strong>✕</strong> pour supprimer
          </div>
        )}

        {/* ═══ GRILLE CSS GRID 12 colonnes ════════════════════════════ */}
        <div
          ref={gridRef}
          style={{
            display: "grid",
            gridTemplateColumns: `repeat(${GRID_COLS}, 1fr)`,
            gridAutoRows: `${CELL_H}px`,
            gap: `${GAP}px`,
            padding: "0 28px 40px",
            userSelect: dashEditMode ? "none" : "auto",
          }}
        >
          {blocks.map(block => (
            <div
              key={block.id}
              style={{
                gridColumn: `${block.col} / span ${block.colSpan}`,
                gridRow:    `${block.row} / span ${block.rowSpan}`,
                background: C.card,
                borderRadius: 14,
                border: dashEditMode ? `2px dashed ${C.indigo}60` : `1px solid ${C.border}`,
                boxShadow: dashEditMode ? `0 0 0 0px transparent` : "0 1px 3px rgba(0,0,0,0.05)",
                overflow: "hidden",
                position: "relative",
                transition: "border 0.15s, box-shadow 0.15s",
                display: "flex",
                flexDirection: "column",
              }}
            >
              {/* ── Barre de titre en mode édition ── */}
              {dashEditMode && (
                <div style={{ height:30, flexShrink:0, display:"flex", alignItems:"center", justifyContent:"space-between", padding:"0 10px", background:`${C.indigo}0D`, borderBottom:`1px dashed ${C.indigo}40`, zIndex:5 }}>
                  {/* Poignée de déplacement */}
                  <div
                    onMouseDown={e=>startDrag(e,block.id)}
                    style={{ display:"flex", alignItems:"center", gap:6, cursor:"grab", flex:1 }}
                    title="Glisser pour déplacer"
                  >
                    <div style={{ display:"flex", flexDirection:"column", gap:2.5 }}>
                      {[0,1,2].map(row=>(
                        <div key={row} style={{ display:"flex", gap:2.5 }}>
                          {[0,1].map(col=><div key={col} style={{ width:3, height:3, borderRadius:"50%", background:C.indigo, opacity:0.55 }}/>)}
                        </div>
                      ))}
                    </div>
                    <span style={{ fontSize:10, color:C.indigo, fontWeight:700, opacity:0.8 }}>{block.label}</span>
                  </div>
                  {/* Position affichée */}
                  <span style={{ fontSize:9, color:C.muted, fontWeight:600, marginRight:8 }}>
                    {String.fromCharCode(64+block.col)}{block.row}:{String.fromCharCode(64+block.col+block.colSpan-1)}{block.row+block.rowSpan-1}
                  </span>
                  {/* Bouton supprimer */}
                  <button
                    onClick={()=>removeBlock(block.id)}
                    style={{ width:20, height:20, borderRadius:5, background:`${C.red}18`, border:"none", cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", color:C.red, flexShrink:0 }}
                  >
                    <X size={11}/>
                  </button>
                </div>
              )}

              {/* ── Contenu du bloc ── */}
              <div style={{ flex:1, overflow:"hidden", padding:"12px 14px", minHeight:0 }}>
                {renderBlockContent(block)}
              </div>

              {/* ── Poignée resize côté droit ── */}
              {dashEditMode && (
                <div
                  onMouseDown={e=>startResizeCol(e,block.id)}
                  title="Glisser pour changer la largeur"
                  style={{ position:"absolute", top:"30%", bottom:"30%", right:0, width:8, cursor:"ew-resize", display:"flex", alignItems:"center", justifyContent:"center", zIndex:10 }}
                >
                  <div style={{ width:3, height:"60%", minHeight:24, borderRadius:99, background:C.indigo, opacity:0.55 }}/>
                </div>
              )}

              {/* ── Poignée resize bord bas ── */}
              {dashEditMode && (
                <div
                  onMouseDown={e=>startResizeRow(e,block.id)}
                  title="Glisser pour changer la hauteur"
                  style={{ position:"absolute", bottom:0, left:"30%", right:"30%", height:8, cursor:"s-resize", display:"flex", alignItems:"center", justifyContent:"center", zIndex:10 }}
                >
                  <div style={{ height:3, width:"60%", minWidth:24, borderRadius:99, background:C.indigo, opacity:0.55 }}/>
                </div>
              )}

              {/* ── Coin bas-droit (resize diagonal) ── */}
              {dashEditMode && (
                <div
                  onMouseDown={e=>{ startResizeCol(e,block.id); startResizeRow(e,block.id); }}
                  title="Glisser pour redimensionner"
                  style={{ position:"absolute", bottom:0, right:0, width:14, height:14, cursor:"se-resize", background:C.indigo, opacity:0.45, borderRadius:"14px 0 0 0", zIndex:11 }}
                />
              )}
            </div>
          ))}
        </div>
      </div>
    );
  };




  // ── VUE : REVENUS ─────────────────────────────────────────────────────
  const RevenusView = () => {
    const revTx = allTxList.filter(t => t.type === "income");
    return (
      <div style={{ flex: 1, overflowY: "auto", height: "100vh" }}>
        <PageHeader title="Revenus" sub="Analyse de vos sources de revenus"
          actions={<button onClick={openEntryHub} style={{ display: "flex", alignItems: "center", gap: 6, padding: "7px 14px", background: C.green, color: "#fff", border: "none", borderRadius: 8, fontSize: 12.5, fontWeight: 700, cursor: "pointer" }}><Plus size={14} /> Nouvelle transaction</button>}
        />
        <div style={{ padding: "22px 28px" }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 14, marginBottom: 20 }}>
            <KPI label="Total Revenus" value={f(totalIncome)} icon="REV" color={C.green} trend={incomeTrend} tLabel={comparisonLabel} />
            <KPI label="Nb. de sources" value={currentIncomeTx.length} icon="SRC" color={C.teal} trend={incomeCountTrend} tLabel="ce mois" />
            <KPI label="Revenu moyen" value={currentIncomeTx.length ? f(totalIncome / currentIncomeTx.length) : "0 Ar"} icon="AVG" color={C.blue} trend={incomeAverageTrend} tLabel="moyenne mensuelle" />
          </div>
          <div style={{ background: C.card, borderRadius: 12, padding: "20px", border: `1px solid ${C.border}` }}>
            <h3 style={{ fontSize: 13.5, fontWeight: 800, color: C.text, marginBottom: 16 }}>Sources de Revenus</h3>
            {revTx.map((tx, i) => (
              <div key={tx.id} style={{ display: "flex", alignItems: "center", padding: "10px 0", borderBottom: i < revTx.length - 1 ? `1px solid ${C.faint}` : "none" }}>
                <div style={{ width: 36, height: 36, borderRadius: 9, background: `${C.green}18`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 800, marginRight: 12 }}>IN</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: C.text }}>{tx.desc}</div>
                  <div style={{ fontSize: 11, color: C.muted }}>{tx.cat} · {tx.date}{tx.autoLabel ? ` · ${tx.autoLabel.toLowerCase()}` : ""}</div>
                </div>
                <div style={{ fontSize: 15, fontWeight: 900, color: C.green, marginRight: 12 }}>+{f(tx.amount)}</div>
                {!tx.isRecurring && <div style={{ display: "flex", gap: 6 }}>
                  <button onClick={() => openEditTx(tx)} style={{ width: 28, height: 28, borderRadius: 7, background: `${C.blue}15`, border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: C.blue }}><Edit2 size={12} /></button>
                  <button onClick={() => deleteTx(tx.id)} style={{ width: 28, height: 28, borderRadius: 7, background: `${C.red}15`, border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: C.red }}><Trash2 size={12} /></button>
                </div>}
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  // �"?�"? D�?PENSES �"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?

  // ── VUE : DÉPENSES ────────────────────────────────────────────────────
  const DepensesView = () => {
    const expTx = allTxList.filter(t => t.type === "expense");
    return (
      <div style={{ flex: 1, overflowY: "auto", height: "100vh" }}>
        <PageHeader title="Dépenses" sub="Analyse détaillée de vos dépenses"
          actions={<button onClick={openEntryHub} style={{ display: "flex", alignItems: "center", gap: 6, padding: "7px 14px", background: C.red, color: "#fff", border: "none", borderRadius: 8, fontSize: 12.5, fontWeight: 700, cursor: "pointer" }}><Plus size={14} /> Nouvelle transaction</button>}
        />
        <div style={{ padding: "22px 28px" }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 14, marginBottom: 20 }}>
            <KPI label="Total Dépenses" value={f(totalExpenses)} icon="DEP" color={C.red} trend={expenseTrend} tLabel={comparisonLabel} />
            <KPI label="Nb. transactions" value={currentExpenseTx.length} icon="TX" color={C.amber} trend={expenseCountTrend} tLabel="ce mois" />
            <KPI label="Dépense moyenne" value={currentExpenseTx.length ? f(totalExpenses / currentExpenseTx.length) : "0 Ar"} icon="AVG" color={C.purple} trend={expenseAverageTrend} tLabel="moyenne mensuelle" />
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: 14, marginBottom: 14 }}>
            <div style={{ background: C.card, borderRadius: 12, padding: "20px", border: `1px solid ${C.border}` }}>
              <h3 style={{ fontSize: 13.5, fontWeight: 800, color: C.text, marginBottom: 16 }}>Par Catégorie</h3>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={expenseCategories} layout="vertical">
                  <XAxis type="number" tick={{ fontSize: 10, fill: C.muted }} axisLine={false} tickLine={false} tickFormatter={v => fmt(v, currency, rates)} />
                  <YAxis dataKey="name" type="category" tick={{ fontSize: 11, fill: C.muted }} axisLine={false} tickLine={false} width={90} />
                  <Tooltip formatter={(v) => fmt(v, currency, rates)} />
                  <Bar dataKey="val" radius={[0, 4, 4, 0]}>
                    {expenseCategories.map((c, i) => <Cell key={i} fill={c.color} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div style={{ background: C.card, borderRadius: 12, padding: "20px", border: `1px solid ${C.border}` }}>
              <h3 style={{ fontSize: 13.5, fontWeight: 800, color: C.text, marginBottom: 16 }}>Répartition</h3>
              <PieChart width={200} height={180} style={{ margin: "0 auto" }}>
                <Pie data={expenseCategories} dataKey="val" nameKey="name" cx="50%" cy="50%" outerRadius={80} innerRadius={45}>
                  {expenseCategories.map((c, i) => <Cell key={i} fill={c.color} />)}
                </Pie>
                <Tooltip formatter={(v) => fmt(v, currency, rates)} />
              </PieChart>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 8 }}>
                {expenseCategories.map(c => (
                  <div key={c.name} style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 10.5 }}>
                    <div style={{ width: 8, height: 8, borderRadius: 2, background: c.color }} />
                    <span style={{ color: C.muted }}>{c.name} {c.pct}%</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div style={{ background: C.card, borderRadius: 12, padding: "20px", border: `1px solid ${C.border}` }}>
            <h3 style={{ fontSize: 13.5, fontWeight: 800, color: C.text, marginBottom: 16 }}>Toutes les dépenses</h3>
            {expTx.map((tx, i) => (
              <div key={tx.id} style={{ display: "flex", alignItems: "center", padding: "10px 0", borderBottom: i < expTx.length - 1 ? `1px solid ${C.faint}` : "none" }}>
                <div style={{ width: 36, height: 36, borderRadius: 9, background: `${C.red}12`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 800, marginRight: 12 }}>OUT</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: C.text }}>{tx.desc}</div>
                  <div style={{ fontSize: 11, color: C.muted }}>{tx.cat} · {tx.date}{tx.autoLabel ? ` · ${tx.autoLabel.toLowerCase()}` : ""}</div>
                </div>
                <div style={{ fontSize: 15, fontWeight: 900, color: C.red, marginRight: 12 }}>-{f(tx.amount)}</div>
                {!tx.isRecurring && <div style={{ display: "flex", gap: 6 }}>
                  <button onClick={() => openEditTx(tx)} style={{ width: 28, height: 28, borderRadius: 7, background: `${C.blue}15`, border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: C.blue }}><Edit2 size={12} /></button>
                  <button onClick={() => deleteTx(tx.id)} style={{ width: 28, height: 28, borderRadius: 7, background: `${C.red}15`, border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: C.red }}><Trash2 size={12} /></button>
                </div>}
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  // �"?�"? BUDGET �"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?

  // ── VUE : BUDGET ──────────────────────────────────────────────────────
  const BudgetView = () => {
    // ── Données du mois courant ──────────────────────────────────────────────
    const dayOfMonth       = now.getDate();
    const totalDaysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
    const monthElapsed     = dayOfMonth / totalDaysInMonth;

    // Toutes les dépenses du mois en cours
    const currentMonthExpenses = allTxList.filter(
      tx => tx.type === "expense" && tx.date.slice(0, 7) === liveMonthKey
    );

    // ── Construction des lignes budget ───────────────────────────────────────
    const enrichedBudgets = budgets.map(b => {
      const spent = Math.abs(
        currentMonthExpenses
          .filter(tx => tx.cat === normalizeCategory(b.category))
          .reduce((sum, tx) => sum + tx.amount, 0)
      );
      const pct       = b.limit > 0 ? Math.round((spent / b.limit) * 100) : 0;
      const remaining = b.limit - spent;
      const color     = categoryColors[b.category] || categoryColors[normalizeCategory(b.category)] || CATEGORY_COLOR_MAP[normalizeCategory(b.category)] || C.indigo;

      const expectedPct = Math.round(monthElapsed * 100);
      let health = "ok";
      if (pct > 100) health = "danger";
      else if (pct > expectedPct + 20) health = "warn";
      else if (pct > expectedPct + 40) health = "danger";

      return { ...b, spent, pct, remaining, color, health, expectedPct };
    });

    // ── Totaux globaux ────────────────────────────────────────────────────────
    const totalLimit   = budgets.reduce((s, b) => s + b.limit, 0);
    const totalSpent   = enrichedBudgets.reduce((s, b) => s + b.spent, 0);
    const totalPct     = totalLimit > 0 ? Math.round((totalSpent / totalLimit) * 100) : 0;
    const totalRemain  = totalLimit - totalSpent;

    const dangerBudgets = enrichedBudgets.filter(b => b.health === "danger" && b.pct > 0);
    const warnBudgets   = enrichedBudgets.filter(b => b.health === "warn"   && b.pct > 0);

    const ProgressBar = ({ pct, color }) => {
      const barColor = pct > 90 ? C.red : pct > 70 ? C.amber : color;
      return (
        <div style={{ height: 8, background: C.faint, borderRadius: 50, overflow: "hidden", position: "relative" }}>
          <div style={{
            position: "absolute", left: `${Math.min(Math.round(monthElapsed * 100), 100)}%`,
            top: 0, bottom: 0, width: 2, background: C.muted, opacity: 0.5, zIndex: 1,
          }} />
          <div className="ft-bar" style={{
            width: `${Math.min(pct, 100)}%`, height: "100%",
            background: barColor, borderRadius: 50,
            transition: "width 0.8s cubic-bezier(0.22,1,0.36,1)",
          }} />
        </div>
      );
    };

    const HealthBadge = ({ b }) => {
      if (b.pct === 0) return (
        <span style={{ fontSize: 10.5, color: C.muted, fontWeight: 600 }}>Aucune dépense ce mois</span>
      );
      if (b.pct > 100) return (
        <span style={{ fontSize: 10.5, color: C.red, fontWeight: 700 }}>
          🚨 Dépassement de {b.pct - 100}% — limite franchie !
        </span>
      );
      if (b.health === "danger") return (
        <span style={{ fontSize: 10.5, color: C.red, fontWeight: 700 }}>
          ⚠️ Jour {dayOfMonth}/{totalDaysInMonth} — Déjà {b.pct}% utilisé · Ralentis !
        </span>
      );
      if (b.health === "warn") return (
        <span style={{ fontSize: 10.5, color: C.amber, fontWeight: 700 }}>
          📊 {b.pct}% utilisé pour ~{b.expectedPct}% du mois écoulé
        </span>
      );
      return (
        <span style={{ fontSize: 10.5, color: C.green, fontWeight: 700 }}>
          ✓ Dans les clous — {b.pct}% utilisé, {b.expectedPct}% du mois écoulé
        </span>
      );
    };

    const GlobalHealthPanel = () => {
      const monthName = now.toLocaleDateString("fr-FR", { month: "long" });
      let bgColor = `${C.green}12`, borderColor = `${C.green}40`, icon = "🟢", statusText = "Gestion exemplaire";
      let message = `Nous sommes le ${dayOfMonth} ${monthName}. Tu as utilisé ${totalPct}% de ton budget global — tu es parfaitement dans les clous.`;

      if (dangerBudgets.length > 0) {
        bgColor = `${C.red}10`; borderColor = `${C.red}35`; icon = "🔴";
        statusText = "Attention requise";
        const names = dangerBudgets.map(b => b.category).join(", ");
        message = `Jour ${dayOfMonth}/${totalDaysInMonth} : ${names} ${dangerBudgets.length > 1 ? "sont" : "est"} en zone rouge avec ${dangerBudgets[0].pct}% consommé. Freine sur ces catégories !`;
      } else if (warnBudgets.length > 0) {
        bgColor = `${C.amber}10`; borderColor = `${C.amber}35`; icon = "🟡";
        statusText = "Quelques vigilances";
        const names = warnBudgets.map(b => b.category).join(", ");
        message = `Jour ${dayOfMonth}/${totalDaysInMonth} : ${names} ${warnBudgets.length > 1 ? "consomment" : "consomme"} plus vite que prévu. Reste attentif.`;
      } else if (totalPct > 70) {
        bgColor = `${C.amber}10`; borderColor = `${C.amber}35`; icon = "🟡";
        statusText = "Budget bien entamé";
        message = `Jour ${dayOfMonth}/${totalDaysInMonth} — Budget global à ${totalPct}%. La vitesse de dépense est correcte, continue sur ta lancée.`;
      }

      return (
        <div style={{
          background: bgColor, border: `1px solid ${borderColor}`,
          borderRadius: 14, padding: "16px 20px",
          display: "flex", gap: 14, alignItems: "flex-start",
        }}>
          <div style={{ fontSize: 26, lineHeight: 1 }}>{icon}</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 12, fontWeight: 800, color: C.text, marginBottom: 3 }}>{statusText}</div>
            <div style={{ fontSize: 12.5, color: C.muted, lineHeight: 1.5 }}>{message}</div>
          </div>
          <div style={{ textAlign: "right", whiteSpace: "nowrap" }}>
            <div style={{ fontSize: 11, color: C.muted, fontWeight: 600 }}>Mois écoulé</div>
            <div style={{ fontSize: 18, fontWeight: 900, color: C.text }}>{Math.round(monthElapsed * 100)}%</div>
          </div>
        </div>
      );
    };

    return (
      <div style={{ flex: 1, overflowY: "auto", height: "100vh" }}>
        <PageHeader
          title="Budget"
          sub={`Mois de ${now.toLocaleDateString("fr-FR", { month: "long", year: "numeric" })} · Limites personnalisées par catégorie`}
          actions={
            <button
              onClick={() => { setEditBudget(null); setBudgetForm({ category: "", limit: "" }); setShowBudgetModal(true); }}
              style={{ display: "flex", alignItems: "center", gap: 6, padding: "7px 14px", background: C.indigo, color: "#fff", border: "none", borderRadius: 8, fontSize: 12.5, fontWeight: 700, cursor: "pointer" }}
            >
              <Plus size={14} /> Définir un budget
            </button>
          }
        />

        <div style={{ padding: "22px 28px" }}>

          {/* ── KPI globaux ── */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 14, marginBottom: 20 }}>
            <KPI label="Budget Total Alloué" value={f(totalLimit)}  icon="BDG" color={C.blue}   trend={0}         tLabel="ce mois-ci" />
            <KPI label="Total Dépensé"        value={f(totalSpent)}  icon="DEP" color={C.amber}  trend={budgetSpentTrend} tLabel={comparisonLabel} />
            <KPI label="Restant Disponible"   value={f(totalRemain)} icon="OK"  color={totalRemain >= 0 ? C.green : C.red} trend={0} tLabel={`${totalPct}% consommé`} />
          </div>

          {/* ── Barre de progression globale ── */}
          <div style={{ background: C.card, borderRadius: 14, padding: "18px 22px", border: `1px solid ${C.border}`, marginBottom: 16 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
              <span style={{ fontSize: 12.5, fontWeight: 700, color: C.text }}>Avancement global du budget</span>
              <span style={{ fontSize: 12, fontWeight: 800, color: totalPct > 90 ? C.red : totalPct > 70 ? C.amber : C.green }}>{totalPct}%</span>
            </div>
            <div style={{ height: 12, background: C.faint, borderRadius: 50, overflow: "hidden", position: "relative" }}>
              <div style={{
                position: "absolute",
                left: `${Math.min(Math.round(monthElapsed * 100), 100)}%`,
                top: 0, bottom: 0, width: 2,
                background: C.muted, opacity: 0.6, zIndex: 1,
              }} title={`Jour ${dayOfMonth} — ${Math.round(monthElapsed * 100)}% du mois`} />
              <div className="ft-bar" style={{
                width: `${Math.min(totalPct, 100)}%`, height: "100%",
                background: totalPct > 90 ? C.red : totalPct > 70 ? C.amber : C.indigo,
                borderRadius: 50, transition: "width 0.9s cubic-bezier(0.22,1,0.36,1)",
              }} />
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", marginTop: 8, fontSize: 11, color: C.muted }}>
              <span>{f(totalSpent)} dépensés</span>
              <span style={{ opacity: 0.6 }}>┊ jour {dayOfMonth}/{totalDaysInMonth}</span>
              <span>{f(totalLimit)} alloués</span>
            </div>
          </div>

          {/* ── Encart santé globale ── */}
          <div style={{ marginBottom: 22 }}>
            <GlobalHealthPanel />
          </div>

          {/* ── Grille de cartes budget ── */}
          {enrichedBudgets.length === 0 ? (
            <div style={{ background: C.card, borderRadius: 14, padding: "40px", border: `1px solid ${C.border}`, textAlign: "center" }}>
              <div style={{ fontSize: 36, marginBottom: 12 }}>💰</div>
              <div style={{ fontSize: 14, fontWeight: 700, color: C.text, marginBottom: 6 }}>Aucun budget défini</div>
              <div style={{ fontSize: 12.5, color: C.muted }}>
                Clique sur « Définir un budget » pour fixer tes limites mensuelles par catégorie.
              </div>
            </div>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: 14 }}>
              {enrichedBudgets.map(b => {
                const statusColor = b.pct > 90 ? C.red : b.pct > 70 ? C.amber : b.color;
                return (
                  <div key={b.category} className="ft-card ft-hover" style={{
                    background: C.card,
                    border: `1px solid ${b.pct > 90 ? `${C.red}40` : C.border}`,
                    borderRadius: 14, padding: "18px 20px",
                    boxShadow: b.pct > 90 ? `0 4px 18px ${hexToRgba(C.red, 0.1)}` : "0 1px 4px rgba(0,0,0,0.04)",
                    position: "relative", overflow: "hidden",
                  }}>
                    <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: 4, background: statusColor, borderRadius: "14px 0 0 14px" }} />
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 14, paddingLeft: 8 }}>
                      <div>
                        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                          <div style={{ width: 10, height: 10, borderRadius: "50%", background: statusColor, flexShrink: 0 }} />
                          <span style={{ fontSize: 13.5, fontWeight: 800, color: C.text }}>{b.category}</span>
                        </div>
                        <HealthBadge b={b} />
                      </div>
                      <div style={{ display: "flex", gap: 6 }}>
                        <button
                          onClick={() => openEditBudget(b)}
                          style={{ width: 30, height: 30, borderRadius: 8, background: `${C.indigo}15`, border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: C.indigo }}
                          title="Modifier la limite"
                        >
                          <Edit2 size={12} />
                        </button>
                        <button
                          onClick={() => deleteBudget(b.category)}
                          style={{ width: 30, height: 30, borderRadius: 8, background: `${C.red}12`, border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: C.red }}
                          title="Supprimer ce budget"
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 10, paddingLeft: 8 }}>
                      <div>
                        <div style={{ fontSize: 20, fontWeight: 900, color: C.text, letterSpacing: 0 }}>{f(b.spent)}</div>
                        <div style={{ fontSize: 11, color: C.muted }}>sur {f(b.limit)} alloués</div>
                      </div>
                      <div style={{ textAlign: "right" }}>
                        <div style={{ fontSize: 13, fontWeight: 800, color: statusColor }}>{b.pct}%</div>
                        <div style={{ fontSize: 10.5, color: b.remaining >= 0 ? C.green : C.red, fontWeight: 700 }}>
                          {b.remaining >= 0 ? `−${f(b.remaining)} restant` : `+${f(Math.abs(b.remaining))} de dépassement`}
                        </div>
                      </div>
                    </div>
                    <ProgressBar pct={b.pct} color={b.color} />
                    <div style={{ display: "flex", justifyContent: "space-between", marginTop: 6, fontSize: 10, color: C.muted, paddingLeft: 8 }}>
                      <span>0</span>
                      <span style={{ opacity: 0.55 }}>┊ jour {dayOfMonth}</span>
                      <span>{f(b.limit)}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* ── Catégories sans budget ── */}
          {(() => {
            const categoriesWithExpenses = expenseCategories.filter(ec =>
              !budgets.some(b => normalizeCategory(b.category) === ec.name) && ec.val > 0
            );
            if (!categoriesWithExpenses.length) return null;
            return (
              <div style={{ marginTop: 20, background: `${C.amber}10`, border: `1px solid ${C.amber}35`, borderRadius: 14, padding: "16px 20px" }}>
                <div style={{ fontSize: 12, fontWeight: 800, color: C.text, marginBottom: 10 }}>
                  💡 Catégories avec dépenses sans budget défini
                </div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                  {categoriesWithExpenses.map(ec => (
                    <button
                      key={ec.name}
                      onClick={() => { setBudgetForm({ category: ec.name, limit: Math.round(ec.val * 1.2).toString() }); setEditBudget(null); setShowBudgetModal(true); }}
                      style={{ display: "flex", alignItems: "center", gap: 6, padding: "6px 12px", background: C.card, border: `1px solid ${C.border}`, borderRadius: 20, fontSize: 11.5, fontWeight: 700, color: C.text, cursor: "pointer" }}
                    >
                      <span style={{ width: 8, height: 8, borderRadius: "50%", background: ec.color }} />
                      {ec.name} · {f(ec.val)}
                      <Plus size={10} color={C.indigo} />
                    </button>
                  ))}
                </div>
              </div>
            );
          })()}

        </div>
      </div>
    );
  }

  // �"?�"? STATISTIQUES �"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?

  // ── VUE : STATISTIQUES ────────────────────────────────────────────────
  const StatistiquesView = () => (
    <div style={{ flex: 1, overflowY: "auto", height: "100vh" }}>
      <PageHeader title="Statistiques" sub="Analyses approfondies de vos finances" actions={<></>} />
      <div style={{ padding: "22px 28px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 14 }}>
          <div style={{ background: C.card, borderRadius: 12, padding: "20px", border: `1px solid ${C.border}` }}>
            <h3 style={{ fontSize: 13.5, fontWeight: 800, color: C.text, marginBottom: 4 }}>Revenus vs Dépenses (6 mois)</h3>
            <p style={{ fontSize: 11, color: C.muted, marginBottom: 16 }}>Comparaison mensuelle</p>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={monthlyTrend6}>
                <CartesianGrid strokeDasharray="3 3" stroke={C.border} />
                <XAxis dataKey="m" tick={{ fontSize: 11, fill: C.muted }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: C.muted }} axisLine={false} tickLine={false} tickFormatter={v => fmt(v, currency, rates)} width={80} />
                <Tooltip content={<DarkTooltip />} />
                <Legend />
                <Bar dataKey="rPast"   name="Rev. reçus"   fill={chartSeriesConfig.find(s=>s.key==="rPast")?.color   || C.green}  radius={[3,3,0,0]} fillOpacity={0.85} />
                <Bar dataKey="rFuture" name="À recevoir"   fill={chartSeriesConfig.find(s=>s.key==="rFuture")?.color || C.amber}  radius={[3,3,0,0]} fillOpacity={0.7} />
                <Bar dataKey="dPaid"   name="Dép. payées" fill={chartSeriesConfig.find(s=>s.key==="dPaid")?.color   || C.red}    radius={[0,0,0,0]} fillOpacity={0.6} stackId="dep" />
                <Bar dataKey="dUnpaid" name="Dép. à payer" fill={chartSeriesConfig.find(s=>s.key==="dUnpaid")?.color || C.amber}  radius={[3,3,0,0]} fillOpacity={0.85} stackId="dep" />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div style={{ background: C.card, borderRadius: 12, padding: "20px", border: `1px solid ${C.border}` }}>
            <h3 style={{ fontSize: 13.5, fontWeight: 800, color: C.text, marginBottom: 4 }}>Solde net mensuel</h3>
            <p style={{ fontSize: 11, color: C.muted, marginBottom: 16 }}>Evolution du solde disponible après charges</p>
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={monthlyTrend6}>
                <defs>
                  <linearGradient id="gSav" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={chartColors.savings} stopOpacity={0.2} />
                    <stop offset="95%" stopColor={chartColors.savings} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke={C.border} />
                <XAxis dataKey="m" tick={{ fontSize: 11, fill: C.muted }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: C.muted }} axisLine={false} tickLine={false} tickFormatter={v => fmt(v, currency, rates)} width={80} />
                <Tooltip content={<DarkTooltip />} />
                <Area type="monotone" dataKey="net" name="Solde net" stroke={chartColors.savings} fill="url(#gSav)" strokeWidth={2.5} dot={{ r: 4, fill: chartColors.savings }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div style={{ background: C.card, borderRadius: 12, padding: "20px", border: `1px solid ${C.border}` }}>
          <h3 style={{ fontSize: 13.5, fontWeight: 800, color: C.text, marginBottom: 16 }}>Résumé statistique</h3>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 14 }}>
            {[
              { label: "Mois le plus rentable", value: bestMonth ? bestMonth.m : "0", icon: "TOP", color: C.amber },
              { label: "Plus grosse depense", value: f(largestExpense), icon: "MAX", color: C.red },
              { label: "Taux net max", value: `${maxSavingsRate.toFixed(1)}%`, icon: "AVG", color: C.green },
              { label: "Objectifs atteints", value: `${goals.filter(g => g.saved >= g.target).length}/${goals.length}`, icon: "OBJ", color: C.indigo },
            ].map((s, i) => (
              <div key={i} style={{ background: C.faint, borderRadius: 10, padding: "16px", border: `1px solid ${C.border}`, textAlign: "center" }}>
                <div style={{ fontSize: 26, marginBottom: 8 }}>{s.icon}</div>
                <div style={{ fontSize: 18, fontWeight: 800, color: s.color, marginBottom: 4 }}>{s.value}</div>
                <div style={{ fontSize: 11, color: C.muted }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  // �"?�"? TRANSACTIONS �"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?

  // ── VUE : TRANSACTIONS ────────────────────────────────────────────────
  const TransactionsView = () => (
    <div style={{ flex: 1, overflowY: "auto", height: "100vh" }}>
      <PageHeader title="Transactions" sub="Toutes vos opérations financières"
        actions={<div style={{ display: "flex", gap: 8 }}>
          <button onClick={openEntryHub} style={{ display: "flex", alignItems: "center", gap: 6, padding: "7px 14px", background: C.indigo, color: "#fff", border: "none", borderRadius: 8, fontSize: 12.5, fontWeight: 700, cursor: "pointer", transition: "all 0.2s ease", boxShadow: `0 4px 14px ${hexToRgba(C.indigo, 0.4)}` }} onMouseEnter={(e) => { e.currentTarget.style.transform = "scale(1.05)"; e.currentTarget.style.boxShadow = `0 6px 20px ${hexToRgba(C.indigo, 0.5)}`; }} onMouseLeave={(e) => { e.currentTarget.style.transform = "scale(1)"; e.currentTarget.style.boxShadow = `0 4px 14px ${hexToRgba(C.indigo, 0.4)}`; }} onMouseDown={(e) => { e.currentTarget.style.transform = "scale(0.95)"; }} onMouseUp={(e) => { e.currentTarget.style.transform = "scale(1.05)"; }}><Plus size={14} /> Nouvelle transaction</button>
        </div>}
      />
      <div style={{ padding: "22px 28px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 14, marginBottom: 16 }}>
          {[
            { label: "Manuelles", value: txList.length, color: C.blue, note: "écritures ponctuelles" },
            { label: "Récurrentes", value: recurringItems.filter(item => item.active).length, color: C.indigo, note: "règles mensuelles actives" },
            { label: "Générées", value: recurringTransactions.length + acceptedJobTransactions.length, color: C.teal, note: `${recurringTransactions.length} mensuelles + ${acceptedJobTransactions.length} revenus job` },
            { label: "Volume total", value: filteredTx.length, color: C.green, note: "selon votre filtre actuel" },
          ].map(card => (
            <div key={card.label} style={{ background: C.card, borderRadius: 12, padding: "16px 18px", border: `1px solid ${C.border}` }}>
              <div style={{ fontSize: 10.5, color: C.muted, fontWeight: 800, textTransform: "uppercase", marginBottom: 6 }}>{card.label}</div>
              <div style={{ fontSize: 21, fontWeight: 900, color: card.color, marginBottom: 4 }}>{card.value}</div>
              <div style={{ fontSize: 11, color: C.muted }}>{card.note}</div>
            </div>
          ))}
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 16 }}>
          {/* Bloc Opérations récurrentes */}
          <div style={{ background: C.card, borderRadius: 12, border: `1px solid ${C.border}`, overflow: "hidden" }}>
            <div style={{ padding: "16px 18px", borderBottom: `1px solid ${C.border}` }}>
              <div>
                <h3 style={{ fontSize: 13.5, fontWeight: 800, color: C.text }}>Opérations récurrentes</h3>
                <p style={{ fontSize: 11, color: C.muted }}>Dépenses et revenus qui se répètent automatiquement</p>
              </div>
            </div>
            <div style={{ padding: "14px 18px", display: "grid", gap: 10 }}>
              {recurringItems.map(item => {
                const paymentStatus = item.paymentStatuses?.[currentMonthKey] || "pending";
                const paidMonths = Object.values(item.paymentStatuses || {}).filter(status => status === "on_time" || status === "late").length;
                const paidAmount = paidMonths * Math.abs(Number(item.amount) || 0);
                const loanTotal = Number(item.loanTotalAmount) || 0;
                const loanPct = loanTotal > 0 ? Math.min(100, Math.round((paidAmount / loanTotal) * 100)) : 0;
                return (
                <div key={item.id} style={{ border: `1px solid ${C.border}`, borderRadius: 12, padding: "12px 14px", background: item.active ? C.card : C.faint }}>
                  <div style={{ display: "flex", justifyContent: "space-between", gap: 10, marginBottom: 6 }}>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 700, color: C.text }}>{item.desc}</div>
                      <div style={{ fontSize: 10.5, color: C.muted }}>
                        {(() => {
                          const freqLabels = {
                            daily: "tous les jours",
                            weekly: "toutes les semaines",
                            monthly: `chaque mois le ${item.dayOfMonth}`,
                            yearly: `chaque année le ${item.dayOfMonth}`
                          };
                          return `${item.cat} · ${freqLabels[item.frequency] || freqLabels.monthly}${item.kind === "loan" ? " · prêt" : ""}`;
                        })()}
                      </div>
                    </div>
                    <div style={{ fontSize: 12, fontWeight: 900, color: item.type === "income" ? C.green : C.red }}>
                      {item.type === "income" ? "+" : "-"}{f(item.amount)}
                    </div>
                  </div>
                  <div style={{ fontSize: 11, color: C.muted, marginBottom: 10 }}>
                    Depuis {item.startDate}{item.endDate ? ` jusqu'au ${item.endDate}` : " sans date de fin"}
                  </div>
                  {item.kind === "loan" && (
                    <div style={{ marginBottom: 12, background: C.faint, borderRadius: 10, padding: "10px 12px", border: `1px solid ${C.border}` }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                        <span style={{ fontSize: 11.5, color: C.text, fontWeight: 700 }}>Progression du prêt</span>
                        <span style={{ fontSize: 11, color: C.indigo, fontWeight: 800 }}>{loanTotal > 0 ? `${loanPct}%` : "à définir"}</span>
                      </div>
                      <div style={{ height: 8, background: C.card, borderRadius: 999, overflow: "hidden", marginBottom: 6 }}>
                        <div style={{ width: `${loanPct}%`, height: "100%", background: `linear-gradient(90deg, ${C.indigo}, ${C.blue})`, borderRadius: 999 }} />
                      </div>
                      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10.5, color: C.muted }}>
                        <span>Déjà payé: {f(paidAmount)}</span>
                        <span>Total: {loanTotal > 0 ? f(loanTotal) : "non défini"}</span>
                      </div>
                      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10.5, marginTop: 6, paddingTop: 6, borderTop: `1px dashed ${C.border}` }}>
                        <span style={{ color: C.red, fontWeight: 700 }}>Dette à venir:</span>
                        <span style={{ color: C.red, fontWeight: 800 }}>{loanTotal > 0 ? f(Math.max(0, loanTotal - paidAmount)) : "non défini"}</span>
                      </div>
                      <div style={{ fontSize: 10.5, color: C.muted, marginTop: 8 }}>
                        Pénalité actuelle: {Number(item.penaltyAmount) > 0 ? f(item.penaltyAmount) : "aucune"}
                      </div>
                    </div>
                  )}
                  <div style={{ display: "flex", gap: 6 }}>
                    <button onClick={() => toggleRecurring(item.id)} style={{ padding: "6px 10px", borderRadius: 7, border: `1px solid ${item.active ? C.green : C.border}`, background: item.active ? `${C.green}12` : C.card, color: item.active ? C.green : C.muted, fontSize: 11.5, fontWeight: 700, cursor: "pointer" }}>
                      {item.active ? "Actif" : "Pause"}
                    </button>
                    <button onClick={() => openEditRecurring(item)} style={{ padding: "6px 10px", borderRadius: 7, border: `1px solid ${C.blue}25`, background: `${C.blue}12`, color: C.blue, fontSize: 11.5, fontWeight: 700, cursor: "pointer" }}>Modifier</button>
                    <button onClick={() => deleteRecurring(item.id)} style={{ padding: "6px 10px", borderRadius: 7, border: `1px solid ${C.red}25`, background: `${C.red}12`, color: C.red, fontSize: 11.5, fontWeight: 700, cursor: "pointer" }}>Supprimer</button>
                  </div>
                </div>
              )})}
            </div>
          </div>

          {/* Bloc Opérations ponctuelles */}
          <div style={{ background: C.card, borderRadius: 12, border: `1px solid ${C.border}`, overflow: "hidden" }}>
            <div style={{ padding: "16px 18px", borderBottom: `1px solid ${C.border}` }}>
              <div>
                <h3 style={{ fontSize: 13.5, fontWeight: 800, color: C.text }}>Opérations ponctuelles</h3>
                <p style={{ fontSize: 11, color: C.muted }}>Transactions manuelles saisies une par une</p>
              </div>
            </div>
            <div style={{ padding: "14px 18px", display: "grid", gap: 10 }}>
              {txList.length === 0 ? (
                <div style={{ fontSize: 12, color: C.muted, textAlign: "center", padding: "20px" }}>Aucune transaction ponctuelle</div>
              ) : (
                txList.slice(0, 5).map(tx => (
                  <div key={tx.id} style={{ border: `1px solid ${C.border}`, borderRadius: 12, padding: "12px 14px", background: C.card }}>
                    <div style={{ display: "flex", justifyContent: "space-between", gap: 10, marginBottom: 6 }}>
                      <div>
                        <div style={{ fontSize: 13, fontWeight: 700, color: C.text }}>{tx.desc}</div>
                        <div style={{ fontSize: 10.5, color: C.muted }}>{tx.cat} · {tx.date}</div>
                      </div>
                      <div style={{ fontSize: 12, fontWeight: 900, color: tx.type === "income" ? C.green : C.red }}>
                        {tx.type === "income" ? "+" : "-"}{f(tx.amount)}
                      </div>
                    </div>
                    <div style={{ display: "flex", gap: 6 }}>
                      <button onClick={() => openEditTx(tx)} style={{ padding: "6px 10px", borderRadius: 7, border: `1px solid ${C.blue}25`, background: `${C.blue}12`, color: C.blue, fontSize: 11.5, fontWeight: 700, cursor: "pointer" }}>Modifier</button>
                      <button onClick={() => deleteTx(tx.id)} style={{ padding: "6px 10px", borderRadius: 7, border: `1px solid ${C.red}25`, background: `${C.red}12`, color: C.red, fontSize: 11.5, fontWeight: 700, cursor: "pointer" }}>Supprimer</button>
                    </div>
                  </div>
                ))
              )}
              {txList.length > 5 && (
                <div style={{ fontSize: 11, color: C.muted, textAlign: "center", padding: "8px" }}>
                  + {txList.length - 5} transactions supplémentaires
                </div>
              )}
            </div>
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1.1fr 0.9fr", gap: 14, marginBottom: 16 }}>
          <div style={{ background: C.card, borderRadius: 12, border: `1px solid ${C.border}`, overflow: "hidden" }}>
            <div style={{ padding: "16px 18px", borderBottom: `1px solid ${C.border}`, display: "flex", alignItems: "center", gap: 8 }}>
              <h3 style={{ fontSize: 13.5, fontWeight: 800, color: C.text, flex: 1 }}>Toutes les opérations</h3>
              {[{ id: "all", label: "Toutes" }, { id: "income", label: "Revenus" }, { id: "expense", label: "Depenses" }].map(f => (
                <button key={f.id} onClick={() => setTxFilter(f.id)} style={{
                  padding: "6px 12px", borderRadius: 6, fontSize: 12,
                  border: `1px solid ${txFilter === f.id ? C.indigo : C.border}`,
                  background: txFilter === f.id ? `${C.indigo}12` : C.card,
                  color: txFilter === f.id ? C.indigo : C.muted,
                  fontWeight: txFilter === f.id ? 700 : 500, cursor: "pointer",
                }}>{f.label}</button>
              ))}
            </div>
            
            {/* Grouper les transactions par source */}
            <div style={{ padding: "18px" }}>
              {(() => {
                // Fonction pour filtrer selon la fenêtre temporelle
                const filterByTimeWindow = (transactions, frequency) => {
                  const today = new Date();
                  today.setHours(0, 0, 0, 0);
                  
                  // Helper pour comparer uniquement les dates (sans heure)
                  const dateOnly = (d) => new Date(d.getFullYear(), d.getMonth(), d.getDate());
                  
                  if (frequency === "daily") {
                    // J-2, J-1, J, J+1 (4 jours) + non-payés avant J-2
                    const twoDaysAgo = new Date(today);
                    twoDaysAgo.setDate(today.getDate() - 2);
                    const tomorrow = new Date(today);
                    tomorrow.setDate(today.getDate() + 1);
                    return transactions.filter(t => {
                      const d = dateOnly(new Date(t.date));
                      const inWindow = d >= dateOnly(twoDaysAgo) && d <= dateOnly(tomorrow);
                      const isUnpaid = t.paymentStatus !== "on_time" && t.paymentStatus !== "paid";
                      return inWindow || (isUnpaid && d < dateOnly(twoDaysAgo));
                    });
                  } else if (frequency === "weekly") {
                    // S-2, S-1, S, S+1 (4 semaines) + non-payés avant S-2
                    const currentWeekStart = new Date(today);
                    currentWeekStart.setDate(today.getDate() - today.getDay());
                    currentWeekStart.setHours(0, 0, 0, 0);
                    const twoWeeksAgo = new Date(currentWeekStart);
                    twoWeeksAgo.setDate(currentWeekStart.getDate() - 14);
                    const nextWeekEnd = new Date(currentWeekStart);
                    nextWeekEnd.setDate(currentWeekStart.getDate() + 20); // S+1 fin (dimanche)
                    nextWeekEnd.setHours(23, 59, 59, 999);
                    return transactions.filter(t => {
                      const d = new Date(t.date);
                      const inWindow = d >= twoWeeksAgo && d <= nextWeekEnd;
                      const isUnpaid = t.paymentStatus !== "on_time" && t.paymentStatus !== "paid";
                      return inWindow || (isUnpaid && d < twoWeeksAgo);
                    });
                  } else if (frequency === "monthly") {
                    // M-2, M-1, M, M+1 (4 mois) + non-payés avant M-2
                    const currentMonth = today.getMonth();
                    const currentYear = today.getFullYear();
                    const twoMonthsAgo = new Date(currentYear, currentMonth - 2, 1);
                    const nextMonthEnd = new Date(currentYear, currentMonth + 2, 0); // fin M+1
                    nextMonthEnd.setHours(23, 59, 59, 999);
                    return transactions.filter(t => {
                      const d = new Date(t.date);
                      const inWindow = d >= twoMonthsAgo && d <= nextMonthEnd;
                      const isUnpaid = t.paymentStatus !== "on_time" && t.paymentStatus !== "paid";
                      return inWindow || (isUnpaid && d < twoMonthsAgo);
                    });
                  } else if (frequency === "yearly") {
                    // A-1, A, A+1 (3 années) + non-payés avant A-1
                    const currentYear = today.getFullYear();
                    const lastYear = new Date(currentYear - 1, 0, 1);
                    const nextYearEnd = new Date(currentYear + 2, 0, 0); // fin A+1
                    nextYearEnd.setHours(23, 59, 59, 999);
                    return transactions.filter(t => {
                      const d = new Date(t.date);
                      const inWindow = d >= lastYear && d <= nextYearEnd;
                      const isUnpaid = t.paymentStatus !== "on_time" && t.paymentStatus !== "paid";
                      return inWindow || (isUnpaid && d < lastYear);
                    });
                  }
                  return transactions;
                };
                
                // Grouper par sourceId pour les récurrentes, ou par id pour les manuelles
                const groups = [];
                const processedIds = new Set();
                const processedSourceIds = new Set();
                
                filteredTx.forEach(tx => {
                  if (processedIds.has(tx.id)) return;
                  
                  if (tx.isRecurring && tx.sourceId) {
                    // Vérifier si ce sourceId a déjà été traité
                    if (processedSourceIds.has(tx.sourceId)) return;
                    processedSourceIds.add(tx.sourceId);
                    
                    // Groupe récurrent : trouver toutes les occurrences
                    const allGroup = filteredTx.filter(t => t.sourceId === tx.sourceId);
                    // Filtrer selon la fenêtre temporelle
                    const group = filterByTimeWindow(allGroup, tx.frequency);
                    group.forEach(g => processedIds.add(g.id));
                    if (group.length > 0) {
                      groups.push({
                        type: "recurring",
                        sourceId: tx.sourceId,
                        desc: tx.desc,
                        cat: tx.cat,
                        txType: tx.type,
                        frequency: tx.frequency,
                        transactions: group.sort((a, b) => a.date.localeCompare(b.date)),
                      });
                    }
                  } else if (!tx.isRecurring && tx.frequency && tx.frequency !== "once") {
                    // Groupe manuelle avec fréquence
                    const allGroup = filteredTx.filter(t => t.desc === tx.desc && t.frequency === tx.frequency && !t.isRecurring);
                    // Filtrer selon la fenêtre temporelle
                    const group = filterByTimeWindow(allGroup, tx.frequency);
                    group.forEach(g => processedIds.add(g.id));
                    if (group.length > 0) {
                      groups.push({
                        type: "frequency",
                        desc: tx.desc,
                        cat: tx.cat,
                        txType: tx.type,
                        frequency: tx.frequency,
                        transactions: group.sort((a, b) => a.date.localeCompare(b.date)),
                      });
                    }
                  } else {
                    // Transaction unique
                    processedIds.add(tx.id);
                    groups.push({
                      type: "single",
                      transactions: [tx],
                    });
                  }
                });
                
                return groups.map((group, gIdx) => {
                  const firstTx = group.transactions[0];
                  const isLoanTx = firstTx.isLoan && firstTx.sourceType === "recurring";
                  
                  return (
                    <div key={gIdx} style={{ marginBottom: 16, background: C.faint, borderRadius: 10, border: `1px solid ${C.border}`, overflow: "hidden" }}>
                      {/* Header du groupe */}
                      <div style={{ padding: "12px 16px", background: group.type === "recurring" ? `${C.indigo}08` : group.type === "frequency" ? `${C.teal}08` : C.card, borderBottom: `1px solid ${C.border}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                          <div style={{ width: 28, height: 28, borderRadius: 6, background: firstTx.type === "income" ? `${C.green}15` : `${C.red}12`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 800, color: firstTx.type === "income" ? C.green : C.red }}>
                            {firstTx.type === "income" ? "IN" : "OUT"}
                          </div>
                          <div>
                            <div style={{ fontSize: 12.5, fontWeight: 700, color: C.text }}>{group.desc || firstTx.desc}</div>
                            <div style={{ fontSize: 10, color: C.muted }}>
                              {group.type === "recurring" && (firstTx.autoLabel || "Récurrent")}
                              {group.type === "frequency" && TX_FREQUENCIES.find(f => f.id === group.frequency)?.label || group.frequency}
                              {group.type === "single" && "Opération unique"}
                            </div>
                          </div>
                        </div>
                        <div style={{ fontSize: 10, color: C.muted }}>{group.transactions.length} occurrence{group.transactions.length > 1 ? "s" : ""}</div>
                      </div>
                      
                      {/* Défilement horizontal des transactions */}
                      <div style={{ display: "flex", overflowX: "auto", padding: "12px", gap: 10, scrollbarWidth: "thin" }}>
                        {group.transactions.map((tx, tIdx) => {
                          const displayAmt = tx.displayAmount !== undefined ? Math.abs(tx.displayAmount) : Math.abs(tx.amount);
                          const isRecurringTx = tx.isRecurring || tx.sourceType === "recurring";
                          const isPending = isRecurringTx && (tx.paymentStatus === "pending" || !tx.paymentStatus);
                          const isCurrentMonth = tx.date.slice(0, 7) === monthKeyFromDate(now);
                          const isNextMonth = new Date(tx.date.slice(0, 7)) > new Date(monthKeyFromDate(now));
                          
                          return (
                            <div key={tx.id} style={{ 
                              minWidth: 180, 
                              flexShrink: 0,
                              padding: "12px", 
                              borderRadius: 8, 
                              background: (() => {
                                const txDate = new Date(tx.date);
                                const today = new Date();
                                today.setHours(0, 0, 0, 0);
                                const txDateOnly = new Date(txDate.getFullYear(), txDate.getMonth(), txDate.getDate());
                                
                                if (tx.frequency === "yearly") {
                                  const txYear = txDate.getFullYear();
                                  const currentYear = today.getFullYear();
                                  const yearDiff = txYear - currentYear;
                                  if (yearDiff === 0) return "#10B98120"; // vert - année actuelle
                                  if (yearDiff === 1) return "#F59E0B20"; // jaune/marron - année prochaine
                                  if (yearDiff < 0) return "#EF444420"; // rouge - année passée
                                  return C.card;
                                } else if (tx.frequency === "weekly") {
                                  const txWeekStart = new Date(txDate);
                                  txWeekStart.setDate(txDate.getDate() - (txDate.getDay() === 0 ? 6 : txDate.getDay() - 1));
                                  txWeekStart.setHours(0, 0, 0, 0);
                                  const currentWeekStart = new Date(today);
                                  currentWeekStart.setDate(today.getDate() - (today.getDay() === 0 ? 6 : today.getDay() - 1));
                                  currentWeekStart.setHours(0, 0, 0, 0);
                                  const weekDiff = (txWeekStart - currentWeekStart) / (7 * 24 * 60 * 60 * 1000);
                                  if (weekDiff === 0) return "#10B98120"; // vert - semaine actuelle
                                  if (weekDiff === 1) return "#F59E0B20"; // jaune/marron - semaine prochaine
                                  if (weekDiff < 0) return "#EF444420"; // rouge - semaine passée
                                  return C.card;
                                } else if (tx.frequency === "monthly") {
                                  const txMonth = txDate.getMonth();
                                  const txYear = txDate.getFullYear();
                                  const currentMonth = today.getMonth();
                                  const currentYear = today.getFullYear();
                                  const monthDiff = (txYear - currentYear) * 12 + (txMonth - currentMonth);
                                  if (monthDiff === 0) return "#10B98120"; // vert - mois actuel
                                  if (monthDiff === 1) return "#F59E0B20"; // jaune/marron - mois prochain
                                  if (monthDiff < 0) return "#EF444420"; // rouge - mois passé
                                  return C.card;
                                } else {
                                  const dayDiff = (txDateOnly - today) / (24 * 60 * 60 * 1000);
                                  if (dayDiff === 0) return "#10B98120"; // vert - aujourd'hui
                                  if (dayDiff === 1) return "#F59E0B20"; // jaune/marron - demain
                                  if (dayDiff < 0) return "#EF444420"; // rouge - passé
                                  return C.card;
                                }
                              })(),
                              border: (() => {
                                const txDate = new Date(tx.date);
                                const today = new Date();
                                today.setHours(0, 0, 0, 0);
                                const txDateOnly = new Date(txDate.getFullYear(), txDate.getMonth(), txDate.getDate());
                                
                                if (tx.frequency === "yearly") {
                                  const txYear = txDate.getFullYear();
                                  const currentYear = today.getFullYear();
                                  const yearDiff = txYear - currentYear;
                                  if (yearDiff === 0) return "#10B98160"; // vert - année actuelle
                                  if (yearDiff === 1) return "#F59E0B60"; // jaune/marron - année prochaine
                                  if (yearDiff < 0) return "#EF444460"; // rouge - année passée
                                  return `1px solid ${C.border}`;
                                } else if (tx.frequency === "weekly") {
                                  const txWeekStart = new Date(txDate);
                                  txWeekStart.setDate(txDate.getDate() - (txDate.getDay() === 0 ? 6 : txDate.getDay() - 1));
                                  txWeekStart.setHours(0, 0, 0, 0);
                                  const currentWeekStart = new Date(today);
                                  currentWeekStart.setDate(today.getDate() - (today.getDay() === 0 ? 6 : today.getDay() - 1));
                                  currentWeekStart.setHours(0, 0, 0, 0);
                                  const weekDiff = (txWeekStart - currentWeekStart) / (7 * 24 * 60 * 60 * 1000);
                                  if (weekDiff === 0) return "#10B98160"; // vert - semaine actuelle
                                  if (weekDiff === 1) return "#F59E0B60"; // jaune/marron - semaine prochaine
                                  if (weekDiff < 0) return "#EF444460"; // rouge - semaine passée
                                  return `1px solid ${C.border}`;
                                } else if (tx.frequency === "monthly") {
                                  const txMonth = txDate.getMonth();
                                  const txYear = txDate.getFullYear();
                                  const currentMonth = today.getMonth();
                                  const currentYear = today.getFullYear();
                                  const monthDiff = (txYear - currentYear) * 12 + (txMonth - currentMonth);
                                  if (monthDiff === 0) return "#10B98160"; // vert - mois actuel
                                  if (monthDiff === 1) return "#F59E0B60"; // jaune/marron - mois prochain
                                  if (monthDiff < 0) return "#EF444460"; // rouge - mois passé
                                  return `1px solid ${C.border}`;
                                } else {
                                  const dayDiff = (txDateOnly - today) / (24 * 60 * 60 * 1000);
                                  if (dayDiff === 0) return "#10B98160"; // vert - aujourd'hui
                                  if (dayDiff === 1) return "#F59E0B60"; // jaune/marron - demain
                                  if (dayDiff < 0) return "#EF444460"; // rouge - passé
                                  return `1px solid ${C.border}`;
                                }
                              })(),
                              position: "relative",
                            }}>
                              {isNextMonth && (
                                <div style={{ position: "absolute", top: 6, right: 6, fontSize: 9, color: C.muted, fontWeight: 700 }}>À venir</div>
                              )}
                              <div style={{ fontSize: 10, color: (() => {
                                const txDate = new Date(tx.date);
                                const today = new Date();
                                today.setHours(0, 0, 0, 0);
                                const txDateOnly = new Date(txDate.getFullYear(), txDate.getMonth(), txDate.getDate());
                                
                                if (tx.frequency === "yearly") {
                                  const txYear = txDate.getFullYear();
                                  const currentYear = today.getFullYear();
                                  const yearDiff = txYear - currentYear;
                                  if (yearDiff === 0) return "#10B981"; // vert - année actuelle
                                  if (yearDiff === 1) return "#F59E0B"; // jaune/marron - année prochaine
                                  if (yearDiff < 0) return "#EF4444"; // rouge - année passée
                                  return C.muted;
                                } else if (tx.frequency === "weekly") {
                                  const txWeekStart = new Date(txDate);
                                  txWeekStart.setDate(txDate.getDate() - (txDate.getDay() === 0 ? 6 : txDate.getDay() - 1));
                                  txWeekStart.setHours(0, 0, 0, 0);
                                  
                                  const currentWeekStart = new Date(today);
                                  currentWeekStart.setDate(today.getDate() - (today.getDay() === 0 ? 6 : today.getDay() - 1));
                                  currentWeekStart.setHours(0, 0, 0, 0);
                                  
                                  const weekDiff = (txWeekStart - currentWeekStart) / (7 * 24 * 60 * 60 * 1000);
                                  if (weekDiff === 0) return "#10B981"; // vert - semaine actuelle
                                  if (weekDiff === 1) return "#F59E0B"; // jaune/marron - semaine prochaine
                                  if (weekDiff < 0) return "#EF4444"; // rouge - semaine passée
                                  return C.muted;
                                } else if (tx.frequency === "monthly") {
                                  const txMonth = txDate.getMonth();
                                  const txYear = txDate.getFullYear();
                                  const currentMonth = today.getMonth();
                                  const currentYear = today.getFullYear();
                                  const monthDiff = (txYear - currentYear) * 12 + (txMonth - currentMonth);
                                  if (monthDiff === 0) return "#10B981"; // vert - mois actuel
                                  if (monthDiff === 1) return "#F59E0B"; // jaune/marron - mois prochain
                                  if (monthDiff < 0) return "#EF4444"; // rouge - mois passé
                                  return C.muted;
                                } else {
                                  const dayDiff = (txDateOnly - today) / (24 * 60 * 60 * 1000);
                                  if (dayDiff === 0) return "#10B981"; // vert - aujourd'hui
                                  if (dayDiff === 1) return "#F59E0B"; // jaune/marron - demain
                                  if (dayDiff < 0) return "#EF4444"; // rouge - passé
                                  return C.muted;
                                }
                              })(), marginBottom: 4 }}>
                                {tx.frequency === "weekly" ? (() => {
                                  const txDate = new Date(tx.date);
                                  
                                  // Trouver le début de la semaine de la transaction (lundi)
                                  const txWeekStart = new Date(txDate);
                                  txWeekStart.setDate(txDate.getDate() - (txDate.getDay() === 0 ? 6 : txDate.getDay() - 1));
                                  txWeekStart.setHours(0, 0, 0, 0);
                                  
                                  // Calculer le numéro de semaine dans l'année (ISO week)
                                  const getWeekNumber = (d) => {
                                    const date = new Date(d);
                                    date.setHours(0, 0, 0, 0);
                                    date.setDate(date.getDate() + 4 - (date.getDay() || 7));
                                    const yearStart = new Date(date.getFullYear(), 0, 1);
                                    const weekNo = Math.ceil((((date - yearStart) / 86400000) + 1) / 7);
                                    return weekNo;
                                  };
                                  
                                  const weekNumber = getWeekNumber(txWeekStart);
                                  
                                  // Fin de la semaine de la transaction (samedi)
                                  const txWeekEnd = new Date(txWeekStart);
                                  txWeekEnd.setDate(txWeekStart.getDate() + 6);
                                  
                                  const formatDate = (d) => d.toLocaleDateString("fr-FR", { day: "2-digit", month: "2-digit" });
                                  const weekLabel = `S${String(weekNumber).padStart(2, "0")}`;
                                  
                                  return `${weekLabel} (${formatDate(txWeekStart)} - ${formatDate(txWeekEnd)})`;
                                })() : tx.frequency === "daily" ? (() => {
                                  const txDate = new Date(tx.date);
                                  return txDate.toLocaleDateString("fr-FR", { day: "2-digit", month: "2-digit", year: "numeric" });
                                })() : new Date(tx.date).toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric" })}
                              </div>
                              <div style={{ fontSize: 13, fontWeight: 800, color: isPending ? C.muted : tx.type === "income" ? C.green : C.red, marginBottom: 6 }}>
                                {isPending ? "—" : (tx.type === "income" ? "+" : "-") + fmt(displayAmt, currency, rates)}
                              </div>
                              {isRecurringTx && (
                                <div style={{ marginTop: 6 }}>
                                  <div style={{ display: "flex", gap: 3, marginBottom: 3 }}>
                                    <button
                                      onClick={() => {
                                        const key = tx.monthKey || (tx.frequency === "daily" ? tx.date : tx.date.slice(0,7));
                                        tx.sourceType === "job"
                                          ? setJobPaymentStatus(tx.sourceId, key, "on_time")
                                          : setRecurringPaymentStatus(tx.sourceId, key, "on_time");
                                      }}
                                      style={{ flex:1, padding:"2px 4px", borderRadius:4, border:`1px solid ${tx.paymentStatus==="on_time"?C.green:C.border}`, background:tx.paymentStatus==="on_time"?`${C.green}15`:C.card, color:tx.paymentStatus==="on_time"?C.green:C.muted, fontSize:8, fontWeight:700, cursor:"pointer", whiteSpace:"nowrap" }}
                                    >
                                      {tx.type === "income" ? "✓ Reçu" : "✓ Payé"}
                                    </button>
                                    <button
                                      onClick={() => {
                                        const key = tx.monthKey || (tx.frequency === "daily" ? tx.date : tx.date.slice(0,7));
                                        tx.sourceType === "job"
                                          ? setJobPaymentStatus(tx.sourceId, key, "late")
                                          : setRecurringPaymentStatus(tx.sourceId, key, "late");
                                      }}
                                      style={{ flex:1, padding:"2px 4px", borderRadius:4, border:`1px solid ${tx.paymentStatus==="late"?C.amber:C.border}`, background:tx.paymentStatus==="late"?`${C.amber}15`:C.card, color:tx.paymentStatus==="late"?C.amber:C.muted, fontSize:8, fontWeight:700, cursor:"pointer", whiteSpace:"nowrap" }}
                                    >
                                      ⚠ Retard
                                    </button>
                                  </div>
                                  {tx.paymentStatus && tx.paymentStatus !== "pending" && (
                                    <button
                                      onClick={() => {
                                        const key = tx.monthKey || (tx.frequency === "daily" ? tx.date : tx.date.slice(0,7));
                                        tx.sourceType === "job"
                                          ? setJobPaymentStatus(tx.sourceId, key, "pending")
                                          : setRecurringPaymentStatus(tx.sourceId, key, "pending");
                                      }}
                                      style={{ width:"100%", padding:"2px 4px", borderRadius:4, border:`1px solid ${C.border}`, background:C.card, color:C.muted, fontSize:8, fontWeight:700, cursor:"pointer" }}
                                    >
                                      ↩ Annuler
                                    </button>
                                  )}
                                </div>
                              )}
                              {!tx.isRecurring && (
                                <div style={{ display: "flex", gap: 4 }}>
                                  <button onClick={() => openEditTx(tx)} style={{ width: 22, height: 22, borderRadius: 4, background: `${C.blue}15`, border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: C.blue }}><Edit2 size={9} /></button>
                                  <button onClick={() => deleteTx(tx.id)} style={{ width: 22, height: 22, borderRadius: 4, background: `${C.red}15`, border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: C.red }}><Trash2 size={9} /></button>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                });
              })()}
            </div>
          </div>

          {/* Opérations à venir - Prévision des prochaines échéances */}
          <div style={{ background: C.card, borderRadius: 12, border: `1px solid ${C.border}`, overflow: "hidden", marginBottom: 14 }}>
            <div style={{ padding: "16px 18px", borderBottom: `1px solid ${C.border}` }}>
              <h3 style={{ fontSize: 13.5, fontWeight: 800, color: C.text }}>Opérations à venir</h3>
              <p style={{ fontSize: 11, color: C.muted }}>Prévision des prochaines échéances (M+1, J+1, S+1)</p>
            </div>
            <div style={{ padding: "14px 18px" }}>
              {(() => {
                // Calculer les opérations à venir
                const upcomingOps = [];
                const today = new Date();
                const currentDay = today.getDate();
                const currentMonth = today.getMonth();
                const currentYear = today.getFullYear();
                
                recurringItems.filter(item => item.active).forEach(item => {
                  const amount = Math.abs(Number(item.amount) || 0);
                  const dayOfMonth = Number(item.dayOfMonth) || 1;
                  const type = item.type; // 'income' ou 'expense'
                  
                  // Déterminer la période et le label
                  let periodLabel = "";
                  let nextDate = null;
                  let daysUntil = 0;
                  
                  // Calculer la prochaine date selon le jour du mois
                  if (dayOfMonth > currentDay) {
                    // Ce mois-ci
                    nextDate = new Date(currentYear, currentMonth, dayOfMonth);
                    periodLabel = "M";
                    daysUntil = dayOfMonth - currentDay;
                  } else {
                    // Mois prochain
                    nextDate = new Date(currentYear, currentMonth + 1, dayOfMonth);
                    periodLabel = "M+1";
                    daysUntil = Math.ceil((nextDate - today) / (1000 * 60 * 60 * 24));
                  }
                  
                  // Ajuster le label selon la proximité
                  if (daysUntil <= 1) periodLabel = "J+1";
                  else if (daysUntil <= 7) periodLabel = `J+${daysUntil}`;
                  else if (daysUntil <= 14) periodLabel = "S+1";
                  else if (daysUntil <= 21) periodLabel = "S+2";
                  else if (daysUntil <= 28) periodLabel = "S+3";
                  
                  upcomingOps.push({
                    ...item,
                    periodLabel,
                    nextDate,
                    daysUntil,
                    amount,
                    displayDate: nextDate.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })
                  });
                });
                
                // Trier par nombre de jours jusqu'à l'échéance
                upcomingOps.sort((a, b) => a.daysUntil - b.daysUntil);
                
                if (upcomingOps.length === 0) {
                  return <div style={{ fontSize: 12, color: C.muted, textAlign: "center", padding: "20px" }}>Aucune opération récurrente active</div>;
                }
                
                return upcomingOps.map((op, i) => (
                  <div key={op.id} style={{ 
                    display: "flex", 
                    alignItems: "center", 
                    gap: 12, 
                    padding: "10px 0", 
                    borderBottom: i < upcomingOps.length - 1 ? `1px solid ${C.border}` : "none"
                  }}>
                    {/* Badge période */}
                    <div style={{ 
                      minWidth: 50,
                      padding: "4px 8px", 
                      borderRadius: 6, 
                      background: op.type === "expense" ? `${C.red}15` : `${C.green}15`,
                      border: `1px solid ${op.type === "expense" ? C.red : C.green}`,
                      textAlign: "center"
                    }}>
                      <span style={{ 
                        fontSize: 11, 
                        fontWeight: 800, 
                        color: op.type === "expense" ? C.red : C.green 
                      }}>{op.periodLabel}</span>
                    </div>
                    
                    {/* Description */}
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 12, fontWeight: 600, color: C.text }}>{op.desc}</div>
                      <div style={{ fontSize: 10, color: C.muted }}>{op.displayDate} · {op.cat}</div>
                    </div>
                    
                    {/* Montant */}
                    <div style={{ 
                      fontSize: 13, 
                      fontWeight: 800, 
                      color: op.type === "expense" ? C.red : C.green 
                    }}>
                      {op.type === "expense" ? "-" : "+"}{f(op.amount)}
                    </div>
                  </div>
                ));
              })()}
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  // 🎯🎯 GOALS VIEW 🎯🎯🎯🎯🎯🎯🎯🎯🎯🎯🎯🎯🎯🎯🎯🎯🎯🎯🎯🎯🎯🎯🎯🎯🎯🎯🎯🎯🎯🎯🎯🎯🎯🎯🎯🎯🎯🎯🎯🎯🎯🎯🎯🎯🎯🎯🎯🎯🎯🎯🎯🎯🎯🎯🎯🎯🎯🎯🎯?

  // ── VUE : OBJECTIFS ───────────────────────────────────────────────────
  const GoalsView = () => (
    <div style={{ flex: 1, overflowY: "auto", height: "100vh" }}>
      <PageHeader title="Objectifs Financiers" sub="Suivez votre progression vers vos objectifs"
        actions={<button onClick={openNewGoal} style={{ display: "flex", alignItems: "center", gap: 6, padding: "7px 14px", background: C.indigo, color: "#fff", border: "none", borderRadius: 8, fontSize: 12.5, fontWeight: 700, cursor: "pointer" }}><Plus size={14} /> Nouvel objectif</button>}
      />
      <div style={{ padding: "22px 28px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        {goals.map(g => {
          const pct = Math.round((g.saved / g.target) * 100);
          const remaining = g.target - g.saved;
          const monthly = Math.ceil(remaining / 12);
          return (
            <div key={g.id} style={{ background: C.card, borderRadius: 14, padding: "24px", border: `1px solid ${C.border}`, boxShadow: "0 1px 6px rgba(0,0,0,0.05)", borderTop: `4px solid ${g.color}` }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <div style={{ width: 44, height: 44, borderRadius: 12, background: `${g.color}16`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22 }}>{g.emoji}</div>
                  <div>
                    <div style={{ fontSize: 15, fontWeight: 800, color: C.text }}>{g.name}</div>
                    <div style={{ fontSize: 11.5, color: C.muted, marginTop: 2 }}>Echeance : {g.deadline}</div>
                  </div>
                </div>
                <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                  <div style={{ background: `${g.color}16`, color: g.color, fontSize: 15, fontWeight: 900, padding: "6px 12px", borderRadius: 8 }}>{pct}%</div>
                  <button onClick={() => openEditGoal(g)} style={{ width: 28, height: 28, borderRadius: 7, background: `${C.blue}15`, border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: C.blue }}><Edit2 size={12} /></button>
                  <button onClick={() => deleteGoal(g.id)} style={{ width: 28, height: 28, borderRadius: 7, background: `${C.red}15`, border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: C.red }}><Trash2 size={12} /></button>
                </div>
              </div>
              <div style={{ marginBottom: 14 }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
                  <span style={{ fontSize: 12, color: C.muted }}>Epargne</span>
                  <span style={{ fontSize: 12, color: C.muted }}>Objectif</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
                  <span style={{ fontSize: 15, fontWeight: 800, color: g.color }}>{f(g.saved)}</span>
                  <span style={{ fontSize: 15, fontWeight: 800, color: C.text }}>{f(g.target)}</span>
                </div>
                <div style={{ height: 10, background: C.faint, borderRadius: 5, overflow: "hidden" }}>
                  <div style={{ width: `${Math.min(pct, 100)}%`, height: "100%", background: `linear-gradient(90deg,${g.color}BB,${g.color})`, borderRadius: 5, transition: "width 0.6s ease" }} />
                </div>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", paddingTop: 14, borderTop: `1px solid ${C.faint}` }}>
                <div>
                  <div style={{ fontSize: 11, color: C.muted, marginBottom: 2 }}>Il manque</div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: C.text }}>{f(remaining)}</div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontSize: 11, color: C.muted, marginBottom: 2 }}>Mensualité suggérée</div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: g.color }}>{f(monthly)} / mois</div>
                </div>
              </div>
            </div>
          );
        })}
        {/* Add goal card */}
        <div onClick={openNewGoal} style={{ background: C.faint, borderRadius: 14, padding: "24px", border: `2px dashed ${C.border}`, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 12, cursor: "pointer", minHeight: 200 }}>
          <div style={{ width: 48, height: 48, borderRadius: 12, background: `${C.indigo}15`, display: "flex", alignItems: "center", justifyContent: "center" }}><Plus size={22} color={C.indigo} /></div>
          <div style={{ fontSize: 14, fontWeight: 700, color: C.indigo }}>Ajouter un objectif</div>
        </div>
      </div>
    </div>
  );

  // �"?�"? SUIVI TAF �"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?

  // ── VUE : SUIVI TAF ───────────────────────────────────────────────────
  const SuiviTafView = () => {
    const statusCounts = JOB_STATUSES.reduce((acc, s) => {
      acc[s.id] = jobs.filter(j => j.status === s.id).length;
      return acc;
    }, {});

    const statusById = JOB_STATUSES.reduce((acc, s) => {
      acc[s.id] = s;
      return acc;
    }, {});

    const OPEN_STATUSES = ["applied", "pending", "interview", "offer"];
    const HOT_STATUSES = ["interview", "offer", "accepted"];
    const PIPELINE_STATUSES = ["applied", "pending", "interview", "offer", "accepted", "rejected"];

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const DAY_MS = 24 * 60 * 60 * 1000;

    const normalizeJobDate = (raw) => {
      if (!raw) return null;
      const d = new Date(raw);
      if (Number.isNaN(d.getTime())) return null;
      d.setHours(0, 0, 0, 0);
      return d;
    };

    const jobsWithInsights = jobs.map(job => {
      const appliedDateObj = normalizeJobDate(job.appliedDate);
      const ageDays = appliedDateObj ? Math.max(0, Math.floor((today - appliedDateObj) / DAY_MS)) : null;
      const salary = Math.abs(Number(job.salary) || 0);
      const salaryCurrency = job.salaryCurrency || "MGA";
      const salaryMGA = salary <= 0 ? 0 : salaryCurrency === "MGA" ? salary : salary * (rates[salaryCurrency] || 1);
      return { ...job, appliedDateObj, ageDays, salaryMGA };
    });

    const totalJobs = jobsWithInsights.length;
    const openJobsCount = jobsWithInsights.filter(job => OPEN_STATUSES.includes(job.status)).length;
    const hotJobsCount = jobsWithInsights.filter(job => HOT_STATUSES.includes(job.status)).length;
    const progressedJobsCount = jobsWithInsights.filter(job => job.status !== "applied").length;
    const staleJobsCount = jobsWithInsights.filter(job => OPEN_STATUSES.includes(job.status) && (job.ageDays ?? -1) >= 10).length;
    const recent7DaysCount = jobsWithInsights.filter(job => job.appliedDateObj && (today - job.appliedDateObj) / DAY_MS <= 7).length;

    const jobsWithSalary = jobsWithInsights.filter(job => job.salaryMGA > 0);
    const totalPotentialSalaryMGA = jobsWithSalary.reduce((sum, job) => sum + job.salaryMGA, 0);
    const avgPotentialSalaryMGA = jobsWithSalary.length > 0 ? totalPotentialSalaryMGA / jobsWithSalary.length : 0;

    const activeAutoIncomeJobs = jobsWithInsights.filter(job =>
      job.status === "accepted" &&
      job.paymentAutoAdd &&
      job.paymentMode !== "none" &&
      job.salaryMGA > 0
    );
    const monthlyAutoIncomeMGA = activeAutoIncomeJobs.reduce((sum, job) => {
      if (job.paymentMode === "monthly") return sum + job.salaryMGA;
      return sum;
    }, 0);

    const responseRate = totalJobs > 0 ? Math.round((progressedJobsCount / totalJobs) * 100) : 0;
    const interviewRate = totalJobs > 0 ? Math.round(((statusCounts.interview + statusCounts.offer + statusCounts.accepted) / totalJobs) * 100) : 0;
    const offerRate = totalJobs > 0 ? Math.round(((statusCounts.offer + statusCounts.accepted) / totalJobs) * 100) : 0;
    const acceptedRate = totalJobs > 0 ? Math.round((statusCounts.accepted / totalJobs) * 100) : 0;

    const followUpQueue = jobsWithInsights
      .filter(job => OPEN_STATUSES.includes(job.status))
      .map(job => {
        const statusBoost = job.status === "offer" ? 80 : job.status === "interview" ? 65 : job.status === "pending" ? 45 : 30;
        const ageBoost = Math.min(40, Math.max(0, (job.ageDays ?? 0) * 2));
        const salaryBoost = job.salaryMGA > 0 ? 12 : 0;
        const priorityScore = statusBoost + ageBoost + salaryBoost;
        return { ...job, priorityScore };
      })
      .sort((a, b) => b.priorityScore - a.priorityScore)
      .slice(0, 6);

    const weekdayLabels = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"];
    const weekdayCounts = weekdayLabels.map((label, idx) => ({ label, idx, count: 0 }));
    jobsWithInsights.forEach(job => {
      if (!job.appliedDateObj) return;
      const diffDays = Math.floor((today - job.appliedDateObj) / DAY_MS);
      if (diffDays < 0 || diffDays > 13) return;
      const weekdayMondayIndex = (job.appliedDateObj.getDay() + 6) % 7;
      weekdayCounts[weekdayMondayIndex].count += 1;
    });
    const maxWeekdayCount = Math.max(1, ...weekdayCounts.map(day => day.count));

    const platformStats = platforms
      .map(platform => {
        const entries = jobsWithInsights.filter(job => job.platform === platform.id);
        const count = entries.length;
        const hot = entries.filter(job => HOT_STATUSES.includes(job.status)).length;
        const accepted = entries.filter(job => job.status === "accepted").length;
        const avgAge = entries.length > 0
          ? Math.round(entries.reduce((sum, job) => sum + (job.ageDays ?? 0), 0) / entries.length)
          : 0;
        return { ...platform, count, hot, accepted, avgAge };
      })
      .filter(platform => platform.count > 0)
      .sort((a, b) => b.count - a.count);

    const setJobStatus = (jobId, nextStatus) => {
      setJobs(prev => prev.map(job => job.id === jobId ? { ...job, status: nextStatus } : job));
    };

    const statusActionOrder = ["applied", "pending", "interview", "offer", "accepted", "rejected", "withdrawn"];

    return (
      <div style={{ flex: 1, overflowY: "auto", height: "100vh" }}>
        <PageHeader title="Suivi de Taf" sub="Candidatures, missions freelance et opportunites"
          actions={<button onClick={openNewJob} style={{ display: "flex", alignItems: "center", gap: 6, padding: "7px 14px", background: C.indigo, color: "#fff", border: "none", borderRadius: 8, fontSize: 12.5, fontWeight: 700, cursor: "pointer" }}><Plus size={14} /> Ajouter candidature</button>}
        />
        <div style={{ padding: "22px 28px" }}>

          {/* Status KPIs */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", gap: 8, marginBottom: 14 }}>
            {JOB_STATUSES.map(s => (
              <div key={s.id} onClick={() => setJobFilter(jobFilter === s.id ? "all" : s.id)} style={{ background: jobFilter === s.id ? s.bg : C.card, borderRadius: 10, padding: "12px", border: `1.5px solid ${jobFilter === s.id ? s.color : C.border}`, cursor: "pointer", textAlign: "center" }}>
                <div style={{ fontSize: 18, marginBottom: 4 }}>{s.icon}</div>
                <div style={{ fontSize: 18, fontWeight: 900, color: s.color }}>{statusCounts[s.id] || 0}</div>
                <div style={{ fontSize: 10, color: C.muted, marginTop: 2 }}>{s.label}</div>
              </div>
            ))}
          </div>

          {/* Executive metrics */}
          <div style={{ background: C.card, borderRadius: 12, padding: "16px 18px", border: `1px solid ${C.border}`, marginBottom: 20 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12, gap: 10 }}>
              <div>
                <h3 style={{ fontSize: 13.5, fontWeight: 800, color: C.text, marginBottom: 3 }}>Pilotage des candidatures</h3>
                <p style={{ fontSize: 11, color: C.muted }}>Vue consolidée: conversion, rythme de prospection et potentiel revenu</p>
              </div>
              <span style={{ fontSize: 11, fontWeight: 700, color: C.indigo, background: `${C.indigo}12`, border: `1px solid ${C.indigo}35`, borderRadius: 999, padding: "4px 10px" }}>
                {totalJobs} dossiers actifs/historisés
              </span>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(150px,1fr))", gap: 8 }}>
              {[
                { label: "Taux de réponse", value: `${responseRate}%`, sub: `${progressedJobsCount}/${totalJobs || 0} dossiers`, color: C.blue },
                { label: "Taux entretien+", value: `${interviewRate}%`, sub: `${statusCounts.interview + statusCounts.offer + statusCounts.accepted} opportunités`, color: C.purple },
                { label: "Taux d'offre", value: `${offerRate}%`, sub: `${statusCounts.offer + statusCounts.accepted} dossiers`, color: C.teal },
                { label: "Taux d'acceptation", value: `${acceptedRate}%`, sub: `${statusCounts.accepted} dossiers validés`, color: C.green },
                { label: "Candidatures cette semaine", value: `${recent7DaysCount}`, sub: "7 derniers jours", color: C.indigo },
                { label: "Dossiers en attente > 10j", value: `${staleJobsCount}`, sub: "relance recommandée", color: C.amber },
                { label: "Ticket moyen visé", value: f(avgPotentialSalaryMGA || 0), sub: `${jobsWithSalary.length} dossiers avec salaire`, color: C.blue },
                { label: "Potentiel mensuel auto", value: f(monthlyAutoIncomeMGA), sub: `${activeAutoIncomeJobs.length} revenus auto actifs`, color: C.green },
              ].map((card, idx) => (
                <div key={idx} style={{ border: `1px solid ${C.border}`, borderRadius: 10, background: C.faint, padding: "10px 11px" }}>
                  <div style={{ fontSize: 10, color: C.muted, marginBottom: 4 }}>{card.label}</div>
                  <div style={{ fontSize: 15, fontWeight: 900, color: card.color, marginBottom: 2 }}>{card.value}</div>
                  <div style={{ fontSize: 10, color: C.muted }}>{card.sub}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Pipeline + follow-up queue */}
          <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 14, marginBottom: 20 }}>
            <div style={{ background: C.card, borderRadius: 12, border: `1px solid ${C.border}`, padding: "16px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                <h3 style={{ fontSize: 13.5, fontWeight: 800, color: C.text }}>Pipeline opérationnel</h3>
                <span style={{ fontSize: 10.5, color: C.muted }}>{openJobsCount} dossiers ouverts</span>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(6,minmax(0,1fr))", gap: 8 }}>
                {PIPELINE_STATUSES.map(statusId => {
                  const statusMeta = statusById[statusId];
                  const statusJobs = jobsWithInsights
                    .filter(job => job.status === statusId)
                    .sort((a, b) => (b.appliedDateObj?.getTime() || 0) - (a.appliedDateObj?.getTime() || 0))
                    .slice(0, 3);
                  return (
                    <div key={statusId} style={{ border: `1px solid ${C.border}`, borderRadius: 10, background: C.faint, padding: 8 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 7 }}>
                        <span style={{ fontSize: 10, fontWeight: 700, color: statusMeta?.color }}>{statusMeta?.label}</span>
                        <span style={{ fontSize: 10, color: C.muted }}>{statusCounts[statusId] || 0}</span>
                      </div>
                      {statusJobs.length === 0 ? (
                        <div style={{ fontSize: 10, color: C.muted, opacity: 0.7, padding: "8px 2px" }}>Aucun</div>
                      ) : statusJobs.map(job => (
                        <div key={job.id} style={{ border: `1px solid ${C.border}`, borderLeft: `3px solid ${statusMeta?.color || C.border}`, borderRadius: 7, background: C.card, padding: "6px 7px", marginBottom: 6 }}>
                          <div style={{ fontSize: 10.5, fontWeight: 700, color: C.text, lineHeight: 1.25 }}>{job.title}</div>
                          <div style={{ fontSize: 9.5, color: C.muted, marginTop: 3 }}>
                            {job.company || "Entreprise"} {job.ageDays !== null ? `• ${job.ageDays}j` : ""}
                          </div>
                        </div>
                      ))}
                    </div>
                  );
                })}
              </div>
            </div>

            <div style={{ background: C.card, borderRadius: 12, border: `1px solid ${C.border}`, padding: "16px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                <h3 style={{ fontSize: 13.5, fontWeight: 800, color: C.text }}>Priorités de relance</h3>
                <span style={{ fontSize: 10.5, color: C.muted }}>{followUpQueue.length} cibles</span>
              </div>
              {followUpQueue.length === 0 ? (
                <div style={{ fontSize: 11, color: C.muted, textAlign: "center", padding: "30px 8px" }}>Aucune relance prioritaire</div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
                  {followUpQueue.map(job => {
                    const statusMeta = statusById[job.status];
                    const urgencyColor = (job.ageDays ?? 0) >= 14 ? C.red : (job.ageDays ?? 0) >= 8 ? C.amber : C.blue;
                    return (
                      <div key={job.id} style={{ border: `1px solid ${C.border}`, borderRadius: 9, padding: "8px 9px", background: C.faint }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8 }}>
                          <div style={{ minWidth: 0 }}>
                            <div style={{ fontSize: 11, fontWeight: 700, color: C.text, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{job.title}</div>
                            <div style={{ fontSize: 10, color: C.muted, marginTop: 2 }}>
                              {job.company || "Entreprise"} • {statusMeta?.label || "Suivi"}
                            </div>
                          </div>
                          <span style={{ fontSize: 10, fontWeight: 700, color: urgencyColor, background: `${urgencyColor}15`, border: `1px solid ${urgencyColor}50`, borderRadius: 6, padding: "2px 7px" }}>
                            {job.ageDays === null ? "n/a" : `${job.ageDays}j`}
                          </span>
                        </div>
                        {job.salaryMGA > 0 && (
                          <div style={{ fontSize: 10, color: C.green, marginTop: 5, fontWeight: 700 }}>Potentiel: {f(job.salaryMGA)}</div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Weekly pace + platform performance */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 20 }}>
            <div style={{ background: C.card, borderRadius: 12, border: `1px solid ${C.border}`, padding: "16px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                <h3 style={{ fontSize: 13.5, fontWeight: 800, color: C.text }}>Rythme de candidature (14 jours)</h3>
                <span style={{ fontSize: 10.5, color: C.muted }}>{recent7DaysCount} cette semaine</span>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(7, minmax(0,1fr))", gap: 7 }}>
                {weekdayCounts.map(day => (
                  <div key={day.label} style={{ textAlign: "center" }}>
                    <div style={{ height: 58, borderRadius: 8, background: C.faint, border: `1px solid ${C.border}`, display: "flex", alignItems: "flex-end", justifyContent: "center", paddingBottom: 6 }}>
                      <div style={{ width: "65%", height: `${Math.max(4, Math.round((day.count / maxWeekdayCount) * 44))}px`, borderRadius: 6, background: day.count > 0 ? C.indigo : C.border, transition: "height 0.25s ease" }} />
                    </div>
                    <div style={{ fontSize: 10, color: C.muted, marginTop: 5 }}>{day.label}</div>
                    <div style={{ fontSize: 11, color: C.text, fontWeight: 700 }}>{day.count}</div>
                  </div>
                ))}
              </div>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 10 }}>
                <span style={{ fontSize: 10.5, color: C.muted, background: C.faint, border: `1px solid ${C.border}`, borderRadius: 999, padding: "4px 8px" }}>
                  Objectif recommandé: 5+ candidatures / semaine
                </span>
                <span style={{ fontSize: 10.5, color: C.muted, background: C.faint, border: `1px solid ${C.border}`, borderRadius: 999, padding: "4px 8px" }}>
                  Opportunités chaudes: {hotJobsCount}
                </span>
              </div>
            </div>

            <div style={{ background: C.card, borderRadius: 12, border: `1px solid ${C.border}`, padding: "16px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                <h3 style={{ fontSize: 13.5, fontWeight: 800, color: C.text }}>Performance par plateforme</h3>
                <span style={{ fontSize: 10.5, color: C.muted }}>{platformStats.length} plateformes utilisées</span>
              </div>
              {platformStats.length === 0 ? (
                <div style={{ fontSize: 11, color: C.muted, textAlign: "center", padding: "28px 8px" }}>Aucune candidature liée à une plateforme pour le moment</div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
                  {platformStats.slice(0, 6).map(platform => (
                    <div key={platform.id} style={{ border: `1px solid ${C.border}`, borderRadius: 9, background: C.faint, padding: "8px 10px" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8 }}>
                        <div style={{ minWidth: 0 }}>
                          <div style={{ fontSize: 11.5, color: platform.color, fontWeight: 800, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                            {platform.emoji} {platform.name}
                          </div>
                          <div style={{ fontSize: 10, color: C.muted, marginTop: 2 }}>
                            {platform.count} candidatures • {platform.hot} chaudes • {platform.accepted} acceptées
                          </div>
                        </div>
                        <div style={{ fontSize: 10, color: C.muted, background: C.card, border: `1px solid ${C.border}`, borderRadius: 6, padding: "3px 7px" }}>
                          Age moyen: {platform.avgAge}j
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Platforms */}
          <div style={{ background: C.card, borderRadius: 12, padding: "20px", border: `1px solid ${C.border}`, marginBottom: 20 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, marginBottom: 16 }}>
              <div>
                <h3 style={{ fontSize: 13.5, fontWeight: 800, color: C.text, marginBottom: 4 }}>Plateformes Freelance et Emploi</h3>
                <p style={{ fontSize: 11, color: C.muted }}>Accès rapide aux plateformes cibles, avec suivi conversion et ciblage opportunités</p>
              </div>
              <button onClick={openNewPlatform} style={{ display: "flex", alignItems: "center", gap: 6, padding: "7px 14px", background: C.indigo, color: "#fff", border: "none", borderRadius: 8, fontSize: 12, fontWeight: 700, cursor: "pointer" }}>
                <Plus size={14} /> Ajouter plateforme
              </button>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 10 }}>
              {platforms.map(p => (
                <div key={p.id} style={{ textDecoration: "none", display: "flex", flexDirection: "column", gap: 8, padding: "12px", borderRadius: 10, border: `1.5px solid ${C.border}`, background: C.faint, transition: "all 0.15s" }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = p.color; e.currentTarget.style.background = `${p.color}08`; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = C.border; e.currentTarget.style.background = C.faint; }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 10 }}>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 800, color: p.color }}>{p.emoji} {p.name}</div>
                      <div style={{ fontSize: 10, color: C.muted, marginTop: 2 }}>{p.url.replace(/^https?:\/\//, "")}</div>
                    </div>
                    <div style={{ display: "flex", gap: 6 }}>
                      <a href={p.url} target="_blank" rel="noopener noreferrer" style={{ width: 28, height: 28, borderRadius: 7, background: `${C.teal}15`, display: "flex", alignItems: "center", justifyContent: "center", color: C.teal, textDecoration: "none" }}>
                        <ExternalLink size={11} />
                      </a>
                      <button onClick={() => openEditPlatform(p)} style={{ width: 28, height: 28, borderRadius: 7, background: `${C.blue}15`, border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: C.blue }}><Edit2 size={11} /></button>
                      <button onClick={() => deletePlatform(p.id)} style={{ width: 28, height: 28, borderRadius: 7, background: `${C.red}15`, border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: C.red }}><Trash2 size={11} /></button>
                    </div>
                  </div>
                  <p style={{ fontSize: 10.5, color: C.muted, lineHeight: 1.4, margin: 0 }}>{p.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Jobs list */}
          <div style={{ background: C.card, borderRadius: 12, border: `1px solid ${C.border}`, overflow: "hidden" }}>
            <div style={{ padding: "16px 20px", borderBottom: `1px solid ${C.border}`, display: "flex", gap: 10, alignItems: "center" }}>
              <h3 style={{ fontSize: 13.5, fontWeight: 800, color: C.text, flex: 1 }}>Mes Candidatures ({filteredJobs.length})</h3>
              <div style={{ display: "flex", alignItems: "center", gap: 8, background: C.faint, border: `1px solid ${C.border}`, borderRadius: 8, padding: "6px 12px" }}>
                <Search size={12} color={C.muted} />
                <input value={jobSearch} onChange={e => setJobSearch(e.target.value)} placeholder="Rechercher..." style={{ background: "none", border: "none", outline: "none", fontSize: 12, color: C.text, width: 140 }} />
              </div>
              {jobFilter !== "all" && (
                <button onClick={() => setJobFilter("all")} style={{ padding: "5px 10px", borderRadius: 6, background: C.faint, border: `1px solid ${C.border}`, fontSize: 11, color: C.muted, cursor: "pointer" }}>
                  Retirer filtre
                </button>
              )}
            </div>
            {filteredJobs.length === 0 ? (
              <div style={{ padding: "40px", textAlign: "center", color: C.muted }}>
                <div style={{ fontSize: 32, marginBottom: 10 }}>--</div>
                <div style={{ fontWeight: 700 }}>Aucune candidature trouvée</div>
              </div>
            ) : filteredJobs.map((job, i) => {
              const status = JOB_STATUSES.find(s => s.id === job.status);
              const platform = platforms.find(p => p.id === job.platform);
              const ageDays = (() => {
                const d = normalizeJobDate(job.appliedDate);
                if (!d) return null;
                return Math.max(0, Math.floor((today - d) / DAY_MS));
              })();
              return (
                <div key={job.id} style={{ padding: "16px 20px", borderBottom: i < filteredJobs.length - 1 ? `1px solid ${C.faint}` : "none", background: i % 2 === 0 ? C.card : "#FAFBFD" }}>
                  <div style={{ display: "flex", alignItems: "flex-start", gap: 14 }}>
                    <div style={{ width: 40, height: 40, borderRadius: 10, background: status?.bg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, flexShrink: 0 }}>{status?.icon}</div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 6 }}>
                        <div>
                          <div style={{ fontSize: 14, fontWeight: 800, color: C.text }}>{job.title}</div>
                          <div style={{ fontSize: 12, color: C.muted, marginTop: 2 }}>
                            {job.company && <span>{job.company}</span>}
                            {platform && <span> · {platform.emoji} {platform.name}</span>}
                            {job.type && <span style={{ marginLeft: 6, background: `${C.blue}15`, color: C.blue, padding: "2px 7px", borderRadius: 4, fontSize: 10.5, fontWeight: 700 }}>{job.type}</span>}
                          </div>
                        </div>
                        <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
                          <span style={{ background: status?.bg, color: status?.color, fontSize: 11, fontWeight: 700, padding: "4px 10px", borderRadius: 6 }}>{status?.label}</span>
                          {job.link && (
                            <a href={job.link} target="_blank" rel="noopener noreferrer" style={{ width: 28, height: 28, borderRadius: 7, background: `${C.teal}15`, border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: C.teal, textDecoration: "none" }}><ExternalLink size={11} /></a>
                          )}
                          <button onClick={() => openEditJob(job)} style={{ width: 28, height: 28, borderRadius: 7, background: `${C.blue}15`, border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: C.blue }}><Edit2 size={11} /></button>
                          <button onClick={() => deleteJob(job.id)} style={{ width: 28, height: 28, borderRadius: 7, background: `${C.red}15`, border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: C.red }}><Trash2 size={11} /></button>
                        </div>
                      </div>
                      <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                        <span style={{ fontSize: 11, color: C.muted }}>Candidat le {job.appliedDate}</span>
                        {ageDays !== null && <span style={{ fontSize: 11, color: C.muted }}>Âge dossier: {ageDays}j</span>}
                        {job.salary && <span style={{ fontSize: 11, color: C.green, fontWeight: 700 }}>{parseInt(job.salary).toLocaleString()} {CURRENCIES[job.salaryCurrency || "MGA"]?.symbol || "Ar"}</span>}
                        {job.paymentAutoAdd && job.paymentMode !== "none" && job.paymentStartDate && (
                          <span style={{ fontSize: 11, color: C.indigo, fontWeight: 700 }}>
                            Revenu auto {job.paymentMode === "monthly" ? "mensuel" : "planifié"} dès le {job.paymentStartDate}
                          </span>
                        )}
                      </div>
                      <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginTop: 8 }}>
                        {statusActionOrder.map(statusId => {
                          const actionStatus = statusById[statusId];
                          if (!actionStatus) return null;
                          const isActive = statusId === job.status;
                          return (
                            <button
                              key={statusId}
                              onClick={() => setJobStatus(job.id, statusId)}
                              style={{
                                padding: "3px 8px",
                                borderRadius: 6,
                                border: `1px solid ${isActive ? actionStatus.color : C.border}`,
                                background: isActive ? actionStatus.bg : C.card,
                                color: isActive ? actionStatus.color : C.muted,
                                fontSize: 10,
                                fontWeight: isActive ? 800 : 600,
                                cursor: isActive ? "default" : "pointer",
                              }}
                            >
                              {actionStatus.label}
                            </button>
                          );
                        })}
                      </div>
                      {job.notes && (
                        <div style={{ marginTop: 8, padding: "8px 12px", background: C.faint, borderRadius: 7, fontSize: 11.5, color: C.text, borderLeft: `3px solid ${status?.color}` }}>
                          Note: {job.notes}
                        </div>
                      )}
                      {job.status === "accepted" && !job.paymentAutoAdd && (
                        <div style={{ marginTop: 8, padding: "8px 12px", background: `${C.amber}12`, borderRadius: 7, fontSize: 11.5, color: C.text, borderLeft: `3px solid ${C.amber}` }}>
                          Pense à activer l'ajout automatique au revenu si ce poste doit alimenter tes finances à partir d'une date.
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  };

  // �"?�"? PARAMETRES �"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?

  // ── VUE : PARAMÈTRES ──────────────────────────────────────────────────
  const PlanActionView = () => {
    const normalizeText = (value = "") =>
      value.toString().toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");

    const debtKeywords = ["dette", "pret", "credit", "remboursement", "decouvert", "emprunt", "mensualite"];
    const debtRecurring = recurringItems.filter(item => {
      if (item.type !== "expense") return false;
      if (item.kind === "loan") return true;
      const cat = normalizeText(item.cat);
      const desc = normalizeText(item.desc);
      return debtKeywords.some(keyword => cat.includes(keyword) || desc.includes(keyword));
    });
    const activeDebtRecurring = debtRecurring.filter(item => item.active);
    const debtMonthlyCommitment = activeDebtRecurring.reduce((sum, item) => sum + Math.abs(Number(item.amount) || 0), 0);
    const debtLateCount = activeDebtRecurring.filter(item => {
      const monthStatus = item.paymentStatuses?.[selectedMonthKey];
      if (monthStatus === "late") return true;
      return Object.values(item.paymentStatuses || {}).includes("late");
    }).length;

    const budgetMap = new Map(
      (budgets || []).map(entry => [normalizeCategory(entry.category), Math.max(0, Number(entry.limit) || 0)])
    );
    const budgetOverruns = expenseCategories
      .map(category => {
        const limit = budgetMap.get(normalizeCategory(category.name)) || 0;
        const overrun = limit > 0 ? category.val - limit : 0;
        return { ...category, limit, overrun };
      })
      .filter(category => category.limit > 0 && category.overrun > 0)
      .sort((a, b) => b.overrun - a.overrun);

    const totalGoalsTarget = goals.reduce((sum, goal) => sum + Math.max(0, Number(goal.target) || 0), 0);
    const totalGoalsSaved = goals.reduce((sum, goal) => sum + Math.max(0, Number(goal.saved) || 0), 0);
    const goalsProgressRate = totalGoalsTarget > 0 ? Math.round((totalGoalsSaved / totalGoalsTarget) * 100) : 0;

    const emergencyGoal = goals.find(goal => {
      const name = normalizeText(goal.name);
      return name.includes("urgence") || name.includes("securite") || name.includes("emergency");
    });
    const emergencySaved = emergencyGoal ? Math.max(0, Number(emergencyGoal.saved) || 0) : 0;
    const emergencyCoverageMonths = totalExpenseRealized > 0 ? (emergencySaved / totalExpenseRealized) : 0;

    const openJobsCount = jobs.filter(job => ["applied", "pending", "interview", "offer"].includes(job.status)).length;
    const hotJobsCount = jobs.filter(job => ["interview", "offer", "accepted"].includes(job.status)).length;
    const pendingExpenseCount = selectedMonthTx.filter(tx => tx.type === "expense" && !isConfirmed(tx)).length;
    const pendingIncomeCount = selectedMonthTx.filter(tx => tx.type === "income" && !isConfirmed(tx)).length;

    const staleRates = ratesCheckedAt
      ? (Date.now() - new Date(ratesCheckedAt).getTime()) > (7 * 24 * 60 * 60 * 1000)
      : true;

    const domains = [
      { id: "cash", label: "Tresorerie", ok: projectedSavings >= 0, detail: projectedSavings >= 0 ? `Solde projete positif: ${f(projectedSavings)}` : `Deficit projete: ${f(projectedSavings)}` },
      { id: "debt", label: "Dettes", ok: activeDebtRecurring.length === 0 || debtLateCount === 0, detail: activeDebtRecurring.length === 0 ? "Aucune dette recurrente detectee" : `${activeDebtRecurring.length} dettes suivies, ${debtLateCount} en retard` },
      { id: "budget", label: "Budget", ok: budgetOverruns.length === 0, detail: budgetOverruns.length === 0 ? "Aucun depassement majeur" : `${budgetOverruns.length} categories en depassement` },
      { id: "goals", label: "Objectifs", ok: goals.length > 0 && goalsProgressRate >= 35, detail: goals.length === 0 ? "Aucun objectif actif" : `Progression moyenne: ${goalsProgressRate}%` },
      { id: "jobs", label: "Revenus futurs", ok: hotJobsCount > 0 || openJobsCount > 0, detail: `${openJobsCount} candidatures ouvertes, ${hotJobsCount} opportunites chaudes` },
      { id: "sync", label: "Donnees taux", ok: !staleRates, detail: staleRates ? "Taux de change a actualiser" : "Synchro des taux recente" },
    ];

    const planSteps = [];
    const pushStep = (priority, title, why, actions, metric) => {
      planSteps.push({ priority, title, why, actions, metric });
    };

    if (totalIncome <= 0) {
      pushStep(100, "Reinitialiser une base de revenu", "Aucun revenu du mois n'est consolide dans les donnees.", [
        "Ajouter tous les revenus fixes et variables dans Revenus.",
        "Activer au moins une source recurrente de revenu.",
        "Lier vos candidatures acceptees a un versement automatique.",
      ], "Critique");
    }
    if (projectedSavings < 0 || globalRealBalance < 0) {
      pushStep(95, "Stopper le deficit mensuel", "Votre flux actuel consomme plus que ce qui rentre.", [
        "Geler 30 jours les depenses non essentielles.",
        "Mettre un plafond strict par categorie depensee en exces.",
        "Diriger tout revenu additionnel vers le retour a solde positif.",
      ], `Deficit: ${f(projectedSavings)} / Solde global: ${f(globalRealBalance)}`);
    }
    if (activeDebtRecurring.length > 0) {
      pushStep(92, "Executer un plan dettes en cascade", "Des dettes actives reduisent votre capacite de relance.", [
        "Payer le minimum sur toutes les dettes et concentrer le surplus sur une seule priorite.",
        "Priorite recommandee: dette au taux le plus eleve (avalanche).",
        "Negocier taux, echeancier et penalites des dettes en retard cette semaine.",
      ], `${activeDebtRecurring.length} dettes actives · charge: ${f(debtMonthlyCommitment)}`);
    }
    if (budgetOverruns.length > 0) {
      const top = budgetOverruns[0];
      pushStep(85, "Corriger les categories en depassement", "Les depassements repetes empechent la stabilisation.", [
        `Reduire immediatement ${top.name} de ${f(top.overrun)} le mois prochain.`,
        "Mettre des budgets realistes sur toutes les categories principales.",
        "Verifier les depenses journalieres avant validation.",
      ], `${budgetOverruns.length} depassements actifs`);
    }
    if (goals.length === 0 || goalsProgressRate < 35) {
      pushStep(75, "Reposer une trajectoire d'epargne claire", "Sans objectifs dates et chiffres, la discipline baisse.", [
        "Creer 3 objectifs: urgence, reduction dette, projet long terme.",
        "Automatiser un virement d'epargne le jour d'entree de revenu.",
        "Fixer une revue mensuelle du progres et ajuster le montant.",
      ], goals.length === 0 ? "0 objectif actif" : `Progression ${goalsProgressRate}%`);
    }
    if (emergencyCoverageMonths < 1) {
      pushStep(70, "Constituer un matelas de securite", "L'absence de reserve force a reprendre du credit au moindre choc.", [
        "Objectif initial: 1 mois de depenses essentielles, puis 3 mois.",
        "Creer un objectif dedie 'Fonds d'urgence'.",
        "Interdire les retraits de ce fonds hors urgence reelle.",
      ], `Couverture actuelle: ${emergencyCoverageMonths.toFixed(1)} mois`);
    }
    if (openJobsCount < 3) {
      pushStep(62, "Augmenter le pipeline de revenus futurs", "Le nombre de pistes actives est trop faible.", [
        "Lancer 5 nouvelles candidatures ciblees cette semaine.",
        "Prioriser les offres avec paiement recurrent ou mission longue.",
        "Suivre chaque candidature avec statut et date de relance.",
      ], `${openJobsCount} candidatures ouvertes`);
    }
    if (pendingExpenseCount > 0 || pendingIncomeCount > 0) {
      pushStep(58, "Assainir les statuts de paiement", "Des statuts non confirmes brouillent vos indicateurs.", [
        "Valider les paiements recents (paid/on_time) dans transactions et recurrents.",
        "Marquer explicitement les retards pour visualiser le vrai risque.",
        "Faire ce nettoyage chaque fin de semaine.",
      ], `${pendingIncomeCount} revenus et ${pendingExpenseCount} depenses en attente`);
    }
    if (staleRates) {
      pushStep(40, "Mettre a jour les taux de change", "Des taux anciens faussent la valeur des revenus en devise.", [
        "Actualiser les taux dans Parametres.",
        "Verifier l'impact sur revenus USD/EUR et objectifs MGA.",
      ], "Derniere synchro > 7 jours");
    }
    if (planSteps.length === 0) {
      pushStep(30, "Maintenir la cadence actuelle", "Les indicateurs principaux sont globalement sains.", [
        "Poursuivre les automatisations actuelles.",
        "Monter progressivement le taux d'epargne de 1 a 2 points.",
        "Conserver la revue hebdo et mensuelle.",
      ], "Plan stable");
    }

    const orderedPlan = planSteps.sort((a, b) => b.priority - a.priority);
    const urgentPlan = orderedPlan.slice(0, 3);

    return (
      <div style={{ flex: 1, overflowY: "auto", height: "100vh" }}>
        <PageHeader title="Plan d'action intelligent" sub="Demarches personnalisees selon toutes vos donnees FinTrack" actions={<></>} />
        <div style={{ padding: "22px 28px", display: "grid", gap: 14 }}>
          <div style={{ background: C.card, borderRadius: 12, border: `1px solid ${C.border}`, padding: "16px 18px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
              <div>
                <div style={{ fontSize: 14, fontWeight: 800, color: C.text }}>Priorites de la periode</div>
                <div style={{ fontSize: 11, color: C.muted, marginTop: 3 }}>Analyse basee sur revenus, depenses, budgets, objectifs, dettes, recurrents, candidatures et projections.</div>
              </div>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                <span style={{ fontSize: 11, fontWeight: 700, color: C.indigo, background: `${C.indigo}12`, border: `1px solid ${C.indigo}35`, borderRadius: 999, padding: "4px 10px" }}>{orderedPlan.length} demarches generees</span>
                <span style={{ fontSize: 11, fontWeight: 700, color: C.muted, background: C.faint, border: `1px solid ${C.border}`, borderRadius: 999, padding: "4px 10px" }}>Epargne projetee: {savingsRate}%</span>
              </div>
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(170px,1fr))", gap: 8 }}>
            {domains.map(domain => (
              <div key={domain.id} style={{ background: C.card, borderRadius: 10, border: `1px solid ${domain.ok ? `${C.green}55` : `${C.amber}55`}`, padding: "10px 11px" }}>
                <div style={{ fontSize: 10.5, color: C.muted, marginBottom: 4 }}>{domain.label}</div>
                <div style={{ fontSize: 12.5, fontWeight: 800, color: domain.ok ? C.green : C.amber, marginBottom: 3 }}>{domain.ok ? "Sous controle" : "A surveiller"}</div>
                <div style={{ fontSize: 10.5, color: C.text }}>{domain.detail}</div>
              </div>
            ))}
          </div>

          <div style={{ background: C.card, borderRadius: 12, border: `1px solid ${C.border}`, padding: "16px 18px" }}>
            <div style={{ fontSize: 13.5, fontWeight: 800, color: C.text, marginBottom: 10 }}>Actions a executer maintenant (Top 3)</div>
            <div style={{ display: "grid", gap: 8 }}>
              {urgentPlan.map((step, idx) => (
                <div key={`${step.title}-${idx}`} style={{ background: C.faint, borderRadius: 10, border: `1px solid ${C.border}`, padding: "10px 12px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8, marginBottom: 6 }}>
                    <div style={{ fontSize: 12.5, fontWeight: 800, color: C.text }}>{step.title}</div>
                    <span style={{ fontSize: 10, fontWeight: 700, color: C.indigo, background: `${C.indigo}12`, border: `1px solid ${C.indigo}35`, borderRadius: 6, padding: "2px 7px" }}>Priorite {step.priority}</span>
                  </div>
                  <div style={{ fontSize: 11, color: C.muted, marginBottom: 6 }}>{step.why}</div>
                  <div style={{ display: "grid", gap: 4 }}>
                    {step.actions.map((action, actionIdx) => (
                      <div key={actionIdx} style={{ fontSize: 11.5, color: C.text }}>{actionIdx + 1}. {action}</div>
                    ))}
                  </div>
                  <div style={{ marginTop: 6, fontSize: 10.5, color: C.muted }}>Indicateur: {step.metric}</div>
                </div>
              ))}
            </div>
          </div>

          <div style={{ background: C.card, borderRadius: 12, border: `1px solid ${C.border}`, padding: "16px 18px" }}>
            <div style={{ fontSize: 13.5, fontWeight: 800, color: C.text, marginBottom: 10 }}>Plan detaille (tous criteres pris en compte)</div>
            <div style={{ display: "grid", gap: 8 }}>
              {orderedPlan.map((step, idx) => (
                <div key={`${step.title}-full-${idx}`} style={{ border: `1px solid ${C.border}`, borderRadius: 10, padding: "10px 12px", background: idx % 2 ? C.faint : C.card }}>
                  <div style={{ display: "flex", justifyContent: "space-between", gap: 10, flexWrap: "wrap", marginBottom: 4 }}>
                    <div style={{ fontSize: 12.5, fontWeight: 800, color: C.text }}>{step.title}</div>
                    <div style={{ fontSize: 10.5, color: C.muted }}>{step.metric}</div>
                  </div>
                  <div style={{ fontSize: 11, color: C.muted, marginBottom: 5 }}>{step.why}</div>
                  <div style={{ fontSize: 11.5, color: C.text }}>{step.actions.join("  |  ")}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  };

  const ParametresView = () => (
    <div style={{ flex: 1, overflowY: "auto", height: "100vh" }}>
      <PageHeader title="Paramètres" sub="Configuration de votre espace FinTrack" actions={<></>} />
      <div style={{ padding: "22px 28px" }}>
        <div style={{ background: C.card, borderRadius: 12, padding: "24px", border: `1px solid ${C.border}`, marginBottom: 14 }}>
          <h3 style={{ fontSize: 14, fontWeight: 800, color: C.text, marginBottom: 16 }}>Profil</h3>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
            {[
              { label: "Nom complet", key: "fullName" },
              { label: "Email", key: "email" },
              { label: "Telephone", key: "phone" },
              { label: "Localisation", key: "location" },
            ].map(f => (
              <div key={f.key}>
                <label style={labelStyle}>{f.label}</label>
                <input value={profile[f.key]} onChange={e => setProfile(p => ({ ...p, [f.key]: e.target.value }))} style={inputStyle} />
              </div>
            ))}
          </div>
        </div>
        <div style={{ background: C.card, borderRadius: 12, padding: "24px", border: `1px solid ${C.border}`, marginBottom: 14 }}>
          <h3 style={{ fontSize: 14, fontWeight: 800, color: C.text, marginBottom: 4 }}>Devises et taux</h3>
          <p style={{ fontSize: 11.5, color: C.muted, marginBottom: 16 }}>Les taux sont exprimés en Ariary (MGA) pour 1 unité de devise étrangère.</p>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 14 }}>
            <div>
              <label style={labelStyle}>Devise d'affichage par défaut</label>
              <SearchableCurrencySelect value={currency} onChange={setCurrency} fullWidth />
            </div>
            <div style={{ display: "flex", alignItems: "flex-end" }}>
              <button onClick={fetchRates} style={{ display: "flex", alignItems: "center", gap: 8, padding: "9px 16px", background: C.indigo, color: "#fff", border: "none", borderRadius: 8, fontSize: 13, fontWeight: 700, cursor: "pointer", width: "100%" }}>
                <RefreshCw size={14} style={{ animation: ratesLoading ? "spin 1s linear infinite" : "none" }} />
                {ratesLoading ? "Actualisation..." : "Actualiser tous les taux"}
              </button>
            </div>
          </div>
          <div style={{ marginBottom: 14, border: `1px solid ${C.border}`, borderRadius: 10, overflow: "hidden", background: C.faint }}>
            <button
              type="button"
              onClick={() => setShowRatesMenu(prev => !prev)}
              style={{ width: "100%", padding: "10px 12px", border: "none", background: "transparent", display: "flex", justifyContent: "space-between", alignItems: "center", cursor: "pointer", fontFamily: "inherit" }}
            >
              <span style={{ fontSize: 12.5, fontWeight: 800, color: C.text }}>Menu déroulant des taux</span>
              <span style={{ fontSize: 11, color: C.muted }}>{showRatesMenu ? "▲ Masquer" : "▼ Ouvrir"}</span>
            </button>
            {showRatesMenu && (
              <div style={{ padding: "10px 12px 12px", background: C.card, borderTop: `1px solid ${C.border}` }}>
                <input
                  type="text"
                  value={ratesSearch}
                  onChange={e => setRatesSearch(e.target.value)}
                  placeholder="Rechercher une devise…"
                  style={{ ...inputStyle, marginBottom: 10 }}
                />
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 10 }}>
                  {filteredRatesEntries.length === 0 && (
                    <div style={{ fontSize: 11.5, color: C.muted }}>Aucune devise ne correspond à la recherche.</div>
                  )}
                  {filteredRatesEntries.map(([k, v]) => (
                    <div key={k} style={{ background: C.faint, borderRadius: 9, padding: "10px 12px", border: `1px solid ${C.border}` }}>
                      <div style={{ fontSize: 11, fontWeight: 800, color: C.muted, marginBottom: 5 }}>
                        {v.flag} 1 {k} = ? Ar
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                        <input
                          type="number"
                          value={rates[k] || DEFAULT_RATES_EXTENDED[k] || ""}
                          onChange={e => setRates(r => ({ ...r, [k]: +e.target.value }))}
                          style={{ ...inputStyle, padding: "5px 8px", fontSize: 12, flex: 1 }}
                        />
                        <span style={{ fontSize: 11, color: C.muted, whiteSpace: "nowrap" }}>Ar</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
          <div style={{ display: "grid", gap: 6 }}>
            <p style={{ fontSize: 11, color: C.green }}>Dernière synchro : {ratesCheckedLabel}</p>
            <p style={{ fontSize: 11, color: C.muted }}>Source : {ratesSourceLabel}</p>
            <p style={{ fontSize: 11, color: C.muted }}>Rafraîchissement automatique toutes les 15 min.</p>
          </div>
        </div>
        <div style={{ background: C.card, borderRadius: 12, padding: "24px", border: `1px solid ${C.border}`, marginBottom: 14 }}>
          <h3 style={{ fontSize: 14, fontWeight: 800, color: C.text, marginBottom: 16 }}>Apparence et options pro</h3>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18 }}>
            <div>
              {!isNeonDesign && (
                <>
                  <label style={labelStyle}>Ambiance visuelle</label>
                  <div style={{ display: "grid", gap: 8, marginBottom: 16 }}>
                    {Object.values(THEME_PRESETS).map(theme => (
                      <button key={theme.id} onClick={() => setThemeMode(theme.id)} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 12px", borderRadius: 10, border: `1px solid ${themeMode === theme.id ? C.indigo : C.border}`, background: themeMode === theme.id ? `${C.indigo}10` : C.faint, color: themeMode === theme.id ? C.indigo : C.text, fontSize: 12, fontWeight: 700, cursor: "pointer" }}>
                        <span>{theme.label}</span>
                        <span style={{ display: "flex", gap: 5 }}>
                          <span style={{ width: 12, height: 12, borderRadius: "50%", background: theme.sidebar, display: "inline-block" }} />
                          <span style={{ width: 12, height: 12, borderRadius: "50%", background: theme.bg, border: `1px solid ${theme.border}`, display: "inline-block" }} />
                        </span>
                      </button>
                    ))}
                  </div>
                </>
              )}
              <label style={labelStyle}>Design de fond</label>
              <div style={{ display: "grid", gap: 8, marginBottom: 16 }}>
                {APP_DESIGN_PRESETS.map((design) => (
                  <button
                    key={design.id}
                    onClick={() => setAppDesign(design.id)}
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      gap: 10,
                      padding: "10px 12px",
                      borderRadius: 10,
                      border: `1px solid ${appDesign === design.id ? C.indigo : C.border}`,
                      background: appDesign === design.id ? `${C.indigo}10` : C.faint,
                      color: appDesign === design.id ? C.indigo : C.text,
                      fontSize: 12,
                      fontWeight: 700,
                      cursor: "pointer",
                      textAlign: "left",
                    }}
                  >
                    <span>{design.label}</span>
                    <span style={{ fontSize: 10.5, color: appDesign === design.id ? C.indigo : C.muted }}>
                      {design.description}
                    </span>
                  </button>
                ))}
              </div>
              {!isNeonDesign && (
                <>
                  <label style={labelStyle}>Couleur principale</label>
                  <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                    {ACCENT_OPTIONS.map(color => (
                      <button key={color} onClick={() => setAccentColor(color)} style={{ width: 34, height: 34, borderRadius: "50%", border: accentColor === color ? `3px solid ${C.text}` : `1px solid ${C.border}`, background: color, cursor: "pointer" }} />
                    ))}
                  </div>
                </>
              )}
            </div>
            <div>
              <label style={labelStyle}>Options d'affichage</label>
              <div style={{ display: "grid", gap: 10, marginBottom: 16 }}>
                <button 
                  onClick={() => setShowFloatingBalance(!showFloatingBalance)}
                  style={{ 
                    display: "flex", 
                    justifyContent: "space-between", 
                    alignItems: "center", 
                    padding: "12px 14px", 
                    borderRadius: 10, 
                    border: `1px solid ${C.border}`, 
                    background: C.faint, 
                    cursor: "pointer" 
                  }}
                >
                  <span style={{ fontSize: 12, fontWeight: 700, color: C.text }}>Solde flottant</span>
                  <span style={{ fontSize: 11, color: showFloatingBalance ? C.green : C.muted }}>
                    {showFloatingBalance ? "✓ Visible" : "✗ Masqué"}
                  </span>
                </button>
              </div>
              <label style={labelStyle}>Vue professionnelle</label>
              <div style={{ display: "grid", gap: 10 }}>
                <div style={{ background: C.faint, borderRadius: 10, padding: "12px 14px", border: `1px solid ${C.border}` }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: C.text }}>Automatisations actives</div>
                  <div style={{ fontSize: 11, color: C.muted, marginTop: 4 }}>{recurringItems.filter(item => item.active).length} opérations mensuelles, {platforms.length} plateformes suivies</div>
                </div>
                <div style={{ background: C.faint, borderRadius: 10, padding: "12px 14px", border: `1px solid ${C.border}` }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: C.text }}>Pilotage recrutement</div>
                  <div style={{ fontSize: 11, color: C.muted, marginTop: 4 }}>{jobs.filter(job => ["interview", "offer", "accepted"].includes(job.status)).length} opportunités chaudes en suivi</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── Couleurs des graphiques ── */}
        <div style={{ background: C.card, borderRadius: 12, padding: "20px 24px", border: `1px solid ${C.border}`, marginBottom: 14, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <div style={{ display: "flex", gap: 6 }}>
              {[chartColors.income, chartColors.expense, chartColors.savings, ...CATEGORY_META.map(c => categoryColors[c.name] || CATEGORY_COLOR_MAP[c.name])].map((col, i) => (
                <div key={i} style={{ width: 14, height: 14, borderRadius: "50%", background: col, flexShrink: 0 }} />
              ))}
            </div>
            <div>
              <div style={{ fontSize: 13, fontWeight: 800, color: C.text }}>Couleurs des graphiques</div>
              <div style={{ fontSize: 11, color: C.muted }}>Courbes · Catégories · Budget</div>
            </div>
          </div>
          <button
            onClick={() => setShowColorModal(true)}
            style={{ display: "flex", alignItems: "center", gap: 7, padding: "8px 16px", background: C.indigo, color: "#fff", border: "none", borderRadius: 9, fontSize: 12.5, fontWeight: 700, cursor: "pointer" }}
          >
            🎨 Personnaliser
          </button>
        </div>

        {/* ── Données ── */}
        <div style={{ background: C.card, borderRadius: 12, padding: "24px", border: `1px solid ${C.border}`, marginBottom: 14 }}>
          <h3 style={{ fontSize: 14, fontWeight: 800, color: C.text, marginBottom: 8 }}>Données</h3>
          <p style={{ fontSize: 12, color: C.green, marginBottom: 8 }}>Sauvegarde automatique active · Dernière sauvegarde : {lastSavedLabel}</p>
          <p style={{ fontSize: 12, color: C.muted, marginBottom: 16 }}>{txList.length} transactions manuelles · {recurringItems.length} récurrences · {goals.length} objectifs · {jobs.length} candidatures · {platforms.length} plateformes</p>
          <div style={{ display: "flex", gap: 10 }}>
            <button onClick={() => { if(window.confirm("Effacer toutes les transactions ?")) setTxList([]); }} style={{ padding: "8px 16px", background: `${C.red}15`, border: `1px solid ${C.red}30`, borderRadius: 8, fontSize: 12.5, color: C.red, fontWeight: 700, cursor: "pointer" }}>
              Effacer transactions
            </button>
            <button onClick={() => { if(window.confirm("Effacer toutes les récurrences ?")) setRecurringItems([]); }} style={{ padding: "8px 16px", background: `${C.amber}15`, border: `1px solid ${C.amber}30`, borderRadius: 8, fontSize: 12.5, color: C.amber, fontWeight: 700, cursor: "pointer" }}>
              Effacer récurrences
            </button>
          </div>
        </div>


      </div>
    </div>
  );


  // ── MODALS ────────────────────────────────────────────────────────────
  const ColorModal = () => (
    <div style={{ position: "fixed", inset: 0, background: "rgba(11,24,41,0.65)", zIndex: 1100, display: "flex", alignItems: "center", justifyContent: "center" }} onClick={() => setShowColorModal(false)}>
      <div style={{ background: C.card, borderRadius: 18, padding: "28px", width: 520, maxHeight: "88vh", overflowY: "auto", border: `1px solid ${C.border}`, boxShadow: "0 24px 70px rgba(0,0,0,0.28)" }} onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
          <div>
            <h2 style={{ fontSize: 16, fontWeight: 800, color: C.text }}>🎨 Couleurs des graphiques</h2>
            <p style={{ fontSize: 11.5, color: C.muted, marginTop: 2 }}>Les changements s'appliquent en temps réel</p>
          </div>
          <button onClick={() => setShowColorModal(false)} style={{ width: 32, height: 32, borderRadius: 8, background: C.faint, border: "none", cursor: "pointer", color: C.muted, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <X size={15} />
          </button>
        </div>

        {/* Catégories */}
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
            <div style={{ fontSize: 11, fontWeight: 800, color: C.muted, textTransform: "uppercase", letterSpacing: "0.07em" }}>Catégories</div>
            <button
              onClick={() => setCategoryColors(Object.fromEntries(CATEGORY_META.map(c => [c.name, c.color])))}
              style={{ fontSize: 10.5, fontWeight: 700, color: C.indigo, background: `${C.indigo}12`, border: `1px solid ${C.indigo}30`, borderRadius: 6, padding: "3px 10px", cursor: "pointer" }}
            >
              Réinitialiser
            </button>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {CATEGORY_META.map(({ name }) => {
              const current = categoryColors[name] || CATEGORY_COLOR_MAP[name];
              return (
                <label key={name} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 14px", background: C.faint, borderRadius: 10, border: `1px solid ${C.border}`, cursor: "pointer" }}>
                  <div style={{ width: 12, height: 12, borderRadius: "50%", background: current, flexShrink: 0 }} />
                  <span style={{ flex: 1, fontSize: 13, fontWeight: 700, color: C.text }}>{name}</span>
                  <span style={{ fontSize: 11, color: C.muted, fontFamily: "monospace", marginRight: 8 }}>{current}</span>
                  <div style={{ width: 36, height: 36, borderRadius: 10, background: current, border: `3px solid ${current}`, boxShadow: `0 3px 10px ${current}55`, overflow: "hidden", flexShrink: 0, position: "relative" }}>
                    <input
                      type="color"
                      value={current}
                      onChange={e => setCategoryColors(prev => ({ ...prev, [name]: e.target.value }))}
                      style={{ position: "absolute", inset: "-4px", width: "calc(100% + 8px)", height: "calc(100% + 8px)", border: "none", padding: 0, cursor: "pointer", opacity: 1 }}
                    />
                  </div>
                </label>
              );
            })}
          </div>
        </div>

        <button onClick={() => setShowColorModal(false)} style={{ width: "100%", marginTop: 22, padding: "11px", background: C.indigo, color: "#fff", border: "none", borderRadius: 10, fontSize: 13, fontWeight: 800, cursor: "pointer" }}>
          Fermer
        </button>
      </div>
    </div>
  );

  const TransactionWizard = () => {
    const slideWidth = 520;
    const isFormSlide = wizardSlide === 1;
    
    return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(11,24,41,0.85)", backdropFilter: "blur(6px)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden", animation: "fadeIn 0.3s ease" }}>
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
      `}</style>
      {/* Conteneur des deux slides - commence à 520px puis s'agrandit à 1040px */}
      <div style={{ 
        display: "flex", 
        width: isFormSlide ? slideWidth * 2 : slideWidth, 
        height: "auto",
        maxHeight: "90vh",
        transition: "width 0.4s cubic-bezier(0.4, 0, 0.2, 1), transform 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
        transform: `translateX(${isFormSlide ? -slideWidth/2 : 0}px)`,
        overflow: "hidden",
        borderRadius: 20,
        boxShadow: "0 32px 80px rgba(0,0,0,0.3)",
        animation: "scaleIn 0.3s ease",
      }}>
      <style>{`
        @keyframes scaleIn {
          from { transform: scale(0.9); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }
      `}</style>
        {/* SLIDE 1 : Menu avec les 2 boutons */}
        <div style={{ 
          width: slideWidth, 
          flexShrink: 0,
          background: C.card, 
          borderRadius: isFormSlide ? "20px 0 0 20px" : "20px", 
          padding: "28px", 
          border: `1px solid ${C.border}`, 
          borderRight: isFormSlide ? "none" : `1px solid ${C.border}`,
          opacity: isFormSlide ? 0.7 : 1,
          transition: "opacity 0.3s ease, border-radius 0.4s ease",
        }}>
          {/* Header */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24 }}>
            <div>
              <h2 style={{ fontSize: 20, fontWeight: 800, color: C.text, marginBottom: 6 }}>Nouvelle transaction</h2>
              <p style={{ fontSize: 12, color: C.muted }}>Quel type d'opération souhaitez-vous ajouter ?</p>
            </div>
            <button onClick={closeEntryHub} style={{ background: C.faint, border: "none", cursor: "pointer", color: C.muted, width: 32, height: 32, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", transition: "all 0.2s" }} onMouseEnter={(e) => e.target.style.background = C.border} onMouseLeave={(e) => e.target.style.background = C.faint}><X size={16} /></button>
          </div>

          {/* Deux boutons simples */}
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {/* Bouton ponctuel */}
            <button onClick={() => openQuickAction("expense")} style={{ textAlign: "left", padding: "22px 20px", borderRadius: 16, border: `2px solid ${hexToRgba(C.blue, 0.2)}`, background: `linear-gradient(135deg, ${hexToRgba(C.blue, 0.08)} 0%, ${C.card} 100%)`, cursor: "pointer", transition: "all 0.2s", display: "flex", alignItems: "center", gap: 16 }} onMouseEnter={(e) => { e.currentTarget.style.borderColor = C.blue; e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = `0 12px 32px ${hexToRgba(C.blue, 0.15)}`; }} onMouseLeave={(e) => { e.currentTarget.style.borderColor = hexToRgba(C.blue, 0.2); e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "none"; }}>
              <div style={{ width: 52, height: 52, borderRadius: 14, background: hexToRgba(C.blue, 0.15), display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <Zap size={26} color={C.blue} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 16, fontWeight: 800, color: C.blue, marginBottom: 4 }}>Opération ponctuelle</div>
                <div style={{ fontSize: 12, color: C.muted, lineHeight: 1.4 }}>Un seul mouvement : revenu ou dépense unique</div>
              </div>
              <ArrowRight size={20} color={C.blue} />
            </button>

            {/* Bouton récurrent */}
            <button onClick={() => openQuickAction("expense_recurring")} style={{ textAlign: "left", padding: "22px 20px", borderRadius: 16, border: `2px solid ${hexToRgba(C.indigo, 0.2)}`, background: `linear-gradient(135deg, ${hexToRgba(C.indigo, 0.08)} 0%, ${C.card} 100%)`, cursor: "pointer", transition: "all 0.2s", display: "flex", alignItems: "center", gap: 16 }} onMouseEnter={(e) => { e.currentTarget.style.borderColor = C.indigo; e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = `0 12px 32px ${hexToRgba(C.indigo, 0.15)}`; }} onMouseLeave={(e) => { e.currentTarget.style.borderColor = hexToRgba(C.indigo, 0.2); e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "none"; }}>
              <div style={{ width: 52, height: 52, borderRadius: 14, background: hexToRgba(C.indigo, 0.15), display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <Repeat size={26} color={C.indigo} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 16, fontWeight: 800, color: C.indigo, marginBottom: 4 }}>Opération récurrente</div>
                <div style={{ fontSize: 12, color: C.muted, lineHeight: 1.4 }}>Mouvement régulier : salaire, loyer, prêt...</div>
              </div>
              <ArrowRight size={20} color={C.indigo} />
            </button>
          </div>

          {/* Footer info */}
          <div style={{ marginTop: 20, padding: "12px 16px", background: C.faint, borderRadius: 10, border: `1px solid ${C.border}` }}>
            <div style={{ fontSize: 11, color: C.muted, textAlign: "center" }}>
              💡 Les récurrentes se répètent automatiquement
            </div>
          </div>
        </div>

        {/* Séparation entre les slides */}
        <div style={{
          width: 2,
          background: `linear-gradient(to bottom, transparent, ${C.border}, transparent)`,
          flexShrink: 0,
        }} />

        {/* SLIDE 2 : Formulaire */}
        <div style={{ 
          width: slideWidth - 2, 
          flexShrink: 0,
          background: C.card, 
          borderRadius: "0 20px 20px 0", 
          padding: "28px", 
          overflowY: "auto",
          maxHeight: "90vh",
        }}>
          {wizardForm === 'tx' ? (
            // Formulaire Transaction ponctuelle
            <>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 22 }}>
                <h2 style={{ fontSize: 16, fontWeight: 800, color: C.text }}>{editTx ? "Modifier la transaction" : "Nouvelle transaction"}</h2>
                <button onClick={() => { setWizardSlide(0); setWizardForm(null); setEditTx(null); }} style={{ background: C.faint, border: "none", cursor: "pointer", color: C.muted, width: 30, height: 30, borderRadius: 7, display: "flex", alignItems: "center", justifyContent: "center" }}><X size={15} /></button>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 18 }}>
                {[{ id: "expense", label: "Depense", col: C.red }, { id: "income", label: "Revenu", col: C.green }].map(t => (
                  <button key={t.id} onClick={() => setForm(f => ({ ...f, type: t.id, cat: t.id === "income" ? "Revenu" : (f.cat === "Revenu" ? "Alimentation" : f.cat) }))} style={{ padding: "10px", border: `1.5px solid ${form.type === t.id ? t.col : C.border}`, borderRadius: 9, background: form.type === t.id ? `${t.col}12` : C.card, color: form.type === t.id ? t.col : C.muted, fontSize: 13, fontWeight: 700, cursor: "pointer" }}>{t.label}</button>
                ))}
              </div>
              {[
                { label: "Description", key: "desc", type: "text", placeholder: form.type === "income" ? "Ex : Salaire mensuel" : "Ex : Courses Marché Analakely" },
                { label: "Montant (Ar)", key: "amount", type: "number", placeholder: "Ex : 87000" },
                { label: "Date", key: "date", type: "date" },
              ].map(fi => (
                <div key={fi.key} style={{ marginBottom: 14 }}>
                  <label style={labelStyle}>{fi.label}</label>
                  <input type={fi.type} value={form[fi.key]} placeholder={fi.placeholder} onChange={e => setForm(p => ({ ...p, [fi.key]: e.target.value }))} style={inputStyle} />
                </div>
              ))}
              {form.type !== "income" && (
                <div style={{ marginBottom: 14 }}>
                  <label style={labelStyle}>Catégorie</label>
                  <select value={form.cat} onChange={e => setForm(p => ({ ...p, cat: e.target.value }))} style={inputStyle}>
                    {CATEGORIES.filter(c => c !== "Revenu").map(c => <option key={c}>{c}</option>)}
                  </select>
                </div>
              )}
              <div style={{ display: "flex", gap: 10, marginTop: 20 }}>
                <button onClick={() => { setWizardSlide(0); setWizardForm(null); setEditTx(null); }} style={{ flex: 1, padding: "10px", border: `1px solid ${C.border}`, borderRadius: 9, background: C.card, color: C.muted, fontSize: 13, fontWeight: 600, cursor: "pointer" }}>Retour</button>
                <button onClick={() => { addOrUpdateTx(); setWizardSlide(0); setWizardForm(null); setShowEntryHubModal(false); setEditTx(null); }} style={{ flex: 2, padding: "10px", border: "none", borderRadius: 9, background: C.indigo, color: "#fff", fontSize: 13, fontWeight: 800, cursor: "pointer" }}>{editTx ? "Mettre à jour" : "Ajouter"}</button>
              </div>
            </>
          ) : wizardForm === 'recurring' ? (
            // Formulaire Récurrent Complet
            <>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 22 }}>
                <h2 style={{ fontSize: 16, fontWeight: 800, color: C.text }}>{editRecurring ? "Modifier l'opération" : "Nouvelle opération récurrente"}</h2>
                <button onClick={() => { setWizardSlide(0); setWizardForm(null); setEditRecurring(null); }} style={{ background: C.faint, border: "none", cursor: "pointer", color: C.muted, width: 30, height: 30, borderRadius: 7, display: "flex", alignItems: "center", justifyContent: "center" }}><X size={15} /></button>
              </div>
              {/* Type - pleine largeur */}
              <div style={{ marginBottom: 14 }}>
                <label style={labelStyle}>Type</label>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                  {RECURRING_TYPE_OPTIONS.map(typeOption => (
                    <button
                      key={typeOption.id}
                      onClick={() => setRecurringForm(prev => ({
                        ...prev,
                        type: typeOption.id,
                        cat: typeOption.id === "income" ? "Revenu" : prev.cat === "Revenu" ? "Logement" : prev.cat,
                        penaltyAmount: typeOption.id === "income" ? 0 : (prev.penaltyAmount || 25000),
                      }))}
                      style={{
                        padding: "10px",
                        border: `1.5px solid ${recurringForm.type === typeOption.id ? (typeOption.id === "income" ? C.green : C.red) : C.border}`,
                        borderRadius: 9,
                        background: recurringForm.type === typeOption.id ? `${typeOption.id === "income" ? C.green : C.red}12` : C.card,
                        color: recurringForm.type === typeOption.id ? (typeOption.id === "income" ? C.green : C.red) : C.muted,
                        fontSize: 13,
                        fontWeight: 700,
                        cursor: "pointer",
                      }}
                    >
                      {typeOption.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Ligne 1: Description | Catégorie */}
              <div style={{ display: "grid", gridTemplateColumns: recurringForm.type === "income" ? "1fr" : "1fr 1fr", gap: 14, marginBottom: 14 }}>
                <div>
                  <label style={labelStyle}>Description</label>
                  <input value={recurringForm.desc} onChange={e => setRecurringForm(prev => ({ ...prev, desc: e.target.value }))} placeholder={recurringForm.type === "income" ? "Ex : Salaire mensuel" : "Ex : Remboursement prêt"} style={inputStyle} />
                </div>
                {recurringForm.type !== "income" && (
                  <div>
                    <label style={labelStyle}>Catégorie</label>
                    <select value={recurringForm.cat} onChange={e => setRecurringForm(prev => ({ ...prev, cat: e.target.value }))} style={inputStyle}>
                      {RECURRING_EXPENSE_CATEGORY_OPTIONS.map(cat => <option key={cat}>{cat}</option>)}
                    </select>
                  </div>
                )}
              </div>

              {/* Ligne 2: Montant | Pénalité */}
              <div style={{ display: "grid", gridTemplateColumns: recurringForm.type === "income" ? "1fr" : "1fr 1fr", gap: 14, marginBottom: 14 }}>
                <div>
                  <label style={labelStyle}>Montant (Ar)</label>
                  <input type="number" value={recurringForm.amount} onChange={e => setRecurringForm(prev => ({ ...prev, amount: e.target.value }))} placeholder="Ex : 250000" style={inputStyle} />
                </div>
                {recurringForm.type !== "income" && (
                  <div>
                    <label style={labelStyle}>Pénalité (Ar)</label>
                    <input type="number" value={recurringForm.penaltyAmount} onChange={e => setRecurringForm(prev => ({ ...prev, penaltyAmount: e.target.value }))} placeholder="Ex : 25000" style={inputStyle} />
                  </div>
                )}
              </div>

              {/* Ligne 3: Date de départ | Date de fin */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 14 }}>
                <div>
                  <label style={labelStyle}>Date de départ</label>
                  <input type="date" value={recurringForm.startDate} onChange={e => setRecurringForm(prev => ({ ...prev, startDate: e.target.value, dayOfMonth: new Date(e.target.value).getDate() || prev.dayOfMonth }))} style={inputStyle} />
                </div>
                <div>
                  <label style={labelStyle}>Date de fin (optionnelle)</label>
                  <input type="date" value={recurringForm.endDate} onChange={e => setRecurringForm(prev => ({ ...prev, endDate: e.target.value }))} style={inputStyle} />
                </div>
              </div>

              {/* Ligne 4: Fréquence | Statut */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 14 }}>
                <div>
                  <label style={labelStyle}>Fréquence</label>
                  <select value={recurringForm.frequency || "monthly"} onChange={e => setRecurringForm(prev => ({ ...prev, frequency: e.target.value }))} style={inputStyle}>
                    <option value="daily">Tous les jours</option>
                    <option value="weekly">Toutes les semaines</option>
                    <option value="monthly">Tous les mois</option>
                    <option value="yearly">Tous les ans</option>
                  </select>
                </div>
                <div>
                  <label style={labelStyle}>Statut</label>
                  <select value={recurringForm.active ? "active" : "paused"} onChange={e => setRecurringForm(prev => ({ ...prev, active: e.target.value === "active" }))} style={inputStyle}>
                    <option value="active">Actif</option>
                    <option value="paused">En pause</option>
                  </select>
                </div>
              </div>
              <div style={{ marginTop: 16, marginBottom: 22, background: C.faint, borderRadius: 10, padding: "12px 14px", border: `1px solid ${C.border}`, fontSize: 11.5, color: C.muted }}>
                Cette opération sera injectée automatiquement dans les chiffres, le calendrier et les statistiques chaque mois. Si c'est un prêt, tu pourras aussi marquer le paiement du mois à temps ou en retard.
              </div>
              <div style={{ display: "flex", gap: 10 }}>
                <button onClick={() => { setWizardSlide(0); setWizardForm(null); setEditRecurring(null); }} style={{ flex: 1, padding: "10px", border: `1px solid ${C.border}`, borderRadius: 9, background: C.card, color: C.muted, fontSize: 13, fontWeight: 600, cursor: "pointer" }}>Retour</button>
                <button onClick={() => { addOrUpdateRecurring(); setWizardSlide(0); setWizardForm(null); setShowEntryHubModal(false); setEditRecurring(null); }} style={{ flex: 2, padding: "10px", border: "none", borderRadius: 9, background: C.indigo, color: "#fff", fontSize: 13, fontWeight: 800, cursor: "pointer" }}>
                  {editRecurring ? "Mettre à jour" : "Enregistrer"}
                </button>
              </div>
            </>
          ) : null}
        </div>
      </div>
    </div>
  );
  };

  // �"?�"? MODAL TRANSACTION �"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?
  const TxModal = () => (
    <div style={{ position: "fixed", inset: 0, background: "rgba(11,24,41,0.65)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ background: C.card, borderRadius: 16, padding: "26px", width: 440, border: `1px solid ${C.border}`, boxShadow: "0 24px 70px rgba(0,0,0,0.25)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 22 }}>
          <h2 style={{ fontSize: 16, fontWeight: 800, color: C.text }}>{editTx ? "Modifier la transaction" : "Nouvelle Transaction"}</h2>
          <button onClick={closeTxModal} style={{ background: C.faint, border: "none", cursor: "pointer", color: C.muted, width: 30, height: 30, borderRadius: 7, display: "flex", alignItems: "center", justifyContent: "center" }}><X size={15} /></button>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 18 }}>
          {[{ id: "expense", label: "Depense", col: C.red }, { id: "income", label: "Revenu", col: C.green }].map(t => (
            <button key={t.id} onClick={() => setForm(f => ({
              ...f,
              type: t.id,
              cat: t.id === "income" ? "Revenu" : (f.cat === "Revenu" ? "Alimentation" : f.cat),
            }))} style={{
              padding: "10px", border: `1.5px solid ${form.type === t.id ? t.col : C.border}`,
              borderRadius: 9, background: form.type === t.id ? `${t.col}12` : C.card,
              color: form.type === t.id ? t.col : C.muted, fontSize: 13, fontWeight: 700, cursor: "pointer",
            }}>{t.label}</button>
          ))}
        </div>
        {[
          { label: "Description", key: "desc", type: "text", placeholder: form.type === "income" ? "Ex : Salaire mensuel" : "Ex : Courses Marché Analakely" },
          { label: "Montant (Ar)", key: "amount", type: "number", placeholder: "Ex : 87000" },
          { label: "Date", key: "date", type: "date" },
        ].map(fi => (
          <div key={fi.key} style={{ marginBottom: 14 }}>
            <label style={labelStyle}>{fi.label}</label>
            <input type={fi.type} value={form[fi.key]} placeholder={fi.placeholder} onChange={e => setForm(p => ({ ...p, [fi.key]: e.target.value }))} style={inputStyle} />
          </div>
        ))}
        {form.type !== "income" && (
          <div style={{ marginBottom: 14 }}>
            <label style={labelStyle}>Catégorie</label>
            <select value={form.cat} onChange={e => setForm(p => ({ ...p, cat: e.target.value }))} style={inputStyle}>
              {CATEGORIES.filter(c => c !== "Revenu").map(c => <option key={c}>{c}</option>)}
            </select>
          </div>
        )}
        {/* Fréquence uniquement en édition ou si récurrent */}
        {(editTx || (form.frequency && form.frequency !== "once")) && (
          <div style={{ marginBottom: 22 }}>
            <label style={labelStyle}>Fréquence</label>
            <select value={form.frequency || "once"} onChange={e => setForm(p => ({ ...p, frequency: e.target.value }))} style={inputStyle}>
              {TX_FREQUENCIES.map(f => <option key={f.id} value={f.id}>{f.label}</option>)}
            </select>
            {form.frequency && form.frequency !== "once" && (
              <div style={{ fontSize: 11, color: C.indigo, marginTop: 6, fontWeight: 600 }}>
                Impact mensuel estimé: {f(Math.abs(parseFloat(form.amount || 0)) * (TX_FREQUENCIES.find(f => f.id === form.frequency)?.multiplier || 1))}
              </div>
            )}
          </div>
        )}
        <div style={{ display: "flex", gap: 10 }}>
          <button onClick={closeTxModal} style={{ flex: 1, padding: "10px", border: `1px solid ${C.border}`, borderRadius: 9, background: C.card, color: C.muted, fontSize: 13, fontWeight: 600, cursor: "pointer" }}>Annuler</button>
          <button onClick={addOrUpdateTx} style={{ flex: 2, padding: "10px", border: "none", borderRadius: 9, background: C.indigo, color: "#fff", fontSize: 13, fontWeight: 800, cursor: "pointer" }}>
            {editTx ? "Mettre a jour" : "Ajouter"}
          </button>
        </div>
      </div>
    </div>
  );

  const GoalModal = () => (
    <div style={{ position: "fixed", inset: 0, background: "rgba(11,24,41,0.65)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ background: C.card, borderRadius: 16, padding: "26px", width: 440, border: `1px solid ${C.border}`, boxShadow: "0 24px 70px rgba(0,0,0,0.25)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 22 }}>
          <h2 style={{ fontSize: 16, fontWeight: 800, color: C.text }}>{editGoal ? "Modifier l'objectif" : "Nouvel Objectif"}</h2>
          <button onClick={closeGoalModal} style={{ background: C.faint, border: "none", cursor: "pointer", color: C.muted, width: 30, height: 30, borderRadius: 7, display: "flex", alignItems: "center", justifyContent: "center" }}><X size={15} /></button>
        </div>
        {[
          { label: "Nom de l'objectif", key: "name", type: "text", placeholder: "Ex : Voyage à Paris" },
          { label: "Montant cible (Ar)", key: "target", type: "number", placeholder: "Ex : 5000000" },
          { label: "Déjà épargné (Ar)", key: "saved", type: "number", placeholder: "Ex : 1000000" },
          { label: "Repere", key: "emoji", type: "text", placeholder: "Ex : OBJ" },
          { label: "Echeance", key: "deadline", type: "text", placeholder: "Ex : Dec 2027" },
        ].map(fi => (
          <div key={fi.key} style={{ marginBottom: 14 }}>
            <label style={labelStyle}>{fi.label}</label>
            <input type={fi.type} value={goalForm[fi.key]} placeholder={fi.placeholder} onChange={e => setGoalForm(p => ({ ...p, [fi.key]: e.target.value }))} style={inputStyle} />
          </div>
        ))}
        <div style={{ marginBottom: 22 }}>
          <label style={labelStyle}>Couleur</label>
          <div style={{ display: "flex", gap: 8 }}>
            {[C.blue, C.green, C.purple, C.indigo, C.amber, C.red, C.teal, C.pink].map(col => (
              <div key={col} onClick={() => setGoalForm(p => ({ ...p, color: col }))} style={{ width: 28, height: 28, borderRadius: "50%", background: col, cursor: "pointer", border: goalForm.color === col ? `3px solid ${C.text}` : "3px solid transparent" }} />
            ))}
          </div>
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <button onClick={closeGoalModal} style={{ flex: 1, padding: "10px", border: `1px solid ${C.border}`, borderRadius: 9, background: C.card, color: C.muted, fontSize: 13, fontWeight: 600, cursor: "pointer" }}>Annuler</button>
          <button onClick={addOrUpdateGoal} style={{ flex: 2, padding: "10px", border: "none", borderRadius: 9, background: C.indigo, color: "#fff", fontSize: 13, fontWeight: 800, cursor: "pointer" }}>
            {editGoal ? "Mettre a jour" : "Creer l'objectif"}
          </button>
        </div>
      </div>
    </div>
  );

  // �"?�"? MODAL JOB �"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?
  const JobModal = () => (
    <div style={{ position: "fixed", inset: 0, background: "rgba(11,24,41,0.65)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ background: C.card, borderRadius: 16, padding: "26px", width: 520, border: `1px solid ${C.border}`, boxShadow: "0 24px 70px rgba(0,0,0,0.25)", maxHeight: "90vh", overflowY: "auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 22 }}>
          <h2 style={{ fontSize: 16, fontWeight: 800, color: C.text }}>{editJob ? "Modifier la candidature" : "Nouvelle Candidature / Mission"}</h2>
          <button onClick={closeJobModal} style={{ background: C.faint, border: "none", cursor: "pointer", color: C.muted, width: 30, height: 30, borderRadius: 7, display: "flex", alignItems: "center", justifyContent: "center" }}><X size={15} /></button>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
          <div>
            <label style={labelStyle}>Titre du poste / mission</label>
            <input type="text" value={jobForm.title} placeholder="Ex : Gestionnaire de flux" onChange={e => setJobForm(p => ({ ...p, title: e.target.value }))} style={inputStyle} />
          </div>
          <div>
            <label style={labelStyle}>Entreprise / Client</label>
            <input type="text" value={jobForm.company} placeholder="Ex : BPO Madagascar" onChange={e => setJobForm(p => ({ ...p, company: e.target.value }))} style={inputStyle} />
          </div>
          <div>
            <label style={labelStyle}>Plateforme</label>
            <select value={jobForm.platform} onChange={e => setJobForm(p => ({ ...p, platform: e.target.value }))} style={inputStyle}>
              <option value="">Aucune plateforme</option>
              {platforms.map(p => <option key={p.id} value={p.id}>{p.emoji} {p.name}</option>)}
            </select>
          </div>
          <div>
            <label style={labelStyle}>Type de contrat</label>
            <select value={jobForm.type} onChange={e => setJobForm(p => ({ ...p, type: e.target.value }))} style={inputStyle}>
              {JOB_TYPES.map(t => <option key={t}>{t}</option>)}
            </select>
          </div>
          <div>
            <label style={labelStyle}>Statut</label>
            <select value={jobForm.status} onChange={e => setJobForm(p => ({ ...p, status: e.target.value }))} style={inputStyle}>
              {JOB_STATUSES.map(s => <option key={s.id} value={s.id}>{s.icon} {s.label}</option>)}
            </select>
          </div>
          <div>
            <label style={labelStyle}>Date de candidature</label>
            <input type="date" value={jobForm.appliedDate} onChange={e => setJobForm(p => ({ ...p, appliedDate: e.target.value }))} style={inputStyle} />
          </div>
          <div>
            <label style={labelStyle}>Montant prévu</label>
            <div style={{ display: "flex", gap: 6 }}>
              <select value={jobForm.salaryCurrency || currency} onChange={e => setJobForm(p => ({ ...p, salaryCurrency: e.target.value }))} style={{ ...inputStyle, width: "auto", minWidth: 80, flex: "0 0 auto" }}>
                {Object.entries(CURRENCIES).map(([k, v]) => <option key={k} value={k}>{v.symbol} {k}</option>)}
              </select>
              <input type="number" value={jobForm.salary} placeholder={`Ex : ${(jobForm.salaryCurrency || currency) === "MGA" ? "1500000" : (jobForm.salaryCurrency || currency) === "EUR" ? "300" : "350"}`} onChange={e => setJobForm(p => ({ ...p, salary: e.target.value }))} style={{ ...inputStyle, flex: 1 }} />
            </div>
            {(jobForm.salaryCurrency || currency) !== "MGA" && jobForm.salary && (
              <div style={{ fontSize: 10.5, color: C.muted, marginTop: 4 }}>
                ≈ {Math.round(parseFloat(jobForm.salary || 0) * (rates[(jobForm.salaryCurrency || currency)] || 1)).toLocaleString()} Ar
              </div>
            )}
          </div>
          <div>
            <label style={labelStyle}>Lien de l'offre</label>
            <input type="url" value={jobForm.link} placeholder="https://..." onChange={e => setJobForm(p => ({ ...p, link: e.target.value }))} style={inputStyle} />
          </div>
          <div>
            <label style={labelStyle}>Versement automatique</label>
            <select value={jobForm.paymentMode} onChange={e => setJobForm(p => ({ ...p, paymentMode: e.target.value, paymentAutoAdd: e.target.value === "none" ? false : p.paymentAutoAdd }))} style={inputStyle}>
              {JOB_PAYMENT_MODES.map(mode => <option key={mode.id} value={mode.id}>{mode.label}</option>)}
            </select>
          </div>
          <div>
            <label style={labelStyle}>Date du premier paiement</label>
            <input type="date" value={jobForm.paymentStartDate} onChange={e => setJobForm(p => ({ ...p, paymentStartDate: e.target.value }))} style={inputStyle} />
          </div>
          <div>
            <label style={labelStyle}>Date de fin si besoin</label>
            <input type="date" value={jobForm.paymentEndDate} onChange={e => setJobForm(p => ({ ...p, paymentEndDate: e.target.value }))} style={inputStyle} />
          </div>
          <div style={{ display: "flex", alignItems: "flex-end" }}>
            <button onClick={() => setJobForm(p => ({ ...p, paymentAutoAdd: !p.paymentAutoAdd }))} style={{ width: "100%", padding: "10px 12px", borderRadius: 8, border: `1px solid ${jobForm.paymentAutoAdd ? C.green : C.border}`, background: jobForm.paymentAutoAdd ? `${C.green}12` : C.card, color: jobForm.paymentAutoAdd ? C.green : C.muted, fontSize: 12.5, fontWeight: 700, cursor: "pointer" }}>
              {jobForm.paymentAutoAdd ? "Ajout au revenu activé" : "Activer l'ajout au revenu"}
            </button>
          </div>
        </div>
        <div style={{ marginTop: 14, marginBottom: 22 }}>
          <label style={labelStyle}>Notes / Suivi</label>
          <textarea value={jobForm.notes} placeholder="Ex : Entretien prévu le 20 mai, rappeler si pas de nouvelles..." onChange={e => setJobForm(p => ({ ...p, notes: e.target.value }))} style={{ ...inputStyle, minHeight: 80, resize: "vertical" }} />
        </div>
        <div style={{ marginBottom: 18, background: C.faint, borderRadius: 10, padding: "12px 14px", border: `1px solid ${C.border}`, fontSize: 11.5, color: C.muted }}>
          Le revenu automatique ne s'ajoute que si le statut passe à "Accepté", qu'un montant est renseigné et qu'une date de paiement est définie.
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <button onClick={closeJobModal} style={{ flex: 1, padding: "10px", border: `1px solid ${C.border}`, borderRadius: 9, background: C.card, color: C.muted, fontSize: 13, fontWeight: 600, cursor: "pointer" }}>Annuler</button>
          <button onClick={addOrUpdateJob} style={{ flex: 2, padding: "10px", border: "none", borderRadius: 9, background: C.indigo, color: "#fff", fontSize: 13, fontWeight: 800, cursor: "pointer" }}>
            {editJob ? "Mettre a jour" : "Enregistrer"}
          </button>
        </div>
      </div>
    </div>
  );

  const RecurringModal = () => (
    <div style={{ position: "fixed", inset: 0, background: "rgba(11,24,41,0.65)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ background: C.card, borderRadius: 16, padding: "26px", width: 520, border: `1px solid ${C.border}`, boxShadow: "0 24px 70px rgba(0,0,0,0.25)", animation: "slideInFromRight 0.3s ease-out" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 22 }}>
          <h2 style={{ fontSize: 16, fontWeight: 800, color: C.text }}>{editRecurring ? "Modifier l'opération mensuelle" : "Nouvelle opération mensuelle"}</h2>
          <button onClick={closeRecurringModal} style={{ background: C.faint, border: "none", cursor: "pointer", color: C.muted, width: 30, height: 30, borderRadius: 7, display: "flex", alignItems: "center", justifyContent: "center" }}><X size={15} /></button>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
          <div>
            <label style={labelStyle}>Description</label>
            <input value={recurringForm.desc} onChange={e => setRecurringForm(prev => ({ ...prev, desc: e.target.value }))} placeholder={recurringForm.type === "income" ? "Ex : Salaire mensuel" : "Ex : Remboursement prêt"} style={inputStyle} />
          </div>
          <div>
            <label style={labelStyle}>Montant (Ar)</label>
            <input type="number" value={recurringForm.amount} onChange={e => setRecurringForm(prev => ({ ...prev, amount: e.target.value }))} placeholder="Ex : 250000" style={inputStyle} />
          </div>
          <div>
            <label style={labelStyle}>Type</label>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
              {RECURRING_TYPE_OPTIONS.map(typeOption => (
                <button
                  key={typeOption.id}
                  onClick={() => setRecurringForm(prev => ({
                    ...prev,
                    type: typeOption.id,
                    cat: typeOption.id === "income" ? "Revenu" : prev.cat === "Revenu" ? "Logement" : prev.cat,
                    penaltyAmount: typeOption.id === "income" ? 0 : (prev.penaltyAmount || 25000),
                  }))}
                  style={{
                    padding: "10px",
                    border: `1.5px solid ${recurringForm.type === typeOption.id ? (typeOption.id === "income" ? C.green : C.red) : C.border}`,
                    borderRadius: 9,
                    background: recurringForm.type === typeOption.id ? `${typeOption.id === "income" ? C.green : C.red}12` : C.card,
                    color: recurringForm.type === typeOption.id ? (typeOption.id === "income" ? C.green : C.red) : C.muted,
                    fontSize: 13,
                    fontWeight: 700,
                    cursor: "pointer",
                  }}
                >
                  {typeOption.label}
                </button>
              ))}
            </div>
          </div>
          {recurringForm.type !== "income" && (
            <div>
              <label style={labelStyle}>Catégorie</label>
              <select value={recurringForm.cat} onChange={e => setRecurringForm(prev => ({ ...prev, cat: e.target.value }))} style={inputStyle}>
                {RECURRING_EXPENSE_CATEGORY_OPTIONS.map(cat => <option key={cat}>{cat}</option>)}
              </select>
            </div>
          )}
          <div>
            <label style={labelStyle}>Date de départ</label>
            <input type="date" value={recurringForm.startDate} onChange={e => setRecurringForm(prev => ({ ...prev, startDate: e.target.value, dayOfMonth: new Date(e.target.value).getDate() || prev.dayOfMonth }))} style={inputStyle} />
          </div>
          <div>
            <label style={labelStyle}>Fréquence</label>
            <select value={recurringForm.frequency || "monthly"} onChange={e => setRecurringForm(prev => ({ ...prev, frequency: e.target.value }))} style={inputStyle}>
              {TX_FREQUENCIES.filter(f => f.id !== "once").map(f => <option key={f.id} value={f.id}>{f.label}</option>)}
            </select>
          </div>
          <div>
            <label style={labelStyle}>Jour du mois</label>
            <input type="number" min="1" max="31" value={recurringForm.dayOfMonth} onChange={e => setRecurringForm(prev => ({ ...prev, dayOfMonth: e.target.value }))} style={inputStyle} />
          </div>
          <div>
            <label style={labelStyle}>Date de fin (optionnelle)</label>
            <input type="date" value={recurringForm.endDate} onChange={e => setRecurringForm(prev => ({ ...prev, endDate: e.target.value }))} style={inputStyle} />
          </div>
          <div>
            <label style={labelStyle}>Statut</label>
            <select value={recurringForm.active ? "active" : "paused"} onChange={e => setRecurringForm(prev => ({ ...prev, active: e.target.value === "active" }))} style={inputStyle}>
              <option value="active">Actif</option>
              <option value="paused">En pause</option>
            </select>
          </div>
          <div>
            <label style={labelStyle}>Nature</label>
            <select value={recurringForm.kind} onChange={e => setRecurringForm(prev => ({ ...prev, kind: e.target.value }))} style={inputStyle}>
              <option value="standard">Standard</option>
              <option value="loan">Prêt à rembourser</option>
            </select>
          </div>
          {recurringForm.type !== "income" && (
            <div>
              <label style={labelStyle}>Pénalité de retard (Ar)</label>
              <input type="number" value={recurringForm.penaltyAmount} onChange={e => setRecurringForm(prev => ({ ...prev, penaltyAmount: e.target.value }))} placeholder="Ex : 25000" style={inputStyle} />
            </div>
          )}
          <div style={{ gridColumn: "1 / -1" }}>
            <label style={labelStyle}>Montant total à rembourser</label>
            <input type="number" value={recurringForm.loanTotalAmount} onChange={e => setRecurringForm(prev => ({ ...prev, loanTotalAmount: e.target.value }))} placeholder="Ex : 4560000" style={inputStyle} />
          </div>
        </div>
        <div style={{ marginTop: 16, marginBottom: 22, background: C.faint, borderRadius: 10, padding: "12px 14px", border: `1px solid ${C.border}`, fontSize: 11.5, color: C.muted }}>
          Cette opération sera injectée automatiquement dans les chiffres, le calendrier et les statistiques chaque mois. Si c'est un prêt, tu pourras aussi marquer le paiement du mois à temps ou en retard.
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <button onClick={closeRecurringModal} style={{ flex: 1, padding: "10px", border: `1px solid ${C.border}`, borderRadius: 9, background: C.card, color: C.muted, fontSize: 13, fontWeight: 600, cursor: "pointer" }}>Annuler</button>
          <button onClick={addOrUpdateRecurring} style={{ flex: 2, padding: "10px", border: "none", borderRadius: 9, background: C.indigo, color: "#fff", fontSize: 13, fontWeight: 800, cursor: "pointer" }}>
            {editRecurring ? "Mettre a jour" : "Enregistrer"}
          </button>
        </div>
      </div>
    </div>
  );

  const PlatformModal = () => (
    <div style={{ position: "fixed", inset: 0, background: "rgba(11,24,41,0.65)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ background: C.card, borderRadius: 16, padding: "26px", width: 520, border: `1px solid ${C.border}`, boxShadow: "0 24px 70px rgba(0,0,0,0.25)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 22 }}>
          <h2 style={{ fontSize: 16, fontWeight: 800, color: C.text }}>{editPlatform ? "Modifier la plateforme" : "Nouvelle plateforme"}</h2>
          <button onClick={closePlatformModal} style={{ background: C.faint, border: "none", cursor: "pointer", color: C.muted, width: 30, height: 30, borderRadius: 7, display: "flex", alignItems: "center", justifyContent: "center" }}><X size={15} /></button>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
          <div>
            <label style={labelStyle}>Nom</label>
            <input value={platformForm.name} onChange={e => setPlatformForm(prev => ({ ...prev, name: e.target.value }))} placeholder="Ex : Welcome to the Jungle" style={inputStyle} />
          </div>
          <div>
            <label style={labelStyle}>Repère court</label>
            <input value={platformForm.emoji} onChange={e => setPlatformForm(prev => ({ ...prev, emoji: e.target.value.toUpperCase() }))} placeholder="Ex : WJ" style={inputStyle} />
          </div>
          <div style={{ gridColumn: "1 / -1" }}>
            <label style={labelStyle}>Lien</label>
            <input value={platformForm.url} onChange={e => setPlatformForm(prev => ({ ...prev, url: e.target.value }))} placeholder="https://..." style={inputStyle} />
          </div>
          <div style={{ gridColumn: "1 / -1" }}>
            <label style={labelStyle}>Description</label>
            <textarea value={platformForm.desc} onChange={e => setPlatformForm(prev => ({ ...prev, desc: e.target.value }))} placeholder="A quoi sert cette plateforme pour votre profil ?" style={{ ...inputStyle, minHeight: 90, resize: "vertical" }} />
          </div>
        </div>
        <div style={{ marginTop: 14, marginBottom: 22 }}>
          <label style={labelStyle}>Couleur</label>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {ACCENT_OPTIONS.map(color => (
              <button key={color} onClick={() => setPlatformForm(prev => ({ ...prev, color }))} style={{ width: 30, height: 30, borderRadius: "50%", background: color, border: platformForm.color === color ? `3px solid ${C.text}` : `1px solid ${C.border}`, cursor: "pointer" }} />
            ))}
          </div>
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <button onClick={closePlatformModal} style={{ flex: 1, padding: "10px", border: `1px solid ${C.border}`, borderRadius: 9, background: C.card, color: C.muted, fontSize: 13, fontWeight: 600, cursor: "pointer" }}>Annuler</button>
          <button onClick={addOrUpdatePlatform} style={{ flex: 2, padding: "10px", border: "none", borderRadius: 9, background: C.indigo, color: "#fff", fontSize: 13, fontWeight: 800, cursor: "pointer" }}>
            {editPlatform ? "Mettre a jour" : "Ajouter"}
          </button>
        </div>
      </div>
    </div>
  );

  const BudgetModal = () => (
    <div style={{ position: "fixed", inset: 0, background: "rgba(11,24,41,0.65)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", animation: "fadeIn 0.18s ease" }}>
      <div style={{ background: C.card, borderRadius: 16, padding: "28px", width: 440, border: `1px solid ${C.border}`, boxShadow: "0 24px 70px rgba(0,0,0,0.28)", maxHeight: "90vh", overflowY: "auto" }}>

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 22 }}>
          <div>
            <h2 style={{ fontSize: 16, fontWeight: 800, color: C.text }}>
              {editBudget ? `Modifier — ${editBudget.category}` : "Définir un budget"}
            </h2>
            <p style={{ fontSize: 11.5, color: C.muted, marginTop: 2 }}>Limite mensuelle en Ariary</p>
          </div>
          <button
            onClick={() => { setShowBudgetModal(false); setEditBudget(null); setBudgetForm({ category: "", limit: "" }); }}
            style={{ background: C.faint, border: "none", cursor: "pointer", color: C.muted, width: 32, height: 32, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center" }}
          >
            <X size={15} />
          </button>
        </div>

        {!editBudget && (
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: "block", fontSize: 10.5, fontWeight: 800, color: C.muted, marginBottom: 5, textTransform: "uppercase", letterSpacing: "0.07em" }}>
              Catégorie
            </label>
            <select
              value={budgetForm.category}
              onChange={e => setBudgetForm(p => ({ ...p, category: e.target.value }))}
              style={{ width: "100%", padding: "9px 12px", border: `1px solid ${C.border}`, borderRadius: 8, fontSize: 13, color: C.text, background: C.card, outline: "none", fontFamily: "inherit" }}
            >
              <option value="">-- Choisir une catégorie --</option>
              {["Logement","Alimentation","Transport","Loisirs","Sante","Abonnements","Autres","Epargne"].map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
        )}

        <div style={{ marginBottom: 20 }}>
          <label style={{ display: "block", fontSize: 10.5, fontWeight: 800, color: C.muted, marginBottom: 5, textTransform: "uppercase", letterSpacing: "0.07em" }}>
            Limite mensuelle (Ar)
          </label>
          <input
            type="number"
            value={budgetForm.limit}
            placeholder="Ex : 500000"
            onChange={e => setBudgetForm(p => ({ ...p, limit: e.target.value }))}
            style={{ width: "100%", padding: "9px 12px", border: `1px solid ${C.border}`, borderRadius: 8, fontSize: 13, color: C.text, background: C.card, outline: "none", fontFamily: "inherit" }}
          />
          {budgetForm.limit && !isNaN(parseFloat(budgetForm.limit)) && (
            <div style={{ fontSize: 11, color: C.indigo, fontWeight: 700, marginTop: 6 }}>
              ≈ {f(parseFloat(budgetForm.limit))} / mois
            </div>
          )}
        </div>

        {editBudget && (() => {
          const currentSpent = Math.abs(
            allTxList
              .filter(tx => tx.type === "expense" && tx.date.slice(0, 7) === liveMonthKey && tx.cat === normalizeCategory(editBudget.category))
              .reduce((sum, tx) => sum + tx.amount, 0)
          );
          const newLimit = parseFloat(budgetForm.limit) || editBudget.limit;
          const newPct = newLimit > 0 ? Math.round((currentSpent / newLimit) * 100) : 0;
          return (
            <div style={{ background: C.faint, borderRadius: 10, padding: "12px 14px", border: `1px solid ${C.border}`, marginBottom: 20 }}>
              <div style={{ fontSize: 11, color: C.muted, fontWeight: 700, marginBottom: 6 }}>APERÇU CE MOIS-CI</div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12.5, color: C.text, fontWeight: 600, marginBottom: 8 }}>
                <span>Dépensé : {f(currentSpent)}</span>
                <span style={{ color: newPct > 90 ? C.red : newPct > 70 ? C.amber : C.green, fontWeight: 800 }}>{newPct}%</span>
              </div>
              <div style={{ height: 6, background: C.border, borderRadius: 50, overflow: "hidden" }}>
                <div style={{ width: `${Math.min(newPct, 100)}%`, height: "100%", background: newPct > 90 ? C.red : newPct > 70 ? C.amber : C.indigo, borderRadius: 50, transition: "width 0.5s ease" }} />
              </div>
            </div>
          );
        })()}

        <div style={{ display: "flex", gap: 10 }}>
          <button
            onClick={() => { setShowBudgetModal(false); setEditBudget(null); setBudgetForm({ category: "", limit: "" }); }}
            style={{ flex: 1, padding: "10px", border: `1px solid ${C.border}`, borderRadius: 9, background: C.card, color: C.muted, fontSize: 13, fontWeight: 600, cursor: "pointer" }}
          >
            Annuler
          </button>
          <button
            onClick={addOrUpdateBudget}
            disabled={!budgetForm.limit || (!editBudget && !budgetForm.category)}
            style={{ flex: 2, padding: "10px", border: "none", borderRadius: 9, background: (!budgetForm.limit || (!editBudget && !budgetForm.category)) ? C.faint : C.indigo, color: (!budgetForm.limit || (!editBudget && !budgetForm.category)) ? C.muted : "#fff", fontSize: 13, fontWeight: 800, cursor: (!budgetForm.limit || (!editBudget && !budgetForm.category)) ? "not-allowed" : "pointer", transition: "all 0.18s ease" }}
          >
            {editBudget ? "Mettre à jour" : "Enregistrer le budget"}
          </button>
        </div>

      </div>
    </div>
  )


  // ══════════════════════════════════════════════════════════════════════
  // ROUTEUR DE VUES
  // ══════════════════════════════════════════════════════════════════════
  const renderView = () => {
    switch (active) {
      case "dashboard":    return <Dashboard />;
      case "revenus":      return <RevenusView />;
      case "depenses":     return <DepensesView />;
      case "budget":       return <BudgetView />;
      case "objectifs":    return <GoalsView />;
      case "statistiques": return <StatistiquesView />;
      case "transactions": return <TransactionsView />;
      case "plan_action":  return <PlanActionView />;
      case "suivi_taf":    return <SuiviTafView />;
      case "parametres":   return <ParametresView />;
      case "aide":         return <AideView />;
      default: return <Dashboard />;
    }
  };

  const usesPortfolioDesign = isNeonDesign;


  // ══════════════════════════════════════════════════════════════════════
  // RENDU PRINCIPAL
  // ══════════════════════════════════════════════════════════════════════
  return (
    <div className={usesPortfolioDesign ? "ft-neon-mode" : ""} style={{ height: "100%" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&family=Space+Grotesk:wght@400;500;600;700&family=JetBrains+Mono:wght@500;700&display=swap');
        *, *::before, *::after { font-family: ${usesPortfolioDesign ? "'Space Grotesk', system-ui, sans-serif" : "'Plus Jakarta Sans', system-ui, sans-serif"} !important; box-sizing: border-box; margin: 0; padding: 0; }
        ${usesPortfolioDesign ? `
        #root label,
        #root input::placeholder,
        #root .ft-nav-section-title {
          font-family: 'JetBrains Mono', ui-monospace, monospace !important;
          letter-spacing: 0.06em;
        }
        ` : ""}
        html, body, #root {
          text-rendering: optimizeLegibility;
          -webkit-font-smoothing: antialiased;
          -moz-osx-font-smoothing: grayscale;
          line-height: 1.35;
          color: ${C.text};
        }
        #root h1, #root h2, #root h3 {
          letter-spacing: 0 !important;
          line-height: 1.2;
          font-feature-settings: "cv11" 1, "ss01" 1;
        }
        #root p, #root span, #root label, #root button {
          letter-spacing: 0;
        }
        ::-webkit-scrollbar { width: 5px; } ::-webkit-scrollbar-track { background: transparent; } ::-webkit-scrollbar-thumb { background: #CBD5E1; border-radius: 10px; }

        /* ── Animations ── */
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @keyframes fadeSlideUp {
          from { opacity: 0; transform: translateY(18px) scale(0.98); }
          to   { opacity: 1; transform: translateY(0)    scale(1);    }
        }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes pulse-dot {
          0%, 100% { transform: scale(1); opacity: 1; }
          50%       { transform: scale(1.4); opacity: 0.7; }
        }
        @keyframes shimmer {
          0%   { background-position: -400px 0; }
          100% { background-position:  400px 0; }
        }
        @keyframes countUp {
          from { opacity: 0; transform: scale(0.85) translateY(6px); }
          to   { opacity: 1; transform: scale(1)    translateY(0);   }
        }

        /* ── Sidebar animations ── */
        @keyframes slideIn {
          from { opacity: 0; transform: translateX(-8px); }
          to   { opacity: 1; transform: translateX(0); }
        }
        @keyframes fadeWidth {
          from { opacity: 0; max-width: 0; }
          to   { opacity: 1; max-width: 200px; }
        }
        @keyframes avatarPulse {
          0%, 100% { box-shadow: 0 0 0 0 ${hexToRgba(C.indigo, 0.4)}; }
          50%       { box-shadow: 0 0 0 6px ${hexToRgba(C.indigo, 0)}; }
        }
        @keyframes hamburgerHover {
          0%, 100% { transform: scale(1); }
          50%       { transform: scale(1.1); }
        }

        /* ── Card entrance stagger ── */
        /* MODIFICATION SPÉCIALE : Animations désactivées
        .ft-card { animation: fadeSlideUp 0.38s cubic-bezier(0.22, 1, 0.36, 1) both; }
        .ft-card:nth-child(1) { animation-delay: 0.03s; }
        .ft-card:nth-child(2) { animation-delay: 0.07s; }
        .ft-card:nth-child(3) { animation-delay: 0.11s; }
        .ft-card:nth-child(4) { animation-delay: 0.15s; }
        .ft-card:nth-child(5) { animation-delay: 0.19s; }
        .ft-card:nth-child(6) { animation-delay: 0.23s; }
        */

        /* ── Value counter animation ── */
        /* MODIFICATION SPÉCIALE : Animation désactivée
        .ft-value { animation: countUp 0.5s cubic-bezier(0.22,1,0.36,1) both; animation-delay: 0.15s; }
        */

        /* ── Hover lift for cards ── */
        /* MODIFICATION SPÉCIALE : Hover désactivé
        .ft-hover {
          transition: transform 0.2s cubic-bezier(0.22,1,0.36,1),
                      box-shadow 0.2s cubic-bezier(0.22,1,0.36,1);
        }
        .ft-hover:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 28px rgba(0,0,0,0.09), 0 2px 8px rgba(0,0,0,0.05) !important;
        }
        */

        /* ── Button transitions ── */
        button {
          transition: opacity 0.15s ease, transform 0.15s ease,
                      background 0.18s ease, box-shadow 0.18s ease !important;
        }
        button:hover { opacity: 0.88; transform: scale(0.985); }
        button:active { transform: scale(0.97); }

        /* ── Sidebar nav items ── */
        .ft-nav-btn {
          transition: all 0.25s cubic-bezier(0.22, 1, 0.36, 1) !important;
          position: relative;
          overflow: hidden;
        }
        .ft-nav-btn::before {
          content: '';
          position: absolute;
          left: 0; top: 0; bottom: 0;
          width: 3px;
          background: ${C.indigo};
          transform: scaleY(0);
          transition: transform 0.25s cubic-bezier(0.22, 1, 0.36, 1);
        }
        .ft-nav-btn:hover {
          padding-left: 14px !important;
          background: ${hexToRgba(C.indigo, 0.1)} !important;
        }
        .ft-nav-btn:hover::before {
          transform: scaleY(1);
        }
        .ft-nav-btn:active {
          transform: scale(0.98) !important;
        }

        /* ── Sidebar text reveal animation ── */
        .ft-sidebar-text {
          animation: fadeWidth 0.25s cubic-bezier(0.22, 1, 0.36, 1) both;
        }

        /* ── Sidebar avatar animation ── */
        .ft-sidebar-avatar {
          transition: transform 0.3s cubic-bezier(0.22, 1, 0.36, 1), box-shadow 0.3s ease;
        }
        .ft-sidebar-avatar:hover {
          transform: scale(1.08);
          animation: avatarPulse 1.5s ease-in-out infinite;
        }

        /* ── Hamburger button animation ── */
        .ft-hamburger {
          transition: all 0.35s cubic-bezier(0.22, 1, 0.36, 1);
          position: relative;
        }
        .ft-hamburger::after {
          content: '';
          position: absolute;
          inset: -4px;
          border-radius: 12px;
          background: radial-gradient(circle, ${hexToRgba(C.indigo, 0.3)} 0%, transparent 70%);
          opacity: 0;
          transform: scale(0.5);
          transition: all 0.4s cubic-bezier(0.22, 1, 0.36, 1);
          z-index: -1;
        }
        .ft-hamburger:hover {
          transform: scale(1.15);
          background: ${hexToRgba(C.sidebarText, 0.15)} !important;
          box-shadow: 0 4px 20px ${hexToRgba(C.indigo, 0.25)};
        }
        .ft-hamburger:hover::after {
          opacity: 1;
          transform: scale(1);
        }
        .ft-hamburger:active {
          transform: scale(0.9);
        }

        /* ── Hamburger icon animation ── */
        .ft-hamburger-icon {
          transition: all 0.4s cubic-bezier(0.22, 1, 0.36, 1);
          transform-origin: center;
        }
        .ft-hamburger-collapsed .ft-hamburger-icon {
          transform: rotate(0deg);
        }
        .ft-hamburger:not(.ft-hamburger-collapsed) .ft-hamburger-icon {
          transform: rotate(180deg);
        }

        /* ── Sidebar content stagger animation ── */
        @keyframes slideInStagger {
          from {
            opacity: 0;
            transform: translateX(-20px) scale(0.95);
          }
          to {
            opacity: 1;
            transform: translateX(0) scale(1);
          }
        }
        .ft-sidebar-content {
          animation: slideInStagger 0.4s cubic-bezier(0.22, 1, 0.36, 1) backwards;
        }

        /* ── Sidebar nav label animation ── */
        @keyframes fadeSlideInRight {
          0% {
            opacity: 0;
            transform: translateX(-30px) scale(0.8);
            max-width: 0;
            letter-spacing: -2px;
          }
          60% {
            opacity: 0.7;
            transform: translateX(-5px) scale(0.95);
            max-width: 100px;
          }
          100% {
            opacity: 1;
            transform: translateX(0) scale(1);
            max-width: 150px;
            letter-spacing: normal;
          }
        }
        @keyframes fadeSlideOutLeft {
          0% {
            opacity: 1;
            transform: translateX(0) scale(1);
            max-width: 150px;
          }
          40% {
            opacity: 0.6;
            transform: translateX(-10px) scale(0.95);
          }
          100% {
            opacity: 0;
            transform: translateX(-40px) scale(0.8);
            max-width: 0;
          }
        }
        @keyframes fadeSlideDown {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        /* ── Nav label transitions ── */
        .ft-nav-expanded .ft-nav-label {
          animation: fadeSlideInRight 1.2s cubic-bezier(0.22, 1, 0.36, 1) forwards;
        }
        .ft-nav-collapsed .ft-nav-label {
          animation: fadeSlideOutLeft 1.0s cubic-bezier(0.22, 1, 0.36, 1) forwards;
        }

        /* ── Sidebar container smoother transition ── */
        .ft-sidebar {
          transition: width 0.8s cubic-bezier(0.22, 1, 0.36, 1), min-width 0.8s cubic-bezier(0.22, 1, 0.36, 1);
        }

        /* ── Emoji bounce on collapse/expand ── */
        .ft-nav-btn .ft-nav-emoji {
          transition: transform 0.8s cubic-bezier(0.22, 1, 0.36, 1);
        }
        .ft-nav-collapsed .ft-nav-emoji {
          animation: emojiPop 0.8s cubic-bezier(0.22, 1, 0.36, 1) forwards;
        }
        @keyframes emojiPop {
          0% { transform: scale(1); }
          50% { transform: scale(1.3) rotate(-10deg); }
          100% { transform: scale(1.1) rotate(0deg); }
        }
        .ft-nav-btn:hover .ft-nav-emoji {
          transform: scale(1.25) rotate(8deg);
        }

        /* ── Section title animation ── */
        .ft-nav-section-title {
          animation: fadeSlideDown 0.5s cubic-bezier(0.22, 1, 0.36, 1) forwards;
        }

        /* ── Progress bars ── */
        .ft-bar { transition: width 0.8s cubic-bezier(0.22,1,0.36,1) !important; }

        /* ── Input focus ── */
        input:focus, select:focus, textarea:focus {
          border-color: ${C.indigo} !important;
          box-shadow: 0 0 0 3px ${hexToRgba(C.indigo, 0.12)} !important;
          outline: none;
        }

        /* ── Pulsing live dot ── */
        .ft-live-dot { animation: pulse-dot 2s ease-in-out infinite; }

        /* ── Glassmorphism helper ── */
        .ft-glass {
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
        }

        /* ── Neon mode : popups glassmorphism ── */
        .ft-neon-mode [style*="position: fixed"][style*="inset: 0"] > div {
          background: rgba(10, 14, 28, 0.55) !important;
          backdrop-filter: blur(20px) !important;
          -webkit-backdrop-filter: blur(20px) !important;
          border: 1px solid rgba(255,255,255,0.10) !important;
          box-shadow: 0 8px 40px rgba(0,0,0,0.5), 0 0 0 1px rgba(123,110,255,0.12) !important;
        }
      `}</style>
      {usesPortfolioDesign ? (
        <div className="ft-app-shell">
          <div className="ft-app-bg-orb ft-app-bg-orb--left" aria-hidden="true" />
          <div className="ft-app-bg-orb ft-app-bg-orb--right" aria-hidden="true" />
          <CanvasBackground
            className="ft-app-bg-canvas"
            opacity={0.46}
            colorA="52,245,190"
            colorB="123,110,255"
          />
          <div
            className="ft-app-content"
            style={{
              background: "linear-gradient(180deg, rgba(7,10,18,0.58), rgba(7,10,18,0.78))",
            }}
          >
            <Sidebar />
            {renderView()}
          </div>
        </div>
      ) : (
        <div style={{ display: "flex", height: "100vh", background: C.bg, overflow: "hidden" }}>
          <Sidebar />
          {renderView()}
        </div>
      )}
      {showEntryHubModal && TransactionWizard()}
      {!showEntryHubModal && showModal && TxModal()}
      {showGoalModal && GoalModal()}
      {showJobModal && JobModal()}
      {!showEntryHubModal && showRecurringModal && RecurringModal()}
      {showPlatformModal && PlatformModal()}
      {showBudgetModal && BudgetModal()}
      {showColorModal && ColorModal()}
      {showFinGuide && <FinGuide onClose={() => setShowFinGuide(false)} />}
      <FloatingBalance 
        balance={globalRealBalance}
        currency={currency} 
        rates={rates} 
        isVisible={showFloatingBalance}
        onToggle={() => setShowFloatingBalance(false)}
      />
    </div>
  );
}
