import { TimeRecord } from '@prisma/client'

interface PrintOptions {
  companyName: string
  companyAddress: string
  companyPhone: string
  companyCNPJ: string
}

interface PrintTimeRecordData {
  record: TimeRecord & {
    user: {
      name: string
      employeeId: string
    }
  }
  options: PrintOptions
}

export class PrinterService {
  private static ESC = '\x1B'
  private static INIT = `${this.ESC}@`
  private static BOLD = `${this.ESC}E1`
  private static NORMAL = `${this.ESC}E0`
  private static CENTER = `${this.ESC}a1`
  private static LEFT = `${this.ESC}a0`
  private static CUT = `${this.ESC}m`

  private static formatDate(date: Date): string {
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    })
  }

  private static formatTime(date: Date): string {
    return date.toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  private static getRecordType(type: string): string {
    switch (type) {
      case 'ENTRY':
        return 'ENTRADA'
      case 'PAUSE':
        return 'PAUSA'
      case 'RETURN':
        return 'RETORNO'
      case 'EXIT':
        return 'SAÍDA'
      default:
        return type
    }
  }

  static generateTimeRecordCommand(data: PrintTimeRecordData): string {
    const { record, options } = data
    const timestamp = new Date(record.timestamp)

    let command = this.INIT // Inicializa a impressora
    command += this.CENTER // Centraliza o texto
    command += this.BOLD // Ativa negrito
    command += `${options.companyName}\n`
    command += this.NORMAL // Desativa negrito
    command += `${options.companyAddress}\n`
    command += `CNPJ: ${options.companyCNPJ}\n`
    command += `Tel: ${options.companyPhone}\n\n`
    command += this.BOLD
    command += 'COMPROVANTE DE REGISTRO DE PONTO\n\n'
    command += this.NORMAL
    command += this.LEFT // Alinha à esquerda
    command += `Funcionário: ${record.user.name}\n`
    command += `Matrícula: ${record.user.employeeId}\n`
    command += `Data: ${this.formatDate(timestamp)}\n`
    command += `Hora: ${this.formatTime(timestamp)}\n`
    command += `Tipo: ${this.getRecordType(record.type)}\n\n`
    command += this.CENTER
    command += '--------------------------------\n'
    command += 'Assinatura do Funcionário\n\n'
    command += '--------------------------------\n\n'
    command += this.CUT // Corta o papel

    return command
  }

  static async print(command: string): Promise<void> {
    try {
      // Aqui você pode implementar a lógica específica para sua impressora
      // Por exemplo, usando a API Web USB para impressoras USB
      // ou uma API de rede para impressoras de rede
      console.log('Comando de impressão:', command)
    } catch (error) {
      console.error('Erro ao imprimir:', error)
      throw new Error('Erro ao imprimir comprovante')
    }
  }
} 