# Documentação do Modo Quiosque

## Visão Geral

O Modo Quiosque é uma interface otimizada para registro de ponto em dispositivos dedicados, como terminais de ponto ou computadores em áreas comuns. O sistema oferece autenticação via PIN ou código de barras, registro de ponto com geolocalização e impressão de comprovantes.

## Componentes Principais

### 1. KioskMode (`src/components/kiosk/KioskMode.tsx`)

Componente principal que gerencia o fluxo do modo quiosque.

#### Props
```typescript
interface KioskModeProps {
  companyInfo: {
    companyName: string
    companyAddress: string
    companyPhone: string
    companyCNPJ: string
  }
}
```

#### Funcionalidades
- Autenticação de usuários
- Registro de ponto com geolocalização
- Impressão de comprovantes
- Feedback visual de sucesso/erro
- Exibição do último registro

### 2. KioskAuth (`src/components/kiosk/KioskAuth.tsx`)

Componente responsável pela autenticação do usuário.

#### Props
```typescript
interface KioskAuthProps {
  onAuth: (userId: string) => void
  onError: (error: string) => void
}
```

#### Funcionalidades
- Autenticação via PIN (6 dígitos)
- Autenticação via código de barras
- Validação de entrada
- Feedback visual de erros
- Limite de tentativas de PIN

### 3. KioskButtons (`src/components/kiosk/KioskButtons.tsx`)

Componente que exibe os botões de registro de ponto.

#### Props
```typescript
interface KioskButtonsProps {
  onRecord: (type: 'ENTRY' | 'PAUSE' | 'RETURN' | 'EXIT') => void
  disabled?: boolean
}
```

#### Funcionalidades
- Botões para cada tipo de registro
- Feedback visual de estado
- Layout responsivo

## Serviços

### 1. PrinterService (`src/lib/services/printer.ts`)

Serviço responsável pela geração e envio de comandos para a impressora térmica.

#### Comandos de Impressora
- `ESC @`: Inicializa a impressora
- `ESC E1`: Ativa negrito
- `ESC E0`: Desativa negrito
- `ESC a1`: Centraliza texto
- `ESC a0`: Alinha à esquerda
- `ESC m`: Corta o papel

#### Formato do Comprovante
```
[NOME DA EMPRESA]
[ENDEREÇO]
CNPJ: [CNPJ]
Tel: [TELEFONE]

COMPROVANTE DE REGISTRO DE PONTO

Funcionário: [NOME]
Matrícula: [MATRÍCULA]
Data: [DATA]
Hora: [HORA]
Tipo: [TIPO]

--------------------------------
Assinatura do Funcionário

--------------------------------
```

## APIs

### 1. Autenticação (`/api/kiosk/auth`)

Endpoint para autenticação no modo quiosque.

#### Método: POST
```typescript
// Request
{
  method: 'PIN' | 'BARCODE'
  pin?: string
  barcode?: string
}

// Response
{
  user: {
    id: string
    name: string
    employeeId: string
  }
}
```

### 2. Registro de Ponto (`/api/time-record/kiosk`)

Endpoint para registro de ponto no modo quiosque.

#### Método: POST
```typescript
// Request
{
  userId: string
  type: 'ENTRY' | 'PAUSE' | 'RETURN' | 'EXIT'
  location: {
    latitude: number
    longitude: number
    accuracy: number
  }
  device: {
    userAgent: string
    platform: string
  }
}

// Response
{
  record: {
    id: string
    type: string
    timestamp: string
    user: {
      name: string
      employeeId: string
    }
  }
}
```

## Hooks

### 1. useBarcodeReader (`src/lib/hooks/useBarcodeReader.ts`)

Hook para gerenciar a leitura de códigos de barras.

#### Parâmetros
```typescript
interface UseBarcodeReaderOptions {
  onRead?: (barcode: string) => void
  onError?: (error: string) => void
  timeout?: number
}
```

#### Retorno
```typescript
{
  barcode: string
  isReading: boolean
  reset: () => void
}
```

## Configuração

### 1. Impressora Térmica

1. Instale os drivers da impressora
2. Configure a porta de comunicação (USB/Rede)
3. Teste a conexão usando o comando de teste da impressora
4. Ajuste as configurações de papel (largura: 80mm)

### 2. Leitor de Código de Barras

1. Conecte o leitor via USB
2. Configure o leitor para enviar Enter após a leitura
3. Teste a leitura em diferentes tipos de crachá

## Segurança

1. Limite de tentativas de PIN (5 tentativas)
2. Bloqueio temporário após falhas
3. Logs de auditoria de autenticação
4. Validação de geolocalização
5. Registro de dispositivo

## Troubleshooting

### Problemas Comuns

1. **Impressora não imprime**
   - Verifique a conexão
   - Confirme se o papel está carregado
   - Teste com o comando de teste da impressora

2. **Leitor não funciona**
   - Verifique a conexão USB
   - Confirme se o leitor está configurado corretamente
   - Teste em diferentes aplicativos

3. **Erro de geolocalização**
   - Verifique as permissões do navegador
   - Confirme se o GPS está ativo
   - Teste em diferentes navegadores

## Manutenção

1. Limpeza regular da impressora
2. Backup dos logs de auditoria
3. Atualização dos drivers
4. Verificação periódica do papel
5. Testes de integração 