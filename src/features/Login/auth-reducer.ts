import {Dispatch} from 'redux'
import {appActions} from '../../app/app-reducer'
import {authAPI, LoginParamsType} from '../../api/todolists-api'
import {handleServerAppError, handleServerNetworkError} from '../../utils/error-utils'
import {createSlice, PayloadAction} from "@reduxjs/toolkit";
import {AppThunk} from "app/store";

// const initialState: InitialStateType = {
//     isLoggedIn: false
// }

const slice = createSlice({
  name:"auth",
  initialState:{
    isLoggedIn:false,
  },
  reducers:{
    setIsLoggedIn:(state, action:PayloadAction<{isLoggedIn:boolean }>)=>{
      // return {...state, isLoggedIn: action.payload.isLoggedIn}
      state.isLoggedIn = action.payload.isLoggedIn
    }
  }
})
export const authReducer = slice.reducer
export const {setIsLoggedIn} = slice.actions
// export const authActions = slice.actions

// thunks
export const loginTC = (data: LoginParamsType):AppThunk => (dispatch) => {
  dispatch(appActions.setAppStatus({status:'loading'}))
    authAPI.login(data)
        .then(res => {
            if (res.data.resultCode === 0) {
                dispatch(setIsLoggedIn({isLoggedIn:true}))
                // dispatch(setIsLoggedInAC(true))
                   dispatch(appActions.setAppStatus({status:'loading'}))
            } else {
                handleServerAppError(res.data, dispatch)
            }
        })
        .catch((error) => {
            handleServerNetworkError(error, dispatch)
        })
}
export const logoutTC = ():AppThunk => (dispatch) => {
  dispatch(appActions.setAppStatus({status:'loading'}))
    authAPI.logout()
        .then(res => {
            if (res.data.resultCode === 0) {
              dispatch(setIsLoggedIn({isLoggedIn:false}))
                   dispatch(appActions.setAppStatus({status:'loading'}))
            } else {
                handleServerAppError(res.data, dispatch)
            }
        })
        .catch((error) => {
            handleServerNetworkError(error, dispatch)
        })
}
