// pages/Account.jsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthProvider";

/* =====================
   ICONS
===================== */
const Icon = ({ d, size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d={d} />
  </svg>
);

const ICONS = {
  user:    "M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z",
  orders:  "M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2M9 5a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2M9 5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2",
  address: "M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0zM12 10a1 1 0 1 0 0-2 1 1 0 0 0 0 2z",
  lock:    "M19 11H5a2 2 0 0 0-2 2v7a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7a2 2 0 0 0-2-2zM7 11V7a5 5 0 0 1 10 0v4",
  signout: "M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9",
  edit:    "M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z",
  check:   "M20 6L9 17l-5-5",
  plus:    "M12 5v14M5 12h14",
  sun:     "M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42M12 5a7 7 0 1 0 0 14A7 7 0 0 0 12 5z",
  moon:    "M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z",
};

/* =====================
   MOCK DATA
===================== */
const MOCK_ORDERS = [
  { id: "#QI-4821", date: "12 Jun 2025", status: "Delivered",  total: "R$ 349,90", items: 3, img: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=80&h=80&fit=crop" },
  { id: "#QI-4756", date: "28 Mai 2025", status: "Shipped",    total: "R$ 189,00", items: 1, img: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=80&h=80&fit=crop" },
  { id: "#QI-4630", date: "02 Mai 2025", status: "Delivered",  total: "R$ 520,00", items: 2, img: "https://images.unsplash.com/photo-1585386959984-a4155224a1ad?w=80&h=80&fit=crop" },
];

const STATUS_STYLE = {
  Delivered:  { bg: "#d1fae5", color: "#065f46", label: "Entregue" },
  Shipped:    { bg: "#dbeafe", color: "#1e40af", label: "Em trânsito" },
  Processing: { bg: "#fef9c3", color: "#854d0e", label: "Processando" },
};

/* =====================
   TABS
===================== */
const TABS = [
  { id: "profile",  label: "Perfil",    icon: ICONS.user    },
  { id: "orders",   label: "Pedidos",   icon: ICONS.orders  },
  { id: "address",  label: "Endereços", icon: ICONS.address },
  { id: "security", label: "Segurança", icon: ICONS.lock    },
];

/* =====================
   SUB-PAGES
===================== */
function ProfileTab({ user }) {
  const [editing, setEditing] = useState(false);
  const [name,  setName]  = useState(user?.name  || "");
  const [email, setEmail] = useState(user?.email || "");
  const [saved, setSaved] = useState(false);

  function handleSave(e) {
    e.preventDefault();
    setSaved(true);
    setEditing(false);
    setTimeout(() => setSaved(false), 3000);
  }

  return (
    <div className="tab-content">
      <div className="section-header">
        <div>
          <h2 className="section-title">Meu Perfil</h2>
          <p className="section-sub">Gerencie suas informações pessoais</p>
        </div>
        {!editing && (
          <button className="btn-ghost" onClick={() => setEditing(true)}>
            <Icon d={ICONS.edit} size={16} /> Editar
          </button>
        )}
      </div>

      {saved && (
        <div className="toast">
          <Icon d={ICONS.check} size={16} /> Perfil atualizado com sucesso
        </div>
      )}

      <div className="profile-card">
        <div className="avatar-wrap">
          <div className="avatar-circle">
            {(user?.name || "U")[0].toUpperCase()}
          </div>
          <div className="avatar-info">
            <span className="avatar-name">{user?.name || "Usuário"}</span>
            <span className="avatar-role">{user?.role === "admin" ? "Administrador" : "Cliente"}</span>
          </div>
        </div>

        {editing ? (
          <form className="edit-form" onSubmit={handleSave}>
            <div className="field-row">
              <div className="field-group">
                <label>Nome completo</label>
                <input value={name} onChange={e => setName(e.target.value)} placeholder="Seu nome" />
              </div>
              <div className="field-group">
                <label>E-mail</label>
                <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="seu@email.com" />
              </div>
            </div>
            <div className="form-actions">
              <button type="button" className="btn-ghost" onClick={() => setEditing(false)}>Cancelar</button>
              <button type="submit" className="btn-primary">Salvar alterações</button>
            </div>
          </form>
        ) : (
          <div className="info-grid">
            <div className="info-item">
              <span className="info-label">Nome</span>
              <span className="info-value">{user?.name || "—"}</span>
            </div>
            <div className="info-item">
              <span className="info-label">E-mail</span>
              <span className="info-value">{user?.email || "—"}</span>
            </div>
            <div className="info-item">
              <span className="info-label">Conta criada</span>
              <span className="info-value">Janeiro 2025</span>
            </div>
            <div className="info-item">
              <span className="info-label">Status</span>
              <span className="info-value badge-active">Ativo</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function OrdersTab() {
  return (
    <div className="tab-content">
      <div className="section-header">
        <div>
          <h2 className="section-title">Meus Pedidos</h2>
          <p className="section-sub">{MOCK_ORDERS.length} pedidos realizados</p>
        </div>
      </div>
      <div className="orders-list">
        {MOCK_ORDERS.map((order) => {
          const s = STATUS_STYLE[order.status] || STATUS_STYLE.Processing;
          return (
            <div className="order-card" key={order.id}>
              <img src={order.img} alt="produto" className="order-img" />
              <div className="order-info">
                <div className="order-top">
                  <span className="order-id">{order.id}</span>
                  <span className="order-status" style={{ background: s.bg, color: s.color }}>{s.label}</span>
                </div>
                <span className="order-date">{order.date} · {order.items} {order.items === 1 ? "item" : "itens"}</span>
              </div>
              <div className="order-right">
                <span className="order-total">{order.total}</span>
                <button className="btn-ghost btn-sm">Ver detalhes</button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function AddressTab() {
  const [adding, setAdding] = useState(false);
  const [addresses] = useState([
    { id: 1, label: "Casa", street: "Rua das Flores, 123", city: "São Paulo, SP", zip: "01310-100", default: true },
  ]);

  return (
    <div className="tab-content">
      <div className="section-header">
        <div>
          <h2 className="section-title">Endereços</h2>
          <p className="section-sub">Gerencie seus endereços de entrega</p>
        </div>
        <button className="btn-primary btn-sm" onClick={() => setAdding(true)}>
          <Icon d={ICONS.plus} size={15} /> Novo endereço
        </button>
      </div>
      <div className="address-grid">
        {addresses.map((addr) => (
          <div className="address-card" key={addr.id}>
            {addr.default && <span className="default-badge">Principal</span>}
            <span className="addr-label">{addr.label}</span>
            <p className="addr-street">{addr.street}</p>
            <p className="addr-city">{addr.city}</p>
            <p className="addr-zip">CEP {addr.zip}</p>
            <div className="addr-actions">
              <button className="btn-ghost btn-sm">Editar</button>
              {!addr.default && <button className="btn-ghost btn-sm text-danger">Remover</button>}
            </div>
          </div>
        ))}
        {adding && (
          <div className="address-card address-form-card">
            <span className="addr-label">Novo endereço</span>
            <input className="addr-input" placeholder="Rua, número" />
            <input className="addr-input" placeholder="Cidade, Estado" />
            <input className="addr-input" placeholder="CEP" />
            <div className="addr-actions">
              <button className="btn-ghost btn-sm" onClick={() => setAdding(false)}>Cancelar</button>
              <button className="btn-primary btn-sm" onClick={() => setAdding(false)}>Salvar</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function SecurityTab() {
  const [saved, setSaved] = useState(false);
  function handleSubmit(e) {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  }
  return (
    <div className="tab-content">
      <div className="section-header">
        <div>
          <h2 className="section-title">Segurança</h2>
          <p className="section-sub">Atualize sua senha</p>
        </div>
      </div>
      {saved && (
        <div className="toast">
          <Icon d={ICONS.check} size={16} /> Senha alterada com sucesso
        </div>
      )}
      <div className="profile-card">
        <form className="edit-form" onSubmit={handleSubmit}>
          <div className="field-row field-row--col">
            <div className="field-group">
              <label>Senha atual</label>
              <input type="password" placeholder="••••••••" />
            </div>
            <div className="field-group">
              <label>Nova senha</label>
              <input type="password" placeholder="••••••••" />
            </div>
            <div className="field-group">
              <label>Confirmar nova senha</label>
              <input type="password" placeholder="••••••••" />
            </div>
          </div>
          <div className="form-actions">
            <button type="submit" className="btn-primary">Alterar senha</button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* =====================
   DARK MODE TOGGLE
===================== */
function ThemeToggle({ dark, onToggle }) {
  return (
    <button
      className="theme-toggle"
      onClick={onToggle}
      title={dark ? "Modo claro" : "Modo escuro"}
      aria-label={dark ? "Ativar modo claro" : "Ativar modo escuro"}
    >
      <span className={`toggle-track ${dark ? "dark" : ""}`}>
        <span className="toggle-thumb">
          <Icon d={dark ? ICONS.moon : ICONS.sun} size={12} />
        </span>
      </span>
      <span className="toggle-label">{dark ? "Escuro" : "Claro"}</span>
    </button>
  );
}

/* =====================
   MAIN
===================== */
export default function Account() {
  const { user, logout } = useAuth();
  const navigate         = useNavigate();

  const [active,     setActive]     = useState("profile");
  const [mobileOpen, setMobileOpen] = useState(false);
  const [dark,       setDark]       = useState(() => {
    // Persiste preferência no localStorage
    return localStorage.getItem("acc-theme") === "dark";
  });

  useEffect(() => {
    localStorage.setItem("acc-theme", dark ? "dark" : "light");
  }, [dark]);

  function handleLogout() {
    logout();
    navigate("/login");
  }

  function renderTab() {
    switch (active) {
      case "profile":  return <ProfileTab  user={user} />;
      case "orders":   return <OrdersTab />;
      case "address":  return <AddressTab />;
      case "security": return <SecurityTab />;
      default:         return null;
    }
  }

  const Sidebar = ({ mobile = false }) => (
    <>
      {TABS.map((tab) => (
        <button
          key={tab.id}
          className={`nav-item ${active === tab.id ? "active" : ""}`}
          onClick={() => { setActive(tab.id); if (mobile) setMobileOpen(false); }}
        >
          <Icon d={tab.icon} size={17} />
          {tab.label}
        </button>
      ))}
      <div className="nav-divider" />
      <ThemeToggle dark={dark} onToggle={() => setDark(d => !d)} />
      <div className="nav-divider" />
      <button className="nav-item nav-signout" onClick={handleLogout}>
        <Icon d={ICONS.signout} size={17} />
        Sair da conta
      </button>
    </>
  );

  return (
    <>
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      <link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;500;600;700&family=DM+Sans:wght@300;400;500&display=swap" rel="stylesheet" />

      <style>{`
        /* ─────────────────────────────
           LIGHT MODE (default)
        ───────────────────────────── */
        .acc-root {
          --bg:         #f9f7f4;
          --surface:    #ffffff;
          --surface-2:  #faf9f6;
          --border:     #e8e3db;
          --text-1:     #111111;
          --text-2:     #555555;
          --text-3:     #999999;
          --accent:     #111111;
          --accent-inv: #ffffff;
          --hero-bg1:   #111111;
          --hero-bg2:   #2a2a2a;
          --hero-text:  #ffffff;
          --hero-sub:   #aaaaaa;
          --hero-eye:   #888888;
          --nav-active-bg:   linear-gradient(135deg, #111111, #333333);
          --nav-active-text: #ffffff;
          --nav-hover-bg:    #f0f0f0;
          --btn-primary-bg:  linear-gradient(135deg, #111111, #333333);
          --btn-primary-txt: #ffffff;
          --btn-ghost-hover: #f0f0f0;
          --btn-ghost-bd:    #e0e0e0;
          --danger:     #dc2626;
          --radius:     14px;
          --shadow:     0 1px 3px rgba(0,0,0,.06), 0 4px 16px rgba(0,0,0,.06);
          --transition: background .3s, color .3s, border-color .3s;

          font-family: 'DM Sans', sans-serif;
          background:  var(--bg);
          min-height:  100vh;
          color:       var(--text-1);
          transition:  var(--transition);
        }

        /* ─────────────────────────────
           DARK MODE
        ───────────────────────────── */
        .acc-root.dark-mode {
          --bg:         #0f0f0f;
          --surface:    #1a1a1a;
          --surface-2:  #222222;
          --border:     #2e2e2e;
          --text-1:     #f0f0f0;
          --text-2:     #aaaaaa;
          --text-3:     #666666;
          --accent:     #f0f0f0;
          --accent-inv: #111111;
          --hero-bg1:   #000000;
          --hero-bg2:   #1a1a1a;
          --hero-text:  #f0f0f0;
          --hero-sub:   #777777;
          --hero-eye:   #555555;
          --nav-active-bg:   linear-gradient(135deg, #f0f0f0, #cccccc);
          --nav-active-text: #111111;
          --nav-hover-bg:    #2a2a2a;
          --btn-primary-bg:  linear-gradient(135deg, #f0f0f0, #cccccc);
          --btn-primary-txt: #111111;
          --btn-ghost-hover: #2a2a2a;
          --btn-ghost-bd:    #3a3a3a;
        }

        /* ─────────────────────────────
           HERO
        ───────────────────────────── */
        .acc-hero {
          background: linear-gradient(135deg, var(--hero-bg1) 0%, var(--hero-bg2) 100%);
          padding: 48px 0 80px;
          position: relative;
          overflow: hidden;
          transition: background .3s;
        }
        .acc-hero::before {
          content: '';
          position: absolute; inset: 0;
          background: url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none'%3E%3Cg fill='%23ffffff' fill-opacity='0.03'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E");
        }
        .acc-hero-inner {
          max-width: 1100px;
          margin: 0 auto;
          padding: 0 32px;
          position: relative;
          z-index: 1;
        }
        .acc-eyebrow {
          font-size: 11px;
          letter-spacing: .2em;
          text-transform: uppercase;
          color: var(--hero-eye);
          margin-bottom: 8px;
        }
        .acc-hero-name {
          font-family: 'Cormorant Garamond', serif;
          font-size: clamp(32px, 5vw, 52px);
          font-weight: 600;
          color: var(--hero-text);
          line-height: 1.1;
          margin: 0 0 6px;
        }
        .acc-hero-email {
          font-size: 14px;
          color: var(--hero-sub);
        }

        /* ─────────────────────────────
           LAYOUT
        ───────────────────────────── */
        .acc-body {
          max-width: 1100px;
          margin: -44px auto 64px;
          padding: 0 32px;
          display: grid;
          grid-template-columns: 240px 1fr;
          gap: 24px;
          position: relative;
          z-index: 2;
        }

        /* ─────────────────────────────
           SIDEBAR
        ───────────────────────────── */
        .acc-sidebar {
          background: var(--surface);
          border: 1px solid var(--border);
          border-radius: var(--radius);
          box-shadow: var(--shadow);
          padding: 8px;
          height: fit-content;
          position: sticky;
          top: 24px;
          transition: var(--transition);
        }
        .nav-item {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 11px 16px;
          border-radius: 10px;
          cursor: pointer;
          font-size: 14px;
          font-weight: 450;
          color: var(--text-2);
          transition: all .2s;
          border: none;
          background: transparent;
          width: 100%;
          text-align: left;
        }
        .nav-item:hover { background: var(--nav-hover-bg); color: var(--text-1); }
        .nav-item.active {
          background: var(--nav-active-bg);
          color: var(--nav-active-text);
        }
        .nav-divider { height: 1px; background: var(--border); margin: 8px 4px; }
        .nav-signout { color: var(--danger) !important; }
        .nav-signout:hover { background: #fef2f2 !important; }
        .dark-mode .nav-signout:hover { background: #2a1111 !important; }

        /* ─────────────────────────────
           THEME TOGGLE
        ───────────────────────────── */
        .theme-toggle {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 11px 16px;
          border-radius: 10px;
          cursor: pointer;
          font-size: 14px;
          font-weight: 450;
          color: var(--text-2);
          border: none;
          background: transparent;
          width: 100%;
          text-align: left;
          transition: all .2s;
        }
        .theme-toggle:hover { background: var(--nav-hover-bg); color: var(--text-1); }
        .toggle-track {
          width: 36px; height: 20px;
          background: var(--border);
          border-radius: 20px;
          position: relative;
          transition: background .3s;
          flex-shrink: 0;
        }
        .toggle-track.dark { background: var(--text-1); }
        .toggle-thumb {
          position: absolute;
          top: 3px; left: 3px;
          width: 14px; height: 14px;
          background: var(--surface);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: transform .3s, background .3s;
          color: var(--text-2);
        }
        .toggle-track.dark .toggle-thumb {
          transform: translateX(16px);
          background: #111111;
          color: #f0f0f0;
        }
        .toggle-label { font-size: 13px; }

        /* ─────────────────────────────
           MAIN PANEL
        ───────────────────────────── */
        .acc-main {
          background: var(--surface);
          border: 1px solid var(--border);
          border-radius: var(--radius);
          box-shadow: var(--shadow);
          min-height: 500px;
          overflow: hidden;
          transition: var(--transition);
        }
        .tab-content { padding: 32px; }

        .section-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 28px;
          padding-bottom: 20px;
          border-bottom: 1px solid var(--border);
        }
        .section-title {
          font-family: 'Cormorant Garamond', serif;
          font-size: 26px;
          font-weight: 600;
          margin: 0 0 4px;
          color: var(--text-1);
        }
        .section-sub { font-size: 13px; color: var(--text-2); margin: 0; }

        /* ─────────────────────────────
           PROFILE CARD
        ───────────────────────────── */
        .profile-card {
          background: var(--surface-2);
          border: 1px solid var(--border);
          border-radius: 12px;
          padding: 28px;
          transition: var(--transition);
        }
        .avatar-wrap {
          display: flex;
          align-items: center;
          gap: 16px;
          margin-bottom: 28px;
          padding-bottom: 24px;
          border-bottom: 1px solid var(--border);
        }
        .avatar-circle {
          width: 56px; height: 56px;
          border-radius: 50%;
          background: linear-gradient(135deg, #111111, #444444);
          display: flex;
          align-items: center;
          justify-content: center;
          font-family: 'Cormorant Garamond', serif;
          font-size: 24px;
          font-weight: 600;
          color: #fff;
          flex-shrink: 0;
        }
        .dark-mode .avatar-circle {
          background: linear-gradient(135deg, #f0f0f0, #aaaaaa);
          color: #111;
        }
        .avatar-name { display: block; font-weight: 500; font-size: 16px; color: var(--text-1); }
        .avatar-role {
          font-size: 12px;
          color: var(--text-3);
          text-transform: uppercase;
          letter-spacing: .08em;
        }
        .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
        .info-item { display: flex; flex-direction: column; gap: 4px; }
        .info-label {
          font-size: 11px;
          letter-spacing: .1em;
          text-transform: uppercase;
          color: var(--text-3);
        }
        .info-value { font-size: 15px; font-weight: 450; color: var(--text-1); }
        .badge-active {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          font-size: 13px;
          color: #059669;
        }
        .badge-active::before {
          content: '';
          width: 8px; height: 8px;
          border-radius: 50%;
          background: #10b981;
          display: inline-block;
        }

        /* ─────────────────────────────
           FORM
        ───────────────────────────── */
        .edit-form { display: flex; flex-direction: column; gap: 20px; }
        .field-row { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
        .field-row--col { grid-template-columns: 1fr; }
        .field-group { display: flex; flex-direction: column; gap: 6px; }
        .field-group label {
          font-size: 11px;
          letter-spacing: .1em;
          text-transform: uppercase;
          color: var(--text-2);
        }
        .field-group input, .addr-input {
          padding: 10px 14px;
          border: 1px solid var(--border);
          border-radius: 8px;
          font-family: inherit;
          font-size: 14px;
          background: var(--surface);
          color: var(--text-1);
          outline: none;
          transition: border-color .2s, background .3s, color .3s;
          width: 100%;
          box-sizing: border-box;
        }
        .field-group input:focus, .addr-input:focus { border-color: var(--text-1); }
        .form-actions { display: flex; gap: 10px; justify-content: flex-end; }

        /* ─────────────────────────────
           BUTTONS
        ───────────────────────────── */
        .btn-primary {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 10px 20px;
          background: var(--btn-primary-bg);
          color: var(--btn-primary-txt);
          border: none;
          border-radius: 8px;
          font-family: inherit;
          font-size: 13px;
          font-weight: 500;
          cursor: pointer;
          transition: opacity .2s, transform .15s;
        }
        .btn-primary:hover { opacity: .85; transform: translateY(-1px); }
        .btn-ghost {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 10px 16px;
          background: transparent;
          color: var(--text-2);
          border: 1px solid var(--btn-ghost-bd);
          border-radius: 8px;
          font-family: inherit;
          font-size: 13px;
          cursor: pointer;
          transition: all .2s;
        }
        .btn-ghost:hover { background: var(--btn-ghost-hover); color: var(--text-1); }
        .btn-sm { padding: 7px 14px; font-size: 12px; }
        .text-danger { color: var(--danger) !important; }

        /* ─────────────────────────────
           TOAST
        ───────────────────────────── */
        .toast {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 12px 18px;
          background: #d1fae5;
          color: #065f46;
          border-radius: 8px;
          font-size: 13px;
          margin-bottom: 20px;
        }
        .dark-mode .toast { background: #052e16; color: #6ee7b7; }

        /* ─────────────────────────────
           ORDERS
        ───────────────────────────── */
        .orders-list { display: flex; flex-direction: column; gap: 12px; }
        .order-card {
          display: flex;
          align-items: center;
          gap: 16px;
          padding: 18px 20px;
          border: 1px solid var(--border);
          border-radius: 12px;
          background: var(--surface-2);
          transition: box-shadow .2s, var(--transition);
        }
        .order-card:hover { box-shadow: 0 4px 16px rgba(0,0,0,.1); }
        .order-img {
          width: 56px; height: 56px;
          border-radius: 8px;
          object-fit: cover;
          flex-shrink: 0;
        }
        .order-info { flex: 1; display: flex; flex-direction: column; gap: 4px; }
        .order-top  { display: flex; align-items: center; gap: 10px; }
        .order-id   { font-weight: 500; font-size: 14px; color: var(--text-1); }
        .order-status {
          padding: 3px 10px;
          border-radius: 20px;
          font-size: 11px;
          font-weight: 500;
        }
        .order-date  { font-size: 12px; color: var(--text-3); }
        .order-right { display: flex; flex-direction: column; align-items: flex-end; gap: 8px; }
        .order-total { font-weight: 600; font-size: 15px; color: var(--text-1); }

        /* ─────────────────────────────
           ADDRESSES
        ───────────────────────────── */
        .address-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
          gap: 16px;
        }
        .address-card {
          padding: 22px;
          border: 1px solid var(--border);
          border-radius: 12px;
          background: var(--surface-2);
          display: flex;
          flex-direction: column;
          gap: 6px;
          position: relative;
          transition: var(--transition);
        }
        .default-badge {
          position: absolute;
          top: 14px; right: 14px;
          background: var(--text-1);
          color: var(--surface);
          font-size: 10px;
          letter-spacing: .08em;
          text-transform: uppercase;
          padding: 3px 8px;
          border-radius: 20px;
        }
        .addr-label { font-weight: 600; font-size: 14px; margin-bottom: 4px; color: var(--text-1); }
        .addr-street, .addr-city, .addr-zip { font-size: 13px; color: var(--text-2); margin: 0; }
        .addr-actions { display: flex; gap: 8px; margin-top: 12px; }
        .address-form-card { background: var(--surface); border-style: dashed; }

        /* ─────────────────────────────
           MOBILE
        ───────────────────────────── */
        .mobile-header {
          display: none;
          padding: 16px 24px;
          border-bottom: 1px solid var(--border);
          align-items: center;
          justify-content: space-between;
        }
        .mobile-tab-label { font-weight: 500; font-size: 14px; color: var(--text-1); }
        .mobile-toggle {
          background: transparent;
          border: 1px solid var(--border);
          border-radius: 6px;
          padding: 6px 10px;
          cursor: pointer;
          font-size: 12px;
          color: var(--text-2);
        }
        .mobile-drawer {
          display: none;
          padding: 12px 16px;
          border-bottom: 1px solid var(--border);
          background: var(--surface-2);
        }

        @media (max-width: 768px) {
          .acc-body {
            grid-template-columns: 1fr;
            margin-top: -28px;
            padding: 0 16px;
            gap: 16px;
          }
          .acc-sidebar { display: none; }
          .mobile-header { display: flex; }
          .mobile-drawer { display: block; }
          .mobile-drawer.hidden { display: none; }
          .info-grid { grid-template-columns: 1fr; }
          .field-row { grid-template-columns: 1fr; }
          .order-right { display: none; }
          .acc-hero { padding: 32px 0 60px; }
          .tab-content { padding: 20px; }
          .profile-card { padding: 20px; }
          .address-grid { grid-template-columns: 1fr; }
        }
      `}</style>

      <div className={`acc-root${dark ? " dark-mode" : ""}`}>

        {/* HERO */}
        <div className="acc-hero">
          <div className="acc-hero-inner">
            <p className="acc-eyebrow">Minha conta</p>
            <h1 className="acc-hero-name">{user?.name || "Minha Conta"}</h1>
            <p className="acc-hero-email">{user?.email}</p>
          </div>
        </div>

        {/* BODY */}
        <div className="acc-body">

          {/* SIDEBAR — desktop */}
          <aside className="acc-sidebar">
            <Sidebar />
          </aside>

          {/* MAIN */}
          <main className="acc-main">
            {/* Mobile nav */}
            <div className="mobile-header">
              <span className="mobile-tab-label">
                {TABS.find(t => t.id === active)?.label}
              </span>
              <button className="mobile-toggle" onClick={() => setMobileOpen(v => !v)}>
                {mobileOpen ? "Fechar ▲" : "Menu ▼"}
              </button>
            </div>
            <div className={`mobile-drawer ${mobileOpen ? "" : "hidden"}`}>
              <Sidebar mobile />
            </div>

            {renderTab()}
          </main>

        </div>
      </div>
    </>
  );
}