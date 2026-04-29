/* ============================================================
   PUREFARM. — common.js
   Cart · Toast · WhatsApp · Address Modal · Sheet Cache
   ============================================================ */

const WHATSAPP_NUMBER = '919373828887';
const SHOP_NAME       = 'PureFarm.';
const SHEETS_CSV_URL  = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vTLDgwfHKELFF-2XSWqnT_CkXhEBKi6m3nAicTtJlEf5-3YxI9TzBNqAALwp0dfpU43VPl_DpckgMsL/pub?gid=471578357&single=true&output=csv'; // paste your Google Sheet CSV URL here

/* ── SHEET CACHE ─────────────────────────────────────────────── */
const SHEET_CACHE_KEY = 'purefarm2_sheet_v1';

function saveSheetCache(rows) {
  try {
    localStorage.setItem(SHEET_CACHE_KEY, JSON.stringify({ ts: Date.now(), rows }));
  } catch(e) {}
}

function applySheetCache() {
  try {
    const raw = localStorage.getItem(SHEET_CACHE_KEY);
    if (!raw) return;
    const { rows } = JSON.parse(raw);
    if (!rows || !rows.length) return;
    rows.forEach(row => {
      const prod = PRODUCT_CATALOGUE.find(p => p.id === Number(row.id));
      if (!prod) return;
      if (row.price    && row.price    !== '') prod.price    = Number(row.price);
      if (row.oldPrice !== undefined)          prod.oldPrice = row.oldPrice ? Number(row.oldPrice) : null;
      if (row.badge    !== undefined)          prod.badge    = row.badge    || null;
      if (row.badgeType!== undefined)          prod.badgeType= row.badgeType|| null;
      if (row.active   && row.active   !== '') prod.active   = row.active.toUpperCase() !== 'FALSE';
      if (row.category && row.category !== '') prod.category = row.category.toLowerCase();
      if (row.weight   && row.weight   !== '') prod.weight   = row.weight;
      if (row.name     && row.name     !== '') prod.name     = row.name;
    });
  } catch(e) {}
}

function parseCSV(text) {
  const lines = text.trim().split('\n');
  if (lines.length < 2) return [];
  const headers = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g, ''));
  return lines.slice(1).map(line => {
    const values = []; let cur = '', inQ = false;
    for (const ch of line) {
      if (ch === '"') { inQ = !inQ; }
      else if (ch === ',' && !inQ) { values.push(cur.trim()); cur = ''; }
      else cur += ch;
    }
    values.push(cur.trim());
    const obj = {};
    headers.forEach((h, i) => { obj[h] = (values[i]||'').replace(/^"|"$/g,''); });
    return obj;
  });
}

async function fetchSheetData() {
  const result = { productsChanged: false };
  if (!SHEETS_CSV_URL) return result;
  try {
    const res = await fetch(SHEETS_CSV_URL + '&t=' + Date.now(), { cache: 'no-store' });
    if (!res.ok) return result;
    const rows = parseCSV(await res.text());
    rows.forEach(row => {
      if (!row.id) return;
      const prod = PRODUCT_CATALOGUE.find(p => p.id === Number(row.id));
      if (!prod) return;
      if (row.price    && row.price    !== '') { prod.price    = Number(row.price);                           result.productsChanged = true; }
      if (row.oldPrice !== undefined)          { prod.oldPrice = row.oldPrice ? Number(row.oldPrice) : null; result.productsChanged = true; }
      if (row.badge    !== undefined)          { prod.badge    = row.badge    || null;                       result.productsChanged = true; }
      if (row.badgeType!== undefined)          { prod.badgeType= row.badgeType|| null;                       result.productsChanged = true; }
      if (row.active   !== undefined)          { prod.active   = row.active.toUpperCase() !== 'FALSE';       result.productsChanged = true; }
      if (row.weight   && row.weight   !== '') { prod.weight   = row.weight;                                 result.productsChanged = true; }
      if (row.name     && row.name     !== '') { prod.name     = row.name;                                   result.productsChanged = true; }
    });
    saveSheetCache(rows);
  } catch(e) { console.warn('Sheet failed:', e.message); }
  return result;
}

