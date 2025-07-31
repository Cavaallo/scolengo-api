"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SkolengoError = void 0;
class SkolengoError extends Error {
    status;
    code;
    detail;
    title;
    constructor(error) {
        super(error.detail);
        this.name = error.title;
        this.title = error.title;
        this.status = error.status;
        this.code = error.code;
        this.detail = error.detail;
        Error.captureStackTrace(this, this.constructor);
    }
}
exports.SkolengoError = SkolengoError;
