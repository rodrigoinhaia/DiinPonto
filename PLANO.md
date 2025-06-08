# Plano de Desenvolvimento - DiinPonto

## Status do Projeto

### ✅ Implementado

#### 1. Configuração Inicial
- [x] Configurar projeto Next.js com TypeScript
- [x] Configurar Tailwind CSS
- [x] Configurar ESLint e Prettier
- [x] Configurar estrutura de diretórios
- [x] Configurar banco de dados PostgreSQL com Prisma
- [x] Configurar autenticação com NextAuth.js (migrado de JWT)

#### 2. Desenvolvimento do Backend
- [x] Implementar autenticação de usuários
  - [x] Login com email/senha
  - [x] Registro de novos usuários
  - [x] Proteção de rotas com middleware
  - [x] Gerenciamento de sessão com NextAuth.js
- [x] Implementar API de registro de ponto
  - [x] Endpoint para criar registro
  - [x] Endpoint para buscar último registro
  - [x] Validação de sequência de registros
  - [x] Integração com geolocalização

#### 3. Desenvolvimento do Frontend
- [x] Implementar páginas de autenticação
  - [x] Página de login
  - [x] Página de registro
  - [x] Formulários com validação
- [x] Implementar interface de registro de ponto
  - [x] Relógio em tempo real
  - [x] Botões de entrada/saída
  - [x] Status do último registro
  - [x] Integração com geolocalização
  - [x] Feedback visual de erros
  - [x] Responsividade

## 4. Perfis de Usuário (Em Desenvolvimento) 👥
- [x] Implementar sistema de perfis
  - [x] Administrador
    - [x] Gerenciamento de usuários
    - [x] Configuração de jornadas
    - [x] Acesso total ao sistema
    - [x] Relatórios avançados
    - [x] Configurações do sistema
  - [x] Gestor
    - [x] Aprovação de correções
    - [x] Visualização da equipe
    - [x] Relatórios da equipe
    - [x] Gestão de jornadas
  - [x] Colaborador
    - [x] Registro de ponto
    - [x] Visualização própria
    - [x] Solicitação de correções
    - [x] Histórico pessoal
- [x] Implementar fluxo de aprovações
  - [x] Solicitação de correção
  - [x] Notificação ao gestor
  - [x] Aprovação/Rejeição
  - [x] Histórico de alterações
- [ ] Implementar restrições de acesso
  - [x] Middleware por perfil
  - [x] Validação de permissões
  - [ ] Logs de auditoria

#### 5. Modo Quiosque
- [x] Implementar interface do quiosque
  - [x] Tela de leitura de crachá
  - [x] Feedback visual e sonoro
  - [x] Modo tela cheia
  - [x] Proteção contra saída acidental
- [x] Adicionar campo `pin` (6 dígitos, criptografado) ao modelo User
- [x] Garantir campo `barcode` único no modelo User
- [x] Atualizar formulário de usuário para incluir PIN e barcode
- [x] Atualizar rotas de cadastro/edição de usuário para aceitar e criptografar PIN
- [x] Atualizar seed para criar admin com PIN
- [x] Criar tabela de logs de autenticação do quiosque (KioskAuthLog)
- [x] Criar rota pública `/api/kiosk/auth` para autenticação por PIN ou barcode
- [x] Implementar logs/auditoria de tentativas de autenticação (sucesso/falha)
- [x] Refatorar tela do quiosque para layout centralizado com 4 botões (entrada, pausa, retorno, saída), relógio no topo, e opções de autenticação por PIN ou barcode
- [x] Feedback visual de sucesso/erro na autenticação e registro de ponto
- [x] Limitar tentativas de PIN (ex: 5 tentativas, bloqueio temporário)
- [ ] Atualizar documentação técnica e de uso
- [x] Integrar leitor de código de barras
  - [x] Configurar leitor
  - [x] Implementar leitura
  - [x] Validação de crachá
- [x] Integrar impressora térmica
  - [x] Configurar impressora
  - [x] Instalar drivers necessários
  - [x] Configurar porta de comunicação
  - [x] Testar conexão
  - [x] Implementar impressão de comprovantes
  - [x] Criar layout do comprovante
  - [x] Implementar comandos de impressão
  - [x] Adicionar cabeçalho com dados da empresa
  - [x] Incluir dados do registro
  - [x] Adicionar espaço para assinatura
  - [x] Implementar corte automático do papel
  - [x] Testar impressão
  - [x] Verificar qualidade da impressão
  - [x] Testar diferentes tipos de registro
  - [x] Validar formatação do texto
  - [x] Confirmar corte do papel

## 6. Relatórios e Dashboard (Em Desenvolvimento) 📊
- [x] Implementar dashboard administrativo
  - [x] Visão geral de registros
  - [x] Filtros por período
  - [x] Exportação de relatórios
- [x] Implementar relatórios personalizados
  - [x] Relatório de horas trabalhadas
  - [x] Relatório de atrasos
  - [x] Relatório de horas extras
- [x] Implementar dashboards por perfil
  - [x] Dashboard do administrador
  - [x] Dashboard do gestor
  - [x] Dashboard do colaborador

#### 7. Melhorias nos Relatórios
- [x] Gráficos e estatísticas avançadas
  - [x] Gráfico de barras para registros por departamento
  - [x] Gráfico de linha para registros por usuário
  - [x] Gráfico de pizza para distribuição de registros
  - [x] Gráfico de área para horas trabalhadas
  - [x] Gráfico de barras para atrasos
  - [x] Estatísticas de atrasos e horas extras
  - [x] Cards com métricas principais
- [x] Relatórios por departamento
- [x] Relatórios por usuário
- [x] Filtros avançados (por usuário, departamento, tipo de registro)
- [x] Exportação em outros formatos (CSV)

