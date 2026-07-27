import React from 'react';
import { NavLink } from 'react-router-dom';
import { SearchIcon } from './icons/SearchIcon';
import { UploadIcon } from './icons/UploadIcon';
import { HistoryIcon } from './icons/HistoryIcon';
import { XIcon } from './icons/XIcon';

interface SidebarProps {
    isOpen: boolean;
    setIsOpen: (isOpen: boolean) => void;
}

const navItems = [
    { name: 'Buscar', path: '/buscar', icon: <SearchIcon className="h-5 w-5" /> },
    { name: 'Upload', path: '/upload', icon: <UploadIcon className="h-5 w-5" /> },
    { name: 'Histórico', path: '/historico', icon: <HistoryIcon className="h-5 w-5" /> },
];

const Sidebar: React.FC<SidebarProps> = ({ isOpen, setIsOpen }) => {
    const NavItem: React.FC<{ path: string; icon: React.ReactNode; children: React.ReactNode }> = ({ path, icon, children }) => (
        <NavLink
            to={path}
            onClick={() => setIsOpen(false)}
            className={({ isActive }) =>
                `flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors duration-200 ${
                    isActive
                        ? 'bg-[#00ADAC]/20 text-[#00ADAC]'
                        : 'text-gray-400 hover:bg-gray-700/50 hover:text-gray-200'
                }`
            }
        >
            {icon}
            <span className="ml-3">{children}</span>
        </NavLink>
    );

    return (
        <>
            <div
                className={`fixed inset-0 z-30 bg-black/60 transition-opacity md:hidden ${
                    isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
                }`}
                onClick={() => setIsOpen(false)}
            ></div>
            <aside
                className={`fixed md:relative inset-y-0 left-0 z-40 flex-shrink-0 w-64 bg-gray-800/80 backdrop-blur-xl border-r border-gray-700/50 flex-col justify-between p-4 transform transition-transform duration-300 ease-in-out md:translate-x-0 ${
                    isOpen ? 'translate-x-0' : '-translate-x-full'
                }`}
            >
                <div>
                    <div className="flex items-center justify-between mb-8">
                        <div className="flex items-center">
                            <div className="p-2 bg-gradient-to-br from-[#00ADAC] to-[#007c7b] rounded-lg">
                                <SearchIcon className="h-6 w-6 text-white" />
                            </div>
                            <span className="ml-3 text-lg font-bold text-white">Rastreador SJ</span>
                        </div>
                        <button onClick={() => setIsOpen(false)} className="md:hidden text-gray-400 hover:text-white">
                            <XIcon className="h-6 w-6" />
                        </button>
                    </div>
                    <nav className="space-y-2">
                        {navItems.map((item) => (
                            <NavItem key={item.name} path={item.path} icon={item.icon}>
                                {item.name}
                            </NavItem>
                        ))}
                    </nav>
                </div>
                <div className="mt-auto">
                    <div className="flex items-center justify-center p-2 bg-gradient-to-r from-yellow-400/20 to-orange-500/20 rounded-lg">
                        <span className="text-sm font-semibold bg-clip-text text-transparent bg-gradient-to-r from-yellow-400 to-orange-500">
                            ✨ Premium
                        </span>
                    </div>
                </div>
            </aside>
        </>
    );
};

export default Sidebar;