/* ── PRODUCT CATALOGUE ────────────────────────────────────────
   img path is relative to pages/ folder
   weight: shown under product name (like Blinkit)
──────────────────────────────────────────────────────────────── */
const PRODUCT_CATALOGUE = [
  /* ── VEGETABLES ── */
  { id:1,  name:'Fresh Tomatoes',       price:40,  oldPrice:50,  category:'vegetables', weight:'500 g',  badge:'16% OFF',  badgeType:'disc', rating:4.8, reviews:124, active:true,  img:'../imgs/tomatoes.jpg',
    desc:'Farm-fresh tomatoes picked at peak ripeness. Ideal for curries, salads and chutneys.',
    nutrition:'Vitamin C · Lycopene · Potassium · Antioxidants',
    highlights:['Picked fresh every morning from Nashik farms','Rich in Vitamin C and Lycopene','No artificial ripening or chemicals','Perfect for curries, chutneys and salads'] },
  { id:2,  name:'Green Cabbage',         price:25,  oldPrice:null, category:'vegetables', weight:'1 piece', badge:null, badgeType:null, rating:4.6, reviews:88, active:true, img:'../imgs/cabbage.jpg',
    desc:'Fresh green cabbage, perfect for sabzi, salads and coleslaw.',
    nutrition:'Vitamin K · Vitamin C · Fibre · Folate',
    highlights:['Crisp and fresh, harvested locally','High in Vitamin K and antioxidants','Great for sabzi, salads, coleslaw and soups','Low calorie, high nutrition'] },
  { id:3,  name:'Cauliflower (Phool Gobi)',price:35, oldPrice:45, category:'vegetables', weight:'1 piece', badge:'22% OFF', badgeType:'disc', rating:4.7, reviews:76, active:true, img:'../imgs/cauliflower.jpg',
    desc:'Fresh white cauliflower. Great for gobi sabzi, aloo gobi and pakoras.',
    nutrition:'Vitamin C · Vitamin K · Folate · Fibre',
    highlights:['Farm-fresh, tight white florets','No discolouration or blemishes','Ideal for gobi sabzi, aloo gobi, pakoras, soups','Rich in Vitamin C and antioxidants'] },
  { id:4,  name:'Red Chillies',          price:15,  oldPrice:null, category:'vegetables', weight:'100 g',  badge:'Fresh',  badgeType:'fresh', rating:4.5, reviews:112, active:true, img:'../imgs/chilli.jpg',
    desc:'Fiery red chillies freshly sourced every morning. Adds the perfect kick.',
    nutrition:'Capsaicin · Vitamin C · Iron · Antioxidants',
    highlights:['Freshly sourced every single morning','High in Capsaicin — natural metabolism booster','Adds the perfect heat to any Indian dish','Stored hygienically at correct temperature'] },
  { id:5,  name:'Organic Cauliflower',   price:55,  oldPrice:65,  category:'vegetables', weight:'1 piece', badge:'Organic', badgeType:'organic', rating:4.9, reviews:54, active:true, img:'../imgs/cauliflower2.jpg',
    desc:'Certified organic cauliflower, grown without pesticides.',
    nutrition:'Vitamin C · Vitamin K · Folate · Fibre',
    highlights:['Certified organic — zero pesticides','Grown using natural farming methods','Safe for children and elderly','Supports sustainable local farming'] },

  /* ── FRUITS ── */
  { id:6,  name:'Fresh Plums',           price:80,  oldPrice:100, category:'fruits',     weight:'500 g',  badge:'20% OFF', badgeType:'disc', rating:4.7, reviews:63, active:true, img:'../imgs/plums.jpg',
    desc:'Juicy and sweet fresh plums. Rich in antioxidants and Vitamin C.',
    nutrition:'Vitamin C · Vitamin A · Potassium · Antioxidants',
    highlights:['Sweet and juicy with a tart skin','Naturally ripened, no artificial additives','Rich in Vitamins A and C','Great for snacking, smoothies and desserts'] },
  { id:7,  name:'Watermelon',            price:25,  oldPrice:null, category:'fruits',     weight:'1 kg',   badge:'Fresh',  badgeType:'fresh', rating:4.8, reviews:155, active:true, img:'../imgs/watermelon.png',
    desc:'Chilled and juicy seedless watermelon. Perfect summer refreshment.',
    nutrition:'Lycopene · Vitamin A · Vitamin C · Water (92%)',
    highlights:['Seedless variety — easy to eat','92% water content — extremely hydrating','Rich in Lycopene and Vitamins A, C','Best served chilled on hot summer days'] },

  /* ── DAIRY ── */
  { id:8,  name:'Dilicia Dahi',          price:30,  oldPrice:null, category:'dairy',      weight:'200 g',  badge:'Fresh Daily', badgeType:'fresh', rating:4.8, reviews:189, active:true, img:'../imgs/dahi1.jpg',
    desc:'Thick and creamy Dilicia dahi set fresh every morning. No preservatives.',
    nutrition:'Probiotics · Calcium · Protein · Vitamin B12',
    highlights:['Set fresh every single morning','Zero preservatives, zero artificial flavours','Rich in live probiotic cultures for gut health','Perfect for raita, kadhi, lassi and biryani'] },
  { id:9,  name:'Country Delight Dahi',  price:45,  oldPrice:55,  category:'dairy',      weight:'400 g',  badge:'18% OFF', badgeType:'disc', rating:4.9, reviews:142, active:true, img:'../imgs/dahi2.jpg',
    desc:'Ghar Jaisa Dahi made from pure cow milk. Thick, creamy and natural.',
    nutrition:'Probiotics · Calcium · Protein · Vitamin D',
    highlights:['Made from pure A2 cow milk','Thick and creamy — just like homemade','No added preservatives or stabilisers','Source of protein and healthy gut bacteria'] },
  { id:10, name:'Dilicia Buttermilk',    price:20,  oldPrice:null, category:'dairy',      weight:'500 ml', badge:'New',    badgeType:'new', rating:4.7, reviews:76, active:true, img:'../imgs/buttermilk.jpg',
    desc:'Refreshing chilled buttermilk (taak). Perfect for summers.',
    nutrition:'Probiotics · Calcium · Riboflavin · Low Fat',
    highlights:['Traditional Maharashtrian taak recipe','Chilled and refreshing — ideal for hot days','Natural probiotics for digestive health','Low fat, high protein alternative to lassi'] },
  { id:11, name:'Govind Milk Powder',    price:280, oldPrice:320, category:'dairy',      weight:'1 kg',   badge:'12% OFF', badgeType:'disc', rating:4.6, reviews:98, active:true, img:'../imgs/milk_powder.jpg',
    desc:'Govind instant skimmed milk powder. Spray dried, ISI certified.',
    nutrition:'Protein · Calcium · Vitamin D · Phosphorus',
    highlights:['ISI certified — highest quality standard','Spray dried for superior solubility','Long shelf life — ideal for storage','Used for tea, sweets, baking and beverages'] },
  { id:12, name:'Horna Fresh Milk',      price:28,  oldPrice:null, category:'dairy',      weight:'500 ml', badge:'Best Seller', badgeType:'bestseller', rating:4.9, reviews:312, active:true, img:'../imgs/milk2.jpg',
    desc:'Pure and fresh pasteurised cow milk delivered daily.',
    nutrition:'Calcium · Protein · Vitamin D · Vitamin B12',
    highlights:['Pasteurised and homogenised for safety','Sourced from local healthy cows daily','Full cream — rich and nutritious','No added water, no adulterants guaranteed'] },
  { id:13, name:'Vethaa Nourish Milk',   price:32,  oldPrice:38,  category:'dairy',      weight:'500 ml', badge:'16% OFF', badgeType:'disc', rating:4.7, reviews:88, active:true, img:'../imgs/milk3.jpg',
    desc:'A2 cow milk, naturally nutritious and pure from local farms.',
    nutrition:'A2 Beta-Casein · Calcium · Omega-3 · Protein',
    highlights:['Premium A2 milk from Indian Desi cows','Easier to digest than regular A1 milk','Natural omega-3 fatty acids and CLA','No hormones or antibiotics in the supply chain'] },
  { id:14, name:'Nandini Paneer',        price:120, oldPrice:140, category:'dairy',      weight:'500 g',  badge:'14% OFF', badgeType:'disc', rating:4.9, reviews:145, active:true, img:'../imgs/paneer1.jpg',
    desc:'Soft and fresh Nandini cottage cheese made from pure cow milk.',
    nutrition:'Protein · Calcium · Phosphorus · Vitamin B12',
    highlights:['Made from pure cow milk by KMF','Soft texture — ideal for curries and tikka','High protein — 18.6g per 100g','Refrigerate and use within 3 days of opening'] },
  { id:15, name:'Amul Paneer Fresh',     price:90,  oldPrice:null, category:'dairy',      weight:'200 g',  badge:'Best Seller', badgeType:'bestseller', rating:4.8, reviews:234, active:true, img:'../imgs/paneer2.webp',
    desc:'Amul Fresh Paneer — Power of Protein. Ideal for paneer butter masala and tikka.',
    nutrition:'Protein · Calcium · Healthy Fats · Phosphorus',
    highlights:['Premium Amul brand — trusted since 1946','High protein for muscle health','Fresh and firm texture — does not crumble','Best for paneer butter masala, bhurji, tikka'] },
  { id:16, name:'Nanak Paneer',          price:160, oldPrice:190, category:'dairy',      weight:'400 g',  badge:'16% OFF', badgeType:'disc', rating:4.7, reviews:67, active:true, img:'../imgs/paneer3.jpg',
    desc:'100% vegetarian Nanak Paneer. Gluten free, rich in calcium.',
    nutrition:'Protein · Calcium · Vitamin A · Phosphorus',
    highlights:['100% vegetarian, gluten free','20% calcium per serving','Made from pure milk ingredients','Keep refrigerated or frozen until use'] },

  /* ── BAKERY ── */
  { id:17, name:'Brown Sliced Bread',    price:40,  oldPrice:45,  category:'bakery',     weight:'400 g',  badge:'11% OFF', badgeType:'disc', rating:4.6, reviews:98, active:true, img:'../imgs/bread1.jpg',
    desc:'Soft and wholesome brown sliced bread. Perfect for sandwiches and toast.',
    nutrition:'Fibre · Iron · B Vitamins · Complex Carbs',
    highlights:['Whole wheat flour — high fibre content','Soft and fresh, baked daily','No maida — healthier than white bread','Perfect for sandwiches, toast and snacking'] },
  { id:18, name:'Wheat Bread Loaf',      price:55,  oldPrice:null, category:'bakery',     weight:'500 g',  badge:'Fresh',  badgeType:'fresh', rating:4.7, reviews:76, active:true, img:'../imgs/bread2.jpg',
    desc:'Freshly baked wheat bread loaf with a soft crumb and golden crust.',
    nutrition:'Fibre · Iron · B Vitamins · Complex Carbs',
    highlights:['Freshly baked every morning','Golden crust, soft and airy crumb','100% wheat flour, no bleaching agents','Pairs perfectly with butter, jam or dips'] },
  { id:19, name:'Sourdough Bread',       price:120, oldPrice:140, category:'bakery',     weight:'600 g',  badge:'Artisan', badgeType:'organic', rating:4.9, reviews:54, active:true, img:'../imgs/bread3.jpg',
    desc:'Hand-crafted sourdough with natural fermentation. Tangy, airy and delicious.',
    nutrition:'Prebiotics · Iron · B Vitamins · Lower Glycemic Index',
    highlights:['48-hour slow fermentation process','Natural yeast — no commercial yeast added','Lower glycemic index than regular bread','Easy to digest due to natural fermentation'] },
];

