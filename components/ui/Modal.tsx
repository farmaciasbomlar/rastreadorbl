
import React from 'react';
import { XIcon } from '../icons/XIcon';

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    children: React.ReactNode;
    fullWidth?: boolean;
}

export const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children, fullWidth = false }) => {
    if (!isOpen) return null;

    return (
        <div 
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
            onClick={onClose}
        >
            <div
                className={`bg-gray-800 border border-gray-700 rounded-xl shadow-2xl flex flex-col overflow-hidden w-full ${fullWidth ? 'max-w-6xl h-[90vh]' : 'max-w-2xl'}`}
                onClick={e => e.stopPropagation()}
            >
                <header className="flex items-center justify-between p-4 border-b border-gray-700 flex-shrink-0">
                    <h2 className="text-lg font-bold text-white">{title}</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
                        <XIcon className="w-6 h-6" />
                    </button>
                </header>
                <div className="flex-1 overflow-y-auto">
                    {children}
                </div>
            </div>
        </div>
    );
};
