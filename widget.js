(function() {
  const SUPABASE_URL = "https://udctjyetnervitwkjhib.supabase.co";
  const SUPABASE_ANON_KEY = "sb_publishable_DJMt-u-HyH0NG2AOAsriaQ_4PZpr9YC";
  
  // Captura o ID da loja a partir do atributo data-store do script
  const currentScript = document.currentScript || document.querySelector('script[src*="widget.js"]');
  const STORE_ID = currentScript ? (currentScript.getAttribute('data-store') || 'default') : 'default';

  let testimonials = [];
  let currentIndex = 0;
  let activeWidget = null;
  let rotateInterval = null;

  async function fetchTestimonials() {
    try {
      // Filtra por status=approved E store_id=STORE_ID
      const res = await fetch(`${SUPABASE_URL}/rest/v1/testimonials?select=*&status=eq.approved&store_id=eq.${encodeURIComponent(STORE_ID)}&order=created_at.desc`, {
        headers: { "apikey": SUPABASE_ANON_KEY }
      });
      if (!res.ok) return;
      testimonials = await res.json();
      if (testimonials.length > 0) {
        showWidget(0);
        startRotation();
      }
    } catch (e) {
      console.error("ProofPulse Widget Error:", e);
    }
  }

  function injectStyles() {
    if (document.getElementById('pp-widget-styles')) return;
    const style = document.createElement('style');
    style.id = 'pp-widget-styles';
    style.innerHTML = `
      .pp-widget-container {
        position: fixed;
        bottom: 20px;
        left: 20px;
        z-index: 999999;
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
        max-width: 340px;
        width: calc(100% - 40px);
        background: rgba(18, 18, 20, 0.92);
        backdrop-filter: blur(16px);
        -webkit-backdrop-filter: blur(16px);
        border: 1px solid rgba(255, 255, 255, 0.12);
        border-radius: 16px;
        padding: 14px;
        box-shadow: 0 12px 32px rgba(0, 0, 0, 0.4);
        color: #ffffff;
        animation: ppSlideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1);
        transition: opacity 0.3s ease, transform 0.3s ease;
      }
      .pp-widget-container.pp-fade-out {
        opacity: 0;
        transform: translateY(10px);
      }
      @keyframes ppSlideUp {
        from { opacity: 0; transform: translateY(20px); }
        to { opacity: 1; transform: translateY(0); }
      }
      .pp-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 8px; }
      .pp-user { display: flex; align-items: center; gap: 10px; }
      .pp-avatar { width: 36px; height: 36px; border-radius: 50%; object-fit: cover; border: 1.5px solid #3b82f6; }
      .pp-name { font-size: 13px; font-weight: 700; color: #ffffff; line-height: 1.2; }
      .pp-business { font-size: 11px; color: #a1a1aa; margin-top: 1px; }
      .pp-close { background: transparent; border: none; color: #71717a; font-size: 16px; cursor: pointer; padding: 0 4px; }
      .pp-close:hover { color: #ffffff; }
      .pp-rating { color: #fbbf24; font-size: 12px; margin-bottom: 6px; }
      .pp-text { font-size: 12px; line-height: 1.4; color: #e4e4e7; margin: 0 0 8px 0; display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; overflow: hidden; }
      .pp-media-container { display: flex; gap: 6px; overflow-x: auto; margin-top: 8px; padding-bottom: 2px; }
      .pp-media-item { width: 48px; height: 48px; border-radius: 6px; object-fit: cover; background: #000; border: 1px solid rgba(255, 255, 255, 0.1); flex-shrink: 0; }
      .pp-badge { font-size: 9px; text-transform: uppercase; letter-spacing: 0.5px; color: #3b82f6; font-weight: 800; background: rgba(59, 130, 246, 0.15); padding: 2px 6px; border-radius: 4px; border: 1px solid rgba(59, 130, 246, 0.3); }
    `;
    document.head.appendChild(style);
  }

  function showWidget(index) {
    if (!testimonials[index]) return;
    const item = testimonials[index];
    injectStyles();

    if (activeWidget) {
      activeWidget.classList.add('pp-fade-out');
      setTimeout(() => {
        if (activeWidget) activeWidget.remove();
        renderCard(item);
      }, 300);
    } else {
      renderCard(item);
    }
  }

  function renderCard(item) {
    const container = document.createElement('div');
    container.className = 'pp-widget-container';
    
    const stars = "★".repeat(item.rating || 5) + "☆".repeat(5 - (item.rating || 5));
    const items = item.media_items || [];
    if (items.length === 0 && item.media_url) items.push({ url: item.media_url, type: item.media_type });

    let mediaHTML = '';
    if (items.length > 0) {
      mediaHTML = `<div class="pp-media-container">` + items.map(m => {
        if (m.type === 'video') return `<video class="pp-media-item" src="${m.url}"></video>`;
        return `<img class="pp-media-item" src="${m.url}" />`;
      }).join('') + `</div>`;
    }

    container.innerHTML = `
      <div class="pp-header">
        <div class="pp-user">
          <img class="pp-avatar" src="${item.avatar_url || 'https://via.placeholder.com/150'}">
          <div>
            <div class="pp-name">${item.customer_name} <span class="pp-badge">Verified</span></div>
            <div class="pp-business">${item.business_name || 'Customer'}</div>
          </div>
        </div>
        <button class="pp-close" onclick="this.parentElement.parentElement.remove()">✕</button>
      </div>
      <div class="pp-rating">${stars}</div>
      <p class="pp-text">"${item.testimonial_text}"</p>
      ${mediaHTML}
    `;

    document.body.appendChild(container);
    activeWidget = container;
  }

  function startRotation() {
    if (testimonials.length <= 1) return;
    rotateInterval = setInterval(() => {
      currentIndex = (currentIndex + 1) % testimonials.length;
      showWidget(currentIndex);
    }, 7000);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', fetchTestimonials);
  } else {
    fetchTestimonials();
  }
})();
