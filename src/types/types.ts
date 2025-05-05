export interface Person {
    id: number;
    name: string;
    isAbsent: boolean;
    color: string;
    absences: { start: string; end: string }[];
  }
  
  export interface CalendarTask {
    date: string;
    personId: number;
    task: string;
  }
  
  export interface TaskItem {
    name: string;
    weight: number;
  }