import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';

import PackageForm from './components/PackageForm';


function App() {

  return (
    <>
    <Router>
      <Routes>
        <Route path='/' element={<PackageForm />} />
      </Routes>
    </Router>
    </>
  )
}

export default App
