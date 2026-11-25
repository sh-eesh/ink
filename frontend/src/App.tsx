import { useEffect, useState } from "react";
import type { SubmitEvent } from "react";

import { useAuth } from "./context/AuthContext";

import { registerUser, loginUser, logoutUser } from "./services/auth.service";

import { getNotes, createNote, updateNote } from "./services/notes.service";

import type { Note } from "./services/notes.service";

import "./App.css";

const API_URL = import.meta.env.VITE_API_URL;

function App() {
  const { user, loading } = useAuth();

  const [mode, setMode] = useState<"login" | "register">("login");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");

  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editContent, setEditContent] = useState("");

  const [message, setMessage] = useState("");
  const [notes, setNotes] = useState<Note[]>([]);
  const [notesLoading, setNotesLoading] = useState(false);

  const [backendReady, setBackendReady] = useState(false);
  const [backendSlow, setBackendSlow] = useState(false);
  const [backendCheck, setBackendCheck] = useState(0);

  // Check whether the backend is available
  useEffect(() => {
    let cancelled = false;
    let activeController: AbortController | null = null;
    let retryTimer: ReturnType<typeof setTimeout> | null = null;

    const slowTimer = setTimeout(() => {
      if (!cancelled) {
        setBackendSlow(true);
      }
    }, 25000);

    async function checkBackend() {
      while (!cancelled) {
        const controller = new AbortController();
        activeController = controller;

        const requestTimeout = setTimeout(() => {
          controller.abort();
        }, 65000);

        try {
          const response = await fetch(`${API_URL}/api/health`, {
            signal: controller.signal,
          });

          if (response.ok) {
            if (!cancelled) {
              clearTimeout(slowTimer);
              setBackendReady(true);
              setBackendSlow(false);
            }

            return;
          }
        } catch {
          // The backend may still be starting
        } finally {
          clearTimeout(requestTimeout);
        }

        if (cancelled) {
          return;
        }

        await new Promise<void>((resolve) => {
          retryTimer = setTimeout(() => {
            retryTimer = null;
            resolve();
          }, 3000);
        });
      }
    }

    void checkBackend();

    return () => {
      cancelled = true;
      activeController?.abort();
      clearTimeout(slowTimer);

      if (retryTimer) {
        clearTimeout(retryTimer);
      }
    };
  }, [backendCheck]);

  const userId = user?.id;

  // Automatically load notes when a user logs in
  useEffect(() => {
    if (!backendReady || !userId) {
      if (!userId) {
        setNotes([]);
      }

      return;
    }

    let cancelled = false;

    async function loadNotes() {
      setNotesLoading(true);
      setMessage("");

      try {
        const result = await getNotes();

        if (!cancelled) {
          setNotes(result.notes);
        }
      } catch (error) {
        if (!cancelled) {
          setMessage(
            error instanceof Error ? error.message : "Failed to load notes",
          );
        }
      } finally {
        if (!cancelled) {
          setNotesLoading(false);
        }
      }
    }

    void loadNotes();

    return () => {
      cancelled = true;
    };
  }, [backendReady, userId]);

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

  // Open a note in editing mode
  function handleStartEdit(note: Note) {
    setEditingNoteId(note.id);
    setEditTitle(note.title);
    setEditContent(note.content);
    setMessage("");
  }

  // Cancel editing
  function handleCancelEdit() {
    setEditingNoteId(null);
    setEditTitle("");
    setEditContent("");
  }

  // Save changes to an existing note
  async function handleUpdateNote(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!editingNoteId) {
      return;
    }

    setMessage("");

    try {
      const result = await updateNote(editingNoteId, editTitle, editContent);

      setNotes((currentNotes) =>
        currentNotes
          .map((note) => (note.id === editingNoteId ? result.note : note))
          .sort(
            (a, b) =>
              new Date(b.updated_at).getTime() -
              new Date(a.updated_at).getTime(),
          ),
      );

      handleCancelEdit();
      setMessage("Note updated successfully.");
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "Failed to update note",
      );
    }
  }

  // Show the startup screen until the backend is ready
  if (!backendReady) {
    return (
      <div className="startup-screen">
        <div className="startup-card">
          <a className="brand" href="/">
            <span className="brand-icon">i</span>
            Ink
          </a>

          <div className="startup-content">
            <div className="startup-icon">
              <span className="startup-icon-inner">i</span>
            </div>

            <h1>Starting your workspace</h1>

            <p>
              We're connecting to our backend. Please wait while we prepare your
              workspace.
            </p>

            <div className="startup-progress">
              <div className="startup-progress-bar" />
            </div>

            <span className="startup-status">Connecting to Ink API...</span>

            {backendSlow && (
              <div className="startup-retry">
                <p>
                  This is taking longer than usual. Our server may be waking up.
                </p>

                <button
                  className="button button-secondary"
                  onClick={() => {
                    setBackendSlow(false);
                    setBackendCheck((current) => current + 1);
                  }}
                >
                  Retry connection
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    );
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
                    {editingNoteId === note.id ? (
                      <form onSubmit={handleUpdateNote}>
                        <input
                          className="title-input"
                          type="text"
                          value={editTitle}
                          onChange={(event) => setEditTitle(event.target.value)}
                          maxLength={200}
                          placeholder="Note title"
                        />

                        <textarea
                          className="content-input"
                          value={editContent}
                          onChange={(event) =>
                            setEditContent(event.target.value)
                          }
                          rows={5}
                          placeholder="Note content"
                        />

                        <div className="composer-footer">
                          <button
                            className="button button-secondary"
                            type="button"
                            onClick={handleCancelEdit}
                          >
                            Cancel
                          </button>

                          <button
                            className="button button-primary"
                            type="submit"
                          >
                            Save changes
                          </button>
                        </div>
                      </form>
                    ) : (
                      <>
                        <h3>{note.title || "Untitled"}</h3>

                        <p>{note.content || "No content"}</p>

                        <span className="note-date">
                          {new Date(note.updated_at).toLocaleDateString()}
                        </span>

                        <div className="composer-footer">
                          <button
                            className="button button-secondary"
                            type="button"
                            onClick={() => handleStartEdit(note)}
                          >
                            Edit
                          </button>
                        </div>
                      </>
                    )}
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
