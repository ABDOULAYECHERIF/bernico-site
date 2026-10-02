/* Generate src/<slug>.html for every model in tools/models.json.
 *
 *   node tools/gen.js           write only files that do not exist yet
 *   node tools/gen.js --force   overwrite them all
 *
 * The generated files are ordinary src pages — build.sh turns them into the
 * final HTML. Edit models.json for data, edit this file for layout.
 */
const fs = require("fs");
const path = require("path");

const root = path.join(__dirname, "..");
const data = JSON.parse(fs.readFileSync(path.join(__dirname, "models.json"), "utf8"));
const force = process.argv.includes("--force");
const bySlug = Object.fromEntries(data.models.map(m => [m.slug, m]));

const ARROW = '<svg viewBox="0 0 20 10" fill="none" stroke="currentColor" stroke-width="1.3"><path d="M0 5h18M14 1l4 4-4 4"/></svg>';

const esc = s => String(s).replace(/&(?!(amp|lt|gt|quot|#\d+);)/g, "&amp;");

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
  const dual = !!(m.specs.racing && m.specs.leisure);
  let inner;
  if (dual) {
    inner = `      <div class="tog" data-tog role="tablist" aria-label="Specification trim">
        <button class="on" type="button" data-trim="racing">Racing trim</button>
        <button type="button" data-trim="leisure">Leisure trim</button>
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

  return `<!-- Related -->
<section class="sec--sm" data-rail>
  <div class="wrap wrap--wide">
    <div class="bh">
      <div>
        <div class="t-lbl bh__lbl" data-r="fade">Also consider</div>
        <h2 class="t-h2 bh__t" data-r style="--i:1">Close to this one</h2>
      </div>
      <div class="rail__ctl" data-r style="--i:2">
        <button class="rnd rail__p" type="button" aria-label="Scroll left"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M15 5l-7 7 7 7"/></svg></button>
        <button class="rnd rail__n" type="button" aria-label="Scroll right"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M9 5l7 7-7 7"/></svg></button>
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

function page(m) {
  const famLabel = m.families.includes("racing") ? "Racing" : "Leisure";
  const famHref = m.families.includes("racing") ? "racing.html" : "leisure.html";
  const facts = m.facts.map(f =>
    `        <div class="facts__i"><span class="facts__k">${esc(f.k)}</span><span class="facts__v t-num">${esc(f.v)}</span></div>`
  ).join("\n");

  const features = m.features.map((f, i) =>
    `      <div class="stick__i" data-r style="--i:${i}">
        <div class="stick__n t-num">${String(i + 1).padStart(2, "0")}</div>
        <div class="t-h3 ft__t">${esc(f.t)}</div>
        <p class="ft__p">${esc(f.p)}</p>
      </div>`
  ).join("\n");

  return `<!--TITLE:${esc(m.name)} — Bernico-->
<!--DESC:${esc(m.tagline)} ${esc(m.kicker)}. Handcrafted in composite at Willebroek, Belgium.-->
<main>

<section class="cov" id="cov" style="height:88svh">
  <article class="cov__s on px-wrap">
    <img class="px" data-px="0.12" src="${m.img.hero}" alt="Bernico ${esc(m.name)}">
  </article>
  <div class="cov__scrim" aria-hidden="true"></div>
  <div class="cov__c">
    <nav class="crumb" aria-label="Breadcrumb"><a href="index.html">Home</a> — <a href="${famHref}">${famLabel}</a> — ${esc(m.name)}</nav>
    <div class="t-kicker cov__k">${esc(m.kicker)}</div>
    <h1 class="t-hero cov__t">${esc(m.name)}</h1>
    <p class="cov__d">${esc(m.tagline)}</p>
    <div class="cov__cta">
      <a class="b b--light-fill" href="contact.html">Enquire</a>
      <a class="b b--light" href="#specs">Specifications</a>
    </div>
    <div class="facts mt3">
${facts}
    </div>
  </div>
  <a class="cov__scroll" href="#intro"><i aria-hidden="true"></i>Scroll</a>
</section>

<!-- Intro -->
<section class="sec" id="intro">
  <div class="wrap wrap--tight" style="text-align:center">
    <div class="t-lbl" style="color:var(--ink-3)" data-r="fade">${esc(m.kicker)}</div>
    <h2 class="t-h2 mt2" data-r style="--i:1">${esc(m.tagline)}</h2>
    <p class="t-body mt3" data-r style="--i:2;margin-inline:auto">${esc(m.intro)}</p>
  </div>
</section>

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
${filmSection(m)}
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
    <h2 class="t-h2 bnr__t" data-r style="--i:1">Build your ${esc(m.name)}</h2>
    <p class="t-body bnr__p" data-r style="--i:2">
      Every Bernico is built to order at Willebroek. Tell our team how you use the water
      and we will specify the boat around it.
    </p>
    <div class="bnr__cta" data-r style="--i:3">
      <a class="b b--fill" href="contact.html">Enquire</a>
      <a class="b" href="${famHref}">All ${famLabel.toLowerCase()} boats</a>
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
