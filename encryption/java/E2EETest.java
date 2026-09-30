import java.security.KeyPair;
import java.util.Base64;
public class E2EETest {
    public static void main(String[] args) throws Exception {
        String message = "Xin chào Quân";
        // 1. Receiver tạo cặp khóa dài hạn
        KeyPair receiverKeys =
                Receiver.generateKeyPair();
        // 2. Sender tạo cặp khóa dùng cho message này
        KeyPair senderEphemeralKeys =
                Sender.generateKeyPair();
        // 3. Sender derive AES key
        String receiverPublicKey =
                Sender.exportPublicKey(
                        receiverKeys.getPublic()
                );
        byte[] senderAesKey =
                Sender.deriveKey(
                        senderEphemeralKeys.getPrivate(),
                        receiverPublicKey
                );
        // 4. Sender encrypt
        Sender.Encrypted encrypted =
                Sender.aesGcmEncrypt(
                        senderAesKey,
                        message
                );
        // 5. Chuyển sender public key thành Base64
        String senderPublicKey =
                Sender.exportPublicKey(
                        senderEphemeralKeys.getPublic()
                );
        // 6. Receiver derive cùng AES key
        byte[] receiverAesKey =
                Receiver.deriveKey(
                        receiverKeys.getPrivate(),
                        senderPublicKey
                );
        // 7. Receiver decrypt
        String decrypted =
                Receiver.aesGcmDecrypt(
                        receiverAesKey,
                        encrypted.iv,
                        encrypted.ciphertext
                );
        System.out.println("Original : " + message);
        System.out.println("Decrypted: " + decrypted);
        System.out.println(
                "AES keys match: "
                        + java.util.Arrays.equals(
                        senderAesKey,
                        receiverAesKey
                )
        );
        System.out.println(
                "Message match: "
                        + message.equals(decrypted)
        );
        System.out.println(
                "IV: "
                        + Base64.getEncoder()
                        .encodeToString(encrypted.iv)
        );
        System.out.println(
                "Ciphertext: "
                        + Base64.getEncoder()
                        .encodeToString(encrypted.ciphertext)
        );
    }
}