import { useState, useMemo, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  TriangleAlert,
  PartyPopper,
  X as XIcon,
  RotateCcw,
  Globe,
} from 'lucide-react'

/* ─── Data ─── */

const COUNTRIES = [
  { code: 'US', currency: '$', baseline: 15, holidays: 10, name: 'United States', lang: 'EN' },
  { code: 'UK', currency: '£', baseline: 28, holidays: 8, name: 'United Kingdom', lang: 'EN' },
  { code: 'AU', currency: 'A$', baseline: 20, holidays: 7, name: 'Australia', lang: 'EN' },
  { code: 'CA', currency: 'C$', baseline: 15, holidays: 10, name: 'Canada', lang: 'EN' },
  { code: 'NZ', currency: 'NZ$', baseline: 20, holidays: 11, name: 'New Zealand', lang: 'EN' },
  { code: 'DE', currency: '€', baseline: 25, holidays: 10, name: 'Germany', lang: 'DE' },
  { code: 'FR', currency: '€', baseline: 30, holidays: 11, name: 'France', lang: 'FR' },
  { code: 'SG', currency: 'S$', baseline: 14, holidays: 11, name: 'Singapore', lang: 'EN' },
  { code: 'JP', currency: '¥', baseline: 15, holidays: 16, name: 'Japan', lang: 'JP' },
]

const CURRENCIES = ['$', '£', '€', '¥', 'A$', 'C$', 'NZ$', 'S$', '₽']

const TOTAL_WORK_DAYS = 260

/* ─── i18n ─── */

const LANGUAGES = [
  { code: 'EN', label: 'EN' },
  { code: 'DE', label: 'DE' },
  { code: 'FR', label: 'FR' },
  { code: 'JP', label: 'JP' },
  { code: 'ZH', label: 'ZH' },
]

