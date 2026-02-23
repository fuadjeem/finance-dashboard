-- Add PasswordReset table for password reset tokens
CREATE TABLE IF NOT EXISTS PasswordReset (
    id TEXT PRIMARY KEY,
    userId TEXT NOT NULL,
    token TEXT NOT NULL UNIQUE,
    expiresAt TEXT NOT NULL,
    createdAt TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (userId) REFERENCES User(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_password_reset_token ON PasswordReset(token);
CREATE INDEX IF NOT EXISTS idx_password_reset_user ON PasswordReset(userId);
