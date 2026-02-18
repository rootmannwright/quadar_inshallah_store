// imports
import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import Sidebar from '../components/Sidebar'
import ScrambleText from '../components/ScrambleText'
import './home.css'
import VideoPlayer from '../components/VideoPlayer'

export default function Home() {
  const [setProducts] = useState([])

  useEffect(() => {
    fetch("http://localhost:3000/api/products")
      .then(res => res.json())
      .then(data => setProducts(data))
      .catch(err => console.error(err))
  }, [])

  return (
      <div className="home">

        {/* ===== Branding ===== */}
        <header className="home-header"><div className="logo">
          <img
            className="logo_img"
            src="../public/logos/logo-letreiro.png"
            alt="Quadar Inshallah Co. & Records Logo"
          />

          <div className='name-logo'>Quadar Inshallah Co. & Records</div>
        </div>

        </header>

        {/* ===== Menu Principal ===== */}
        <nav className="home-menu">
          <ul className="nav-links">
            <li>
              <a href="#">
                <img src="/logos/home.svg" alt="Home" />
                <span>Home</span>
              </a>
            </li>

            <li>
              <a href="#">
                <img src="/logos/stories.svg" alt="Stories" />
                <span>Stories</span>
              </a>
            </li>

            <li>
              <a href="#">
                <img src="/logos/login.svg" alt="Login" />
                <span>Login</span>
              </a>
            </li>

            <li>
              <a href="#">
                <img src="/logos/carrinho.svg" alt="Carrinho" />
                <span>Carrinho</span>
              </a>
            </li>
          </ul>
        </nav>

        {/* ===== Mensagem Institucional ===== */}
        <section className="container_message">
          <Sidebar />

          <ScrambleText text="2026" as="h1" />
          <ScrambleText text="Em breve." as="p" />
          <ScrambleText
            text="A arte move. A fé guia. Inshallah."
            as="p"
          />
        </section>

        <div className="text-center p-10">
          <h1 className="products-title font-bold text-4xl mb-4">Drops Recentes</h1>
          <h1 className="products-subtitle font-bold text-3xl">Quadar Inshallah Co. & Records</h1>
        </div>

 
        <section id="Projects"
          className="products-container w-fit mx-auto grid grid-cols-1 lg:grid-cols-3 md:grid-cols-2 justify-items-center justify-center gap-y-20 gap-x-14 mt-10 mb-5">

          <div className="products w-72 bg-white shadow-md rounded-xl duration-500 hover:scale-105 hover:shadow-xl">
            <a href="#">
              <img src="/images/bag_quadar_inshallah_elipse_icon.jpg"
                alt="Product" className="h-80 w-72 object-cover rounded-t-xl" />
              <div className="px-4 py-3 w-72">
                <span className="text-gray-400 mr-3 uppercase text-xs">Quadar Inshallah Co. & Records</span>
                <p className="text-lg font-bold text-black truncate block capitalize">Nome do Produto</p>
                <div className="flex items-center">
                  <p className="text-lg font-semibold text-black cursor-auto my-3">$100</p>
                  <del>
                    <p className="text-sm text-gray-600 cursor-auto ml-2">$120</p>
                  </del>
                  <div className="ml-auto"><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20"
                    fill="currentColor" className="bi bi-bag-plus" viewBox="0 0 16 16">
                    <path fill-rule="evenodd"
                      d="M8 7.5a.5.5 0 0 1 .5.5v1.5H10a.5.5 0 0 1 0 1H8.5V12a.5.5 0 0 1-1 0v-1.5H6a.5.5 0 0 1 0-1h1.5V8a.5.5 0 0 1 .5-.5z" />
                    <path
                      d="M8 1a2.5 2.5 0 0 1 2.5 2.5V4h-5v-.5A2.5 2.5 0 0 1 8 1zm3.5 3v-.5a3.5 3.5 0 1 0-7 0V4H1v10a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V4h-3.5zM2 5h12v9a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V5z" />
                  </svg></div>
                </div>
              </div>
            </a>
          </div>
          <div class="w-72 bg-white shadow-md rounded-xl duration-500 hover:scale-105 hover:shadow-xl">
            <a href="#">
              <img src="/images/meia_branca_quadar_inshallah_elipse_icon.jpg"
                alt="Product" className="h-80 w-72 object-cover rounded-t-xl" />
              <div className="px-4 py-3 w-72">
                <span className="text-gray-400 mr-3 uppercase text-xs">Quadar Inshallah Co. & Records</span>
                <p className="text-lg font-bold text-black truncate block capitalize">Nome do Produto</p>
                <div className="flex items-center">
                  <p className="text-lg font-semibold text-black cursor-auto my-3">$80</p>
                  <del>
                    <p className="text-sm text-gray-600 cursor-auto ml-2">$100</p>
                  </del>
                  <div className="ml-auto"><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20"
                    fill="currentColor" className="bi bi-bag-plus" viewBox="0 0 16 16">
                    <path fill-rule="evenodd"
                      d="M8 7.5a.5.5 0 0 1 .5.5v1.5H10a.5.5 0 0 1 0 1H8.5V12a.5.5 0 0 1-1 0v-1.5H6a.5.5 0 0 1 0-1h1.5V8a.5.5 0 0 1 .5-.5z" />
                    <path
                      d="M8 1a2.5 2.5 0 0 1 2.5 2.5V4h-5v-.5A2.5 2.5 0 0 1 8 1zm3.5 3v-.5a3.5 3.5 0 1 0-7 0V4H1v10a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V4h-3.5zM2 5h12v9a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V5z" />
                  </svg></div>
                </div>
              </div>
            </a>
          </div>
          <div className="w-72 bg-white shadow-md rounded-xl duration-500 hover:scale-105 hover:shadow-xl">
            <a href="#">
              <img src="/images/bermuda_jeans_preta_quadar_inshallah_elipse_icon.jpg"
                alt="Product" className="h-80 w-72 object-cover rounded-t-xl" />
              <div className="px-4 py-3 w-72">
                <span className="text-gray-400 mr-3 uppercase text-xs">Quadar Inshallah Co. & Records</span>
                <p className="text-lg font-bold text-black truncate block capitalize">Nome do Produto</p>
                <div className="flex items-center">
                  <p className="text-lg font-semibold text-black cursor-auto my-3">$149</p>
                  <del>
                    <p className="text-sm text-gray-600 cursor-auto ml-2">$199</p>
                  </del>
                  <div className="ml-auto"><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20"
                    fill="currentColor" className="bi bi-bag-plus" viewBox="0 0 16 16">
                    <path fill-rule="evenodd"
                      d="M8 7.5a.5.5 0 0 1 .5.5v1.5H10a.5.5 0 0 1 0 1H8.5V12a.5.5 0 0 1-1 0v-1.5H6a.5.5 0 0 1 0-1h1.5V8a.5.5 0 0 1 .5-.5z" />
                    <path
                      d="M8 1a2.5 2.5 0 0 1 2.5 2.5V4h-5v-.5A2.5 2.5 0 0 1 8 1zm3.5 3v-.5a3.5 3.5 0 1 0-7 0V4H1v10a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V4h-3.5zM2 5h12v9a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V5z" />
                  </svg></div>
                </div>
              </div>
            </a>
          </div>
          <div className="w-72 bg-white shadow-md rounded-xl duration-500 hover:scale-105 hover:shadow-xl">
            <a href="#">
              <img src="/images/camiseta_preta_quadar_inshallah_elipse_icon.jpg"
                alt="Product" className="h-80 w-72 object-cover rounded-t-xl" />
              <div className="px-4 py-3 w-72">
                <span className="text-gray-400 mr-3 uppercase text-xs">Quadar Inshallah Co. & Records</span>
                <p className="text-lg font-bold text-black truncate block capitalize">Nome do Produto</p>
                <div className="flex items-center">
                  <p className="text-lg font-semibold text-black cursor-auto my-3">$149</p>
                  <del>
                    <p className="text-sm text-gray-600 cursor-auto ml-2">$199</p>
                  </del>
                  <div className="ml-auto"><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20"
                    fill="currentColor" className="bi bi-bag-plus" viewBox="0 0 16 16">
                    <path fill-rule="evenodd"
                      d="M8 7.5a.5.5 0 0 1 .5.5v1.5H10a.5.5 0 0 1 0 1H8.5V12a.5.5 0 0 1-1 0v-1.5H6a.5.5 0 0 1 0-1h1.5V8a.5.5 0 0 1 .5-.5z" />
                    <path
                      d="M8 1a2.5 2.5 0 0 1 2.5 2.5V4h-5v-.5A2.5 2.5 0 0 1 8 1zm3.5 3v-.5a3.5 3.5 0 1 0-7 0V4H1v10a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V4h-3.5zM2 5h12v9a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V5z" />
                  </svg></div>
                </div>
              </div>
            </a>
          </div>
          <div className="w-72 bg-white shadow-md rounded-xl duration-500 hover:scale-105 hover:shadow-xl">
            <a href="#">
              <img src="/images/camiseta_branca_quadar_inshallah_elipse_icon.jpg"
                alt="Product" className="h-80 w-72 object-cover rounded-t-xl" />
              <div className="px-4 py-3 w-72">
                <span className="text-gray-400 mr-3 uppercase text-xs">Quadar Inshallah Co. & Records</span>
                <p className="text-lg font-bold text-black truncate block capitalize">Nome do Produto</p>
                <div className="flex items-center">
                  <p className="text-lg font-semibold text-black cursor-auto my-3">$149</p>
                  <del>
                    <p className="text-sm text-gray-600 cursor-auto ml-2">$199</p>
                  </del>
                  <div className="ml-auto"><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20"
                    fill="currentColor" className="bi bi-bag-plus" viewBox="0 0 16 16">
                    <path fill-rule="evenodd"
                      d="M8 7.5a.5.5 0 0 1 .5.5v1.5H10a.5.5 0 0 1 0 1H8.5V12a.5.5 0 0 1-1 0v-1.5H6a.5.5 0 0 1 0-1h1.5V8a.5.5 0 0 1 .5-.5z" />
                    <path
                      d="M8 1a2.5 2.5 0 0 1 2.5 2.5V4h-5v-.5A2.5 2.5 0 0 1 8 1zm3.5 3v-.5a3.5 3.5 0 1 0-7 0V4H1v10a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V4h-3.5zM2 5h12v9a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V5z" />
                  </svg></div>
                </div>
              </div>
            </a>
          </div>

          <div className="w-72 bg-white shadow-md rounded-xl duration-500 hover:scale-105 hover:shadow-xl">
            <a href="#">
              <img src="/images/calça_branca_quadar_inshallah_elipse_icon.jpg"
                alt="Product" className="h-80 w-72 object-cover rounded-t-xl" />
              <div className="px-4 py-3 w-72">
                <span className="text-gray-400 mr-3 uppercase text-xs">Quadar Inshallah Co. & Records</span>
                <p className="text-lg font-bold text-black truncate block capitalize">Nome do Produto</p>
                <div className="flex items-center">
                  <p className="text-lg font-semibold text-black cursor-auto my-3">$149</p>
                  <del>
                    <p className="text-sm text-gray-600 cursor-auto ml-2">$199</p>
                  </del>
                  <div className="ml-auto"><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20"
                    fill="currentColor" className="bi bi-bag-plus" viewBox="0 0 16 16">
                    <path fill-rule="evenodd"
                      d="M8 7.5a.5.5 0 0 1 .5.5v1.5H10a.5.5 0 0 1 0 1H8.5V12a.5.5 0 0 1-1 0v-1.5H6a.5.5 0 0 1 0-1h1.5V8a.5.5 0 0 1 .5-.5z" />
                    <path
                      d="M8 1a2.5 2.5 0 0 1 2.5 2.5V4h-5v-.5A2.5 2.5 0 0 1 8 1zm3.5 3v-.5a3.5 3.5 0 1 0-7 0V4H1v10a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V4h-3.5zM2 5h12v9a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V5z" />
                  </svg></div>
                </div>
              </div>
            </a>
          </div>
        {/* Progress */}
          <div className="progress-content h-screen w-full flex justify-center items-center dark:bg-gray-800">
    <div>
        <h2 className="progress-title mb-2 text-lg font-semibold text-gray-900 dark:text-white">Progresso da marca</h2>
        <ul className="progress-list max-w-md space-y-2 text-gray-500 list-inside dark:text-gray-400">
            <li className="flex items-center">
                <svg className="w-4 h-4 me-2 text-green-500 dark:text-green-400 flex-shrink-0" aria-hidden="true"
                    xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 20">
                    <path
                        d="M10 .5a9.5 9.5 0 1 0 9.5 9.5A9.51 9.51 0 0 0 10 .5Zm3.707 8.207-4 4a1 1 0 0 1-1.414 0l-2-2a1 1 0 0 1 1.414-1.414L9 10.586l3.293-3.293a1 1 0 0 1 1.414 1.414Z" />
                </svg>
                API do Backend
            </li>
            <li className="flex items-center">
                <svg className=" w-4 h-4 me-2 text-green-500 dark:text-green-400 flex-shrink-0" aria-hidden="true"
                    xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 20">
                    <path
                        d="M10 .5a9.5 9.5 0 1 0 9.5 9.5A9.51 9.51 0 0 0 10 .5Zm3.707 8.207-4 4a1 1 0 0 1-1.414 0l-2-2a1 1 0 0 1 1.414-1.414L9 10.586l3.293-3.293a1 1 0 0 1 1.414 1.414Z" />
                </svg>
                Banco de Dados com MongoDB
            </li>
            <li className="flex items-center">
                <svg className="w-4 h-4 me-2 text-green-500 dark:text-green-400 flex-shrink-0" aria-hidden="true"
                    xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 20">
                    <path
                        d="M10 .5a9.5 9.5 0 1 0 9.5 9.5A9.51 9.51 0 0 0 10 .5Zm3.707 8.207-4 4a1 1 0 0 1-1.414 0l-2-2a1 1 0 0 1 1.414-1.414L9 10.586l3.293-3.293a1 1 0 0 1 1.414 1.414Z" />
                </svg>
                Implementação do CORS e Autenticação JWT
            </li>
            <li className="flex items-center">
                <svg className="w-4 h-4 me-2 text-green-500 dark:text-green-400 flex-shrink-0" aria-hidden="true"
                    xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 20">
                    <path
                        d="M10 .5a9.5 9.5 0 1 0 9.5 9.5A9.51 9.51 0 0 0 10 .5Zm3.707 8.207-4 4a1 1 0 0 1-1.414 0l-2-2a1 1 0 0 1 1.414-1.414L9 10.586l3.293-3.293a1 1 0 0 1 1.414 1.414Z" />
                </svg>
                Implementação de APIs de pagamentos e integração com serviços de terceiros
            </li>
            <li className="flex items-center">
                <svg className="w-4 h-4 me-2 text-green-500 dark:text-green-400 flex-shrink-0" aria-hidden="true"
                    xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 20">
                    <path
                        d="M10 .5a9.5 9.5 0 1 0 9.5 9.5A9.51 9.51 0 0 0 10 .5Zm3.707 8.207-4 4a1 1 0 0 1-1.414 0l-2-2a1 1 0 0 1 1.414-1.414L9 10.586l3.293-3.293a1 1 0 0 1 1.414 1.414Z" />
                </svg>
                Hook de autenticação e autorização para rotas protegidas
            </li>
            <li className="flex items-center">
                <div role="status">
                    <svg aria-hidden="true"
                        className="w-4 h-4 me-2 text-gray-200 animate-spin dark:text-gray-200 fill-blue-600"
                        viewBox="0 0 100 101" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path
                            d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
                            fill="currentColor" />
                        <path
                            d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
                            fill="currentFill" />
                    </svg>
                    <span className="sr-only">Loading...</span>
                </div>
            </li>
        </ul>
    </div>
</div>
  {/* video */}
        </section>
        <div className="absolute inset-0 opacity-10 pointer-events-none">
    <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <pattern id="dotGrid" width="20" height="20" patternUnits="userSpaceOnUse">
          <circle cx="10" cy="10" r="1" fill="white" />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#dotGrid)" />
    </svg>
  </div>


  <div className="video container mx-auto px-4 relative z-10 mb-28">

    <div className="video-text text-center max-w-3xl mx-auto mb-16">
      <h2 className="text-3xl md:text-4xl font-bold mb-6 font-serif">
        Vídeos em Destaque
      </h2>
      <p className="text-lg text-gray-300">
        Lorem ipsum dolor sit amet consectetur adipisicing elit. Voluptatibus sapiente minus vitae rem, quos soluta consequuntur mollitia temporibus vero ipsam dignissimos libero quia? Enim sint placeat sed deserunt assumenda qui..
      </p>
    </div>


    <div className="max-w-4xl mx-auto">
      <VideoPlayer />
    </div>
  </div>

      </div>

  )
}