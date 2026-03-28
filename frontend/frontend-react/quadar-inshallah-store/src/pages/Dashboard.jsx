import { useAuth } from "../context/AuthProvider";
import { signOut } from "firebase/auth";
import { auth } from "../firebase";

export default function Dashboard() {
  const { user } = useAuth();

  return (
    <div className="dashboard">
      <h1>Dashboard</h1>
      <p>{user?.email}</p>
      <button onClick={() => signOut(auth)}>Sair</button>
    </div>
  );
}