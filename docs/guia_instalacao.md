# Guia de Instalação - DiinPonto

Este guia fornece instruções detalhadas para instalação e configuração do sistema DiinPonto.

## Requisitos do Sistema

### Hardware Mínimo
- **CPU**: 2 cores, 2.0 GHz
- **RAM**: 4 GB
- **Armazenamento**: 10 GB livres
- **Rede**: Conexão com internet

### Hardware Recomendado
- **CPU**: 4 cores, 2.5 GHz ou superior
- **RAM**: 8 GB ou superior
- **Armazenamento**: SSD com 20 GB livres
- **Rede**: Conexão estável com internet

### Software
- **Sistema Operacional**: Ubuntu 20.04+, Windows 10+, macOS 10.15+
- **Node.js**: Versão 18.0 ou superior
- **PostgreSQL**: Versão 12.0 ou superior
- **Navegador**: Chrome 90+, Firefox 88+, Safari 14+, Edge 90+

## Instalação Passo a Passo

### 1. Preparação do Ambiente

#### Ubuntu/Debian
```bash
# Atualizar sistema
sudo apt update && sudo apt upgrade -y

# Instalar Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Instalar PostgreSQL
sudo apt install postgresql postgresql-contrib -y

# Iniciar PostgreSQL
sudo systemctl start postgresql
sudo systemctl enable postgresql
```

