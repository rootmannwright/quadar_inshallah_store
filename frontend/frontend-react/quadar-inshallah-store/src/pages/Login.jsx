import '../styles/login.css'

export default function Login() {
  return (
    <div className="flex flex-col md:flex-row min-h-screen">

      {/* ===== Left Section ===== */}
      <div className="bg-blue-500 text-white p-8 md:p-12 md:w-1/2 relative overflow-hidden">
        <div className="z-10 relative">
          <img className="w-40 h-20" src="/logos/logo-letreiro.png" alt="Logo"/>

          <div className="mt-20 md:mt-32">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Efetue seu login
            </h1>
            <h2 className="text-2xl md:text-3xl font-semibold mb-6">
              Fazer o seu login torna o processo de compra mais ágil.
            </h2>
            <p className="max-w-md opacity-90">
              Lorem Ipsum is simply dummy text of the printing and typesetting industry.
            </p>
          </div>
        </div>

        {/* Decorative elements */}
        <svg
          className="text-white/20 absolute bottom-10 left-10 w-24 h-24"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          viewBox="0 0 24 24"
        >
          <path d="M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z" />
        </svg>
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
              Bem vindos a <span className="text-blue-500 font-bold">Quadar Inshallah Co. & Records</span>
            </p>
            <h1 className="text-4xl font-bold">Sign in</h1>
          </div>

          {/* Social login */}
          <div className="flex flex-col space-y-4 mb-8">
            <button className="flex items-center justify-center gap-2 h-12 border border-gray-200 rounded-md hover:bg-gray-50">
              Sign in with Google
            </button>

            <div className="flex gap-4">
              <button className="flex-1 h-12 border border-gray-200 rounded-md hover:bg-gray-50 flex items-center justify-center">
                {/* Facebook */}
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="text-blue-600"
                >
                  <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
                </svg>
              </button>

              <button className="flex-1 h-12 border border-gray-200 rounded-md hover:bg-gray-50 flex items-center justify-center">
                {/* Apple */}
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="text-gray-800"
                >
                  <path d="M9 7c-3 0-4 3-4 5.5 0 3 2 7.5 5 7.5 1.5 0 2.5-.5 3.5-1.5" />
                  <path d="M9 12h13" />
                  <path d="M15 7c3 0 4 3 4 5.5 0 3-2 7.5-5 7.5-1.5 0-2.5-.5-3.5-1.5" />
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
              className="w-full h-12 bg-blue-500 hover:bg-blue-600 text-white font-medium rounded-md transition"
            >
              Sign in
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}