class NotFoundError extends Error {
    constructor(m) {
        super(m);
        this.name = "NotFoundError";
        this.message = m;
        this.status = 404;
    }
}

class InvalidArgumentError extends Error {
    constructor(m) {
        super(m);
        this.name = "InvalidArgumentError";
        this.message = m;
        this.status = 500;
    }
}

class InvalidRequestError extends Error {
    constructor(m) {
        super(m);
        this.name = "InvalidRequestError";
        this.message = m || "Bad Request";
        this.status = 401;
    }
}

module.exports = { NotFoundError, InvalidArgumentError, InvalidRequestError };