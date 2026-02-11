import { useState } from 'react'
// import './sidebar.css'

export default function Sidebar() {
  const [open, setOpen] = useState(false)

  return (
    <>
      {/* Botão que abre */}
      <button className="filter-btn" onClick={() => setOpen(true)}>
        Abrir filtros
      </button>

      {/* Overlay */}
      {open && <div className="overlay" onClick={() => setOpen(false)} />}

      {/* Sidebar */}
      <aside className={`sidebar ${open ? 'open' : ''}`}>
        <button className="close-btn" onClick={() => setOpen(false)}>
          &times;
        </button>

        <h2>Filtros</h2>

        <ul>
          <li>
            <label>
              <input type="checkbox" /> Novidades
            </label>
          </li>
          <li>
            <label>
              <input type="checkbox" /> Promoções
            </label>
          </li>
          <li>
            <label>
              <input type="checkbox" /> Mais vendidos
            </label>
          </li>
        </ul>
      </aside>
    </>
  )
}