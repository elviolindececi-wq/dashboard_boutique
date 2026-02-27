// Panel Ceci — app.js
// Busca leads en el MISMO Apps Script (doGet action=search)
// Renderiza resultado del test + recomendación automática de paquete + resumen boutique

const APPS_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbyIEcKAHlnfrI9Ktb8qwdbls3p6A1oeKnbDqY6wd5raOacyiaYV1GIV6PkzVNyeSWYQ/exec";
// Si configuraste token en Apps Script, pegalo acá. Si no, dejalo vacío.
const API_TOKEN = "";

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
// Archetypes (para lectura Ceci)
// =====================================
const ARCH = {
  "💎 Clásicos Elegantes": {
    short: "Buscan una experiencia pulida: elegancia, timing, coherencia estética. Ideal para entradas y transiciones con intención.",
    sell: "Se vende por: estética + coordinación + piezas ancla (entradas/vals) + ejecución impecable."
  },
  "🌿 Románticos Naturales": {
    short: "Quieren emoción real y orgánica. La música acompaña sin invadir, cálida e íntima.",
    sell: "Se vende por: sensibilidad + flow + repertorio romántico suave."
  },
  "🎨 Creativos Vanguardistas": {
    short: "Quieren identidad propia y momentos ‘wow’ con estética. Les gusta lo curado.",
    sell: "Se vende por: arreglos únicos + intervención sorpresa + narrativa."
  },
  "🎉 Sociales Festivos": {
    short: "Quieren vibra alta y energía compartida. Música como motor del clima.",
    sell: "Se vende por: activación + transiciones a fiesta + hits en instrumental."
  },
  "🤍 Íntimos Emocionales": {
    short: "Buscan significado y profundidad. Momentos sensibles, silencios que pesan.",
    sell: "Se vende por: personalización + acompañamiento emocional + repertorio simbólico."
  }
};

const INTENSITY = {
  M1: { name: "Acompañamiento Sutil", sell: "Ideal si quieren atmósfera romántica sin invadir." },
  M2: { name: "Protagonismo Sofisticado", sell: "Para entradas y transiciones con intención (sweet spot premium)." },
  M3: { name: "Momento WOW", sell: "Intervenciones sorpresa y reacción (alto impacto)." }
};

// =====================================
// Paquetes (texto alineado a tus imágenes)
// =====================================
const PACKAGES = {
  Solista: {
    Estándar: {
      title: "Solista — Estándar",
      subtitle: "Ceremonia religiosa o civil",
      bullets: [
        "Ambientación para 8 momentos de la ceremonia religiosa o 4 del civil",
        "Incluye 1 reunión virtual, sonido, asesoramiento y traslado",
        "Interpretado a una voz en violín con pista de acompañamiento"
      ]
    },
    Clásico: {
      title: "Solista — Clásico",
      subtitle: "Ceremonia religiosa y civil",
      bullets: [
        "Ambientación para 8 momentos de la ceremonia religiosa y 4 del civil",
        "Incluye 1 reunión virtual, sonido, asesoramiento y traslado",
        "Interpretado a una voz en violín con pista de acompañamiento"
      ]
    },
    Premium: {
      title: "Solista — Premium",
      subtitle: "Ceremonia religiosa, civil y ambientación en salón de eventos",
      bullets: [
        "Ambientación para momentos de la ceremonia religiosa y 4 del civil",
        "45 min de musicalización en el salón de eventos + baile del vals",
        "Incluye 1 reunión virtual, sonido, asesoramiento y traslado",
        "Interpretado a una voz en violín con pista de acompañamiento"
      ]
    }
  },
  "Dúo": {
    Estándar: {
      title: "Dúo — Estándar (1 violín + piano)",
      subtitle: "Ceremonia religiosa o civil",
      bullets: [
        "Ambientación para 9 momentos de la ceremonia religiosa o 4 del civil",
        "Incluye 1 reunión virtual, sonido, asesoramiento y traslado",
        "Interpretado a 1 violín + piano en vivo"
      ]
    },
    Clásico: {
      title: "Dúo — Clásico (1 violín + piano)",
      subtitle: "Ceremonia religiosa y civil",
      bullets: [
        "Ambientación para 9 momentos de la ceremonia religiosa y 4 del civil",
        "Incluye 1 reunión virtual, sonido, asesoramiento y traslado",
        "Interpretado a 1 violín + piano en vivo"
      ]
    },
    Premium: {
      title: "Dúo — Premium (1 violín + piano)",
      subtitle: "Ceremonia religiosa, civil y ambientación en salón de eventos",
      bullets: [
        "Ambientación para 9 momentos de la ceremonia religiosa y 4 del civil",
        "45 min de musicalización en el salón de eventos + baile del vals",
        "Incluye 1 reunión virtual, sonido, asesoramiento y traslado"
      ]
    }
  },
  "Trío": {
    Estándar: {
      title: "Trío — Estándar (violín + piano de cola + cello)",
      subtitle: "Ceremonia religiosa o civil",
      bullets: [
        "Ambientación para 9 momentos de la ceremonia religiosa o 4 del civil",
        "Incluye 1 reunión virtual, sonido, asesoramiento y traslado",
        "Interpretado a 1 violín, 1 piano de cola y 1 violoncello"
      ]
    },
    Clásico: {
      title: "Trío — Clásico (violín + piano de cola + cello)",
      subtitle: "Ceremonia religiosa y civil",
      bullets: [
        "Ambientación para 9 momentos de la ceremonia religiosa y 4 del civil",
        "Incluye 1 reunión virtual, sonido, asesoramiento y traslado",
        "Interpretado a 1 violín, 1 piano de cola y 1 violoncello"
      ]
    },
    Premium: {
      title: "Trío — Premium (violín + piano de cola + cello)",
      subtitle: "Ceremonia religiosa, civil y ambientación en salón de eventos",
      bullets: [
        "Ambientación para momentos de la ceremonia religiosa y 4 del civil",
        "50 min de musicalización durante la previa o cena + baile del vals",
        "Incluye 1 reunión virtual, sonido, asesoramiento y traslado",
        "Interpretado a 1 violín, 1 piano de cola y 1 violoncello"
      ]
    }
  }
};

