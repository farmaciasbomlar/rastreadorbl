const url = "https://www.saojoaofarmacias.com.br/api/catalog_system/pub/products/search?ft=AMOXIC%2BCLAV.POT%20400MG%2070ML%20GEN%20EURO&O=OrderByPriceASC";

const headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Accept': 'application/json, text/plain, */*',
    'Accept-Language': 'pt-BR,pt;q=0.9,en-US;q=0.8,en;q=0.7',
    'Connection': 'keep-alive'
};

fetch(url, { headers }).then(r => {
    console.log(r.status);
    return r.text();
}).then(console.log).catch(console.error);
