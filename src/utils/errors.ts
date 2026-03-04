export class UserAlreadyExistsError extends Error {
    constructor(email: string) {
        super(`A user with email "${email}" already exists.`);
        this.name = 'UserAlreadyExistsError';
    }
}

export const AI_SERVICE_UNAVAILABLE_MESSAGE =
    'AI service is temporarily unavailable';

export class AiServiceUnavailableError extends Error {
    constructor(message = AI_SERVICE_UNAVAILABLE_MESSAGE) {
        super(message);
        this.name = 'AiServiceUnavailableError';
    }
}
