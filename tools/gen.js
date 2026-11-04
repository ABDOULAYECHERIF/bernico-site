/* Generate src/<slug>.html for every model in tools/models.json.
 *
 *   node tools/gen.js           write only files that do not exist yet
 *   node tools/gen.js --force   overwrite them all
 *
 * The generated files are ordinary src pages — build.sh turns them into the
 * final HTML. Edit models.json for data, edit this file for layout.
 *
 * Model states this understands:
 *   racingName   the competition name of a hull that is sold in both trims
 *                (F3 / F3 Xtreme, VC35 / VC35 R, Leverage / P1 Racing)
 *   pending      we have the name and nothing else yet — the page stays short
 *                rather than padded out with copy nobody has confirmed
 *   comingSoon   announced, not yet in build; no spec table
 *   render       the photography is CGI and the page says so
 *   legacy       no longer in the current range
 *   gallery      extra photographs, shown as a rail
 */
const fs = require("fs");
const path = require("path");

const root = path.join(__dirname, "..");
const data = JSON.parse(fs.readFileSync(path.join(__dirname, "models.json"), "utf8"));
const force = process.argv.includes("--force");
const bySlug = Object.fromEntries(data.models.map(m => [m.slug, m]));

const ARROWS = `        <button class="rnd rail__p" type="button" aria-label="Scroll left"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M15 5l-7 7 7 7"/></svg></button>
        <button class="rnd rail__n" type="button" aria-label="Scroll right"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M9 5l7 7-7 7"/></svg></button>`;

