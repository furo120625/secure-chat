CREATE TABLE messages (
                          id CHAR(36) PRIMARY KEY,
                          conversation_id CHAR(36) NOT NULL,
                          sender_id CHAR(36) NOT NULL,
                          ciphertext TEXT NOT NULL,
                          nonce VARCHAR(255) NOT NULL,
                          sender_public_key TEXT NOT NULL,
                          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);