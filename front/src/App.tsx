import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import PackageAnalytics from "./components/PackageAnalytics"
import PackageForm from './components/PackageForm';


function App() {

  return (
    <>
    <Router>
      <Routes>
        <Route path='/' element={<PackageAnalytics />} />
        <Route path='/analysis' element={<PackageForm />} />
      </Routes>
    </Router>
    </>
  )
}

export default App