const esc = s => String(s).replace(/&(?!(amp|lt|gt|quot|#\d+);)/g, "&amp;");

/* Where a model sits, for the breadcrumb and the "all boats" link. */
function family(m) {
  if (m.families.includes("legacy")) return { label: "Legacy", href: "models.html#legacy" };
  if (m.families.includes("racing")) return { label: "Racing", href: "racing.html" };
  return { label: "Leisure", href: "leisure.html" };
}

function specRows(rows) {
  return rows.map(r =>
    `        <div class="spec__r"><span class="spec__k">${esc(r.k)}</span><span class="spec__v t-num">${esc(r.v)}</span></div>`
  ).join("\n");
}

/* Split a spec list into two columns so the table reads as a pair of blocks. */
function specTable(rows, attrs = "") {
  const half = Math.ceil(rows.length / 2);
  return `      <div class="spec2 tog-panel"${attrs}>
      <div class="spec">
${specRows(rows.slice(0, half))}
      </div>
      <div class="spec">
${specRows(rows.slice(half))}
      </div>
      </div>`;
}

function specSection(m) {
  // A boat that is not in build yet has no figures to publish. An all-dashes
  // table would only look like an oversight.
  if (m.comingSoon) {
    return `<!-- Specifications -->
<section class="sec sec--dark" id="specs">
  <div class="wrap wrap--tight" style="text-align:center">
    <div class="t-lbl bh__lbl" data-r="fade">Technical</div>
    <h2 class="t-h2 mt2" data-r style="--i:1">Specifications to follow</h2>
    <p class="t-body mt3" data-r style="--i:2;margin-inline:auto">
      The ${esc(m.name)} is still in preparation at Willebroek. Figures will be published
      when the yard confirms them.
    </p>
    <div class="mt4" data-r style="--i:3"><a class="b b--light" href="contact.html">Register your interest</a></div>
  </div>
</section>`;
  }

  const dual = !!(m.specs.racing && m.specs.leisure);
  let inner;
  if (dual) {
    const raceLabel = m.racingName ? esc(m.racingName) : "Racing trim";
    const leisureLabel = m.racingName ? esc(m.name) : "Leisure trim";
    inner = `      <div class="tog" data-tog role="tablist" aria-label="Specification trim">
        <button class="on" type="button" data-trim="racing">${raceLabel}</button>
        <button type="button" data-trim="leisure">${leisureLabel}</button>
      </div>

${specTable(m.specs.racing, ' data-trim="racing"')}
${specTable(m.specs.leisure, ' data-trim="leisure" hidden')}`;
  } else {
    inner = specTable(m.specs.single);
  }

  const note = m.provisional
    ? `\n      <p class="t-small mt3">Provisional specification — figures to be confirmed.</p>`
    : "";

  return `<!-- Specifications -->
<section class="sec sec--dark" id="specs">
  <div class="wrap wrap--wide">
    <div class="bh">
      <div>
        <div class="t-lbl bh__lbl" data-r="fade">Technical</div>
        <h2 class="t-h2 bh__t" data-r style="--i:1">Specifications</h2>
      </div>
    </div>
    <div data-r>
${inner}${note}
    </div>
  </div>
</section>`;
}

/* One honest line about the state of the page, where there is one to make. */
function statusNote(m) {
  const lines = [];
  const stand = m.img && m.img.placeholder;
  // one line about the imagery, whichever applies — never two
  if (m.render) lines.push("The imagery on this page is a render, not a photograph of a delivered boat.");
  else if (m.comingSoon && stand) lines.push("The imagery on this page is a stand-in. Photography follows when the boat is launched.");
  else if (stand) lines.push("Photography on this page is a stand-in and does not show this model.");
  if (m.legacy) lines.push(`The ${esc(m.name)} is no longer part of the current range. The page is kept for owners.`);
  if (!lines.length) return "";
  return `
<!-- Status -->
<section class="sec--sm">
  <div class="wrap wrap--tight">
    <p class="t-small" data-r style="border-left:2px solid var(--hair-2);padding-left:14px">${lines.join(" ")}</p>
  </div>
</section>
`;
}

function gallery(m) {
  if (!m.gallery || !m.gallery.length) return "";
  const shots = m.gallery.map((src, i) =>
    `      <div class="card card--w" style="cursor:default">
        <div class="card__m px-wrap"><img class="px" data-px="0.04" src="${src}" alt="Bernico ${esc(m.name)} — detail ${i + 1}"></div>
      </div>`
  ).join("\n");

  return `
<!-- Gallery -->
<section class="sec--sm" data-rail>
  <div class="wrap wrap--wide">
    <div class="bh">
      <div>
        <div class="t-lbl bh__lbl" data-r="fade">Gallery</div>
        <h2 class="t-h2 bh__t" data-r style="--i:1">Aboard the ${esc(m.name)}</h2>
      </div>
      <div class="rail__ctl" data-r style="--i:2">
${ARROWS}
      </div>
    </div>
  </div>
  <div class="rail">
    <div class="rail__t">
${shots}
    </div>
  </div>
</section>
`;
}

function related(m) {
  const cards = (m.related || []).map(slug => {
    const r = bySlug[slug];
    if (!r) return "";
    return `      <a class="card card--model card--w" href="${r.slug}.html">
        <div class="card__m px-wrap"><img class="px" data-px="0.05" src="${r.img.hero}" alt="${esc(r.name)}"></div>
        <div class="card__b">
          <div class="t-lbl card__k">${esc(r.kicker)}</div>
          <div class="t-h3 card__t">${esc(r.name)}</div>
          <p class="card__d">${esc(r.tagline)}</p>
        </div>
      </a>`;
  }).filter(Boolean).join("\n");
  if (!cards) return "";

  return `<!-- Related -->
<section class="sec--sm" data-rail>
  <div class="wrap wrap--wide">
    <div class="bh">
      <div>
        <div class="t-lbl bh__lbl" data-r="fade">Also consider</div>
        <h2 class="t-h2 bh__t" data-r style="--i:1">Close to this one</h2>
      </div>
      <div class="rail__ctl" data-r style="--i:2">
${ARROWS}
      </div>
    </div>
  </div>
  <div class="rail">
    <div class="rail__t">
${cards}
    </div>
  </div>
</section>`;
}

function filmSection(m) {
  if (!m.video) return "";
  return `
<!-- Film -->
<section class="sec--sm">
  <div class="wrap wrap--wide">
    <a class="vc" href="#specs" aria-label="Play the ${esc(m.name)} film" data-r>
      <img src="${m.video.poster}" alt="${esc(m.name)}">
      <video muted playsinline loop preload="metadata"><source src="${m.video.src}" type="video/mp4"></video>
      <span class="vc__cur" aria-hidden="true">Play</span>
    </a>
    <p class="t-small mt2" data-r style="--i:1">Hover to play.</p>
  </div>
</section>
`;
}

/* The sticky feature scroll, only where there is something real to say. */
function featureSection(m) {
  if (!m.features || !m.features.length) return "";
  const features = m.features.map((f, i) =>
    `      <div class="stick__i" data-r style="--i:${i}">
        <div class="stick__n t-num">${String(i + 1).padStart(2, "0")}</div>
        <div class="t-h3 ft__t">${esc(f.t)}</div>
        <p class="ft__p">${esc(f.p)}</p>
      </div>`
  ).join("\n");

  return `
<!-- Sticky feature scroll -->
<section class="sec sec--grey">
  <div class="wrap wrap--wide">
    <div class="stick">
      <div class="stick__m">
        <div class="px-wrap"><img class="px" data-px="0.08" src="${m.img.stick}" alt="${esc(m.name)} detail"></div>
      </div>
      <div class="stick__l">
${features}
      </div>
    </div>
  </div>
</section>
`;
}

/* A model we only have a name for gets a short, plain introduction rather
 * than three paragraphs of invented detail. */
function introSection(m) {
  const body = m.intro ? esc(m.intro) : (m.comingSoon
    ? `The ${esc(m.name)} is in preparation at Willebroek. We will publish the photography and the figures as soon as the yard releases them — tell us if you would like to hear first.`
    : `The ${esc(m.name)} is built the way every Bernico is built: laid up in composite by hand at Willebroek, on a running surface drawn from the boats we race. The full description and specification for this model are being finalised with the yard.`);

  return `<!-- Intro -->
<section class="sec" id="intro">
  <div class="wrap wrap--tight" style="text-align:center">
    <div class="t-lbl" style="color:var(--ink-3)" data-r="fade">${esc(m.kicker)}</div>
    <h2 class="t-h2 mt2" data-r style="--i:1">${esc(m.tagline)}</h2>
    <p class="t-body mt3" data-r style="--i:2;margin-inline:auto">${body}</p>
  </div>
</section>`;
}

function page(m) {
  const fam = family(m);
  const facts = m.facts.map(f =>
    `        <div class="facts__i"><span class="facts__k">${esc(f.k)}</span><span class="facts__v t-num">${esc(f.v)}</span></div>`
  ).join("\n");

  const badge = m.comingSoon ? ` <span class="t-lbl" style="opacity:.75">· Coming soon</span>`
    : m.legacy ? ` <span class="t-lbl" style="opacity:.75">· Legacy</span>` : "";

  const cta = m.comingSoon
    ? `      <a class="b b--light-fill" href="contact.html">Register your interest</a>`
    : `      <a class="b b--light-fill" href="contact.html">Enquire</a>
      <a class="b b--light" href="#specs">Specifications</a>`;

  return `<!--TITLE:${esc(m.name)} — Bernico-->
<!--DESC:${esc(m.tagline)} ${esc(m.kicker)}. Handcrafted in composite at Willebroek, Belgium.-->
<main>

<section class="cov" id="cov" style="height:88svh">
  <article class="cov__s on px-wrap">
    <img class="px" data-px="0.12" src="${m.img.hero}" alt="Bernico ${esc(m.name)}">
  </article>
  <div class="cov__scrim" aria-hidden="true"></div>
  <div class="cov__c">
    <nav class="crumb" aria-label="Breadcrumb"><a href="index.html">Home</a> — <a href="${fam.href}">${fam.label}</a> — ${esc(m.name)}</nav>
    <div class="t-kicker cov__k">${esc(m.kicker)}${badge}</div>
    <h1 class="t-hero cov__t">${esc(m.name)}</h1>
    <p class="cov__d">${esc(m.tagline)}</p>
    <div class="cov__cta">
${cta}
    </div>
    <div class="facts mt3">
${facts}
    </div>
  </div>
  <a class="cov__scroll" href="#intro"><i aria-hidden="true"></i>Scroll</a>
</section>

${introSection(m)}
${statusNote(m)}${featureSection(m)}${filmSection(m)}${gallery(m)}
<!-- Plate -->
<section class="plate px-wrap">
  <img class="px" data-px="0.16" src="${m.img.plate}" alt="Bernico ${esc(m.name)}">
</section>

${specSection(m)}

${related(m)}

<section class="bnr bnr--flip">
  <div class="bnr__m px-wrap"><img class="px" data-px="0.09" src="${m.img.hero}" alt="Bernico ${esc(m.name)}"></div>
  <div class="bnr__c" data-px="-0.03">
    <div class="t-lbl bnr__k" data-r="fade">Next step</div>
    <h2 class="t-h2 bnr__t" data-r style="--i:1">${m.legacy ? `Looking for a ${esc(m.name)}?`
      : m.comingSoon ? `Be first to see the ${esc(m.name)}`
      : `Build your ${esc(m.name)}`}</h2>
    <p class="t-body bnr__p" data-r style="--i:2">
      ${m.legacy
        ? "This model is no longer in production, but we still look after the ones we built — and we can tell you if one is for sale."
        : m.comingSoon
          ? "Leave your details and we will come to you with the photography, the figures and a build slot before the boat is announced publicly."
          : "Every Bernico is built to order at Willebroek. Tell our team how you use the water and we will specify the boat around it."}
    </p>
    <div class="bnr__cta" data-r style="--i:3">
      <a class="b b--fill" href="contact.html">${m.legacy ? "Talk to us" : m.comingSoon ? "Register your interest" : "Enquire"}</a>
      <a class="b" href="${fam.href}">All ${fam.label.toLowerCase()} boats</a>
    </div>
  </div>
</section>

</main>
`;
}

let written = 0, skipped = 0;
for (const m of data.models) {
  const out = path.join(root, "src", m.slug + ".html");
  if (fs.existsSync(out) && !force) { console.log("skip   " + m.slug + ".html (exists)"); skipped++; continue; }
  fs.writeFileSync(out, page(m), "utf8");
  console.log("write  src/" + m.slug + ".html");
  written++;
}
console.log(`\n${written} written, ${skipped} skipped. Now run: bash build.sh`);
