import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TrendingUp, TrendingDown, Clock, Check, ChevronRight, Sparkles, Calendar, DollarSign, Users, Bell, Settings, BarChart3, Zap, ArrowUpRight, MessageSquare, Cloud, CloudRain, Sun, MapPin, Gift, Heart, Activity, Brain } from 'lucide-react';

// ─── Design tokens ──────────────────────────────────────────────────────────
const tokens = {
  cream: '#FAF7F2',
  paper: '#F4EFE6',
  ink: '#1A1A1A',
  inkSoft: '#2C2A26',
  mute: '#6B645A',
  muteSoft: '#9A9287',
  line: '#E8E1D3',
  accent: '#C8532C',      // terracotta
  accentSoft: '#E8A88F',
  sage: '#7A8B6F',        // healthy
  sageSoft: '#C8D3BD',
  rust: '#B8604A',        // at-risk
  rustSoft: '#E8BFB0',
  gold: '#C8A96A',        // peak
  goldSoft: '#EAD9B4',
};

// ─── Fonts load ─────────────────────────────────────────────────────────────
const FontLoader = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,500;9..144,600;9..144,700&family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@400;500;600&display=swap');
    * { -webkit-font-smoothing: antialiased; -moz-osx-font-smoothing: grayscale; }
    body { margin: 0; }
    .paper-grain {
      background-image:
        radial-gradient(ellipse at top left, rgba(200, 83, 44, 0.03), transparent 50%),
        radial-gradient(ellipse at bottom right, rgba(122, 139, 111, 0.03), transparent 50%);
    }
  `}</style>
);

// ─── Fake data ──────────────────────────────────────────────────────────────
const stylists = [
  { id: 'maria', name: 'Maria Chen', role: 'Senior Stylist', avatar: 'MC' },
  { id: 'jordan', name: 'Jordan Park', role: 'Colorist', avatar: 'JP' },
  { id: 'sofia', name: 'Sofia Reyes', role: 'Stylist', avatar: 'SR' },
  { id: 'ava', name: 'Ava Lindqvist', role: 'Junior Stylist', avatar: 'AL' },
];

const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const hours = ['9a', '10a', '11a', '12p', '1p', '2p', '3p', '4p', '5p', '6p', '7p'];

// Generate a realistic week: Sat packed, Tue/Wed afternoon dead
const generateHeatmap = () => {
  const map = {};
  days.forEach((day, dIdx) => {
    hours.forEach((hour, hIdx) => {
      let status;
      const key = `${day}-${hour}`;
      // Saturday — mostly packed, peak pricing
      if (day === 'Sat') {
        status = hIdx < 8 ? 'peak' : 'healthy';
      }
      // Friday evening — healthy
      else if (day === 'Fri' && hIdx >= 4) {
        status = hIdx >= 7 ? 'peak' : 'healthy';
      }
      // Sunday afternoon
      else if (day === 'Sun') {
        status = hIdx >= 2 && hIdx <= 6 ? 'healthy' : 'at-risk';
      }
      // Tuesday — the dead day
      else if (day === 'Tue') {
        status = hIdx >= 3 && hIdx <= 7 ? 'at-risk' : (hIdx < 3 ? 'healthy' : 'empty');
      }
      // Wednesday afternoons dead
      else if (day === 'Wed') {
        status = hIdx >= 4 && hIdx <= 7 ? 'at-risk' : 'healthy';
      }
      // Thursday
      else if (day === 'Thu') {
        status = hIdx === 5 || hIdx === 6 ? 'at-risk' : 'healthy';
      }
      // Monday
      else {
        status = hIdx >= 5 && hIdx <= 7 ? 'healthy' : (hIdx < 2 ? 'at-risk' : 'healthy');
      }
      map[key] = status;
    });
  });
  return map;
};

const heatmap = generateHeatmap();

// ─── Scenarios — toggle between small and large business ────────────────────
const scenarios = {
  luna: {
    id: 'luna',
    label: 'Independent Salon',
    sizeLabel: 'Small business',
    business: {
      name: 'Luna Hair Studio',
      location: 'Williamsburg, Brooklyn',
      owner: 'Elena Chen',
      ownerInitials: 'EC',
      subtitle: '4 stylists · 1 location',
    },
    metrics: {
      revenueRecovered: 1847,
      slotsFilled: 27,
      fee: 277,
      revenueLift: 23,
      baselineWeekly: 11800,
      annualRecoveryLow: 68000,
      annualRecoveryHigh: 96000,
    },
    staff: [
      { id: 'maria', name: 'Maria Chen', role: 'Senior Stylist', avatar: 'MC' },
      { id: 'jordan', name: 'Jordan Park', role: 'Colorist', avatar: 'JP' },
      { id: 'sofia', name: 'Sofia Reyes', role: 'Stylist', avatar: 'SR' },
      { id: 'ava', name: 'Ava Lindqvist', role: 'Junior Stylist', avatar: 'AL' },
    ],
    recentFills: [
      { id: 1, time: 'Tue 2:00p', stylist: 'Maria Chen', service: 'Cut & Style', original: 85, filled: 68, customer: 'Jess R.', when: '12 min ago' },
      { id: 2, time: 'Wed 3:30p', stylist: 'Sofia Reyes', service: 'Blowout', original: 55, filled: 42, customer: 'Amanda K.', when: '47 min ago' },
      { id: 3, time: 'Tue 4:00p', stylist: 'Jordan Park', service: 'Color Refresh', original: 120, filled: 96, customer: 'Priya S.', when: '2h ago' },
      { id: 4, time: 'Thu 2:30p', stylist: 'Ava Lindqvist', service: 'Cut & Style', original: 65, filled: 52, customer: 'Maya T.', when: '3h ago' },
    ],
    atRiskSlots: [
      { id: 'a1', time: 'Tomorrow 2:00p', stylist: 'Maria Chen', service: 'Cut & Style', suggested: 68, original: 85, probability: 78 },
      { id: 'a2', time: 'Tomorrow 3:30p', stylist: 'Jordan Park', service: 'Gloss Treatment', suggested: 72, original: 90, probability: 65 },
      { id: 'a3', time: 'Wed 4:00p', stylist: 'Sofia Reyes', service: 'Blowout', suggested: 42, original: 55, probability: 82 },
    ],
    booking: {
      serviceName: "Women's Cut & Style · 60 min",
      Tue: [
        { time: '10:00 AM', stylist: 'Sofia Reyes', price: 65, base: 65, badge: null },
        { time: '12:00 PM', stylist: 'Ava Lindqvist', price: 58, base: 65, badge: 'Limited' },
        { time: '2:00 PM', stylist: 'Maria Chen', price: 52, base: 65, badge: 'Limited' },
        { time: '3:30 PM', stylist: 'Jordan Park', price: 52, base: 65, badge: 'Limited' },
        { time: '5:00 PM', stylist: 'Sofia Reyes', price: 58, base: 65, badge: null },
      ],
      Sat: [
        { time: '9:00 AM', stylist: 'Maria Chen', price: 78, base: 65, badge: 'Peak time' },
        { time: '10:30 AM', stylist: 'Jordan Park', price: 72, base: 65, badge: null },
        { time: '12:00 PM', stylist: 'Sofia Reyes', price: 72, base: 65, badge: null },
        { time: '2:00 PM', stylist: 'Maria Chen', price: 78, base: 65, badge: 'Almost full' },
      ],
    },
    elasticity: [
      { price: 42, fillRate: 98, label: 'Floor' },
      { price: 48, fillRate: 96 },
      { price: 52, fillRate: 94 },
      { price: 58, fillRate: 88 },
      { price: 65, fillRate: 72, label: 'Base' },
      { price: 72, fillRate: 61 },
      { price: 78, fillRate: 48 },
      { price: 85, fillRate: 32 },
      { price: 92, fillRate: 18, label: 'Ceiling' },
    ],
    elasticityService: 'Cut & Style',
    elasticityDomain: { min: 35, span: 60, ticks: [42, 52, 65, 78, 92] },
    elasticityTakeaway: 'Below $58 fill rate barely improves — you\'d be leaving money on the table. Above $78 demand falls off a cliff. Your sweet zone is $52–$72 depending on the slot.',
  },
  meridian: {
    id: 'meridian',
    label: 'Luxury Day Spa',
    sizeLabel: 'Larger business',
    business: {
      name: 'Meridian Spa & Wellness',
      location: 'Flatiron, Manhattan',
      owner: 'Lena Morales',
      ownerInitials: 'LM',
      subtitle: '22 treatment rooms · 38 staff',
    },
    metrics: {
      revenueRecovered: 47280,
      slotsFilled: 312,
      fee: 7092,
      revenueLift: 19,
      baselineWeekly: 248000,
      annualRecoveryLow: 2100000,
      annualRecoveryHigh: 2800000,
    },
    staff: [
      { id: 'aria', name: 'Aria Volkov', role: 'Lead Aesthetician', avatar: 'AV' },
      { id: 'kai', name: 'Kai Nakamura', role: 'Massage Therapist', avatar: 'KN' },
      { id: 'yuki', name: 'Yuki Tanaka', role: 'Medical Aesthetician', avatar: 'YT' },
      { id: 'noor', name: 'Noor Hassan', role: 'Body Treatment Specialist', avatar: 'NH' },
    ],
    recentFills: [
      { id: 1, time: 'Tue 1:00p', stylist: 'Aria Volkov', service: 'HydraFacial Platinum', original: 425, filled: 340, customer: 'Catherine W.', when: '8 min ago' },
      { id: 2, time: 'Tue 2:30p', stylist: 'Kai Nakamura', service: '90-min Deep Tissue', original: 280, filled: 224, customer: 'Rebecca M.', when: '22 min ago' },
      { id: 3, time: 'Wed 11:00a', stylist: 'Yuki Tanaka', service: 'Microneedling + PRP', original: 680, filled: 578, customer: 'Diana K.', when: '41 min ago' },
      { id: 4, time: 'Thu 3:00p', stylist: 'Noor Hassan', service: 'Signature Body Ritual', original: 385, filled: 308, customer: 'Sophia L.', when: '1h ago' },
    ],
    atRiskSlots: [
      { id: 'b1', time: 'Tomorrow 11:00a', stylist: 'Aria Volkov', service: 'HydraFacial Platinum', suggested: 340, original: 425, probability: 81 },
      { id: 'b2', time: 'Tomorrow 2:00p', stylist: 'Yuki Tanaka', service: 'Laser Hair Removal', suggested: 280, original: 350, probability: 74 },
      { id: 'b3', time: 'Wed 3:30p', stylist: 'Kai Nakamura', service: '60-min Swedish', original: 210, suggested: 168, probability: 86 },
    ],
    booking: {
      serviceName: 'HydraFacial Platinum · 75 min',
      Tue: [
        { time: '10:00 AM', stylist: 'Aria Volkov', price: 425, base: 425, badge: null },
        { time: '12:00 PM', stylist: 'Yuki Tanaka', price: 380, base: 425, badge: 'Limited' },
        { time: '1:30 PM', stylist: 'Aria Volkov', price: 340, base: 425, badge: 'Limited' },
        { time: '3:00 PM', stylist: 'Noor Hassan', price: 340, base: 425, badge: 'Limited' },
        { time: '4:30 PM', stylist: 'Yuki Tanaka', price: 380, base: 425, badge: null },
      ],
      Sat: [
        { time: '9:00 AM', stylist: 'Aria Volkov', price: 495, base: 425, badge: 'Peak time' },
        { time: '10:30 AM', stylist: 'Yuki Tanaka', price: 475, base: 425, badge: null },
        { time: '12:00 PM', stylist: 'Aria Volkov', price: 475, base: 425, badge: null },
        { time: '2:00 PM', stylist: 'Noor Hassan', price: 495, base: 425, badge: 'Almost full' },
      ],
    },
    elasticity: [
      { price: 280, fillRate: 97, label: 'Floor' },
      { price: 320, fillRate: 94 },
      { price: 360, fillRate: 88 },
      { price: 400, fillRate: 78 },
      { price: 425, fillRate: 70, label: 'Base' },
      { price: 460, fillRate: 58 },
      { price: 495, fillRate: 46 },
      { price: 535, fillRate: 30 },
      { price: 575, fillRate: 14, label: 'Ceiling' },
    ],
    elasticityService: 'HydraFacial Platinum',
    elasticityDomain: { min: 240, span: 380, ticks: [280, 340, 425, 495, 575] },
    elasticityTakeaway: 'Below $400 fill rate gains flatten — you\'re burning margin. Above $495 demand collapses among your high-value clientele. Optimal band is $400–$475 depending on the room and therapist.',
  },
};

// ─── Shared UI bits ─────────────────────────────────────────────────────────
const Logo = ({ size = 20 }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <path d="M4 14 Q 8 4, 12 14 T 20 14" stroke={tokens.accent} strokeWidth="2.5" strokeLinecap="round" fill="none" />
      <circle cx="8" cy="14" r="1.5" fill={tokens.accent} />
      <circle cx="16" cy="14" r="1.5" fill={tokens.accent} />
    </svg>
    <span style={{ fontFamily: 'Fraunces, serif', fontWeight: 600, fontSize: size * 0.95, letterSpacing: '-0.02em', color: tokens.ink }}>
      Offpeak
    </span>
  </div>
);

const Pill = ({ children, tone = 'neutral' }) => {
  const tones = {
    neutral: { bg: tokens.paper, fg: tokens.mute, border: tokens.line },
    sage: { bg: tokens.sageSoft, fg: '#4A5C41', border: 'transparent' },
    rust: { bg: tokens.rustSoft, fg: '#7A3520', border: 'transparent' },
    gold: { bg: tokens.goldSoft, fg: '#6B5320', border: 'transparent' },
    ink: { bg: tokens.ink, fg: tokens.cream, border: 'transparent' },
  };
  const t = tones[tone];
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 4,
      padding: '3px 9px', borderRadius: 999,
      background: t.bg, color: t.fg, border: `1px solid ${t.border}`,
      fontFamily: 'Inter, sans-serif', fontSize: 11, fontWeight: 500, letterSpacing: '0.02em',
    }}>
      {children}
    </span>
  );
};

// ─── View 1: Owner Dashboard ────────────────────────────────────────────────
const OwnerDashboard = ({ scenario }) => {
  const [hoveredCell, setHoveredCell] = useState(null);
  const [approvedSlots, setApprovedSlots] = useState([]);
  const [animatedRevenue, setAnimatedRevenue] = useState(0);
  const targetRevenue = scenario.metrics.revenueRecovered;

  useEffect(() => {
    setApprovedSlots([]);
    setAnimatedRevenue(0);
    const duration = 1200;
    const start = Date.now();
    const tick = () => {
      const elapsed = Date.now() - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setAnimatedRevenue(Math.floor(targetRevenue * eased));
      if (progress < 1) requestAnimationFrame(tick);
    };
    tick();
  }, [scenario.id, targetRevenue]);

  const cellColor = (status) => ({
    empty: { bg: tokens.cream, border: tokens.line, dot: 'transparent' },
    'at-risk': { bg: tokens.rustSoft, border: tokens.rust, dot: tokens.rust },
    healthy: { bg: tokens.sageSoft, border: tokens.sage, dot: tokens.sage },
    peak: { bg: tokens.goldSoft, border: tokens.gold, dot: tokens.gold },
  }[status]);

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '240px 1fr', minHeight: 'calc(100vh - 60px)', background: tokens.cream }} className="paper-grain">
      {/* Sidebar */}
      <aside style={{ borderRight: `1px solid ${tokens.line}`, padding: '24px 18px', display: 'flex', flexDirection: 'column', gap: 4 }}>
        <div style={{ padding: '8px 10px', marginBottom: 20 }}>
          <div style={{ fontFamily: 'Inter, sans-serif', fontSize: 11, color: tokens.muteSoft, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6 }}>Business</div>
          <div style={{ fontFamily: 'Fraunces, serif', fontSize: 17, fontWeight: 600, color: tokens.ink, letterSpacing: '-0.01em' }}>{scenario.business.name}</div>
          <div style={{ fontFamily: 'Inter, sans-serif', fontSize: 12, color: tokens.mute, marginTop: 2 }}>{scenario.business.location}</div>
        </div>

        {[
          { icon: BarChart3, label: 'Overview', active: true },
          { icon: Calendar, label: 'Calendar' },
          { icon: Zap, label: 'At-risk slots', badge: scenario.atRiskSlots.length },
          { icon: Users, label: scenario.id === 'meridian' ? 'Therapists' : 'Stylists' },
          { icon: Bell, label: 'Offers sent' },
          { icon: Settings, label: 'Pricing rules' },
        ].map((item, i) => (
          <div key={i} style={{
            display: 'flex', alignItems: 'center', gap: 10,
            padding: '9px 10px', borderRadius: 6,
            background: item.active ? tokens.paper : 'transparent',
            color: item.active ? tokens.ink : tokens.mute,
            fontFamily: 'Inter, sans-serif', fontSize: 13, fontWeight: item.active ? 500 : 400,
            cursor: 'pointer', position: 'relative',
          }}>
            <item.icon size={15} strokeWidth={1.8} />
            <span style={{ flex: 1 }}>{item.label}</span>
            {item.badge && (
              <span style={{
                background: tokens.accent, color: tokens.cream,
                fontFamily: 'JetBrains Mono, monospace', fontSize: 10, fontWeight: 600,
                padding: '1px 6px', borderRadius: 999,
              }}>{item.badge}</span>
            )}
          </div>
        ))}

        <div style={{ marginTop: 'auto', padding: '12px 10px', borderTop: `1px solid ${tokens.line}`, paddingTop: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
            <div style={{ width: 30, height: 30, borderRadius: '50%', background: tokens.ink, color: tokens.cream, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Inter, sans-serif', fontSize: 11, fontWeight: 600 }}>{scenario.business.ownerInitials}</div>
            <div>
              <div style={{ fontFamily: 'Inter, sans-serif', fontSize: 12, fontWeight: 500, color: tokens.ink }}>{scenario.business.owner}</div>
              <div style={{ fontFamily: 'Inter, sans-serif', fontSize: 11, color: tokens.mute }}>Owner</div>
            </div>
          </div>
        </div>
      </aside>

      {/* Main */}
      <main style={{ padding: '32px 40px', overflow: 'auto' }}>
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
          <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 4 }}>
            <div>
              <div style={{ fontFamily: 'Inter, sans-serif', fontSize: 12, color: tokens.mute, fontWeight: 500, letterSpacing: '0.04em', textTransform: 'uppercase', marginBottom: 6 }}>This week — Mar 17 to Mar 23</div>
              <h1 style={{ fontFamily: 'Fraunces, serif', fontSize: 32, fontWeight: 500, color: tokens.ink, margin: 0, letterSpacing: '-0.02em' }}>Good morning, {scenario.business.owner.split(' ')[0]}.</h1>
              <div style={{ fontFamily: 'Inter, sans-serif', fontSize: 13, color: tokens.mute, marginTop: 6 }}>{scenario.business.subtitle}</div>
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <Pill tone="sage"><span style={{ width: 6, height: 6, borderRadius: '50%', background: tokens.sage, display: 'inline-block' }} /> Live</Pill>
              <Pill tone="neutral">Synced with {scenario.id === 'meridian' ? 'Mindbody' : 'Square'} · 2m ago</Pill>
            </div>
          </div>
        </motion.div>

        {/* Revenue row */}
        <motion.div
          key={scenario.id}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          style={{ marginTop: 28, display: 'grid', gridTemplateColumns: '1.4fr 1fr 1fr', gap: 16 }}
        >
          {/* Hero revenue card */}
          <div style={{ gridColumn: 'span 1', background: tokens.ink, color: tokens.cream, borderRadius: 12, padding: '28px 32px', position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', top: -40, right: -40, width: 180, height: 180, borderRadius: '50%', background: `radial-gradient(circle, ${tokens.accent}, transparent 70%)`, opacity: 0.25 }} />
            <div style={{ fontFamily: 'Inter, sans-serif', fontSize: 11, letterSpacing: '0.08em', textTransform: 'uppercase', opacity: 0.6, marginBottom: 12 }}>Revenue recovered this week</div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
              <span style={{ fontFamily: 'Fraunces, serif', fontSize: 14, opacity: 0.7 }}>$</span>
              <span style={{ fontFamily: 'Fraunces, serif', fontSize: 54, fontWeight: 500, letterSpacing: '-0.03em', lineHeight: 1 }}>
                {animatedRevenue.toLocaleString()}
              </span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 14, fontFamily: 'Inter, sans-serif', fontSize: 13 }}>
              <TrendingUp size={14} strokeWidth={2.2} style={{ color: tokens.sageSoft }} />
              <span style={{ color: tokens.sageSoft, fontWeight: 500 }}>+{scenario.metrics.revenueLift}%</span>
              <span style={{ opacity: 0.5 }}>vs your baseline</span>
            </div>
            <div style={{ marginTop: 14, paddingTop: 14, borderTop: '1px solid rgba(255,255,255,0.1)', fontFamily: 'Inter, sans-serif', fontSize: 12, opacity: 0.75 }}>
              On pace for <span style={{ color: tokens.accentSoft, fontWeight: 600 }}>${(scenario.metrics.annualRecoveryLow / 1000000).toFixed(1)}M–${(scenario.metrics.annualRecoveryHigh / 1000000).toFixed(1)}M</span> annual recovery
            </div>
          </div>

          {/* Slots filled */}
          <div style={{ background: tokens.cream, border: `1px solid ${tokens.line}`, borderRadius: 12, padding: '24px 26px' }}>
            <div style={{ fontFamily: 'Inter, sans-serif', fontSize: 11, color: tokens.mute, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 10 }}>Slots filled</div>
            <div style={{ fontFamily: 'Fraunces, serif', fontSize: 38, fontWeight: 500, color: tokens.ink, letterSpacing: '-0.03em', lineHeight: 1 }}>{scenario.metrics.slotsFilled.toLocaleString()}</div>
            <div style={{ fontFamily: 'Inter, sans-serif', fontSize: 12, color: tokens.mute, marginTop: 10 }}>that would have gone empty</div>
          </div>

          {/* Your cut */}
          <div style={{ background: tokens.cream, border: `1px solid ${tokens.line}`, borderRadius: 12, padding: '24px 26px' }}>
            <div style={{ fontFamily: 'Inter, sans-serif', fontSize: 11, color: tokens.mute, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 10 }}>Our fee (15%)</div>
            <div style={{ fontFamily: 'Fraunces, serif', fontSize: 38, fontWeight: 500, color: tokens.ink, letterSpacing: '-0.03em', lineHeight: 1 }}>${scenario.metrics.fee.toLocaleString()}</div>
            <div style={{ fontFamily: 'Inter, sans-serif', fontSize: 12, color: tokens.mute, marginTop: 10 }}>Billed at month end</div>
          </div>
        </motion.div>

        {/* Heat map + at risk */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          style={{ marginTop: 20, display: 'grid', gridTemplateColumns: '1.6fr 1fr', gap: 16 }}
        >
          {/* Heat map */}
          <div style={{ background: tokens.cream, border: `1px solid ${tokens.line}`, borderRadius: 12, padding: '22px 24px 26px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
              <div>
                <h3 style={{ fontFamily: 'Fraunces, serif', fontSize: 17, fontWeight: 600, color: tokens.ink, margin: 0, letterSpacing: '-0.01em' }}>Calendar health</h3>
                <div style={{ fontFamily: 'Inter, sans-serif', fontSize: 12, color: tokens.mute, marginTop: 2 }}>Hover a slot to see pricing</div>
              </div>
              <div style={{ display: 'flex', gap: 14, fontFamily: 'Inter, sans-serif', fontSize: 11, color: tokens.mute }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}><span style={{ width: 8, height: 8, borderRadius: 2, background: tokens.gold }} /> Peak</span>
                <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}><span style={{ width: 8, height: 8, borderRadius: 2, background: tokens.sage }} /> Healthy</span>
                <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}><span style={{ width: 8, height: 8, borderRadius: 2, background: tokens.rust }} /> At risk</span>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '28px repeat(11, 1fr)', gap: 3, alignItems: 'center' }}>
              <div />
              {hours.map(h => (
                <div key={h} style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 10, color: tokens.muteSoft, textAlign: 'center' }}>{h}</div>
              ))}
              {days.map(day => (
                <React.Fragment key={day}>
                  <div style={{ fontFamily: 'Inter, sans-serif', fontSize: 11, color: tokens.mute, fontWeight: 500, textAlign: 'right', paddingRight: 4 }}>{day}</div>
                  {hours.map(hour => {
                    const key = `${day}-${hour}`;
                    const status = heatmap[key];
                    const c = cellColor(status);
                    const isHovered = hoveredCell === key;
                    return (
                      <div
                        key={key}
                        onMouseEnter={() => setHoveredCell(key)}
                        onMouseLeave={() => setHoveredCell(null)}
                        style={{
                          height: 26, borderRadius: 4, background: c.bg,
                          border: `1px solid ${isHovered ? c.border : 'transparent'}`,
                          cursor: 'pointer', transition: 'all 0.15s ease',
                          transform: isHovered ? 'scale(1.08)' : 'scale(1)',
                          position: 'relative',
                        }}
                      >
                        {isHovered && status !== 'empty' && (
                          <div style={{
                            position: 'absolute', bottom: '115%', left: '50%', transform: 'translateX(-50%)',
                            background: tokens.ink, color: tokens.cream,
                            padding: '8px 11px', borderRadius: 6, whiteSpace: 'nowrap',
                            fontFamily: 'Inter, sans-serif', fontSize: 11, zIndex: 10,
                            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                          }}>
                            <div style={{ fontWeight: 500 }}>{day} · {hour}</div>
                            <div style={{ opacity: 0.7, marginTop: 2 }}>
                              {status === 'peak' && `$${scenario.id === 'meridian' ? '495' : '78'} · filling fast`}
                              {status === 'healthy' && `$${scenario.id === 'meridian' ? '425' : '65'} · base price`}
                              {status === 'at-risk' && `$${scenario.id === 'meridian' ? '340' : '52'} · auto-discounted`}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </React.Fragment>
              ))}
            </div>
          </div>

          {/* At-risk queue */}
          <div style={{ background: tokens.cream, border: `1px solid ${tokens.line}`, borderRadius: 12, padding: '22px 24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
              <h3 style={{ fontFamily: 'Fraunces, serif', fontSize: 17, fontWeight: 600, color: tokens.ink, margin: 0, letterSpacing: '-0.01em' }}>At-risk slots</h3>
              <Pill tone="rust">{scenario.atRiskSlots.filter(s => !approvedSlots.includes(s.id)).length} pending</Pill>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {scenario.atRiskSlots.map(slot => {
                const approved = approvedSlots.includes(slot.id);
                return (
                  <motion.div
                    key={slot.id}
                    animate={{ opacity: approved ? 0.4 : 1 }}
                    style={{
                      padding: '12px 14px', borderRadius: 8,
                      border: `1px solid ${approved ? tokens.sage : tokens.line}`,
                      background: approved ? tokens.sageSoft : tokens.paper,
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 }}>
                      <div>
                        <div style={{ fontFamily: 'Inter, sans-serif', fontSize: 12, fontWeight: 600, color: tokens.ink }}>
                          {slot.time}
                        </div>
                        <div style={{ fontFamily: 'Inter, sans-serif', fontSize: 11, color: tokens.mute, marginTop: 1 }}>
                          {slot.service} · {slot.stylist}
                        </div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 10, color: tokens.muteSoft, textDecoration: 'line-through' }}>
                          ${slot.original}
                        </div>
                        <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 14, fontWeight: 600, color: tokens.accent }}>
                          ${slot.suggested}
                        </div>
                      </div>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 }}>
                      <div style={{ fontFamily: 'Inter, sans-serif', fontSize: 10.5, color: tokens.mute }}>
                        <span style={{ color: tokens.sage, fontWeight: 600 }}>{slot.probability}%</span> fill probability
                      </div>
                      {!approved ? (
                        <button
                          onClick={() => setApprovedSlots([...approvedSlots, slot.id])}
                          style={{
                            border: 'none', background: tokens.ink, color: tokens.cream,
                            fontFamily: 'Inter, sans-serif', fontSize: 11, fontWeight: 500,
                            padding: '5px 12px', borderRadius: 5, cursor: 'pointer',
                          }}
                        >Approve</button>
                      ) : (
                        <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontFamily: 'Inter, sans-serif', fontSize: 11, color: '#4A5C41', fontWeight: 500 }}>
                          <Check size={11} strokeWidth={2.5} /> Sent
                        </span>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </motion.div>

        {/* Recent fills */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          style={{ marginTop: 20, background: tokens.cream, border: `1px solid ${tokens.line}`, borderRadius: 12, padding: '22px 24px' }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
            <h3 style={{ fontFamily: 'Fraunces, serif', fontSize: 17, fontWeight: 600, color: tokens.ink, margin: 0, letterSpacing: '-0.01em' }}>Recently filled</h3>
            <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 12, color: tokens.mute, display: 'flex', alignItems: 'center', gap: 4 }}>
              View all <ChevronRight size={12} />
            </span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1.4fr 1fr 1fr 0.8fr 0.8fr', gap: 16, padding: '0 4px 10px', borderBottom: `1px solid ${tokens.line}`, fontFamily: 'Inter, sans-serif', fontSize: 10.5, color: tokens.muteSoft, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
            <div>Slot</div><div>Service · Stylist</div><div>Customer</div><div>Price change</div><div>Earned</div><div>When</div>
          </div>
          {scenario.recentFills.map((fill) => (
            <div key={fill.id} style={{ display: 'grid', gridTemplateColumns: '1.2fr 1.4fr 1fr 1fr 0.8fr 0.8fr', gap: 16, padding: '14px 4px', borderBottom: `1px solid ${tokens.line}`, alignItems: 'center', fontFamily: 'Inter, sans-serif', fontSize: 13, color: tokens.ink }}>
              <div style={{ fontWeight: 500 }}>{fill.time}</div>
              <div style={{ color: tokens.mute }}>{fill.service} · {fill.stylist}</div>
              <div>{fill.customer}</div>
              <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 12 }}>
                <span style={{ color: tokens.muteSoft, textDecoration: 'line-through' }}>${fill.original}</span>
                <span style={{ margin: '0 6px', color: tokens.muteSoft }}>→</span>
                <span style={{ color: tokens.ink, fontWeight: 500 }}>${fill.filled}</span>
              </div>
              <div style={{ fontFamily: 'JetBrains Mono, monospace', color: tokens.sage, fontWeight: 600 }}>+${fill.filled}</div>
              <div style={{ color: tokens.mute, fontSize: 12 }}>{fill.when}</div>
            </div>
          ))}
        </motion.div>
      </main>
    </div>
  );
};

// ─── View 2: Customer Booking ───────────────────────────────────────────────
const CustomerBooking = ({ scenario }) => {
  const [selectedDay, setSelectedDay] = useState('Tue');
  const [selectedSlot, setSelectedSlot] = useState(null);

  const currentSlots = scenario.booking[selectedDay];

  return (
    <div style={{ background: tokens.cream, minHeight: 'calc(100vh - 60px)', padding: '40px 20px' }} className="paper-grain">
      <div style={{ maxWidth: 720, margin: '0 auto' }}>
        {/* Salon header */}
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} style={{ textAlign: 'center', marginBottom: 36 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 10, padding: '6px 14px', background: tokens.paper, borderRadius: 999, marginBottom: 16, border: `1px solid ${tokens.line}` }}>
            <div style={{ width: 6, height: 6, borderRadius: '50%', background: tokens.accent }} />
            <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 11, color: tokens.mute, fontWeight: 500, letterSpacing: '0.04em' }}>{scenario.business.name.toUpperCase()}</span>
          </div>
          <h1 style={{ fontFamily: 'Fraunces, serif', fontSize: 36, fontWeight: 500, color: tokens.ink, margin: 0, letterSpacing: '-0.02em' }}>Book an appointment</h1>
          <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 14, color: tokens.mute, marginTop: 8 }}>{scenario.booking.serviceName}</p>
        </motion.div>

        {/* Demo narration card */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }} style={{
          background: tokens.paper, border: `1px dashed ${tokens.accent}`, borderRadius: 10,
          padding: '12px 16px', marginBottom: 24, display: 'flex', alignItems: 'center', gap: 10,
        }}>
          <Sparkles size={14} style={{ color: tokens.accent, flexShrink: 0 }} />
          <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 12.5, color: tokens.inkSoft }}>
            <strong style={{ color: tokens.accent }}>Demo:</strong> This is what the customer sees — a normal booking page. Prices silently reflect Offpeak's pricing. Toggle Tuesday vs. Saturday to see it.
          </span>
        </motion.div>

        {/* Day toggle */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 24, justifyContent: 'center' }}>
          {['Tue', 'Sat'].map(day => (
            <button
              key={day}
              onClick={() => setSelectedDay(day)}
              style={{
                padding: '10px 22px',
                border: `1px solid ${selectedDay === day ? tokens.ink : tokens.line}`,
                background: selectedDay === day ? tokens.ink : 'transparent',
                color: selectedDay === day ? tokens.cream : tokens.ink,
                fontFamily: 'Inter, sans-serif', fontSize: 13, fontWeight: 500,
                borderRadius: 8, cursor: 'pointer', transition: 'all 0.2s',
              }}
            >
              {day === 'Tue' ? 'Tuesday, Mar 18' : 'Saturday, Mar 22'}
            </button>
          ))}
        </div>

        {/* Slot list */}
        <AnimatePresence mode="wait">
          <motion.div
            key={selectedDay}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.25 }}
            style={{ display: 'flex', flexDirection: 'column', gap: 10 }}
          >
            {currentSlots.map((slot, i) => {
              const isDiscounted = slot.price < slot.base;
              const isPeak = slot.price > slot.base;
              const isSelected = selectedSlot === i;
              return (
                <motion.button
                  key={`${selectedDay}-${i}`}
                  onClick={() => setSelectedSlot(i)}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  style={{
                    padding: '18px 22px',
                    background: isSelected ? tokens.ink : tokens.cream,
                    color: isSelected ? tokens.cream : tokens.ink,
                    border: `1px solid ${isSelected ? tokens.ink : tokens.line}`,
                    borderRadius: 10, cursor: 'pointer', transition: 'all 0.2s',
                    display: 'grid', gridTemplateColumns: '100px 1fr auto auto', gap: 20, alignItems: 'center',
                    textAlign: 'left', fontFamily: 'Inter, sans-serif',
                  }}
                >
                  <div>
                    <div style={{ fontSize: 15, fontWeight: 600 }}>{slot.time}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: 13, opacity: 0.7 }}>with {slot.stylist}</div>
                  </div>
                  <div>
                    {slot.badge && (
                      <span style={{
                        fontSize: 10.5, fontWeight: 600, letterSpacing: '0.04em', textTransform: 'uppercase',
                        padding: '3px 8px', borderRadius: 4,
                        background: isDiscounted ? (isSelected ? tokens.rustSoft : tokens.rustSoft) : (isSelected ? tokens.goldSoft : tokens.goldSoft),
                        color: isDiscounted ? '#7A3520' : '#6B5320',
                      }}>{slot.badge}</span>
                    )}
                  </div>
                  <div style={{ textAlign: 'right', minWidth: 80 }}>
                    {isDiscounted && (
                      <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 11, opacity: 0.5, textDecoration: 'line-through' }}>${slot.base}</div>
                    )}
                    <div style={{ fontFamily: 'Fraunces, serif', fontSize: 22, fontWeight: 600, letterSpacing: '-0.01em', color: isDiscounted && !isSelected ? tokens.accent : (isPeak && !isSelected ? tokens.gold : 'inherit') }}>
                      ${slot.price}
                    </div>
                  </div>
                </motion.button>
              );
            })}
          </motion.div>
        </AnimatePresence>

        <div style={{ marginTop: 20, textAlign: 'center', fontFamily: 'Inter, sans-serif', fontSize: 11, color: tokens.muteSoft }}>
          Prices are per appointment · Tax calculated at checkout
        </div>
      </div>
    </div>
  );
};

// ─── View 3: SMS Recovery Flow ──────────────────────────────────────────────
const SMSFlow = ({ scenario }) => {
  const [step, setStep] = useState(0);

  const smsConfig = scenario.id === 'meridian' ? {
    messages: [
      { from: 'salon', time: '2:14 PM', text: 'Hi Catherine — Aria has a 1pm HydraFacial Platinum open tomorrow. We can offer it at $340 instead of $425.' },
      { from: 'salon', time: '2:14 PM', text: 'Reply YES to book or NO thanks and we\'ll hold off.' },
      { from: 'customer', time: '2:16 PM', text: 'Yes please! I was overdue anyway' },
      { from: 'salon', time: '2:16 PM', text: '✓ Booked. Tomorrow 1:00 PM with Aria. See you then. Reply RESCHEDULE if anything changes.' },
    ],
    phone: '(212) 555-0187',
    avatarLetter: 'M',
  } : {
    messages: [
      { from: 'salon', time: '2:14 PM', text: 'Hey Jess — Maria has a 2pm opening tomorrow if you want it. She\'s running a special: $68 instead of $85 for a cut & style.' },
      { from: 'salon', time: '2:14 PM', text: 'Reply YES to grab it or NO thanks and we won\'t send more this week.' },
      { from: 'customer', time: '2:16 PM', text: 'YES please!! been meaning to book' },
      { from: 'salon', time: '2:16 PM', text: '✓ Booked! Tomorrow 2:00 PM with Maria. See you then. Reply RESCHEDULE if anything changes.' },
    ],
    phone: '(718) 555-0124',
    avatarLetter: 'L',
  };
  const messages = smsConfig.messages;

  useEffect(() => {
    if (step < messages.length) {
      const t = setTimeout(() => setStep(step + 1), step === 0 ? 400 : 1400);
      return () => clearTimeout(t);
    }
  }, [step]);

  return (
    <div style={{ background: tokens.cream, minHeight: 'calc(100vh - 60px)', display: 'grid', gridTemplateColumns: '1fr 1fr' }} className="paper-grain">
      {/* Left: explanation */}
      <div style={{ padding: '60px 60px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '5px 12px', background: tokens.paper, borderRadius: 999, marginBottom: 20, width: 'fit-content', border: `1px solid ${tokens.line}` }}>
          <MessageSquare size={12} style={{ color: tokens.accent }} />
          <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 11, color: tokens.mute, fontWeight: 500, letterSpacing: '0.04em' }}>SMS RECOVERY</span>
        </div>
        <h2 style={{ fontFamily: 'Fraunces, serif', fontSize: 38, fontWeight: 500, color: tokens.ink, margin: 0, letterSpacing: '-0.02em', lineHeight: 1.1 }}>
          The last-mile tool that fills the empty {scenario.id === 'meridian' ? 'room' : 'chair'}.
        </h2>
        <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 15, color: tokens.mute, lineHeight: 1.6, marginTop: 20, maxWidth: 440 }}>
          When a slot is still empty 24 hours out, Offpeak texts past customers who match the opening. The message comes from the business's number. The customer taps yes. It's booked.
        </p>
        <div style={{ marginTop: 28, display: 'flex', flexDirection: 'column', gap: 14 }}>
          {[
            { label: 'Only clients who\'ve visited in the last 6 months', why: 'Prevents training strangers to wait for deals' },
            { label: 'Matched to stylist preference and service history', why: 'So the offer actually fits' },
            { label: 'One SMS per week, hard cap', why: 'Never spammy' },
          ].map((rule, i) => (
            <div key={i} style={{ display: 'flex', gap: 12, padding: '12px 14px', background: tokens.paper, border: `1px solid ${tokens.line}`, borderRadius: 8 }}>
              <Check size={16} strokeWidth={2.5} style={{ color: tokens.sage, marginTop: 1, flexShrink: 0 }} />
              <div>
                <div style={{ fontFamily: 'Inter, sans-serif', fontSize: 13, color: tokens.ink, fontWeight: 500 }}>{rule.label}</div>
                <div style={{ fontFamily: 'Inter, sans-serif', fontSize: 12, color: tokens.mute, marginTop: 2 }}>{rule.why}</div>
              </div>
            </div>
          ))}
        </div>

        <button
          onClick={() => setStep(0)}
          style={{
            marginTop: 28, padding: '10px 20px',
            border: `1px solid ${tokens.line}`, background: 'transparent',
            color: tokens.ink, fontFamily: 'Inter, sans-serif', fontSize: 13, fontWeight: 500,
            borderRadius: 8, cursor: 'pointer', width: 'fit-content',
          }}
        >
          Replay
        </button>
      </div>

      {/* Right: phone */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 40 }}>
        <div style={{
          width: 340, height: 620, background: tokens.ink, borderRadius: 46,
          padding: 10, boxShadow: '0 30px 80px -20px rgba(0,0,0,0.3), 0 10px 30px -10px rgba(0,0,0,0.2)',
          position: 'relative',
        }}>
          {/* Notch */}
          <div style={{ position: 'absolute', top: 16, left: '50%', transform: 'translateX(-50%)', width: 100, height: 26, background: tokens.ink, borderRadius: 20, zIndex: 10 }} />
          <div style={{ width: '100%', height: '100%', background: '#F2F2F7', borderRadius: 38, overflow: 'hidden', position: 'relative' }}>
            {/* Status bar */}
            <div style={{ padding: '18px 28px 8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontFamily: 'Inter, sans-serif', fontSize: 14, fontWeight: 600, color: '#000' }}>
              <span>9:41</span>
              <span style={{ fontSize: 11 }}>●●●●● 5G</span>
            </div>
            {/* Contact header */}
            <div style={{ padding: '14px 16px', borderBottom: '0.5px solid #D1D1D6', background: 'rgba(255,255,255,0.9)', backdropFilter: 'blur(10px)', textAlign: 'center' }}>
              <div style={{ width: 44, height: 44, borderRadius: '50%', background: tokens.accent, margin: '0 auto 6px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: tokens.cream, fontFamily: 'Fraunces, serif', fontSize: 18, fontWeight: 600 }}>{smsConfig.avatarLetter}</div>
              <div style={{ fontFamily: 'Inter, sans-serif', fontSize: 12.5, fontWeight: 600, color: '#000' }}>{scenario.business.name}</div>
              <div style={{ fontFamily: 'Inter, sans-serif', fontSize: 10, color: '#8E8E93', marginTop: 1 }}>{smsConfig.phone}</div>
            </div>
            {/* Messages */}
            <div style={{ padding: '16px 12px', display: 'flex', flexDirection: 'column', gap: 6 }}>
              {messages.slice(0, step).map((msg, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 8, scale: 0.96 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ duration: 0.25 }}
                  style={{
                    alignSelf: msg.from === 'customer' ? 'flex-end' : 'flex-start',
                    maxWidth: '80%',
                  }}
                >
                  <div style={{
                    padding: '9px 13px',
                    background: msg.from === 'customer' ? '#007AFF' : '#E9E9EB',
                    color: msg.from === 'customer' ? '#FFF' : '#000',
                    borderRadius: 18,
                    fontFamily: 'Inter, sans-serif', fontSize: 13, lineHeight: 1.4,
                  }}>
                    {msg.text}
                  </div>
                </motion.div>
              ))}
              {step > 0 && step < messages.length && (
                <div style={{ alignSelf: messages[step]?.from === 'customer' ? 'flex-end' : 'flex-start', padding: '9px 13px', background: '#E9E9EB', borderRadius: 18 }}>
                  <div style={{ display: 'flex', gap: 3 }}>
                    {[0, 1, 2].map(i => (
                      <motion.div
                        key={i}
                        animate={{ opacity: [0.3, 1, 0.3] }}
                        transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.2 }}
                        style={{ width: 6, height: 6, borderRadius: '50%', background: '#8E8E93' }}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// ─── View 4: Intelligence (Pricing Signals) ─────────────────────────────────
const IntelligenceView = ({ scenario }) => {
  const [hoveredPoint, setHoveredPoint] = useState(null);
  const [selectedCustomer, setSelectedCustomer] = useState(scenario.id === 'meridian' ? 'catherine' : 'jess');

  // Reset selected customer when scenario changes
  useEffect(() => {
    setSelectedCustomer(scenario.id === 'meridian' ? 'catherine' : 'jess');
  }, [scenario.id]);

  // Price elasticity comes from the scenario
  const elasticityData = scenario.elasticity;
  const { min: priceMin, span: priceSpan, ticks: priceTicks } = scenario.elasticityDomain;

  // External signals active right now — mostly shared across scenarios,
  // but Meridian's upscale Manhattan context shifts a couple
  const signals = scenario.id === 'meridian' ? [
    {
      icon: CloudRain,
      category: 'Weather',
      title: 'Rain forecast Saturday',
      detail: '0.8" expected, 78% chance',
      impact: -9,
      color: tokens.rust,
      bgColor: tokens.rustSoft,
      explanation: 'Historical: rainy Saturdays soften last-minute bookings by 11%',
    },
    {
      icon: MapPin,
      category: 'Local event',
      title: 'Knicks vs. Lakers, Friday 8p',
      detail: 'Madison Square Garden · 0.8mi',
      impact: 12,
      color: tokens.sage,
      bgColor: tokens.sageSoft,
      explanation: 'Date-night facial bookings +26% on MSG primetime nights',
    },
    {
      icon: Sun,
      category: 'Weather',
      title: 'Sunny Tuesday, 71°F',
      detail: 'First warm day of the week',
      impact: 5,
      color: tokens.sage,
      bgColor: tokens.sageSoft,
      explanation: 'Lunch-break bookings spike on nice-weather weekdays',
    },
    {
      icon: Calendar,
      category: 'Calendar',
      title: 'Bonus season (Q1)',
      detail: 'Finance sector payouts landing',
      impact: 14,
      color: tokens.sage,
      bgColor: tokens.sageSoft,
      explanation: 'Premium service spend historically +31% Jan–Mar in Flatiron',
    },
    {
      icon: Sparkles,
      category: 'Local event',
      title: 'NY Fashion Week — Sept 10',
      detail: 'Elevated demand window begins',
      impact: 22,
      color: tokens.gold,
      bgColor: tokens.goldSoft,
      explanation: 'Facial and body treatment demand +34% in 10-day window',
    },
  ] : [
    {
      icon: CloudRain,
      category: 'Weather',
      title: 'Rain forecast Saturday',
      detail: '0.8" expected, 78% chance',
      impact: -12,
      color: tokens.rust,
      bgColor: tokens.rustSoft,
      explanation: 'Historical: rainy Saturdays see 14% fewer walk-ins',
    },
    {
      icon: MapPin,
      category: 'Local event',
      title: 'Nets vs. Celtics, Friday 7:30p',
      detail: 'Barclays Center · 0.4mi away',
      impact: 8,
      color: tokens.sage,
      bgColor: tokens.sageSoft,
      explanation: 'Past data: blowout bookings +22% day of home games',
    },
    {
      icon: Sun,
      category: 'Weather',
      title: 'Sunny Tuesday, 71°F',
      detail: 'First warm day of the week',
      impact: 6,
      color: tokens.sage,
      bgColor: tokens.sageSoft,
      explanation: 'Dead-hour demand spikes on nice-weather weekdays',
    },
    {
      icon: Calendar,
      category: 'Calendar',
      title: 'Payday (Fri Mar 15)',
      detail: 'End-of-month + bi-weekly overlap',
      impact: 11,
      color: tokens.sage,
      bgColor: tokens.sageSoft,
      explanation: 'Discretionary service spend peaks days 1–3 post-payday',
    },
    {
      icon: Sparkles,
      category: 'Local event',
      title: 'Fashion Week — Sept 10',
      detail: 'Elevated demand window begins',
      impact: 18,
      color: tokens.gold,
      bgColor: tokens.goldSoft,
      explanation: 'Color and blowout demand +28% in a 10-day window',
    },
  ];

  // Individual customer intelligence — different clientele per scenario
  const customersByScenario = {
    luna: {
      jess: {
        name: 'Jess R.',
        initials: 'JR',
        visits: 11,
        lifetime: 847,
        sensitivity: 'High',
        sensitivityValue: 82,
        lastVisit: '38 days ago',
        booksOn: 'Weekday afternoons',
        trigger: { type: 'Birthday', when: 'Mar 24 — in 6 days', icon: Gift },
        recommendation: 'Send Tue 2pm offer at $52 — 78% likely to book for birthday week',
      },
      amanda: {
        name: 'Amanda K.',
        initials: 'AK',
        visits: 24,
        lifetime: 2140,
        sensitivity: 'Low',
        sensitivityValue: 18,
        lastVisit: '22 days ago',
        booksOn: 'Saturday mornings',
        trigger: { type: 'Wedding (sister)', when: 'Apr 6 — in 19 days', icon: Heart },
        recommendation: 'Full price — books Saturdays regardless. Flag for color add-on.',
      },
      priya: {
        name: 'Priya S.',
        initials: 'PS',
        visits: 6,
        lifetime: 510,
        sensitivity: 'Medium',
        sensitivityValue: 54,
        lastVisit: '71 days ago',
        booksOn: 'Variable',
        trigger: { type: 'Anniversary (client)', when: 'Mar 30 — in 12 days', icon: Sparkles },
        recommendation: 'Re-engagement SMS at 15% off — lapsing risk category',
      },
    },
    meridian: {
      catherine: {
        name: 'Catherine W.',
        initials: 'CW',
        visits: 18,
        lifetime: 8420,
        sensitivity: 'Medium',
        sensitivityValue: 48,
        lastVisit: '26 days ago',
        booksOn: 'Weekday midday',
        trigger: { type: 'Birthday', when: 'Mar 24 — in 6 days', icon: Gift },
        recommendation: 'Offer HydraFacial Platinum at $340 — 81% likely to book for birthday',
      },
      diana: {
        name: 'Diana K.',
        initials: 'DK',
        visits: 41,
        lifetime: 24800,
        sensitivity: 'Low',
        sensitivityValue: 12,
        lastVisit: '14 days ago',
        booksOn: 'Saturday mornings',
        trigger: { type: 'Gala (client)', when: 'Apr 4 — in 17 days', icon: Sparkles },
        recommendation: 'Full price + upsell microneedling add-on. Never discount — books weekly.',
      },
      sophia: {
        name: 'Sophia L.',
        initials: 'SL',
        visits: 9,
        lifetime: 3120,
        sensitivity: 'High',
        sensitivityValue: 74,
        lastVisit: '84 days ago',
        booksOn: 'Variable',
        trigger: { type: 'Wedding (own)', when: 'May 18 — in 62 days', icon: Heart },
        recommendation: 'Re-engage with bridal package at 20% off — win back before she tries competitor',
      },
    },
  };
  const customers = customersByScenario[scenario.id];

  const cust = customers[selectedCustomer] || Object.values(customers)[0];

  // Current composite demand signal
  const composite = scenario.id === 'meridian' ? 91 : 87;

  return (
    <div style={{ background: tokens.cream, minHeight: 'calc(100vh - 60px)' }} className="paper-grain">
      <div style={{ padding: '32px 40px', maxWidth: 1400, margin: '0 auto' }}>
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
          <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 4 }}>
            <div>
              <div style={{ fontFamily: 'Inter, sans-serif', fontSize: 12, color: tokens.mute, fontWeight: 500, letterSpacing: '0.04em', textTransform: 'uppercase', marginBottom: 6, display: 'flex', alignItems: 'center', gap: 6 }}>
                <Brain size={12} /> Pricing intelligence
              </div>
              <h1 style={{ fontFamily: 'Fraunces, serif', fontSize: 32, fontWeight: 500, color: tokens.ink, margin: 0, letterSpacing: '-0.02em' }}>What's driving your prices right now</h1>
            </div>
            <Pill tone="sage"><span style={{ width: 6, height: 6, borderRadius: '50%', background: tokens.sage, display: 'inline-block' }} /> Model updated 4m ago</Pill>
          </div>
        </motion.div>

        {/* Top row: Composite + Elasticity */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          style={{ marginTop: 28, display: 'grid', gridTemplateColumns: '1fr 1.7fr', gap: 16 }}
        >
          {/* Composite demand score */}
          <div style={{ background: tokens.ink, color: tokens.cream, borderRadius: 12, padding: '28px 30px', position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', top: -60, right: -60, width: 220, height: 220, borderRadius: '50%', background: `radial-gradient(circle, ${tokens.accent}, transparent 70%)`, opacity: 0.2 }} />
            <div style={{ fontFamily: 'Inter, sans-serif', fontSize: 11, letterSpacing: '0.08em', textTransform: 'uppercase', opacity: 0.6, marginBottom: 12 }}>Composite demand — next 7 days</div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
              <span style={{ fontFamily: 'Fraunces, serif', fontSize: 68, fontWeight: 500, letterSpacing: '-0.03em', lineHeight: 1 }}>{composite}</span>
              <span style={{ fontFamily: 'Fraunces, serif', fontSize: 20, opacity: 0.5 }}>/ 100</span>
            </div>
            <div style={{ marginTop: 14, fontFamily: 'Inter, sans-serif', fontSize: 13, opacity: 0.75, lineHeight: 1.5 }}>
              Elevated. Prices are running <span style={{ color: tokens.accentSoft, fontWeight: 600 }}>7% above baseline</span> on peak slots, and discounts on dead slots are conservative this week.
            </div>
            <div style={{ marginTop: 20, paddingTop: 16, borderTop: '1px solid rgba(255,255,255,0.1)' }}>
              <div style={{ fontFamily: 'Inter, sans-serif', fontSize: 11, opacity: 0.5, letterSpacing: '0.04em', textTransform: 'uppercase', marginBottom: 10 }}>Composed from</div>
              {[
                { label: 'Historical calendar', weight: 42 },
                { label: 'Weather forecast', weight: 18 },
                { label: 'Local events', weight: 22 },
                { label: 'Seasonality & paydays', weight: 18 },
              ].map((s, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '5px 0', fontFamily: 'Inter, sans-serif', fontSize: 12 }}>
                  <span style={{ opacity: 0.8 }}>{s.label}</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{ width: 60, height: 4, background: 'rgba(255,255,255,0.15)', borderRadius: 2, overflow: 'hidden' }}>
                      <motion.div initial={{ width: 0 }} animate={{ width: `${s.weight}%` }} transition={{ delay: 0.4 + i * 0.1, duration: 0.6 }} style={{ height: '100%', background: tokens.accentSoft }} />
                    </div>
                    <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 11, opacity: 0.7, minWidth: 26, textAlign: 'right' }}>{s.weight}%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Price elasticity curve */}
          <div style={{ background: tokens.cream, border: `1px solid ${tokens.line}`, borderRadius: 12, padding: '24px 28px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 4 }}>
              <div>
                <h3 style={{ fontFamily: 'Fraunces, serif', fontSize: 17, fontWeight: 600, color: tokens.ink, margin: 0, letterSpacing: '-0.01em' }}>Price elasticity — {scenario.elasticityService}</h3>
                <div style={{ fontFamily: 'Inter, sans-serif', fontSize: 12, color: tokens.mute, marginTop: 2 }}>Learned from 14 months of your bookings</div>
              </div>
              <Pill tone="neutral">Your market</Pill>
            </div>

            {/* Chart */}
            <div style={{ position: 'relative', marginTop: 24, height: 220, paddingLeft: 40, paddingRight: 10, paddingBottom: 28 }}>
              {/* Y axis labels */}
              <div style={{ position: 'absolute', left: 0, top: 0, height: 192, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', fontFamily: 'JetBrains Mono, monospace', fontSize: 10, color: tokens.muteSoft }}>
                <span>100%</span><span>75%</span><span>50%</span><span>25%</span><span>0%</span>
              </div>

              {/* Chart area — uses percentage-based SVG so nothing stretches */}
              <div style={{ position: 'absolute', left: 40, right: 10, top: 0, height: 192 }}>
                {/* Grid lines as HTML so they stay pixel-perfect */}
                {[0, 25, 50, 75, 100].map((pct, i) => (
                  <div key={i} style={{
                    position: 'absolute', left: 0, right: 0, top: `${pct}%`, height: 1,
                    background: tokens.line,
                    borderTop: i === 0 || i === 4 ? 'none' : `1px dashed ${tokens.line}`,
                    backgroundColor: i === 0 || i === 4 ? tokens.line : 'transparent',
                  }} />
                ))}

                {/* Guardrail shaded zones as HTML divs */}
                <div style={{
                  position: 'absolute', left: 0, top: 0, bottom: 0,
                  width: `${(elasticityData[0].price - priceMin) / priceSpan * 100}%`,
                  background: tokens.rust, opacity: 0.04,
                }} />
                <div style={{
                  position: 'absolute', right: 0, top: 0, bottom: 0,
                  width: `${100 - (elasticityData[elasticityData.length - 1].price - priceMin) / priceSpan * 100}%`,
                  background: tokens.rust, opacity: 0.04,
                }} />

                {/* SVG for the curve itself — preserveAspectRatio="none" is fine here because
                    it's only a path, which scales cleanly. Points and text are rendered as
                    absolutely positioned HTML elements so they never distort. */}
                <svg viewBox="0 0 100 100" preserveAspectRatio="none" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', overflow: 'visible' }}>
                  {/* Area under curve */}
                  <motion.path
                    key={`area-${scenario.id}`}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.5, delay: 1.3 }}
                    d={`M ${(elasticityData[0].price - priceMin) / priceSpan * 100} 100 ${elasticityData.map(p => {
                      const x = (p.price - priceMin) / priceSpan * 100;
                      const y = 100 - p.fillRate;
                      return `L ${x} ${y}`;
                    }).join(' ')} L ${(elasticityData[elasticityData.length - 1].price - priceMin) / priceSpan * 100} 100 Z`}
                    fill={tokens.accent}
                    fillOpacity="0.08"
                  />

                  {/* Curve path — use vectorEffect so stroke width stays uniform despite stretch */}
                  <motion.path
                    key={`curve-${scenario.id}`}
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ duration: 1.2, delay: 0.3, ease: 'easeOut' }}
                    d={elasticityData.map((p, i) => {
                      const x = (p.price - priceMin) / priceSpan * 100;
                      const y = 100 - p.fillRate;
                      return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
                    }).join(' ')}
                    fill="none"
                    stroke={tokens.accent}
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    vectorEffect="non-scaling-stroke"
                  />
                </svg>

                {/* Points and labels as absolutely positioned HTML — stays circular, no stretch */}
                {elasticityData.map((p, i) => {
                  const leftPct = (p.price - priceMin) / priceSpan * 100;
                  const topPct = 100 - p.fillRate;
                  const isLabeled = !!p.label;
                  const dotSize = isLabeled ? 12 : 7;
                  return (
                    <React.Fragment key={`${scenario.id}-${i}`}>
                      {isLabeled && (
                        <div style={{
                          position: 'absolute',
                          left: `${leftPct}%`,
                          top: `${topPct}%`,
                          transform: 'translate(-50%, calc(-100% - 10px))',
                          fontFamily: 'Inter, sans-serif', fontSize: 10, fontWeight: 600,
                          color: tokens.accent, whiteSpace: 'nowrap', pointerEvents: 'none',
                        }}>{p.label}</div>
                      )}
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.3 + i * 0.08, type: 'spring', stiffness: 300, damping: 20 }}
                        onMouseEnter={() => setHoveredPoint(i)}
                        onMouseLeave={() => setHoveredPoint(null)}
                        style={{
                          position: 'absolute',
                          left: `${leftPct}%`,
                          top: `${topPct}%`,
                          width: dotSize, height: dotSize,
                          borderRadius: '50%',
                          background: isLabeled ? tokens.accent : tokens.cream,
                          border: `2px solid ${tokens.accent}`,
                          transform: 'translate(-50%, -50%)',
                          cursor: 'pointer',
                          zIndex: 2,
                        }}
                      />
                      {hoveredPoint === i && (
                        <div style={{
                          position: 'absolute',
                          left: `${leftPct}%`,
                          top: `${topPct}%`,
                          transform: 'translate(-50%, calc(-100% - 18px))',
                          background: tokens.ink, color: tokens.cream,
                          padding: '7px 11px', borderRadius: 6, whiteSpace: 'nowrap',
                          fontFamily: 'Inter, sans-serif', fontSize: 11, zIndex: 10,
                          pointerEvents: 'none',
                          boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                        }}>
                          <div style={{ fontWeight: 600 }}>${p.price}</div>
                          <div style={{ opacity: 0.7, marginTop: 2 }}>{p.fillRate}% fill rate</div>
                        </div>
                      )}
                    </React.Fragment>
                  );
                })}
              </div>

              {/* X axis labels */}
              <div style={{ position: 'absolute', bottom: 0, left: 40, right: 10, height: 20, fontFamily: 'JetBrains Mono, monospace', fontSize: 10, color: tokens.muteSoft }}>
                {priceTicks.map(price => (
                  <span key={price} style={{
                    position: 'absolute',
                    left: `${(price - priceMin) / priceSpan * 100}%`,
                    transform: 'translateX(-50%)',
                    top: 4,
                  }}>${price}</span>
                ))}
              </div>
            </div>

            <div style={{ marginTop: 6, padding: '12px 14px', background: tokens.paper, borderRadius: 8, fontFamily: 'Inter, sans-serif', fontSize: 12, color: tokens.inkSoft, lineHeight: 1.5 }}>
              <strong style={{ color: tokens.accent }}>Takeaway:</strong> {scenario.elasticityTakeaway}
            </div>
          </div>
        </motion.div>

        {/* External Signals */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          style={{ marginTop: 20 }}
        >
          <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 14 }}>
            <div>
              <h3 style={{ fontFamily: 'Fraunces, serif', fontSize: 19, fontWeight: 600, color: tokens.ink, margin: 0, letterSpacing: '-0.01em' }}>External signals</h3>
              <div style={{ fontFamily: 'Inter, sans-serif', fontSize: 12.5, color: tokens.mute, marginTop: 2 }}>Real-world data feeding the model this week</div>
            </div>
            <Pill tone="neutral">5 active</Pill>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 12 }}>
            {signals.map((sig, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + i * 0.06 }}
                style={{
                  background: tokens.cream, border: `1px solid ${tokens.line}`, borderRadius: 10,
                  padding: '16px 18px', position: 'relative', overflow: 'hidden',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                  <div style={{ width: 36, height: 36, borderRadius: 8, background: sig.bgColor, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <sig.icon size={17} strokeWidth={1.8} style={{ color: sig.color }} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontFamily: 'Inter, sans-serif', fontSize: 10, color: tokens.muteSoft, letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 3 }}>{sig.category}</div>
                    <div style={{ fontFamily: 'Inter, sans-serif', fontSize: 13.5, fontWeight: 600, color: tokens.ink, lineHeight: 1.3 }}>{sig.title}</div>
                    <div style={{ fontFamily: 'Inter, sans-serif', fontSize: 12, color: tokens.mute, marginTop: 2 }}>{sig.detail}</div>
                  </div>
                  <div style={{ textAlign: 'right', flexShrink: 0 }}>
                    <div style={{
                      fontFamily: 'JetBrains Mono, monospace', fontSize: 15, fontWeight: 600,
                      color: sig.impact > 0 ? tokens.sage : tokens.rust,
                    }}>
                      {sig.impact > 0 ? '+' : ''}{sig.impact}%
                    </div>
                    <div style={{ fontFamily: 'Inter, sans-serif', fontSize: 10, color: tokens.muteSoft, marginTop: 1 }}>demand</div>
                  </div>
                </div>
                <div style={{ marginTop: 10, paddingTop: 10, borderTop: `1px solid ${tokens.line}`, fontFamily: 'Inter, sans-serif', fontSize: 11.5, color: tokens.mute, lineHeight: 1.4, fontStyle: 'italic' }}>
                  {sig.explanation}
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Customer Intelligence */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          style={{ marginTop: 24 }}
        >
          <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 14 }}>
            <div>
              <h3 style={{ fontFamily: 'Fraunces, serif', fontSize: 19, fontWeight: 600, color: tokens.ink, margin: 0, letterSpacing: '-0.01em' }}>Individual customer intelligence</h3>
              <div style={{ fontFamily: 'Inter, sans-serif', fontSize: 12.5, color: tokens.mute, marginTop: 2 }}>Price sensitivity, booking patterns, and life-event triggers — per person</div>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: 16 }}>
            {/* Customer list */}
            <div style={{ background: tokens.cream, border: `1px solid ${tokens.line}`, borderRadius: 12, padding: 10, display: 'flex', flexDirection: 'column', gap: 4 }}>
              {Object.entries(customers).map(([key, c]) => {
                const active = selectedCustomer === key;
                return (
                  <button
                    key={key}
                    onClick={() => setSelectedCustomer(key)}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 12,
                      padding: '12px 12px', borderRadius: 8,
                      border: 'none', cursor: 'pointer', textAlign: 'left',
                      background: active ? tokens.paper : 'transparent',
                      transition: 'all 0.15s',
                    }}
                  >
                    <div style={{
                      width: 36, height: 36, borderRadius: '50%',
                      background: active ? tokens.ink : tokens.paper,
                      color: active ? tokens.cream : tokens.ink,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontFamily: 'Inter, sans-serif', fontSize: 12, fontWeight: 600,
                      border: active ? 'none' : `1px solid ${tokens.line}`,
                    }}>{c.initials}</div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontFamily: 'Inter, sans-serif', fontSize: 13, fontWeight: 500, color: tokens.ink }}>{c.name}</div>
                      <div style={{ fontFamily: 'Inter, sans-serif', fontSize: 11.5, color: tokens.mute, marginTop: 1, display: 'flex', alignItems: 'center', gap: 4 }}>
                        <c.trigger.icon size={10} /> {c.trigger.type}
                      </div>
                    </div>
                  </button>
                );
              })}

              <div style={{ padding: '10px 12px', marginTop: 6, borderTop: `1px solid ${tokens.line}`, paddingTop: 12 }}>
                <div style={{ fontFamily: 'Inter, sans-serif', fontSize: 10.5, color: tokens.muteSoft, letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 6 }}>Life-event triggers · next 14 days</div>
                <div style={{ fontFamily: 'Fraunces, serif', fontSize: 28, fontWeight: 500, color: tokens.accent, letterSpacing: '-0.02em' }}>{scenario.id === 'meridian' ? 187 : 23}</div>
                <div style={{ fontFamily: 'Inter, sans-serif', fontSize: 11.5, color: tokens.mute, marginTop: 2 }}>clients have birthdays, anniversaries, or weddings coming up</div>
              </div>
            </div>

            {/* Customer detail */}
            <motion.div
              key={selectedCustomer}
              initial={{ opacity: 0, x: 8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.25 }}
              style={{ background: tokens.cream, border: `1px solid ${tokens.line}`, borderRadius: 12, padding: '24px 28px' }}
            >
              {/* Header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
                <div>
                  <h4 style={{ fontFamily: 'Fraunces, serif', fontSize: 22, fontWeight: 600, color: tokens.ink, margin: 0, letterSpacing: '-0.015em' }}>{cust.name}</h4>
                  <div style={{ fontFamily: 'Inter, sans-serif', fontSize: 12.5, color: tokens.mute, marginTop: 3 }}>
                    {cust.visits} visits · ${cust.lifetime} lifetime value · Last seen {cust.lastVisit}
                  </div>
                </div>
                <Pill tone={cust.sensitivity === 'High' ? 'rust' : cust.sensitivity === 'Low' ? 'gold' : 'neutral'}>
                  {cust.sensitivity} price sensitivity
                </Pill>
              </div>

              {/* Sensitivity bar */}
              <div style={{ marginBottom: 20 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: 'Inter, sans-serif', fontSize: 11, color: tokens.mute, marginBottom: 6 }}>
                  <span>Books at full price</span>
                  <span>Waits for discounts</span>
                </div>
                <div style={{ height: 8, background: tokens.paper, borderRadius: 4, position: 'relative', overflow: 'hidden' }}>
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${cust.sensitivityValue}%` }}
                    transition={{ duration: 0.8, ease: 'easeOut' }}
                    style={{
                      height: '100%', borderRadius: 4,
                      background: `linear-gradient(90deg, ${tokens.gold} 0%, ${tokens.accent} 100%)`,
                    }}
                  />
                  <div style={{ position: 'absolute', left: `${cust.sensitivityValue}%`, top: -2, transform: 'translateX(-50%)', width: 2, height: 12, background: tokens.ink }} />
                </div>
                <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 11, color: tokens.mute, marginTop: 6, textAlign: 'right' }}>Score: {cust.sensitivityValue}/100</div>
              </div>

              {/* Grid of details */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 18 }}>
                <div style={{ padding: '14px 16px', background: tokens.paper, borderRadius: 8 }}>
                  <div style={{ fontFamily: 'Inter, sans-serif', fontSize: 10.5, color: tokens.muteSoft, letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 4 }}>Booking pattern</div>
                  <div style={{ fontFamily: 'Inter, sans-serif', fontSize: 13.5, color: tokens.ink, fontWeight: 500 }}>{cust.booksOn}</div>
                </div>
                <div style={{ padding: '14px 16px', background: tokens.paper, borderRadius: 8 }}>
                  <div style={{ fontFamily: 'Inter, sans-serif', fontSize: 10.5, color: tokens.muteSoft, letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 4, display: 'flex', alignItems: 'center', gap: 5 }}>
                    <cust.trigger.icon size={11} /> Life event
                  </div>
                  <div style={{ fontFamily: 'Inter, sans-serif', fontSize: 13.5, color: tokens.ink, fontWeight: 500 }}>{cust.trigger.type}</div>
                  <div style={{ fontFamily: 'Inter, sans-serif', fontSize: 11.5, color: tokens.accent, fontWeight: 500, marginTop: 2 }}>{cust.trigger.when}</div>
                </div>
              </div>

              {/* Recommendation */}
              <div style={{
                padding: '16px 18px',
                background: `linear-gradient(135deg, ${tokens.ink} 0%, ${tokens.inkSoft} 100%)`,
                color: tokens.cream, borderRadius: 10,
                display: 'flex', gap: 12, alignItems: 'flex-start',
              }}>
                <div style={{ width: 28, height: 28, borderRadius: 6, background: 'rgba(200, 83, 44, 0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Sparkles size={14} style={{ color: tokens.accentSoft }} />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontFamily: 'Inter, sans-serif', fontSize: 10.5, letterSpacing: '0.06em', textTransform: 'uppercase', opacity: 0.6, marginBottom: 4 }}>Recommended action</div>
                  <div style={{ fontFamily: 'Inter, sans-serif', fontSize: 13.5, lineHeight: 1.5 }}>{cust.recommendation}</div>
                </div>
              </div>
            </motion.div>
          </div>
        </motion.div>

        <div style={{ marginTop: 40, padding: '16px 20px', background: tokens.paper, border: `1px dashed ${tokens.line}`, borderRadius: 10, fontFamily: 'Inter, sans-serif', fontSize: 12, color: tokens.mute, textAlign: 'center' }}>
          Signals refresh every 15 minutes · Elasticity model retrains weekly · Customer profiles update on every booking
        </div>
      </div>
    </div>
  );
};


