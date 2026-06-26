# Backend

API REST construida con NestJS para sincronizar y consultar el balance
electrico de REE.

## Comandos

```bash
npm install
npm run start:dev
npm test
npm run build
```

## Estructura

- `domain/entities`: modelo de dominio sin dependencias de framework.
- `domain/ports`: contratos para persistencia y API externa.
- `domain/use-cases`: casos de uso testeables con mocks.
- `infrastructure/adapters`: implementaciones TypeORM y cliente HTTP de REE.
- `infrastructure/http`: controladores REST y validacion de queries.
- `infrastructure/jobs`: sincronizacion periodica.

La base de datos esperada es PostgreSQL y la conexion se configura mediante
`DATABASE_URL`.
