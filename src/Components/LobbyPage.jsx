export default function LobbyPage({ nickname }) {
    return (
      <section className="screen">
        <header className="screen__header">
          <h1 className="screen__title">Lobby</h1>
        </header>
        <div className="screen__body">
          <p>Hi {nickname || "Player"}! Lobby coming soon…</p>
        </div>
      </section>
    );
  }