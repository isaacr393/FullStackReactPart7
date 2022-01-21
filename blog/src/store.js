import { createStore, combineReducers, applyMiddleware } from "redux";
import thunk from "redux-thunk";
import { composeWithDevTools } from "redux-devtools-extension";
import BlogReducer from '../src/reducers/BlogReducer'
import messageReducer from '../src/reducers/MessageReducer'

const reducer = combineReducers({
    blogs: BlogReducer,
    message: messageReducer,
})

const store = createStore(reducer, composeWithDevTools(
    applyMiddleware(thunk)
))

export default store