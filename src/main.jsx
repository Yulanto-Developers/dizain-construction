import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'

import App from './App.jsx'
import AdminLogin from './admin/AdminLogin.jsx'
import AdminPanel from './admin/AdminPanel.jsx'
import PrivacyPolicy from './pages/PrivacyPolicy.jsx'
import Terms from './pages/Terms.jsx'
import './index.css'

const router = createBrowserRouter([
  { path: '/', element: <App /> },
  { path: '/admin', element: <AdminLogin /> },
  { path: '/admin/dashboard', element: <AdminPanel /> },
  { path: '/privacy', element: <PrivacyPolicy /> },
  { path: '/terms', element: <Terms /> },
])

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Toaster
      position="top-center"
      reverseOrder={false}
    />
    <RouterProvider router={router} />
  </StrictMode>,
)
