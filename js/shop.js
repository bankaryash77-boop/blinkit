/* ============================================================
   PUREFARM. — shop.js  (Shop page only)
   Blinkit-style ADD → inline counter · Left category sidebar
   ============================================================ */

let filteredProducts = [...PRODUCT_CATALOGUE];
let currentPage      = 1;
const PAGE_SIZE      = 18;
let activeCategory   = 'all';

/* ── BUILD ONE PRODUCT CARD HTML ── */
function cardHTML(p) {
  const badgeHtml = p.badge ? (() => {
    const cls = p.badgeType === 'disc'       ? 'disc-badge'
              : p.badgeType === 'organic'    ? 'tag-badge organic'
              : p.badgeType === 'fresh'      ? 'tag-badge fresh'
              : p.badgeType === 'bestseller' ? 'tag-badge bestseller'
              : p.badgeType === 'new'        ? 'tag-badge new'
              : 'tag-badge fresh';
    return `<span class="${cls}">${p.badge}</span>`;
  })() : '';

  const oldPriceHtml = p.oldPrice ? `<span class="price-old">₹${p.oldPrice}</span>` : '';
  const oos = p.active === false;

  return `
    <div class="product-card" data-id="${p.id}">
      <div class="product-img-wrap">
        <img src="${p.img}" alt="${p.name}" loading="lazy" />
        ${badgeHtml}
        ${oos ? '<div class="oos-overlay">Out of Stock</div>' : ''}
      </div>
      <div class="product-body">
        <div class="product-weight">${p.weight}</div>
        <div class="product-name">${p.name}</div>
        <div class="product-price-row">
          <div style="display:flex;align-items:center;gap:.35rem">
            <span class="price-now">₹${p.price}</span>
            ${oldPriceHtml}
          </div>
          ${!oos ? `
          <button class="add-btn">ADD</button>
          <div class="qty-counter" style="display:none">
            <button class="qty-btn qty-dec">−</button>
            <span class="qty-num">1</span>
            <button class="qty-btn qty-inc">+</button>
          </div>` : ''}
        </div>
      </div>
    </div>`;
}

/* ── RENDER GRID ── */
function renderGrid() {
  const grid  = document.getElementById('shopGrid');
  const start = (currentPage - 1) * PAGE_SIZE;
  const items = filteredProducts.filter(p => p.active !== false).slice(start, start + PAGE_SIZE);
  document.getElementById('resultCount').textContent = filteredProducts.filter(p=>p.active!==false).length;

  if (!items.length) {
    grid.innerHTML = `<div class="no-results">
      <div style="font-size:3rem">🔍</div>
      <h3>No products found</h3>
      <p>Try a different search or category.</p>
    </div>`;
    renderPagination(); return;
  }

  grid.innerHTML = items.map(p => cardHTML(p)).join('');

  // Animate in
  grid.querySelectorAll('.product-card').forEach((el, i) => {
    el.style.opacity = '0'; el.style.transform = 'translateY(12px)';
    el.style.transition = `opacity .35s ${i*0.04}s, transform .35s ${i*0.04}s`;
    requestAnimationFrame(() => requestAnimationFrame(() => {
      el.style.opacity = '1'; el.style.transform = 'translateY(0)';
    }));
  });

  // Wire up ADD buttons + card click → product detail
  grid.querySelectorAll('.product-card').forEach(card => {
    wireAddButton(card, parseInt(card.dataset.id));
    // Click anywhere on card (not on ADD button) → open detail
    card.addEventListener('click', e => {
      if (e.target.closest('.add-btn') || e.target.closest('.qty-counter')) return;
      openProductDetail(parseInt(card.dataset.id));
    });
  });

  renderPagination();
}

/* ── PAGINATION ── */
function renderPagination() {
  const total = Math.ceil(filteredProducts.filter(p=>p.active!==false).length / PAGE_SIZE);
  const pag   = document.getElementById('pagination');
  if (total <= 1) { pag.innerHTML = ''; return; }
  let html = '';
  for (let i = 1; i <= total; i++)
    html += `<button class="page-btn${i===currentPage?' active':''}" data-page="${i}">${i}</button>`;
  if (currentPage < total)
    html += `<button class="page-btn" data-page="${currentPage+1}">→</button>`;
  pag.innerHTML = html;
  pag.querySelectorAll('.page-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      currentPage = parseInt(btn.dataset.page);
      renderGrid();
      window.scrollTo({ top: 100, behavior: 'smooth' });
    });
  });
}

/* ── APPLY FILTERS ── */
function applyFilters() {
  const search = document.getElementById('searchInput').value.trim().toLowerCase();
  const sort   = document.getElementById('sortSelect').value;

  filteredProducts = PRODUCT_CATALOGUE.filter(p => {
    if (activeCategory !== 'all' && p.category !== activeCategory) return false;
    if (search && !p.name.toLowerCase().includes(search) &&
        !p.category.toLowerCase().includes(search)) return false;
    return true;
  });

  if (sort === 'price-asc')  filteredProducts.sort((a,b) => a.price - b.price);
  if (sort === 'price-desc') filteredProducts.sort((a,b) => b.price - a.price);
  if (sort === 'rating')     filteredProducts.sort((a,b) => b.rating - a.rating);

  currentPage = 1;
  renderGrid();
}

/* ── CATEGORY SIDEBAR ── */
function buildCategorySidebar() {
  const sidebar = document.getElementById('catSidebar');
  if (!sidebar) return;

  const cats = [
    { key:'all',        label:'All Items',   img:'../imgs/veg1.png' },
    { key:'vegetables', label:'Vegetables',  img:'../imgs/cauliflower.jpg' },
    { key:'fruits',     label:'Fruits',      img:'../imgs/watermelon.png' },
    { key:'dairy',      label:'Dairy',       img:'../imgs/dahi2.jpg' },
    { key:'bakery',     label:'Bakery',      img:'../imgs/bread1.jpg' },
  ];

  sidebar.innerHTML = cats.map(c => `
    <div class="cat-item${c.key===activeCategory?' active':''}" data-cat="${c.key}">
      <img class="cat-img" src="${c.img}" alt="${c.label}" />
      <span class="cat-label">${c.label}</span>
    </div>`).join('');

  sidebar.querySelectorAll('.cat-item').forEach(item => {
    item.addEventListener('click', () => {
      activeCategory = item.dataset.cat;
      sidebar.querySelectorAll('.cat-item').forEach(i => i.classList.remove('active'));
      item.classList.add('active');
      // Update section title
      const titleEl = document.getElementById('sectionTitle');
      if (titleEl) {
        const found = cats.find(c => c.key === activeCategory);
        titleEl.textContent = found ? found.label : 'All Items';
      }
      applyFilters();
    });
  });
}

/* ── INIT ── */
document.addEventListener('DOMContentLoaded', () => {
  // Check URL param for category
  const params = new URLSearchParams(window.location.search);
  const catParam = params.get('cat');
  if (catParam) activeCategory = catParam;

  buildCategorySidebar();
  filteredProducts = activeCategory === 'all'
    ? [...PRODUCT_CATALOGUE]
    : PRODUCT_CATALOGUE.filter(p => p.category === activeCategory);
  renderGrid();

  document.getElementById('searchInput').addEventListener('keydown', e => { if(e.key==='Enter') applyFilters(); });
  document.getElementById('searchBtn').addEventListener('click', applyFilters);
  document.getElementById('sortSelect').addEventListener('change', applyFilters);
});
