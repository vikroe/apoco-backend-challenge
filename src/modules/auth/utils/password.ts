import {
    randomBytes,
    scrypt as scryptCallback,
    timingSafeEqual,
} from 'node:crypto';
import { promisify } from 'node:util';

const SALT_BYTES = 16;
const HASH_BYTES = 64;

type ScryptAsync = (
    password: string,
    salt: string,
    keyLength: number
) => Promise<Buffer>;
const scrypt = promisify(scryptCallback) as ScryptAsync;

export const hashPassword = async (password: string): Promise<string> => {
    const salt = randomBytes(SALT_BYTES).toString('hex');
    const derivedKey = await scrypt(password, salt, HASH_BYTES);

    return `${salt}:${Buffer.from(derivedKey).toString('hex')}`;
};

export const verifyPassword = async (
    password: string,
    hashToCompare: string
): Promise<boolean> => {
    const [salt, storedHash] = hashToCompare.split(':');
    if (!salt || !storedHash) {
        return false;
    }

    const computedHash = await scrypt(password, salt, HASH_BYTES);
    const computedHashBuffer = Buffer.from(computedHash);
    const storedHashBuffer = Buffer.from(storedHash, 'hex');

    if (computedHashBuffer.length !== storedHashBuffer.length) {
        return false;
    }

    return timingSafeEqual(computedHashBuffer, storedHashBuffer);
};
