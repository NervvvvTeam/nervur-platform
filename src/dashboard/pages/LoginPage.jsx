import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(email, password);
      navigate("/app/portal");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row font-['Inter',system-ui,sans-serif]">
      {/* Left — Branding panel */}
      <div className="bg-[#09090B] flex flex-col justify-center items-center px-6 py-10 md:flex-1 md:p-[60px] relative overflow-hidden">
        {/* Subtle gradient accent */}
        <div className="absolute top-[30%] left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] rounded-full bg-[radial-gradient(circle,rgba(99,102,241,0.08)_0%,transparent_70%)] pointer-events-none" />

        <img
          src="/logo-nervur.svg"
          alt="NERVÜR"
          className="h-[50px] md:h-[70px] w-auto mb-6 md:mb-9 relative"
        />

        <h1 className="text-2xl md:text-[32px] font-bold text-[#FAFAFA] text-center mb-3 relative">
          Bienvenue sur NERVÜR
        </h1>
        <p className="text-sm md:text-[15px] text-[#71717A] text-center max-w-[360px] leading-relaxed relative">
          Gérez votre réputation, auditez vos performances, surveillez votre
          sécurité et boostez votre SEO.
        </p>

        {/* Tool pills */}
        <div className="flex flex-wrap gap-2.5 mt-10 relative justify-center">
          {[
            { name: "Sentinel", color: "#ef4444" },
            { name: "Phantom", color: "#8b5cf6" },
            { name: "Vault", color: "#06b6d4" },
            { name: "Pulse", color: "#ec4899" },
          ].map((t) => (
            <div
              key={t.name}
              className="px-3.5 py-1.5 rounded-[20px] text-xs font-medium"
              style={{
                border: `1px solid ${t.color}30`,
                background: `${t.color}10`,
                color: t.color,
              }}
            >
              {t.name}
            </div>
          ))}
        </div>

        {/* Bottom text */}
        <div className="hidden md:block absolute bottom-8 text-center">
          <p className="text-xs text-[#3f3f46]">
            © 2026 NERVÜR — Éditeur de Technologies de Croissance
          </p>
        </div>
      </div>

      {/* Right — Login form */}
      <div className="w-full md:w-[480px] bg-[#111318] flex flex-col justify-center px-6 py-10 md:p-[60px] border-t md:border-t-0 md:border-l border-[#1e1e2a]">
        <div className="max-w-[340px] w-full mx-auto">
          <h2 className="text-[22px] font-semibold text-[#f0f0f3] mb-2">
            Connexion
          </h2>
          <p className="text-sm text-gray-500 mb-8">
            Accédez à votre espace client
          </p>

          <form onSubmit={handleSubmit}>
            {error && (
              <div className="px-4 py-3 mb-5 rounded-lg bg-red-500/[0.08] border border-red-500/20 text-red-400 text-[13px] leading-normal">
                {error}
              </div>
            )}

            <div className="mb-5">
              <label className="block text-[13px] text-gray-400 mb-2 font-medium">
                Adresse email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="nom@entreprise.com"
                className="w-full px-4 py-3 bg-[#1e2029] border border-[#2a2d3a] rounded-[10px] text-[#f0f0f3] text-sm font-[inherit] outline-none box-border transition-[border-color,box-shadow] duration-200 focus:border-indigo-500 focus:shadow-[0_0_0_3px_rgba(99,102,241,0.12)]"
              />
            </div>

            <div className="mb-7">
              <label className="block text-[13px] text-gray-400 mb-2 font-medium">
                Mot de passe
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="••••••••"
                className="w-full px-4 py-3 bg-[#1e2029] border border-[#2a2d3a] rounded-[10px] text-[#f0f0f3] text-sm font-[inherit] outline-none box-border transition-[border-color,box-shadow] duration-200 focus:border-indigo-500 focus:shadow-[0_0_0_3px_rgba(99,102,241,0.12)]"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`w-full py-3 bg-indigo-500 text-white border-none rounded-[10px] text-sm font-semibold font-[inherit] transition-all duration-200 hover:bg-indigo-400 disabled:opacity-60 ${
                loading ? "cursor-wait" : "cursor-pointer"
              }`}
            >
              {loading ? "Connexion..." : "Se connecter"}
            </button>
          </form>

          <div className="mt-8 pt-5 border-t border-[#2a2d3a]">
            <p className="text-xs text-gray-600 leading-relaxed">
              Votre compte est créé par l'équipe NERVÜR lors de votre
              souscription.
            </p>
            <a
              href="/contact"
              className="text-[13px] text-indigo-500 no-underline font-medium inline-block mt-2"
            >
              Pas encore client ? Contactez-nous →
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
