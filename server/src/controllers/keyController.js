const db = require("../config/database");
async function savePublicKey(req, res) {
    try {
        if (!req.session.userId) {
            return res.status(401).json({
                message: "Not authenticated"
            });
        }
        const userId = req.session.userId;
        const {
            publicKey,
            algorithm,
            encryptedPrivateKey,
            salt,
            iv
        } = req.body;
        if (
            !publicKey ||
            !algorithm ||
            !encryptedPrivateKey ||
            !salt ||
            !iv
        ) {
            return res.status(400).json({
                message: "All key data is required"
            });
        }
        await db.promise().query(
            `INSERT INTO public_keys
             (
                 user_id,
                 public_key,
                 algorithm,
                 encrypted_private_key,
                 encryption_salt,
                 encryption_iv
             )
             VALUES (?, ?, ?, ?, ?, ?)
                 ON DUPLICATE KEY UPDATE
                                      public_key = VALUES(public_key),
                                      algorithm = VALUES(algorithm),
                                      encrypted_private_key = VALUES(encrypted_private_key),
                                      encryption_salt = VALUES(encryption_salt),
                                      encryption_iv = VALUES(encryption_iv)`,
            [
                userId,
                publicKey,
                algorithm,
                encryptedPrivateKey,
                salt,
                iv
            ]
        );
        res.json({
            message: "Public key and encrypted private key saved"
        });
    } catch (error) {
        console.error(
            "Save public key error:",
            error
        );
        res.status(500).json({
            message: "Internal server error"
        });
    }
}
async function getPublicKey(req, res) {
    try {
        if (!req.session.userId) {
            return res.status(401).json({
                message: "Not authenticated"
            });
        }
        const { userId } = req.params;
        const [keys] = await db.promise().query(
            `SELECT
                 public_key,
                 algorithm
             FROM public_keys
             WHERE user_id = ?`,
            [userId]
        );
        if (keys.length === 0) {
            return res.status(404).json({
                message: "Public key not found"
            });
        }
        res.json({
            publicKey: keys[0].public_key,
            algorithm: keys[0].algorithm
        });
    } catch (error) {
        console.error(
            "Get public key error:",
            error
        );
        res.status(500).json({
            message: "Internal server error"
        });
    }
}
async function getMyPrivateKey(req, res) {
    try {
        if (!req.session.userId) {
            return res.status(401).json({
                message: "Not authenticated"
            });
        }
        const userId = req.session.userId;
        const [keys] = await db.promise().query(
            `SELECT
                encrypted_private_key,
                encryption_salt,
                encryption_iv
             FROM public_keys
             WHERE user_id = ?`,
            [userId]
        );
        if (keys.length === 0) {
            return res.status(404).json({
                message: "Encrypted private key not found"
            });
        }
        if (
            !keys[0].encrypted_private_key ||
            !keys[0].encryption_salt ||
            !keys[0].encryption_iv
        ) {
            return res.status(404).json({
                message: "Encrypted private key not available"
            });
        }
        res.json({
            encryptedPrivateKey:
            keys[0].encrypted_private_key,
            salt:
            keys[0].encryption_salt,
            iv:
            keys[0].encryption_iv
        });
    } catch (error) {
        console.error(
            "Get private key error:",
            error
        );
        res.status(500).json({
            message: "Internal server error"
        });
    }
}
module.exports = {
    savePublicKey,
    getPublicKey,
    getMyPrivateKey
};