#### 8. Testes e Qualidade
- [ ] Implementar testes unitários
- [ ] Implementar testes de integração
- [ ] Implementar testes end-to-end
- [ ] Configurar CI/CD

#### 9. Documentação
- [x] Documentar API
- [x] Documentar componentes
- [x] Criar manual do usuário
- [x] Criar manual técnico

#### 10. Deploy e Infraestrutura
- [ ] Configurar ambiente de produção
- [ ] Configurar monitoramento
- [ ] Configurar backup
- [ ] Implementar SSL
- [ ] Configurar domínio

#### 11. Correções Técnicas
- [ ] Resolver erros de importação dos componentes UI
- [ ] Instalar dependências faltantes:
  - [ ] @radix-ui/react-icons
  - [ ] date-fns
  - [ ] react-day-picker
  - [ ] Componentes UI (table, calendar, popover)
- [ ] Corrigir tipagem do parâmetro `range` no DateRangePicker

## Pendências Prioritárias do Modo Quiosque
- [ ] Rota pública `/api/kiosk/auth` (PIN/barcode)
- [ ] Logs/auditoria de tentativas de autenticação
- [ ] Nova tela do quiosque (layout visual, fluxo de autenticação, registro de ponto)
- [ ] Limite de tentativas de PIN
- [ ] Documentação técnica e de uso

## Próximos Passos

### Prioridade Alta
1. ✅ Resolver os erros de linter instalando as dependências faltantes
2. ✅ Implementar os componentes `DepartmentStats` e `UserStats`
3. ✅ Adicionar gráficos nos relatórios
4. ✅ Implementar relatórios por usuário com gráficos de linha
5. ✅ Adicionar mais tipos de gráficos (pizza, área)

### Prioridade Média
1. ✅ Implementar relatórios personalizados
2. ✅ Implementar relatório de atrasos
3. Implementar relatório de horas extras
4. Adicionar mais métricas e indicadores
5. Melhorar a visualização dos dados

### Prioridade Baixa
1. Integração com impressora térmica
2. Suporte a diferentes formatos de código de barras
3. Integração com câmera

## Notas Técnicas

### Stack Atual
- Backend: Next.js 14 com TypeScript
- Frontend: React com Tailwind CSS
- Banco de Dados: PostgreSQL com Prisma
- Autenticação: NextAuth.js
- UI: shadcn/ui
- Geolocalização: API do navegador

### Melhorias de UX/UI Pendentes
- Adicionar feedback visual para ações
- Melhorar responsividade
- Implementar temas claro/escuro
- Adicionar animações suaves

### Segurança
- Implementar rate limiting
- Adicionar validação de entrada
- Melhorar tratamento de erros
- Implementar logs de auditoria

## Perfis de Usuário

### Administrador
- Acesso total ao sistema
- Gerenciamento de usuários e perfis
- Configuração de jornadas e horários
- Relatórios avançados e exportação
- Configurações do sistema
- Monitoramento em tempo real
- Gestão de departamentos

### Gestor
- Aprovação de correções de ponto
- Visualização da equipe
- Relatórios da equipe
- Gestão de jornadas
- Monitoramento de atrasos
- Aprovação de horas extras
- Gestão de ausências

### Colaborador
- Registro de ponto
- Visualização de registros próprios
- Solicitação de correções
- Histórico pessoal
- Consulta de horas trabalhadas
- Notificações de alterações
- Comprovantes de registro

## Fluxo de Aprovações

### Solicitação de Correção
1. Colaborador solicita correção
2. Justificativa obrigatória
3. Evidências (opcional)
4. Data/hora da correção

### Processo de Aprovação
1. Notificação ao gestor
2. Análise da solicitação
3. Aprovação/Rejeição
4. Notificação ao colaborador
5. Registro de alteração

### Histórico de Alterações
- Data/hora da solicitação
- Colaborador solicitante
- Gestor responsável
- Status da solicitação
- Justificativa
- Evidências
- Data/hora da aprovação/rejeição

## Visão Geral
Sistema completo de registro de ponto com suporte web e modo quiosque, focado em conformidade legal e experiência do usuário.

## Stack Tecnológica

### Backend
- Node.js com TypeScript
- NestJS (Framework)
- PostgreSQL 17.4 (Banco de dados principal)
- Redis (Cache e sessões)
- Prisma (ORM)
- JWT (Autenticação)
- Socket.IO (Tempo real)

### Frontend Web
- Next.js 14
- TypeScript
- Tailwind CSS
- Shadcn/ui (Componentes)
- React Query
- Zustand (Gerenciamento de estado)

### Modo Quiosque
- Electron (Aplicação desktop)
- React
- TypeScript
- Tailwind CSS
- React Native Web
- Suporte a impressora térmica 80mm (USB/Rede)
- Leitor de código de barras (USB)

### Infraestrutura
- Docker
- PostgreSQL 17.4 (Container em nuvem)
- GitHub Actions (CI/CD)
- Nginx (Proxy reverso)



## Fluxo de Aprovação
- [x] Implementar solicitação de correção
  - [x] Criar formulário de solicitação
  - [x] Implementar validações
  - [x] Adicionar upload de evidências
- [x] Implementar notificações
  - [x] Notificar gestores sobre novas solicitações
  - [x] Notificar funcionários sobre status da solicitação
- [x] Implementar aprovação/rejeição
  - [x] Criar interface para gestores
  - [x] Implementar lógica de aprovação
  - [x] Atualizar registro após aprovação
- [x] Implementar histórico de solicitações
  - [x] Criar listagem de solicitações
  - [x] Adicionar filtros por status
  - [x] Exibir detalhes da solicitação