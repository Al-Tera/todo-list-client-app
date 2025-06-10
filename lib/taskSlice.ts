import { createAppSlice } from "@/lib/createAppSlice";
import { PayloadAction } from "@reduxjs/toolkit";

export interface ITask {
  id: string | null;
  title: string;
  due: string;
  group: string | null;
  priority: string | null;
  description: string | null;
  subTasks: string[] | null;
}

export interface TaskSliceState {
  list: Record<string, ITask>;
  totalGroups: string[];
  value: string[];
  history: string[];
}

const initialState: TaskSliceState = {
  list: {},
  totalGroups: [],
  value: [],
  history: [],
};

export const taskSlice = createAppSlice({
  name: "task",
  initialState,
  reducers: {
    addList: (state, action) => {
      state.list[action.payload.id] = action.payload;
      localStorage.setItem("list", JSON.stringify(state.list));
    },
    updateList: (
      state,
      action: PayloadAction<{ id: string; key: string; value: string }>
    ) => {
      const { id, key, value } = action.payload;
      (state.list[id] as any)[key] = value;
      localStorage.setItem("list", JSON.stringify(state.list));
    },
    loadList: (state, action: PayloadAction<Record<string, ITask>>) => {
      state.list = action.payload;
    },
    deleteList: (state, action: PayloadAction<{ deletion: string[] }>) => {
      const { deletion } = action.payload;
      for (var i = 0; i < deletion.length; i++) {
        delete state.list[deletion[i]];
      }
      localStorage.setItem("list", JSON.stringify(state.list));
    },
    addTotalGroups: (state, action) => {
      state.totalGroups.push(action.payload);
      localStorage.setItem("totalGroups", JSON.stringify(state.totalGroups));
    },
    loadTotalGroups: (state, action) => {
      state.totalGroups = action.payload;
    },
    addHistory: (state, action) => {
      state.history.push(action.payload);
      localStorage.setItem("history", JSON.stringify(state.history));
    },
    loadHistory: (state, action) => {
      state.history = action.payload;
    },
  },
  selectors: {
    selectList: (task) => task.list,
    selectListGroups: (task) => task.totalGroups,
    selectHistory: (task) => task.history,
  },
});

export const {
  addList,
  updateList,
  loadList,
  deleteList,
  addTotalGroups,
  loadTotalGroups,
  addHistory,
  loadHistory,
} = taskSlice.actions;
export const { selectList, selectListGroups, selectHistory } =
  taskSlice.selectors;