/* Apply cache before any render */
applySheetCache();

/* Helper — resolve image path from any page depth */
function resolveImg(src) {
  const isPages = window.location.pathname.includes('/pages/');
  return isPages ? src : src.replace('../', '');
}

/* ── CART ─────────────────────────────────────────────────── */
function getCart()      { return JSON.parse(localStorage.getItem('purefarm2_cart')||'[]'); }
function saveCart(c)    { localStorage.setItem('purefarm2_cart', JSON.stringify(c)); updateCartBadge(); }
function addToCart(item) {
  const cart = getCart();
  const ex = cart.find(c => c.id === item.id);
  if (ex) ex.qty += 1; else cart.push({ ...item, qty:1 });
  saveCart(cart);
}
function removeFromCart(id) { saveCart(getCart().filter(c => c.id !== id)); }
function changeQty(id, delta) {
  const cart = getCart(), item = cart.find(c => c.id === id);
  if (!item) return;
  item.qty = Math.max(1, item.qty + delta);
  saveCart(cart);
}
function updateCartBadge() {
  const total = getCart().reduce((s,i) => s+i.qty, 0);
  document.querySelectorAll('.cart-count').forEach(el => {
    el.textContent = total;
    el.style.display = total > 0 ? 'flex' : 'none';
  });
}

