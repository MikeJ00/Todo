import {TaskPriorities, TaskStatuses, TaskType, todolistsAPI, UpdateTaskModelType} from '../../api/todolists-api'
import {Dispatch} from 'redux'
import {AppDispatch, AppRootStateType, AppThunk} from '../../app/store'
import {handleServerAppError, handleServerNetworkError} from 'utils/error-utils'
import {appActions, RequestStatusType} from "app/app-reducer";
import {createAsyncThunk, createSlice, PayloadAction} from "@reduxjs/toolkit";
import {todolistsActions} from "features/TodolistsList/todolistsSlice";

const slice = createSlice({
  name: "tasks",
  initialState: {} as TasksStateType,
  reducers: {
    removeTask: (state, action: PayloadAction<{ taskId: string, todolistId: string }>) => {
      const tasks = state[action.payload.todolistId]
      const index = tasks.findIndex((t) => t.id === action.payload.taskId)
      if (index !== -1) tasks.splice(index, 1)
    },
    addTask:(state,action:PayloadAction<{task: TaskType}>)=>{
      const tasks = state[action.payload.task.todoListId]
      tasks.unshift(action.payload.task)
    },
    updateTask:(state,action:PayloadAction<{taskId: string, model: UpdateDomainTaskModelType, todolistId: string}>)=>{
      const tasks = state[action.payload.todolistId]
      const index = tasks.findIndex(t => t.id === action.payload.taskId)
      if (index !== -1) {
        tasks[index] = {...tasks[index], ...action.payload.model}
      }
    },
    setTasks:(state,action:PayloadAction<{tasks: TaskType[], todolistId: string}>)=>{
      state[action.payload.todolistId] = action.payload.tasks
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchTasks.fulfilled,(state,action)=>{
        state[action.payload.todolistId] = action.payload.tasks
      })
      .addCase(todolistsActions.addTodolist, (state, action) => {
        // return {...state, [action.todolist.id]: []}
        state[action.payload.todolist.id] = []
      })
    builder
      .addCase(todolistsActions.removeTodolist, (state, action) => {
        delete state[action.payload.id]
      })
    builder
      .addCase(todolistsActions.setTodolists, (state, action) => {
        action.payload.todolists.forEach((tl: any) => {
          state[tl.id] = []
        })
      })
  }
})
// thunks
const fetchTasks = createAsyncThunk<{
  tasks:TaskType[],
  todolistId:string
},string,
  {
  state:AppRootStateType,
  dispatch:AppDispatch,
  rejectValue:null;
}>(`${slice.name}/fetchTasks`,
  async (todolistId, thunkAPI)=>{
  const {dispatch,rejectWithValue, getState} = thunkAPI;
  try{
    const state = getState()
    dispatch(appActions.setAppStatus({status: 'loading'}))
    const res = await todolistsAPI.getTasks("todolistId")
    const tasks = res.data.items
    // dispatch(tasksActions.setTasks({tasks:tasks, todolistId:todolistId}))
    dispatch(appActions.setAppStatus({status: 'succeeded'}))
    // return {tasks, todolistId}
    return {tasks, todolistId}
  } catch(err:any){
    debugger
    handleServerNetworkError(err, dispatch)
    return rejectWithValue(null)
  }


})
export const removeTaskTC = (taskId: string, todolistId: string): AppThunk => (dispatch) => {
  dispatch(appActions.setAppStatus({status: 'loading'}))
  todolistsAPI.deleteTask(todolistId, taskId)
    .then(res => {
      const action = tasksActions.removeTask({taskId:taskId, todolistId:todolistId})
      dispatch(action)
      dispatch(appActions.setAppStatus({status: 'succeeded'}))
    })
}
export const addTaskTC = (title: string, todolistId: string): AppThunk => (dispatch) => {
  dispatch(appActions.setAppStatus({status: 'loading'}))
  todolistsAPI.createTask(todolistId, title)
    .then(res => {
      if (res.data.resultCode === 0) {
        const action = tasksActions.addTask({task:res.data.data.item})
        dispatch(action)
        dispatch(appActions.setAppStatus({status: 'succeeded'}))
      } else {
        handleServerAppError(res.data, dispatch);
      }
    })
    .catch((error) => {
      handleServerNetworkError(error, dispatch)
    })
}
export const updateTaskTC = (taskId: string, domainModel: UpdateDomainTaskModelType, todolistId: string): AppThunk =>
  (dispatch, getState: () => AppRootStateType) => {
    const state = getState()
    const task = state.tasks[todolistId].find(t => t.id === taskId)
    if (!task) {
      //throw new Error("task not found in the state");
      console.warn('task not found in the state')
      return
    }

    const apiModel: UpdateTaskModelType = {
      deadline: task.deadline,
      description: task.description,
      priority: task.priority,
      startDate: task.startDate,
      title: task.title,
      status: task.status,
      ...domainModel
    }

    todolistsAPI.updateTask(todolistId, taskId, apiModel)
      .then(res => {
        if (res.data.resultCode === 0) {
          const action = tasksActions.updateTask({taskId, model:domainModel,  todolistId})
          dispatch(action)
        } else {
          handleServerAppError(res.data, dispatch);
        }
      })
      .catch((error) => {
        handleServerNetworkError(error, dispatch);
      })
  }

// types
export type UpdateDomainTaskModelType = {
  title?: string
  description?: string
  status?: TaskStatuses
  priority?: TaskPriorities
  startDate?: string
  deadline?: string
}
export type TasksStateType = {
  [key: string]: Array<TaskType>
}

export const tasksReducer = slice.reducer
export const tasksActions = slice.actions
export const tasksThunks = {fetchTasks}

