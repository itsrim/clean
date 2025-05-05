import { FC } from "react";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isWithinInterval, parseISO } from "date-fns";
import { fr } from "date-fns/locale";
import { CalendarTask, Person, TaskItem } from "../../types/types";
import "bulma/css/bulma.min.css";

type Props = {
  selectedMonth: string;
  months: string[];
  calendarAssignments: CalendarTask[];
  people: Person[];
  tasks: TaskItem[];
};

export const Calendar: FC<Props> = ({ selectedMonth, months, calendarAssignments, people }) => {
  const monthIndex = months.indexOf(selectedMonth);
  const year = new Date().getFullYear();
  const start = startOfMonth(new Date(year, monthIndex));
  const end = endOfMonth(new Date(year, monthIndex));
  const days = eachDayOfInterval({ start, end });

  return (
    <div className="columns is-multiline is-mobile">
      {days.map((day) => {
        const dateStr = format(day, "yyyy-MM-dd");
        const tasksForDay = calendarAssignments.filter((a) => a.date === dateStr);
        const absentPeople = people.filter((p) =>
          p.absences.some(({ start, end }) =>
            isWithinInterval(day, {
              start: parseISO(start),
              end: parseISO(end),
            })
          )
        );

        return (
          <div
            key={dateStr}
            className="column is-full-mobile is-one-third-tablet is-one-fifth-desktop is-one-seventh-widescreen"
          >
            <div className="box">
              <strong>{format(day, "EE dd MMM", { locale: fr })}</strong>
              <div className="mt-2">
                {absentPeople.map((person) => (
                  <p key={person.id} className="is-size-7 has-text-grey">
                    {person.name} absent
                  </p>
                ))}
                {tasksForDay.map((entry, idx) => {
                  const person = people.find((p) => p.id === entry.personId);
                  return (
                    <div
                      key={idx}
                      className={`tag is-light ${person?.color} has-text-black`}
                    >
                      {entry.task} - {person?.name}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};