/* ── ZEPTO-STYLE "ADDED TO CART" NOTIFICATION ─────────────── */
function showAddedToCart(product, qty) {
  // Build notification if not exists
  let notif = document.getElementById('addedToCartNotif');
  if (!notif) {
    notif = document.createElement('div');
    notif.id = 'addedToCartNotif';
    notif.innerHTML = `
      <div class="atc-header">
        <svg class="atc-check" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
        <span class="atc-title">Added to Cart</span>
        <button class="atc-close-btn" id="atcCloseBtn">✕</button>
      </div>
      <div class="atc-body">
        <img class="atc-img" id="atcImg" src="" alt="" />
        <div class="atc-info">
          <div class="atc-name" id="atcName"></div>
          <div class="atc-meta" id="atcMeta"></div>
          <div class="atc-price" id="atcPrice"></div>
        </div>
      </div>
      <div class="atc-footer">
        <button class="atc-cart-btn" id="atcCartBtn">Go to Cart →</button>
      </div>`;
    document.body.appendChild(notif);
    document.getElementById('atcCloseBtn').addEventListener('click', hideAddedToCart);
    document.getElementById('atcCartBtn').addEventListener('click', () => { hideAddedToCart(); openCart(); });
  }

  // Fill data
  const isPages = window.location.pathname.includes('/pages/');
  const imgBase  = isPages ? '../' : '';
  const imgSrc   = product.img ? imgBase + product.img.replace('../','') : '';
  document.getElementById('atcImg').src = imgSrc;
  document.getElementById('atcImg').alt = product.name;
  document.getElementById('atcName').textContent = product.name;
  document.getElementById('atcMeta').textContent = (product.weight || '') + (qty > 1 ? ' × ' + qty : '');
  const cart = getCart();
  const cartItem = cart.find(c => c.id === product.id);
  const total = cartItem ? cartItem.price * cartItem.qty : product.price;
  document.getElementById('atcPrice').textContent = '₹' + total.toLocaleString('en-IN');

  // Show
  clearTimeout(notif._timer);
  notif.classList.add('show');
  notif._timer = setTimeout(hideAddedToCart, 3200);
}