// =====================================
// Reglas de recomendación (MVP premium)
// =====================================
const VENUE_POINTS = {
  "la riviere": 2,"es vedra": 2,"las takuaras": 2,"castillo remanso": 2,"casa puente": 2,"castillo": 2,"puerto liebig": 2,
  "talleryrand": 2,"talleryrand costanera": 2,"villa maria": 2,"casa corbellani": 2,"casita quinta": 2,
  "villa jardin": 1,"royal": 1,"royal eventos": 1,"soir": 1,"soir eventos": 1,"vista verde": 1,"la isabella": 1,
  "casa 1927": 1,"la glorieta": 1,"mantra salon boutique": 1,
  "rusticana": 0,"rusticana eventos": 0,"isabella": 0,"tiam eventos": 0,"mantra": 0
};

function clampFormation_(f){
  const order = ["Solista", "Dúo", "Trío"];
  if (!order.includes(f)) return "Dúo";
  return f;
}

function promoteFormation_(formation){
  const order = ["Solista","Dúo","Trío"];
  const idx = order.indexOf(formation);
  if (idx < 0) return "Dúo";
  return order[Math.min(idx+1, order.length-1)];
}

function recommendPackage(lead){
  // Campos esperados del Sheet (por tu payload)
  const intensity = String(lead.intensidad_musical || "").trim() || "M2";
  const invitados = String(lead.invitados || "");
  const musicImportance = Number(lead.q6_music_importance ?? lead.music_importance ?? 5);
  const focus = String(lead.q9_focus_moment || "").trim(); // CER/COC/AMB/GUIA
  const prioridad = String(lead.prioridad || "C");
  const venueNorm = normalize_(lead.venue_normalizado || lead.venue || "");

  // 1) Formación base por intensidad
  let formation = "Dúo";
  if (intensity === "M1") formation = "Solista";
  if (intensity === "M2") formation = "Dúo";
  if (intensity === "M3") formation = "Trío";

  // 2) Ajustes por invitados
  if (invitados === "150 – 250" && formation === "Solista") formation = "Dúo";
  if (invitados === "Más de 250") formation = "Trío";

  // 3) Ajustes por venue + importancia música
  const vp = venueNorm ? (VENUE_POINTS[venueNorm] ?? 0) : 0;
  if (vp >= 2) formation = promoteFormation_(formation);
  if (Number.isFinite(musicImportance) && musicImportance >= 9) formation = promoteFormation_(formation);

  formation = clampFormation_(formation);

  // 4) Tier (Estándar / Clásico / Premium)
  let tier = "Clásico";

  if (focus === "COC" || focus === "AMB") tier = "Premium";
  else if (focus === "CER") {
    tier = (prioridad === "A") ? "Premium" : (prioridad === "B") ? "Clásico" : "Estándar";
  } else if (focus === "GUIA") {
    tier = (prioridad === "A") ? "Premium" : "Clásico";
  } else {
    tier = (prioridad === "A") ? "Premium" : (prioridad === "B") ? "Clásico" : "Estándar";
  }

  // 5) Alternativa (backup)
  let altTier = (tier === "Premium") ? "Clásico" : "Estándar";
  let altFormation = formation;

  // si se recomendó Trío Premium, alternativa sensata: Dúo Premium o Trío Clásico
  if (formation === "Trío" && tier === "Premium") {
    altFormation = "Dúo";
    altTier = "Premium";
  }

  const main = PACKAGES[formation]?.[tier];
  const alt = PACKAGES[altFormation]?.[altTier];

  const explanation = [
    `Intensidad: ${INTENSITY[intensity]?.name || intensity}`,
    `Importancia música: ${Number.isFinite(musicImportance) ? musicImportance + "/10" : "—"}`,
    `Invitados: ${invitados || "—"}`,
    `Foco: ${lead.q9_focus_label || focus || "—"}`,
    `Venue score: ${vp}`
  ].join(" · ");

  return { formation, tier, main, altFormation, altTier, alt, explanation };
}

