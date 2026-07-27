
export type StoreType = 'saojoao' | 'venancio' | 'todas';

export type MetodoBuscaType = 
    'EAN' | 
    'DESCRIÇÃO' | 
    'EAN_COMO_TERMO' |
    'NOME_PARCIAL' |
    'NÃO_ENCONTRADO';

export interface ExecucaoItem {
    // Existing
    EAN: string;
    NOME: string; // This is Nome Encontrado
    Preco: string;
    Link: string;
    Classificacao: string;
    Observacao: string;
    metodo_busca: MetodoBuscaType;
    loja: 'São João' | 'Venancio';

    // New fields
    PrecoOriginal: string;
    Desconto: string;
    Marca: string;
    Disponivel: 'SIM' | 'NÃO';
    DescricaoBusca: string; // To hold the original search description
}


export type ExecutionType = 'buscar' | 'upload';

export interface HistoryItem {
    id: string;
    type: ExecutionType;
    timestamp: string;
    searchTerm?: string;
    fileName?: string;
    itemCount: number;
    results: ExecucaoItem[];
    store: StoreType;
}
