import React, { useState, useEffect } from 'react'
import Blog from './components/Blog'
import blogService from './services/blogs'
import BlogForm from './BlogForm'
import Toggable from './Toggable'
import { useDispatch, useSelector } from 'react-redux'
import { setSuccessMessage, setErrMessage } from './reducers/MessageReducer'
import { setBlogs } from './reducers/BlogReducer'


const App = () => {
  //const [blogs, setBlogs] = useState([])
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [user, setUser] = useState('')

  const dispatch = useDispatch()

  const message = useSelector( state => state.message )
  const blogs = useSelector ( state => state.blogs )

  useEffect(() => {
    blogService.getAll().then(blogs =>
      dispatch( setBlogs( blogs ) )
    )  
  }, [dispatch])

  useEffect( () => {
    let user = window.localStorage.getItem('user')
    if(user){
      let parsedUser = JSON.parse(user)
      setUser(parsedUser)
      blogService.setToken(parsedUser.token)
    }
  },[])

  const handleLogin = async (e)=> {
    e.preventDefault()
    try {
      let user = await blogService.login({username, password})

      setUser(user)
      setUsername('')
      setPassword('')
      blogService.setToken(user.token)
      window.localStorage.setItem('user', JSON.stringify(user) )

    } catch (err) {
      //console.log('Err Here',err.response)
      dispatch(setErrMessage(err.response.data.error))
      setTimeout( () => dispatch(setErrMessage('')), 5000)
    }
  }

  const handleLogout = ()=>{
    setUser('')
    setUsername('')
    setPassword('')
    blogService.setToken('')
    window.localStorage.removeItem('user')
  }

  const handleSubmitBlog = async (blog) =>{    
    try {
      let response = await blogService.create(blog)
      let newBlog = response
      newBlog.user = user
      dispatch( setBlogs([...blogs, newBlog]) )
      dispatch( setSuccessMessage('Blog created Successfully') )
      setTimeout( () => dispatch(setSuccessMessage('')), 5000)
    } catch (err) {
      dispatch(setErrMessage(err.response.data.error))
      setTimeout( () => dispatch(setErrMessage('')), 5000)
    }
  } 

  const handleLike = async (blog) =>{
    try {
      let updatedBlog = await blogService.update(blog.id, blog)
      dispatch( setBlogs( blogs.map( prevBlog => prevBlog.id === blog.id?updatedBlog:prevBlog  ) ) )
      dispatch( setSuccessMessage('Blog Liked') )
      setTimeout( () => dispatch(setSuccessMessage('')), 5000)
    } catch (err) {
      dispatch(setErrMessage(err.response.data.error))
      setTimeout( () => dispatch(setErrMessage('')), 5000)
    }
  }

  const handleRemove = async (id) => {
    try {      
      await blogService.remove(id)
      let newBlogs = blogs.filter( prevBlog => prevBlog.id !== id  )
      dispatch( setBlogs( newBlogs ) )
      dispatch( setSuccessMessage('Blog Removed') )
      setTimeout( () => dispatch(setSuccessMessage('')), 5000)
    } catch (err) {
      console.log(err.response)
      dispatch(setErrMessage(err.response.data.error))
      setTimeout( () => dispatch(setErrMessage('')), 5000)
    }
  }

  if( !user ){
    return (
      <>
        <LoginForm username={username} password={password} 
        handleUsernameChange={ ({target}) => setUsername(target.value) } 
        handlePasswordChange={ ({target}) => setPassword(target.value) } 
        onSubmit = {handleLogin}
        />
        <span style={{color: 'red'}} >{message.err}</span>
      </>
    )
  }

  const blogSorted = blogs.sort( (prev, current) => current.likes - prev.likes)
  return (
    <div>      
      { `${user.user} logged in ` } <button onClick={handleLogout} >logout</button>
      <br /> <br />
      <Toggable showVisibilityText='Create Blog' hiddenVisibilityText='Cancel Register'>
        <BlogForm onSubmit={handleSubmitBlog}/>
      </Toggable>      

      <span style={{color: 'red'}} >{message.err}</span>
      <span style={{color: 'green'}} >{message.success}</span>

      <h2>blogs</h2>
      {blogSorted.map(blog =>
        <Blog key={blog.id} blog={blog} handleLike={handleLike} handleRemove={handleRemove} user={user}/>
      )}
    </div>
  )
}


const LoginForm = ({onSubmit, username, handleUsernameChange, password, handlePasswordChange}) => {

  return (
    <form onSubmit={onSubmit} >
      <label htmlFor="usernameInput">username</label>
      <input id="usernameInput" type="text" value={username} onChange={handleUsernameChange} /> <br />
      <label htmlFor="passwordInput">password</label>
      <input id='passwordInput' type="text" value={password} onChange={handlePasswordChange} /> <br />

      <button onClick={onSubmit}>Log in</button>
    </form>
  )
}

export default App