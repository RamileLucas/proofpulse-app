const SUPABASE_URL = "https://udctjyetnervitwkjhib.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_DJMt-u-HyH0NG2AOAsriaQ_4PZpr9YC";

async function fetchAndRenderTestimonial() {
  try {
    const response = await fetch(
      `${SUPABASE_URL}/rest/v1/testimonials?select=*&status=eq.approved&order=created_at.desc&limit=1`,
      {
        headers: {
          apikey: SUPABASE_ANON_KEY,
          Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
        },
      }
    );

    const data = await response.json();
    if (!data || data.length === 0) return;

    const t = data[0];
    const stars = "★".repeat(t.rating || 5) + "☆".repeat(5 - (t.rating || 5));

    // Define o conteúdo de mídia (Imagem vs Vídeo)
    let mediaHTML = '';
    if (t.media_type === 'video' && t.media_url) {
      mediaHTML = `<video class="pp-video-player" src="${t.media_url}" controls playsinline preload="metadata"></video>`;
    }

    const widgetContainer = document.createElement("div");
    widgetContainer.id = "proofpulse-widget";
    widgetContainer.innerHTML = `
      <style>
        #proofpulse-widget {
          position: fixed;
          bottom: 20px;
          left: 20px;
          z-index: 999999;
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
          animation: proofpulse-slide-in 0.5s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .pp-card {
          background: rgba(18, 18, 22, 0.95);
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
          color: #ffffff;
          border: 1px solid rgba(255, 255, 255, 0.12);
          border-radius: 18px;
          padding: 18px;
          width: 320px;
          max-width: calc(100vw - 40px);
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.6);
          position: relative;
        }
        .pp-close {
          position: absolute;
          top: 10px;
          right: 12px;
          background: rgba(255, 255, 255, 0.08);
          border: none;
          color: #a1a1aa;
          width: 26px;
          height: 26px;
          border-radius: 50%;
          font-size: 14px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s;
        }
        .pp-close:hover { background: rgba(255, 255, 255, 0.2); color: #fff; }
        .pp-header {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 10px;
        }
        .pp-avatar {
          width: 44px;
          height: 44px;
          border-radius: 50%;
          object-fit: cover;
          border: 2px solid #3b82f6;
        }
        .pp-info h4 {
          margin: 0;
          font-size: 15px;
          font-weight: 700;
          color: #ffffff;
          letter-spacing: -0.3px;
        }
        .pp-info p {
          margin: 2px 0 0 0;
          font-size: 12px;
          color: #a1a1aa;
        }
        .pp-stars {
          color: #fbbf24;
          font-size: 15px;
          margin-bottom: 8px;
          letter-spacing: 1px;
        }
        .pp-text {
          margin: 0 0 10px 0;
          font-size: 13.5px;
          line-height: 1.45;
          color: #e4e4e7;
        }
        .pp-video-player {
          width: 100%;
          border-radius: 12px;
          margin-top: 8px;
          background: #000;
          max-height: 180px;
          outline: none;
        }
        .pp-badge {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          font-size: 10px;
          color: #22c55e;
          font-weight: 600;
          margin-bottom: 6px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        @keyframes proofpulse-slide-in {
          from { transform: translateY(80px) scale(0.95); opacity: 0; }
          to { transform: translateY(0) scale(1); opacity: 1; }
        }
      </style>
      <div class="pp-card">
        <button class="pp-close" onclick="document.getElementById('proofpulse-widget').remove()">✕</button>
        <div class="pp-badge">✓ Verified Customer</div>
        <div class="pp-header">
          <img class="pp-avatar" src="${t.avatar_url || 'https://via.placeholder.com/150'}" alt="${t.customer_name}">
          <div class="pp-info">
            <h4>${t.customer_name}</h4>
            <p>${t.business_name || ''}</p>
          </div>
        </div>
        <div class="pp-stars">${stars}</div>
        <p class="pp-text">"${t.testimonial_text}"</p>
        ${mediaHTML}
      </div>
    `;

    document.body.appendChild(widgetContainer);
  } catch (error) {
    console.error("ProofPulse Widget Error:", error);
  }
}

fetchAndRenderTestimonial();