function hideAddedToCart() {
  const n = document.getElementById('addedToCartNotif');
  if (n) n.classList.remove('show');
}
/* ── ZEPTO-STYLE PRODUCT DETAIL MODAL ─────────────────────────
   Full page-like modal: image · thumbnails · price pill · highlights
   Sticky bottom bar with full-width − qty + counter
─────────────────────────────────────────────────────────────── */
function openProductDetail(id) {
  const p = PRODUCT_CATALOGUE.find(x => x.id === id);
  if (!p) return;

  const isPages = window.location.pathname.includes('/pages/');
  const imgBase = isPages ? '../' : '';

  // Savings calculation
  const savings = p.oldPrice ? p.oldPrice - p.price : 0;
  const savingsPct = p.oldPrice ? Math.round((savings / p.oldPrice) * 100) : 0;

  // Badge HTML
  const badgeHtml = p.badge ? (() => {
    const cls = p.badgeType === 'disc' ? 'disc-badge'
      : p.badgeType === 'organic' ? 'tag-badge organic'
      : p.badgeType === 'fresh'   ? 'tag-badge fresh'
      : p.badgeType === 'bestseller' ? 'tag-badge bestseller'
      : 'tag-badge new';
    return `<span class="${cls}">${p.badge}</span>`;
  })() : '';

  // Build or get modal element
  let modal = document.getElementById('pfProductModal');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'pfProductModal';
    document.body.appendChild(modal);
    modal.addEventListener('click', e => { if (e.target === modal) closeProductDetail(); });
    document.addEventListener('keydown', e => { if (e.key === 'Escape') closeProductDetail(); });
  }

  // Current cart qty for this product
  const cart = getCart();
  const cartItem = cart.find(c => c.id === id);
  const currentQty = cartItem ? cartItem.qty : 0;

  // Highlights list
  const highlightItems = (p.highlights || [p.desc]).map(h =>
    `<div class="pf-prod-highlight-item">
      <div class="pf-prod-hi-dot"></div>
      <div class="pf-prod-hi-text">${h}</div>
    </div>`
  ).join('');

  modal.innerHTML = `
    <div class="pf-prod-box" id="pfProdBox">
      <div class="pf-prod-handle"></div>
      <button class="pf-prod-close" onclick="closeProductDetail()">✕</button>

      <div class="pf-prod-inner-grid">
        <!-- LEFT: images -->
        <div class="pf-prod-left">
          <div class="pf-prod-img-area">
            <img class="pf-prod-main-img" id="pfProdMainImg" src="${imgBase + p.img.replace('../','')}" alt="${p.name}" />
            <div class="pf-prod-badge-overlay">${badgeHtml}</div>
          </div>
          <div class="pf-prod-thumbs" id="pfProdThumbs">
            <div class="pf-prod-thumb active"><img src="${imgBase + p.img.replace('../','')}" alt="${p.name}" /></div>
          </div>
        </div>

        <!-- RIGHT: info -->
        <div class="pf-prod-right">
          <div class="pf-prod-info">
            <div class="pf-prod-category">${p.category} &rsaquo; ${p.name}</div>
            <div class="pf-prod-name">${p.name}</div>
            <div class="pf-prod-weight-tag">Net Qty: ${p.weight}</div>

            <div class="pf-prod-price-block">
              <div class="pf-prod-price-pill">
                <span>₹</span><span>${p.price}</span>
              </div>
              ${p.oldPrice ? `
              <div>
                <div class="pf-prod-mrp-row">MRP <s>₹${p.oldPrice}</s> (incl. of all taxes)</div>
                <div class="pf-prod-savings">₹${savings} OFF (${savingsPct}%)</div>
              </div>` : `<div class="pf-prod-mrp-row" style="font-size:.78rem;color:var(--text-muted)">Incl. of all taxes</div>`}
            </div>
          </div>

          ${p.nutrition ? `
          <div class="pf-prod-nutrition">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2zm0 18a8 8 0 1 1 8-8 8 8 0 0 1-8 8zm-1-13h2v6h-2zm0 8h2v2h-2z"/></svg>
            <span><strong>Nutrition:</strong> ${p.nutrition}</span>
          </div>` : ''}

          <div class="pf-prod-trust">
            <div class="pf-prod-trust-item">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
              <span>100% Fresh</span>
            </div>
            <div class="pf-prod-trust-item">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
              <span>Daily Delivery</span>
            </div>
            <div class="pf-prod-trust-item">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>
              <span>Best Price</span>
            </div>
          </div>

          <div class="pf-prod-highlights">
            <h4>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--green)" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 11 12 14 22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>
              Highlights
            </h4>
            ${highlightItems}
          </div>
        </div>
      </div>

      <!-- STICKY BOTTOM BAR -->
      <div class="pf-prod-bottom">
        <div class="pf-prod-bottom-price">
          <span>Price</span>
          <span>₹${p.price}<span style="font-size:.68rem;font-weight:400;color:var(--text-muted)"> / ${p.weight}</span></span>
        </div>
        <button class="pf-prod-add-bar" id="pfProdAddBar" ${currentQty > 0 ? 'style="display:none"' : ''}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          Add to Cart
        </button>
        <div class="pf-prod-counter-bar ${currentQty > 0 ? 'active' : ''}" id="pfProdCounterBar">
          <button id="pfProdDec">−</button>
          <span id="pfProdQty">${currentQty > 0 ? currentQty : 1}</span>
          <button id="pfProdInc">+</button>
        </div>
      </div>
    </div>`;

  // Wire up buttons
  const addBar     = document.getElementById('pfProdAddBar');
  const counterBar = document.getElementById('pfProdCounterBar');
  const qtyEl      = document.getElementById('pfProdQty');

  function refreshBottom() {
    const c = getCart();
    const item = c.find(x => x.id === id);
    if (item && item.qty > 0) {
      addBar.style.display = 'none';
      counterBar.classList.add('active');
      qtyEl.textContent = item.qty;
    } else {
      addBar.style.display = '';
      counterBar.classList.remove('active');
      qtyEl.textContent = '1';
    }
  }

  addBar.addEventListener('click', () => {
    addToCart({ id: p.id, name: p.name, price: p.price, weight: p.weight });
    showAddedToCart(p, 1);
    refreshBottom();
  });

  document.getElementById('pfProdInc').addEventListener('click', () => {
    addToCart({ id: p.id, name: p.name, price: p.price, weight: p.weight });
    refreshBottom();
  });

  document.getElementById('pfProdDec').addEventListener('click', () => {
    const c = getCart();
    const item = c.find(x => x.id === id);
    if (item && item.qty > 1) {
      changeQty(id, -1);
    } else {
      removeFromCart(id);
    }
    refreshBottom();
  });

  // Open
  modal.classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeProductDetail() {
  const m = document.getElementById('pfProductModal');
  if (m) m.classList.remove('open');
  document.body.style.overflow = '';
}

