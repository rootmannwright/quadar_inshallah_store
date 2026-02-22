import '../styles/login.css'
import { Link } from "react-router-dom"

export default function Login() {
  return (
    <div className="flex flex-col md:flex-row min-h-screen">

      {/* ===== Left Section ===== */}
      <div className="bg-white-500 text-white p-8 md:p-12 md:w-1/2 relative overflow-hidden">
        <div className="z-10 relative">
          <img className="w-40 h-20" src="/logos/logo-letreiro.png" alt="Logo"/>

          <div className="mt-20 md:mt-32">
            <h1 className="text-4xl md:text-5xl font-bold mb-4 text-black">
              Efetue seu login
            </h1>
            <h2 className="text-2xl md:text-3xl font-semibold mb-6">
              Fazer o seu login torna o processo de compra mais ágil.
            </h2>
            <p className="max-w-md opacity-90 text-black">
              Lorem Ipsum is simply dummy text of the printing and typesetting industry.
            </p>
          </div>
        </div>

        {/* Button */}
        <Link to="/">
        <button className="inline-block px-7 py-1.5 overflow-hidden text-sm font-semibold transition-transform rounded-full group text text-white-700/70 bg-neutral-900/30 hover:bg-neutral-300/70 hover:text-black mt-10">
  <span before="Home" className="relative py-1.5 transition-transform inline-block before:content-[attr(before)] before:py-1.5 before:absolute before:top-full group-hover:-translate-y-full">Voltar para Home</span>
</button>
</Link>
      </div>

      {/* ===== Right Section ===== */}
      <div className="p-8 md:p-12 md:w-1/2 flex items-center justify-center">
        <div className="w-full max-w-md bg-white rounded-3xl shadow-lg p-8">

          <div className="text-right mb-4">
            <span className="text-gray-500">No Account?</span>{" "}
            <a href="#" className="text-blue-500 font-medium">
              Sign up
            </a>
          </div>

          <div className="mb-8">
            <p className="text-gray-600 mb-1">
              Bem vindos a <span className="text-black-500 font-bold">Quadar Inshallah Co. & Records</span>
            </p>
            <h1 className="text-4xl font-bold mx-32">Sign in</h1>
          </div>

          {/* Social login */}
          <div className="flex flex-col space-y-4 mb-8">
            <button className="flex items-center justify-center gap-2 h-12 border border-gray-200 rounded-md hover:bg-gray-50">
              <svg xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" width="50" height="100" viewBox="0 0 48 48">
<path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"></path><path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"></path><path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"></path><path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571c0.001-0.001,0.002-0.001,0.003-0.002l6.19,5.238C36.971,39.205,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z"></path>
</svg>
            </button>

            <div className="flex gap-4">
              <button className="flex-1 h-12 border border-gray-200 rounded-md hover:bg-gray-50 flex items-center justify-center">
                {/* Facebook */}
                <svg xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" width="50" height="100" viewBox="0 0 50 50">
    <path d="M25,3C12.85,3,3,12.85,3,25c0,11.03,8.125,20.137,18.712,21.728V30.831h-5.443v-5.783h5.443v-3.848 c0-6.371,3.104-9.168,8.399-9.168c2.536,0,3.877,0.188,4.512,0.274v5.048h-3.612c-2.248,0-3.033,2.131-3.033,4.533v3.161h6.588 l-0.894,5.783h-5.694v15.944C38.716,45.318,47,36.137,47,25C47,12.85,37.15,3,25,3z"></path>
</svg>
              </button>

              <button className="flex-1 h-12 border border-gray-200 rounded-md hover:bg-gray-50 flex items-center justify-center">
                {/* Apple */}
                <svg xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" width="50" height="100" viewBox="0 0 50 50">
<path d="M 44.527344 34.75 C 43.449219 37.144531 42.929688 38.214844 41.542969 40.328125 C 39.601563 43.28125 36.863281 46.96875 33.480469 46.992188 C 30.46875 47.019531 29.691406 45.027344 25.601563 45.0625 C 21.515625 45.082031 20.664063 47.03125 17.648438 47 C 14.261719 46.96875 11.671875 43.648438 9.730469 40.699219 C 4.300781 32.429688 3.726563 22.734375 7.082031 17.578125 C 9.457031 13.921875 13.210938 11.773438 16.738281 11.773438 C 20.332031 11.773438 22.589844 13.746094 25.558594 13.746094 C 28.441406 13.746094 30.195313 11.769531 34.351563 11.769531 C 37.492188 11.769531 40.8125 13.480469 43.1875 16.433594 C 35.421875 20.691406 36.683594 31.78125 44.527344 34.75 Z M 31.195313 8.46875 C 32.707031 6.527344 33.855469 3.789063 33.4375 1 C 30.972656 1.167969 28.089844 2.742188 26.40625 4.78125 C 24.878906 6.640625 23.613281 9.398438 24.105469 12.066406 C 26.796875 12.152344 29.582031 10.546875 31.195313 8.46875 Z"></path>
</svg>
              </button>
            </div>
          </div>

          {/* Form */}
          <form className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Enter your username or email address
              </label>
              <input
                type="text"
                placeholder="Username or email address"
                className="w-full h-12 px-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Enter your Password
              </label>
              <input
                type="password"
                placeholder="Password"
                className="w-full h-12 px-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
              <div className="text-right mt-2">
                <a href="#" className="text-blue-500 text-sm">
                  Forgot Password
                </a>
              </div>
            </div>

            <button
              type="submit"
              className="w-full h-12 bg-neutral-950 hover:bg-green-600 text-white font-medium rounded-md transition"
            >
              Sign in
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}