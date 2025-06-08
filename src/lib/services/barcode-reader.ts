/**
 * Serviço para leitura de código de barras
 * Suporta câmera, leitores USB e serial
 */

export interface BarcodeReaderConfig {
  type: 'camera' | 'usb' | 'serial'
  vendorId?: number // Para USB
  productId?: number // Para USB
  baudRate?: number // Para serial
  port?: string // Para serial
}

export interface BarcodeResult {
  code: string
  format: string
  timestamp: Date
}

export class BarcodeReaderService {
  private static config: BarcodeReaderConfig | null = null
  private static isReading = false
  private static onBarcodeCallback: ((result: BarcodeResult) => void) | null = null

  /**
   * Configura o leitor de código de barras
   */
  static configure(config: BarcodeReaderConfig) {
    this.config = config
  }

  /**
   * Inicia a leitura de código de barras
   */
  static async startReading(onBarcode: (result: BarcodeResult) => void): Promise<void> {
    if (this.isReading) {
      throw new Error('Leitura já está em andamento')
    }

    if (!this.config) {
      throw new Error('Leitor não configurado')
    }

    this.onBarcodeCallback = onBarcode
    this.isReading = true

    try {
      switch (this.config.type) {
        case 'camera':
          await this.startCameraReading()
          break
        case 'usb':
          await this.startUSBReading()
          break
        case 'serial':
          await this.startSerialReading()
          break
        default:
          throw new Error('Tipo de leitor não suportado')
      }
    } catch (error) {
      this.isReading = false
      this.onBarcodeCallback = null
      throw error
    }
  }

  /**
   * Para a leitura de código de barras
   */
  static stopReading(): void {
    this.isReading = false
    this.onBarcodeCallback = null
    
    // Parar câmera se estiver sendo usada
    if (this.config?.type === 'camera') {
      this.stopCameraReading()
    }
  }

