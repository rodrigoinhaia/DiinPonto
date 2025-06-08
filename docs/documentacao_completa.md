# Sistema DiinPonto - Documentação Completa

## Visão Geral

O DiinPonto é um sistema completo de controle de ponto eletrônico desenvolvido com Next.js 14, TypeScript, Prisma e PostgreSQL. O sistema oferece funcionalidades avançadas para registro de ponto, gerenciamento de usuários, relatórios e integração com dispositivos externos.

## Tecnologias Utilizadas

### Frontend
- **Next.js 14**: Framework React com App Router
- **TypeScript**: Tipagem estática
- **Tailwind CSS**: Framework de estilos
- **Shadcn/UI**: Componentes de interface
- **Lucide Icons**: Ícones
- **Recharts**: Gráficos e visualizações

### Backend
- **Next.js API Routes**: APIs RESTful
- **Prisma**: ORM para banco de dados
- **PostgreSQL**: Banco de dados relacional
- **NextAuth.js**: Autenticação e autorização
- **bcryptjs**: Hash de senhas

### Integrações
- **@zxing/library**: Leitura de código de barras
- **ESC/POS**: Comandos para impressoras térmicas
- **WebHID API**: Integração com dispositivos USB
- **Web Serial API**: Integração com dispositivos seriais
- **Geolocation API**: Localização GPS

## Arquitetura do Sistema

### Estrutura de Diretórios

```
src/
├── app/                    # App Router do Next.js
│   ├── api/               # APIs RESTful
│   │   ├── auth/          # Autenticação
│   │   ├── users/         # Gerenciamento de usuários
│   │   ├── departments/   # Gerenciamento de departamentos
│   │   ├── work-schedules/ # Horários de trabalho
│   │   ├── time-record/   # Registro de ponto
│   │   ├── corrections/   # Correções de ponto
│   │   ├── reports/       # Relatórios
│   │   ├── kiosk/         # Modo quiosque
│   │   ├── printer/       # Impressora térmica
│   │   └── barcode-reader/ # Leitor de código de barras
│   ├── (auth)/            # Páginas de autenticação
│   ├── dashboard/         # Dashboard principal
│   ├── users/             # Gerenciamento de usuários
│   ├── time-record/       # Registro de ponto
│   ├── kiosk/             # Modo quiosque
│   └── reports/           # Relatórios
├── components/            # Componentes React
│   ├── ui/               # Componentes base (Shadcn/UI)
│   ├── auth/             # Componentes de autenticação
│   ├── time-record/      # Componentes de registro
│   ├── kiosk/            # Componentes do quiosque
│   └── reports/          # Componentes de relatórios
├── lib/                  # Bibliotecas e utilitários
│   ├── hooks/            # React Hooks customizados
│   ├── services/         # Serviços de integração
│   ├── utils/            # Funções utilitárias
│   ├── prisma.ts         # Cliente Prisma
│   └── next-auth.ts      # Configuração NextAuth
└── middleware.ts         # Middleware de autenticação
```

### Banco de Dados

O sistema utiliza PostgreSQL com Prisma ORM. O schema inclui as seguintes entidades principais:

- **User**: Usuários do sistema
- **Department**: Departamentos da empresa
- **WorkSchedule**: Horários de trabalho
- **TimeRecord**: Registros de ponto
- **CorrectionRequest**: Solicitações de correção
- **KioskAuthLog**: Logs de autenticação do quiosque

## Funcionalidades Implementadas

### 1. Autenticação e Controle de Acesso

#### Características:
- Autenticação via email/senha e PIN
- Três níveis de acesso: ADMIN, MANAGER, EMPLOYEE
- Middleware de proteção de rotas
- Sistema de permissões granulares

#### APIs:
- `POST /api/auth/signin` - Login
- `POST /api/register` - Registro de usuários
- `GET /api/auth/session` - Sessão atual

### 2. Gerenciamento de Usuários

#### Características:
- CRUD completo de usuários
- Associação com departamentos
- Geração automática de PIN
- Reset de PIN
- Códigos de barras únicos

#### APIs:
- `GET /api/users` - Listar usuários
- `POST /api/users` - Criar usuário
- `GET /api/users/[id]` - Buscar usuário
- `PUT /api/users/[id]` - Atualizar usuário
- `DELETE /api/users/[id]` - Deletar usuário
- `POST /api/users/[id]/reset-pin` - Reset PIN

### 3. Gerenciamento de Departamentos

#### Características:
- CRUD de departamentos
- Associação com gerentes
- Validação de hierarquia

#### APIs:
- `GET /api/departments` - Listar departamentos
- `POST /api/departments` - Criar departamento
- `GET /api/departments/[id]` - Buscar departamento
- `PUT /api/departments/[id]` - Atualizar departamento
- `DELETE /api/departments/[id]` - Deletar departamento

### 4. Horários de Trabalho

#### Características:
- Configuração de horários por usuário
- Horários de entrada/saída
- Intervalos configuráveis
- Dias da semana específicos

#### APIs:
- `GET /api/work-schedules` - Listar horários
- `POST /api/work-schedules` - Criar horário
- `GET /api/work-schedules/[id]` - Buscar horário
- `PUT /api/work-schedules/[id]` - Atualizar horário
- `DELETE /api/work-schedules/[id]` - Deletar horário

