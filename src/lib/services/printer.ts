/**
 * Serviço para integração com impressoras térmicas
 * Suporta comandos ESC/POS padrão para impressoras térmicas
 */

export interface PrinterConfig {
  type: 'usb' | 'network' | 'serial'
  address?: string // IP para network, porta para serial
  vendorId?: number // Para USB
  productId?: number // Para USB
  baudRate?: number // Para serial
}

export interface CompanyInfo {
  companyName: string
  companyAddress: string
  companyPhone: string
  companyCNPJ: string
}

export interface TimeRecordPrintData {
  record: {
    id: string
    type: 'ENTRY' | 'EXIT'
    timestamp: string
    user: {
      name: string
      employeeId: string
    }
  }
  options: CompanyInfo
}

export class PrinterService {
  private static config: PrinterConfig | null = null

  /**
   * Configura a impressora
   */
  static configure(config: PrinterConfig) {
    this.config = config
  }

  /**
   * Gera comandos ESC/POS para impressão de comprovante de ponto
   */
  static generateTimeRecordCommand(data: TimeRecordPrintData): string {
    const { record, options } = data
    const timestamp = new Date(record.timestamp)
    
    // Comandos ESC/POS
    const ESC = '\x1B'
    const GS = '\x1D'
    
    // Comandos de formatação
    const INIT = ESC + '@' // Inicializar impressora
    const CENTER = ESC + 'a' + '\x01' // Centralizar texto
    const LEFT = ESC + 'a' + '\x00' // Alinhar à esquerda
    const BOLD_ON = ESC + 'E' + '\x01' // Negrito ligado
    const BOLD_OFF = ESC + 'E' + '\x00' // Negrito desligado
    const DOUBLE_HEIGHT = GS + '!' + '\x01' // Altura dupla
    const NORMAL_SIZE = GS + '!' + '\x00' // Tamanho normal
    const CUT = GS + 'V' + '\x42' + '\x00' // Cortar papel
    const FEED = '\n'

    let command = INIT

    // Cabeçalho da empresa
    command += CENTER + BOLD_ON + DOUBLE_HEIGHT
    command += options.companyName + FEED
    command += NORMAL_SIZE + BOLD_OFF
    command += options.companyAddress + FEED
    command += 'Tel: ' + options.companyPhone + FEED
    command += 'CNPJ: ' + options.companyCNPJ + FEED
    command += FEED

    // Título do comprovante
    command += BOLD_ON + 'COMPROVANTE DE PONTO' + FEED + BOLD_OFF
    command += '================================' + FEED

    // Dados do funcionário
    command += LEFT
    command += 'Funcionario: ' + record.user.name + FEED
    command += 'ID: ' + record.user.employeeId + FEED
    command += FEED

    // Dados do registro
    command += 'Tipo: ' + (record.type === 'ENTRY' ? 'ENTRADA' : 'SAIDA') + FEED
    command += 'Data: ' + timestamp.toLocaleDateString('pt-BR') + FEED
    command += 'Hora: ' + timestamp.toLocaleTimeString('pt-BR') + FEED
    command += FEED

    // Rodapé
    command += CENTER
    command += '================================' + FEED
    command += 'Sistema DiinPonto' + FEED
    command += 'Registro ID: ' + record.id.substring(0, 8) + FEED
    command += FEED + FEED

    // Cortar papel
    command += CUT

    return command
  }

  /**
   * Envia comando para impressora (implementação depende do tipo)
   */
  static async print(command: string): Promise<void> {
    if (!this.config) {
      throw new Error('Impressora não configurada')
    }

    try {
      switch (this.config.type) {
        case 'usb':
          await this.printUSB(command)
          break
        case 'network':
          await this.printNetwork(command)
          break
        case 'serial':
          await this.printSerial(command)
          break
        default:
          throw new Error('Tipo de impressora não suportado')
      }
    } catch (error) {
      console.error('Erro ao imprimir:', error)
      throw new Error('Falha na impressão: ' + (error as Error).message)
    }
  }

  /**
   * Impressão via USB (requer WebUSB API ou biblioteca nativa)
   */
  private static async printUSB(command: string): Promise<void> {
    if (typeof navigator !== 'undefined' && 'usb' in navigator) {
      // WebUSB API (funciona apenas em HTTPS)
      try {
        const device = await (navigator as any).usb.requestDevice({
          filters: [{
            vendorId: this.config!.vendorId,
            productId: this.config!.productId
          }]
        })

        await device.open()
        await device.selectConfiguration(1)
        await device.claimInterface(0)

        const encoder = new TextEncoder()
        const data = encoder.encode(command)
        
        await device.transferOut(1, data)
        await device.close()
      } catch (error) {
        throw new Error('Erro na impressão USB: ' + (error as Error).message)
      }
    } else {
      throw new Error('WebUSB não suportado neste navegador')
    }
  }

  /**
   * Impressão via rede (TCP/IP)
   */
  private static async printNetwork(command: string): Promise<void> {
    if (!this.config!.address) {
      throw new Error('Endereço IP da impressora não configurado')
    }

    // Em ambiente web, seria necessário um proxy/gateway
    // Em ambiente Node.js, poderia usar socket TCP direto
    const response = await fetch('/api/printer/print', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        address: this.config!.address,
        command: command
      })
    })

    if (!response.ok) {
      throw new Error('Erro na impressão via rede')
    }
  }

  /**
   * Impressão via serial (requer Web Serial API ou biblioteca nativa)
   */
  private static async printSerial(command: string): Promise<void> {
    if (typeof navigator !== 'undefined' && 'serial' in navigator) {
      // Web Serial API
      try {
        const port = await (navigator as any).serial.requestPort()
        await port.open({ 
          baudRate: this.config!.baudRate || 9600 
        })

        const writer = port.writable.getWriter()
        const encoder = new TextEncoder()
        const data = encoder.encode(command)
        
        await writer.write(data)
        writer.releaseLock()
        await port.close()
      } catch (error) {
        throw new Error('Erro na impressão serial: ' + (error as Error).message)
      }
    } else {
      throw new Error('Web Serial não suportado neste navegador')
    }
  }

  /**
   * Testa a conexão com a impressora
   */
  static async testConnection(): Promise<boolean> {
    if (!this.config) {
      return false
    }

    try {
      const testCommand = '\x1B@' + 'Teste de conexao\n\n\n' + '\x1DV\x42\x00'
      await this.print(testCommand)
      return true
    } catch (error) {
      console.error('Teste de conexão falhou:', error)
      return false
    }
  }

  /**
   * Lista impressoras disponíveis (quando suportado)
   */
  static async listAvailablePrinters(): Promise<any[]> {
    const printers: any[] = []

    // USB
    if (typeof navigator !== 'undefined' && 'usb' in navigator) {
      try {
        const devices = await (navigator as any).usb.getDevices()
        devices.forEach((device: any) => {
          printers.push({
            type: 'usb',
            name: device.productName || 'Impressora USB',
            vendorId: device.vendorId,
            productId: device.productId
          })
        })
      } catch (error) {
        console.warn('Erro ao listar impressoras USB:', error)
      }
    }

    // Serial
    if (typeof navigator !== 'undefined' && 'serial' in navigator) {
      try {
        const ports = await (navigator as any).serial.getPorts()
        ports.forEach((port: any, index: number) => {
          printers.push({
            type: 'serial',
            name: `Porta Serial ${index + 1}`,
            port: port
          })
        })
      } catch (error) {
        console.warn('Erro ao listar portas seriais:', error)
      }
    }

    return printers
  }
}

