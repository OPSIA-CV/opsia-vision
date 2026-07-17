import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState, type ReactNode, type ElementType } from "react";
import heroMine from "@/assets/hero-mine.jpg";
import logoMark from "@/assets/logo-mark.png";
import teamMaxi from "@/assets/team-maxi.jpg";
import teamFelipe from "@/assets/team-felipe.jpg";
import teamEmiliano from "@/assets/team-emiliano.jpg";
import heroCam03 from "@/assets/hero-cam03.jpg";
// @ts-expect-error — Vite trata el mp4 como asset estático (URL con hash)
import demoVideo from "@/assets/demo-deteccion.mp4";
import indMining from "@/assets/ind-mining.jpg";
import indConstruction from "@/assets/ind-construction.jpg";
import indOilgas from "@/assets/ind-oilgas.jpg";

export const Route = createFileRoute("/")({
  component: OpsiaLanding,
});

// ---------- Reveal on scroll ----------
function Reveal({
  children,
  delay = 0,
  as,
  className = "",
}: {
  children: ReactNode;
  delay?: number;
  as?: ElementType;
  className?: string;
}) {
  const Tag = (as ?? "div") as ElementType;
  const ref = useRef<HTMLDivElement | null>(null);
  const [shown, setShown] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.isIntersecting && setShown(true)),
      { threshold: 0.15 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return (
    <Tag
      ref={ref}
      className={className}
      style={{
        opacity: shown ? 1 : 0,
        transform: shown ? "translateY(0)" : "translateY(16px)",
        transition: `opacity .8s ease ${delay}ms, transform .8s ease ${delay}ms`,
      }}
    >
      {children}
    </Tag>
  );
}

// ---------- Animated counter ----------
function Counter({
  to,
  suffix = "",
  prefix = "",
  decimals = 0,
}: {
  to: number;
  suffix?: string;
  prefix?: string;
  decimals?: number;
}) {
  const ref = useRef<HTMLSpanElement | null>(null);
  const [val, setVal] = useState(0);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let raf = 0;
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            const start = performance.now();
            const dur = 1600;
            const tick = (t: number) => {
              const p = Math.min(1, (t - start) / dur);
              const eased = 1 - Math.pow(1 - p, 3);
              setVal(to * eased);
              if (p < 1) raf = requestAnimationFrame(tick);
            };
            raf = requestAnimationFrame(tick);
            io.disconnect();
          }
        });
      },
      { threshold: 0.4 },
    );
    io.observe(el);
    return () => {
      io.disconnect();
      cancelAnimationFrame(raf);
    };
  }, [to]);
  return (
    <span ref={ref}>
      {prefix}
      {val.toFixed(decimals)}
      {suffix}
    </span>
  );
}

const CONTACT_EMAIL = "opsia.cv@gmail.com";

