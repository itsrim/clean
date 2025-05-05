import { useState } from "react";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isWithinInterval, parseISO } from "date-fns";
import "bulma/css/bulma.min.css";
import { CalendarTask, Person, TaskItem } from "../types/types";
import { initialPeople, initialWeightedTasks, months } from "../constants/initialValues";
import { Tasks } from "./Task";
import { CalendarRepartition } from "./CalendarRepartition";
import { People } from "./People";

export const TaskDistributor = () => {
  const [people, setPeople] = useState<Person[]>(initialPeople);
  const [tasks, setTasks] = useState<TaskItem[]>(initialWeightedTasks);
  const [calendarAssignments, setCalendarAssignments] = useState<CalendarTask[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [selectedMonth, setSelectedMonth] = useState<string>(months[new Date().getMonth()]);
  const [absenceInputs, setAbsenceInputs] = useState<Record<number, { start: string; end: string }>>({});
  const [tab, setTab] = useState<string>("people");
  const [newPersonName, setNewPersonName] = useState<string>("");

  // const toggleAbsence = (id: number) => {
  //   setPeople((prev) =>
  //     prev.map((p) => (p.id === id ? { ...p, isAbsent: !p.isAbsent } : p))
  //   );
  // };

  const addAbsenceRange = (id: number) => {
    const { start, end } = absenceInputs[id] || {};
    if (!start || !end) return;
    setPeople((prev) =>
      prev.map((p) =>
        p.id === id
          ? { ...p, absences: [...p.absences, { start, end }] }
          : p
      )
    );
    setAbsenceInputs((prev) => ({ ...prev, [id]: { start: "", end: "" } }));
  };

  const distributeTasks = () => {
    const monthIndex = months.indexOf(selectedMonth);
    const year = new Date().getFullYear();
    const start = startOfMonth(new Date(year, monthIndex));
    const end = endOfMonth(new Date(year, monthIndex));
    const days = eachDayOfInterval({ start, end });
    const newAssignments: CalendarTask[] = [];
    const taskOccurrences: { [personId: number]: number } = {};
    people.forEach(p => taskOccurrences[p.id] = 0);

    days.forEach((date) => {
      const dayStr = format(date, "yyyy-MM-dd");
      const availablePeople = people.filter((p) => {
        return !p.absences.some(({ start, end }) =>
          isWithinInterval(date, {
            start: parseISO(start),
            end: parseISO(end),
          })
        );
      });

      const sortedPeople = [...availablePeople].sort((a, b) => taskOccurrences[a.id] - taskOccurrences[b.id]);
      const sortedTasks = [...tasks].sort((a, b) => b.weight - a.weight);

      sortedTasks.forEach((task, idx) => {
        const assignee = sortedPeople[idx % sortedPeople.length];
        if (assignee) {
          taskOccurrences[assignee.id] += task.weight;
          newAssignments.push({
            date: dayStr,
            personId: assignee.id,
            task: task.name,
          });
        }
      });
    });

    setCalendarAssignments(newAssignments);
  };

  return (
    <div className="container p-4" style={{ backgroundColor: '#000', minHeight: '100vh' }}>
      <h1 className="title">Task Distributor</h1>
      <div className="tabs is-toggle is-toggle-rounded">
        <ul>
          <li className={tab === "people" ? "is-active" : ""} onClick={() => setTab("people")}><a>People</a></li>
          <li className={tab === "tasks" ? "is-active" : ""} onClick={() => setTab("tasks")}><a>Monthly Tasks</a></li>
          <li className={tab === "taskconfig" ? "is-active" : ""} onClick={() => setTab("taskconfig")}><a>Tasks</a></li>
        </ul>
      </div>

      {tab === "people" && (
        <People
          people={people}
          setPeople={setPeople}
          newPersonName={newPersonName}
          setNewPersonName={setNewPersonName}
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          absenceInputs={absenceInputs}
          setAbsenceInputs={setAbsenceInputs}
          addAbsenceRange={addAbsenceRange}
        />
      )}

      {tab === "tasks" && (
        <CalendarRepartition
          selectedMonth={selectedMonth}
          setSelectedMonth={setSelectedMonth}
          months={months}
          distributeTasks={distributeTasks}
          calendarAssignments={calendarAssignments}
          people={people}
          tasks={tasks}
          />
        )}

      {tab === "taskconfig" &&   <Tasks tasks={tasks} setTasks={setTasks} />}
    </div>
  );
}
