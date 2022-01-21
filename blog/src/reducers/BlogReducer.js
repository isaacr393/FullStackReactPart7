
const BlogReducer =  ( state = [], action ) => {
    switch ( action.type ){
        case 'LIST_BLOGS':
            return action.data
        
        default:
            return state
    }
}

export const setBlogs = (blogs) => {
    return dispatch =>{
        return dispatch({
            type: 'LIST_BLOGS',
            data: blogs
        })
    } 
}

export default BlogReducer