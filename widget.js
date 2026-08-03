// CONFIGURAÇÃO DO SUPABASE (Substitua com as suas chaves da Parte 3)
const SUPABASE_URL = "https://udctjyetnervitwkjhib.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_DJMt-u-HyH0NG2AOAsriaQ_4PZpr9YC";

async function fetchAndRenderTestimonial() {
  try {
    // Busca 1 depoimento aprovado no Supabase via API REST pública
    const response = await fetch(
      `${SUPABASE_URL}/rest/v1/testimonials?select=*&status=eq.approved&limit=1`,
      {
        headers: {
          apikey: SUPABASE_ANON_KEY,
          Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
        },
      }
    );

    const data = await response.json();

    // Se não encontrou nenhum depoimento no banco, não exibe nada
    if (!data || data.length === 0) return;

    const t = data[0]; // Pega o primeiro depoimento retornado

    // Cria as estrelas
    const stars = "★".repeat(t.rating || 5) + "☆".repeat(5 - (t.rating || 5));

    // Cria a estrutura HTML do widget flutuante
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
          animation: proofpulse-slide-in 0.4s ease-out;
        }
        .pp-card {
          background: #18181b;
          color: #ffffff;
          border: 1px solid #27272a;
          border-radius: 12px;
          padding: 16px;
          width: 320px;
          box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.5);
          position: relative;
        }
        .pp-close {
          position: absolute;
          top: 8px;
          right: 12px;
          background: transparent;
          border: none;
          color: #a1a1aa;
          font-size: 16px;
          cursor: pointer;
        }
        .pp-close:hover { color: #ffffff; }
        .pp-header {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 8px;
        }
        .pp-avatar {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          object-fit: cover;
        }
        .pp-info h4 {
          margin: 0;
          font-size: 14px;
          font-weight: 600;
          color: #f4f4f5;
        }
        .pp-info p {
          margin: 0;
          font-size: 12px;
          color: #a1a1aa;
        }
        .pp-stars {
          color: #fbbf24;
          font-size: 14px;
          margin-bottom: 6px;
        }
        .pp-text {
          margin: 0;
          font-size: 13px;
          line-height: 1.4;
          color: #d4d4d8;
        }
        @keyframes proofpulse-slide-in {
          from { transform: translateY(100px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
      </style>
      <div class="pp-card">
        <button class="pp-close" onclick="document.getElementById('proofpulse-widget').remove()">×</button>
        <div class="pp-header">
          <img class="pp-avatar" src="${t.avatar_url || 'https://via.placeholder.com/150'}" alt="${t.customer_name}">
          <div class="pp-info">
            <h4>${t.customer_name}</h4>
            <p>${t.business_name || ''}</p>
          </div>
        </div>
        <div class="pp-stars">${stars}</div>
        <p class="pp-text">"${t.testimonial_text}"</p>
      </div>
    `;

    document.body.appendChild(widgetContainer);
  } catch (error) {
    console.error("ProofPulse Widget Error:", error);
  }
}

// Executa a busca assim que o script for carregado
fetchAndRenderTestimonial();