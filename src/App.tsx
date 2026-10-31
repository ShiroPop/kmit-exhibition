import { createBrowserRouter } from 'react-router'
import { RouterProvider } from 'react-router/dom'
import { Layout } from './components/layout/Layout'
import Home from './pages/Home'
import Intro from './pages/Intro'
import Works from './pages/Works'
import WorkDetail from './pages/WorkDetail'
import Student from './pages/Student'
import Archive from './pages/Archive'

const router = createBrowserRouter([
  {
    element: <Layout />,
    children: [
      { index: true, element: <Home /> },
      { path: 'intro', element: <Intro /> },
      { path: 'works', element: <Works /> },
      { path: 'works/:id', element: <WorkDetail /> },
      { path: 'students/:id', element: <Student /> },
      { path: 'archive', element: <Archive /> },
    ],
  },
])

export default function App() {
  return <RouterProvider router={router} />
}