const T = {
  EN: {
    title: 'Expose Your Unlimited PTO',
    subtitle:
      'See what your "unlimited" vacation policy is really costing you — and whether you’re coming out ahead.',
    yourDetails: 'Your Details',
    yourResults: 'Your Results',
    country: 'Country',
    annualSalary: 'Annual Salary',
    publicHolidays: 'Public Holidays',
    plannedPTO: 'Planned PTO Days',
    trueDailyRate: 'Your True Daily Rate',
    perWorkingDay: 'per actual working day',
    timeBreakdown: 'Time Breakdown',
    workDays: 'Work Days',
    holidays: 'Holidays',
    pto: 'PTO',
    moneyLeft: 'Money Left on the Table',
    donating:
      'You are essentially donating {amount} of free labor compared to the {country} market average of {baseline} days.',
    beatingSystem: "You’re Beating the System!",
    beating:
      "You’re taking {planned} days — that’s {diff} more than the {country} average of {baseline}. Enjoy your time off without guilt!",
    share: 'Share to X',
    shareText:
      'My true daily rate is {rate} because I calculate my PTO value. Don’t leave money on the table:',
  },
  DE: {
    title: 'Dein unbegrenzter Urlaub – entlarvt',
    subtitle:
      'Sieh, was dich deine „unbegrenzte“ Urlaubsregelung wirklich kostet — und ob du am Ende besser dastehst.',
    yourDetails: 'Deine Angaben',
    yourResults: 'Deine Ergebnisse',
    country: 'Land',
    annualSalary: 'Jahresgehalt',
    publicHolidays: 'Feiertage',
    plannedPTO: 'Geplante Urlaubstage',
    trueDailyRate: 'Dein wahrer Tagesatz',
    perWorkingDay: 'pro tatsächlichem Arbeitstag',
    timeBreakdown: 'Zeitaufteilung',
    workDays: 'Arbeitstage',
    holidays: 'Feiertage',
    pto: 'Urlaub',
    moneyLeft: 'Geld verschenkt',
    donating:
      'Du verschenkst {amount} an unbezahlter Arbeit im Vergleich zum {country}-Durchschnitt von {baseline} Tagen.',
    beatingSystem: 'Du schlägst das System!',
    beating:
      'Du nimmst {planned} Tage — das sind {diff} mehr als der {country}-Durchschnitt von {baseline}. Genieße deine freie Zeit ohne schlechtes Gewissen!',
    share: 'Auf X teilen',
    shareText:
      'Mein wahrer Tagesatz ist {rate}, weil ich meinen PTO-Wert berechne. Lass kein Geld liegen:',
  },
  FR: {
    title: 'Démasquez votre PTO illimité',
    subtitle:
      'Découvrez ce que votre politique de congés „ilimités“ vous coûte vraiment — et si vous en sortez gagnant.',
    yourDetails: 'Vos informations',
    yourResults: 'Vos résultats',
    country: 'Pays',
    annualSalary: 'Salaire annuel',
    publicHolidays: 'Jours fériés',
    plannedPTO: 'Congés prévus',
    trueDailyRate: 'Votre vrai taux journalier',
    perWorkingDay: 'par jour travaillé',
    timeBreakdown: 'Répartition du temps',
    workDays: 'Jours travaillés',
    holidays: 'Fériés',
    pto: 'Congés',
    moneyLeft: 'Argent laissé sur la table',
    donating:
      'Vous offrez essentiellement {amount} de travail gratuit par rapport à la moyenne {country} de {baseline} jours.',
    beatingSystem: 'Vous battez le système!',
    beating:
      'Vous prenez {planned} jours — soit {diff} de plus que la moyenne {country} de {baseline}. Profitez de votre temps libre sans culpabilité!',
    share: 'Partager sur X',
    shareText:
      'Mon vrai taux journalier est {rate} car je calcule la valeur de mon PTO. Ne laissez pas d’argent sur la table:',
  },
  JP: {
    title: '無限期有休暇の真実',
    subtitle:
      'あなたの「無限期有休暇」ポリシーが実際にかかっている費用と、あなたが得をしているかどうかを見てみましょう。',
    yourDetails: 'あなたの詳細',
    yourResults: '結果',
    country: '国',
    annualSalary: '年収',
    publicHolidays: '祝祭日',
    plannedPTO: '休暇予定日',
    trueDailyRate: 'あなたの真の日額',
    perWorkingDay: '実質労働日あたり',
    timeBreakdown: '時間内経',
    workDays: '労働日',
    holidays: '祝祭日',
    pto: '休暇',
    moneyLeft: 'テーブルに残されたお金',
    donating:
      '{country}の平均{baseline}日と比較して、{amount}の無償労働を寄宸しています。',
    beatingSystem: 'システムを剕りました!',
    beating:
      '{planned}日の休暇を取っています。{country}の平均{baseline}日より{diff}日多いです。罪悪感なく休みを楽しんでください!',
    share: 'Xでシェア',
    shareText:
      '私の真の日額は{rate}です。PTOの価値を計算しています。お金を無駄にしないでください:',
  },
  ZH: {
    title: '揭露你的“无限”带薪休假',
    subtitle:
      '看看你的“无限”带薪休假政策到底让你付出了多大代价——以及你是否真的赚到了。',
    yourDetails: '你的详情',
    yourResults: '你的结果',
    country: '国家',
    annualSalary: '年薪',
    publicHolidays: '公休假期',
    plannedPTO: '计划休假天数',
    trueDailyRate: '你的真实日薪',
    perWorkingDay: '每实际工作日',
    timeBreakdown: '时间分解',
    workDays: '工作日',
    holidays: '公休假',
    pto: '带薪休假',
    moneyLeft: '浪费的钱',
    donating:
      '与{country}市场平均{baseline}天相比，你实际上捐赠了{amount}的免费劳动。',
    beatingSystem: '你赢过了系统！',
    beating:
      '你休了{planned}天——比{country}平均{baseline}天多了{diff}天。好好享受假期，不用愧疚！',
    share: '分享到 X',
    shareText:
      '我的真实日薪是{rate}，因为我计算了我的带薪休假价值。别让钱白白流失：',
  },
}

/* ─── Helpers ─── */

function toShareUrl(rate, lang) {
  const text = T[lang]?.shareText ?? T.EN.shareText
  const url = 'https://ptocalc.app'
  const tweet = `${text.replace('{rate}', rate)} ${url}`
  return `https://twitter.com/intent/tweet?text=${encodeURIComponent(tweet)}`
}

/* ─── Component ─── */

