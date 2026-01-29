// MyContraception — Educational decision-support questionnaire
// Not medical advice. Shows method categories + cautions/avoid based on guideline logic.

const METHODS = [
  {
    id: "chc_pill",
    name: "Combined oral contraceptives (COCs)",
    tags: ["Estrogen + progestin", "Daily"],
    baseNotes: "Effective when taken daily. Consider contraindications to estrogen."
  },
  {
    id: "chc_ring",
    name: "Vaginal ring (combined hormonal)",
    tags: ["Estrogen + progestin", "Monthly"],
    baseNotes: "Avoids daily dosing; still contains estrogen."
  },
  {
    id: "chc_patch",
    name: "Transdermal patch (combined hormonal)",
    tags: ["Estrogen + progestin", "Weekly"],
    baseNotes: "Weekly schedule; may be less effective at higher body weight."
  },
  {
    id: "pop_norethindrone",
    name: "Progestin-only pill (norethindrone)",
    tags: ["Progestin-only", "Daily (strict timing)"],
    baseNotes: "Requires consistent daily timing; backup needed if >3 hours late."
  },
  {
    id: "pop_drospirenone",
    name: "Progestin-only pill (drospirenone)",
    tags: ["Progestin-only", "Daily"],
    baseNotes: "More forgiving than norethindrone in timing; consider hyperkalemia risk in prone patients."
  },
  {
    id: "dmpa",
    name: "Depot medroxyprogesterone injection (DMPA)",
    tags: ["Progestin-only", "Every 3 months"],
    baseNotes: "May cause irregular bleeding; possible weight gain; delayed return to fertility after stopping."
  },
  {
    id: "implant",
    name: "Etonogestrel implant (3 years)",
    tags: ["LARC", "Progestin-only"],
    baseNotes: "Highly effective long-acting option; irregular bleeding possible."
  },
  {
    id: "lng_ius",
    name: "Hormonal IUD (LNG-IUS)",
    tags: ["LARC", "Progestin-only", "5+ years"],
    baseNotes: "Very effective; often reduces bleeding and dysmenorrhea; spotting common early."
  },
  {
    id: "cu_iud",
    name: "Copper IUD (non-hormonal)",
    tags: ["LARC", "Non-hormonal"],
    baseNotes: "Very effective; may increase bleeding/cramps in some users."
  },
  {
    id: "barrier",
    name: "Barrier methods (condoms, etc.)",
    tags: ["Non-hormonal", "STI protection"],
    baseNotes: "Condoms help protect against STIs; effectiveness depends on correct/consistent use."
  }
];

