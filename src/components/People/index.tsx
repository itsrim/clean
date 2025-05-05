import { FC } from "react";
import { Person } from "../../types/types";
import { parseISO, format } from "date-fns";
import { fr } from "date-fns/locale";

type AbsenceInputs = Record<number, { start: string; end: string }>;

type Props = {
  people: Person[];
  setPeople: React.Dispatch<React.SetStateAction<Person[]>>;
  newPersonName: string;
  setNewPersonName: (name: string) => void;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  absenceInputs: AbsenceInputs;
  setAbsenceInputs: React.Dispatch<React.SetStateAction<AbsenceInputs>>;
  addAbsenceRange: (id: number) => void;
};

export const People: FC<Props> = ({
  people,
  setPeople,
  newPersonName,
  setNewPersonName,
  searchTerm,
  setSearchTerm,
  absenceInputs,
  setAbsenceInputs,
  addAbsenceRange,
}) => {
  const handleAddPerson = () => {
    const name = newPersonName.trim();
    if (!name) return;

    setPeople((prev) => [
      ...prev,
      {
        id: prev.length ? Math.max(...prev.map((p) => p.id)) + 1 : 1,
        name,
        isAbsent: false,
        color: "has-background-grey-light",
        absences: [],
      },
    ]);
    setNewPersonName("");
  };

  return (
    <div>
      <div className="field is-grouped mb-4">
        <div className="control is-expanded">
          <input
            className="input"
            placeholder="New person name"
            value={newPersonName}
            onChange={(e) => setNewPersonName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleAddPerson()}
          />
        </div>
        <div className="control">
          <button className="button is-info" onClick={handleAddPerson}>
            + Add person
          </button>
        </div>
      </div>

      <input
        className="input mb-4"
        placeholder="Search people..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />

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
            .filter((p) =>
              p.name.toLowerCase().includes(searchTerm.toLowerCase())
            )
            .map((person) => (
              <tr key={person.id}>
                <td>{person.name}</td>
                <td>
                  <button
                    className="button is-outlined is-danger is-small"
                    onClick={() =>
                      setPeople((prev) =>
                        prev.filter((p) => p.id !== person.id)
                      )
                    }
                  >X</button>
                </td>
                <td>
                  {person.absences.length > 0
                    ? person.absences.map((a, idx) => (
                        <div
                          key={idx}
                          className="is-flex is-justify-content-space-between mb-1"
                        >
                          <span>
                            {format(parseISO(a.start), "dd/MM/yy", { locale: fr })} → {format(parseISO(a.end), "dd/MM/yy", { locale: fr })}
                          </span>
                          <button
                            className="delete is-small ml-2"
                            onClick={() =>
                              setPeople((prev) =>
                                prev.map((p) =>
                                  p.id === person.id
                                    ? {
                                        ...p,
                                        absences: p.absences.filter(
                                          (_, i) => i !== idx
                                        ),
                                      }
                                    : p
                                )
                              )
                            }
                          ></button>
                        </div>
                      ))
                    : "None"}
                </td>
                <td>
                  <div className="field is-grouped is-flex-wrap-wrap">
                    <p className="control">
                      <input
                        className="input calendar-white"
                        type="date"
                        value={absenceInputs[person.id]?.start || ""}
                        onChange={(e) =>
                          setAbsenceInputs((prev) => ({
                            ...prev,
                            [person.id]: {
                              ...prev[person.id],
                              start: e.target.value,
                            },
                          }))
                        }
                      />
                    </p>
                    <p className="control">
                      <input
                        className="input calendar-white"
                        type="date"
                        value={absenceInputs[person.id]?.end || ""}
                        onChange={(e) =>
                          setAbsenceInputs((prev) => ({
                            ...prev,
                            [person.id]: {
                              ...prev[person.id],
                              end: e.target.value,
                            },
                          }))
                        }
                      />
                    </p>
                    <p className="control">
                      <button
                          className="button is-primary is-outlined"
                        onClick={() => {
                          const { start, end } =
                            absenceInputs[person.id] || {};
                          if (
                            start &&
                            end &&
                            new Date(end) >= new Date(start)
                          ) {
                            addAbsenceRange(person.id);
                          } else {
                            alert("Invalid date range");
                          }
                        }}
                      >
                        Add
                      </button>
                    </p>
                  </div>
                </td>
              </tr>
            ))}
        </tbody>
      </table>
    </div>
  );
};
