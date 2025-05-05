import { useState } from "react";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isWithinInterval, parseISO } from "date-fns";
import { fr } from 'date-fns/locale';
import "bulma/css/bulma.min.css";

interface Person {
  id: number;
  name: string;
  isAbsent: boolean;
  color: string;
  absences: { start: string; end: string }[];
}

interface CalendarTask {
  date: string;
  personId: number;
  task: string;
}

interface TaskItem {
  name: string;
  weight: number;
}

const initialPeople: Person[] = [
  { id: 1, name: "Alice", isAbsent: false, color: "has-background-danger-light", absences: [] },
  { id: 2, name: "Bob", isAbsent: false, color: "has-background-link-light", absences: [] },
  { id: 3, name: "Charlie", isAbsent: false, color: "has-background-success-light", absences: [] },
];

const initialWeightedTasks: TaskItem[] = [
  { name: "Sol", weight: 1 },
  { name: "Vaisselle", weight: 2 },
  { name: "Lessives", weight: 4 },
];

const months = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

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

  const renderCalendar = () => {
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
            <div key={dateStr} className="column is-full-mobile is-one-third-tablet is-one-fifth-desktop is-one-seventh-widescreen">
              <div className="box">
                <strong>{format(day, "EE dd MMM", { locale: fr })}
                </strong>
                <div className="mt-2">
                  {absentPeople.map((person) => (
                    <p key={person.id} className="is-size-7 has-text-grey">
                      {person.name} absent
                    </p>
                  ))}
                  {tasksForDay.map((entry, idx) => {
                    const person = people.find((p) => p.id === entry.personId);
                    return (
                      <div key={idx} className={`tag is-light ${person?.color} has-text-black`}>{entry.task} - {person?.name} </div>
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
        <div>
          <div className="field is-grouped mb-4">
            <div className="control is-expanded">
              <input
                className="input"
                placeholder="New person name"
                value={newPersonName}
                onChange={(e) => setNewPersonName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && newPersonName.trim()) {
                    const name = newPersonName.trim();
                    setPeople((prev) => [...prev, {
                      id: prev.length ? Math.max(...prev.map(p => p.id)) + 1 : 1,
                      name,
                      isAbsent: false,
                      color: "has-background-grey-light",
                      absences: []
                    }]);
                    setNewPersonName("");
                  }
                }}
              />
            </div>
            <div className="control">
              <button className="button is-info" onClick={() => {
                if (newPersonName.trim()) {
                  const name = newPersonName.trim();
                  setPeople((prev) => [...prev, {
                    id: prev.length ? Math.max(...prev.map(p => p.id)) + 1 : 1,
                    name,
                    isAbsent: false,
                    color: "has-background-grey-light",
                    absences: []
                  }]);
                  setNewPersonName("");
                }
              }}>+ Add person</button>
            </div>
          </div>
          <input className="input mb-4" placeholder="Search people..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
          <table className="table is-fullwidth is-striped is-hoverable">
            <thead>
              <tr>
                <th>Name</th>
<th></th>
                <th>Absences</th>
                <th>Add Absence</th>
              </tr>
            </thead>
            <tbody>
              {people
                .filter((p) => p.name.toLowerCase().includes(searchTerm.toLowerCase()))
                .map((person) => (
                  <tr key={person.id}>
                    <td>{person.name}</td>
<td><button className="delete" onClick={() => setPeople(prev => prev.filter(p => p.id !== person.id))}></button></td>
                    <td>
                      {person.absences.length > 0 ? person.absences.map((a, idx) => (
                        <div key={idx} className="is-flex is-justify-content-space-between mb-1">
                          <span>{a.start} → {a.end}</span>
                          <button className="delete is-small ml-2" onClick={() => {
                            setPeople((prev) =>
                              prev.map((p) => p.id === person.id
                                ? { ...p, absences: p.absences.filter((_, i) => i !== idx) }
                                : p)
                            );
                          }}></button>
                        </div>
                      )) : "None"}
                    </td>
                    <td>
                      <div className="field is-grouped is-flex-wrap-wrap">
                        <p className="control">
                          <input className="input" type="date" value={absenceInputs[person.id]?.start || ""} onChange={(e) => setAbsenceInputs((prev) => ({ ...prev, [person.id]: { ...prev[person.id], start: e.target.value } }))} />
                        </p>
                        <p className="control">
                          <input className="input" type="date" value={absenceInputs[person.id]?.end || ""} onChange={(e) => setAbsenceInputs((prev) => ({ ...prev, [person.id]: { ...prev[person.id], end: e.target.value } }))} />
                        </p>
                        <p className="control">
                          <button className="button is-small" onClick={() => {
                            const { start, end } = absenceInputs[person.id] || {};
                            if (start && end && new Date(end) >= new Date(start)) {
                              addAbsenceRange(person.id);
                            } else {
                              alert("Invalid date range");
                            }
                          }}>Add</button>
                        </p>
                      </div>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      )}

      {tab === "tasks" && (
        <div>
          <div className="field is-grouped mb-4">
            <div className="control">
              <div className="select">
                <select value={selectedMonth} onChange={(e) => setSelectedMonth(e.target.value)}>
                  {months.map((month) => <option key={month} value={month}>{month}</option>)}
                </select>
              </div>
            </div>
            <div className="control">
              <button className="button is-primary" onClick={distributeTasks}>Distribute Tasks</button>
            </div>
          </div>
          {renderCalendar()}
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
                      const task = tasks.find(t => t.name === entry.task);
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
      )}

      {tab === "taskconfig" && (
        <div>
          <div className="field is-grouped mb-4">
            <div className="control is-expanded">
              <input className="input" placeholder="New task name" id="new-task-name" onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  const nameInput = document.getElementById('new-task-name') as HTMLInputElement;
                  const weightInput = document.getElementById('new-task-weight') as HTMLInputElement;
                  const name = nameInput.value.trim();
                  const weight = parseInt(weightInput.value);
                  if (name && weight >= 1 && weight <= 9) {
                    setTasks((prev) => [...prev, { name, weight }]);
                    nameInput.value = '';
                    weightInput.value = '';
                  } else {
                    alert('Nom requis et poids entre 1 et 9');
                  }
                }
              }} />
            </div>
            <div className="control">
              <input className="input" type="number" placeholder="Poids" id="new-task-weight" min={1} max={9} style={{ width: '6rem' }} onKeyDown={(e) => {
  if (e.key === 'Enter') {
    const nameInput = document.getElementById('new-task-name') as HTMLInputElement;
    const weightInput = document.getElementById('new-task-weight') as HTMLInputElement;
    const name = nameInput.value.trim();
    const weight = parseInt(weightInput.value);
    if (name && weight >= 1 && weight <= 9) {
      setTasks((prev) => [...prev, { name, weight }]);
      nameInput.value = '';
      weightInput.value = '';
    } else {
      alert('Nom requis et poids entre 1 et 9');
    }
  }
}} />
            </div>
            <div className="control">
              <button className="button is-success" onClick={() => {
                const nameInput = document.getElementById('new-task-name') as HTMLInputElement;
                const weightInput = document.getElementById('new-task-weight') as HTMLInputElement;
                const name = nameInput.value.trim();
                const weight = parseInt(weightInput.value);
                if (name && weight >= 1 && weight <= 9) {
                  setTasks((prev) => [...prev, { name, weight }]);
                  nameInput.value = '';
                  weightInput.value = '';
                } else {
                  alert('Nom requis et poids entre 1 et 9');
                }
              }}>+ Add Task</button>
            </div>
          </div>
          <div className="box">
            {tasks.map((task, index) => (
              <div key={index} className="field is-grouped mb-2 is-align-items-center">
                <p className="control is-expanded">
                  <input className="input" value={task.name} onChange={(e) => {
                    const newTasks = [...tasks];
                    newTasks[index].name = e.target.value;
                    setTasks(newTasks);
                  }} />
                </p>
                <p className="control">
                  <input className="input" type="number" min={1} max={9} value={task.weight} onChange={(e) => {
                    const newTasks = [...tasks];
                    newTasks[index].weight = parseInt(e.target.value);
                    setTasks(newTasks);
                  }} />
                </p>
                <p className="control">
                  <button className="delete is-small" onClick={() => {
                    setTasks((prev) => prev.filter((_, i) => i !== index));
                  }}></button>
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