// Questionnaire (kept simple but clinically meaningful)
const QUESTIONS = [
  {
    id: "pregnant",
    title: "Could you currently be pregnant?",
    help: "If pregnancy is possible, confirm with a pregnancy test and clinician before starting or changing contraception.",
    type: "single",
    options: [
      { value: "yes", label: "Yes / Not sure", desc: "I might be pregnant" },
      { value: "no", label: "No", desc: "Pregnancy is not possible" }
    ]
  },
  {
    id: "postpartum",
    title: "Are you postpartum (recently delivered a baby)?",
    help: "Postpartum timing influences safety of estrogen-containing methods.",
    type: "single",
    options: [
      { value: "no", label: "No", desc: "Not postpartum" },
      { value: "bf_lt6w", label: "Yes — breastfeeding and < 6 weeks", desc: "Higher clot risk + milk supply concerns" },
      { value: "bf_ge6w", label: "Yes — breastfeeding and ≥ 6 weeks", desc: "Estrogen may still affect milk supply in some" },
      { value: "nb_lt3w", label: "Yes — NOT breastfeeding and < 3 weeks", desc: "Higher clot risk early postpartum" },
      { value: "nb_ge3w", label: "Yes — NOT breastfeeding and ≥ 3 weeks", desc: "Lower clot risk vs. first 3 weeks" }
    ]
  },
  {
    id: "age",
    title: "Age",
    help: "Used for risk rules (e.g., smoking + age).",
    type: "number",
    placeholder: "Enter your age (years)",
    min: 10,
    max: 60
  },
  {
    id: "smoking",
    title: "Do you currently smoke cigarettes?",
    help: "Smoking + age >35 increases risk with estrogen-containing contraception.",
    type: "single",
    options: [
      { value: "no", label: "No", desc: "I do not smoke" },
      { value: "yes_lt15", label: "Yes, < 15 cigarettes/day", desc: "Lower amount but still risk" },
      { value: "yes_ge15", label: "Yes, ≥ 15 cigarettes/day", desc: "Higher risk (important)" }
    ]
  },
  {
    id: "migraine_aura",
    title: "Do you have migraine with aura?",
    help: "Migraine with aura is a strong contraindication to estrogen-containing methods.",
    type: "single",
    options: [
      { value: "yes", label: "Yes", desc: "Migraine with aura" },
      { value: "no", label: "No", desc: "No aura migraines / none" }
    ]
  },
  {
    id: "vte_history",
    title: "History of blood clots (VTE/PE) or known thrombophilia?",
    help: "Includes VTE/PE history or known thrombogenic mutations.",
    type: "single",
    options: [
      { value: "yes", label: "Yes", desc: "Past clot or known thrombophilia" },
      { value: "no", label: "No", desc: "No history/known condition" }
    ]
  },
  {
    id: "breast_cancer",
    title: "Current or past breast cancer / hormone-dependent cancer?",
    help: "Hormonal contraception is contraindicated in current or past breast cancer.",
    type: "single",
    options: [
      { value: "yes", label: "Yes", desc: "Current/past breast or hormone-dependent cancer" },
      { value: "no", label: "No", desc: "No" }
    ]
  },
  {
    id: "severe_liver",
    title: "Severe liver disease (severe cirrhosis or liver tumor)?",
    help: "Severe liver disease is a contraindication to estrogen and often to hormonal options.",
    type: "single",
    options: [
      { value: "yes", label: "Yes", desc: "Severe cirrhosis or liver tumor" },
      { value: "no", label: "No", desc: "No" }
    ]
  },
  {
    id: "uncontrolled_htn",
    title: "Uncontrolled high blood pressure (e.g., ≥160/100)?",
    help: "Uncontrolled hypertension is a contraindication to estrogen-containing methods.",
    type: "single",
    options: [
      { value: "yes", label: "Yes", desc: "Uncontrolled / very high BP" },
      { value: "no", label: "No / controlled", desc: "No or well controlled" }
    ]
  },
  {
    id: "diabetes_micro",
    title: "Diabetes with microvascular complications?",
    help: "Microvascular complications affect eligibility for estrogen-containing contraception.",
    type: "single",
    options: [
      { value: "yes", label: "Yes", desc: "Microvascular complications present" },
      { value: "no", label: "No", desc: "No" }
    ]
  },
  {
    id: "cv_disease",
    title: "History of heart attack/ischemic heart disease or stroke?",
    help: "Cardiovascular disease is a contraindication to estrogen-containing contraception.",
    type: "single",
    options: [
      { value: "yes", label: "Yes", desc: "History of MI/ischemic disease/stroke" },
      { value: "no", label: "No", desc: "No" }
    ]
  },
  {
    id: "enzyme_inducers",
    title: "Do you take enzyme-inducing medications?",
    help: "Examples: carbamazepine, phenytoin, phenobarbital, primidone, oxcarbazepine, rifampin/rifabutin, St. John’s wort.",
    type: "single",
    options: [
      { value: "yes", label: "Yes", desc: "I use enzyme inducers" },
      { value: "no", label: "No", desc: "None of these" }
    ]
  },
  {
    id: "weight90",
    title: "Do you weigh 90 kg or more?",
    help: "Patch may be less effective at ≥90 kg.",
    type: "single",
    options: [
      { value: "yes", label: "Yes", desc: "≥ 90 kg" },
      { value: "no", label: "No", desc: "< 90 kg" }
    ]
  },
  {
    id: "preferences",
    title: "What matters most to you? (choose one)",
    help: "This affects which options are highlighted as ‘Recommended’ if otherwise safe.",
    type: "single",
    options: [
      { value: "low_maintenance", label: "Low maintenance", desc: "I want something I don’t have to remember daily" },
      { value: "non_hormonal", label: "No hormones", desc: "Prefer non-hormonal options" },
      { value: "cycle_control", label: "Cycle control / less bleeding", desc: "Want lighter or more predictable periods" },
      { value: "reversible_fast", label: "Quick return to fertility", desc: "Want fertility back quickly after stopping" }
    ]
  }
];

const state = {
  step: 0,
  answers: {}
};

const el = (id) => document.getElementById(id);

function clamp(n, min, max){ return Math.max(min, Math.min(max, n)); }

function resetAll(){
  state.step = 0;
  state.answers = {};
  el("resultsCard").hidden = true;
  el("summaryPills").innerHTML = "";
  render();
}

function setProgress(){
  const total = QUESTIONS.length;
  const current = clamp(state.step + 1, 1, total);
  const pct = Math.round((state.step / total) * 100);

  el("progressText").textContent = `Question ${current} of ${total}`;
  el("progressPercent").textContent = `${pct}%`;
  el("progressBar").style.width = `${pct}%`;
}

