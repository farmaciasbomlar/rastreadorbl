
import React from 'react';
import { ExecucaoItem } from '../types';

interface ResultCardProps {
    item: ExecucaoItem;
}

const ResultCard: React.FC<ResultCardProps> = ({ item }) => {
    const isFound = item.metodo_busca !== 'NÃO_ENCONTRADO';

    const getBadgeClass = () => {
        switch (item.metodo_busca) {
            case 'EAN':
                return 'bg-blue-500/20 text-blue-300 border-blue-500/30';
            case 'DESCRIÇÃO':
                return 'bg-purple-500/20 text-purple-300 border-purple-500/30';
            case 'EAN_COMO_TERMO':
                return 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30';
            case 'NOME_PARCIAL':
                return 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30';
            case 'NÃO_ENCONTRADO':
                return 'bg-red-500/20 text-red-300 border-red-500/30';
            default:
                return 'bg-gray-500/20 text-gray-300 border-gray-500/30';
        }
    };
    
    const formatClassification = (classification: string) => {
        if (!classification || classification === "—") return <span className="text-gray-500">Não classificado</span>;
        return classification.split(' > ').map((part, index, arr) => (
            <React.Fragment key={index}>
                <span className="text-gray-400">{part}</span>
                {index < arr.length - 1 && <span className="mx-1 text-gray-600">&gt;</span>}
            </React.Fragment>
        ));
    };

    const isAvailable = item.Disponivel === 'SIM';

    return (
        <div className="flex flex-col h-full bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-xl overflow-hidden transition-all duration-300 hover:shadow-lg hover:shadow-[#00ADAC]/10 hover:border-[#00ADAC]/50">
            <div className="p-5 flex-grow">
                <div className="flex justify-between items-start mb-3">
                     <span className={`px-2.5 py-0.5 text-xs font-semibold rounded-full border ${item.loja === 'São João' ? 'bg-teal-500/20 text-teal-300 border-teal-500/30' : 'bg-red-500/20 text-red-300 border-red-500/30'}`}>
                        {item.loja}
                    </span>
                    <span className={`px-2.5 py-0.5 text-xs font-semibold rounded-full border ${getBadgeClass()}`}>
                        {item.metodo_busca?.replace(/_/g, ' ') ?? 'N/A'}
                    </span>
                </div>
                 <p className="text-xs font-medium text-gray-400 mb-2">EAN: {item.EAN || 'N/A'}</p>
                <h3 className="text-base font-semibold text-gray-100 mb-2 h-12 line-clamp-2" title={item.NOME}>
                    {item.NOME}
                </h3>
                
                <div className="flex items-center justify-between mb-2">
                    <p className="text-xs text-gray-400">Marca: <span className="font-semibold text-gray-200">{item.Marca}</span></p>
                    <span className={`px-2 py-0.5 text-xs font-semibold rounded-full border ${isAvailable ? 'bg-green-500/20 text-green-300 border-green-500/30' : 'bg-red-500/20 text-red-300 border-red-500/30'}`}>
                        {isAvailable ? 'Disponível' : 'Indisponível'}
                    </span>
                </div>

                <div className="text-xs text-gray-500 mb-4 flex items-center flex-wrap">
                    {formatClassification(item.Classificacao)}
                </div>

                {isFound ? (
                     <div className="flex items-baseline gap-2 mb-1 flex-wrap">
                        <span className="text-2xl font-bold text-[#00ADAC]">{item.Preco}</span>
                        {item.PrecoOriginal !== item.Preco && item.PrecoOriginal !== 'Indisponível' && (
                           <span className="text-sm text-gray-500 line-through">{item.PrecoOriginal}</span>
                        )}
                        {item.Desconto && item.Desconto !== '0%' && (
                            <span className="px-2 py-0.5 text-xs font-bold text-yellow-300 bg-yellow-500/20 rounded-full">{item.Desconto} OFF</span>
                        )}
                     </div>
                ) : (
                    <div className="text-lg font-semibold text-red-400 mb-1">Não encontrado</div>
                )}
                {item.Observacao !== '—' && <p className="text-xs text-amber-400 mt-2">{item.Observacao}</p>}
            </div>
            {isFound && (
                <div className="p-4 bg-gray-900/50 mt-auto">
                    <a
                        href={item.Link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full block text-center px-4 py-2 text-sm font-semibold text-white bg-[#F16708] hover:bg-[#d85b07] rounded-lg transition-colors"
                    >
                        Ver na loja
                    </a>
                </div>
            )}
        </div>
    );
};

export default ResultCard;
