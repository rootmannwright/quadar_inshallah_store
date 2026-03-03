import Header from "../components/Header"
import Footer from "../components/Footer"
import Breadcrumbs from "../components/Breadcrumbs"
import { Outlet, useLocation } from "react-router-dom"

export default function PublicLayout() {

  const location = useLocation()

  const hideBreadcrumb = location.pathname === "/login"
  return (
    <>
      <Header />
      <main style={{ paddingTop: "var(--header-height)" }} className="min-h-screen">

        { !hideBreadcrumb && <Breadcrumbs />}
        <Outlet />
      </main>
      <Footer />
    </>
  )
}