### 5. Registro de Ponto

#### Características:
- Registro de entrada/saída
- Validação de sequência
- Geolocalização opcional
- Interface responsiva
- Relógio em tempo real

#### APIs:
- `POST /api/time-record` - Registrar ponto
- `GET /api/time-record` - Listar registros
- `POST /api/time-record/kiosk` - Registro via quiosque

### 6. Solicitações de Correção

#### Características:
- Solicitação de correção por funcionários
- Fluxo de aprovação/rejeição
- Histórico de alterações
- Notificações de status

#### APIs:
- `GET /api/corrections` - Listar correções
- `POST /api/corrections` - Criar correção
- `GET /api/corrections/[id]` - Buscar correção
- `PUT /api/corrections/[id]` - Atualizar correção
- `PUT /api/corrections/[id]/approve` - Aprovar correção
- `PUT /api/corrections/[id]/reject` - Rejeitar correção

### 7. Modo Quiosque

#### Características:
- Interface dedicada para terminais
- Autenticação via PIN ou código de barras
- Registro simplificado
- Logs de auditoria

#### APIs:
- `POST /api/kiosk/auth` - Autenticação no quiosque
- `POST /api/time-record/kiosk` - Registro no quiosque

### 8. Relatórios

#### Características:
- Relatórios de resumo, detalhado e frequência
- Filtros por período, usuário e departamento
- Exportação em CSV, XLSX e PDF
- Controle de permissões

#### APIs:
- `GET /api/reports` - Gerar relatórios
- `GET /api/reports/export` - Exportar relatórios

### 9. Integração com Impressora Térmica

#### Características:
- Suporte para impressoras USB, rede e serial
- Comandos ESC/POS padrão
- Impressão automática de comprovantes
- Teste de conectividade

#### APIs:
- `POST /api/printer/print` - Enviar comando
- `POST /api/printer/test` - Testar impressora
- `GET /api/printer/test` - Listar impressoras

#### Serviços:
- `PrinterService`: Geração de comandos ESC/POS
- Suporte para WebUSB, TCP/IP e Web Serial

### 10. Leitor de Código de Barras

#### Características:
- Leitura via câmera, USB e serial
- Integração com ZXing
- Autenticação no quiosque
- Múltiplos formatos suportados

#### APIs:
- `GET /api/barcode-reader/test` - Listar leitores
- `POST /api/barcode-reader/test` - Testar leitor

#### Serviços:
- `BarcodeReaderService`: Leitura multi-dispositivo
- Suporte para WebHID, Web Serial e MediaDevices

## Segurança

### Autenticação
- Senhas hasheadas com bcryptjs
- PINs criptografados
- Sessões seguras com NextAuth.js
- Tokens JWT para APIs

### Autorização
- Middleware de proteção de rotas
- Controle de acesso baseado em papéis (RBAC)
- Validação de permissões em todas as APIs
- Logs de auditoria para ações sensíveis

### Validação
- Validação de entrada em todas as APIs
- Sanitização de dados
- Prevenção de SQL injection via Prisma
- Validação de tipos com TypeScript

## Performance

### Frontend
- Server-side rendering com Next.js
- Componentes otimizados
- Lazy loading de recursos
- Cache de dados

### Backend
- Queries otimizadas com Prisma
- Índices no banco de dados
- Paginação em listagens
- Cache de sessões

### Banco de Dados
- Índices em campos frequentemente consultados
- Relacionamentos otimizados
- Transações para operações críticas
- Pool de conexões

## Monitoramento

### Logs
- Logs de autenticação
- Logs de registro de ponto
- Logs de erro
- Auditoria de ações administrativas

### Métricas
- Registros por período
- Usuários ativos
- Tentativas de autenticação
- Performance das APIs

## Deployment

### Requisitos
- Node.js 18+
- PostgreSQL 12+
- HTTPS (para WebAPIs)
- Navegador moderno

### Variáveis de Ambiente
```env
DATABASE_URL="postgresql://..."
NEXTAUTH_SECRET="..."
NEXTAUTH_URL="https://..."
```

### Comandos
```bash
# Instalação
npm install

# Migrações
npx prisma migrate deploy

# Build
npm run build

# Start
npm start
```

## Manutenção

### Backup
- Backup automático do banco de dados
- Versionamento de schema
- Restore point antes de atualizações

### Atualizações
- Migrações incrementais
- Testes antes do deploy
- Rollback em caso de problemas

### Monitoramento
- Health checks das APIs
- Monitoramento de performance
- Alertas de erro

## Suporte

### Documentação
- README detalhado
- Comentários no código
- Exemplos de uso
- Troubleshooting

### Logs
- Logs estruturados
- Níveis de log configuráveis
- Rotação automática
- Centralização de logs

## Conclusão

O sistema DiinPonto oferece uma solução completa e robusta para controle de ponto eletrônico, com funcionalidades avançadas, integração com dispositivos externos e alta segurança. A arquitetura modular permite fácil manutenção e extensibilidade para futuras funcionalidades.

