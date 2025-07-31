import type { AbsenceFile, AbsenceState } from './AbsenceFile';
import type { AbsenceReason } from './AbsenceReason';
export declare class AbsenceFilesResponse extends Array<AbsenceFile> {
    constructor(absenceFiles: AbsenceFile[]);
    toCSV(): string;
}
export type { AbsenceFile, AbsenceState, AbsenceReason };
