# DiinPonto

Sistema de registro de ponto com suporte web e modo quiosque.

## Tecnologias

- Next.js 14 (App Router)
- TypeScript
- Prisma
- PostgreSQL
- NextAuth.js
- Tailwind CSS
- shadcn/ui

## Configuração

1. Clone o repositório:
```bash
git clone https://github.com/seu-usuario/diinponto.git
cd diinponto
```

2. Instale as dependências:
```bash
npm install
```

3. Copie o arquivo `.env.example` para `.env`:
```bash
cp .env.example .env
```

4. Configure as variáveis de ambiente no arquivo `.env`:
- `DATABASE_URL`: URL de conexão com o banco de dados PostgreSQL
- `NEXTAUTH_SECRET`: Chave secreta para autenticação (gere uma chave forte)
- `NEXTAUTH_URL`: URL base da aplicação (em desenvolvimento: http://localhost:3000)

5. Execute as migrações do banco de dados:
```bash
npx prisma migrate dev
```

6. Inicie o servidor de desenvolvimento:
```bash
npm run dev
```

## Funcionalidades

- [x] Autenticação de usuários
- [x] Registro de ponto (entrada/saída)
- [x] Geolocalização
- [x] Controle de acesso baseado em papéis
- [x] Gerenciamento de usuários
- [x] Gerenciamento de departamentos
- [x] Gerenciamento de horários
- [x] Solicitação e aprovação de correções
- [ ] Modo quiosque
- [ ] Relatórios
- [ ] Integração com impressora térmica
- [ ] Leitor de código de barras

## Estrutura do Projeto

```
src/
  ├── app/                 # Rotas e páginas
  ├── components/         # Componentes React
  ├── lib/               # Utilitários e serviços
  │   ├── hooks/        # Hooks personalizados
  │   └── services/     # Serviços de dados
  └── prisma/           # Schema e migrações
```

## Contribuição

1. Faça um fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/nova-feature`)
3. Faça commit das suas alterações (`git commit -m 'Adiciona nova feature'`)
4. Faça push para a branch (`git push origin feature/nova-feature`)
5. Abra um Pull Request

## Licença

Este projeto está licenciado sob a licença MIT - veja o arquivo [LICENSE](LICENSE) para mais detalhes. 