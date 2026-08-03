(function() {
  // Prevent duplicate script initialization on the same page
  if (window.ProofPulseWidgetLoaded) return;
  window.ProofPulseWidgetLoaded = true;

  const SUPABASE_URL = "https://udctjyetnervitwkjhib.supabase.co";
  const SUPABASE_ANON_KEY = "sb_publishable_DJMt-u-HyH0NG2AOAsriaQ_4PZpr9YC";

  let testimonials = [];
  let currentIndex = 0;
  let rotationInterval = null;

  function injectStyles() {
    if (document.getElementById('proofpulse-widget-styles')) return;

    const style = document.createElement('style');
    style.id = 'proofpulse-widget-styles';
    style.innerHTML = `
      #proofpulse-widget-root {
        position: fixed;
        bottom: 20px;
        left: 20px;
        z-index: 999999;
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
        pointer-events: none;
      }

      .pp-toast-card {
        pointer-events: auto;
        background: rgba(18, 18, 22, 0.95);
        backdrop-filter: blur(16px);
        -webkit-backdrop-filter: blur(16px);
        color: #ffffff;
        border: 1px solid rgba(255, 255, 255, 0.12);
        border-radius: 20px;
        padding: 18px;
        width: 320px;
        max-width: calc(100vw - 40px);
        box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.7);
        position: relative;
        opacity: 0;
        transform: translateY(20px) scale(0.95);
        transition: all 0.5s cubic-bezier(0.16, 1, 0.3, 1);
      }

      .pp-toast-card.pp-visible {
        opacity: 1;
        transform: translateY(0) scale(1);
      }

      .pp-close-btn {
        position: absolute;
        top: 12px;
        right: 12px;
        background: rgba(255, 255, 255, 0.08);
        border: none;
        color: #a1a1aa;
        width: 24px;
        height: 24px;
        border-radius: 50%;
        font-size: 12px;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: all 0.2s;
        z-index: 10;
      }
      .pp-close-btn:hover { background: rgba(255, 255, 255, 0.2); color: #ffffff; }

      .pp-badge {
        display: inline-flex;
        align-items: center;
        gap: 4px;
        font-size: 10px;
        color: #22c55e;
        font-weight: 700;
        margin-bottom: 8px;
        text-transform: uppercase;
        letter-spacing: 0.5px;
      }

      .pp-header {
        display: flex;
        align-items: center;
        gap: 12px;
        margin-bottom: 8px;
      }

      .pp-avatar {
        width: 42px;
        height: 42px;
        border-radius: 50%;
        object-fit: cover;
        border: 2px solid #3b82f6;
        background: #27272a;
      }

      .pp-info h4 {
        margin: 0;
        font-size: 14px;
        font-weight: 700;
        color: #ffffff;
        letter-spacing: -0.3px;
      }

      .pp-info p {
        margin: 2px 0 0 0;
        font-size: 11px;
        color: #a1a1aa;
      }

      .pp-stars {
        color: #fbbf24;
        font-size: 14px;
        margin-bottom: 8px;
        letter-spacing: 1px;
      }

      .pp-text {
        margin: 0 0 8px 0;
        font-size: 13px;
        line-height: 1.45;
        color: #e4e4e7;
        word-break: break-word;
      }

      /* Swipeable Media Gallery */
      .pp-gallery-wrapper {
        margin-top: 10px;
        position: relative;
      }

      .pp-gallery-scroll {
        display: flex;
        gap: 8px;
        overflow-x: auto;
        scroll-snap-type: x mandatory;
        -webkit-overflow-scrolling: touch;
        border-radius: 12px;
        scrollbar-width: none;
      }
      .pp-gallery-scroll::-webkit-scrollbar { display: none; }

      .pp-slide {
        flex: 0 0 100%;
        scroll-snap-align: start;
        border-radius: 12px;
        overflow: hidden;
        background: #000000;
        height: 180px;
        display: flex;
        align-items: center;
        justify-content: center;
      }

      .pp-slide-img {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }

      .pp-video-player {
        width: 100%;
        height: 100%;
        object-fit: contain;
        outline: none;
      }

      .pp-swipe-hint {
        text-align: right;
        font-size: 10px;
        color: #3b82f6;
        margin-top: 4px;
        font-weight: 600;
      }
    `;
    document.head.appendChild(style);
  }

  async function fetchApprovedTestimonials() {
    try {
      const response = await fetch(
        `${SUPABASE_URL}/rest/v1/testimonials?select=*&status=eq.approved&order=created_at.desc&limit=10`,
        {
          headers: {
            apikey: SUPABASE_ANON_KEY,
            Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
          },
        }
      );

      const data = await response.json();
      if (data && data.length > 0) {
        testimonials = data;
        initWidget();
      }
    } catch (error) {
      console.error("ProofPulse Widget Error:", error);
    }
  }

  function renderCard(item) {
    const stars = "★".repeat(item.rating || 5) + "☆".repeat(5 - (item.rating || 5));
    const items = item.media_items || [];
    
    // Legacy single media compatibility
    if (items.length === 0 && item.media_url) {
      items.push({ url: item.media_url, type: item.media_type || 'image' });
    }

    let mediaGalleryHTML = '';
    if (items.length > 0) {
      const slides = items.map(m => {
        if (m.type === 'video') {
          return `<div class="pp-slide"><video class="pp-video-player" src="${m.url}" controls playsinline preload="metadata"></video></div>`;
        }
        return `<div class="pp-slide"><img class="pp-slide-img" src="${m.url}" alt="Customer photo" /></div>`;
      }).join('');

      mediaGalleryHTML = `
        <div class="pp-gallery-wrapper">
          <div class="pp-gallery-scroll">${slides}</div>
          ${items.length > 1 ? `<div class="pp-swipe-hint">👈 Swipe for more (${items.length})</div>` : ''}
        </div>
      `;
    }

    return `
      <button class="pp-close-btn" onclick="window.closeProofPulseToast()">✕</button>
      <div class="pp-badge">✓ Verified Buyer</div>
      <div class="pp-header">
        <img class="pp-avatar" src="${item.avatar_url || 'https://via.placeholder.com/150'}" alt="${item.customer_name}">
        <div class="pp-info">
          <h4>${item.customer_name}</h4>
          <p>${item.business_name || 'Verified Customer'}</p>
        </div>
      </div>
      <div class="pp-stars">${stars}</div>
      <p class="pp-text">"${item.testimonial_text}"</p>
      ${mediaGalleryHTML}
    `;
  }

  function initWidget() {
    injectStyles();

    let root = document.getElementById('proofpulse-widget-root');
    if (!root) {
      root = document.createElement('div');
      root.id = 'proofpulse-widget-root';
      document.body.appendChild(root);
    }

    const card = document.createElement('div');
    card.className = 'pp-toast-card';
    card.id = 'proofpulse-toast';
    root.appendChild(card);

    window.closeProofPulseToast = function() {
      card.classList.remove('pp-visible');
      if (rotationInterval) clearInterval(rotationInterval);
    };

    function showNextTestimonial() {
      if (testimonials.length === 0) return;

      card.classList.remove('pp-visible');

      setTimeout(() => {
        const item = testimonials[currentIndex];
        card.innerHTML = renderCard(item);
        card.classList.add('pp-visible');

        currentIndex = (currentIndex + 1) % testimonials.length;
      }, 400);
    }

    // Show first testimonial
    showNextTestimonial();

    // Rotate testimonials every 7 seconds if more than 1 available
    if (testimonials.length > 1) {
      rotationInterval = setInterval(showNextTestimonial, 7000);
    }
  }

  // Run when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', fetchApprovedTestimonials);
  } else {
    fetchApprovedTestimonials();
  }
})();
