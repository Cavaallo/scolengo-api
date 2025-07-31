import type { Agenda } from './Agenda';
import type { Lesson } from './Lesson';
import type { HomeworkAssignment } from './HomeworkAssignment';
export declare class AgendaResponse extends Array<Agenda> {
    constructor(response: Agenda[]);
    static lessonToVEVENT(lesson: Lesson, dtstamp?: Date): string;
    toICalendar(dtstamp?: Date, name?: string): string;
}
export type { Agenda, Lesson, HomeworkAssignment };
