"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AbsenceFilesResponse = void 0;
class AbsenceFilesResponse extends Array {
    constructor(absenceFiles) {
        super(absenceFiles.length);
        for (let i = 0; i < absenceFiles.length; i++) {
            this[i] = absenceFiles[i];
        }
    }
    toCSV() {
        return 'created,type,status,start,end,reason,reason_label\n' +
            [...this].map(file => {
                const { creationDateTime, absenceType, absenceFileStatus, absenceStartDateTime, absenceEndDateTime, absenceReason } = file.currentState;
                return `${creationDateTime},${absenceType},${absenceFileStatus},${absenceStartDateTime},${absenceEndDateTime},"${absenceReason?.code ?? ''}","${absenceReason?.longLabel ?? ''}"`;
            }).join('\n');
    }
}
exports.AbsenceFilesResponse = AbsenceFilesResponse;
