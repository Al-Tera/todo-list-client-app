"use client";

import { useEffect, useRef, useState } from "react";
import { useClickAway } from "react-use";
// import { SvgDate as MyIcon } from "../assets/date.svg";
import IconPriority from "../assets/priority.svg";
import {
  addHistory,
  addList,
  deleteList,
  ITask,
  loadHistory,
  loadList,
  loadTotalGroups,
  selectList,
  updateList,
} from "@/lib/taskSlice";

import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import Image from "next/image";

export const TaskList = () => {
  const dispatch = useAppDispatch();
  const titleRef = useRef(null);
  const dueRef = useRef(null);
  const priorityRef = useRef(null);
  const descriptionRef = useRef(null);
  const [createActive, setCreateActive] = useState(false);
  const [taskOpen, setTaskOpen] = useState<ITask>({
    id: null,
    title: "No task open",
    due: "",
    group: null,
    priority: null,
    description: null,
    subTasks: null,
  });

  const [dueDiff, setDueDiff] = useState("");
  const priorityLevel = ["Low", "Medium", "High", "None"];
  const [inputTitleActive, setInputTitleActive] = useState(false);
  const [inputPriorityActive, setInputPriorityActive] = useState(false);
  const [inputDueActive, setInputDueActive] = useState(false);
  const [inputDescriptionActive, setInputDescriptionActive] = useState(false);
  const totalList = useAppSelector(selectList);
  const [toDelete, setToDelete] = useState<string[]>([]);
  const [search, setSearch] = useState<string>("");

  useEffect(() => {
    const storedList = localStorage.getItem("list");
    const storedTotalGroups = localStorage.getItem("totalGroups");
    const storedHistory = localStorage.getItem("history");
    if (storedList) {
      const parseList = JSON.parse(storedList);
      dispatch(loadList(parseList));
    }
    if (storedTotalGroups) {
      const parseTotalGroups = JSON.parse(storedTotalGroups);
      dispatch(loadTotalGroups(parseTotalGroups));
    }
    if (storedHistory) {
      const parseHistory = JSON.parse(storedHistory);
      dispatch(loadHistory(parseHistory));
    }
  }, []);

  const onSubmit = (e: any) => {
    e.preventDefault();
    const title = e.target["task_name"].value;
    const newList = {
      id: crypto.randomUUID(),
      title,
      due: "",
      group: null,
      priority: null,
      description: null,
      subTasks: null,
    };

    dispatch(addList(newList));
    const newHistory = `Added [${title}]`;
    dispatch(addHistory(newHistory));
    e.target["task_name"].value = "";
  };

  const viewTask = (todo: ITask) => {
    const findListItem = Object.entries(totalList).find(
      ([_, list]) => list.id === todo.id
    );
    if (findListItem) setTaskOpen(findListItem[1]);
  };

  const updateHistory = (key: string, name: string, value: string) => {
    const newHistory = `Updated [${key}] of [${name}] to [${value}]`;
    dispatch(addHistory(newHistory));
  };

  const updateListPriority = (priority: string) => {
    setInputPriorityActive(false);
    const updatePriority = { ...taskOpen, priority };
    dispatch(
      updateList({
        id: updatePriority.id || "",
        key: "priority",
        value: priority,
      })
    );
    setTaskOpen(updatePriority);
    updateHistory("priority", taskOpen.title, priority);
  };

  const updateListDue = (daysToAdd: string) => {
    const convertDaysNum = parseInt(daysToAdd.replace(/\D/g, ""));
    setInputPriorityActive(false);
    const taskDate = new Date();
    taskDate.setDate(taskDate.getDate() + convertDaysNum);

    const isValidDays = !isNaN(taskDate.getTime());
    const newDate = taskDate.toISOString().split("T")[0];

    if (isValidDays) {
      const updateDue = { ...taskOpen, due: newDate };
      dispatch(
        updateList({
          id: updateDue.id || "",
          key: "due",
          value: newDate,
        })
      );
      setTaskOpen(updateDue);

      updateHistory("due", taskOpen.title, newDate);
      setInputDueActive(false);
      differDue();
    }
  };

  const handleSubmitDue = (e: any) => {
    e.preventDefault();
    const daysToAdd = e.target["task_due"].value;
    const isValid = /^<\d+[d]$/i.test(e.target["task_due"].value);

    if (isValid) {
      e.target["task_due"].value = "";
      updateListDue(daysToAdd);
    }
  };

  const updateListDate = (date: string) => {
    const updateDate = { ...taskOpen, due: date };
    dispatch(
      updateList({
        id: updateDate.id || "",
        key: "due",
        value: date,
      })
    );
    setTaskOpen(updateDate);
    updateHistory("due", taskOpen.title, date);
    setInputDueActive(false);
    differDue();
  };

  const handleDateChange = (e: any) => {
    const newDate = e.target.value;
    updateListDate(newDate);
    setInputDueActive(false);
  };

  const updateListTitle = (title: string) => {
    setInputPriorityActive(false);
    const updateTitle = { ...taskOpen, title };
    dispatch(
      updateList({
        id: updateTitle.id || "",
        key: "title",
        value: title,
      })
    );
    setTaskOpen(updateTitle);
    updateHistory("title", taskOpen.title, title);
    setInputTitleActive(false);
  };

  const handleSubmitTitle = (e: any) => {
    e.preventDefault();
    const value = e.target["task_title"].value;
    updateListTitle(value);
  };

  const handleSubmitPriority = (e: any) => {
    e.preventDefault();
    const value = e.target["task_priority"].value;
    const lcPLevel = priorityLevel.find(
      (m) => m.toLocaleLowerCase() === value.toLocaleLowerCase()
    );
    if (lcPLevel) updateListPriority(lcPLevel);
  };

  const updateListDescription = (description: string) => {
    const updateDescription = { ...taskOpen, description };
    dispatch(
      updateList({
        id: updateDescription.id || "",
        key: "description",
        value: description,
      })
    );
    setTaskOpen(updateDescription);
    updateHistory("description", taskOpen.title, description.substring(0, 75));
    setInputDescriptionActive(false);
  };

  const handleSubmitDescription = (e: any) => {
    const value = e.target.value;
    updateListDescription(value);
    e.target.value = "";
  };

  const handleKeyDown = (e: any) => {
    if (e.keyCode === 13) {
      e.preventDefault();
      handleSubmitDescription(e);
    }
  };

  const handleCheckBox = (e: any) => {
    if (e.target.checked) {
      setToDelete((prev) => [...prev, e.target.value]);
    } else {
      const removeFromDelete = toDelete.filter((f) => f !== e.target.value);
      setToDelete(removeFromDelete);
    }
  };

  useClickAway(titleRef, () => {
    setInputTitleActive(false);
  });
  useClickAway(dueRef, () => {
    setInputDueActive(false);
  });
  useClickAway(priorityRef, () => {
    setInputPriorityActive(false);
  });
  useClickAway(descriptionRef, () => {
    setInputDescriptionActive(false);
  });

  const differDue = () => {
    if (taskOpen.due !== "") {
      const newDate = new Date(taskOpen.due).getTime();
      const todayDate = new Date().getTime();
      const timeDiff = newDate - todayDate;
      const diffDays = Math.floor(timeDiff / (1000 * 60 * 60 * 24)) + 1;
      const stringy = `${
        diffDays < 0 ? `>` : diffDays > 0 ? "<" : ""
      }${Math.abs(diffDays)}D`;
      setDueDiff(stringy);
    } else setDueDiff("");
  };

  useEffect(() => {
    differDue();
  }, [taskOpen.due]);

  const [deleteActive, setDeleteActive] = useState(false);

  const handleTrash = () => {
    setDeleteActive(!deleteActive);
    if (toDelete.length) {
      dispatch(deleteList({ deletion: toDelete }));
      setToDelete([]);
    }
  };

  return (
    <div className="grid grid-cols-2 ">
      <div className="pl-2 pt-2 border-r-3 border-gray-300 relative">
        <h1 className="mb-5">TASK LIST</h1>
        <p
          onClick={handleTrash}
          className={`absolute w-5 h-5  flex flex-col top-0 right-0 mr-5 mt-5 cursor-pointer ${
            deleteActive &&
            "[&_#lid]:rotate-[30deg] [&_#lid]:translate-y-[-5px]"
          }`}
        >
          <span
            id="lid"
            className="z-10 w-full h-full grid place-items-center before:w-[50%] before:h-[30%] before:absolute before:top-[-4px] before:border-[2px] before:border-b-0
            after:w-[125%] after:h-[2px] after:absolute after:top-[2px] after:bg-black transition-[.5s]"
          />
          <span
            className="w-full h-full grid place-items-center  before:w-full before:h-full  before:absolute before:border-[2px] before:border-t-0
            after:w-[2px] after:h-[70%] after:absolute after:rounded-3xl after:bg-black after:shadow-[-4px_0_black,4px_0_black]"
          />
        </p>
        <input
          type="text"
          placeholder="Search"
          value={search}
          className="mb-2 border-1 border-blue-200 indent-1"
          onChange={(e) => setSearch(e.target.value)}
        />
        <form
          action="submit"
          onSubmit={onSubmit}
          className="flex flex-col *:outline-0 mb-5 *:rounded-[5px_5px_5px_5px]"
        >
          <label
            htmlFor="task_name"
            className={`cursor-pointer absolute w-fit z-[1] p-2 text-gray-700 bg-blue-200 ${
              createActive && "hidden"
            }`}
          >
            Create Task
          </label>
          <input
            type="text"
            id="task_name"
            name="task_name"
            placeholder="Create Task"
            className={`text-black w-50 p-2 bg-gray-100 ${
              !createActive && "opacity-0 pointer-events-none"
            }`}
            onFocus={() => setCreateActive(true)}
            onBlur={() => setCreateActive(false)}
          />
        </form>
        <div className="flex-col">
          {Object.entries(totalList as Record<string, ITask>)
            .filter(([_, value]) =>
              value.title
                .toLocaleLowerCase()
                .startsWith(search.toLocaleLowerCase())
            )
            .map(([_, list], i) => {
              return (
                <div key={list.id} className="flex gap-2">
                  {deleteActive && (
                    <input
                      type="checkbox"
                      id={`checkbox${i}`}
                      name={`checkbox${i}`}
                      value={list.id || ""}
                      onChange={handleCheckBox}
                    ></input>
                  )}
                  <p
                    className="cursor-pointer w-fit hover:underline"
                    onClick={() => viewTask(list)}
                  >
                    {list.title}
                  </p>
                </div>
              );
            })}
        </div>
      </div>
      <div className=" pl-2 pt-2 w-full ">
        <div className="cursor-pointer w-full" ref={titleRef}>
          <div className="flex relative w-full mb-5">
            <form
              action="submit"
              className="cursor-default"
              onSubmit={handleSubmitTitle}
            >
              <label
                htmlFor="task_title"
                className={`absolute z-10 w-full cursor-pointer text-2xl ${
                  taskOpen.id ? "" : "pointer-events-none"
                } ${inputTitleActive ? "hidden" : ""}`}
              >
                {taskOpen.title}
              </label>
              <input
                id="task_title"
                name="task_title"
                placeholder="Set title"
                className={`w-full text-2xl ${
                  !inputTitleActive ? "pointer-events-none opacity-0" : ""
                }`}
                onFocus={() => setInputTitleActive(true)}
              />
            </form>
          </div>
        </div>

        {taskOpen.id && (
          <>
            <div
              className="cursor-pointer w-fit"
              ref={dueRef}
              title={taskOpen.due}
            >
              <label
                htmlFor="task_due"
                className={`absolute ml-5 z-10 w-25 cursor-pointer ${
                  inputDueActive ? "hidden" : ""
                }`}
              >
                {dueDiff ? dueDiff : "Set Date"}
              </label>
              <div className="flex relative">
                <input
                  id="task_due_date"
                  name="date"
                  type="date"
                  value={taskOpen.due}
                  className="w-5"
                  onChange={handleDateChange}
                />
                <form action="submit" onSubmit={handleSubmitDue}>
                  <input
                    id="task_due"
                    type="text"
                    placeholder="Set Date"
                    className={`w-25 ${
                      !inputDueActive ? "pointer-events-none opacity-0" : ""
                    }`}
                    onFocus={() => setInputDueActive(true)}
                  />
                </form>
              </div>
            </div>

            <div className="flex items-center">
              <Image
                src={IconPriority}
                alt="icon-priority"
                className="w-4 h-4"
                width={16}
                height={16}
              />

              <div className="w-fit ml-1" ref={priorityRef}>
                <label
                  htmlFor="task_priority"
                  className={`absolute z-10 w-25 cursor-pointer ${
                    inputPriorityActive ? "hidden" : ""
                  }`}
                >
                  {taskOpen.priority ? taskOpen.priority : "Set Priority"}
                </label>
                <form action="submit" onSubmit={handleSubmitPriority}>
                  <input
                    type="text"
                    id="task_priority"
                    name="task_priority"
                    placeholder="Set Priority"
                    className={`w-25 ${
                      !inputPriorityActive
                        ? "pointer-events-none opacity-0 bg-red-500"
                        : ""
                    }`}
                    onFocus={() => setInputPriorityActive(true)}
                  />
                </form>

                <ul
                  className={`bg-gray-300 rounded-[5px_5px_5px_5px] p-1 absolute w-25 z-20 ${
                    inputPriorityActive ? "" : "hidden"
                  }`}
                >
                  {inputPriorityActive &&
                    priorityLevel.map((prio, i) => (
                      <li
                        key={i}
                        className="hover:bg-white cursor-pointer rounded-[5px_5px_5px_5px] indent-1"
                        onClick={() => updateListPriority(prio)}
                      >
                        {prio}
                      </li>
                    ))}
                </ul>
              </div>
            </div>

            {/* Task Description */}
            <div className="cursor-pointer w-fit" ref={descriptionRef}>
              <div className="flex relative w-full">
                <form
                  action="submit"
                  className="cursor-default"
                  onSubmit={handleSubmitDescription}
                >
                  <label
                    htmlFor="task_description"
                    className={`absolute z-10 w-full cursor-pointer ${
                      inputDescriptionActive ? "hidden" : ""
                    }`}
                  >
                    {taskOpen.description
                      ? taskOpen.description
                      : "Set Description"}
                  </label>
                  <textarea
                    id="task_description"
                    name="task_description"
                    rows={3}
                    cols={50}
                    placeholder="Set Description"
                    className={`w-full ${
                      !inputDescriptionActive
                        ? "pointer-events-none opacity-0"
                        : ""
                    }`}
                    onKeyDown={handleKeyDown}
                    onFocus={() => setInputDescriptionActive(true)}
                  />
                </form>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
