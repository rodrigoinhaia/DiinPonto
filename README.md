# DiinPonto - Sistema de Controle de Ponto Eletrônico

![Next.js](https://img.shields.io/badge/Next.js-14-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)
![Prisma](https://img.shields.io/badge/Prisma-5-2D3748)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15-336791)

Sistema completo de controle de ponto eletrônico desenvolvido com Next.js 14, TypeScript, Prisma e PostgreSQL. Oferece funcionalidades avançadas para registro de ponto, gerenciamento de usuários, relatórios e integração com dispositivos externos.

## 🚀 Funcionalidades

### ✅ Autenticação e Controle de Acesso
- Autenticação via email/senha e PIN
- Três níveis de acesso: ADMIN, MANAGER, EMPLOYEE
- Sistema de permissões granulares
- Middleware de proteção de rotas

### ✅ Registro de Ponto
- Interface responsiva com relógio em tempo real
- Registro de entrada/saída com validação
- Geolocalização opcional para validação
- Histórico completo de registros

### ✅ Gerenciamento de Usuários
- CRUD completo de usuários
- Associação com departamentos
- Geração automática de PIN
- Códigos de barras únicos

### ✅ Gerenciamento de Departamentos
- Criação e edição de departamentos
- Associação com gerentes
- Controle hierárquico

### ✅ Horários de Trabalho
- Configuração de horários por usuário
- Horários de entrada/saída personalizáveis
- Intervalos configuráveis
- Dias da semana específicos

### ✅ Solicitações de Correção
- Funcionários podem solicitar correção de registros
- Fluxo de aprovação/rejeição por gestores
- Histórico completo de alterações
- Atualização automática dos registros aprovados

### ✅ Modo Quiosque
- Interface dedicada para terminais de ponto
- Autenticação via PIN ou código de barras
- Registro simplificado
- Logs de auditoria completos

### ✅ Relatórios Avançados
- Relatórios de resumo, detalhado e frequência
- Filtros por período, usuário e departamento
- Exportação em CSV, XLSX e PDF
- Controle de permissões baseado em papéis

### ✅ Integração com Impressora Térmica
- Suporte para impressoras USB, rede (TCP/IP) e serial
- Comandos ESC/POS padrão
- Impressão automática de comprovantes
- Teste de conectividade

### ✅ Leitor de Código de Barras
- Leitura via câmera, USB (HID) e serial
- Integração com ZXing para decodificação
- Autenticação no modo quiosque
- Suporte para múltiplos formatos

## 🛠️ Tecnologias

### Frontend
- **Next.js 14** - Framework React com App Router
- **TypeScript** - Tipagem estática
- **Tailwind CSS** - Framework de estilos
- **Shadcn/UI** - Componentes de interface
- **Lucide Icons** - Ícones
- **Recharts** - Gráficos e visualizações

### Backend
- **Next.js API Routes** - APIs RESTful
- **Prisma** - ORM para banco de dados
- **PostgreSQL** - Banco de dados relacional
- **NextAuth.js** - Autenticação e autorização
- **bcryptjs** - Hash de senhas

### Integrações
- **@zxing/library** - Leitura de código de barras
- **ESC/POS** - Comandos para impressoras térmicas
- **WebHID API** - Integração com dispositivos USB
- **Web Serial API** - Integração com dispositivos seriais
- **Geolocation API** - Localização GPS

## 📋 Pré-requisitos

- Node.js 18 ou superior
- PostgreSQL 12 ou superior
- npm ou yarn
- Navegador moderno (para WebAPIs)

## 🚀 Instalação

### 1. Clone o repositório
```bash
git clone https://github.com/rodrigoinhaia/DiinPonto.git
cd DiinPonto
```

### 2. Instale as dependências
```bash
npm install
```

### 3. Configure o banco de dados
```bash
# Inicie o PostgreSQL
sudo systemctl start postgresql

# Crie o banco de dados
sudo -u postgres createdb diinponto
```

### 4. Configure as variáveis de ambiente
```bash
cp .env.example .env
```

Edite o arquivo `.env` com suas configurações:
```env
DATABASE_URL="postgresql://postgres:password@localhost:5432/diinponto"
NEXTAUTH_SECRET="seu-secret-aqui"
NEXTAUTH_URL="http://localhost:3000"
```

### 5. Execute as migrações
```bash
npx prisma migrate dev --name init
```

### 6. Inicie o servidor de desenvolvimento
```bash
npm run dev
```

O sistema estará disponível em `http://localhost:3000`

## 📖 Uso

### Primeiro Acesso
1. Acesse `http://localhost:3000`
2. Clique em "Criar Conta" para registrar o primeiro usuário
3. Preencha os dados obrigatórios
4. Faça login com as credenciais criadas

### Configuração Inicial
1. Configure departamentos em "Gerenciamento > Departamentos"
2. Adicione usuários em "Gerenciamento > Usuários"
3. Configure horários de trabalho se necessário
4. Teste o registro de ponto

### Modo Quiosque
1. Acesse `http://localhost:3000/kiosk`
2. Configure PIN ou código de barras para os usuários
3. Use a interface simplificada para registro

### Relatórios
1. Acesse "Relatórios" no menu principal
2. Configure filtros desejados
3. Visualize ou exporte os dados

## 🔧 Configuração de Dispositivos

### Impressora Térmica
```javascript
// Configuração via rede
PrinterService.configure({
  type: 'network',
  address: '192.168.1.100',
  port: 9100
})

// Teste de impressão
await PrinterService.testConnection()
```

### Leitor de Código de Barras
```javascript
// Configuração via câmera
BarcodeReaderService.configure({
  type: 'camera'
})

// Iniciar leitura
await BarcodeReaderService.startReading((result) => {
  console.log('Código lido:', result.code)
})
```

## 📁 Estrutura do Projeto

```
src/
├── app/                    # App Router do Next.js
│   ├── api/               # APIs RESTful
│   ├── (auth)/            # Páginas de autenticação
│   ├── dashboard/         # Dashboard principal
│   ├── users/             # Gerenciamento de usuários
│   ├── time-record/       # Registro de ponto
│   ├── kiosk/             # Modo quiosque
│   └── reports/           # Relatórios
├── components/            # Componentes React
├── lib/                  # Bibliotecas e utilitários
└── middleware.ts         # Middleware de autenticação
```

## 🔒 Segurança

- Senhas hasheadas com bcryptjs
- PINs criptografados
- Sessões seguras com NextAuth.js
- Controle de acesso baseado em papéis (RBAC)
- Validação de entrada em todas as APIs
- Logs de auditoria para ações sensíveis

## 📊 APIs Disponíveis

### Autenticação
- `POST /api/auth/signin` - Login
- `POST /api/register` - Registro

### Usuários
- `GET /api/users` - Listar usuários
- `POST /api/users` - Criar usuário
- `PUT /api/users/[id]` - Atualizar usuário
- `DELETE /api/users/[id]` - Deletar usuário

### Registro de Ponto
- `POST /api/time-record` - Registrar ponto
- `GET /api/time-record` - Listar registros

### Relatórios
- `GET /api/reports` - Gerar relatórios
- `GET /api/reports/export` - Exportar relatórios

[Documentação completa das APIs](./docs/documentacao_completa.md)

## 🧪 Testes

```bash
# Executar testes
npm test

# Executar testes com coverage
npm run test:coverage

# Executar testes e2e
npm run test:e2e
```

## 📦 Build e Deploy

### Build de produção
```bash
npm run build
```

### Deploy
```bash
# Usando PM2
pm2 start npm --name "diinponto" -- start

# Usando Docker
docker build -t diinponto .
docker run -p 3000:3000 diinponto
```

## 🤝 Contribuição

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📝 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

## 📞 Suporte

- 📧 Email: suporte@diinponto.com
- 📱 WhatsApp: (11) 99999-9999
- 🌐 Website: https://diinponto.com
- 📖 Documentação: [docs/documentacao_completa.md](./docs/documentacao_completa.md)

## 🎯 Roadmap

- [ ] Aplicativo mobile (React Native)
- [ ] Integração com sistemas de RH
- [ ] Reconhecimento facial
- [ ] Dashboard analytics avançado
- [ ] API para integrações externas
- [ ] Notificações push
- [ ] Backup automático na nuvem

---

Desenvolvido com ❤️ pela equipe DiinPonto

