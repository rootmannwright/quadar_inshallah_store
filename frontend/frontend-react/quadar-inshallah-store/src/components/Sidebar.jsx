import { useState } from 'react'
import './sidebar.css'

export default function Sidebar() {
  const [open, setOpen] = useState(false)

  return (
    <>
      {/* Open */}
      <button className="filter-btn" onClick={() => setOpen(true)}>
        Menu
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
              <a href="">Novidades</a>
            </label>
          </li>
          <li>
            <label>
              <a href="">Promoções</a>
            </label>
          </li>
          <li>
            <label>
              <a href="">Mais vendidos</a>
            </label>
          </li>
          <li>
            <label>
              <a href="">Parceiros</a>
            </label>
          </li>
        </ul>
      </aside>
    </>
  )
}