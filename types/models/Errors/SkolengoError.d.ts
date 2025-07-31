export type ErrorCode = 'BLOCKED_ACCOUNT' | 'SKO_APP_NOT_SUBSCRIBED' | 'SUSPENDED_ACCOUNT' | 'null' | string;
export interface SkolengoErrorBody {
    /**
     * Code de status de l'erreur
     */
    status: string;
    /**
     * Code d'erreur
     */
    code: ErrorCode;
    /**
     * Identifiant du type d'erreur
     *
     * Exemple :
     * - PRONOTE_RESOURCES_NOT_READY
     */
    title: string;
    /**
     * Détails de l'erreur
     */
    detail: string;
}
export declare class SkolengoError extends Error implements SkolengoErrorBody {
    readonly status: string;
    readonly code: ErrorCode;
    readonly detail: string;
    readonly title: string;
    constructor(error: SkolengoErrorBody);
}
