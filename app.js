// Panel Ceci — app.js (v2)
// ✅ Buscar lead en el mismo Apps Script (doGet?action=search)
// ✅ Render interno + recomendación de paquete
// ✅ NUEVO: botón para expandir “vista resultado test” en tercera persona (para Ceci)

const APPS_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbyIEcKAHlnfrI9Ktb8qwdbls3p6A1oeKnbDqY6wd5raOacyiaYV1GIV6PkzVNyeSWYQ/exec";
const API_TOKEN = ""; // si configuraste token en Apps Script, pegalo aquí

const WHATSAPP_BASE = "https://wa.me/595985689454";

const $ = (sel) => document.querySelector(sel);

function escapeHtml(str){
  return String(str ?? "")
    .replace(/&/g,"&amp;")
    .replace(/</g,"&lt;")
    .replace(/>/g,"&gt;")
    .replace(/"/g,"&quot;")
    .replace(/'/g,"&#039;");
}

function normalize_(v){
  return String(v || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function showStatus(msg){
  const el = $("#status");
  el.style.display = "block";
  el.textContent = msg;
}

function hideStatus(){
  const el = $("#status");
  el.style.display = "none";
  el.textContent = "";
}

function showResult(){
  const s = $("#screen-result");
  s.hidden = false;
  s.classList.remove("hidden");
}

function hideResult(){
  const s = $("#screen-result");
  s.hidden = true;
  s.classList.add("hidden");
}

function kvRow(k, v){
  return `<div class="row"><div class="k">${escapeHtml(k)}</div><div class="v">${escapeHtml(v)}</div></div>`;
}

// =====================================
// Copia “contenido del test” (para recrear vista resultado)
// =====================================
const archetypes = {
  A: {
    name: "💎 Clásicos Elegantes",
    tagline: "La excelencia es el lenguaje del amor.",
    brief: "Orden, armonía y estética impecable. La emoción es contenida, refinada e intencional.",
    full: "Valoran coherencia y dirección. No improvisan momentos: los diseñan. La música ideal marca entradas y transiciones con elegancia, sin exageración. Se siente premium, pulido y emocionalmente seguro: todo fluye con clase.",
    boutique: {
      identity: "No buscan impresionar. Buscan permanecer.",
      promise: "La experiencia se sostiene en timing, detalle y coherencia estética.",
      scene: ["Puertas cerradas.","El murmullo baja apenas.","Primera nota del violín.","No es estridente.","Es preciso."]
    },
    set: ["Violín + piano (ideal con baby grand piano shell)","Ceremonia: clásico/romántico refinado","Cóctel: instrumental elegante con pop reinterpretado"]
  },
  B: {
    name: "🌿 Románticos Naturales",
    tagline: "Si no se siente auténtico, no es para ellos.",
    brief: "Calidez, luz suave y emoción genuina. Menos show, más verdad.",
    full: "Priorizan conexión por encima del impacto. La música acompaña y sostiene la atmósfera sin invadir. Se siente orgánica, íntima y real: como una historia contada bajito, pero que deja huella.",
    boutique: {
      identity: "No necesitan gritar para sentirse. Necesitan verdad.",
      promise: "Buscan emoción honesta: de esas que hacen respirar hondo antes de entrar.",
      scene: ["Luz cálida.","Miradas largas.","Una melodía que abraza.","Invitados en silencio suave.","Todo se siente real."]
    },
    set: ["Violín + piano íntimo","Ceremonia: romántico suave","Cóctel: indie/pop delicado instrumental"]
  },
  C: {
    name: "🎨 Creativos Vanguardistas",
    tagline: "No quieren una boda. Quieren una experiencia.",
    brief: "Editorial, audaz y con identidad propia. Un concepto, no un formato.",
    full: "Piensan en narrativa y diseño. La música puede sorprender con arreglos únicos y giros inesperados, siempre con estética cuidada. Quieren identidad: algo que se note distinto, pero elegante.",
    boutique: {
      identity: "Una experiencia con firma y estética.",
      promise: "Les importa que se note curado, diseñado, pensado.",
      scene: ["Una entrada con giro.","Un silencio antes del ‘wow’.","Una melodía cambia el aire.","Reacciones contenidas.","Elegancia con identidad."]
    },
    set: ["Violín protagonista + piano","Arreglos exclusivos","Momento ‘wow’ elegante (performance breve)"]
  },
  D: {
    name: "🎉 Sociales Festivos",
    tagline: "Quieren que todos recuerden esa noche.",
    brief: "Celebración, energía y momentos compartidos. La emoción es expansiva.",
    full: "Diseñan pensando en la vibra del invitado. La música marca el ritmo y sube energía con inteligencia: momentos de aplauso, sonrisas y transición natural a una fiesta inolvidable.",
    boutique: {
      identity: "No se mira. Se vive.",
      promise: "La música funciona como motor del clima: levanta sin esfuerzo.",
      scene: ["Aplausos en la entrada.","Sonrisas que se multiplican.","Ritmo que sube.","Cóctel con energía.","Transición perfecta a fiesta."]
    },
    set: ["Violín con presencia escénica","Hits instrumental en cóctel","Performance sorpresa para activar"]
  },
  E: {
    name: "🤍 Íntimos Emocionales",
    tagline: "No buscan espectáculo. Buscan significado.",
    brief: "Profundidad, historia y emoción silenciosa. Momentos que se quedan en la piel.",
    full: "Priorizan lo verdadero. La música ideal es puente emocional: acompaña votos, lecturas y momentos simbólicos con sensibilidad. No necesita volumen para ser intensa: se siente cerca.",
    boutique: {
      identity: "Se trata de sentido, no de show.",
      promise: "Quieren un momento donde todo se apague y solo quede lo importante.",
      scene: ["Respiración contenida.","Votos que pesan.","Una melodía tiembla suave.","Lágrimas sinceras.","Silencio con significado."]
    },
    set: ["Violín + piano minimalista","Canciones personalizadas","Momentos íntimos dirigidos con sensibilidad"]
  }
};

const musicModules = {
  M1: { name:"Acompañamiento Sutil", brief:"Presente, pero nunca compite.", full:"Ideal para atmósfera romántica e íntima. Violín + piano con arreglos suaves y transiciones fluidas." },
  M2: { name:"Protagonismo Sofisticado", brief:"Marca momentos clave con intención.", full:"La música guía entradas y clímax emocionales con coherencia estética. Violín + piano con arreglos personalizados." },
  M3: { name:"Momento WOW", brief:"Sorpresa elegante y memorable.", full:"Intervenciones breves y estratégicas para generar reacción. Performance sorpresa con estética cuidada." }
};

const setlists = {
  A: { moments: [
    { name:"Ceremonia", songs:["Canon in D — Pachelbel","Clair de Lune — Debussy","A Thousand Years — instrumental","Perfect — instrumental"] },
    { name:"Cóctel", songs:["La Vie En Rose — instrumental","Fly Me to the Moon — instrumental","At Last — instrumental"] },
    { name:"WOW", songs:["Viva la Vida — instrumental elegante","Yellow — instrumental"] }
  ]},
  B: { moments: [
    { name:"Ceremonia", songs:["Turning Page — instrumental","I Get to Love You — instrumental","You Are the Reason — instrumental"] },
    { name:"Cóctel", songs:["Ho Hey — instrumental","Riptide — instrumental","Somewhere Only We Know — instrumental"] },
    { name:"Cierre", songs:["A Sky Full of Stars — instrumental suave"] }
  ]},
  C: { moments: [
    { name:"Ceremonia", songs:["Experience — Einaudi","Nuvole Bianche — Einaudi","Time — Hans Zimmer"] },
    { name:"Cóctel", songs:["Midnight City — instrumental","Blinding Lights — instrumental classy","Levitating — instrumental"] },
    { name:"WOW", songs:["Titanium — instrumental épico","Viva la Vida — arreglo sorpresa"] }
  ]},
  D: { moments: [
    { name:"Ceremonia", songs:["Marry You — instrumental","I’m Yours — instrumental","Love on Top — instrumental"] },
    { name:"Cóctel", songs:["Uptown Funk — instrumental","September — instrumental","Happy — instrumental"] },
    { name:"Activación", songs:["Don’t Stop Me Now — instrumental","Titanium — instrumental épico"] }
  ]},
  E: { moments: [
    { name:"Ceremonia", songs:["River Flows in You — Yiruma","Kiss the Rain — Yiruma","Clair de Lune — Debussy"] },
    { name:"Cóctel", songs:["Make You Feel My Love — instrumental","Hallelujah — instrumental","Stand By Me — instrumental suave"] },
    { name:"Simbólico", songs:["A Thousand Years — instrumental (íntimo)"] }
  ]}
};

const intensityAddOns = {
  M1: { title:"Ajuste (M1 — sutil)", note:"Arreglos suaves y atmósfera. Menos cambios bruscos.", add:["Clair de Lune — Debussy","Kiss the Rain — Yiruma","Turning Page — instrumental"] },
  M2: { title:"Ajuste (M2 — sofisticado)", note:"Piezas “ancla” para entradas y transiciones. Timing y coordinación.", add:["Canon in D — Pachelbel","La Vie En Rose — instrumental","Viva la Vida — instrumental elegante"] },
  M3: { title:"Ajuste (M3 — WOW)", note:"1–2 intervenciones sorpresa (60–90s) con estética cuidada.", add:["Titanium — instrumental épico","Blinding Lights — instrumental classy","Uptown Funk — mini show"] }
};

// =====================================
// Recomendación de paquetes (igual que antes)
// =====================================
const PACKAGES = {
  Solista: {
    Estándar: { title:"Solista — Estándar", subtitle:"Ceremonia religiosa o civil", bullets:[
      "Ambientación 8 (religiosa) o 4 (civil)","Incluye reunión virtual, sonido, asesoramiento y traslado","Violín con pista"
    ]},
    Clásico: { title:"Solista — Clásico", subtitle:"Ceremonia religiosa y civil", bullets:[
      "Ambientación 8 + 4","Incluye reunión virtual, sonido, asesoramiento y traslado","Violín con pista"
    ]},
    Premium: { title:"Solista — Premium", subtitle:"Religiosa + civil + salón", bullets:[
      "Ambientación 8 + 4","45 min en salón + vals","Incluye reunión virtual, sonido, asesoramiento y traslado","Violín con pista"
    ]}
  },
  "Dúo": {
    Estándar: { title:"Dúo — Estándar (violín + piano)", subtitle:"Ceremonia religiosa o civil", bullets:[
      "Ambientación 9 (religiosa) o 4 (civil)","Incluye reunión virtual, sonido, asesoramiento y traslado","Violín + piano en vivo"
    ]},
    Clásico: { title:"Dúo — Clásico (violín + piano)", subtitle:"Ceremonia religiosa y civil", bullets:[
      "Ambientación 9 + 4","Incluye reunión virtual, sonido, asesoramiento y traslado","Violín + piano en vivo"
    ]},
    Premium: { title:"Dúo — Premium (violín + piano)", subtitle:"Religiosa + civil + salón", bullets:[
      "Ambientación 9 + 4","45 min en salón + vals","Incluye reunión virtual, sonido, asesoramiento y traslado"
    ]}
  },
  "Trío": {
    Estándar: { title:"Trío — Estándar (violín + piano cola + cello)", subtitle:"Ceremonia religiosa o civil", bullets:[
      "Ambientación 9 (religiosa) o 4 (civil)","Incluye reunión virtual, sonido, asesoramiento y traslado","Trío completo"
    ]},
    Clásico: { title:"Trío — Clásico (violín + piano cola + cello)", subtitle:"Ceremonia religiosa y civil", bullets:[
      "Ambientación 9 + 4","Incluye reunión virtual, sonido, asesoramiento y traslado","Trío completo"
    ]},
    Premium: { title:"Trío — Premium (violín + piano cola + cello)", subtitle:"Religiosa + civil + salón", bullets:[
      "Ambientación 9 + 4","50 min previa/cena + vals","Incluye reunión virtual, sonido, asesoramiento y traslado","Trío completo"
    ]}
  }
};

const VENUE_POINTS = {
  "la riviere": 2,"es vedra": 2,"las takuaras": 2,"castillo remanso": 2,"casa puente": 2,"castillo": 2,"puerto liebig": 2,
  "talleryrand": 2,"talleryrand costanera": 2,"villa maria": 2,"casa corbellani": 2,"casita quinta": 2,
  "villa jardin": 1,"royal": 1,"royal eventos": 1,"soir": 1,"soir eventos": 1,"vista verde": 1,"la isabella": 1,
  "casa 1927": 1,"la glorieta": 1,"mantra salon boutique": 1,
  "rusticana": 0,"rusticana eventos": 0,"isabella": 0,"tiam eventos": 0,"mantra": 0
};

function promoteFormation_(formation){
  const order = ["Solista","Dúo","Trío"];
  const idx = order.indexOf(formation);
  if (idx < 0) return "Dúo";
  return order[Math.min(idx+1, order.length-1)];
}

function recommendPackage(lead){
  const intensity = String(lead.intensidad_musical || "").trim() || "M2";
  const invitados = String(lead.invitados || "");
  const mi = Number(lead.q6_music_importance ?? lead.music_importance ?? 5);
  const focus = String(lead.q9_focus_moment || "").trim(); // CER/COC/AMB/GUIA
  const prioridad = String(lead.prioridad || "C");
  const venueNorm = normalize_(lead.venue_normalizado || lead.venue || "");

  let formation = "Dúo";
  if (intensity === "M1") formation = "Solista";
  if (intensity === "M2") formation = "Dúo";
  if (intensity === "M3") formation = "Trío";

  if (invitados === "150 – 250" && formation === "Solista") formation = "Dúo";
  if (invitados === "Más de 250") formation = "Trío";

  const vp = venueNorm ? (VENUE_POINTS[venueNorm] ?? 0) : 0;
  if (vp >= 2) formation = promoteFormation_(formation);
  if (Number.isFinite(mi) && mi >= 9) formation = promoteFormation_(formation);

  let tier = "Clásico";
  if (focus === "COC" || focus === "AMB") tier = "Premium";
  else if (focus === "CER") tier = (prioridad === "A") ? "Premium" : (prioridad === "B") ? "Clásico" : "Estándar";
  else if (focus === "GUIA") tier = (prioridad === "A") ? "Premium" : "Clásico";
  else tier = (prioridad === "A") ? "Premium" : (prioridad === "B") ? "Clásico" : "Estándar";

  let altTier = (tier === "Premium") ? "Clásico" : "Estándar";
  let altFormation = formation;
  if (formation === "Trío" && tier === "Premium") { altFormation = "Dúo"; altTier = "Premium"; }

  const main = PACKAGES[formation]?.[tier];
  const alt = PACKAGES[altFormation]?.[altTier];

  const explanation = [
    `Intensidad: ${(musicModules[intensity]?.name || intensity)}`,
    `Importancia: ${Number.isFinite(mi) ? mi + "/10" : "—"}`,
    `Invitados: ${invitados || "—"}`,
    `Foco: ${lead.q9_focus_label || focus || "—"}`,
    `Venue score: ${vp}`
  ].join(" · ");

  return { formation, tier, main, altFormation, altTier, alt, explanation };
}

// =====================================
// Helpers Vista “Resultado” (3ra persona)
// =====================================
function archetypeKeyFromName_(name){
  const n = String(name || "");
  for (const k of Object.keys(archetypes)){
    if (archetypes[k].name === n) return k;
  }
  return null;
}

function pickTeasersByFocus_(archKey, focusMoment, max = 2){
  const sl = setlists[archKey];
  if (!sl?.moments?.length) return [];
  const ceremony = sl.moments[0]?.songs || [];
  const cocktail = sl.moments[1]?.songs || [];

  if (focusMoment === "CER") return ceremony.slice(0, max);
  if (focusMoment === "COC") return cocktail.slice(0, max);
  if (focusMoment === "AMB") {
    const out = [];
    if (ceremony[0]) out.push(ceremony[0]);
    if (out.length < max && cocktail[0]) out.push(cocktail[0]);
    if (out.length < max && ceremony[1]) out.push(ceremony[1]);
    if (out.length < max && cocktail[1]) out.push(cocktail[1]);
    return out.slice(0, max);
  }
  // GUIA / otros
  const out = [];
  if (ceremony[0]) out.push(ceremony[0]);
  if (out.length < max && cocktail[0]) out.push(cocktail[0]);
  return out.slice(0, max);
}

function investmentBlock_(intensity){
  if (intensity === "M1") return "Este perfil prioriza sensibilidad, coherencia y una personalización moderada.";
  if (intensity === "M2") return "Este perfil invierte estratégicamente en arreglos personalizados y coordinación musical.";
  return "Este perfil suele priorizar momentos sorpresa, arreglos exclusivos y elementos diferenciales.";
}

function curationAdviceThirdPerson_(label){
  if (!label) return "";
  if (label.includes("cero estrés")) return "Les conviene un set completo propuesto por Ceci para aprobar en un solo paso: rápido y sin carga mental.";
  if (label.includes("Mitad")) return "Les conviene un proceso mixto: Ceci propone 2–3 opciones por momento y la pareja elige sin perder tiempo.";
  return "Les conviene una selección más curada: Ceci guía el criterio y la pareja elige con detalle para que todo sea 100% identidad.";
}

function renderCoupleViewThirdPerson_(lead){
  const archPName = lead.arquetipo_primary || "";
  const archSName = lead.arquetipo_secondary || "";
  const archKey = archetypeKeyFromName_(archPName) || "B";
  const a1 = archetypes[archKey];
  const intensity = String(lead.intensidad_musical || "M2");
  const m = musicModules[intensity] || musicModules.M2;

  const mi = String(lead.q6_music_importance ?? lead.music_importance ?? "5");
  const prioridad = String(lead.prioridad || "—");
  const indice = String(lead.indice_diseno || "—");
  const focus = String(lead.q9_focus_moment || "");
  const focusLabel = String(lead.q9_focus_label || "—");
  const planningLabel = String(lead.q3_planning_label || "—");
  const curationLabel = String(lead.q8_curation_label || "—");

  const sceneLines = (a1.boutique?.scene || []).map(l => `<p class="line">${escapeHtml(l)}</p>`).join("");
  const teasers = pickTeasersByFocus_(archKey, focus, 2);

  const curationBlock = curationLabel && curationLabel !== "—"
    ? `<div class="result-box" style="margin-top:12px;">
         <h3>🎼 Selección de canciones (lo que más les conviene)</h3>
         <p class="muted" style="margin:0;">${escapeHtml(curationAdviceThirdPerson_(curationLabel))}</p>
       </div>`
    : "";

  const addOn = intensityAddOns[intensity];
  const addOnHtml = addOn ? `
    <div class="gold-card" style="margin-top:12px;">
      <div class="gold-title">${escapeHtml(addOn.title)}</div>
      <div class="gold-text">${escapeHtml(addOn.note)}</div>
      <div class="divider"></div>
      <strong>+3 temas sugeridos por intensidad</strong>
      <ul style="margin:8px 0 0 18px;">
        ${addOn.add.map(x => `<li>${escapeHtml(x)}</li>`).join("")}
      </ul>
    </div>
  ` : "";

  return `
    <div class="quote">
      <p style="margin:0;"><strong>${escapeHtml(a1.tagline)}</strong></p>
      <p class="muted" style="margin:8px 0 0 0;">${escapeHtml(a1.boutique?.identity || "")}</p>
    </div>

    <div class="scene">
      ${sceneLines}
      <p class="muted" style="margin-top:10px;">${escapeHtml(a1.boutique?.promise || "")}</p>
    </div>

    <div class="result-box" style="margin-top:12px;">
      <div class="couple-title">Perfil principal: ${escapeHtml(a1.name)}</div>
      <p class="couple-sub">${escapeHtml(a1.brief)}</p>

      <p class="muted" style="margin:0;">
        📍 Venue: ${escapeHtml(lead.venue || "—")} · 👥 Invitados: ${escapeHtml(lead.invitados || "—")}
        · 🧩 Planificación: ${escapeHtml(planningLabel)}
        · 🎯 Foco: ${escapeHtml(focusLabel)}
      </p>
    </div>

    <div class="result-box" style="margin-top:12px;">
      <h3>✨ Descripción (tercera persona)</h3>
      <p style="margin:0;">${escapeHtml(a1.full)}</p>
    </div>

    <div class="result-box" style="margin-top:12px;">
      <h3>✨ Matiz secundario</h3>
      <p class="muted" style="margin:0;">
        Secundario: <strong>${escapeHtml(archSName || "—")}</strong>
      </p>
    </div>

    <div class="result-box" style="margin-top:12px;">
      <h3>🎻 Intensidad musical ideal: ${escapeHtml(m.name)}</h3>
      <p class="muted" style="margin:0 0 8px 0;">${escapeHtml(m.brief)}</p>
      <p style="margin:0;">${escapeHtml(m.full)}</p>
    </div>

    <div class="result-box" style="margin-top:12px;">
      <h3>🎵 Teaser de setlist (según el foco)</h3>
      <ul style="margin:8px 0 0 18px;">
        ${teasers.map(t => `<li>${escapeHtml(t)}</li>`).join("")}
      </ul>
      <p class="muted" style="margin-top:10px;">La selección completa se termina de ajustar según timing real, entradas/vals y canciones significativas.</p>
    </div>

    ${addOnHtml}

    <div class="gold-card">
      <div class="gold-title">Índice de Diseño Emocional</div>
      <div class="gold-percentage">${escapeHtml(indice)}%</div>
      <div class="gold-text">
        Este perfil suele valorar coherencia estética y una experiencia con intención.
        <br><br>
        Prioridad interna: <strong>${escapeHtml(prioridad)}</strong> · Importancia música: <strong>${escapeHtml(mi)}/10</strong>
      </div>
    </div>

    <div class="result-box" style="margin-top:12px;">
      <h3>💎 Perfil de inversión (tercera persona)</h3>
      <p class="muted" style="margin:0;">${escapeHtml(investmentBlock_(intensity))}</p>
    </div>

    ${curationBlock}

    <div class="result-box" style="margin-top:12px;">
      <h3>🎼 Set recomendado (formato)</h3>
      <ul style="margin:8px 0 0 18px;">
        ${a1.set.map(x => `<li>${escapeHtml(x)}</li>`).join("")}
      </ul>
    </div>
  `;
}

// =====================================
// Render principal del panel
// =====================================
function renderLead(lead){
  const title = $("#lead-title");
  const subtitle = $("#lead-subtitle");
  const pr = $("#lead-priority");

  const nombre = lead.nombre || "—";
  const telefono = lead.telefono || "—";
  const fecha = lead.fecha_boda || "—";

  title.textContent = `${nombre}`;
  subtitle.textContent = `📞 ${telefono} · 📅 ${fecha} · lead_id: ${lead.lead_id || "—"}`;
  pr.textContent = `Prioridad: ${lead.prioridad || "—"} · Índice: ${lead.indice_diseno || "—"}%`;

  // TEST KV
  const archP = lead.arquetipo_primary || "—";
  const archS = lead.arquetipo_secondary || "—";
  const intensity = lead.intensidad_musical || "—";
  const mi = lead.q6_music_importance || lead.music_importance || "—";
  const focusLabel = lead.q9_focus_label || "—";

  $("#kv-test").innerHTML = [
    kvRow("Arquetipo primario", archP),
    kvRow("Arquetipo secundario", archS),
    kvRow("Intensidad", `${intensity} — ${musicModules[intensity]?.name || ""}`.trim()),
    kvRow("Importancia música", `${mi}/10`),
    kvRow("Foco", focusLabel),
    kvRow("Planning", lead.q3_planning_label || "—"),
    kvRow("Curación", lead.q8_curation_label || "—")
  ].join("");

  // EVENT KV
  $("#kv-event").innerHTML = [
    kvRow("Venue", lead.venue || "—"),
    kvRow("Invitados", lead.invitados || "—"),
    kvRow("Días hasta boda", lead.dias_hasta_boda || "—"),
    kvRow("UTM source", lead.utm_source || lead.source || "—"),
    kvRow("UTM campaign", lead.utm_campaign || "—")
  ].join("");

  // Package recommendation
  const reco = recommendPackage(lead);
  const recoEl = $("#package-reco");

  const mainHTML = reco.main ? `
    <div class="tag gold">Recomendado</div>
    <div class="pkg-title">${escapeHtml(reco.main.title)}</div>
    <p class="pkg-sub">${escapeHtml(reco.main.subtitle)}</p>
    <ul class="pkg-list">${reco.main.bullets.map(b => `<li>${escapeHtml(b)}</li>`).join("")}</ul>
  ` : `<p class="muted">No se pudo armar el paquete recomendado (faltan datos).</p>`;

  const altHTML = reco.alt ? `
    <div class="divider"></div>
    <div class="tag">Alternativa</div>
    <div class="pkg-title">${escapeHtml(reco.alt.title)}</div>
    <p class="pkg-sub">${escapeHtml(reco.alt.subtitle)}</p>
  ` : "";

  recoEl.innerHTML = `
    ${mainHTML}
    ${altHTML}
    <p class="muted" style="margin-top:10px;">${escapeHtml(reco.explanation)}</p>
  `;

  // Boutique summary
  const summaryText =
`RESUMEN (Ceci)
• Perfil: ${archP}${archS && archS !== "—" ? " (matiz: " + archS + ")" : ""}
• Intensidad: ${(musicModules[intensity]?.name || intensity)} · Importancia: ${mi}/10 · Foco: ${focusLabel}
• Evento: ${lead.venue || "-"} · ${lead.invitados || "-"} invitados · Fecha: ${fecha} (${lead.dias_hasta_boda || "-"} días)
• Paquete recomendado: ${reco.main?.title || (reco.formation + " — " + reco.tier)}
• Alternativa: ${reco.alt?.title || (reco.altFormation + " — " + reco.altTier)}
`;

  $("#boutique-summary").innerHTML = `<p style="margin:0; white-space:pre-line;">${escapeHtml(summaryText)}</p>`;

  // Copy button
  $("#btn-copy").onclick = async () => {
    try{
      await navigator.clipboard.writeText(summaryText);
      showStatus("✅ Resumen copiado.");
      setTimeout(hideStatus, 1600);
    } catch {
      showStatus("No se pudo copiar automáticamente. Seleccioná y copiá manualmente.");
    }
  };

  // WhatsApp button (a Ceci)
  const waText =
`Hola Ceci! Soy ${nombre}. Tenemos reunión agendada 🙌
Te dejo mi resultado del test:
• ${archP} (matiz: ${archS})
• Intensidad: ${(musicModules[intensity]?.name || intensity)}
• Importancia música: ${mi}/10
• Foco: ${focusLabel}
• Venue: ${lead.venue || "-"} · Invitados: ${lead.invitados || "-"} · Fecha: ${fecha}

¿Me pasás una propuesta según este perfil?`;

  $("#btn-wa").setAttribute("href", `${WHATSAPP_BASE}?text=${encodeURIComponent(waText)}`);

  // Raw json
  $("#raw-json").textContent = JSON.stringify(lead, null, 2);

  // ✅ Vista resultado (tercera persona)
  const coupleContent = $("#couple-view-content");
  coupleContent.innerHTML = renderCoupleViewThirdPerson_(lead);

  // reset toggle to collapsed each search
  const cv = $("#couple-view");
  cv.hidden = true;
  cv.classList.add("hidden");
  $("#btn-toggle-couple").textContent = "Ver vista completa";
}

// =====================================
// API
// =====================================
async function searchLead(type, query){
  const params = new URLSearchParams();
  params.set("action","search");
  if (API_TOKEN) params.set("token", API_TOKEN);

  if (type === "phone") params.set("phone", query);
  else if (type === "lead_id") params.set("lead_id", query);
  else params.set("name", query);

  const url = `${APPS_SCRIPT_URL}?${params.toString()}`;

  const res = await fetch(url, { method:"GET" });
  const json = await res.json().catch(() => null);
  if (!json) throw new Error("Respuesta inválida del servidor.");
  if (!json.ok) throw new Error(json.message || "Error desconocido.");
  if (!json.found) return null;
  return json.latest || null;
}

// =====================================
// Events
// =====================================
function init(){
  const btnSearch = $("#btn-search");
  const btnClear = $("#btn-clear");
  const btnHide = $("#btn-hide");
  const btnToggleCouple = $("#btn-toggle-couple");

  btnSearch.addEventListener("click", async () => {
    const type = $("#search-type").value;
    const query = $("#search-query").value.trim();

    hideResult();
    if (!query){
      showStatus("Escribí un valor para buscar.");
      return;
    }

    showStatus("Buscando…");
    btnSearch.disabled = true;

    try{
      const lead = await searchLead(type, query);
      if (!lead){
        showStatus("No se encontró ningún lead con ese dato.");
        return;
      }

      hideStatus();
      renderLead(lead);
      showResult();
    } catch(err){
      console.error(err);
      showStatus(`Error: ${String(err.message || err)}`);
    } finally{
      btnSearch.disabled = false;
    }
  });

  btnClear.addEventListener("click", () => {
    $("#search-query").value = "";
    hideStatus();
    hideResult();
  });

  btnHide.addEventListener("click", () => {
    hideResult();
  });

  // Enter para buscar
  $("#search-query").addEventListener("keydown", (e) => {
    if (e.key === "Enter") btnSearch.click();
  });

  // Toggle vista “resultado”
  btnToggleCouple.addEventListener("click", () => {
    const cv = $("#couple-view");
    const willShow = cv.hidden === true || cv.classList.contains("hidden");
    cv.hidden = !willShow;
    cv.classList.toggle("hidden", !willShow);
    btnToggleCouple.textContent = willShow ? "Ocultar vista completa" : "Ver vista completa";
  });

  hideResult();
  hideStatus();
}

document.addEventListener("DOMContentLoaded", init);
