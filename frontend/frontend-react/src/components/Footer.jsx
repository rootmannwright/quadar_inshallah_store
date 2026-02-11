import QuadarFooterLogo from '../assets/images/logo/projeto_quadar_inshallah_logotipo_elipse_reformated_allwhite_transparency.png'
import '../styles/footer.css'
function Footer() {
    return (
        <footer className="footer">
        <div className="footer-content">
          <p>&copy; 2026 Quadar Inshallah Co. & Records. Todos os direitos reservados.</p>
          <p>Desenvolvido por Quadar Inshallah Co. & Records Team.</p>
          <div className="images">
            <img src={QuadarFooterLogo} alt="Quadar Inshallah Co. & Records Logo" className="footer_logo" />
          </div>
          <div className="social">
          </div>
        </div>
      </footer>
    )
};

export default Footer;