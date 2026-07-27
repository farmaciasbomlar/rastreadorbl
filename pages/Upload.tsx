
import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { read, utils } from 'xlsx';
import ResultsGrid from '../components/ResultsGrid';
import { ExecucaoItem, StoreType } from '../types';
import { searchProducts } from '../services/apiService';
import { useHistory } from '../hooks/useHistory';
import { UploadIcon } from '../components/icons/UploadIcon';
import StoreSelector from '../components/StoreSelector';

const Upload: React.FC = () => {
    const [results, setResults] = useState<ExecucaoItem[] | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [fileName, setFileName] = useState<string | null>(null);
    const [progress, setProgress] = useState<{ processed: number; total: number } | null>(null);
    const [store, setStore] = useState<StoreType>('todas');
    const { addHistory } = useHistory();

    const onDrop = useCallback((acceptedFiles: File[]) => {
        const file = acceptedFiles[0];
        if (!file) {
            setError("Nenhum arquivo selecionado.");
            return;
        }

        setFileName(file.name);
        setError(null);
        setIsLoading(true);
        setProgress({ processed: 0, total: 1 }); // Initial state

        const reader = new FileReader();

        reader.onload = async (e) => {
            try {
                const data = new Uint8Array(e.target?.result as ArrayBuffer);
                const workbook = read(data, { type: 'array' });
                const sheetName = workbook.SheetNames[0];
                const worksheet = workbook.Sheets[sheetName];
                const json: any[] = utils.sheet_to_json(worksheet, { header: 1 });

                // Find header indices
                const headers = (json[0] as string[]).map(h => h.toString().trim().toUpperCase());
                const eanIndex = headers.indexOf('EAN');
                
                let nomeIndex = -1;
                const nameSynonyms = ['NOME', 'DESCRIÇÃO', 'DESCRICAO'];
                for (const synonym of nameSynonyms) {
                    const index = headers.indexOf(synonym);
                    if (index !== -1) {
                        nomeIndex = index;
                        break;
                    }
                }

                if (eanIndex === -1) {
                    setError("A planilha deve conter a coluna 'EAN'.");
                    setIsLoading(false);
                    return;
                }

                const searchTerms = json.slice(1).map(row => ({
                    ean: (row[eanIndex] || '').toString().trim(),
                    name: nomeIndex !== -1 ? (row[nomeIndex] || '').toString().trim() : ''
                })).filter(term => term.ean || term.name);
                
                if (searchTerms.length === 0) {
                     setError("Nenhum item com EAN ou NOME válido encontrado na planilha.");
                     setIsLoading(false);
                     return;
                }
                
                setProgress({ processed: 0, total: searchTerms.length });

                const searchResults = await searchProducts(searchTerms, store, (processed, total) => {
                    setProgress({ processed, total });
                });

                setResults(searchResults);
                addHistory({
                    type: 'upload',
                    fileName: file.name,
                    results: searchResults,
                    store: store,
                });

            } catch (err) {
                setError("Falha ao ler a planilha. Verifique o formato do arquivo.");
                console.error(err);
            } finally {
                setIsLoading(false);
                setProgress(null);
            }
        };

        reader.onerror = () => {
            setError("Erro ao ler o arquivo.");
            setIsLoading(false);
        };

        reader.readAsArrayBuffer(file);
    }, [addHistory, store]);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: {
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
            'application/vnd.ms-excel': ['.xls'],
        },
        multiple: false,
    });

    const handleNewUpload = () => {
        setResults(null);
        setError(null);
        setFileName(null);
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
        link.setAttribute("download", `resultado_${fileName?.replace(/[^a-z0-9]/gi, '_')}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    if (isLoading) {
        return (
             <div className="flex flex-col items-center justify-center h-full text-center">
                 <div className="animate-spin rounded-full h-24 w-24 border-b-4 border-[#00ADAC]"></div>
                 <h2 className="text-2xl font-bold mt-8 text-white">Processando sua planilha...</h2>
                 {progress && (
                    <div className="w-full max-w-md mt-4">
                        <p className="text-gray-400 mt-2 mb-2">
                            Buscando item {progress.processed} de {progress.total}
                        </p>
                        <div className="w-full bg-gray-700 rounded-full h-2.5">
                            <div className="bg-[#00ADAC] h-2.5 rounded-full" style={{ width: `${(progress.processed / progress.total) * 100}%` }}></div>
                        </div>
                    </div>
                 )}
                 <p className="text-gray-400 mt-4">Isso pode levar alguns instantes.</p>
             </div>
        );
    }

    if (results) {
        return (
            <div>
                <h1 className="text-3xl font-bold mb-6 text-white">Resultados para "{fileName}"</h1>
                <ResultsGrid results={results} onNewSearch={handleNewUpload} onDownload={handleDownload} />
            </div>
        );
    }

    return (
        <div className="flex flex-col items-center justify-center h-full text-center">
             <div className="max-w-2xl w-full p-8 bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-2xl shadow-xl">
                 <div className="mx-auto mb-4 w-16 h-16 rounded-full bg-gradient-to-br from-[#00ADAC]/30 to-[#F16708]/30 flex items-center justify-center border-2 border-[#00ADAC]/50">
                    <UploadIcon className="w-8 h-8 text-[#00ADAC]" />
                </div>
                <h1 className="text-4xl font-bold text-white mb-2">Busca em Lote</h1>
                <p className="text-gray-400 mb-6">
                   Selecione a loja, depois arraste e solte sua planilha (.xlsx, .xls) aqui.
                </p>

                <StoreSelector selectedStore={store} onStoreChange={setStore} className="mb-4" />

                <div {...getRootProps()} className={`w-full p-10 border-2 border-dashed rounded-lg cursor-pointer transition-colors ${isDragActive ? 'border-[#00ADAC] bg-[#00ADAC]/10' : 'border-gray-600 hover:border-gray-500'}`}>
                    <input {...getInputProps()} />
                    <div className="flex flex-col items-center justify-center">
                        <UploadIcon className="w-12 h-12 text-gray-500 mb-3" />
                        {isDragActive ?
                            <p className="text-[#00ADAC] font-semibold">Solte a planilha aqui...</p> :
                            <p className="text-gray-400">Arraste um arquivo ou <span className="font-semibold text-[#00ADAC]">clique para selecionar</span></p>
                        }
                    </div>
                </div>

                <div className="text-left text-xs text-gray-500 mt-6 p-3 bg-gray-900/50 rounded-lg">
                    <p className="font-semibold">Requisitos da Planilha:</p>
                    <ul className="list-disc list-inside mt-1 space-y-1">
                        <li>Sua planilha deve conter, no mínimo, a coluna <code className="bg-gray-700 px-1 py-0.5 rounded-sm">EAN</code>.</li>
                        <li>Opcionalmente, pode incluir uma coluna <code className="bg-gray-700 px-1 py-0.5 rounded-sm">NOME</code> (ou <code className="bg-gray-700 px-1 py-0.5 rounded-sm">DESCRIÇÃO</code>).</li>
                        <li>Se ambas estiverem presentes, a busca priorizará o EAN e usará o nome se o EAN falhar.</li>
                    </ul>
                </div>

                {error && <p className="mt-4 text-red-400">{error}</p>}
            </div>
        </div>
    );
};

export default Upload;