function render(){
  setProgress();
  const app = el("app");
  const q = QUESTIONS[state.step];

  // If finished:
  if(!q){
    el("progressText").textContent = `Completed`;
    el("progressPercent").textContent = `100%`;
    el("progressBar").style.width = `100%`;
    showResults();
    return;
  }

  app.innerHTML = buildQuestionHTML(q);
  wireQuestionHandlers(q);
}

function buildQuestionHTML(q){
  const answered = state.answers[q.id];

  let body = "";
  if(q.type === "single"){
    body = `
      <div class="q-controls">
        ${q.options.map(opt => `
          <button class="choice" type="button" data-value="${opt.value}">
            <strong>${opt.label}</strong>
            <span>${opt.desc || ""}</span>
          </button>
        `).join("")}
      </div>
    `;
  } else if(q.type === "number"){
    body = `
      <input class="input" id="numberInput" type="number"
        inputmode="numeric"
        min="${q.min ?? 0}" max="${q.max ?? 200}"
        placeholder="${q.placeholder || ""}"
        value="${answered ?? ""}"
      />
      <p class="muted" style="margin-top:10px;">Tip: enter a whole number.</p>
    `;
  }

  return `
    <div class="q-card">
      <div class="q-title">${q.title}</div>
      <div class="q-help">${q.help || ""}</div>
      ${body}

      <div class="nav-row">
        <button class="btn" id="backBtn" type="button" ${state.step === 0 ? "disabled" : ""}>Back</button>
        <button class="btn btn-primary" id="nextBtn" type="button">Next</button>
      </div>
    </div>
  `;
}

function wireQuestionHandlers(q){
  const backBtn = el("backBtn");
  const nextBtn = el("nextBtn");

  if(backBtn){
    backBtn.addEventListener("click", () => {
      state.step = Math.max(0, state.step - 1);
      el("resultsCard").hidden = true;
      render();
    });
  }

  if(q.type === "single"){
    const buttons = [...document.querySelectorAll(".choice")];
    buttons.forEach(btn => {
      btn.addEventListener("click", () => {
        const val = btn.getAttribute("data-value");
        state.answers[q.id] = val;

        // Visual selection
        buttons.forEach(b => b.style.outline = "none");
        btn.style.outline = "3px solid rgba(63,227,255,0.35)";
        btn.style.borderColor = "rgba(63,227,255,0.45)";
      });
    });
  }

  nextBtn.addEventListener("click", () => {
    if(q.type === "number"){
      const inp = el("numberInput");
      const val = inp?.value?.trim();
      const num = Number(val);

      if(!val || Number.isNaN(num)){
        inp?.focus();
        alert("Please enter a valid number.");
        return;
      }
      if((q.min != null && num < q.min) || (q.max != null && num > q.max)){
        inp?.focus();
        alert(`Please enter a number between ${q.min} and ${q.max}.`);
        return;
      }
      state.answers[q.id] = num;
    } else {
      if(!state.answers[q.id]){
        alert("Please choose one option to continue.");
        return;
      }
    }

    state.step += 1;
    render();
  });
}

function initMethodStatuses(){
  // status: recommended | caution | avoid
  const map = {};
  METHODS.forEach(m => {
    map[m.id] = {
      ...m,
      status: "recommended",
      reasons: []
    };
  });
  return map;
}

function setAvoid(methodMap, methodId, reason){
  if(!methodMap[methodId]) return;
  methodMap[methodId].status = "avoid";
  if(reason) methodMap[methodId].reasons.push(reason);
}

function setCaution(methodMap, methodId, reason){
  if(!methodMap[methodId]) return;
  if(methodMap[methodId].status !== "avoid"){
    methodMap[methodId].status = "caution";
  }
  if(reason) methodMap[methodId].reasons.push(reason);
}

function boost(methodMap, methodId, reason){
  // only add a reason; keeps status if recommended
  if(!methodMap[methodId]) return;
  if(reason) methodMap[methodId].reasons.push(reason);
}

