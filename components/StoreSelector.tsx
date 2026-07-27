
import React from 'react';
import { StoreType } from '../types';

interface StoreSelectorProps {
    selectedStore: StoreType;
    onStoreChange: (store: StoreType) => void;
    className?: string;
}

const StoreSelector: React.FC<StoreSelectorProps> = ({ selectedStore, onStoreChange, className = '' }) => {
    const stores: { id: StoreType; name: string }[] = [
        { id: 'saojoao', name: 'São João' },
        { id: 'venancio', name: 'Venancio' },
        { id: 'todas', name: 'Todas' }
    ];

    const getButtonClass = (storeId: StoreType) => {
        if (selectedStore !== storeId) {
            return 'text-gray-300 hover:bg-gray-600/50';
        }
        if (storeId === 'todas') {
            return 'bg-[#F16708] text-white shadow-md';
        }
        return 'bg-[#00ADAC] text-white shadow-md';
    };


    return (
        <div className={`flex items-center justify-center p-1 bg-gray-700/50 rounded-lg space-x-1 ${className}`}>
            {stores.map(store => (
                <button
                    key={store.id}
                    onClick={() => onStoreChange(store.id)}
                    className={`px-4 py-2 text-sm font-semibold rounded-md transition-all duration-200 w-full ${getButtonClass(store.id)}`}
                    aria-pressed={selectedStore === store.id}
                >
                    {store.name}
                </button>
            ))}
        </div>
    );
};

export default StoreSelector;
