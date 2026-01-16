import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ConfigProvider } from 'antd';
import zhCN from 'antd/locale/zh_CN';
import Navbar from './components/Navbar';
import MatchList from './pages/MatchList';
import MatchDetail from './pages/MatchDetail';
import Teams from './pages/Teams';
import TeamDetail from './pages/TeamDetail';
import './App.css';

function App() {
  return (
    <ConfigProvider locale={zhCN}>
      <Router>
        <div className="App">
          <Navbar />
          <Routes>
            <Route path="/" element={<Navigate to="/matches" replace />} />
            <Route path="/matches" element={<MatchList />} />
            <Route path="/matches/:id" element={<MatchDetail />} />
            <Route path="/teams" element={<Teams />} />
            <Route path="/teams/:id" element={<TeamDetail />} />
          </Routes>
        </div>
      </Router>
    </ConfigProvider>
  );
}

export default App;
