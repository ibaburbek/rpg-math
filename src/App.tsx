import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Navbar } from './components/Navbar';
import { LandingPage } from './pages/LandingPage';

// Teacher Pages
import { TeacherDashboard } from './pages/teacher/TeacherDashboard';
import { TeacherClassrooms } from './pages/teacher/TeacherClassrooms';
import { TeacherClassDetail } from './pages/teacher/TeacherClassDetail';
import { TeacherProblems } from './pages/teacher/TeacherProblems';
import { TeacherProblemEditor } from './pages/teacher/TeacherProblemEditor';
import { TeacherAssignments } from './pages/teacher/TeacherAssignments';
import { TeacherResults } from './pages/teacher/TeacherResults';

// Student Pages
import { StudentJoin } from './pages/student/StudentJoin';
import { StudentDashboard } from './pages/student/StudentDashboard';
import { StudentQuests } from './pages/student/StudentQuests';
import { StudentCharacter } from './pages/student/StudentCharacter';
import { StudentHome } from './pages/student/StudentHome';
import { StudentInventory } from './pages/student/StudentInventory';
import { StudentProgress } from './pages/student/StudentProgress';

import { DEMO_STUDENT_ID } from './lib/supabase/services/demoData';

export default function App() {
  const [currentStudentId, setCurrentStudentId] = useState<string>(DEMO_STUDENT_ID);
  const [studentStats, setStudentStats] = useState<{ total_xp: number; coins: number }>({
    total_xp: 160,
    coins: 75,
  });

  return (
    <BrowserRouter>
      <div className="min-h-screen bg-[#faf8f5] text-slate-800 flex flex-col font-['Plus_Jakarta_Sans',sans-serif]">
        <Navbar studentStats={studentStats} />

        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <Routes>
            {/* Landing */}
            <Route path="/" element={<LandingPage />} />

            {/* Teacher Area */}
            <Route path="/teacher" element={<TeacherDashboard />} />
            <Route path="/teacher/classes" element={<TeacherClassrooms />} />
            <Route path="/teacher/classes/:classId" element={<TeacherClassDetail />} />
            <Route path="/teacher/problems" element={<TeacherProblems />} />
            <Route path="/teacher/problems/new" element={<TeacherProblemEditor />} />
            <Route path="/teacher/assignments" element={<TeacherAssignments />} />
            <Route path="/teacher/results" element={<TeacherResults />} />

            {/* Student Area */}
            <Route
              path="/join"
              element={
                <StudentJoin
                  onJoinSuccess={(id) => {
                    setCurrentStudentId(id);
                  }}
                />
              }
            />
            <Route
              path="/play"
              element={
                <StudentDashboard
                  studentId={currentStudentId}
                  onStatsUpdate={(st) => setStudentStats(st)}
                />
              }
            />
            <Route
              path="/play/quests"
              element={
                <StudentQuests
                  studentId={currentStudentId}
                  onRewardEarned={(st) => setStudentStats(st)}
                />
              }
            />
            <Route
              path="/play/character"
              element={<StudentCharacter studentId={currentStudentId} />}
            />
            <Route
              path="/play/home"
              element={
                <StudentHome
                  studentId={currentStudentId}
                  onBalanceChange={(st) => setStudentStats(st)}
                />
              }
            />
            <Route
              path="/play/inventory"
              element={<StudentInventory studentId={currentStudentId} />}
            />
            <Route
              path="/play/progress"
              element={<StudentProgress studentId={currentStudentId} />}
            />

            {/* Catch-all redirect */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>

        <footer className="bg-slate-900 border-t border-slate-800 py-6 text-center text-xs text-slate-400 mt-auto">
          <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
            <p className="font-semibold text-slate-300">
              MathQuest — «Шығар. Өс. Зертте.» • 4–9 сыныптарға арналған білім беру RPG жүйесі
            </p>
            <p className="text-[11px] text-slate-400">
              Канондық Supabase PostgreSQL дерекқоры мен Row Level Security қорғанысымен
            </p>
          </div>
        </footer>
      </div>
    </BrowserRouter>
  );
}