#### Windows
1. Baixe e instale Node.js do [site oficial](https://nodejs.org/)
2. Baixe e instale PostgreSQL do [site oficial](https://www.postgresql.org/download/windows/)
3. Adicione Node.js e PostgreSQL ao PATH do sistema

#### macOS
```bash
# Instalar Homebrew (se não tiver)
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# Instalar Node.js
brew install node

# Instalar PostgreSQL
brew install postgresql
brew services start postgresql
```

### 2. Configuração do Banco de Dados

#### Criar Usuário e Banco
```bash
# Acessar PostgreSQL
sudo -u postgres psql

# Criar usuário (substitua 'senha123' por uma senha segura)
CREATE USER diinponto WITH PASSWORD 'senha123';

# Criar banco de dados
CREATE DATABASE diinponto OWNER diinponto;

# Conceder privilégios
GRANT ALL PRIVILEGES ON DATABASE diinponto TO diinponto;

# Sair do PostgreSQL
\q
```

#### Configurar Acesso Remoto (Opcional)
```bash
# Editar postgresql.conf
sudo nano /etc/postgresql/*/main/postgresql.conf

# Adicionar/modificar linha:
listen_addresses = '*'

# Editar pg_hba.conf
sudo nano /etc/postgresql/*/main/pg_hba.conf

# Adicionar linha para acesso remoto:
host    all             all             0.0.0.0/0               md5

# Reiniciar PostgreSQL
sudo systemctl restart postgresql
```

### 3. Download e Configuração do Projeto

#### Clonar Repositório
```bash
# Clonar projeto
git clone https://github.com/rodrigoinhaia/DiinPonto.git
cd DiinPonto

# Verificar versão do Node.js
node --version  # Deve ser 18.0 ou superior
```

#### Instalar Dependências
```bash
# Instalar dependências do projeto
npm install

# Verificar se todas as dependências foram instaladas
npm list --depth=0
```

### 4. Configuração de Variáveis de Ambiente

#### Criar Arquivo .env
```bash
# Copiar arquivo de exemplo
cp .env.example .env

# Editar arquivo .env
nano .env
```

#### Configurar Variáveis
```env
# URL do banco de dados
DATABASE_URL="postgresql://diinponto:senha123@localhost:5432/diinponto"

# Chave secreta para NextAuth (gere uma chave aleatória)
NEXTAUTH_SECRET="sua-chave-secreta-muito-longa-e-aleatoria-aqui"

# URL da aplicação
NEXTAUTH_URL="http://localhost:3000"

# Configurações opcionais
NODE_ENV="development"
```

#### Gerar Chave Secreta
```bash
# Gerar chave aleatória
openssl rand -base64 32
```

### 5. Configuração do Banco de Dados

#### Executar Migrações
```bash
# Gerar cliente Prisma
npx prisma generate

# Executar migrações
npx prisma migrate dev --name init

# Verificar se as tabelas foram criadas
npx prisma studio
```

#### Seed Inicial (Opcional)
```bash
# Criar arquivo de seed
cat > prisma/seed.ts << 'EOF'
import { PrismaClient, Role } from '@prisma/client'
import { hash } from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  // Criar departamento padrão
  const department = await prisma.department.create({
    data: {
      name: 'Administração'
    }
  })

  // Criar usuário administrador
  const hashedPassword = await hash('admin123', 12)
  const hashedPin = await hash('123456', 12)

  await prisma.user.create({
    data: {
      name: 'Administrador',
      email: 'admin@diinponto.com',
      password: hashedPassword,
      pin: hashedPin,
      role: Role.ADMIN,
      employeeId: 'ADM001',
      barcode: '1234567890123',
      departmentId: department.id
    }
  })

  console.log('Seed executado com sucesso!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
EOF

# Executar seed
npx prisma db seed
```

### 6. Inicialização do Sistema

#### Modo Desenvolvimento
```bash
# Iniciar servidor de desenvolvimento
npm run dev

# O sistema estará disponível em:
# http://localhost:3000
```

#### Modo Produção
```bash
# Build da aplicação
npm run build

# Iniciar em produção
npm start
```

### 7. Verificação da Instalação

#### Testes Básicos
1. Acesse `http://localhost:3000`
2. Verifique se a página de login carrega
3. Teste o registro de novo usuário
4. Faça login com as credenciais criadas
5. Navegue pelas diferentes seções

#### Testes de Funcionalidades
```bash
# Testar conexão com banco
npx prisma db pull

# Verificar logs do sistema
tail -f logs/application.log
```

## Configuração de Dispositivos

### Impressora Térmica

#### Rede (TCP/IP)
1. Configure a impressora com IP fixo
2. Teste conectividade: `ping IP_DA_IMPRESSORA`
3. Configure no sistema via interface web

#### USB
1. Conecte a impressora via USB
2. Verifique se é reconhecida pelo sistema
3. Configure drivers se necessário

### Leitor de Código de Barras

#### USB (HID)
1. Conecte o leitor via USB
2. Teste em um editor de texto
3. Configure no sistema

#### Serial
1. Conecte via porta serial/USB-Serial
2. Configure velocidade (baud rate)
3. Teste comunicação

## Configuração de Produção

### Nginx (Proxy Reverso)
```nginx
server {
    listen 80;
    server_name seu-dominio.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### SSL/HTTPS
```bash
# Instalar Certbot
sudo apt install certbot python3-certbot-nginx

# Obter certificado
sudo certbot --nginx -d seu-dominio.com

# Renovação automática
sudo crontab -e
# Adicionar linha:
0 12 * * * /usr/bin/certbot renew --quiet
```

### PM2 (Process Manager)
```bash
# Instalar PM2
npm install -g pm2

# Criar arquivo ecosystem
cat > ecosystem.config.js << 'EOF'
module.exports = {
  apps: [{
    name: 'diinponto',
    script: 'npm',
    args: 'start',
    cwd: '/caminho/para/DiinPonto',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    }
  }]
}
EOF

# Iniciar aplicação
pm2 start ecosystem.config.js

# Configurar inicialização automática
pm2 startup
pm2 save
```

## Backup e Manutenção

### Backup do Banco de Dados
```bash
# Backup manual
pg_dump -U diinponto -h localhost diinponto > backup_$(date +%Y%m%d_%H%M%S).sql

# Backup automático (crontab)
0 2 * * * pg_dump -U diinponto -h localhost diinponto > /backups/diinponto_$(date +\%Y\%m\%d_\%H\%M\%S).sql
```

### Monitoramento
```bash
# Logs da aplicação
pm2 logs diinponto

# Status dos processos
pm2 status

# Monitoramento em tempo real
pm2 monit
```

## Solução de Problemas

### Problemas Comuns

#### Erro de Conexão com Banco
```bash
# Verificar se PostgreSQL está rodando
sudo systemctl status postgresql

# Verificar logs do PostgreSQL
sudo tail -f /var/log/postgresql/postgresql-*.log

# Testar conexão
psql -U diinponto -h localhost -d diinponto
```

#### Erro de Permissões
```bash
# Verificar permissões do diretório
ls -la /caminho/para/DiinPonto

# Corrigir permissões
sudo chown -R $USER:$USER /caminho/para/DiinPonto
```

#### Porta em Uso
```bash
# Verificar qual processo está usando a porta
sudo lsof -i :3000

# Matar processo se necessário
sudo kill -9 PID_DO_PROCESSO
```

### Logs e Debugging

#### Habilitar Logs Detalhados
```env
# No arquivo .env
DEBUG=true
LOG_LEVEL=debug
```

#### Verificar Logs
```bash
# Logs do Next.js
npm run dev -- --debug

# Logs do sistema
journalctl -u postgresql -f
```

## Suporte

### Documentação
- [Documentação Completa](./documentacao_completa.md)
- [README Principal](../README.md)

### Contato
- **Email**: suporte@diinponto.com
- **WhatsApp**: (11) 99999-9999
- **Website**: https://diinponto.com

### Comunidade
- **GitHub Issues**: Para reportar bugs
- **Discussions**: Para dúvidas e sugestões
- **Wiki**: Para documentação adicional

---

**Nota**: Este guia assume conhecimento básico de linha de comando e administração de sistemas. Para usuários iniciantes, recomendamos buscar ajuda de um profissional de TI.

