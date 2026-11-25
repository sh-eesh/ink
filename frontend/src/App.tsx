import { useEffect, useState } from "react";
import { useAuth } from "./context/AuthContext";
import { registerUser, loginUser, logoutUser } from "./services/auth.service";
import { getNotes, createNote } from "./services/notes.service";

import type { SubmitEvent } from "react";
import type { Note } from "./services/notes.service";

import "./App.css";

function App() {
  const { user, loading } = useAuth();

  const [mode, setMode] = useState<"login" | "register">("login");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");

  const [message, setMessage] = useState("");
  const [notes, setNotes] = useState<Note[]>([]);
  const [notesLoading, setNotesLoading] = useState(false);

  // Handle login and registration
  async function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");

    try {
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
    } catch {
      setMessage("Something went wrong. Please try again.");
    }
  }

  // Log out the current user
  async function handleLogout() {
    const { error } = await logoutUser();

    if (error) {
      setMessage(error.message);
    }
  }

  // Retrieve notes from the backend
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

  // Automatically load notes when a user logs in
  useEffect(() => {
    if (!user) {
      setNotes([]);
      return;
    }

    handleLoadNotes();
  }, [user]);

  // Create a new note through the backend API
  async function handleCreateNote(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");

    try {
      const result = await createNote(title, content);

      setNotes((currentNotes) => [result.note, ...currentNotes]);

      setTitle("");
      setContent("");
      setMessage("Note created successfully.");
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "Failed to create note",
      );
    }
  }

  if (loading) {
    return (
      <div className="loading-screen">
        <p>Loading Ink...</p>
      </div>
    );
  }

  // Display the notes workspace for logged-in users
  if (user) {
    return (
      <div className="app-shell">
        <header className="topbar">
          <a className="brand" href="/">
            <span className="brand-icon">i</span>
            Ink
          </a>

          <div className="account-section">
            <span className="user-email">{user.email}</span>
            <button className="button button-secondary" onClick={handleLogout}>
              Logout
            </button>
          </div>
        </header>

        <main className="workspace">
          <section className="welcome-section">
            <div>
              <p className="eyebrow">YOUR WORKSPACE</p>
              <h1>Your notes</h1>
              <p className="subtitle">A quiet place for your thoughts.</p>
            </div>

            <button
              className="button button-secondary"
              onClick={handleLoadNotes}
              disabled={notesLoading}
            >
              {notesLoading ? "Loading..." : "Refresh notes"}
            </button>
          </section>

          <section className="composer-card">
            <h2>Create a note</h2>

            <form onSubmit={handleCreateNote}>
              <input
                className="title-input"
                type="text"
                placeholder="Give your note a title..."
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                maxLength={200}
              />

              <textarea
                className="content-input"
                placeholder="Start writing..."
                value={content}
                onChange={(event) => setContent(event.target.value)}
                rows={5}
              />

              <div className="composer-footer">
                <span className="helper-text">
                  Your notes are saved to your account.
                </span>

                <button
                  className="button button-primary"
                  type="submit"
                  disabled={!title.trim() && !content.trim()}
                >
                  Create note
                </button>
              </div>
            </form>
          </section>

          {message && <p className="status-message">{message}</p>}

          <section className="notes-section">
            <div className="section-heading">
              <h2>All notes</h2>
              <span className="note-count">
                {notes.length} {notes.length === 1 ? "note" : "notes"}
              </span>
            </div>

            {notes.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">✎</div>
                <h3>No notes yet</h3>
                <p>Create your first note using the editor above.</p>
              </div>
            ) : (
              <div className="notes-grid">
                {notes.map((note) => (
                  <article className="note-card" key={note.id}>
                    <h3>{note.title || "Untitled"}</h3>
                    <p>{note.content || "No content"}</p>
                    <span className="note-date">
                      {new Date(note.updated_at).toLocaleDateString()}
                    </span>
                  </article>
                ))}
              </div>
            )}
          </section>
        </main>
      </div>
    );
  }

  // Display the authentication screen
  return (
    <div className="auth-screen">
      <div className="auth-card">
        <a className="brand auth-brand" href="/">
          <span className="brand-icon">i</span>
          Ink
        </a>

        <h1>{mode === "login" ? "Welcome back." : "Create your account."}</h1>

        <p className="auth-subtitle">
          {mode === "login"
            ? "Log in to continue to your notes."
            : "Get started with your personal workspace."}
        </p>

        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="form-field">
            <label htmlFor="email">Email address</label>
            <input
              id="email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
            />
          </div>

          <div className="form-field">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
            />
          </div>

          <button className="button button-primary auth-submit" type="submit">
            {mode === "login" ? "Log in" : "Create account"}
          </button>
        </form>

        {message && <p className="status-message">{message}</p>}

        <p className="auth-switch">
          {mode === "login"
            ? "Don't have an account?"
            : "Already have an account?"}

          <button
            type="button"
            onClick={() => {
              setMode(mode === "login" ? "register" : "login");
              setMessage("");
            }}
          >
            {mode === "login" ? "Sign up" : "Log in"}
          </button>
        </p>
      </div>
    </div>
  );
}

export default App;
