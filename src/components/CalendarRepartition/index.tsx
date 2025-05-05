import { FC } from "react";
import { Calendar } from "./Calendar";
import { CalendarTask, Person, TaskItem } from "../../types/types";

type Props = {
  selectedMonth: string;
  setSelectedMonth: (value: string) => void;
  months: string[];
  distributeTasks: () => void;
  calendarAssignments: CalendarTask[];
  people: Person[];
  tasks: TaskItem[];
};

export const CalendarRepartition: FC<Props> = ({
  selectedMonth,
  setSelectedMonth,
  months,
  distributeTasks,
  calendarAssignments,
  people,
  tasks,
}) => {
  return (
    <div>
      <div className="field is-grouped mb-4">
        <div className="control">
          <div className="select">
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
            >
              {months.map((month) => (
                <option key={month} value={month}>
                  {month}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div className="control">
          <button className="button is-primary" onClick={distributeTasks}>
            Distribute Tasks
          </button>
        </div>
      </div>

      <Calendar
        selectedMonth={selectedMonth}
        months={months}
        calendarAssignments={calendarAssignments}
        people={people}
        tasks={tasks}
      />

      <div className="mt-4">
        <h2 className="subtitle has-text-white">Poids total par personne</h2>
        <table className="table is-fullwidth is-striped is-hoverable">
          <thead>
            <tr>
              <th>Nom</th>
              <th>Poids total</th>
            </tr>
          </thead>
          <tbody>
            {people.map((p) => {
              const poidsTotal = calendarAssignments.reduce((acc, entry) => {
                if (entry.personId === p.id) {
                  const task = tasks.find((t) => t.name === entry.task);
                  return acc + (task?.weight || 0);
                }
                return acc;
              }, 0);

              return (
                <tr key={p.id}>
                  <td>{p.name}</td>
                  <td>{poidsTotal}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
