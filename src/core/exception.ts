/// ///HTTP Exception
export class HttpException extends Error {
	constructor(
        public readonly message: string,
        public readonly statusCode: number,
	) {
		super(message);
	}
}

/// ///TypeORM Exception
export class SQLException extends Error {
	constructor(
        public readonly message: string,
        public readonly error: number,
	) {
		super(message);
	}
}

/// ///Validation Exception
export class ValidationException extends Error {
	constructor(
        public readonly details: string,
	) {
		super(details);
	}
}
//user auth
export class UnauthenticatedException extends Error {
    constructor(message: string) {
        super(message);
    }
}