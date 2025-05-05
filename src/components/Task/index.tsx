import { FC, useRef } from "react";
import { TaskItem } from "../../types/types";

type Props = {
  tasks: TaskItem[];
  setTasks: React.Dispatch<React.SetStateAction<TaskItem[]>>;
};

export const Tasks: FC<Props> = ({ tasks, setTasks }) => {
  const nameRef = useRef<HTMLInputElement>(null);
  const weightRef = useRef<HTMLInputElement>(null);

  const addTask = () => {
    const name = nameRef.current?.value.trim() || "";
    const weight = parseInt(weightRef.current?.value || "", 10);

    if (name && weight >= 1 && weight <= 9) {
      setTasks((prev) => [...prev, { name, weight }]);
      if (nameRef.current) nameRef.current.value = "";
      if (weightRef.current) weightRef.current.value = "";
    } else {
      alert("Nom requis et poids entre 1 et 9");
    }
  };

  return (
    <div>
      <div className="field is-grouped mb-4">
        <div className="control is-expanded">
          <input
            className="input"
            placeholder="New task name"
            ref={nameRef}
            onKeyDown={(e) => e.key === "Enter" && addTask()}
          />
        </div>
        <div className="control">
          <input
            className="input"
            type="number"
            placeholder="Poids"
            defaultValue="1"
            ref={weightRef}
            min={1}
            max={9}
            style={{ width: "6rem" }}
            onKeyDown={(e) => e.key === "Enter" && addTask()}
          />
        </div>
        <div className="control">
          <button className="button is-success" onClick={addTask}>
            + Add Task
          </button>
        </div>
      </div>

      <table className="table is-fullwidth is-striped is-hoverable">
        <thead>
            <tr>
            <th>Nom</th>
            <th>Poids</th>
            <th></th>
            </tr>
        </thead>
        <tbody>
            {tasks.map((task, index) => (
            <tr key={index}>
                <td>
                <input
                    className="input"
                    value={task.name}
                    onChange={(e) => {
                    const newTasks = [...tasks];
                    newTasks[index].name = e.target.value;
                    setTasks(newTasks);
                    }}
                />
                </td>
                <td style={{ width: "6rem" }}>
                <input
                    className="input"
                    type="number"
                    min={1}
                    max={9}
                    value={task.weight}
                    onChange={(e) => {
                    const newTasks = [...tasks];
                    newTasks[index].weight = parseInt(e.target.value);
                    setTasks(newTasks);
                    }}
                />
                </td>
                <td>
                <button
                    className="delete is-small"
                    onClick={() =>
                    setTasks((prev) => prev.filter((_, i) => i !== index))
                    }
                ></button>
                </td>
            </tr>
            ))}
        </tbody>
    </table>
    </div>
  );
};
