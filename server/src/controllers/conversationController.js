const crypto = require("crypto");
const db = require("../config/database");
async function createConversation(req, res) {
    try {
        if (!req.session.userId) {
            return res.status(401).json({
                message: "Not authenticated"
            });
        }
        const userId = req.session.userId;
        const { friendId } = req.body;
        if (!friendId) {
            return res.status(400).json({
                message: "Friend ID is required"
            });
        }
        if (userId === friendId) {
            return res.status(400).json({
                message: "You cannot create a conversation with yourself"
            });
        }
        // Check accepted friendship
        const [friendships] = await db.promise().query(
            `SELECT id
             FROM friendships
             WHERE status = 'accepted'
               AND (
                 (user1_id = ? AND user2_id = ?)
                     OR
                 (user1_id = ? AND user2_id = ?)
                 )`,
            [
                userId,
                friendId,
                friendId,
                userId
            ]
        );
        if (friendships.length === 0) {
            return res.status(403).json({
                message: "You are not friends with this user"
            });
        }
        // Check existing conversation
        const [existingConversations] =
            await db.promise().query(
                `SELECT c.id
                 FROM conversations c
                          JOIN conversation_members cm1
                               ON c.id = cm1.conversation_id
                          JOIN conversation_members cm2
                               ON c.id = cm2.conversation_id
                 WHERE cm1.user_id = ?
                   AND cm2.user_id = ?
                     LIMIT 1`,
                [
                    userId,
                    friendId
                ]
            );
        if (existingConversations.length > 0) {
            return res.json({
                message: "Conversation already exists",
                conversationId:
                existingConversations[0].id
            });
        }
        // Create conversation
        const conversationId =
            crypto.randomUUID();
        await db.promise().query(
            `INSERT INTO conversations (id)
             VALUES (?)`,
            [conversationId]
        );
        // Add current user
        await db.promise().query(
            `INSERT INTO conversation_members
                 (conversation_id, user_id)
             VALUES (?, ?)`,
            [
                conversationId,
                userId
            ]
        );
        // Add friend
        await db.promise().query(
            `INSERT INTO conversation_members
                (conversation_id, user_id)
             VALUES (?, ?)`,
            [
                conversationId,
                friendId
            ]
        );
        res.status(201).json({
            message: "Conversation created",
            conversationId
        });
    } catch (error) {
        console.error(
            "Create conversation error:",
            error
        );
        res.status(500).json({
            message: "Internal server error"
        });
    }
}
async function getConversations(req, res) {
    try {
        if (!req.session.userId) {
            return res.status(401).json({
                message: "Not authenticated"
            });
        }
        const userId = req.session.userId;
        const [conversations] = await db.promise().query(
            `SELECT
                c.id AS conversation_id,
                cm.user_id
             FROM conversations c
             JOIN conversation_members cm
                ON c.id = cm.conversation_id
             WHERE c.id IN (
                SELECT conversation_id
                FROM conversation_members
                WHERE user_id = ?
             )
             AND cm.user_id != ?
             ORDER BY c.created_at ASC`,
            [userId, userId]
        );
        res.json(conversations);
    } catch (error) {
        console.error("Get conversations error:", error);
        res.status(500).json({
            message: "Internal server error"
        });
    }
}
module.exports = {
    createConversation,
    getConversations
};