import { Person, TaskItem } from "../types/types";

export const initialPeople: Person[] = [
  { id: 1, name: "Alice", isAbsent: false, color: "has-background-danger-light", absences: [] },
  { id: 2, name: "Bob", isAbsent: false, color: "has-background-link-light", absences: [] },
  { id: 3, name: "Charlie", isAbsent: false, color: "has-background-success-light", absences: [] },
];

export const initialWeightedTasks: TaskItem[] = [
  { name: "Sol", weight: 1 },
  { name: "Vaisselle", weight: 2 },
  { name: "Lessives", weight: 4 },
];

export const months = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];