/* ── TOAST (simple, for errors/warnings) ─────────────────────── */
function showToast(msg, icon='✓') {
  let t = document.getElementById('pf-toast');
  if (!t) { t = document.createElement('div'); t.id = 'pf-toast'; document.body.appendChild(t); }
  t.textContent = `${icon} ${msg}`;
  t.classList.add('show');
  clearTimeout(t._timer);
  t._timer = setTimeout(() => { t.classList.remove('show'); }, 2500);
}

/* ── CART DRAWER ───────────────────────────────────────────── */
function buildCartDrawer() {
  if (document.getElementById('pfCartDrawer')) return;
  const d = document.createElement('div'); d.id = 'pfCartDrawer';
  d.innerHTML = `
    <div id="pfCartBackdrop"></div>
    <div id="pfCartPanel">
      <div class="pf-cart-head">
        <h3>🛒 Your Cart</h3>
        <button id="pfCartClose">✕</button>
      </div>
      <div id="pfCartItems"></div>
      <div id="pfCartFooter">
        <div id="pfCartTotal"></div>
        <button id="pfWhatsappBtn">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
          Order on WhatsApp
        </button>
        <button id="pfClearCart">Clear Cart</button>
      </div>
    </div>`;
  document.body.appendChild(d);
  document.getElementById('pfCartBackdrop').addEventListener('click', closeCart);
  document.getElementById('pfCartClose').addEventListener('click', closeCart);
  document.getElementById('pfWhatsappBtn').addEventListener('click', () => { closeCart(); setTimeout(openAddressModal, 300); });
  document.getElementById('pfClearCart').addEventListener('click', () => { saveCart([]); renderCartDrawer(); });
}