  /**
   * Leitura via câmera usando ZXing ou QuaggaJS
   */
  private static async startCameraReading(): Promise<void> {
    if (typeof navigator === 'undefined' || !navigator.mediaDevices) {
      throw new Error('Câmera não suportada neste ambiente')
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'environment', // Câmera traseira
          width: { ideal: 1280 },
          height: { ideal: 720 }
        }
      })

      // Criar elemento de vídeo
      const video = document.createElement('video')
      video.srcObject = stream
      video.play()

      // Usar ZXing-js para decodificar
      const { BrowserMultiFormatReader } = await import('@zxing/library')
      const codeReader = new BrowserMultiFormatReader()

      codeReader.decodeFromVideoDevice(undefined, video, (result, error) => {
        if (result && this.onBarcodeCallback) {
          this.onBarcodeCallback({
            code: result.getText(),
            format: result.getBarcodeFormat().toString(),
            timestamp: new Date()
          })
        }
      })

    } catch (error) {
      throw new Error('Erro ao acessar câmera: ' + (error as Error).message)
    }
  }

  /**
   * Para a leitura da câmera
   */
  private static stopCameraReading(): void {
    // Parar todas as streams de vídeo
    navigator.mediaDevices.getUserMedia({ video: true })
      .then(stream => {
        stream.getTracks().forEach(track => track.stop())
      })
      .catch(() => {
        // Ignorar erros ao parar
      })
  }

  /**
   * Leitura via USB (HID)
   */
  private static async startUSBReading(): Promise<void> {
    if (typeof navigator === 'undefined' || !('hid' in navigator)) {
      throw new Error('WebHID não suportado neste navegador')
    }

    try {
      const devices = await (navigator as any).hid.requestDevice({
        filters: [{
          vendorId: this.config!.vendorId,
          productId: this.config!.productId
        }]
      })

      if (devices.length === 0) {
        throw new Error('Nenhum leitor encontrado')
      }

      const device = devices[0]
      await device.open()

      device.addEventListener('inputreport', (event: any) => {
        if (this.onBarcodeCallback) {
          const data = new Uint8Array(event.data.buffer)
          const code = this.parseHIDData(data)
          
          if (code) {
            this.onBarcodeCallback({
              code,
              format: 'UNKNOWN',
              timestamp: new Date()
            })
          }
        }
      })

    } catch (error) {
      throw new Error('Erro ao conectar leitor USB: ' + (error as Error).message)
    }
  }

  /**
   * Leitura via serial
   */
  private static async startSerialReading(): Promise<void> {
    if (typeof navigator === 'undefined' || !('serial' in navigator)) {
      throw new Error('Web Serial não suportado neste navegador')
    }

    try {
      const port = await (navigator as any).serial.requestPort()
      await port.open({ 
        baudRate: this.config!.baudRate || 9600 
      })

      const reader = port.readable.getReader()

      // Ler dados continuamente
      const readLoop = async () => {
        try {
          while (this.isReading) {
            const { value, done } = await reader.read()
            if (done) break

            const decoder = new TextDecoder()
            const text = decoder.decode(value)
            const code = text.trim()

            if (code && this.onBarcodeCallback) {
              this.onBarcodeCallback({
                code,
                format: 'UNKNOWN',
                timestamp: new Date()
              })
            }
          }
        } catch (error) {
          console.error('Erro na leitura serial:', error)
        } finally {
          reader.releaseLock()
          await port.close()
        }
      }

      readLoop()

    } catch (error) {
      throw new Error('Erro ao conectar leitor serial: ' + (error as Error).message)
    }
  }

  /**
   * Converte dados HID em string
   */
  private static parseHIDData(data: Uint8Array): string | null {
    // Implementação simplificada - pode variar por fabricante
    const chars: string[] = []
    
    for (let i = 0; i < data.length; i++) {
      const byte = data[i]
      if (byte >= 32 && byte <= 126) { // Caracteres imprimíveis
        chars.push(String.fromCharCode(byte))
      }
    }

    const result = chars.join('').trim()
    return result.length > 0 ? result : null
  }

  /**
   * Lista leitores disponíveis
   */
  static async listAvailableReaders(): Promise<any[]> {
    const readers: any[] = []

    // Câmera
    if (typeof navigator !== 'undefined' && navigator.mediaDevices) {
      try {
        const devices = await navigator.mediaDevices.enumerateDevices()
        const cameras = devices.filter(device => device.kind === 'videoinput')
        
        cameras.forEach((camera, index) => {
          readers.push({
            type: 'camera',
            name: camera.label || `Câmera ${index + 1}`,
            deviceId: camera.deviceId
          })
        })
      } catch (error) {
        console.warn('Erro ao listar câmeras:', error)
      }
    }

    // USB HID
    if (typeof navigator !== 'undefined' && 'hid' in navigator) {
      try {
        const devices = await (navigator as any).hid.getDevices()
        devices.forEach((device: any) => {
          readers.push({
            type: 'usb',
            name: device.productName || 'Leitor USB',
            vendorId: device.vendorId,
            productId: device.productId
          })
        })
      } catch (error) {
        console.warn('Erro ao listar leitores USB:', error)
      }
    }

    // Serial
    if (typeof navigator !== 'undefined' && 'serial' in navigator) {
      try {
        const ports = await (navigator as any).serial.getPorts()
        ports.forEach((port: any, index: number) => {
          readers.push({
            type: 'serial',
            name: `Leitor Serial ${index + 1}`,
            port: port
          })
        })
      } catch (error) {
        console.warn('Erro ao listar portas seriais:', error)
      }
    }

    return readers
  }

  /**
   * Testa a leitura de código de barras
   */
  static async testReading(): Promise<boolean> {
    if (!this.config) {
      return false
    }

    try {
      let testResult = false

      const testCallback = (result: BarcodeResult) => {
        console.log('Código lido no teste:', result.code)
        testResult = true
        this.stopReading()
      }

      await this.startReading(testCallback)

      // Aguardar 10 segundos para teste
      await new Promise(resolve => setTimeout(resolve, 10000))
      
      this.stopReading()
      return testResult
    } catch (error) {
      console.error('Teste de leitura falhou:', error)
      return false
    }
  }
}

