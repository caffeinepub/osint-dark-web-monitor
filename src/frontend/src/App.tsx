import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Toaster } from "@/components/ui/sonner";
import {
  AlertTriangle,
  BookOpen,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  ClipboardList,
  ExternalLink,
  FileText,
  Lightbulb,
  Monitor,
  Printer,
  Search,
  Shield,
  ShieldAlert,
  TrendingUp,
  Zap,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import {
  createContext,
  useCallback,
  useContext,
  useRef,
  useState,
} from "react";
import { toast } from "sonner";

// ─── Types ─────────────────────────────────────────────────────────────────

type SectionId =
  | "what-is"
  | "live-demo"
  | "red-flags"
  | "investigation"
  | "evidence"
  | "solutions"
  | "summary";

interface AppState {
  activeSection: SectionId;
  visitedSections: Set<SectionId>;
  redFlagChecks: Record<number, boolean>;
  evidenceChecks: Record<number, boolean>;
  setActiveSection: (id: SectionId) => void;
  markVisited: (id: SectionId) => void;
  toggleRedFlag: (idx: number) => void;
  toggleEvidence: (idx: number) => void;
}

// ─── Context ────────────────────────────────────────────────────────────────

const AppContext = createContext<AppState | null>(null);

function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}

// ─── Data ───────────────────────────────────────────────────────────────────

const NAV_ITEMS: {
  id: SectionId;
  label: string;
  icon: React.ReactNode;
  short: string;
}[] = [
  {
    id: "what-is",
    label: "What is Flash USDT",
    icon: <BookOpen className="w-4 h-4" />,
    short: "Overview",
  },
  {
    id: "live-demo",
    label: "Live Demo",
    icon: <Monitor className="w-4 h-4" />,
    short: "Demo",
  },
  {
    id: "red-flags",
    label: "Red Flags Checklist",
    icon: <AlertTriangle className="w-4 h-4" />,
    short: "Red Flags",
  },
  {
    id: "investigation",
    label: "On-Chain Investigation",
    icon: <Search className="w-4 h-4" />,
    short: "Forensics",
  },
  {
    id: "evidence",
    label: "Evidence Collection",
    icon: <ClipboardList className="w-4 h-4" />,
    short: "Evidence",
  },
  {
    id: "solutions",
    label: "Solutions & Prevention",
    icon: <Lightbulb className="w-4 h-4" />,
    short: "Solutions",
  },
  {
    id: "summary",
    label: "Session Summary",
    icon: <TrendingUp className="w-4 h-4" />,
    short: "Summary",
  },
];

const RED_FLAGS = [
  { label: 'Tool requires upfront payment to "activate"', severity: "high" },
  {
    label: "Claims funds will disappear after X days (60, 90, 120 days)",
    severity: "high",
  },
  {
    label: "Funds cannot be withdrawn, traded, or converted",
    severity: "high",
  },
  { label: "No verifiable transaction hash provided", severity: "high" },
  {
    label: "Seller operates exclusively via Telegram or WhatsApp",
    severity: "medium",
  },
  {
    label: 'Promises unrealistic returns or "flash profits"',
    severity: "medium",
  },
  {
    label: "Wallet balance does not appear on block explorer",
    severity: "high",
  },
  { label: 'Tool claims to "bypass" blockchain security', severity: "high" },
  {
    label: "No official website, whitepaper, or legal entity",
    severity: "medium",
  },
];

const EVIDENCE_ITEMS = [
  { label: "Screenshots of the scam tool interface and promotional materials" },
  { label: "Transaction hash (or documented absence of one)" },
  { label: "Communication logs from Telegram, WhatsApp, or email" },
  { label: "Payment receipts sent to scammer (crypto or fiat)" },
  { label: "Victim's wallet address(es) involved" },
  { label: "Scammer's wallet address(es) if identified" },
  { label: "Timestamps of all interactions (chronological log)" },
  { label: "Witness statements and victim impact statements" },
];

const INVESTIGATION_STEPS = [
  {
    step: 1,
    title: "Obtain Victim's Wallet Address",
    summary:
      "Collect the exact wallet address where the victim claims to have received the flash USDT.",
    detail:
      "Request the full wallet address (not a screenshot). Verify the format matches the claimed blockchain (Ethereum: 0x..., Tron: T..., BNB: 0x...). Document the address verbatim in your case file.",
    tools: [],
  },
  {
    step: 2,
    title: "Search Block Explorer",
    summary:
      "Query the wallet address on the appropriate blockchain explorer to find all real transactions.",
    detail:
      "Enter the wallet address in the search field of the relevant explorer. Review the complete transaction history. Note any discrepancy between what the victim reports seeing and what appears on-chain.",
    tools: [
      { name: "Etherscan (Ethereum)", url: "https://etherscan.io" },
      { name: "BSCScan (BNB Chain)", url: "https://bscscan.com" },
      { name: "Tronscan (TRON)", url: "https://tronscan.org" },
    ],
  },
  {
    step: 3,
    title: "Verify Transaction Hash Existence",
    summary:
      "Confirm whether the transaction hash claimed by the scammer actually exists on the blockchain.",
    detail:
      "If the victim received a transaction hash (TX ID), paste it into the explorer. A real transaction will show sender, receiver, amount, gas fee, block number, and timestamp. A fake flash transaction will return 'Transaction not found' or show a different recipient.",
    tools: [
      { name: "Etherscan TX Lookup", url: "https://etherscan.io" },
      { name: "BSCScan TX Lookup", url: "https://bscscan.com" },
    ],
  },
  {
    step: 4,
    title: "Check Sender Wallet History",
    summary:
      "Investigate the sending wallet's transaction history to identify patterns and other victims.",
    detail:
      "Look for: multiple small transactions to different wallets (victim recruitment), large outflows to mixing services, wallet age vs. activity volume mismatch, connections to known scam contracts. Export the transaction list for your case file.",
    tools: [
      { name: "Etherscan", url: "https://etherscan.io" },
      { name: "Breadcrumbs.app", url: "https://www.breadcrumbs.app" },
    ],
  },
  {
    step: 5,
    title: "Identify Token Contract Address",
    summary:
      "Locate the specific token contract address used to create the fake USDT balance.",
    detail:
      "In the token transaction list, click on the token name to view its contract address. Real USDT on Ethereum is at 0xdAC17F958D2ee523a2206206994597C13D831ec7. Any other address claiming to be USDT is either a different network or a counterfeit token.",
    tools: [
      { name: "Etherscan Token Tracker", url: "https://etherscan.io/tokens" },
    ],
  },
  {
    step: 6,
    title: "Verify Contract on Token Registry",
    summary:
      "Cross-reference the token contract against official registries to confirm legitimacy.",
    detail:
      "Check if the token contract is listed on CoinGecko or CoinMarketCap with verified contract address. A legitimate USDT will match exactly. Fake USDT tokens often have similar-looking names (USDT•, USDТ with Cyrillic Т, or USDT2) and will not appear on major registries.",
    tools: [
      { name: "CoinGecko", url: "https://www.coingecko.com" },
      { name: "CoinMarketCap", url: "https://coinmarketcap.com" },
    ],
  },
  {
    step: 7,
    title: "Cross-Reference Scam Databases",
    summary:
      "Check identified addresses against known scam and fraud databases.",
    detail:
      "Submit the scammer's wallet address and any associated contract addresses to known scam reporting databases. If not found, consider submitting a new report to help protect future victims. Document your findings for the case file.",
    tools: [
      { name: "Chainabuse", url: "https://www.chainabuse.com" },
      { name: "ScamAlert.io", url: "https://scamalert.io" },
      { name: "CryptoScamDB", url: "https://cryptoscamdb.org" },
    ],
  },
];