function openCart()  { document.getElementById('pfCartDrawer').classList.add('open'); renderCartDrawer(); document.body.style.overflow='hidden'; }
function closeCart() { document.getElementById('pfCartDrawer').classList.remove('open'); document.body.style.overflow=''; }

function renderCartDrawer() {
  const cart = getCart();
  const itemsEl  = document.getElementById('pfCartItems');
  const totalEl  = document.getElementById('pfCartTotal');
  const footerEl = document.getElementById('pfCartFooter');
  const isPages  = window.location.pathname.includes('/pages/');
  const imgBase  = isPages ? '../' : '';

  if (!cart.length) {
    itemsEl.innerHTML = `<div class="pf-cart-empty"><div style="font-size:2.5rem;margin-bottom:.5rem">🛒</div><p>Your cart is empty</p></div>`;
    footerEl.style.display = 'none'; return;
  }
  footerEl.style.display = 'flex';
  itemsEl.innerHTML = cart.map(item => {
    const prod = PRODUCT_CATALOGUE.find(p => p.id === item.id);
    const imgSrc = prod ? imgBase + prod.img.replace('../','') : '';
    return `<div class="pf-cart-item">
      ${imgSrc ? `<img class="pf-cart-img" src="${imgSrc}" alt="${item.name}" />` : ''}
      <div class="pf-ci-info">
        <div class="pf-ci-name">${item.name}</div>
        <div class="pf-ci-price">₹${(item.price * item.qty).toLocaleString('en-IN')}</div>
        <div class="pf-ci-qty">
          <button class="pf-qty-btn" data-id="${item.id}" data-action="dec">−</button>
          <span class="pf-qty-num">${item.qty}</span>
          <button class="pf-qty-btn" data-id="${item.id}" data-action="inc">+</button>
        </div>
      </div>
      <button class="pf-ci-del" data-id="${item.id}">✕</button>
    </div>`;
  }).join('');
  const grand = cart.reduce((s,i) => s + i.price * i.qty, 0);
  totalEl.innerHTML = `<span>Total</span><span>₹${grand.toLocaleString('en-IN')}</span>`;
  itemsEl.querySelectorAll('.pf-qty-btn').forEach(btn => {
    btn.addEventListener('click', () => { changeQty(parseInt(btn.dataset.id), btn.dataset.action==='inc'?1:-1); renderCartDrawer(); });
  });
  itemsEl.querySelectorAll('.pf-ci-del').forEach(btn => {
    btn.addEventListener('click', () => { removeFromCart(parseInt(btn.dataset.id)); renderCartDrawer(); });
  });
}

