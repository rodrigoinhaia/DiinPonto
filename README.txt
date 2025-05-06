# Progresso do Projeto - DiinPonto

## Funcionalidades Implementadas
- Cadastro, edição, listagem e exclusão de usuários
- Cadastro, edição, listagem e exclusão de departamentos
- Registro de ponto (entrada, saída, pausa, retorno)
- Autenticação por e-mail/senha
- Tela de quiosque (em andamento)
- Seed do admin com PIN (123456) implementado

## Novas Etapas (Modo Quiosque com PIN e Barcode)
- [x] Adicionar campo `pin` (6 dígitos, criptografado) ao modelo User
- [x] Garantir campo `barcode` único no modelo User
- [x] Criar tabela de logs de autenticação do quiosque (KioskAuthLog)
- [x] Atualizar formulário de usuário para incluir PIN e barcode
- [x] Atualizar rotas de cadastro/edição de usuário para aceitar e criptografar PIN
- [x] Atualizar seed para criar admin com PIN
- [ ] Criar rota pública `/api/kiosk/auth` para autenticação por PIN ou barcode
- [ ] Implementar logs/auditoria de tentativas de autenticação (sucesso/falha)
- [ ] Refatorar tela do quiosque para layout centralizado com 4 botões (entrada, pausa, retorno, saída), relógio no topo, e opções de autenticação por PIN ou barcode
- [ ] Feedback visual de sucesso/erro na autenticação e registro de ponto
- [ ] Limitar tentativas de PIN (ex: 5 tentativas, bloqueio temporário)
- [ ] Atualizar documentação técnica e de uso

## Observações
- PIN obrigatório, numérico, 6 dígitos, nunca exibido em listagens
- Fluxo de autenticação pode ser por PIN ou barcode
- Logs de todas as tentativas de autenticação (sucesso/falha) serão registrados
- Layout do quiosque seguirá referência visual fornecida

## Pendências Prioritárias
- [ ] Rota pública `/api/kiosk/auth` (PIN/barcode)
- [ ] Logs/auditoria de tentativas de autenticação
- [ ] Nova tela do quiosque (layout visual, fluxo de autenticação, registro de ponto)
- [ ] Limite de tentativas de PIN
- [ ] Documentação técnica e de uso 