import { useState } from "react";
import "../styles/login.css";

export default function Login() {
  const [loading, setLoading] = useState(false);
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const navigate = useNavigate();

  const socialLogin = async (provider) => {
    try {
      setLoading(true);
      await signInWithPopup(auth, provider);
      navigate("/dashboard");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);

      if (isRegister) {
        await createUserWithEmailAndPassword(auth, email, password);
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }

      navigate("/dashboard");
    } catch (err) {
      console.error(err);
      alert("Erro ao autenticar");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <motion.div className="card">
        <h2>{isRegister ? "Criar conta" : "Login"}</h2>

        <div className="socials">
          <button onClick={() => socialLogin(googleProvider)}>Google</button>
          <button onClick={() => socialLogin(appleProvider)}>Apple</button>
          <button onClick={() => socialLogin(facebookProvider)}>Facebook</button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder=" "
            />
            <label>Email</label>
          </div>

          <div className="input-group">
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder=" "
            />
            <label>Senha</label>
          </div>

          <button className="submit">
            {loading ? "..." : isRegister ? "Criar" : "Entrar"}
          </button>
        </form>

        <p onClick={() => setIsRegister(!isRegister)}>
          {isRegister ? "Já tem conta? Login" : "Criar conta"}
        </p>
      </motion.div>
    </div>
  );
}