// ─── Shared Components ──────────────────────────────────────────────────────

function SectionHeader({
  icon,
  title,
  subtitle,
  badge,
}: {
  icon: React.ReactNode;
  title: string;
  subtitle?: string;
  badge?: { label: string; variant: "danger" | "warning" | "info" | "success" };
}) {
  const badgeClass = {
    danger: "badge-danger",
    warning: "badge-warning",
    info: "badge-info",
    success: "badge-success",
  };

  return (
    <div className="mb-8">
      <div className="flex items-start gap-4">
        <div className="w-12 h-12 rounded-lg bg-primary/10 border border-primary/25 flex items-center justify-center text-primary flex-shrink-0 mt-0.5">
          {icon}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 flex-wrap">
            <h2 className="font-display font-bold text-2xl text-foreground leading-tight">
              {title}
            </h2>
            {badge && (
              <span
                className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded text-xs font-semibold border font-mono uppercase tracking-wide ${badgeClass[badge.variant]}`}
              >
                {badge.label}
              </span>
            )}
          </div>
          {subtitle && (
            <p className="text-muted-foreground mt-1.5 text-sm leading-relaxed max-w-2xl">
              {subtitle}
            </p>
          )}
        </div>
      </div>
      <Separator className="mt-6 bg-border/50" />
    </div>
  );
}

function InfoCard({
  title,
  children,
  className = "",
  accent = false,
}: {
  title?: string;
  children: React.ReactNode;
  className?: string;
  accent?: boolean;
}) {
  return (
    <div
      className={`rounded-lg border bg-card p-5 ${accent ? "border-primary/30 bg-primary/5" : "border-border/60"} ${className}`}
    >
      {title && (
        <h3 className="font-display font-semibold text-sm uppercase tracking-wider text-muted-foreground mb-3">
          {title}
        </h3>
      )}
      {children}
    </div>
  );
}

// ─── Section 1: What is Flash USDT ─────────────────────────────────────────

function WhatIsSection() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
    >
      <SectionHeader
        icon={<BookOpen className="w-5 h-5" />}
        title="What is Flash USDT?"
        subtitle="Understanding the fraud mechanism — what scammers claim vs. what blockchain technology actually allows."
        badge={{ label: "Module 1 of 6", variant: "info" }}
      />

      {/* Alert banner */}
      <div className="mb-6 rounded-lg border border-destructive/30 bg-destructive/8 p-4 flex gap-3">
        <ShieldAlert className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
        <div>
          <p className="font-display font-semibold text-sm text-destructive">
            Law Enforcement Advisory
          </p>
          <p className="text-sm text-muted-foreground mt-0.5">
            "Flash USDT" is a fraudulent concept. There is no legitimate use
            case. Any tool marketed as capable of creating temporary
            cryptocurrency is designed to defraud victims.
          </p>
        </div>
      </div>

      {/* What is USDT */}
      <div className="grid md:grid-cols-2 gap-5 mb-6">
        <InfoCard title="Real USDT — What It Is" accent>
          <ul className="space-y-2.5">
            {[
              "Tether (USDT) is a legitimate USD-pegged stablecoin",
              "Issued by Tether Limited, audited and regulated",
              "Exists on multiple blockchains: Ethereum, Tron, BNB Chain",
              "Every transaction is permanently recorded on-chain",
              "Fully tradeable, withdrawable, and convertible to fiat",
              "Balance is verifiable by anyone on a block explorer",
            ].map((item) => (
              <li key={item} className="flex items-start gap-2.5 text-sm">
                <CheckCircle2 className="w-4 h-4 text-success mt-0.5 flex-shrink-0" />
                <span className="text-foreground/85">{item}</span>
              </li>
            ))}
          </ul>
        </InfoCard>

        <InfoCard title="Flash USDT — What Scammers Claim">
          <ul className="space-y-2.5">
            {[
              'Claims to create "temporary" USDT that expires after 60–120 days',
              'Sold as a tool to "test" wallets or "bypass" exchange limits',
              "Marketed on Telegram/WhatsApp for $200–$2,000+",
              "Claims funds appear real but cannot be traced by authorities",
              "Promises the balance will show in wallets immediately",
              'Uses fake screenshots and fabricated "proof" videos',
            ].map((item) => (
              <li key={item} className="flex items-start gap-2.5 text-sm">
                <AlertTriangle className="w-4 h-4 text-destructive mt-0.5 flex-shrink-0" />
                <span className="text-foreground/85">{item}</span>
              </li>
            ))}
          </ul>
        </InfoCard>
      </div>

      {/* Why it's impossible */}
      <InfoCard title="Why Flash USDT is Technically Impossible">
        <div className="space-y-4">
          <p className="text-sm text-foreground/85 leading-relaxed">
            Blockchain technology is built on three immutable principles that
            make "flash" or "temporary" cryptocurrency structurally impossible:
          </p>
          <div className="grid sm:grid-cols-3 gap-4">
            {[
              {
                title: "Immutability",
                desc: 'Once written to the blockchain, transactions cannot be altered, reversed, or set to expire. There is no "delete" function.',
                color: "text-chart-1",
              },
              {
                title: "Decentralization",
                desc: 'No single entity controls the blockchain. A "flash" tool would need to simultaneously rewrite thousands of independent nodes.',
                color: "text-chart-2",
              },
              {
                title: "Consensus",
                desc: "Every transaction is verified by network consensus. Fake balances injected by a tool are immediately rejected by the network.",
                color: "text-chart-3",
              },
            ].map((item) => (
              <div
                key={item.title}
                className="bg-secondary/40 rounded-lg p-4 border border-border/40"
              >
                <p
                  className={`font-display font-bold text-sm mb-2 ${item.color}`}
                >
                  {item.title}
                </p>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </InfoCard>

      {/* Diagram */}
      <div className="mt-5">
        <InfoCard title="Visual Comparison: Real USDT vs. Flash USDT Tool">
          <div className="grid md:grid-cols-2 gap-4 mt-2">
            {/* Real USDT flow */}
            <div className="space-y-2">
              <p className="text-xs font-semibold text-success uppercase tracking-wider mb-3">
                Real USDT Transaction Flow
              </p>
              {[
                {
                  step: "Sender",
                  desc: "Initiates transfer from verified wallet",
                },
                {
                  step: "Blockchain",
                  desc: "Transaction broadcast to network nodes",
                },
                {
                  step: "Verification",
                  desc: "Consensus reached, block confirmed",
                },
                {
                  step: "Recipient",
                  desc: "Funds available — permanent, tradeable",
                },
              ].map((item, stepIdx) => (
                <div key={item.step} className="flex items-center gap-3">
                  <div className="w-7 h-7 rounded-full bg-success/15 border border-success/30 flex items-center justify-center text-xs font-bold text-success font-mono flex-shrink-0">
                    {stepIdx + 1}
                  </div>
                  <div className="flex-1 bg-success/5 border border-success/15 rounded px-3 py-2">
                    <span className="text-xs font-semibold text-success">
                      {item.step}:{" "}
                    </span>
                    <span className="text-xs text-foreground/70">
                      {item.desc}
                    </span>
                  </div>
                </div>
              ))}
            </div>
            {/* Flash USDT */}
            <div className="space-y-2">
              <p className="text-xs font-semibold text-destructive uppercase tracking-wider mb-3">
                Flash USDT "Tool" — What Actually Happens
              </p>
              {[
                {
                  step: "Scammer",
                  desc: 'Collects payment from victim for the "tool"',
                },
                {
                  step: "Fake Tool",
                  desc: "Sends HTTP request to custom server (not blockchain)",
                },
                {
                  step: "Spoofed UI",
                  desc: "Manipulated wallet display shows fake balance",
                },
                {
                  step: "Victim",
                  desc: "Believes they have USDT — it does not exist on-chain",
                },
              ].map((item, stepIdx) => (
                <div key={item.step} className="flex items-center gap-3">
                  <div className="w-7 h-7 rounded-full bg-destructive/15 border border-destructive/30 flex items-center justify-center text-xs font-bold text-destructive font-mono flex-shrink-0">
                    {stepIdx + 1}
                  </div>
                  <div className="flex-1 bg-destructive/5 border border-destructive/15 rounded px-3 py-2">
                    <span className="text-xs font-semibold text-destructive">
                      {item.step}:{" "}
                    </span>
                    <span className="text-xs text-foreground/70">
                      {item.desc}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </InfoCard>
      </div>

      {/* How scammers sell */}
      <div className="mt-5">
        <InfoCard title="How Scammers Market and Sell These Tools">
          <div className="grid sm:grid-cols-2 gap-3 mt-1">
            {[
              'YouTube videos with fabricated demos showing "balance appearing"',
              "Telegram groups with hundreds of fake testimonials",
              'Promises of refunds if the tool "doesn\'t work"',
              "Price tiers based on expiry duration ($200 for 30 days, $500 for 120 days)",
              "Claims to work on Binance, Coinbase, MetaMask, Trust Wallet",
              'Fake customer support channels and "live chat" agents',
            ].map((item) => (
              <div
                key={item}
                className="flex items-start gap-2.5 bg-secondary/30 rounded px-3 py-2.5 border border-border/30"
              >
                <span className="w-5 h-5 rounded bg-warning/15 border border-warning/25 flex items-center justify-center text-xs font-bold text-warning font-mono flex-shrink-0 mt-0.5">
                  !
                </span>
                <p className="text-xs text-foreground/80 leading-relaxed">
                  {item}
                </p>
              </div>
            ))}
          </div>
        </InfoCard>
      </div>
    </motion.div>
  );
}

// ─── Section 2: Live Demo ───────────────────────────────────────────────────

function LiveDemoSection() {
  const [demoState, setDemoState] = useState<"idle" | "flashing" | "revealed">(
    "idle",
  );
  const [showBreakdown, setShowBreakdown] = useState(false);

  const runDemo = useCallback(() => {
    setDemoState("flashing");
    setTimeout(() => {
      setDemoState("revealed");
      setShowBreakdown(true);
    }, 2200);
  }, []);

  const resetDemo = useCallback(() => {
    setDemoState("idle");
    setShowBreakdown(false);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
    >
      <SectionHeader
        icon={<Monitor className="w-5 h-5" />}
        title="Live Demo: Simulated Victim Experience"
        subtitle="Walk through what a victim sees when targeted by a Flash USDT scam, then reveal the technical reality."
        badge={{ label: "Module 2 of 6", variant: "info" }}
      />

      <div className="mb-5 rounded-lg border border-warning/25 bg-warning/6 p-4 flex gap-3">
        <AlertTriangle className="w-5 h-5 text-warning flex-shrink-0 mt-0.5" />
        <p className="text-sm text-foreground/85">
          <strong className="text-warning">Presenter Note:</strong> This
          simulation shows how a scammer's tool manipulates what the victim
          sees. No real transaction occurs. Click "Trigger Flash Demo" to begin.
        </p>
      </div>

      {/* Mock Wallet */}
      <div className="mb-6">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
          Simulated Victim Wallet View
        </p>
        <div className="relative rounded-xl border border-border/60 bg-card overflow-hidden scanline-overlay">
          {/* Wallet header */}
          <div className="bg-secondary/50 px-5 py-3 border-b border-border/40 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-destructive/70" />
              <div className="w-2.5 h-2.5 rounded-full bg-warning/70" />
              <div className="w-2.5 h-2.5 rounded-full bg-success/70" />
            </div>
            <span className="text-xs font-mono text-muted-foreground">
              MyWallet v3.2.1 — TRC20
            </span>
            <div className="w-2.5 h-2.5 rounded-full bg-success animate-blink" />
          </div>

          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-widest mb-1">
                  Wallet Balance
                </p>
                <AnimatePresence mode="wait">
                  {demoState === "idle" && (
                    <motion.div
                      key="zero"
                      initial={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="font-display font-bold text-4xl text-foreground"
                    >
                      0.00 <span className="text-success text-2xl">USDT</span>
                    </motion.div>
                  )}
                  {demoState === "flashing" && (
                    <motion.div
                      key="flashing"
                      className="font-display font-bold text-4xl text-foreground"
                      animate={{ opacity: [1, 0.3, 1, 0.3, 1] }}
                      transition={{
                        duration: 1.5,
                        repeat: Number.POSITIVE_INFINITY,
                      }}
                    >
                      <span className="text-warning">Processing...</span>
                    </motion.div>
                  )}
                  {demoState === "revealed" && (
                    <motion.div
                      key="revealed"
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{
                        type: "spring",
                        stiffness: 260,
                        damping: 20,
                      }}
                      className="font-display font-bold text-4xl text-foreground"
                    >
                      50,000.00{" "}
                      <span className="text-success text-2xl">USDT</span>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
              <div className="w-14 h-14 rounded-full bg-success/10 border border-success/25 flex items-center justify-center">
                <span className="text-2xl font-bold text-success font-mono">
                  ₮
                </span>
              </div>
            </div>

            {/* Fake transaction */}
            <AnimatePresence>
              {demoState === "revealed" && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="rounded-lg border border-success/20 bg-success/5 p-4 mb-4"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-semibold text-success uppercase tracking-wide">
                      Incoming Transfer
                    </span>
                    <span className="text-xs text-success badge-success px-2 py-0.5 rounded border">
                      Received
                    </span>
                  </div>
                  <div className="space-y-1 font-mono text-xs text-foreground/70">
                    <div className="flex justify-between">
                      <span>From:</span>
                      <span className="text-foreground">TXf8k...n4mR9</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Amount:</span>
                      <span className="text-success font-semibold">
                        +50,000 USDT
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>TX Hash:</span>
                      <span className="text-foreground">ab3f9c...0012e7</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Expires:</span>
                      <span className="text-warning">120 days</span>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Action buttons */}
            <div className="flex gap-3">
              <Button
                data-ocid="demo.primary_button"
                onClick={demoState === "idle" ? runDemo : resetDemo}
                className={`flex-1 h-10 font-semibold text-sm ${
                  demoState === "idle"
                    ? "bg-primary text-primary-foreground hover:bg-primary/90"
                    : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                }`}
                disabled={demoState === "flashing"}
              >
                {demoState === "idle" && (
                  <>
                    <Zap className="w-4 h-4 mr-2" />
                    Trigger Flash Demo
                  </>
                )}
                {demoState === "flashing" && (
                  <>
                    <span className="animate-spin mr-2">⚡</span>Flashing...
                  </>
                )}
                {demoState === "revealed" && "Reset Demo"}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Two-column breakdown */}
      <AnimatePresence>
        {showBreakdown && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <div className="grid md:grid-cols-2 gap-4 mb-5">
              <div className="rounded-lg border border-destructive/25 bg-destructive/5 p-5">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-6 h-6 rounded bg-destructive/15 flex items-center justify-center">
                    <span className="text-xs text-destructive font-bold">
                      👁
                    </span>
                  </div>
                  <h3 className="font-display font-bold text-sm text-destructive uppercase tracking-wide">
                    What the Victim Sees
                  </h3>
                </div>
                <ul className="space-y-2">
                  {[
                    "Balance shows 50,000 USDT received",
                    "A transaction record with TX hash",
                    '"Expires in 120 days" label (designed to create urgency)',
                    "The wallet UI looks completely legitimate",
                    "May show in some wallet apps that don't verify on-chain",
                  ].map((item) => (
                    <li
                      key={item}
                      className="flex items-start gap-2 text-sm text-foreground/80"
                    >
                      <span className="text-destructive mt-0.5 flex-shrink-0">
                        →
                      </span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="rounded-lg border border-success/25 bg-success/5 p-5">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-6 h-6 rounded bg-success/15 flex items-center justify-center">
                    <Search className="w-3.5 h-3.5 text-success" />
                  </div>
                  <h3 className="font-display font-bold text-sm text-success uppercase tracking-wide">
                    What Actually Happened
                  </h3>
                </div>
                <ul className="space-y-2">
                  {[
                    "No blockchain transaction was broadcast",
                    "The TX hash is fabricated or belongs to another unrelated transaction",
                    "The scam tool injected a fake entry into local wallet display only",
                    "Block explorer shows: 0.00 USDT in wallet",
                    'The "USDT" cannot be sent, traded, or withdrawn — ever',
                  ].map((item) => (
                    <li
                      key={item}
                      className="flex items-start gap-2 text-sm text-foreground/80"
                    >
                      <CheckCircle2 className="w-4 h-4 text-success mt-0.5 flex-shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <InfoCard title="Technical Breakdown: How the Fake Balance Was Created">
              <div className="space-y-3">
                <p className="text-sm text-foreground/80 leading-relaxed">
                  Flash USDT tools typically use one or more of these technical
                  methods to create the illusion of a balance:
                </p>
                <div className="grid sm:grid-cols-3 gap-3">
                  {[
                    {
                      method: "Method 1: Fake Token Contract",
                      desc: "Deploy a custom ERC-20/TRC-20 token named 'Tether USD (USDT)' with the same symbol. Not real USDT — just a copycat token with zero market value.",
                      severity: "high",
                    },
                    {
                      method: "Method 2: UI Manipulation",
                      desc: "Exploit wallet apps that don't verify on-chain data. Inject a fake entry into the wallet's local display only — invisible to any blockchain explorer.",
                      severity: "high",
                    },
                    {
                      method: "Method 3: Phishing Portal",
                      desc: "Build a fake wallet website that shows a custom balance. The victim never actually controls any wallet — it's a login page that steals their real wallet's seed phrase.",
                      severity: "critical",
                    },
                  ].map((item) => (
                    <div
                      key={item.method}
                      className="bg-secondary/30 rounded-lg p-3.5 border border-border/40"
                    >
                      <p className="text-xs font-bold text-warning mb-1.5">
                        {item.method}
                      </p>
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        {item.desc}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </InfoCard>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// ─── Section 3: Red Flags ───────────────────────────────────────────────────

function RedFlagsSection() {
  const { redFlagChecks, toggleRedFlag } = useApp();

  const checkedCount = Object.values(redFlagChecks).filter(Boolean).length;
  const totalCount = RED_FLAGS.length;
  const severityColor =
    checkedCount >= 7
      ? "text-destructive"
      : checkedCount >= 4
        ? "text-warning"
        : "text-muted-foreground";

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
    >
      <SectionHeader
        icon={<AlertTriangle className="w-5 h-5" />}
        title="Red Flags Checklist"
        subtitle="Use this checklist to assess whether a case involves a Flash USDT scam. Check each flag that applies."
        badge={{ label: "Module 3 of 6", variant: "info" }}
      />

      {/* Counter */}
      <div className="mb-6 rounded-lg border border-border/50 bg-card p-5 flex items-center gap-5">
        <div className="text-center">
          <p className={`font-display font-bold text-4xl ${severityColor}`}>
            {checkedCount}
          </p>
          <p className="text-xs text-muted-foreground mt-0.5">
            of {totalCount} flagged
          </p>
        </div>
        <div className="flex-1">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs text-muted-foreground">
              Risk Assessment
            </span>
            <span className={`text-xs font-semibold ${severityColor}`}>
              {checkedCount === 0
                ? "No flags checked"
                : checkedCount <= 3
                  ? "Low concern"
                  : checkedCount <= 6
                    ? "Probable scam"
                    : "Confirmed scam pattern"}
            </span>
          </div>
          <Progress
            data-ocid="redflags.loading_state"
            value={(checkedCount / totalCount) * 100}
            className="h-2.5"
          />
        </div>
      </div>

      {/* Checklist */}
      <div className="space-y-2.5">
        {RED_FLAGS.map((flag, flagIdx) => {
          const isChecked = !!redFlagChecks[flagIdx];
          return (
            <motion.div
              key={flag.label}
              data-ocid={`redflag.item.${flagIdx + 1}`}
              className={`flex items-center gap-4 rounded-lg border p-4 transition-all cursor-pointer ${
                isChecked
                  ? "border-destructive/30 bg-destructive/6"
                  : "border-border/50 bg-card hover:border-border"
              }`}
              onClick={() => toggleRedFlag(flagIdx)}
              whileHover={{ scale: 1.005 }}
              whileTap={{ scale: 0.998 }}
            >
              <Checkbox
                data-ocid={`redflag.checkbox.${flagIdx + 1}`}
                checked={isChecked}
                onCheckedChange={() => toggleRedFlag(flagIdx)}
                onClick={(e) => e.stopPropagation()}
                className="border-border/60 data-[state=checked]:bg-destructive data-[state=checked]:border-destructive"
              />
              <div className="flex-1 min-w-0">
                <p
                  className={`text-sm ${isChecked ? "text-foreground" : "text-foreground/80"}`}
                >
                  {flag.label}
                </p>
              </div>
              <span
                className={`text-xs font-semibold px-2 py-0.5 rounded border uppercase tracking-wide flex-shrink-0 ${
                  flag.severity === "high" ? "badge-danger" : "badge-warning"
                }`}
              >
                {flag.severity}
              </span>
            </motion.div>
          );
        })}
      </div>

      {/* Interpretation guide */}
      <div className="mt-6 grid sm:grid-cols-3 gap-3">
        {[
          {
            range: "1–3 flags",
            label: "Proceed with caution",
            color: "border-warning/30 bg-warning/5",
            text: "text-warning",
          },
          {
            range: "4–6 flags",
            label: "Probable scam — initiate investigation",
            color: "border-primary/30 bg-primary/5",
            text: "text-primary",
          },
          {
            range: "7–9 flags",
            label: "Confirmed scam pattern — escalate",
            color: "border-destructive/30 bg-destructive/5",
            text: "text-destructive",
          },
        ].map((item) => (
          <div
            key={item.range}
            className={`rounded-lg border ${item.color} p-3.5 text-center`}
          >
            <p className={`font-display font-bold text-base ${item.text}`}>
              {item.range}
            </p>
            <p className="text-xs text-muted-foreground mt-1">{item.label}</p>
          </div>
        ))}
      </div>
    </motion.div>
  );
}

// ─── Section 4: Investigation Steps ────────────────────────────────────────

function InvestigationSection() {
  const [expandedStep, setExpandedStep] = useState<number | null>(null);

  const toggleStep = useCallback((step: number) => {
    setExpandedStep((prev) => (prev === step ? null : step));
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
    >
      <SectionHeader
        icon={<Search className="w-5 h-5" />}
        title="On-Chain Investigation Steps"
        subtitle="A step-by-step forensic workflow for investigators handling Flash USDT cases. Expand each step for detailed instructions."
        badge={{ label: "Module 4 of 6", variant: "info" }}
      />

      <div className="space-y-3">
        {INVESTIGATION_STEPS.map((item) => {
          const isOpen = expandedStep === item.step;
          return (
            <div
              key={item.step}
              data-ocid={`investigation.item.${item.step}`}
              className={`rounded-lg border transition-all ${
                isOpen
                  ? "border-primary/35 bg-primary/5"
                  : "border-border/50 bg-card"
              }`}
            >
              <button
                type="button"
                data-ocid={`investigation.panel.${item.step}`}
                className="w-full flex items-center gap-4 p-4 text-left"
                onClick={() => toggleStep(item.step)}
              >
                <div
                  className={`w-9 h-9 rounded-lg flex items-center justify-center text-sm font-bold font-mono flex-shrink-0 ${
                    isOpen
                      ? "bg-primary/15 text-primary border border-primary/30"
                      : "bg-secondary text-muted-foreground border border-border/40"
                  }`}
                >
                  {item.step}
                </div>
                <div className="flex-1 min-w-0">
                  <p
                    className={`font-display font-semibold text-sm ${isOpen ? "text-foreground" : "text-foreground/85"}`}
                  >
                    {item.title}
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed truncate">
                    {item.summary}
                  </p>
                </div>
                <div
                  className={`flex-shrink-0 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
                >
                  <ChevronDown className="w-4 h-4 text-muted-foreground" />
                </div>
              </button>

              <AnimatePresence>
                {isOpen && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.25 }}
                    className="overflow-hidden"
                  >
                    <div className="px-4 pb-4 pt-1 border-t border-border/30">
                      <p className="text-sm text-foreground/80 leading-relaxed mb-4">
                        {item.detail}
                      </p>
                      {item.tools.length > 0 && (
                        <div>
                          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2.5">
                            Investigation Tools
                          </p>
                          <div className="flex flex-wrap gap-2">
                            {item.tools.map((tool) => (
                              <a
                                key={tool.name}
                                href={tool.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded border border-primary/25 bg-primary/8 text-primary hover:bg-primary/15 transition-colors text-xs font-medium"
                              >
                                <ExternalLink className="w-3 h-3" />
                                {tool.name}
                              </a>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>

      {/* Quick reference */}
      <div className="mt-6">
        <InfoCard title="Key USDT Contract Addresses (Verification Reference)">
          <div className="space-y-2.5">
            {[
              {
                chain: "Ethereum (ERC-20)",
                address: "0xdAC17F958D2ee523a2206206994597C13D831ec7",
                explorer: "etherscan.io",
              },
              {
                chain: "TRON (TRC-20)",
                address: "TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t",
                explorer: "tronscan.org",
              },
              {
                chain: "BNB Chain (BEP-20)",
                address: "0x55d398326f99059fF775485246999027B3197955",
                explorer: "bscscan.com",
              },
            ].map((item) => (
              <div
                key={item.chain}
                className="flex items-center gap-3 bg-secondary/30 rounded px-3 py-2.5 border border-border/30"
              >
                <div className="flex-shrink-0">
                  <p className="text-xs font-semibold text-foreground/90">
                    {item.chain}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {item.explorer}
                  </p>
                </div>
                <code className="flex-1 text-xs font-mono text-primary/85 break-all">
                  {item.address}
                </code>
              </div>
            ))}
          </div>
          <p className="text-xs text-muted-foreground mt-3">
            ⚠ Any token claiming to be USDT with a different contract address is
            fraudulent.
          </p>
        </InfoCard>
      </div>
    </motion.div>
  );
}

// ─── Section 5: Evidence Collection ────────────────────────────────────────

function EvidenceSection() {
  const { evidenceChecks, toggleEvidence } = useApp();

  const checkedCount = Object.values(evidenceChecks).filter(Boolean).length;
  const totalCount = EVIDENCE_ITEMS.length;
  const percentage = Math.round((checkedCount / totalCount) * 100);

  const statusLabel =
    percentage === 100
      ? "Case file complete"
      : percentage >= 75
        ? "Nearly complete"
        : percentage >= 50
          ? "In progress"
          : "Incomplete";

  const statusColor =
    percentage === 100
      ? "text-success"
      : percentage >= 75
        ? "text-primary"
        : percentage >= 50
          ? "text-warning"
          : "text-destructive";

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
    >
      <SectionHeader
        icon={<ClipboardList className="w-5 h-5" />}
        title="Evidence Collection Checklist"
        subtitle="Ensure all required documentation is gathered before proceeding to prosecution. Mark each item as collected."
        badge={{ label: "Module 5 of 6", variant: "info" }}
      />

      {/* Progress */}
      <div className="mb-6 rounded-lg border border-border/50 bg-card p-5">
        <div className="flex items-center justify-between mb-3">
          <div>
            <p className="text-sm font-display font-semibold text-foreground">
              Case File Completeness
            </p>
            <p className={`text-xs mt-0.5 ${statusColor}`}>{statusLabel}</p>
          </div>
          <div className="text-right">
            <p className={`font-display font-bold text-3xl ${statusColor}`}>
              {percentage}%
            </p>
            <p className="text-xs text-muted-foreground">
              {checkedCount}/{totalCount} items
            </p>
          </div>
        </div>
        <Progress
          data-ocid="evidence.loading_state"
          value={percentage}
          className="h-3"
        />
      </div>

      {/* Checklist */}
      <div className="space-y-2.5">
        {EVIDENCE_ITEMS.map((item, evidenceIdx) => {
          const isChecked = !!evidenceChecks[evidenceIdx];
          return (
            <motion.div
              key={item.label}
              data-ocid={`evidence.item.${evidenceIdx + 1}`}
              className={`flex items-center gap-4 rounded-lg border p-4 transition-all cursor-pointer ${
                isChecked
                  ? "border-success/25 bg-success/5"
                  : "border-border/50 bg-card hover:border-border"
              }`}
              onClick={() => toggleEvidence(evidenceIdx)}
              whileHover={{ scale: 1.005 }}
              whileTap={{ scale: 0.998 }}
            >
              <Checkbox
                data-ocid={`evidence.checkbox.${evidenceIdx + 1}`}
                checked={isChecked}
                onCheckedChange={() => toggleEvidence(evidenceIdx)}
                onClick={(e) => e.stopPropagation()}
                className="border-border/60 data-[state=checked]:bg-success data-[state=checked]:border-success"
              />
              <div className="flex-1 min-w-0">
                <p
                  className={`text-sm ${isChecked ? "line-through text-muted-foreground" : "text-foreground/85"}`}
                >
                  {item.label}
                </p>
              </div>
              {isChecked && (
                <CheckCircle2 className="w-4 h-4 text-success flex-shrink-0" />
              )}
            </motion.div>
          );
        })}
      </div>

      {/* Tips */}
      <div className="mt-6">
        <InfoCard title="Documentation Best Practices">
          <ul className="space-y-2.5">
            {[
              "Hash all digital evidence using SHA-256 before storage to preserve chain of custody.",
              "Store communication logs in their native format (not screenshots alone) when possible.",
              "Request official transaction reports from exchanges using formal legal process letters.",
              "Preserve metadata including timestamps, IP addresses, and device fingerprints from screenshots.",
              "Create a secure, encrypted case file and maintain a strict access log.",
            ].map((tip) => (
              <li
                key={tip}
                className="flex items-start gap-2.5 text-sm text-foreground/80"
              >
                <Shield className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                {tip}
              </li>
            ))}
          </ul>
        </InfoCard>
      </div>
    </motion.div>
  );
}

// ─── Section 6: Solutions & Prevention ─────────────────────────────────────

function SolutionsSection() {
  const categories = [
    {
      title: "For Victims",
      icon: <Shield className="w-4 h-4" />,
      color: "border-warning/30 bg-warning/5",
      headingColor: "text-warning",
      items: [
        {
          action:
            "Immediately report to local financial crimes unit or cybercrime division",
          priority: "urgent",
        },
        {
          action:
            "Request account freeze from cryptocurrency exchange if funds were sent to scammer",
          priority: "urgent",
        },
        {
          action:
            'Do NOT send additional funds to the scammer — even if they promise to "fix" it',
          priority: "urgent",
        },
        {
          action:
            "Preserve all communication records: Telegram, WhatsApp, email threads",
          priority: "high",
        },
        {
          action:
            "File a report with national cybercrime authorities (IC3, Action Fraud, etc.)",
          priority: "high",
        },
        {
          action:
            "Seek legal counsel regarding civil recovery options against identified scammers",
          priority: "medium",
        },
      ],
    },
    {
      title: "For Exchanges",
      icon: <TrendingUp className="w-4 h-4" />,
      color: "border-primary/30 bg-primary/5",
      headingColor: "text-primary",
      items: [
        {
          action:
            "Implement enhanced KYC/AML for accounts receiving unusually large USDT deposits from unknown sources",
          priority: "high",
        },
        {
          action:
            "Deploy smart contract scanners to flag non-standard USDT token contract addresses",
          priority: "high",
        },
        {
          action:
            "Block and blacklist known scam-associated wallet addresses proactively",
          priority: "high",
        },
        {
          action:
            "Create automated alerts for deposit patterns matching flash USDT scam signatures",
          priority: "medium",
        },
        {
          action:
            "Require additional verification before processing withdrawals following large incoming transfers",
          priority: "medium",
        },
        {
          action:
            "Share identified scam addresses with industry partners via ISAC channels",
          priority: "medium",
        },
      ],
    },
    {
      title: "For Law Enforcement",
      icon: <ShieldAlert className="w-4 h-4" />,
      color: "border-success/30 bg-success/5",
      headingColor: "text-success",
      items: [
        {
          action:
            "Leverage INTERPOL and Europol frameworks for international cooperation on crypto fraud cases",
          priority: "high",
        },
        {
          action:
            "Use blockchain analytics tools: Chainalysis, Elliptic, CipherTrace for wallet tracing",
          priority: "high",
        },
        {
          action:
            "File Mutual Legal Assistance Treaty (MLAT) requests for offshore scammer asset freezing",
          priority: "high",
        },
        {
          action:
            "Coordinate with cryptocurrency exchanges to obtain KYC data through proper legal channels",
          priority: "high",
        },
        {
          action:
            "Train frontline officers to recognize and properly document crypto fraud case elements",
          priority: "medium",
        },
        {
          action:
            "Establish direct liaison channels with major blockchain analytics companies",
          priority: "medium",
        },
      ],
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
    >
      <SectionHeader
        icon={<Lightbulb className="w-5 h-5" />}
        title="Solutions & Prevention"
        subtitle="Actionable recommendations for victims, financial institutions, and law enforcement agencies."
        badge={{ label: "Module 6 of 6", variant: "info" }}
      />

      <div className="space-y-5">
        {categories.map((cat) => (
          <div key={cat.title} className={`rounded-lg border ${cat.color} p-5`}>
            <div className="flex items-center gap-2.5 mb-4">
              <div
                className={`w-7 h-7 rounded bg-current/10 flex items-center justify-center ${cat.headingColor}`}
              >
                {cat.icon}
              </div>
              <h3
                className={`font-display font-bold text-base ${cat.headingColor}`}
              >
                {cat.title}
              </h3>
            </div>
            <div className="space-y-2.5">
              {cat.items.map((item) => (
                <div key={item.action} className="flex items-start gap-3">
                  <span
                    className={`text-xs font-bold px-1.5 py-0.5 rounded border flex-shrink-0 mt-0.5 font-mono ${
                      item.priority === "urgent"
                        ? "badge-danger"
                        : item.priority === "high"
                          ? "badge-warning"
                          : "badge-info"
                    }`}
                  >
                    {item.priority.toUpperCase()}
                  </span>
                  <p className="text-sm text-foreground/85 leading-relaxed">
                    {item.action}
                  </p>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Analytics tools reference */}
      <div className="mt-5">
        <InfoCard title="Recommended Blockchain Analytics Platforms">
          <div className="grid sm:grid-cols-2 gap-3 mt-1">
            {[
              {
                name: "Chainalysis",
                desc: "Industry leader for crypto tracing and compliance",
                url: "https://www.chainalysis.com",
              },
              {
                name: "Elliptic",
                desc: "Blockchain analytics for financial crime compliance",
                url: "https://www.elliptic.co",
              },
              {
                name: "CipherTrace",
                desc: "Crypto AML and investigation platform by Mastercard",
                url: "https://ciphertrace.com",
              },
              {
                name: "TRM Labs",
                desc: "Blockchain intelligence for risk management",
                url: "https://www.trmlabs.com",
              },
            ].map((tool) => (
              <a
                key={tool.name}
                href={tool.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-start gap-3 rounded-lg border border-border/50 bg-secondary/30 p-3.5 hover:border-primary/30 hover:bg-primary/5 transition-all group"
              >
                <ExternalLink className="w-4 h-4 text-muted-foreground group-hover:text-primary mt-0.5 flex-shrink-0 transition-colors" />
                <div>
                  <p className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors">
                    {tool.name}
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {tool.desc}
                  </p>
                </div>
              </a>
            ))}
          </div>
        </InfoCard>
      </div>
    </motion.div>
  );
}

// ─── Section 7: Session Summary ─────────────────────────────────────────────

function SummarySection() {
  const { visitedSections, redFlagChecks, evidenceChecks, setActiveSection } =
    useApp();
  const printRef = useRef<HTMLDivElement>(null);

  const moduleSections = NAV_ITEMS.filter((n) => n.id !== "summary");
  const visitedCount = moduleSections.filter((n) =>
    visitedSections.has(n.id),
  ).length;

  const redFlagCheckedCount =
    Object.values(redFlagChecks).filter(Boolean).length;
  const evidenceCheckedCount =
    Object.values(evidenceChecks).filter(Boolean).length;

  const checkedRedFlags = RED_FLAGS.filter((_, i) => redFlagChecks[i]);
  const checkedEvidence = EVIDENCE_ITEMS.filter((_, i) => evidenceChecks[i]);

  const handlePrint = useCallback(() => {
    toast.success("Preparing print view…", { duration: 2000 });
    setTimeout(() => window.print(), 400);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
    >
      <SectionHeader
        icon={<TrendingUp className="w-5 h-5" />}
        title="Session Summary"
        subtitle="Overview of training progress, checklist results, and preparation for filing."
        badge={{ label: "Final Report", variant: "success" }}
      />

      {/* Progress overview */}
      <div className="grid sm:grid-cols-3 gap-4 mb-6">
        {[
          {
            label: "Modules Visited",
            value: `${visitedCount}/6`,
            color: "text-primary",
            sub: "Training progress",
          },
          {
            label: "Red Flags Identified",
            value: `${redFlagCheckedCount}/9`,
            color:
              redFlagCheckedCount >= 7 ? "text-destructive" : "text-warning",
            sub:
              redFlagCheckedCount >= 7
                ? "Confirmed scam"
                : redFlagCheckedCount >= 4
                  ? "Probable scam"
                  : "Low flags",
          },
          {
            label: "Evidence Collected",
            value: `${evidenceCheckedCount}/8`,
            color: evidenceCheckedCount === 8 ? "text-success" : "text-warning",
            sub: evidenceCheckedCount === 8 ? "File complete" : "Incomplete",
          },
        ].map((stat) => (
          <div
            key={stat.label}
            className="rounded-lg border border-border/50 bg-card p-5 text-center"
          >
            <p className={`font-display font-bold text-3xl ${stat.color}`}>
              {stat.value}
            </p>
            <p className="text-sm font-semibold text-foreground mt-1">
              {stat.label}
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">{stat.sub}</p>
          </div>
        ))}
      </div>

      {/* Module completion */}
      <InfoCard title="Module Completion Status" className="mb-5">
        <div className="space-y-2">
          {moduleSections.map((item) => {
            const visited = visitedSections.has(item.id);
            return (
              <div key={item.id} className="flex items-center gap-3">
                <div
                  className={`w-5 h-5 rounded flex items-center justify-center flex-shrink-0 ${
                    visited
                      ? "bg-success/15 text-success"
                      : "bg-secondary text-muted-foreground"
                  }`}
                >
                  {visited ? (
                    <CheckCircle2 className="w-3.5 h-3.5" />
                  ) : (
                    <ChevronRight className="w-3.5 h-3.5" />
                  )}
                </div>
                <p
                  className={`text-sm flex-1 ${visited ? "text-foreground" : "text-muted-foreground"}`}
                >
                  {item.label}
                </p>
                <button
                  type="button"
                  className="text-xs text-primary hover:text-primary/80 transition-colors"
                  onClick={() => setActiveSection(item.id)}
                >
                  {visited ? "Review" : "Visit →"}
                </button>
              </div>
            );
          })}
        </div>
      </InfoCard>

      {/* Flagged items summary */}
      <div className="grid md:grid-cols-2 gap-4 mb-5" ref={printRef}>
        <InfoCard title={`Confirmed Red Flags (${redFlagCheckedCount})`}>
          {checkedRedFlags.length === 0 ? (
            <p
              data-ocid="summary.empty_state"
              className="text-sm text-muted-foreground italic"
            >
              No red flags checked yet.
            </p>
          ) : (
            <ul className="space-y-1.5">
              {checkedRedFlags.map((flag) => (
                <li
                  key={flag.label}
                  className="flex items-start gap-2 text-sm text-foreground/80"
                >
                  <AlertTriangle className="w-3.5 h-3.5 text-destructive mt-0.5 flex-shrink-0" />
                  {flag.label}
                </li>
              ))}
            </ul>
          )}
        </InfoCard>

        <InfoCard title={`Evidence Collected (${evidenceCheckedCount})`}>
          {checkedEvidence.length === 0 ? (
            <p className="text-sm text-muted-foreground italic">
              No evidence items checked yet.
            </p>
          ) : (
            <ul className="space-y-1.5">
              {checkedEvidence.map((item) => (
                <li
                  key={item.label}
                  className="flex items-start gap-2 text-sm text-foreground/80"
                >
                  <CheckCircle2 className="w-3.5 h-3.5 text-success mt-0.5 flex-shrink-0" />
                  {item.label}
                </li>
              ))}
            </ul>
          )}
        </InfoCard>
      </div>

      {/* Print button */}
      <div className="flex items-center justify-between rounded-lg border border-primary/25 bg-primary/5 p-5">
        <div>
          <p className="font-display font-semibold text-foreground">
            Print Investigation Report
          </p>
          <p className="text-xs text-muted-foreground mt-0.5">
            Generate a print-ready summary of this session for your case file.
          </p>
        </div>
        <Button
          data-ocid="summary.primary_button"
          onClick={handlePrint}
          className="bg-primary text-primary-foreground hover:bg-primary/90 font-semibold gap-2"
        >
          <Printer className="w-4 h-4" />
          Print Report
        </Button>
      </div>
    </motion.div>
  );
}

// ─── Sidebar ────────────────────────────────────────────────────────────────

function Sidebar({
  isMobileOpen,
  onClose,
}: {
  isMobileOpen: boolean;
  onClose: () => void;
}) {
  const { activeSection, visitedSections, setActiveSection } = useApp();
  const moduleCount = NAV_ITEMS.filter(
    (n) => n.id !== "summary" && visitedSections.has(n.id),
  ).length;

  const handleNav = useCallback(
    (id: SectionId) => {
      setActiveSection(id);
      onClose();
    },
    [setActiveSection, onClose],
  );

  return (
    <>
      {/* Mobile overlay */}
      <AnimatePresence>
        {isMobileOpen && (
          <motion.div
            className="fixed inset-0 z-30 bg-background/70 backdrop-blur-sm lg:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
        )}
      </AnimatePresence>

      {/* Sidebar panel */}
      <aside
        className={`sidebar-nav fixed lg:static inset-y-0 left-0 z-40 w-64 flex flex-col bg-sidebar border-r border-sidebar-border transition-transform duration-300 lg:translate-x-0 ${
          isMobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Logo area */}
        <div className="px-5 py-5 border-b border-sidebar-border">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-9 h-9 rounded-lg bg-primary/15 border border-primary/25 flex items-center justify-center">
              <ShieldAlert className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="font-display font-bold text-sm text-sidebar-foreground leading-tight">
                CIB Training
              </p>
              <p className="text-[10px] text-muted-foreground">
                Flash USDT Investigation
              </p>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest">
              Modules visited
            </span>
            <span className="text-xs font-bold font-mono text-primary">
              {moduleCount}/6
            </span>
          </div>
          <Progress value={(moduleCount / 6) * 100} className="mt-1.5 h-1.5" />
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-3 px-3">
          {NAV_ITEMS.map((item) => {
            const isActive = activeSection === item.id;
            const isVisited = visitedSections.has(item.id);
            const isSummary = item.id === "summary";

            return (
              <button
                type="button"
                key={item.id}
                data-ocid={`nav.${item.id.replace(/-/g, "_")}.link`}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg mb-1 text-left transition-all ${
                  isActive
                    ? "bg-primary/12 text-primary border border-primary/20"
                    : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground border border-transparent"
                } ${isSummary ? "mt-2 border-t border-sidebar-border pt-3 rounded-none rounded-b-lg" : ""}`}
                onClick={() => handleNav(item.id)}
              >
                <div
                  className={`flex-shrink-0 ${isActive ? "text-primary" : "text-muted-foreground"}`}
                >
                  {item.icon}
                </div>
                <span className="text-sm font-medium flex-1 truncate">
                  {item.label}
                </span>
                {!isSummary && (
                  <div
                    className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${
                      isActive
                        ? "bg-primary"
                        : isVisited
                          ? "bg-success/60"
                          : "bg-border"
                    }`}
                  />
                )}
                {isSummary && (
                  <FileText className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />
                )}
              </button>
            );
          })}
        </nav>

        {/* Bottom badge */}
        <div className="px-4 py-4 border-t border-sidebar-border">
          <div className="rounded-lg bg-destructive/8 border border-destructive/20 px-3 py-2.5 text-center">
            <p className="text-[10px] font-bold text-destructive uppercase tracking-widest">
              ⚠ Restricted Material
            </p>
            <p className="text-[10px] text-muted-foreground mt-0.5">
              For law enforcement use only
            </p>
          </div>
        </div>
      </aside>
    </>
  );
}

// ─── App ────────────────────────────────────────────────────────────────────

export default function App() {
  const [activeSection, setActiveSectionRaw] = useState<SectionId>("what-is");
  const [visitedSections, setVisitedSections] = useState<Set<SectionId>>(
    new Set(["what-is"]),
  );
  const [redFlagChecks, setRedFlagChecks] = useState<Record<number, boolean>>(
    {},
  );
  const [evidenceChecks, setEvidenceChecks] = useState<Record<number, boolean>>(
    {},
  );
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const setActiveSection = useCallback((id: SectionId) => {
    setActiveSectionRaw(id);
    setVisitedSections((prev) => {
      if (prev.has(id)) return prev;
      return new Set([...prev, id]);
    });
  }, []);

  const markVisited = useCallback((id: SectionId) => {
    setVisitedSections((prev) => new Set([...prev, id]));
  }, []);

  const toggleRedFlag = useCallback((idx: number) => {
    setRedFlagChecks((prev) => ({ ...prev, [idx]: !prev[idx] }));
  }, []);

  const toggleEvidence = useCallback((idx: number) => {
    setEvidenceChecks((prev) => ({ ...prev, [idx]: !prev[idx] }));
  }, []);

  const currentNavItem = NAV_ITEMS.find((n) => n.id === activeSection)!;
  const currentIdx = NAV_ITEMS.findIndex((n) => n.id === activeSection);

  const goNext = useCallback(() => {
    const next = NAV_ITEMS[currentIdx + 1];
    if (next) setActiveSection(next.id);
  }, [currentIdx, setActiveSection]);

  const goPrev = useCallback(() => {
    const prev = NAV_ITEMS[currentIdx - 1];
    if (prev) setActiveSection(prev.id);
  }, [currentIdx, setActiveSection]);

  const currentYear = new Date().getFullYear();

  return (
    <AppContext.Provider
      value={{
        activeSection,
        visitedSections,
        redFlagChecks,
        evidenceChecks,
        setActiveSection,
        markVisited,
        toggleRedFlag,
        toggleEvidence,
      }}
    >
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: "oklch(0.15 0.022 245)",
            border: "1px solid oklch(0.24 0.020 246)",
            color: "oklch(0.92 0.012 220)",
          },
        }}
      />

      <div className="min-h-screen flex flex-col">
        {/* ── Top Bar ── */}
        <header className="no-print sticky top-0 z-50 border-b border-border/50 bg-background/90 backdrop-blur-xl">
          <div className="flex items-center gap-4 px-4 h-14">
            {/* Mobile menu button */}
            <button
              type="button"
              data-ocid="nav.mobile.toggle"
              className="lg:hidden w-9 h-9 flex items-center justify-center rounded-lg border border-border/50 text-muted-foreground hover:text-foreground hover:bg-secondary/50 transition-all"
              onClick={() => setMobileMenuOpen((o) => !o)}
              aria-label="Toggle navigation"
            >
              <div className="space-y-1.5">
                <span className="block w-4 h-0.5 bg-current" />
                <span className="block w-4 h-0.5 bg-current" />
                <span className="block w-3 h-0.5 bg-current" />
              </div>
            </button>

            <div className="flex-1 min-w-0">
              <h1 className="font-display font-bold text-sm text-foreground truncate">
                Flash USDT Scam: Investigation & Awareness Training
              </h1>
              <p className="text-[10px] text-muted-foreground hidden sm:block">
                {currentNavItem.label} · Module {currentIdx + 1} of{" "}
                {NAV_ITEMS.length}
              </p>
            </div>

            <Badge className="badge-danger border font-mono text-[10px] uppercase tracking-widest hidden sm:flex">
              For Law Enforcement Use
            </Badge>
          </div>
        </header>

        {/* ── Body ── */}
        <div className="flex flex-1 min-h-0 overflow-hidden">
          <Sidebar
            isMobileOpen={mobileMenuOpen}
            onClose={() => setMobileMenuOpen(false)}
          />

          {/* ── Main Content ── */}
          <div className="flex-1 min-w-0 flex flex-col overflow-auto">
            <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
              <AnimatePresence mode="wait">
                <motion.div key={activeSection}>
                  {activeSection === "what-is" && <WhatIsSection />}
                  {activeSection === "live-demo" && <LiveDemoSection />}
                  {activeSection === "red-flags" && <RedFlagsSection />}
                  {activeSection === "investigation" && (
                    <InvestigationSection />
                  )}
                  {activeSection === "evidence" && <EvidenceSection />}
                  {activeSection === "solutions" && <SolutionsSection />}
                  {activeSection === "summary" && <SummarySection />}
                </motion.div>
              </AnimatePresence>

              {/* Prev / Next navigation */}
              <div className="no-print mt-10 flex items-center justify-between border-t border-border/40 pt-5">
                <Button
                  data-ocid="nav.pagination_prev"
                  variant="outline"
                  size="sm"
                  onClick={goPrev}
                  disabled={currentIdx === 0}
                  className="border-border/50 text-muted-foreground hover:text-foreground gap-2 disabled:opacity-30"
                >
                  ← Previous
                </Button>
                <span className="text-xs text-muted-foreground font-mono">
                  {currentIdx + 1} / {NAV_ITEMS.length}
                </span>
                <Button
                  data-ocid="nav.pagination_next"
                  variant="outline"
                  size="sm"
                  onClick={goNext}
                  disabled={currentIdx === NAV_ITEMS.length - 1}
                  className="border-border/50 text-muted-foreground hover:text-foreground gap-2 disabled:opacity-30"
                >
                  Next →
                </Button>
              </div>
            </main>

            {/* Footer */}
            <footer className="no-print border-t border-border/30 py-4 px-4 sm:px-6 lg:px-8">
              <div className="max-w-4xl mx-auto flex items-center justify-between">
                <p className="text-xs text-muted-foreground/50">
                  © {currentYear}. Built with{" "}
                  <span className="text-primary/60">♥</span> using{" "}
                  <a
                    href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(typeof window !== "undefined" ? window.location.hostname : "")}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary/60 hover:text-primary transition-colors"
                  >
                    caffeine.ai
                  </a>
                </p>
                <p className="text-[10px] font-mono text-muted-foreground/30 uppercase tracking-widest">
                  Training Material — Confidential
                </p>
              </div>
            </footer>
          </div>
        </div>
      </div>
    </AppContext.Provider>
  );
}