const App = () => {
  const [view, setView] = useState('dashboard');
  const [scenarioId, setScenarioId] = useState('luna');
  const scenario = scenarios[scenarioId];

  const views = [
    { id: 'dashboard', label: 'Owner Dashboard', sub: 'What Elena sees' },
    { id: 'intelligence', label: 'Intelligence', sub: 'What drives the prices' },
    { id: 'customer', label: 'Customer Booking', sub: 'What the guest sees' },
    { id: 'sms', label: 'SMS Recovery', sub: 'Filling a dead slot' },
  ];

  return (
    <div style={{ background: tokens.cream, minHeight: '100vh', fontFamily: 'Inter, sans-serif' }}>
      <FontLoader />

      {/* Top nav */}
      <div style={{
        borderBottom: `1px solid ${tokens.line}`, background: tokens.cream,
        padding: '12px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        position: 'sticky', top: 0, zIndex: 50, backdropFilter: 'blur(10px)', gap: 16,
      }}>
        <Logo size={22} />

        {/* View switcher */}
        <div style={{ display: 'flex', gap: 4, padding: 4, background: tokens.paper, borderRadius: 10 }}>
          {views.map(v => (
            <button
              key={v.id}
              onClick={() => setView(v.id)}
              style={{
                border: 'none',
                background: view === v.id ? tokens.cream : 'transparent',
                boxShadow: view === v.id ? '0 1px 2px rgba(0,0,0,0.06)' : 'none',
                padding: '7px 16px', borderRadius: 7, cursor: 'pointer',
                fontFamily: 'Inter, sans-serif', fontSize: 12.5, fontWeight: 500,
                color: view === v.id ? tokens.ink : tokens.mute,
                transition: 'all 0.2s',
              }}
            >
              {v.label}
            </button>
          ))}
        </div>

        {/* Scenario toggle */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ fontFamily: 'Inter, sans-serif', fontSize: 10.5, color: tokens.muteSoft, letterSpacing: '0.06em', textTransform: 'uppercase', fontWeight: 500 }}>Scenario</div>
          <div style={{ display: 'flex', padding: 3, background: tokens.ink, borderRadius: 999 }}>
            {Object.values(scenarios).map(s => (
              <button
                key={s.id}
                onClick={() => setScenarioId(s.id)}
                style={{
                  border: 'none',
                  background: scenarioId === s.id ? tokens.accent : 'transparent',
                  color: scenarioId === s.id ? tokens.cream : 'rgba(250, 247, 242, 0.6)',
                  padding: '6px 14px', borderRadius: 999, cursor: 'pointer',
                  fontFamily: 'Inter, sans-serif', fontSize: 11.5, fontWeight: 600,
                  letterSpacing: '0.02em',
                  transition: 'all 0.2s',
                }}
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* View */}
      <AnimatePresence mode="wait">
        <motion.div
          key={`${view}-${scenarioId}`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          {view === 'dashboard' && <OwnerDashboard scenario={scenario} />}
          {view === 'intelligence' && <IntelligenceView scenario={scenario} />}
          {view === 'customer' && <CustomerBooking scenario={scenario} />}
          {view === 'sms' && <SMSFlow scenario={scenario} />}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default App;
