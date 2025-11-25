import { useNavigate } from "react-router-dom";

function LandingPage({ nickname, setNickname }) {
  const navigate = useNavigate();

  function handleSubmit(event) {
    event.preventDefault(); 

    const trimmedName = nickname.trim();

    if (!trimmedName) {
      return;
    }

    navigate("/lobby");
  }

  function handleChange(event) {
    setNickname(event.target.value);
  }

  return (
    <section className="screen landing-screen">
      {}
      <header className="screen__header">
        <h1 className="screen__title">Doodle Duel</h1>
      </header>

      {}
      <div className="screen__body">
        {}
        <div className="avatar-circle" aria-hidden="true" />

        {}
        <form className="nickname-form" onSubmit={handleSubmit}>
          <label className="nickname-form__label" htmlFor="nickname">
            Enter a nickname
          </label>

          <input
            id="nickname"
            className="nickname-form__input"
            type="text"
            placeholder="John"
            value={nickname}
            onChange={handleChange}
          />

          <p className="nickname-form__helper">
            This name will be shown to other players
          </p>

          <button
            className="primary-button"
            type="submit"
            disabled={!nickname.trim()}
          >
            Join Lobby
          </button>
        </form>
      </div>
    </section>
  );
}

export default LandingPage;
