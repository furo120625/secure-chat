import javax.crypto.Cipher;
import javax.crypto.KeyAgreement;
import javax.crypto.Mac;
import javax.crypto.spec.GCMParameterSpec;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.security.GeneralSecurityException;
import java.security.KeyFactory;
import java.security.KeyPair;
import java.security.KeyPairGenerator;
import java.security.PrivateKey;
import java.security.PublicKey;
import java.security.spec.PKCS8EncodedKeySpec;
import java.security.spec.X509EncodedKeySpec;
import java.util.Base64;
public class Receiver {
    private static final String HKDF_INFO = "e2ee-chat-v1";
    private static final int TAG_BITS = 128;
    // ============================================================
    // BƯỚC 1: Sinh cặp khóa X25519 dài hạn của người nhận
    // ============================================================
    static KeyPair generateKeyPair()
            throws GeneralSecurityException {
        return KeyPairGenerator
                .getInstance("X25519")
                .generateKeyPair();
    }
    // ============================================================
    // BƯỚC 2: Tính shared secret bằng X25519
    // ============================================================
    static byte[] x25519(
            PrivateKey myPrivate,
            PublicKey senderPublic)
            throws GeneralSecurityException {
        KeyAgreement ka =
                KeyAgreement.getInstance("X25519");
        ka.init(myPrivate);
        ka.doPhase(senderPublic, true);
        return ka.generateSecret();
    }
    // ============================================================
    // BƯỚC 3: HKDF-SHA256
    // Phải giống hệt Sender.java
    // ============================================================
    static byte[] hkdf(byte[] sharedSecret)
            throws GeneralSecurityException {
        Mac mac = Mac.getInstance("HmacSHA256");
        // Extract
        mac.init(
                new SecretKeySpec(
                        new byte[32],
                        "HmacSHA256"
                )
        );
        byte[] prk = mac.doFinal(sharedSecret);
        // Expand
        mac.init(
                new SecretKeySpec(
                        prk,
                        "HmacSHA256"
                )
        );
        mac.update(
                HKDF_INFO.getBytes(StandardCharsets.UTF_8)
        );
        mac.update((byte) 1);
        return mac.doFinal();
    }
    // ============================================================
    // BƯỚC 4: Derive AES key
    // ============================================================
    static byte[] deriveKey(
            PrivateKey recipientPrivate,
            String senderPublicKeyB64)
            throws GeneralSecurityException {
        PublicKey senderPublic =
                KeyFactory
                        .getInstance("X25519")
                        .generatePublic(
                                new X509EncodedKeySpec(
                                        Base64.getDecoder()
                                                .decode(senderPublicKeyB64)
                                )
                        );
        byte[] sharedSecret =
                x25519(
                        recipientPrivate,
                        senderPublic
                );
        return hkdf(sharedSecret);
    }
    // ============================================================
    // BƯỚC 5: AES-256-GCM decrypt
    // Ciphertext đã bao gồm authentication tag
    // ============================================================
    static String aesGcmDecrypt(
            byte[] aesKey,
            byte[] iv,
            byte[] ciphertext)
            throws GeneralSecurityException {
        Cipher cipher =
                Cipher.getInstance(
                        "AES/GCM/NoPadding"
                );
        cipher.init(
                Cipher.DECRYPT_MODE,
                new SecretKeySpec(aesKey, "AES"),
                new GCMParameterSpec(TAG_BITS, iv)
        );
        byte[] plaintext =
                cipher.doFinal(ciphertext);
        return new String(
                plaintext,
                StandardCharsets.UTF_8
        );
    }
    // ============================================================
    // Helper: Base64 -> PrivateKey
    // ============================================================
    static PrivateKey importPrivateKey(
            String privateKeyB64)
            throws GeneralSecurityException {
        byte[] encoded =
                Base64.getDecoder()
                        .decode(privateKeyB64);
        return KeyFactory
                .getInstance("X25519")
                .generatePrivate(
                        new PKCS8EncodedKeySpec(encoded)
                );
    }
    // ============================================================
    // HÀM TỔNG
    // ============================================================
    static String decryptMessage(
            PrivateKey recipientPrivate,
            String senderPublicKeyB64,
            String ivB64,
            String ciphertextB64)
            throws GeneralSecurityException {
        byte[] aesKey =
                deriveKey(
                        recipientPrivate,
                        senderPublicKeyB64
                );
        byte[] iv =
                Base64.getDecoder()
                        .decode(ivB64);
        byte[] ciphertext =
                Base64.getDecoder()
                        .decode(ciphertextB64);
        return aesGcmDecrypt(
                aesKey,
                iv,
                ciphertext
        );
    }
}