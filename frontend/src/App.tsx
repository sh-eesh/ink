import { useState } from "react";
import type { SubmitEvent } from "react";

import { useAuth } from "./context/AuthContext";

import { registerUser, loginUser, logoutUser } from "./services/auth.service";

import { getNotes } from "./services/notes.service";
import type { Note } from "./services/notes.service";

function App() {
  const { user, loading } = useAuth();

  const [mode, setMode] = useState<"login" | "register">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  const [notes, setNotes] = useState<Note[]>([]);
  const [notesLoading, setNotesLoading] = useState(false);

  async function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");

    const result =
      mode === "register"
        ? await registerUser(email, password)
        : await loginUser(email, password);

    if (result.error) {
      setMessage(result.error.message);
      return;
    }

    if (mode === "register" && !result.data.session) {
      setMessage("Check your email to confirm your account.");
    }
  }

  async function handleLogout() {
    const { error } = await logoutUser();

    if (error) {
      setMessage(error.message);
    }
  }

  async function handleLoadNotes() {
    setNotesLoading(true);
    setMessage("");

    try {
      const result = await getNotes();
      setNotes(result.notes);
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "Failed to load notes",
      );
    } finally {
      setNotesLoading(false);
    }
  }

  if (loading) {
    return <p>Loading session...</p>;
  }

  if (user) {
    return (
      <main>
        <h1>Ink</h1>

        <p>Logged in as: {user.email}</p>

        <button onClick={handleLoadNotes} disabled={notesLoading}>
          {notesLoading ? "Loading..." : "Load notes"}
        </button>

        <button onClick={handleLogout}>Logout</button>

        {message && <p>{message}</p>}

        <h2>Your notes</h2>

        {notes.length === 0 ? (
          <p>No notes found.</p>
        ) : (
          notes.map((note) => (
            <article key={note.id}>
              <h3>{note.title || "Untitled"}</h3>
              <p>{note.content}</p>
            </article>
          ))
        )}
      </main>
    );
  }

  return (
    <main>
      <h1>Ink</h1>

      <h2>{mode === "login" ? "Login" : "Create account"}</h2>

      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="email">Email</label>

          <input
            id="email"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
          />
        </div>

        <div>
          <label htmlFor="password">Password</label>

          <input
            id="password"
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
          />
        </div>

        <button type="submit">{mode === "login" ? "Login" : "Register"}</button>
      </form>

      <button
        type="button"
        onClick={() => {
          setMode(mode === "login" ? "register" : "login");
          setMessage("");
        }}
      >
        {mode === "login"
          ? "Create an account"
          : "Already have an account? Login"}
      </button>

      {message && <p>{message}</p>}
    </main>
  );
}

export default App;
