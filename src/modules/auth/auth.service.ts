import { User } from '../../models/entities/user.entity';
import { getOrm } from '../../models/dataSource';
import { hashPassword, verifyPassword } from './utils/password';

export class UserAlreadyExistsError extends Error {
    constructor(email: string) {
        super(`A user with email "${email}" already exists.`);
        this.name = 'UserAlreadyExistsError';
    }
}

const normalizeEmail = (email: string): string => {
    return email.trim().toLowerCase();
};

export const registerUser = async (
    email: string,
    password: string
): Promise<User> => {
    const normalizedEmail = normalizeEmail(email);
    const orm = await getOrm();
    const em = orm.em.fork();

    const existingUser = await em.findOne(User, { email: normalizedEmail });
    if (existingUser) {
        throw new UserAlreadyExistsError(normalizedEmail);
    }

    const passwordHash = await hashPassword(password);
    const now = new Date();
    const user = em.create(User, {
        email: normalizedEmail,
        passwordHash,
        createdAt: now,
        updatedAt: now,
    });

    await em.persist(user).flush();
    return user;
};

export const authenticateUser = async (
    email: string,
    password: string
): Promise<User | null> => {
    const normalizedEmail = normalizeEmail(email);
    const orm = await getOrm();
    const em = orm.em.fork();

    const user = await em.findOne(User, { email: normalizedEmail });
    if (!user) {
        return null;
    }

    const isPasswordValid = await verifyPassword(password, user.passwordHash);
    if (!isPasswordValid) {
        return null;
    }

    return user;
};

export const getUserById = async (id: string): Promise<User | null> => {
    const orm = await getOrm();
    const em = orm.em.fork();

    return em.findOne(User, { id });
};