// =====================================
// Render
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

  const kvTest = $("#kv-test");
  kvTest.innerHTML = [
    kvRow("Arquetipo primario", archP),
    kvRow("Arquetipo secundario", archS),
    kvRow("Intensidad", `${intensity} — ${INTENSITY[intensity]?.name || ""}`.trim()),
    kvRow("Importancia música", `${mi}/10`),
    kvRow("Foco", focusLabel),
    kvRow("Planning", lead.q3_planning_label || "—"),
    kvRow("Curación", lead.q8_curation_label || "—")
  ].join("");

  // EVENT KV
  const kvEvent = $("#kv-event");
  kvEvent.innerHTML = [
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
    <hr style="border:none;border-top:1px solid rgba(255,255,255,.08); margin:12px 0;">
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
  const archInfo = ARCH[archP] || { short:"", sell:"" };
  const intensityInfo = INTENSITY[intensity] || { name:intensity, sell:"" };

  const summaryText =
`RESUMEN (Ceci)
• Perfil: ${archP}${archS && archS !== "—" ? " (matiz: " + archS + ")" : ""}
• Intensidad: ${intensityInfo.name} · Importancia: ${mi}/10 · Foco: ${focusLabel}
• Evento: ${lead.venue || "-"} · ${lead.invitados || "-"} invitados · Fecha: ${fecha} (${lead.dias_hasta_boda || "-"} días)
• Lectura: ${archInfo.short || "—"}
• Cómo vender: ${archInfo.sell || "—"}
• Paquete recomendado: ${reco.main?.title || (reco.formation + " — " + reco.tier)}
• Alternativa: ${reco.alt?.title || (reco.altFormation + " — " + reco.altTier)}
`;

  const boutiqueEl = $("#boutique-summary");
  boutiqueEl.innerHTML = `<p style="margin:0; white-space:pre-line;">${escapeHtml(summaryText)}</p>`;

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
• Intensidad: ${intensityInfo.name}
• Importancia música: ${mi}/10
• Foco: ${focusLabel}
• Venue: ${lead.venue || "-"} · Invitados: ${lead.invitados || "-"} · Fecha: ${fecha}

¿Me pasás una propuesta según este perfil?`;

  $("#btn-wa").setAttribute("href", `${WHATSAPP_BASE}?text=${encodeURIComponent(waText)}`);

  // Raw json
  $("#raw-json").textContent = JSON.stringify(lead, null, 2);
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

  // enter para buscar
  $("#search-query").addEventListener("keydown", (e) => {
    if (e.key === "Enter") btnSearch.click();
  });

  hideResult();
  hideStatus();
}

document.addEventListener("DOMContentLoaded", init);
