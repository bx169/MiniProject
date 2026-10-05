import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';
import Login from './Login';
import Home from './Home';
import Employee from './Employee';
import Permission from './Permission';
import RoutesPage from './Routes';
import Schedules from './Schedules';
import ProtectedRoute from './ProtectedRoute';
import Sidebar from './Sidebar';
import Navbar from './Navbar';
import MasterData from './MasterData';
import Vehicle from './Vehicle';
import Dashboard from './Dashboard';
import DashboardReport3 from './DashboardReport3';
import DashboardReport6 from './DashboardReport6';
import DashboardReport7 from './DashboardReport7';

function ProtectedPage({ path, children }) {
  return (
    <ProtectedRoute path={path}>
      <Navbar />
      <div className="app-shell">
        <Sidebar />
        <div className="app-main">
          <main className="app-content p-3 p-md-4">{children}</main>
        </div>
      </div>
    </ProtectedRoute>
  );
}

function PublicPage({ children }) {
  return <main>{children}</main>;
}

function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/" element={<PublicPage><Home /></PublicPage>} />
      <Route path="/home" element={<ProtectedPage><Home /></ProtectedPage>} />
      <Route path="/dashboard" element={<ProtectedPage path="/dashboard"><Dashboard /></ProtectedPage>} />
      <Route path="/dashboard/report3" element={<ProtectedPage path="/dashboard"><DashboardReport3 /></ProtectedPage>} />
      <Route path="/dashboard/report6" element={<ProtectedPage path="/dashboard"><DashboardReport6 /></ProtectedPage>} />
      <Route path="/dashboard/report7" element={<ProtectedPage path="/dashboard"><DashboardReport7 /></ProtectedPage>} />
      <Route path="/employee" element={<ProtectedPage path="/employee"><Employee /></ProtectedPage>} />
      <Route path="/permission" element={<ProtectedPage path="/permission"><Permission /></ProtectedPage>} />
      <Route path="/routes" element={<ProtectedPage path="/routes"><RoutesPage /></ProtectedPage>} />
      <Route path="/schedules" element={<ProtectedPage path="/schedules"><Schedules /></ProtectedPage>} />
      <Route path="/departments" element={<ProtectedPage path="/departments"><MasterData type="departments" /></ProtectedPage>} />
      <Route path="/positions" element={<ProtectedPage path="/positions"><MasterData type="positions" /></ProtectedPage>} />
      <Route path="/stops" element={<ProtectedPage path="/stops"><MasterData type="stops" /></ProtectedPage>} />
      <Route path="/vehicle-types" element={<ProtectedPage path="/vehicle-types"><MasterData type="vehicle-types" /></ProtectedPage>} />
      <Route path="/vehicles" element={<ProtectedPage path="/vehicles"><Vehicle /></ProtectedPage>} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
);
