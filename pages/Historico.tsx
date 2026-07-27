
import React, { useState } from 'react';
import { useHistory } from '../hooks/useHistory';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { SearchIcon } from '../components/icons/SearchIcon';
import { UploadIcon } from '../components/icons/UploadIcon';
import { DownloadIcon } from '../components/icons/DownloadIcon';
import { Modal } from '../components/ui/Modal';
import ResultsGrid from '../components/ResultsGrid';
import { HistoryItem, ExecucaoItem } from '../types';

const Historico: React.FC = () => {
    const { history } = useHistory();
    const [filter, setFilter] = useState<'all' | 'buscar' | 'upload'>('all');
    const [selectedItem, setSelectedItem] = useState<HistoryItem | null>(null);

    const filteredHistory = history.filter(item => filter === 'all' || item.type === filter);

    const handleDownload = (item: HistoryItem) => {
        if (!item.results) return;
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
            + item.results.map(row => 
                headers.map(h => `"${row[h.key]?.toString().replace(/"/g, '""') ?? ''}"`).join(";")
            ).join("\n");

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement("a");
        const url = URL.createObjectURL(blob);
        link.setAttribute("href", url);
        
        const fileName = item.type === 'buscar' ? item.searchTerm : item.fileName;
        link.setAttribute("download", `resultado_${fileName?.replace(/[^a-z0-9]/gi, '_')}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const HistoryCard: React.FC<{ item: HistoryItem }> = ({ item }) => {
        const getStoreInfo = () => {
            switch (item.store) {
                case 'saojoao':
                    return { name: 'São João', className: 'bg-teal-500/20 text-teal-300' };
                case 'venancio':
                    return { name: 'Venancio', className: 'bg-red-500/20 text-red-300' };
                case 'todas':
                    return { name: 'Todas', className: 'bg-indigo-500/20 text-indigo-300' };
                default:
                    return { name: 'Desconhecida', className: 'bg-gray-500/20 text-gray-300' };
            }
        };
        const storeInfo = getStoreInfo();

        return (
            <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 p-4 rounded-lg flex items-center justify-between hover:border-[#00ADAC]/50 transition-colors">
                <div className="flex items-center gap-4">
                    <div className={`p-2 rounded-full ${item.type === 'buscar' ? 'bg-blue-500/20' : 'bg-green-500/20'}`}>
                        {item.type === 'buscar' ? <SearchIcon className="h-5 w-5 text-blue-300" /> : <UploadIcon className="h-5 w-5 text-green-300" />}
                    </div>
                    <div>
                        <p className="font-semibold text-white truncate max-w-xs">{item.type === 'buscar' ? item.searchTerm : item.fileName}</p>
                        <div className="flex items-center gap-2 text-sm text-gray-400 mt-1">
                            <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${storeInfo.className}`}>{storeInfo.name}</span>
                            <span>{format(parseISO(item.timestamp), "dd 'de' MMM, yyyy 'às' HH:mm", { locale: ptBR })}</span>
                             <span>• {item.itemCount} itens</span>
                        </div>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <button onClick={() => handleDownload(item)} className="p-2 text-gray-300 hover:text-white bg-gray-700/50 rounded-md transition-colors" title="Baixar CSV">
                        <DownloadIcon className="h-5 w-5" />
                    </button>
                    <button onClick={() => setSelectedItem(item)} className="px-4 py-2 text-sm font-semibold bg-[#00ADAC] text-white rounded-md hover:bg-[#009a99] transition-colors">
                        Ver Detalhes
                    </button>
                </div>
            </div>
        )
    };
    
    return (
        <div>
            <h1 className="text-3xl font-bold mb-6 text-white">Histórico de Execuções</h1>
            <div className="flex gap-2 mb-6 border-b border-gray-700">
                 {['all', 'buscar', 'upload'].map((f) => (
                    <button
                        key={f}
                        onClick={() => setFilter(f as any)}
                        className={`px-4 py-2 text-sm font-medium transition-colors ${filter === f ? 'border-b-2 border-[#00ADAC] text-[#00ADAC]' : 'text-gray-400 hover:text-white'}`}
                    >
                        {f === 'all' ? 'Todos' : f === 'buscar' ? 'Buscas' : 'Uploads'}
                    </button>
                ))}
            </div>

            <div className="space-y-4">
                {filteredHistory.length > 0 ? (
                    filteredHistory.map(item => <HistoryCard key={item.id} item={item} />)
                ) : (
                    <div className="text-center py-12 text-gray-400">
                        <p>Nenhum histórico encontrado para este filtro.</p>
                    </div>
                )}
            </div>

            <Modal isOpen={!!selectedItem} onClose={() => setSelectedItem(null)} title="Detalhes da Execução" fullWidth={true}>
                 {selectedItem && (
                    <div className="p-4">
                        <ResultsGrid results={selectedItem.results} onDownload={() => handleDownload(selectedItem)} />
                    </div>
                 )}
            </Modal>
        </div>
    );
};

export default Historico;
