const crypto = require("crypto");
const db = require("../config/database");
async function sendMessage(req, res) {
    try {
        // 1. Kiểm tra đăng nhập
        if (!req.session.userId) {
            return res.status(401).json({
                message: "Not authenticated"
            });
        }
        const senderId =
            req.session.userId;
        // 2. Lấy dữ liệu từ request
        const {
            conversationId,
            ciphertext,
            nonce,
            senderPublicKey,
            selfCiphertext,
            selfNonce,
            selfPublicKey
        } = req.body;
        // 3. Kiểm tra dữ liệu
        if (
            !conversationId ||
            !ciphertext ||
            !nonce ||
            !senderPublicKey ||
            !selfCiphertext ||
            !selfNonce ||
            !selfPublicKey
        ) {
            return res.status(400).json({
                message: "All message fields are required"
            });
        }
        // 4. Kiểm tra người gửi có thuộc conversation không
        const [members] =
            await db.promise().query(
                `
                    SELECT user_id
                    FROM conversation_members
                    WHERE conversation_id = ?
                      AND user_id = ?
                `,
                [
                    conversationId,
                    senderId
                ]
            );
        if (members.length === 0) {
            return res.status(403).json({
                message:
                    "You are not a member of this conversation"
            });
        }
        // 5. Tạo ID cho message
        const messageId =
            crypto.randomUUID();
        // 6. Lưu message
        await db.promise().query(
            `
                INSERT INTO messages (
                    id,
                    conversation_id,
                    sender_id,
                    ciphertext,
                    nonce,
                    sender_public_key,
                    self_ciphertext,
                    self_nonce,
                    self_public_key
                )
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            `,
            [
                messageId,
                conversationId,
                senderId,
                ciphertext,
                nonce,
                senderPublicKey,
                selfCiphertext,
                selfNonce,
                selfPublicKey
            ]
        );
        // 7. Trả kết quả
        res.status(201).json({
            message: "Message sent",
            messageId
        });
    } catch (error) {
        console.error(
            "Send message error:",
            error
        );
        res.status(500).json({
            message: "Internal server error"
        });
    }
}
async function getMessages(req, res) {
    try {
        // 1. Kiểm tra đăng nhập
        if (!req.session.userId) {
            return res.status(401).json({
                message: "Not authenticated"
            });
        }
        const userId =
            req.session.userId;
        const { conversationId } =
            req.params;
        // 2. Kiểm tra conversation ID
        if (!conversationId) {
            return res.status(400).json({
                message:
                    "Conversation ID is required"
            });
        }
        // 3. Kiểm tra user có thuộc conversation không
        const [members] =
            await db.promise().query(
                `
                    SELECT user_id
                    FROM conversation_members
                    WHERE conversation_id = ?
                      AND user_id = ?
                `,
                [
                    conversationId,
                    userId
                ]
            );
        if (members.length === 0) {
            return res.status(403).json({
                message:
                    "You are not a member of this conversation"
            });
        }
        // 4. Lấy messages
        const [messages] =
            await db.promise().query(
                `
                    SELECT
                        id,
                        conversation_id,
                        sender_id,
                        ciphertext,
                        nonce,
                        sender_public_key,
                        self_ciphertext,
                        self_nonce,
                        self_public_key,
                        created_at
                    FROM messages
                    WHERE conversation_id = ?
                    ORDER BY created_at ASC
                `,
                [conversationId]
            );
        // 5. Trả messages
        res.json(messages);
    } catch (error) {
        console.error(
            "Get messages error:",
            error
        );
        res.status(500).json({
            message: "Internal server error"
        });
    }
}
module.exports = {
    sendMessage,
    getMessages
};