import {BrowserRouter, Routes, Route} from 'react-router-dom'
import Register from './Pages/Register'
import Login from './Pages/Login'
import ForgotPassword from './Pages/ForgotPassword'
import ResetPassword from './Pages/ResetPassword'
import Home from './Pages/Home'
import Explore from './Pages/Explore'
import Notifications from './Pages/Notifications'
import Messages from './Pages/Messages'
import Signets from './Pages/Signets'
import Analytique from './Pages/Analytique'
import Theme from './Pages/Theme'
import Options from './Pages/Options'
// import Explore from 'react-icons/md'

  function App (){
    return (
      <BrowserRouter>
      <Routes>
        <Route path={'/register'} element={<Register/>} /> 
        <Route path={'/login'} element={<Login/>} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/home" element={<Home/>} />
        <Route path="/explore" element={<Explore/>} />
        <Route path="/notifications" element={<Notifications/>} />
        <Route path="/messages" element={<Messages/>} />
        <Route path="/signets" element={<Signets/>} />
        <Route path="/analytique" element={<Analytique/>} />
        <Route path="/theme" element={<Theme/>} />
        <Route path="/options" element={<Options/>} />
      </Routes>
    </BrowserRouter>
    )
  }

  export default App