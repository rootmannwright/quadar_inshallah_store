import Header from "../components/Header"
import Footer from "../components/Footer"

export default function PublicLayout({ children }) {
  return (
    <>
      <Header />
      <main className="pt-[120px] min-h-screen">
        {children}
      </main>
      <Footer />
    </>
  )
}