function showResults(){
  const methodMap = initMethodStatuses();
  const a = state.answers;

  // If pregnancy possible: show conservative advice
  if(a.pregnant === "yes"){
    Object.keys(methodMap).forEach(id => setCaution(methodMap, id, "Possible pregnancy: confirm with pregnancy test/clinician before starting or changing contraception."));
  }

  const age = Number(a.age || 0);

  // Postpartum rules (estrogen caution/avoid)
  const postpartum = a.postpartum;
  if(postpartum === "bf_lt6w"){
    ["chc_pill","chc_ring","chc_patch"].forEach(id => setAvoid(methodMap, id, "Breastfeeding <6 weeks postpartum: avoid estrogen-containing methods (higher clot risk/milk supply concerns)."));
    setCaution(methodMap, "pop_drospirenone", "Early postpartum: drospirenone-only pill best avoided immediately postpartum until more safety data (educational caution).");
    // Progestin-only + IUDs generally OK, but still advise clinician postpartum
    ["lng_ius","cu_iud","implant","dmpa","pop_norethindrone","barrier"].forEach(id => boost(methodMap, id, "Postpartum: generally suitable options to discuss with clinician."));
  }
  if(postpartum === "bf_ge6w"){
    ["chc_pill","chc_ring","chc_patch"].forEach(id => setCaution(methodMap, id, "Breastfeeding ≥6 weeks: estrogen may affect milk supply in some; discuss with clinician."));
  }
  if(postpartum === "nb_lt3w"){
    ["chc_pill","chc_ring","chc_patch"].forEach(id => setAvoid(methodMap, id, "Not breastfeeding and <3 weeks postpartum: avoid estrogen-containing methods (higher clot risk)."));
  }
  // nb_ge3w => estrogen may be considered if no other contraindications; no action

  // Absolute estrogen contraindications from guideline (simplified)
  const estrogenContra =
    (a.migraine_aura === "yes") ||
    (a.vte_history === "yes") ||
    (a.cv_disease === "yes") ||
    (a.uncontrolled_htn === "yes") ||
    (a.diabetes_micro === "yes") ||
    (a.severe_liver === "yes") ||
    (a.breast_cancer === "yes");

  if(estrogenContra){
    ["chc_pill","chc_ring","chc_patch"].forEach(id => setAvoid(methodMap, id, "Estrogen contraindication risk factor present (guideline-based)."));
  }

  // Smoking + age rule
  if(age >= 35 && a.smoking === "yes_ge15"){
    ["chc_pill","chc_ring","chc_patch"].forEach(id => setAvoid(methodMap, id, "Smoker ≥35 years and ≥15 cigarettes/day: avoid estrogen-containing methods."));
  } else if(age >= 35 && a.smoking === "yes_lt15"){
    ["chc_pill","chc_ring","chc_patch"].forEach(id => setCaution(methodMap, id, "Smoker ≥35 years: estrogen-containing methods may increase cardiovascular risk; discuss alternatives."));
  }

  // Breast cancer: avoid all hormonal
  if(a.breast_cancer === "yes"){
    ["chc_pill","chc_ring","chc_patch","pop_norethindrone","pop_drospirenone","dmpa","implant","lng_ius"].forEach(id =>
      setAvoid(methodMap, id, "Current/past breast cancer: hormonal contraception is contraindicated.")
    );
    boost(methodMap, "cu_iud", "Non-hormonal highly effective option to discuss.");
    boost(methodMap, "barrier", "Non-hormonal option; condoms also protect against STIs.");
  }

  // Severe liver disease: avoid hormonal (conservative)
  if(a.severe_liver === "yes"){
    ["chc_pill","chc_ring","chc_patch","pop_norethindrone","pop_drospirenone","dmpa","implant","lng_ius"].forEach(id =>
      setAvoid(methodMap, id, "Severe liver disease: avoid hormonal methods; discuss non-hormonal options.")
    );
    boost(methodMap, "cu_iud", "Non-hormonal option may be preferred to discuss.");
  }

  // Enzyme-inducing meds reduce efficacy of many hormonal methods
  if(a.enzyme_inducers === "yes"){
    ["chc_pill","chc_ring","chc_patch","pop_norethindrone","pop_drospirenone","implant"].forEach(id =>
      setCaution(methodMap, id, "Enzyme-inducing meds may reduce hormonal contraceptive effectiveness; consider methods not affected (e.g., IUDs, DMPA, barrier).")
    );
    boost(methodMap, "dmpa", "Often preferred when enzyme inducers are used.");
    boost(methodMap, "cu_iud", "Not affected by enzyme inducers.");
    boost(methodMap, "lng_ius", "Local action; interactions unlikely clinically significant.");
    boost(methodMap, "barrier", "Non-hormonal; unaffected by enzyme inducers.");
  }

  // Patch weight rule
  if(a.weight90 === "yes"){
    setCaution(methodMap, "chc_patch", "Patch may be less effective at ≥90 kg.");
  }

  // Preferences (not medical rules, just highlighting)
  if(a.preferences === "low_maintenance"){
    boost(methodMap, "lng_ius", "Low maintenance preference: long-acting option.");
    boost(methodMap, "cu_iud", "Low maintenance preference: long-acting non-hormonal option.");
    boost(methodMap, "implant", "Low maintenance preference: long-acting option.");
    boost(methodMap, "dmpa", "Low maintenance preference: every-3-month injection.");
  }
  if(a.preferences === "non_hormonal"){
    boost(methodMap, "cu_iud", "Preference for non-hormonal option.");
    boost(methodMap, "barrier", "Preference for non-hormonal option (condoms also protect against STIs).");
    // De-emphasize hormonal methods (no change to status)
    ["chc_pill","chc_ring","chc_patch","pop_norethindrone","pop_drospirenone","dmpa","implant","lng_ius"]
      .forEach(id => setCaution(methodMap, id, "Preference indicates non-hormonal methods may be better aligned (not a safety issue)."));
  }
  if(a.preferences === "cycle_control"){
    // Favor methods known to improve bleeding/dysmenorrhea (guideline mentions LNG-IUS, continuous CHC, implant, etc.)
    boost(methodMap, "lng_ius", "Often reduces bleeding and dysmenorrhea.");
    boost(methodMap, "dmpa", "May lead to amenorrhea in many users.");
    boost(methodMap, "implant", "May reduce bleeding days; irregular bleeding possible.");
    ["chc_pill","chc_ring","chc_patch"].forEach(id => boost(methodMap, id, "Combined hormonal methods may help regulate cycles if eligible."));
  }
  if(a.preferences === "reversible_fast"){
    // DMPA can delay return to fertility
    setCaution(methodMap, "dmpa", "Return to fertility may be delayed after stopping DMPA (sometimes up to ~1 year).");
    boost(methodMap, "cu_iud", "Rapid return to fertility after removal.");
    boost(methodMap, "lng_ius", "Rapid return to fertility after removal.");
    boost(methodMap, "implant", "Rapid return to fertility after removal.");
  }

  // Render
  const recommended = [];
  const caution = [];
  const avoid = [];

  Object.values(methodMap).forEach(m => {
    if(m.status === "recommended") recommended.push(m);
    else if(m.status === "caution") caution.push(m);
    else avoid.push(m);
  });

  // Sort: put “more reasons” first (often more relevant context)
  const byReasons = (a,b) => (b.reasons.length - a.reasons.length);
  recommended.sort(byReasons);
  caution.sort(byReasons);
  avoid.sort(byReasons);

  el("recommendedList").innerHTML = recommended.map(renderMethodCard).join("") || `<p class="muted">No methods in this category based on answers.</p>`;
  el("cautionList").innerHTML = caution.map(renderMethodCard).join("") || `<p class="muted">No methods in this category based on answers.</p>`;
  el("avoidList").innerHTML = avoid.map(renderMethodCard).join("") || `<p class="muted">No methods in this category based on answers.</p>`;

  el("summaryPills").innerHTML = `
    <div class="pill"><b>${recommended.length}</b> recommended</div>
    <div class="pill"><b>${caution.length}</b> caution</div>
    <div class="pill"><b>${avoid.length}</b> avoid</div>
    <div class="pill">STI protection: <b>condoms</b> recommended when needed</div>
  `;

  el("resultsCard").hidden = false;

  // Scroll to results nicely
  el("resultsCard").scrollIntoView({ behavior: "smooth", block: "start" });
}

function renderMethodCard(m){
  const tagText = m.tags.slice(0,2).join(" • ");
  const reasons = m.reasons.length
    ? `<ul class="method-notes" style="margin:8px 0 0 0; padding-left:18px;">
         ${m.reasons.slice(0,4).map(r => `<li>${escapeHtml(r)}</li>`).join("")}
       </ul>`
    : `<p class="method-notes">${escapeHtml(m.baseNotes)}</p>`;

  return `
    <div class="method">
      <div class="method-title">
        <strong>${escapeHtml(m.name)}</strong>
        <span class="method-tag">${escapeHtml(tagText)}</span>
      </div>
      <p class="method-notes">${escapeHtml(m.baseNotes)}</p>
      ${reasons}
    </div>
  `;
}

function escapeHtml(str){
  return String(str)
    .replaceAll("&","&amp;")
    .replaceAll("<","&lt;")
    .replaceAll(">","&gt;")
    .replaceAll('"',"&quot;")
    .replaceAll("'","&#039;");
}

// Wire global buttons
document.addEventListener("DOMContentLoaded", () => {
  const resetBtn = document.getElementById("resetBtn");
  resetBtn.addEventListener("click", resetAll);
  render();
});
