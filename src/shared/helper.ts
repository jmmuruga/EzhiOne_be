import * as crypto from "crypto";

export function encryptString(data: string, secretKey: string): string {
    try {
        const algorithm = "aes-256-cbc"; // fixed algorithm
        const key = Buffer.from(
            "52d1542a9ee07bb807375a552983abf2386dc5e1e7ddc66dfb78b3c8533ee63b",
            "hex"
        );
        const iv = Buffer.from("ef953c62cfcff791f31efe8cd91ac20d", "hex");

        const cipher = crypto.createCipheriv(algorithm, key, iv);
        let encrypted = cipher.update(data, "utf8", "hex");
        encrypted += cipher.final("hex");
        return encrypted;
    } catch (err) {
        throw err;
    }
}

export function decrypter(data: string) {
    const algorithm = "aes-256-cbc";
    const key = Buffer.from(
        "52d1542a9ee07bb807375a552983abf2386dc5e1e7ddc66dfb78b3c8533ee63b",
        "hex"
    );
    const iv = Buffer.from("ef953c62cfcff791f31efe8cd91ac20d", "hex");

    const decipher = crypto.createDecipheriv(algorithm, key, iv);
    let decrypted = decipher.update(data, "hex", "utf8");
    decrypted += decipher.final("utf8");
    return decrypted;
}

export function generateOpt(): string {
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    return otp;
}