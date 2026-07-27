
import React, { useState } from 'react';
import ResultsGrid from '../components/ResultsGrid';
import { ExecucaoItem, StoreType } from '../types';
import { searchProducts } from '../services/apiService';
import { useHistory } from '../hooks/useHistory';
import { SearchIcon } from '../components/icons/SearchIcon';
import StoreSelector from '../components/StoreSelector';

const Buscar: React.FC = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [results, setResults] = useState<ExecucaoItem[] | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [store, setStore] = useState<StoreType>('todas');
    const { addHistory } = useHistory();

    const handleSearch = async () => {
        if (!searchTerm.trim()) return;

        setIsLoading(true);
        setError(null);
        setResults(null);

        try {
            const data = await searchProducts([{ ean: searchTerm.trim(), name: searchTerm.trim() }], store);
            setResults(data);
            addHistory({
                type: 'buscar',
                searchTerm,
                results: data,
                store: store,
            });
        } catch (err) {
            setError('Falha ao buscar. Verifique o termo e tente novamente.');
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    const handleNewSearch = () => {
        setResults(null);
        setSearchTerm('');
        setError(null);
    };
    
    const handleDownload = () => {
        if (!results) return;
        const headers: { key: keyof ExecucaoItem; label: string }[] = [
            { key: "EAN", label: "EAN" },
            { key: "DescricaoBusca", label: "DESCRIÇÃO" },
            { key: "Preco", label: "Preço" },
            { key: "PrecoOriginal", label: "Preço Original" },
            { key: "Desconto", label: "Desconto %" },
            { key: "Classificacao", label: "Classificação" },
            { key: "Marca", label: "Marca" },
            { key: "Disponivel", label: "Disponível" },
            { key: "NOME", label: "Nome Encontrado" },
            { key: "metodo_busca", label: "Método Busca" },
            { key: "loja", label: "Loja" },
            { key: "Link", label: "Link" },
        ];
        
        const bom = "\uFEFF";
        const csvContent = bom + headers.map(h => h.label).join(";") + "\n" 
            + results.map(row => 
                headers.map(h => `"${row[h.key]?.toString().replace(/"/g, '""') ?? ''}"`).join(";")
            ).join("\n");

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement("a");
        const url = URL.createObjectURL(blob);
        link.setAttribute("href", url);
        link.setAttribute("download", `resultado_${searchTerm.replace(/[^a-z0-9]/gi, '_')}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };


    if (results) {
        return (
            <div>
                <h1 className="text-3xl font-bold mb-6 text-white">Resultados para "{searchTerm}"</h1>
                <ResultsGrid results={results} onNewSearch={handleNewSearch} onDownload={handleDownload} />
            </div>
        );
    }

    return (
        <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="max-w-2xl w-full p-8 bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-2xl shadow-xl">
                 <div className="mx-auto mb-4 w-16 h-16 rounded-full bg-gradient-to-br from-[#00ADAC]/30 to-[#F16708]/30 flex items-center justify-center border-2 border-[#00ADAC]/50">
                    <SearchIcon className="w-8 h-8 text-[#00ADAC]" />
                </div>
                <h1 className="text-4xl font-bold text-white mb-2">Buscar Produto</h1>
                <p className="text-gray-400 mb-6">Selecione a loja e digite o nome ou EAN do produto.</p>
                
                <StoreSelector selectedStore={store} onStoreChange={setStore} className="mb-4" />

                <div className="flex gap-2">
                    <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                        placeholder="Ex: Tylenol 750mg ou 7896004713185"
                        className="flex-grow w-full px-4 py-3 bg-gray-700/50 text-white placeholder-gray-500 border-2 border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00ADAC] focus:border-transparent transition-all"
                        disabled={isLoading}
                    />
                    <button
                        onClick={handleSearch}
                        disabled={isLoading}
                        className="flex items-center justify-center px-6 py-3 font-semibold text-white bg-[#00ADAC] rounded-lg hover:bg-[#009a99] disabled:bg-gray-500 disabled:cursor-not-allowed transition-colors"
                    >
                        {isLoading ? (
                           <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                        ) : (
                            <SearchIcon className="w-5 h-5" />
                        )}
                        <span className="ml-2 hidden sm:inline">{isLoading ? 'Buscando...' : 'Buscar'}</span>
                    </button>
                </div>
                {error && <p className="mt-4 text-red-400">{error}</p>}
            </div>
        </div>
    );
};

export default Buscar;
