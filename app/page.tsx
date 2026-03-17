import LoginForm from "../components/LoginForm";

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-canvas flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        {/* Logo / header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-ink mb-5">
            <span className="text-white text-xl font-semibold">P</span>
          </div>
          <h1 className="text-3xl font-semibold text-ink tracking-tight">
            Padelity Analytics
          </h1>
          <p className="text-ink-muted text-sm mt-2">
            Sign in to your brand dashboard
          </p>
        </div>

        {/* Form card */}
        <div
          className="bg-surface rounded-2xl p-8"
          style={{ boxShadow: "0 1px 4px rgba(0,0,0,0.06), 0 4px 16px rgba(0,0,0,0.04)" }}
        >
          <LoginForm />
        </div>

        <p className="text-center text-xs text-ink-subtle mt-8">
          Padelity Analytics · Private Access
        </p>
      </div>
    </div>
  );
}