/* ── ADDRESS + DELIVERY MODAL ────────────────────────────────── */
function buildAddressModal() {
  if (document.getElementById('pfAddressModal')) return;
  const el = document.createElement('div'); el.id = 'pfAddressModal';
  el.innerHTML = `
    <div id="pfAddressBox">
      <div id="pfAddressHead"><h3>📦 Delivery Details</h3><button id="pfAddressClose">✕</button></div>
      <div id="pfAddressBody">
        <label>Full Name *</label>
        <input type="text" id="pfName" placeholder="e.g. Rahul Sharma" />
        <label>Phone Number *</label>
        <input type="tel" id="pfPhone" placeholder="e.g. 9373828887" />
        <label>Delivery Slot *</label>
        <div id="pfSlotPicker">
          <button class="pf-slot-btn" data-slot="🌅 Morning (7am–11am)">🌅 Morning<span>7am – 11am</span></button>
          <button class="pf-slot-btn" data-slot="🌆 Evening (5pm–8pm)">🌆 Evening<span>5pm – 8pm</span></button>
        </div>
        <label>Full Address *</label>
        <textarea id="pfStreet" rows="2" placeholder="Flat / House No, Street, Area"></textarea>
        <label>City *</label>
        <input type="text" id="pfCity" placeholder="e.g. Pune" />
        <label>Pincode *</label>
        <input type="text" id="pfPin" placeholder="e.g. 411001" />
        <label>Note (optional)</label>
        <textarea id="pfNote" rows="2" placeholder="Special instructions…"></textarea>
        <button id="pfConfirmBtn">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
          Confirm & Send on WhatsApp
        </button>
      </div>
    </div>`;
  document.body.appendChild(el);

  let selectedSlot = '';
  document.getElementById('pfAddressClose').addEventListener('click', closeAddressModal);
  el.addEventListener('click', e => { if(e.target===el) closeAddressModal(); });
  document.querySelectorAll('.pf-slot-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.pf-slot-btn').forEach(b => b.classList.remove('selected'));
      btn.classList.add('selected'); selectedSlot = btn.dataset.slot;
    });
  });

  document.getElementById('pfConfirmBtn').addEventListener('click', () => {
    const name   = document.getElementById('pfName').value.trim();
    const phone  = document.getElementById('pfPhone').value.trim();
    const street = document.getElementById('pfStreet').value.trim();
    const city   = document.getElementById('pfCity').value.trim();
    const pin    = document.getElementById('pfPin').value.trim();
    const note   = document.getElementById('pfNote').value.trim();
    if (!name||!phone||!street||!city||!pin) { showToast('Please fill all required fields','⚠️'); return; }
    if (!selectedSlot) { showToast('Please select a delivery slot','⚠️'); return; }
    localStorage.setItem('purefarm2_addr', JSON.stringify({name,phone,street,city,pin}));
    const cart = getCart();
    if (!cart.length) { showToast('Cart is empty!','⚠️'); return; }
    let msg = `🌿 *New Order — ${SHOP_NAME}*\n\n*ORDER ITEMS:*\n`;
    let total = 0;
    cart.forEach(i => { const sub=i.price*i.qty; msg+=`• *${i.name}* ×${i.qty} — ₹${sub.toLocaleString('en-IN')}\n`; total+=sub; });
    msg += `\n*Total: ₹${total.toLocaleString('en-IN')}*\n⏰ *Slot:* ${selectedSlot}\n`;
    msg += `\n━━━━━━━━━━━━━━━━━━\n*DELIVERY:*\n👤 ${name}\n📞 ${phone}\n📍 ${street}, ${city} — ${pin}`;
    if (note) msg += `\n📝 ${note}`;
    msg += `\n━━━━━━━━━━━━━━━━━━\nPlease confirm my order 🙏`;
    closeAddressModal();
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(msg)}`, '_blank');
  });
}

function openAddressModal() {
  buildAddressModal();
  const s = JSON.parse(localStorage.getItem('purefarm2_addr')||'{}');
  if (s.name)   document.getElementById('pfName').value   = s.name;
  if (s.phone)  document.getElementById('pfPhone').value  = s.phone;
  if (s.street) document.getElementById('pfStreet').value = s.street;
  if (s.city)   document.getElementById('pfCity').value   = s.city;
  if (s.pin)    document.getElementById('pfPin').value    = s.pin;
  document.getElementById('pfAddressModal').classList.add('open');
  document.body.style.overflow = 'hidden';
}
function closeAddressModal() {
  const m = document.getElementById('pfAddressModal');
  if (m) m.classList.remove('open');
  document.body.style.overflow = '';
}

/* ── INLINE ADD / COUNTER on cards ──────────────────────────
   Called by shop.js and index.js to wire up each product card
────────────────────────────────────────────────────────────── */
function wireAddButton(card, productId) {
  const prod    = PRODUCT_CATALOGUE.find(p => p.id === productId);
  if (!prod) return;
  const addBtn  = card.querySelector('.add-btn');
  const counter = card.querySelector('.qty-counter');
  const qtyNum  = card.querySelector('.qty-num');
  if (!addBtn || !counter || !qtyNum) return;

  function syncState() {
    const cart = getCart();
    const item = cart.find(c => c.id === productId);
    if (item && item.qty > 0) {
      addBtn.style.display   = 'none';
      counter.style.display  = 'flex';
      qtyNum.textContent = item.qty;
    } else {
      addBtn.style.display  = '';
      counter.style.display = 'none';
    }
  }
  syncState();

  addBtn.addEventListener('click', e => {
    e.stopPropagation();
    addToCart({ id: prod.id, name: prod.name, price: prod.price, weight: prod.weight });
    showAddedToCart(prod, 1);
    syncState();
  });

  card.querySelector('.qty-inc')?.addEventListener('click', e => {
    e.stopPropagation();
    addToCart({ id: prod.id, name: prod.name, price: prod.price, weight: prod.weight });
    syncState();
  });

  card.querySelector('.qty-dec')?.addEventListener('click', e => {
    e.stopPropagation();
    changeQty(productId, -1);
    const item = getCart().find(c => c.id === productId);
    if (!item || item.qty <= 0) removeFromCart(productId);
    syncState();
  });

  // Re-sync when cart changes from elsewhere
  window.addEventListener('storage', syncState);
}

/* ── INIT ─────────────────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {
  buildCartDrawer();
  updateCartBadge();
  document.querySelectorAll('[data-open-cart]').forEach(el => {
    el.addEventListener('click', e => { e.preventDefault(); openCart(); });
  });
  fetchSheetData().then(({ productsChanged }) => {
    if (productsChanged && typeof renderGrid === 'function') renderGrid();
  });
});