// ---------- Contact modal ----------
function ContactModal({
  open,
  onClose,
  intent,
}: {
  open: boolean;
  onClose: () => void;
  intent?: string;
}) {
  const [sent, setSent] = useState(false);
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);
  if (!open) return null;
  return (
    <div
      className="fixed inset-0 z-[100] flex items-end justify-center bg-black/70 backdrop-blur-sm sm:items-center"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Formulario de contacto"
    >
      <div
        className="w-full max-w-lg bg-paper text-ink sm:mx-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-black/10 px-6 py-4">
          <div>
            <p className="text-eyebrow text-ink/60">Contacto</p>
            <h3 className="mt-1 text-xl font-medium">
              {intent === "audit" ? "Solicitar auditoría piloto" : "Agendar una demo"}
            </h3>
          </div>
          <button
            onClick={onClose}
            aria-label="Cerrar"
            className="grid h-9 w-9 place-items-center text-ink/60 hover:text-ink"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M6 6l12 12M18 6l-12 12" />
            </svg>
          </button>
        </div>
        {sent ? (
          <div className="px-6 py-10 text-center">
            <div className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-amber-signal/20 text-ink">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                <path d="M5 12l5 5L20 7" />
              </svg>
            </div>
            <p className="mt-4 text-lg font-medium">Su correo quedó listo para enviar.</p>
            <p className="mt-2 text-sm text-ink/60">
              Se abrió su cliente de correo con el mensaje preparado — solo falta apretar
              enviar. Si no se abrió, escríbanos a{" "}
              <a href={`mailto:${CONTACT_EMAIL}`} className="font-medium text-ink underline">
                {CONTACT_EMAIL}
              </a>
              . Respondemos en menos de 24 h hábiles.
            </p>
            <button onClick={onClose} className="btn-ghost-light mt-6">
              Cerrar
            </button>
          </div>
        ) : (
          <form
            className="grid gap-4 px-6 py-6"
            onSubmit={(e) => {
              e.preventDefault();
              const fd = new FormData(e.currentTarget);
              const subject = `[OPSIA] ${intent === "audit" ? "Auditoría piloto" : "Demo"} — ${fd.get("company")}`;
              const body =
                `Nombre: ${fd.get("name")}\n` +
                `Empresa: ${fd.get("company")}\n` +
                `Industria: ${fd.get("industry")}\n` +
                `Email: ${fd.get("email")}\n\n` +
                `${fd.get("message") ?? ""}`;
              window.location.href = `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
              setSent(true);
            }}
          >
            <Field label="Nombre" name="name" required />
            <Field label="Empresa" name="company" required />
            <div>
              <label className="text-eyebrow text-ink/60" htmlFor="industry">
                Industria
              </label>
              <select
                id="industry"
                name="industry"
                required
                className="mt-2 w-full border border-black/15 bg-white px-3 py-2.5 text-sm outline-none focus:border-ink"
              >
                <option value="">Seleccione una industria…</option>
                <option>Minería</option>
                <option>Construcción</option>
                <option>Oil &amp; Gas</option>
                <option>Puertos y flotas</option>
                <option>Farmacéutica</option>
                <option>Manufactura</option>
                <option>Otra</option>
              </select>
            </div>
            <Field label="Email corporativo" name="email" type="email" required />
            <div>
              <label className="text-eyebrow text-ink/60" htmlFor="msg">
                Mensaje
              </label>
              <textarea
                id="msg"
                name="message"
                rows={4}
                maxLength={1000}
                className="mt-2 w-full resize-none border border-black/15 bg-white px-3 py-2.5 text-sm outline-none focus:border-ink"
                placeholder="Cuéntenos sobre su operación, cantidad de cámaras y objetivos."
              />
            </div>
            <button type="submit" className="btn-amber mt-2 justify-center">
              Enviar solicitud
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                <path d="M5 12h14M13 5l7 7-7 7" />
              </svg>
            </button>
            <p className="text-xs text-ink/50">
              Al enviar se abre su cliente de correo con el mensaje listo. También puede
              escribirnos directo a{" "}
              <a href={`mailto:${CONTACT_EMAIL}`} className="font-medium text-ink underline">
                {CONTACT_EMAIL}
              </a>
              . No compartimos su información con terceros.
            </p>
          </form>
        )}
      </div>
    </div>
  );
}
function Field({
  label,
  name,
  type = "text",
  required,
}: {
  label: string;
  name: string;
  type?: string;
  required?: boolean;
}) {
  return (
    <div>
      <label className="text-eyebrow text-ink/60" htmlFor={name}>
        {label}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        required={required}
        maxLength={200}
        className="mt-2 w-full border border-black/15 bg-white px-3 py-2.5 text-sm outline-none focus:border-ink"
      />
    </div>
  );
}

// ---------- Navbar ----------
function Navbar({ onCta }: { onCta: () => void }) {
  const [open, setOpen] = useState(false);
  const items = [
    { label: "Soluciones", href: "#soluciones" },
    { label: "Plataforma", href: "#plataforma" },
    { label: "Cómo funciona", href: "#como-funciona" },
    { label: "Recursos", href: "#recursos" },
  ];
  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-white/10 bg-ink/95 backdrop-blur-md">
      <div className="container-opsia flex h-16 items-center justify-between text-white">
        <a href="#top" className="flex items-center gap-2.5">
          <img src={logoMark} alt="" width={30} height={23} className="h-[23px] w-auto" />
          <span className="font-display text-lg font-semibold tracking-[-0.04em]">
            OPSIA<span className="text-amber-signal">.</span>
          </span>
        </a>
        <nav className="hidden items-center gap-8 text-sm text-white/70 md:flex">
          {items.map((i) => (
            <a key={i.href} href={i.href} className="transition hover:text-white">
              {i.label}
            </a>
          ))}
        </nav>
        <div className="flex items-center gap-3">
          <button onClick={onCta} className="btn-amber hidden md:inline-flex">
            Agendar demo
          </button>
          <button
            className="grid h-9 w-9 place-items-center border border-white/20 md:hidden"
            onClick={() => setOpen((v) => !v)}
            aria-label="Menú"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d={open ? "M6 6l12 12M18 6l-12 12" : "M4 7h16M4 12h16M4 17h16"} />
            </svg>
          </button>
        </div>
      </div>
      {open && (
        <div className="border-t border-white/10 bg-black/90 md:hidden">
          <div className="container-opsia flex flex-col gap-4 py-6 text-white">
            {items.map((i) => (
              <a key={i.href} href={i.href} onClick={() => setOpen(false)} className="text-base">
                {i.label}
              </a>
            ))}
            <button
              onClick={() => {
                setOpen(false);
                onCta();
              }}
              className="btn-amber mt-2 justify-center"
            >
              Agendar demo
            </button>
          </div>
        </div>
      )}
    </header>
  );
}

// ---------- Hero ----------
function Hero({ onCta }: { onCta: () => void }) {
  return (
    <section id="top" className="relative overflow-hidden bg-ink text-white">
      <div className="absolute inset-0">
        <img
          src={heroMine}
          alt="Vista aérea de mina a rajo abierto al atardecer"
          className="h-full w-full object-cover opacity-55"
          width={1920}
          height={1200}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/40 to-ink" />
        <div className="scan-line" />
      </div>

      <div className="container-opsia relative flex min-h-[92vh] flex-col justify-end pb-20 pt-32 md:pb-28 md:pt-40">
        <Reveal>
          <div className="mb-6 inline-flex items-center gap-2 border border-white/15 px-3 py-1.5">
            <span className="pulse-dot inline-block h-1.5 w-1.5 rounded-full bg-amber-signal" />
            <span className="text-eyebrow text-white/70">Vision AI · Seguridad industrial</span>
          </div>
        </Reveal>
        <Reveal delay={80}>
          <h1 className="text-display-xl max-w-4xl text-white">
            Sus cámaras ya ven todo. <span className="text-white/60">Nosotros hacemos que</span>{" "}
            <span className="text-amber-signal">entiendan</span>.
          </h1>
        </Reveal>
        <Reveal delay={160}>
          <p className="mt-8 max-w-2xl text-base leading-relaxed text-white/70 md:text-lg">
            OPSIA convierte las cámaras existentes de su operación en un sistema de monitoreo
            inteligente: cumplimiento de EPP, detección de maquinaria y alertas de proximidad en
            tiempo real. Sin hardware nuevo. Sin detener la operación.
          </p>
        </Reveal>
        <Reveal delay={200}>
          <p className="mt-6 max-w-2xl border-l-2 border-amber-signal pl-4 text-sm text-white/60">
            Nacidos en la minería — la industria más exigente. Llevamos ese estándar de
            seguridad a cada operación.
          </p>
        </Reveal>
        <Reveal delay={240}>
          <div className="mt-10 flex flex-wrap gap-3">
            <button onClick={onCta} className="btn-amber">
              Agendar demo
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                <path d="M5 12h14M13 5l7 7-7 7" />
              </svg>
            </button>
            <a href="#como-funciona" className="btn-ghost-dark">
              Ver cómo funciona
            </a>
          </div>
        </Reveal>

        <CamCard className="mt-12 md:hidden" />
      </div>

      <CamCard className="pointer-events-none absolute bottom-16 right-6 z-10 hidden w-[26rem] md:block lg:w-[30rem]" />

      <div className="pointer-events-none absolute bottom-4 left-6 text-[10px] tracking-[0.3em] text-white/40">
        CAM-07 · RTSP · 25 FPS
      </div>
    </section>
  );
}

function useClock() {
  const [t, setT] = useState(() => new Date());
  useEffect(() => {
    const id = setInterval(() => setT(new Date()), 1000);
    return () => clearInterval(id);
  }, []);
  const pad = (n: number) => n.toString().padStart(2, "0");
  return `${pad(t.getHours())}:${pad(t.getMinutes())}:${pad(t.getSeconds())}`;
}

function CamCard({ className = "" }: { className?: string }) {
  const time = useClock();
  return (
    <div
      className={`animate-fade-up overflow-hidden rounded-md border border-white/15 bg-black/80 shadow-[0_30px_80px_-20px_rgba(0,0,0,0.8)] backdrop-blur ${className}`}
    >
      <div className="flex items-center justify-between border-b border-white/10 px-3 py-2 text-white">
        <div className="flex items-center gap-2">
          <span className="pulse-dot inline-block h-1.5 w-1.5 rounded-full bg-red-500" />
          <span className="text-[10px] font-medium tracking-[0.2em] text-white/90">
            VISTA DE OPERADOR — SIMULACIÓN
          </span>
        </div>
        <span className="font-mono text-[10px] tracking-widest text-white/60">{time}</span>
      </div>
      <div className="relative">
        {/* Detecciones REALES: video procesado por el modelo OPSIA frame a frame */}
        <video
          src={demoVideo}
          poster={heroCam03}
          autoPlay
          muted
          loop
          playsInline
          className="block h-auto w-full"
          aria-label="Simulación ilustrativa de la vista de operador del sistema OPSIA"
        />
      </div>
      <p className="border-t border-white/10 px-3 py-1.5 text-[9px] tracking-[0.14em] text-white/45">
        SIMULACIÓN ILUSTRATIVA DE LA INTERFAZ · DEMO CON DETECCIONES REALES DISPONIBLE EN REUNIÓN
      </p>
    </div>
  );
}

// ---------- Trust bar ----------
function TrustBar() {
  const industries = ["Minería", "Construcción", "Oil & Gas"];
  return (
    <section className="border-y border-white/10 bg-ink py-10 text-white">
      <div className="container-opsia flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
        <p className="text-eyebrow text-white/50">Diseñado para las industrias más exigentes</p>
        <div className="flex flex-wrap gap-x-10 gap-y-4 text-sm text-white/70">
          {industries.map((i) => (
            <div key={i} className="flex items-center gap-2 border-l border-white/10 pl-3">
              <span className="h-1 w-1 rounded-full bg-amber-signal" />
              <span className="font-display tracking-tight">{i}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ---------- Problem ----------
function Problem() {
  return (
    <section className="bg-paper py-24 md:py-32">
      <div className="container-opsia">
        <Reveal>
          <p className="text-eyebrow text-ink/50">El problema</p>
        </Reveal>
        <Reveal delay={80}>
          <h2 className="text-display-lg mt-4 max-w-4xl text-ink">
            Un supervisor no puede mirar 40 cámaras a la vez.
            <span className="text-ink/50"> Un accidente ocurre en segundos.</span>
          </h2>
        </Reveal>
        <div className="mt-16 grid gap-10 border-t border-ink/10 pt-12 md:grid-cols-3">
          {[
            { n: 60, s: "%", t: "de los incidentes graves involucran EPP ausente o incorrecto.", src: "Referencias OSHA / literatura HSE" },
            { n: 8, s: "s", t: "es el tiempo medio en que una infracción de proximidad se vuelve incidente.", src: "Estudios de seguridad minera" },
            { n: 40, s: "+", t: "cámaras por sitio es la norma — y la atención humana sostenida sobre monitores cae a los pocos minutos.", src: "Límite operativo conocido en videovigilancia multi-cámara" },
          ].map((k, i) => (
            <Reveal key={k.t} delay={100 + i * 60}>
              <div>
                <div className="text-display-lg text-ink">
                  <Counter to={k.n} />
                  {k.s}
                </div>
                <p className="mt-4 max-w-xs text-ink/70">{k.t}</p>
                <p className="mt-3 text-xs text-ink/40">Fuente: {k.src}.</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

// ---------- Platform pillars ----------
function IconShield() {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.3">
      <path d="M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6l8-3z" />
      <path d="M9 12l2 2 4-4" />
    </svg>
  );
}
function IconMachine() {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.3">
      <path d="M3 17h14l3-4h-5l-2-3H8l-3 4H3z" />
      <circle cx="7" cy="19" r="2" />
      <circle cx="16" cy="19" r="2" />
    </svg>
  );
}
function IconReport() {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.3">
      <rect x="4" y="3" width="16" height="18" />
      <path d="M8 8h8M8 12h8M8 16h5" />
    </svg>
  );
}
function Platform() {
  const pillars = [
    {
      icon: <IconShield />,
      title: "Cumplimiento de EPP, persona por persona",
      body: "Detección de casco, chaleco reflectivo, lentes, botas, protección auditiva y uniforme reglamentario. Estado SEGURO / INSEGURO / REVISAR por trabajador.",
      chips: ["Casco", "Chaleco", "Lentes", "Botas", "Auditiva"],
    },
    {
      icon: <IconMachine />,
      title: "Maquinaria y proximidad",
      body: "Reconocimiento de volquetes, excavadoras, cargadores y vehículos livianos. Alertas cuando una persona entra al radio de riesgo de un equipo en movimiento.",
      chips: ["Volquete", "Excavadora", "Cargador", "Radio de riesgo"],
    },
    {
      icon: <IconReport />,
      title: "Evidencia y reportes",
      body: "Cada infracción queda registrada con frame, hora y zona. Reportes de cumplimiento por turno, área o contratista, listos para auditoría.",
      chips: ["Frame + hora", "Por contratista", "Por turno", "Exportable"],
    },
  ];
  return (
    <section id="plataforma" className="bg-ink py-24 text-white md:py-32">
      <div className="container-opsia">
        <Reveal>
          <p className="text-eyebrow text-white/50">La plataforma</p>
        </Reveal>
        <Reveal delay={80}>
          <h2 className="text-display-lg mt-4 max-w-3xl text-white">
            Tres capas de inteligencia sobre las cámaras que ya operan.
          </h2>
        </Reveal>
        <div className="mt-16 grid gap-px bg-white/10 md:grid-cols-3">
          {pillars.map((p, i) => (
            <Reveal key={p.title} delay={i * 120} className="bg-ink p-8 md:p-10">
              <div className="text-amber-signal">{p.icon}</div>
              <h3 className="mt-8 text-xl font-medium leading-snug">{p.title}</h3>
              <p className="mt-4 text-sm leading-relaxed text-white/60">{p.body}</p>
              <div className="mt-6 flex flex-wrap gap-1.5">
                {p.chips.map((c) => (
                  <span key={c} className="border border-white/15 px-2 py-1 text-[11px] tracking-wide text-white/70">
                    {c}
                  </span>
                ))}
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

// ---------- How it works ----------
function HowItWorks() {
  const steps = [
    { n: "01", t: "Conectamos sus cámaras", d: "Integración por RTSP / ONVIF con la infraestructura existente. Sin obra nueva, sin instalar dispositivos adicionales." },
    { n: "02", t: "La IA analiza cada frame", d: "Modelos entrenados en entornos industriales reales. Procesamiento en el borde o en la nube según su necesidad." },
    { n: "03", t: "Su equipo recibe alertas y reportes", d: "Dashboard operacional, alertas en el momento y reporte ejecutivo de cumplimiento por área, turno y contratista." },
  ];
  return (
    <section id="como-funciona" className="bg-paper py-24 md:py-32">
      <div className="container-opsia">
        <Reveal>
          <p className="text-eyebrow text-ink/50">Cómo funciona</p>
        </Reveal>
        <Reveal delay={80}>
          <h2 className="text-display-lg mt-4 max-w-3xl text-ink">
            De la cámara a la alerta, en menos de dos segundos.
          </h2>
        </Reveal>

        <div className="relative mt-16">
          <div className="pointer-events-none absolute left-0 right-0 top-8 hidden h-px bg-gradient-to-r from-transparent via-ink/20 to-transparent md:block" />
          <div className="grid gap-12 md:grid-cols-3 md:gap-8">
            {steps.map((s, i) => (
              <Reveal key={s.n} delay={i * 120}>
                <div className="relative">
                  <div className="relative z-10 grid h-16 w-16 place-items-center border border-ink/20 bg-paper font-display text-lg text-ink">
                    {s.n}
                    <span className="absolute -bottom-1 -right-1 h-2 w-2 bg-amber-signal" />
                  </div>
                  <h3 className="mt-6 text-xl font-medium text-ink">{s.t}</h3>
                  <p className="mt-3 max-w-sm text-sm leading-relaxed text-ink/70">{s.d}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>

        <Reveal delay={200}>
          <p className="mt-14 max-w-2xl border-l-2 border-amber-signal pl-4 text-sm text-ink/70">
            <span className="font-medium text-ink">Privacidad por diseño.</span> Sus videos nunca salen de su
            infraestructura si así lo requiere. Cumplimiento normativo y protección de datos de los trabajadores desde el primer frame.
          </p>
        </Reveal>
      </div>
    </section>
  );
}

// ---------- Industry solutions ----------
const INDUSTRIES = [
  {
    key: "mineria", name: "Minería", img: indMining,
    bullets: [
      "EPP en rajo y planta",
      "Proximidad persona–maquinaria pesada",
      "Control de acceso vehicular a zonas restringidas",
      "Monitoreo de polvo y condiciones de vía",
    ],
  },
  {
    key: "construccion", name: "Construcción", img: indConstruction,
    bullets: [
      "Casco, arnés y chaleco en trabajo en altura",
      "Zonas de exclusión de grúas",
      "Conteo de personal en obra",
      "Ingreso de vehículos no autorizados",
    ],
  },
  {
    key: "oilgas", name: "Oil & Gas", img: indOilgas,
    bullets: [
      "EPP en zonas clasificadas",
      "Detección de fugas y humo",
      "Permisos de trabajo en áreas calientes",
      "Vigilancia de perímetro de instalaciones",
    ],
  },
];

function Solutions({ onCta }: { onCta: () => void }) {
  const [active, setActive] = useState(INDUSTRIES[0].key);
  const current = INDUSTRIES.find((i) => i.key === active)!;
  return (
    <section id="soluciones" className="bg-ink py-24 text-white md:py-32">
      <div className="container-opsia">
        <Reveal>
          <p className="text-eyebrow text-white/50">Soluciones por industria</p>
        </Reveal>
        <Reveal delay={80}>
          <h2 className="text-display-lg mt-4 max-w-4xl text-white">
            Un mismo motor. <span className="text-white/50">Reglas específicas para cada operación.</span>
          </h2>
        </Reveal>

        <div className="mt-14 flex flex-wrap gap-2 border-b border-white/10 pb-4">
          {INDUSTRIES.map((i) => (
            <button
              key={i.key}
              onClick={() => setActive(i.key)}
              className={
                "px-4 py-2 text-sm transition " +
                (active === i.key
                  ? "bg-amber-signal text-ink"
                  : "border border-white/15 text-white/70 hover:border-white/40 hover:text-white")
              }
            >
              {i.name}
            </button>
          ))}
        </div>

        <div key={current.key} className="animate-fade-up mt-12 grid gap-10 md:grid-cols-2 md:gap-16">
          <div className="relative overflow-hidden">
            <img
              src={current.img}
              alt={`Operación ${current.name} — monitoreo por visión artificial`}
              className="h-full max-h-[520px] w-full object-cover"
              loading="lazy"
              width={1200}
              height={900}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/20 to-transparent" />
            <div className="absolute left-4 top-4 flex items-center gap-2 text-[10px] tracking-[0.3em] text-white/70">
              <span className="pulse-dot h-1.5 w-1.5 rounded-full bg-amber-signal" />
              LIVE · {current.name.toUpperCase()}
            </div>
            <div className="absolute bottom-4 right-4 text-[10px] tracking-[0.3em] text-white/50">
              CAM-{current.key.slice(0, 3).toUpperCase()}-04
            </div>
          </div>
          <div className="flex flex-col justify-center">
            <h3 className="text-2xl font-medium md:text-3xl">{current.name}</h3>
            <ul className="mt-6 space-y-4">
              {current.bullets.map((b) => (
                <li key={b} className="flex gap-3 border-b border-white/10 pb-4 text-sm text-white/80">
                  <span className="mt-2 h-1.5 w-1.5 shrink-0 bg-amber-signal" />
                  <span>{b}</span>
                </li>
              ))}
            </ul>
            <button onClick={onCta} className="btn-ghost-dark mt-8 self-start">
              Ver solución
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                <path d="M5 12h14M13 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>

        <p className="mt-12 border-t border-white/10 pt-6 text-sm text-white/50">
          ¿Opera en otra industria pesada? El motor de detección es el mismo — las reglas se
          adaptan a su operación.{" "}
          <button onClick={onCta} className="text-amber-signal underline-offset-4 hover:underline">
            Conversemos
          </button>
          .
        </p>
      </div>
    </section>
  );
}

// ---------- Team ----------
function Team() {
  const founders: {
    name: string;
    role: string;
    base: string;
    initials: string;
    photo?: string;
  }[] = [
    {
      name: "Maximiliano Lombardia",
      role: "Co-fundador · Ingeniería & Producto",
      base: "Buenos Aires",
      initials: "ML",
      photo: teamMaxi,
    },
    {
      name: "Felipe Bridge",
      role: "Co-fundador · Operaciones & Comercial",
      base: "San Juan",
      initials: "FB",
      photo: teamFelipe,
    },
    {
      name: "Emiliano Lescuras",
      role: "Co-fundador · Machine Learning & Datos",
      base: "San Juan",
      initials: "EL",
      photo: teamEmiliano,
    },
  ];
  return (
    <section className="bg-ink py-24 text-white md:py-32">
      <div className="container-opsia">
        <Reveal>
          <p className="text-eyebrow text-white/50">Quiénes somos</p>
        </Reveal>
        <Reveal delay={80}>
          <h2 className="text-display-lg mt-4 max-w-3xl text-white">
            Un equipo de IA con los pies en la tierra minera.
          </h2>
        </Reveal>
        <Reveal delay={140}>
          <p className="mt-6 max-w-2xl text-white/60">
            OPSIA nace en San Juan — corazón de la minería argentina — con formación en
            inteligencia artificial y ciencia de datos, y una convicción: la seguridad de un
            operario no puede depender de cuántos monitores alcanza a mirar un supervisor.
          </p>
        </Reveal>
        <div className="mt-14 grid gap-px bg-white/10 md:grid-cols-3">
          {founders.map((f, i) => (
            <Reveal key={f.name} delay={i * 100} className="bg-ink p-8">
              {f.photo ? (
                <img
                  src={f.photo}
                  alt={`Retrato de ${f.name}`}
                  width={800}
                  height={800}
                  loading="lazy"
                  className="aspect-square w-full max-w-[220px] border border-white/10 object-cover"
                />
              ) : (
                <div className="grid aspect-square w-full max-w-[220px] place-items-center border border-amber-signal/40 bg-white/[0.03] font-display text-4xl text-amber-signal">
                  {f.initials}
                </div>
              )}
              <h3 className="mt-6 text-lg font-medium">{f.name}</h3>
              <p className="mt-1 text-sm text-white/60">{f.role}</p>
              <p className="mt-3 text-xs tracking-[0.2em] text-white/40">{f.base.toUpperCase()}</p>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

// ---------- Impact metrics ----------
function Impact() {
  const metrics = [
    { v: 2, s: " s", label: "de cámara a alerta", prefix: "<" },
    { v: 26, s: "", label: "clases detectadas: EPP, personas y maquinaria pesada", prefix: "" },
    { v: 24, s: "/7", label: "sin fatiga de supervisión", prefix: "" },
    { v: 0, s: "", label: "hardware nuevo requerido", prefix: "" },
  ];
  return (
    <section className="bg-ink py-24 text-white md:py-32">
      <div className="container-opsia">
        <Reveal>
          <p className="text-eyebrow text-white/50">Impacto</p>
        </Reveal>
        <Reveal delay={80}>
          <h2 className="text-display-lg mt-4 max-w-3xl text-white">
            Números que sostienen conversaciones con dirección de operaciones.
          </h2>
        </Reveal>
        <div className="mt-16 grid gap-px bg-white/10 sm:grid-cols-2 lg:grid-cols-4">
          {metrics.map((m, i) => (
            <Reveal key={m.label} delay={i * 100} className="bg-ink px-6 py-10">
              <div className="font-display text-5xl font-medium tracking-tight text-white md:text-6xl">
                {m.prefix}
                <Counter to={m.v} />
                {m.s}
              </div>
              <p className="mt-4 text-sm text-white/60">{m.label}</p>
            </Reveal>
          ))}
        </div>
        <Reveal delay={200}>
          <p className="mt-10 max-w-2xl border-l-2 border-amber-signal pl-4 text-sm text-white/70">
            <span className="font-medium text-white">Tecnología propia.</span> Modelos de detección
            entrenados y validados sobre más de 48.000 anotaciones de entornos industriales reales
            — no un wrapper de APIs de terceros.
          </p>
        </Reveal>
      </div>
    </section>
  );
}

// ---------- Dashboard mockup ----------
function DashboardShowcase() {
  return (
    <section id="recursos" className="bg-paper py-24 md:py-32">
      <div className="container-opsia">
        <Reveal>
          <p className="text-eyebrow text-ink/50">Producto en acción</p>
        </Reveal>
        <Reveal delay={80}>
          <h2 className="text-display-lg mt-4 max-w-4xl text-ink">
            El dashboard operacional. <span className="text-ink/50">Todo lo que ocurre, en una sola vista.</span>
          </h2>
        </Reveal>

        <Reveal delay={120}>
          <div className="mt-14 overflow-hidden border border-ink/15 bg-white shadow-[0_30px_80px_-30px_rgba(0,0,0,0.25)]">
            <div className="flex items-center gap-2 border-b border-ink/10 bg-ink/[0.03] px-4 py-2.5">
              <span className="h-2.5 w-2.5 rounded-full bg-ink/15" />
              <span className="h-2.5 w-2.5 rounded-full bg-ink/15" />
              <span className="h-2.5 w-2.5 rounded-full bg-ink/15" />
              <div className="ml-4 flex-1 truncate rounded border border-ink/10 bg-white px-3 py-1 text-xs text-ink/50">
                app.opsia.ai/operations/site-04
              </div>
            </div>
            <div className="grid gap-px bg-ink/10 md:grid-cols-[240px_1fr_320px]">
              <aside className="bg-white p-5">
                <p className="text-eyebrow text-ink/40">Sitios</p>
                <ul className="mt-3 space-y-1 text-sm">
                  {["Mina Norte", "Planta 02", "Puerto Sur", "Obra Central"].map((s, i) => (
                    <li
                      key={s}
                      className={
                        "flex items-center justify-between px-2 py-1.5 " +
                        (i === 0 ? "bg-ink text-white" : "text-ink/70")
                      }
                    >
                      <span>{s}</span>
                      <span
                        className={
                          "h-1.5 w-1.5 rounded-full " +
                          (i === 1 ? "bg-amber-signal" : "bg-emerald-500")
                        }
                      />
                    </li>
                  ))}
                </ul>
                <p className="text-eyebrow mt-8 text-ink/40">Áreas</p>
                <ul className="mt-3 space-y-2 text-sm text-ink/70">
                  <li>Rajo A · 12 cámaras</li>
                  <li>Chancado · 8 cámaras</li>
                  <li>Talleres · 6 cámaras</li>
                  <li>Accesos · 4 cámaras</li>
                </ul>
              </aside>

              <div className="bg-white p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-eyebrow text-ink/40">Mina Norte · Turno A</p>
                    <h4 className="mt-1 text-lg font-medium text-ink">Cumplimiento en vivo</h4>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-ink/60">
                    <span className="pulse-dot h-1.5 w-1.5 rounded-full bg-emerald-500" /> En línea · 30 cámaras
                  </div>
                </div>

                <div className="mt-5 grid grid-cols-6 gap-1.5">
                  {Array.from({ length: 24 }).map((_, i) => {
                    const s = i % 7 === 3 ? "warn" : i % 11 === 5 ? "review" : "ok";
                    const bg =
                      s === "ok"
                        ? "bg-emerald-500/80"
                        : s === "warn"
                          ? "bg-amber-signal"
                          : "bg-ink/25";
                    return <div key={i} className={"h-10 " + bg} title={`Zona ${i + 1}`} />;
                  })}
                </div>
                <div className="mt-3 flex gap-4 text-[11px] text-ink/60">
                  <span className="flex items-center gap-1.5">
                    <span className="h-2 w-2 bg-emerald-500" /> Seguro
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="h-2 w-2 bg-amber-signal" /> Alerta
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="h-2 w-2 bg-ink/25" /> Revisar
                  </span>
                </div>

                <div className="mt-8">
                  <div className="flex items-baseline justify-between">
                    <p className="text-sm font-medium text-ink">Tendencia semanal · Contratista Andes SA</p>
                    <p className="font-display text-2xl font-medium text-ink">
                      86% <span className="text-eyebrow align-middle text-ink/40">Cumplimiento EPP</span>
                    </p>
                  </div>
                  <div className="mt-4 flex h-32 items-end gap-2">
                    {[62, 68, 71, 74, 73, 79, 86].map((v, i) => (
                      <div key={i} className="flex-1">
                        <div
                          className={"w-full " + (i === 6 ? "bg-amber-signal" : "bg-ink")}
                          style={{ height: `${v}%` }}
                        />
                        <p className="mt-1 text-center text-[10px] text-ink/40">
                          {["L", "M", "M", "J", "V", "S", "D"][i]}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <aside className="bg-white p-5">
                <div className="flex items-center justify-between">
                  <p className="text-eyebrow text-ink/40">Alertas en vivo</p>
                  <span className="text-[11px] text-ink/50">últimos 15 min</span>
                </div>
                <ul className="mt-3 space-y-2.5">
                  {[
                    { t: "09:41", z: "Rajo A · CAM-07", m: "Trabajador sin chaleco reflectivo", s: "warn" },
                    { t: "09:38", z: "Chancado · CAM-03", m: "Proximidad persona–volquete 3.1 m", s: "warn" },
                    { t: "09:34", z: "Accesos · CAM-01", m: "Vehículo no autorizado", s: "warn" },
                    { t: "09:28", z: "Talleres · CAM-09", m: "EPP completo confirmado", s: "ok" },
                    { t: "09:22", z: "Rajo A · CAM-05", m: "Casco no detectado", s: "warn" },
                  ].map((a, i) => (
                    <li
                      key={i}
                      className="flex gap-3 border-l-2 py-1 pl-3"
                      style={{
                        borderLeftColor:
                          a.s === "warn" ? "var(--amber-signal)" : "oklch(0.72 0.15 155)",
                      }}
                    >
                      <div className="relative h-10 w-14 shrink-0 overflow-hidden bg-ink/85">
                        {/* mini detección: caja anclada dentro del thumbnail */}
                        <span
                          className="absolute border"
                          style={{
                            top: "18%",
                            left: a.s === "warn" ? "30%" : "22%",
                            width: "38%",
                            height: "64%",
                            borderColor:
                              a.s === "warn" ? "var(--amber-signal)" : "oklch(0.72 0.15 155)",
                          }}
                        />
                      </div>
                      <div className="min-w-0">
                        <p className="text-[11px] text-ink/50">
                          {a.t} · {a.z}
                        </p>
                        <p className="truncate text-xs text-ink">{a.m}</p>
                      </div>
                    </li>
                  ))}
                </ul>
              </aside>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

// ---------- Service model ----------
function ServiceModel({ onCta }: { onCta: () => void }) {
  const tiers = [
    {
      name: "Auditoría",
      tag: "Ideal para empezar",
      d: "Análisis de video grabado. Reporte de cumplimiento y hallazgos en 72 horas. Sin integración a tiempo real.",
      features: ["Análisis retrospectivo", "Reporte ejecutivo", "Recomendaciones priorizadas"],
      highlight: false,
    },
    {
      name: "Monitoreo continuo",
      tag: "Más elegido",
      d: "Procesamiento en vivo, dashboard operacional y alertas en el momento para el equipo HSE.",
      features: ["Alertas en tiempo real", "Dashboard multi-sitio", "Reportes por turno y contratista"],
      highlight: true,
    },
    {
      name: "Enterprise",
      tag: "Multi-sitio",
      d: "Integración con sistemas HSE existentes. Modelos a medida del uniforme y procedimientos de su empresa.",
      features: ["Modelos a medida", "Integración HSE / SSO", "SLA dedicado", "Procesamiento on-premise"],
      highlight: false,
    },
  ];
  return (
    <section className="bg-paper py-24 md:py-32">
      <div className="container-opsia">
        <Reveal>
          <p className="text-eyebrow text-ink/50">Modelo de servicio</p>
        </Reveal>
        <Reveal delay={80}>
          <h2 className="text-display-lg mt-4 max-w-3xl text-ink">
            Tres formas de empezar. <span className="text-ink/50">Sin sorpresas.</span>
          </h2>
        </Reveal>

        <Reveal delay={120}>
          <div className="mt-10 flex flex-col gap-3 border-l-2 border-amber-signal pl-4 text-sm text-ink/70 md:flex-row md:items-center md:gap-8">
            <span className="font-medium text-ink">Cómo empezamos:</span>
            <span>① Llamada de 30 minutos</span>
            <span className="hidden text-ink/30 md:inline">→</span>
            <span>② Auditoría piloto sobre video de SU operación</span>
            <span className="hidden text-ink/30 md:inline">→</span>
            <span>③ Propuesta con números reales de su sitio</span>
          </div>
        </Reveal>

        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {tiers.map((t, i) => (
            <Reveal key={t.name} delay={i * 100}>
              <div
                className={
                  "flex h-full flex-col border p-8 " +
                  (t.highlight
                    ? "border-ink bg-ink text-white"
                    : "border-ink/15 bg-white text-ink")
                }
              >
                <div className="flex items-center justify-between">
                  <p
                    className={
                      "text-eyebrow " + (t.highlight ? "text-amber-signal" : "text-ink/40")
                    }
                  >
                    {t.tag}
                  </p>
                  {t.highlight && <span className="h-1.5 w-1.5 rounded-full bg-amber-signal" />}
                </div>
                <h3 className="mt-4 text-2xl font-medium">{t.name}</h3>
                <p
                  className={
                    "mt-3 text-sm leading-relaxed " +
                    (t.highlight ? "text-white/70" : "text-ink/70")
                  }
                >
                  {t.d}
                </p>
                <ul
                  className={
                    "mt-6 space-y-3 border-t pt-6 text-sm " +
                    (t.highlight ? "border-white/15 text-white/80" : "border-ink/10 text-ink/80")
                  }
                >
                  {t.features.map((f) => (
                    <li key={f} className="flex gap-2">
                      <span
                        className={
                          "mt-2 h-1 w-1 shrink-0 " + (t.highlight ? "bg-amber-signal" : "bg-ink")
                        }
                      />
                      {f}
                    </li>
                  ))}
                </ul>
                <button
                  onClick={onCta}
                  className={"mt-8 justify-center " + (t.highlight ? "btn-amber" : "btn-ghost-light")}
                >
                  Conversar con nosotros
                </button>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

// ---------- FAQ ----------
function FAQ() {
  const items = [
    { q: "¿Sirven mis cámaras actuales?", a: "Sí. OPSIA se integra con la mayoría de cámaras IP mediante RTSP u ONVIF. No requerimos hardware nuevo ni reemplazo del CCTV existente." },
    { q: "¿Dónde se procesa el video?", a: "En el borde, en su nube o en la nuestra. Muchas operaciones eligen procesamiento on-premise para que el video nunca salga de su infraestructura." },
    { q: "¿Cuánto tarda la implementación?", a: "Una auditoría entrega resultados en 72 h. Un despliegue de monitoreo continuo por sitio suele tomar entre 2 y 6 semanas, según cantidad de cámaras y reglas." },
    { q: "¿Detecta el uniforme específico de mi empresa?", a: "En el plan Enterprise entrenamos modelos a medida del uniforme, colores corporativos, distintivos de rol y procedimientos particulares de su operación." },
    { q: "¿Cómo manejan la privacidad de los trabajadores?", a: "Aplicamos privacidad por diseño: sin reconocimiento facial de identidad, retención mínima de imágenes y difuminado de rostros configurable en reportes." },
    { q: "¿Funciona de noche o con polvo, lluvia o niebla?", a: "Los modelos están entrenados en condiciones industriales adversas. Recomendamos iluminación mínima adecuada; en condiciones extremas ajustamos umbrales y calibración por cámara." },
  ];
  const [open, setOpen] = useState<number | null>(0);
  return (
    <section className="bg-ink py-24 text-white md:py-32">
      <div className="container-opsia grid gap-10 md:grid-cols-[1fr_1.6fr] md:gap-16">
        <Reveal>
          <div>
            <p className="text-eyebrow text-white/50">Preguntas frecuentes</p>
            <h2 className="text-display-lg mt-4 text-white">
              Todo lo que operaciones y HSE preguntan primero.
            </h2>
          </div>
        </Reveal>
        <div className="border-t border-white/10">
          {items.map((it, i) => {
            const isOpen = open === i;
            return (
              <div key={i} className="border-b border-white/10">
                <button
                  onClick={() => setOpen(isOpen ? null : i)}
                  className="flex w-full items-center justify-between gap-6 py-6 text-left"
                  aria-expanded={isOpen}
                >
                  <span className="text-base font-medium md:text-lg">{it.q}</span>
                  <span
                    className={
                      "grid h-8 w-8 shrink-0 place-items-center border border-white/20 transition " +
                      (isOpen ? "bg-amber-signal text-ink" : "text-white/60")
                    }
                  >
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d={isOpen ? "M5 12h14" : "M12 5v14M5 12h14"} />
                    </svg>
                  </span>
                </button>
                <div
                  className="grid overflow-hidden transition-[grid-template-rows] duration-300"
                  style={{ gridTemplateRows: isOpen ? "1fr" : "0fr" }}
                >
                  <div className="min-h-0">
                    <p className="pb-6 pr-14 text-sm leading-relaxed text-white/70">{it.a}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

// ---------- Final CTA ----------
function FinalCTA({ onCta, onAudit }: { onCta: () => void; onAudit: () => void }) {
  return (
    <section className="bg-ink py-20 md:py-28">
      <div className="container-opsia">
        <div className="relative overflow-hidden bg-amber-signal p-10 md:p-16">
          <div className="pointer-events-none absolute -right-12 -top-12 hidden h-36 w-36 border border-ink/15 lg:block" />
          <p className="text-eyebrow text-ink/70">Decisión</p>
          <h2 className="text-display-lg mt-4 max-w-3xl text-ink">
            La próxima infracción puede ser un incidente. O una alerta.
          </h2>
          <div className="mt-10 flex flex-wrap gap-3">
            <button
              onClick={onCta}
              className="inline-flex items-center gap-2 bg-ink px-6 py-3.5 text-sm font-medium text-white transition hover:bg-ink-soft"
            >
              Agendar demo
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                <path d="M5 12h14M13 5l7 7-7 7" />
              </svg>
            </button>
            <button
              onClick={onAudit}
              className="inline-flex items-center gap-2 border border-ink px-6 py-3.5 text-sm font-medium text-ink transition hover:bg-ink hover:text-white"
            >
              Solicitar auditoría piloto
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

// ---------- Footer ----------
function Footer() {
  const [subscribed, setSubscribed] = useState(false);
  const cols = [
    { t: "Soluciones", items: ["Minería", "Construcción", "Oil & Gas", "Otras industrias"] },
    { t: "Plataforma", items: ["Cumplimiento EPP", "Maquinaria y proximidad", "Evidencia y reportes", "Integraciones"] },
    { t: "Empresa", items: ["Sobre OPSIA", "Investigación", "Recursos", "Contacto"] },
    { t: "Legal", items: ["Privacidad", "Términos", "Seguridad de datos", "GDPR / Ley 25.326"] },
  ];
  return (
    <footer className="bg-ink pb-10 pt-24 text-white/80">
      <div className="container-opsia">
        <div className="grid gap-12 border-t border-white/10 pt-12 md:grid-cols-[1.4fr_repeat(4,1fr)]">
          <div>
            <div className="flex items-center gap-3">
              <img src={logoMark} alt="" width={36} height={27} className="h-[27px] w-auto" />
              <div>
                <p className="font-display text-xl font-semibold leading-none tracking-[-0.04em] text-white">
                  OPSIA<span className="text-amber-signal">.</span>
                </p>
                <p className="mt-1 text-[10px] tracking-[0.28em] text-amber-signal/90">
                  AI VISION FOR MINING
                </p>
              </div>
            </div>
            <p className="mt-4 max-w-xs text-sm text-white/60">
              Visión artificial para operaciones seguras. Convertimos sus cámaras en un supervisor que no se distrae.
            </p>
            <a
              href={`mailto:${CONTACT_EMAIL}`}
              className="mt-4 inline-flex items-center gap-2 text-sm text-white/80 transition hover:text-amber-signal"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <rect x="3" y="5" width="18" height="14" rx="1" />
                <path d="M3 7l9 6 9-6" />
              </svg>
              {CONTACT_EMAIL}
            </a>
            <p className="mt-3 max-w-xs text-xs leading-relaxed text-white/40">
              Cobertura: San Juan · Mendoza · Salta · Jujuy · Neuquén · Río Negro · Buenos Aires
            </p>
            <form
              className="mt-6"
              onSubmit={(e) => {
                e.preventDefault();
                setSubscribed(true);
                (e.currentTarget as HTMLFormElement).reset();
              }}
            >
              <label htmlFor="newsletter" className="text-eyebrow text-white/50">
                Novedades de seguridad industrial e IA · 1 email/mes
              </label>
              {subscribed ? (
                <p className="mt-3 border border-amber-signal/40 px-3 py-2.5 text-sm text-amber-signal">
                  Listo — le llega el próximo número.
                </p>
              ) : (
                <div className="mt-3 flex border border-white/15">
                  <input
                    id="newsletter"
                    type="email"
                    required
                    placeholder="usted@empresa.com"
                    className="min-w-0 flex-1 bg-transparent px-3 py-2.5 text-sm text-white outline-none placeholder:text-white/30"
                  />
                  <button className="bg-amber-signal px-4 text-sm text-ink transition hover:brightness-95">
                    Suscribir
                  </button>
                </div>
              )}
            </form>
          </div>
          {cols.map((c) => (
            <div key={c.t}>
              <p className="text-eyebrow text-white/50">{c.t}</p>
              <ul className="mt-4 space-y-2.5 text-sm text-white/70">
                {c.items.map((i) => (
                  <li key={i}>
                    <a
                      href={i === "Contacto" ? `mailto:${CONTACT_EMAIL}` : "#"}
                      className="transition hover:text-white"
                    >
                      {i}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="mt-16 flex flex-col justify-between gap-4 border-t border-white/10 pt-6 text-xs text-white/40 md:flex-row">
          <p>© 2026 OPSIA — Visión artificial para operaciones seguras.</p>
          <p>San Juan · Buenos Aires · Argentina</p>
        </div>
      </div>
    </footer>
  );
}

// ---------- Page ----------
function OpsiaLanding() {
  const [modal, setModal] = useState<{ open: boolean; intent?: string }>({ open: false });
  const openDemo = () => setModal({ open: true, intent: "demo" });
  const openAudit = () => setModal({ open: true, intent: "audit" });
  return (
    <div className="min-h-screen bg-ink">
      <Navbar onCta={openDemo} />
      <main>
        <Hero onCta={openDemo} />
        <TrustBar />
        <Problem />
        <Platform />
        <HowItWorks />
        <Solutions onCta={openDemo} />
        <Impact />
        <DashboardShowcase />
        <ServiceModel onCta={openDemo} />
        <Team />
        <FAQ />
        <FinalCTA onCta={openDemo} onAudit={openAudit} />
      </main>
      <Footer />
      <ContactModal open={modal.open} onClose={() => setModal({ open: false })} intent={modal.intent} />
    </div>
  );
}