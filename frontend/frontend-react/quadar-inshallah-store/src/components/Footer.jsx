import '../pages/footer.css'
import fotoPerfil from '../assets/foto-perfil.jpg'

function Footer() {
  return (
    <footer className="footer">
      <div className="footer-content">
        <p>&copy; 2026 Quadar Inshallah Co. & Records. Todos os direitos reservados.</p>
        <p>Desenvolvido por Quadar Inshallah Co. & Records Team.</p>
        <div className="images">
          <img src="../public/logos/felix-quadar-logo.png" alt="Quadar Inshallah Co. & Records Logo" className="footer_logo" />
        </div>
        <div className="social">
        </div>
      </div>

      <div className=" author-content bg-white-100 rounded-2xl p-6 max-w-md">

        <div className="flex items-center gap-4">

          <img
            src={fotoPerfil}
            alt="Lucas Marques"
            className="perfil-icon w-16 h-16 rounded-full object-cover"
          />

          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              Lucas M. Nascimento
            </h3>

            <p className="text-gray-500 text-sm">
              Founder and C.E.O at Quadar Inshallah Co. & Records
            </p>
          </div>

        </div>

      </div>
    </footer>
  )
};

export default Footer;