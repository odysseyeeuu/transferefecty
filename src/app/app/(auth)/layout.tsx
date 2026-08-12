export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <main
      className="flex min-h-screen flex-col items-center justify-center px-4 py-12"
      style={{ background: "var(--ge-bg-primary)" }}
    >
      <div className="mb-8 text-center">
        <span data-text="Transfer Efecty" className="ge-glitch ge-gradient-text text-2xl font-bold">
          Transfer Efecty
        </span>
      </div>
      <div className="ge-card w-full max-w-md p-8">{children}</div>
    </main>
  );
}