function PTOCalculator() {
  const [countryCode, setCountryCode] = useState('US')
  const [lang, setLang] = useState('EN')
  const [salary, setSalary] = useState(100000)
  const [overrideCurrency, setOverrideCurrency] = useState(null)
  const [holidays, setHolidays] = useState(null)
  const [plannedPto, setPlannedPto] = useState(10)

  const country = useMemo(
    () => COUNTRIES.find((c) => c.code === countryCode) ?? COUNTRIES[0],
    [countryCode],
  )

  const t = T[lang] ?? T.EN

  const effectiveCurrency = overrideCurrency ?? country.currency
  const effectiveHolidays = holidays ?? country.holidays

  const { effectiveDailyRate, unusedValue, isBeatingSystem, actualWorkDays } =
    useMemo(() => {
      const workDays = TOTAL_WORK_DAYS - effectiveHolidays - plannedPto
      const rate = workDays > 0 ? salary / workDays : 0
      return {
        effectiveDailyRate: rate,
        unusedValue:
          country.baseline > plannedPto
            ? (country.baseline - plannedPto) * rate
            : 0,
        isBeatingSystem: plannedPto >= country.baseline,
        actualWorkDays: workDays,
      }
    }, [salary, plannedPto, effectiveHolidays, country.baseline])

  const formatCurrency = useCallback(
    (amount) =>
      `${effectiveCurrency}${amount.toLocaleString('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })}`,
    [effectiveCurrency],
  )

  const barWorkPct =
    (Math.max(actualWorkDays, 0) / TOTAL_WORK_DAYS) * 100
  const barHolidaysPct = (effectiveHolidays / TOTAL_WORK_DAYS) * 100
  const barPtoPct = (plannedPto / TOTAL_WORK_DAYS) * 100

  /* ─── Render ─── */

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950">
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-12 lg:py-16">
        {/* ── Header Row ── */}
        <div className="mb-10 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
          <motion.div
            initial={{ opacity: 0, y: -16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl lg:text-5xl">
              <motion.span
                key={lang}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                {t.title}
              </motion.span>
            </h1>
            <p className="mt-2 max-w-2xl text-sm text-slate-400 sm:text-base">
              <motion.span
                key={`sub-${lang}`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3, delay: 0.1 }}
              >
                {t.subtitle}
              </motion.span>
            </p>
          </motion.div>

          {/* Language Switcher */}
          <div className="flex items-center gap-2 self-end sm:self-auto">
            <Globe className="h-4 w-4 text-slate-500" />
            <div className="relative">
              <select
                value={lang}
                onChange={(e) => setLang(e.target.value)}
                className="appearance-none rounded-lg border border-slate-700 bg-slate-800/80 px-3 py-1.5 pr-8 text-sm font-medium text-white shadow-sm backdrop-blur-sm transition hover:border-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                {LANGUAGES.map((l) => (
                  <option key={l.code} value={l.code}>
                    {l.label}
                  </option>
                ))}
              </select>
              <svg
                className="pointer-events-none absolute right-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </div>
          </div>
        </div>

        {/* ── Country Selector ── */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="mb-8"
        >
          <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-slate-500">
            {t.country}
          </p>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-9">
            {COUNTRIES.map((c) => {
              const active = c.code === countryCode
              return (
                <motion.button
                  key={c.code}
                  layout
                  onClick={() => {
                    setCountryCode(c.code)
                    setHolidays(null)
                  }}
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.97 }}
                  className={`relative overflow-hidden rounded-xl border px-3 py-3 text-left transition-all duration-200 ${
                    active
                      ? 'border-indigo-500 bg-indigo-600/20 shadow-lg shadow-indigo-500/10'
                      : 'border-slate-700/60 bg-slate-800/50 hover:border-slate-600 hover:bg-slate-800'
                  }`}
                >
                  {active && (
                    <motion.div
                      layoutId="country-glow"
                      className="absolute inset-0 rounded-xl bg-gradient-to-br from-indigo-500/10 to-transparent"
                      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                    />
                  )}
                  <p
                    className={`relative text-sm font-semibold ${
                      active ? 'text-white' : 'text-slate-300'
                    }`}
                  >
                    {c.name}
                  </p>
                  <p className="relative mt-0.5 text-[11px] text-slate-500">
                    {c.baseline}d avg &middot; {c.holidays}d hol
                  </p>
                </motion.button>
              )
            })}
          </div>
        </motion.div>

        {/* ── Main Grid ── */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* ════════════════ Inputs Card ════════════════ */}
          <motion.div
            initial={{ opacity: 0, x: -24 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.15 }}
            className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 shadow-xl backdrop-blur-sm sm:p-8"
          >
            <h2 className="mb-6 text-lg font-semibold tracking-tight text-white">
              {t.yourDetails}
            </h2>

            {/* Annual Salary */}
            <div className="mb-6">
              <label
                htmlFor="salary"
                className="mb-2 block text-sm font-medium text-slate-400"
              >
                {t.annualSalary}
              </label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-2xl font-bold text-slate-500">
                    {effectiveCurrency}
                  </span>
                  <input
                    id="salary"
                    type="number"
                    value={salary}
                    onChange={(e) =>
                      setSalary(Math.max(0, Number(e.target.value) || 0))
                    }
                    min="0"
                    className="w-full rounded-xl border border-slate-700 bg-slate-800/80 py-3 pl-10 pr-4 text-2xl font-bold text-white transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/30"
                  />
                </div>
                <select
                  value={overrideCurrency ?? country.currency}
                  onChange={(e) => setOverrideCurrency(e.target.value)}
                  className="w-20 rounded-xl border border-slate-700 bg-slate-800/80 text-center text-lg font-bold text-white transition hover:border-slate-600 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/30"
                >
                  {CURRENCIES.map((cur) => (
                    <option key={cur} value={cur}>
                      {cur}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Public Holidays */}
            <div className="mb-6">
              <div className="mb-2 flex items-center justify-between">
                <label
                  htmlFor="holidays"
                  className="text-sm font-medium text-slate-400"
                >
                  {t.publicHolidays}
                </label>
                <div className="flex items-center gap-2">
                  {holidays !== null && (
                    <button
                      onClick={() => setHolidays(null)}
                      className="flex items-center gap-1 text-xs text-slate-500 transition hover:text-slate-300"
                    >
                      <RotateCcw className="h-3 w-3" />
                      Reset
                    </button>
                  )}
                  <span className="min-w-[2ch] rounded-lg bg-slate-800 px-2.5 py-0.5 text-sm font-bold text-indigo-400">
                    {effectiveHolidays}
                  </span>
                </div>
              </div>
              <input
                id="holidays"
                type="range"
                min="0"
                max="30"
                value={effectiveHolidays}
                onChange={(e) => setHolidays(Number(e.target.value))}
                className="pto-slider w-full"
              />
              <div className="mt-1 flex justify-between text-xs text-slate-600">
                <span>0 days</span>
                <span>30 days</span>
              </div>
            </div>

            {/* Planned PTO */}
            <div>
              <div className="mb-2 flex items-center justify-between">
                <label
                  htmlFor="pto"
                  className="text-sm font-medium text-slate-400"
                >
                  {t.plannedPTO}
                </label>
                <span className="rounded-lg bg-indigo-600/20 px-3 py-1 text-lg font-bold text-indigo-400">
                  {plannedPto}
                </span>
              </div>
              <input
                id="pto"
                type="range"
                min="0"
                max="50"
                value={plannedPto}
                onChange={(e) => setPlannedPto(Number(e.target.value))}
                className="pto-slider w-full"
              />
              <div className="mt-1 flex justify-between text-xs text-slate-600">
                <span>0 days</span>
                <span>50 days</span>
              </div>
            </div>
          </motion.div>

          {/* ════════════════ Results Card ════════════════ */}
          <motion.div
            initial={{ opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 shadow-xl backdrop-blur-sm sm:p-8"
          >
            <h2 className="mb-6 text-lg font-semibold tracking-tight text-white">
              {t.yourResults}
            </h2>

            {/* True Daily Rate */}
            <div className="mb-8 rounded-xl bg-slate-800/60 p-6 text-center">
              <p className="text-sm font-medium text-slate-500">
                {t.trueDailyRate}
              </p>
              <motion.p
                key={Math.round(effectiveDailyRate * 100)}
                initial={{ scale: 1.12, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: 'spring', stiffness: 180, damping: 13 }}
                className="mt-2 text-5xl font-extrabold tracking-tight text-white sm:text-6xl lg:text-7xl"
              >
                {formatCurrency(effectiveDailyRate)}
              </motion.p>
              <p className="mt-2 text-sm text-slate-500">{t.perWorkingDay}</p>
            </div>

            {/* Time Breakdown Bar */}
            <div className="mb-6">
              <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-slate-500">
                {t.timeBreakdown}
              </p>
              <div className="flex h-5 w-full overflow-hidden rounded-full bg-slate-800">
                <motion.div
                  layout
                  className="flex items-center justify-center bg-indigo-500 text-[9px] font-bold text-white transition-all duration-300"
                  style={{ width: `${Math.max(barWorkPct, 0)}%` }}
                  title={t.workDays}
                >
                  {barWorkPct > 15
                    ? `${Math.max(actualWorkDays, 0)}d`
                    : ''}
                </motion.div>
                <motion.div
                  layout
                  className="flex items-center justify-center bg-amber-500 text-[9px] font-bold text-white transition-all duration-300"
                  style={{ width: `${barHolidaysPct}%` }}
                  title={t.holidays}
                >
                  {barHolidaysPct > 8 ? `${effectiveHolidays}d` : ''}
                </motion.div>
                <motion.div
                  layout
                  className="flex items-center justify-center bg-emerald-500 text-[9px] font-bold text-white transition-all duration-300"
                  style={{ width: `${barPtoPct}%` }}
                  title={t.pto}
                >
                  {barPtoPct > 8 ? `${plannedPto}d` : ''}
                </motion.div>
              </div>
              <div className="mt-2 flex gap-4 text-xs text-slate-500">
                <span className="flex items-center gap-1">
                  <span className="inline-block h-2.5 w-2.5 rounded-sm bg-indigo-500" />
                  {t.workDays} ({Math.max(actualWorkDays, 0)}d)
                </span>
                <span className="flex items-center gap-1">
                  <span className="inline-block h-2.5 w-2.5 rounded-sm bg-amber-500" />
                  {t.holidays} ({effectiveHolidays}d)
                </span>
                <span className="flex items-center gap-1">
                  <span className="inline-block h-2.5 w-2.5 rounded-sm bg-emerald-500" />
                  {t.pto} ({plannedPto}d)
                </span>
              </div>
            </div>

            {/* Emotional Output */}
            <AnimatePresence mode="wait">
              {isBeatingSystem ? (
                <motion.div
                  key="green"
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -12 }}
                  transition={{ duration: 0.3 }}
                  className="mb-6 rounded-xl border border-emerald-900/40 bg-emerald-950/40 p-5"
                >
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 rounded-full bg-emerald-900/50 p-2">
                      <PartyPopper className="h-6 w-6 text-emerald-400" />
                    </div>
                    <div>
                      <p className="text-lg font-bold text-emerald-300">
                        {t.beatingSystem}
                      </p>
                      <p className="mt-1 text-sm text-emerald-400/80">
                        {t.beating
                          .replace('{planned}', String(plannedPto))
                          .replace('{diff}', String(plannedPto - country.baseline))
                          .replace('{country}', country.name)
                          .replace('{baseline}', String(country.baseline))}
                      </p>
                    </div>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="red"
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -12 }}
                  transition={{ duration: 0.3 }}
                  className="mb-6 rounded-xl border border-red-900/40 bg-red-950/40 p-5"
                >
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 rounded-full bg-red-900/50 p-2">
                      <TriangleAlert className="h-6 w-6 text-red-400" />
                    </div>
                    <div>
                      <p className="text-lg font-bold text-red-300">
                        {t.moneyLeft}
                      </p>
                      <p className="mt-1 text-sm text-red-400/80">
                        {t.donating
                          .replace('{amount}', formatCurrency(unusedValue))
                          .replace('{country}', country.name)
                          .replace('{baseline}', String(country.baseline))}
                      </p>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Share Button */}
            <motion.a
              href={toShareUrl(formatCurrency(effectiveDailyRate), lang)}
              target="_blank"
              rel="noopener noreferrer"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="flex w-full items-center justify-center gap-2.5 rounded-xl bg-white/5 px-5 py-3 text-sm font-semibold text-slate-300 transition hover:bg-white/10 hover:text-white"
            >
              <XIcon className="h-4 w-4" />
              {t.share}
            </motion.a>
          </motion.div>
        </div>
      </div>
    </div>
  )
}

export default PTOCalculator
