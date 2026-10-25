import { Navigate, Route, Routes } from 'react-router-dom';
import { useState } from 'react';
import Layout from './components/Layout';
import Walkthrough from './components/Walkthrough';
import CommandCentre from './pages/CommandCentre';
import Villages from './pages/Villages';
import Issues from './pages/Issues';
import Projects from './pages/Projects';
import Schemes from './pages/Schemes';
import Field from './pages/Field';
import Report from './pages/Report';
import Settings from './pages/Settings';

export default function App() {
  const [tour, setTour] = useState(false);
  return (
    <>
      <Layout onStartDemo={() => setTour(true)}>
        <Routes>
          <Route path="/" element={<CommandCentre onStartDemo={() => setTour(true)} />} />
          <Route path="/villages" element={<Villages />} />
          <Route path="/issues" element={<Issues />} />
          <Route path="/projects" element={<Projects />} />
          <Route path="/schemes" element={<Schemes />} />
          <Route path="/field" element={<Field />} />
          <Route path="/report" element={<Report />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Layout>
      {tour && <Walkthrough onExit={() => setTour(false)} />}
    </>
  );
}
