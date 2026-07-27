
import React, { useState, useMemo } from 'react';
import { ExecucaoItem } from '../types';
import ResultCard from './ResultCard';
import { DownloadIcon } from './icons/DownloadIcon';

interface ResultsGridProps {
    results: ExecucaoItem[];
    onDownload?: () => void;
    onNewSearch?: () => void;
}

type FilterType = 'all' | 'found' | 'not-found' | 'ean' | 'desc' | 'partial-desc' | 'saojoao' | 'venancio';

const NotFoundCard: React.FC<{ storeName: 'São João' | 'Venancio' }> = ({ storeName }) => (
    <div className="flex flex-col h-full bg-gray-800/50 backdrop-blur-sm border border-dashed border-gray-700/50 rounded-xl overflow-hidden items-center justify-center p-5 text-center">
        <span className={`px-2.5 py-0.5 text-xs font-semibold rounded-full border mb-4 ${storeName === 'São João' ? 'bg-teal-500/20 text-teal-300 border-teal-500/30' : 'bg-red-500/20 text-red-300 border-red-500/30'}`}>
            {storeName}
        </span>
        <p className="text-gray-400">Produto não encontrado nesta loja.</p>
    </div>
);


const ResultsGrid: React.FC<ResultsGridProps> = ({ results, onDownload, onNewSearch }) => {
    const [filter, setFilter] = useState<FilterType>('all');

    const isComparisonView = useMemo(() => new Set(results.map(r => r.loja)).size > 1, [results]);

    const groupedResults = useMemo(() => {
        if (!isComparisonView) return [];

        const groups = new Map<string, { productEAN: string; productName: string; saojoao?: ExecucaoItem; venancio?: ExecucaoItem }>();

        results.forEach(item => {
            const key = item.EAN; // Original EAN
            let group = groups.get(key);
            if (!group) {
                group = { productEAN: key, productName: '' };
                groups.set(key, group);
            }
            
            if (item.loja === 'São João') group.saojoao = item;
            else if (item.loja === 'Venancio') group.venancio = item;
            
            if (!group.productName && item.metodo_busca !== 'NÃO_ENCONTRADO') {
                group.productName = item.NOME;
            }
        });

        groups.forEach(group => {
            if (!group.productName) {
                group.productName = group.saojoao?.NOME || group.venancio?.NOME || `Busca por EAN ${group.productEAN}`;
            }
        });

        return Array.from(groups.values()).sort((a, b) => a.productName.localeCompare(b.productName));
    }, [results, isComparisonView]);

    const filteredData = useMemo(() => {
        const checkItem = (item?: ExecucaoItem) => {
            if (!item) return { isFound: false, isEan: false, isDesc: false, isPartial: false };
            const isFound = item.metodo_busca !== 'NÃO_ENCONTRADO';
            const isEan = item.metodo_busca === 'EAN' || item.metodo_busca === 'EAN_COMO_TERMO';
            const isDesc = item.metodo_busca === 'DESCRIÇÃO';
            const isPartial = item.metodo_busca === 'NOME_PARCIAL';
            return { isFound, isEan, isDesc, isPartial };
        };

        if (isComparisonView) {
            return groupedResults.filter(group => {
                const sj = checkItem(group.saojoao);
                const vn = checkItem(group.venancio);
                switch (filter) {
                    case 'found': return sj.isFound || vn.isFound;
                    case 'not-found': return !sj.isFound && !vn.isFound;
                    case 'saojoao': return sj.isFound;
                    case 'venancio': return vn.isFound;
                    case 'ean': return sj.isEan || vn.isEan;
                    case 'desc': return sj.isDesc || vn.isDesc;
                    case 'partial-desc': return sj.isPartial || vn.isPartial;
                    default: return true;
                }
            });
        }

        return results.filter(item => {
            const { isFound, isEan, isDesc, isPartial } = checkItem(item);
            switch (filter) {
                case 'found': return isFound;
                case 'not-found': return !isFound;
                case 'ean': return isEan;
                case 'desc': return isDesc;
                case 'partial-desc': return isPartial;
                default: return true;
            }
        });
    }, [results, groupedResults, filter, isComparisonView]);

    const counts = useMemo(() => {
        const check = (item?: ExecucaoItem) => {
            if (!item) return { isFound: false, isEan: false, isDesc: false, isPartial: false };
            return {
                isFound: item.metodo_busca !== 'NÃO_ENCONTRADO',
                isEan: item.metodo_busca === 'EAN' || item.metodo_busca === 'EAN_COMO_TERMO',
                isDesc: item.metodo_busca === 'DESCRIÇÃO',
                isPartial: item.metodo_busca === 'NOME_PARCIAL',
            };
        };

        if (isComparisonView) {
            return {
                all: groupedResults.length,
                found: groupedResults.filter(g => check(g.saojoao).isFound || check(g.venancio).isFound).length,
                'not-found': groupedResults.filter(g => !check(g.saojoao).isFound && !check(g.venancio).isFound).length,
                saojoao: groupedResults.filter(g => check(g.saojoao).isFound).length,
                venancio: groupedResults.filter(g => check(g.venancio).isFound).length,
                ean: groupedResults.filter(g => check(g.saojoao).isEan || check(g.venancio).isEan).length,
                desc: groupedResults.filter(g => check(g.saojoao).isDesc || check(g.venancio).isDesc).length,
                'partial-desc': groupedResults.filter(g => check(g.saojoao).isPartial || check(g.venancio).isPartial).length,
            };
        }

        const singleCheck = (item: ExecucaoItem) => ({
            isFound: item.metodo_busca !== 'NÃO_ENCONTRADO',
            isEan: item.metodo_busca === 'EAN' || item.metodo_busca === 'EAN_COMO_TERMO',
            isDesc: item.metodo_busca === 'DESCRIÇÃO',
            isPartial: item.metodo_busca === 'NOME_PARCIAL',
        });

        return {
            all: results.length,
            found: results.filter(r => singleCheck(r).isFound).length,
            'not-found': results.filter(r => !singleCheck(r).isFound).length,
            ean: results.filter(r => singleCheck(r).isEan).length,
            desc: results.filter(r => singleCheck(r).isDesc).length,
            'partial-desc': results.filter(r => singleCheck(r).isPartial).length,
            saojoao: 0,
            venancio: 0,
        };
    }, [results, groupedResults, isComparisonView]);

    const FilterButton: React.FC<{ type: FilterType, label: string }> = ({ type, label }) => (
        <button
            onClick={() => setFilter(type)}
            className={`px-3 py-1.5 text-sm font-medium rounded-full transition-all duration-200 ${filter === type ? 'bg-[#00ADAC] text-white shadow-md' : 'bg-gray-700/50 text-gray-300 hover:bg-gray-600/50'}`}
        >
            {label} <span className="ml-1.5 bg-gray-600/50 text-gray-200 text-xs font-semibold px-2 py-0.5 rounded-full">{counts[type]}</span>
        </button>
    );

    return (
        <div className="space-y-6">
            <div className="p-4 rounded-xl bg-gray-800/50 backdrop-blur-sm border border-gray-700/50">
                <div className="flex flex-wrap items-center justify-between gap-4">
                     <div className="flex flex-wrap gap-2">
                        <FilterButton type="all" label={isComparisonView ? "Todos os Grupos" : "Todos"} />
                        {isComparisonView && (
                            <>
                                <FilterButton type="saojoao" label="São João" />
                                <FilterButton type="venancio" label="Venancio" />
                            </>
                        )}
                        <FilterButton type="found" label="Encontrados" />
                        <FilterButton type="not-found" label="Não Encontrados" />
                        <FilterButton type="ean" label="Via EAN" />
                        <FilterButton type="desc" label="Via Nome" />
                         <FilterButton type="partial-desc" label="Via Nome Parcial" />
                    </div>
                    <div className="flex items-center gap-2">
                        {onNewSearch && (
                            <button onClick={onNewSearch} className="px-4 py-2 text-sm font-semibold text-white bg-gray-600 hover:bg-gray-500 rounded-lg transition-colors">
                                Nova Busca
                            </button>
                        )}
                        {onDownload && (
                            <button onClick={onDownload} className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-[#00ADAC] hover:bg-[#009a99] rounded-lg transition-colors">
                                <DownloadIcon className="w-4 h-4" />
                                Download CSV
                            </button>
                        )}
                    </div>
                </div>
            </div>
            
            {filteredData.length > 0 ? (
                isComparisonView ? (
                    <div className="space-y-6">
                        {(filteredData as any[]).map(group => (
                            <div key={group.productEAN} className="bg-gray-800/30 backdrop-blur-sm p-4 rounded-xl border border-gray-700/30">
                                <h3 className="text-lg font-bold text-white mb-1 truncate" title={group.productName}>{group.productName}</h3>
                                <p className="text-sm text-gray-400 mb-4">EAN: {group.productEAN}</p>
                                <div className={`grid grid-cols-1 ${filter !== 'saojoao' && filter !== 'venancio' ? 'sm:grid-cols-2' : ''} gap-4`}>
                                    {filter !== 'venancio' && (group.saojoao ? <ResultCard item={group.saojoao} /> : <NotFoundCard storeName="São João" />)}
                                    {filter !== 'saojoao' && (group.venancio ? <ResultCard item={group.venancio} /> : <NotFoundCard storeName="Venancio" />)}
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {(filteredData as ExecucaoItem[]).map((item, index) => (
                            <ResultCard key={`${item.loja}-${item.EAN}-${index}`} item={item} />
                        ))}
                    </div>
                )
            ) : (
                <div className="text-center py-12 text-gray-400">
                    <p>Nenhum resultado para exibir com o filtro selecionado.</p>
                </div>
            )}
        </div>
    );
};

export default ResultsGrid;
