export type ValidationResponse<T = undefined> = {
    valid: boolean;
    message: string;
	record?: T;
}