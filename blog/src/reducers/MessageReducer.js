const messageReducer = (state = {err:'', success:''}, action) => {

    switch (action.type){
        case 'NEW_ERR':
            return {
                success:'',
                err: action.data
            }
        case 'NEW_SUCCESS':
            return {
                success:action.data,
                err: ''
            }
        default:
            return state
    }
}

export const setErrMessage = (message) => {
    return dispatch => {
        return dispatch({
            type: 'NEW_ERR',
            data: message
        })
    }
}

export const setSuccessMessage = (message) => {
    return dispatch => {
        return dispatch({
            type: 'NEW_SUCCESS',
            data: message
        })
    }
}

export default messageReducer;