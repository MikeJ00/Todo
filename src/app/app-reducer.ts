import {Dispatch} from 'redux'
import {authAPI} from '../api/todolists-api'
import {setIsLoggedIn} from "features/Login/auth-reducer";
import {createSlice, PayloadAction} from "@reduxjs/toolkit";
// import {setIsLoggedInAC} from '../features/Login/auth-reducer'

export type RequestStatusType = 'idle' | 'loading' | 'succeeded' | 'failed'

const slice = createSlice({
    name:"app",
    initialState:{
        status: 'idle',
        error: null as string | null,
        isInitialized: false
    },
    reducers:{
        setAppError:(state,action:PayloadAction<{error: string | null}>)=>{
            state.error = action.payload.error
        },
        setAppStatus:(state,action:PayloadAction<{ status: RequestStatusType }>)=>{
            state.status = action.payload.status
        },
        setAppInitialized:(state,action:PayloadAction<{isInitialized:boolean}>)=>{
            state.isInitialized = action.payload.isInitialized
        }
    }
})

export const initializeAppTC = () => (dispatch: Dispatch) => {
    authAPI.me().then(res => {
        if (res.data.resultCode === 0) {
            dispatch(setIsLoggedIn({isLoggedIn:true}));
        } else {
        }
        dispatch(appActions.setAppInitialized({isInitialized:true}));
    })
}



export const appReducer = slice.reducer
export const appActions = slice.actions