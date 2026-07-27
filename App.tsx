import React, { useState } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Buscar from './pages/Buscar';
import Upload from './pages/Upload';
import Historico from './pages/Historico';
import { MenuIcon } from './components/icons/MenuIcon';
import Chatbot from './components/Chatbot';

const App: React.FC = () => {
    const [sidebarOpen, setSidebarOpen] = useState(false);

    return (
        <HashRouter>
            <div className="flex h-screen bg-gray-900 text-gray-100 overflow-hidden">
                <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />
                <div className="flex-1 flex flex-col overflow-hidden">
                    <header className="md:hidden p-4 bg-gray-800/50 backdrop-blur-sm border-b border-gray-700/50">
                        <button onClick={() => setSidebarOpen(true)} className="text-gray-300 hover:text-white">
                           <MenuIcon className="h-6 w-6" />
                        </button>
                    </header>
                    <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 bg-grid-gray-700/[0.2]">
                         <div className="absolute inset-0 -z-10 h-full w-full bg-gray-900 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:14px_24px]"></div>
                        <Routes>
                            <Route path="/" element={<Navigate to="/buscar" />} />
                            <Route path="/buscar" element={<Buscar />} />
                            <Route path="/upload" element={<Upload />} />
                            <Route path="/historico" element={<Historico />} />
                        </Routes>
                    </main>
                </div>
                <Chatbot />
            </div>
        </HashRouter>
    );
};

export default App;