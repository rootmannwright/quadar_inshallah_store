import Header from "../components/Header"
import Footer from "../components/Footer"
import { Outlet } from "react-router-dom"

export default function PublicLayout() {
  return (
    <>
      <Header />
      <main style={{ paddingTop: "var(--header-height)" }} className="min-h-screen">
        <Outlet />
      </main>
      <Footer />
    </>
  )
}