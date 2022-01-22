import React, { useState, useEffect } from 'react'
import Blog from './components/Blog'
import blogService from './services/blogs'
import BlogForm from './BlogForm'
import Toggable from './Toggable'
import { useDispatch, useSelector } from 'react-redux'
import { setSuccessMessage, setErrMessage } from './reducers/MessageReducer'
import { setBlogs } from './reducers/BlogReducer'
import { BrowserRouter as Router,
  Switch,
  Route,
  Link,
  useRouteMatch } from 'react-router-dom'


const App = () => {
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
      //console.log(user)
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
  //console.log(user)
  return (
    <Router>
      <div>      
        <br />
        <div style={{display:'flex', justifyContent:'flex-end'}}>
          <Link to="/" style={{margin:'10px'}}>
            Blogs
          </Link> 
          <Link to="/user" style={{margin:'10px'}}>
            User
          </Link>
          <Link to={`/user/${user.id}`} style={{margin:'10px'}}>
            {user.user}
          </Link>
          <button onClick={handleLogout} >logout</button>
        </div>
         <br />
        <Toggable showVisibilityText='Create Blog' hiddenVisibilityText='Cancel Register'>
          <BlogForm onSubmit={handleSubmitBlog}/>
        </Toggable>      

        <span style={{color: 'red'}} >{message.err}</span>
        <span style={{color: 'green'}} >{message.success}</span>

        <Switch>
          <Route path="/user" exact>
              <Users  blogs={blogSorted} />
          </Route>
          <Route path="/user/:id">
              <User  blogs={blogSorted} />
          </Route>
          <Route path="/blogs/:id">
              <BlogDetail  blogs={blogSorted} />
          </Route>
          <Route path="/">
            <h2>blogs</h2>
            {blogSorted.map(blog =>
              <Blog key={blog.id} blog={blog} handleLike={handleLike} handleRemove={handleRemove} user={user}/>
            )}
          </Route>
        </Switch>        
      </div>
    </Router>
  )
}

const Users = ({blogs}) => {
  let users = []

  blogs.forEach( blog => {
    if( !users.find( user => user.user === blog.user.user) ){
      users.push({user: blog.user.user, qty:1, id:blog.user.id})
      return
    }else{
      users.find( user => user.user === blog.user.user).qty++
      return
    }
  })
  //console.log(users)
  return(
    <>
      <h1>Users</h1>
      {users.map( user => <Link to={`/user/${user.id}`} key={user.user} > <span > {user.user}:{user.qty} </span> </Link> )}
    </>
  )
}

const User = ({blogs}) => {
  const match = useRouteMatch('/user/:id')
  const blogsOfUser = match
  ?blogs.filter(blog => blog.user.id === match.params.id)
  :[]
  const user = blogsOfUser.length > 0
  ?blogsOfUser[0].user.user
  :""

  return(
    <>
      <h4>{user}</h4>
      {blogsOfUser.map(blog => 
        <div key={blog.title}>
          <strong>{blog.title}:</strong>
          <span>{blog.likes}</span>
        </div> 
      )}
    </>
  )
}

const BlogDetail = ({blogs}) => {
  const match = useRouteMatch('/blogs/:title')
  const blog = match
  ?blogs.find( blog => blog.title === match.params.title)
  :null
  
  if( !blog ){
    return
  }

  return(
    <>
      <h1><strong> {blog.title}</strong></h1> <br />
      <span>likes: <strong>{blog.likes}</strong></span> <br />
      <span>added by: <strong>{blog.author}</strong> </span>
    </>
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