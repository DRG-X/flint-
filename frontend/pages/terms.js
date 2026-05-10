import Nav from "../components/Nav";
export default function Terms() {
  return (
    <>
      <Nav variant="light" />
      <div className="container" style={{ maxWidth: 800, padding: "5rem 0", textAlign: "center" }}>
        <h1 className="display-md" style={{ marginBottom: "1.5rem" }}>Terms of Service</h1>
        <p style={{ color: "var(--muted)", fontSize: "1.1rem" }}>Full terms of service coming soon. For questions, contact support@vaulto.app</p>
      </div>
    </>
  );
}
