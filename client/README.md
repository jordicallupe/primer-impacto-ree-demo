# Frontend

SPA en React + TypeScript para consultar la API del backend y visualizar el
balance electrico mediante Chart.js.

## Comandos

```bash
npm install
npm run dev
npm test
npm run build
```

## Estructura

- `features/electric-balance/api`: cliente HTTP y hook de React Query.
- `features/electric-balance/components`: grafico y estados de carga.
- `features/electric-balance/types`: contrato compartido con la API.
- `shared/lib`: configuracion comun de Axios.

La URL del backend se configura con `VITE_API_URL`.
