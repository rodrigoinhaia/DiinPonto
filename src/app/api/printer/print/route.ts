import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/next-auth'
import net from 'net'

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Não autorizado' },
        { status: 401 }
      )
    }

    const { address, command, port = 9100 } = await request.json()

    if (!address || !command) {
      return NextResponse.json(
        { error: 'Endereço e comando são obrigatórios' },
        { status: 400 }
      )
    }

    // Validar formato do IP
    const ipRegex = /^(\d{1,3}\.){3}\d{1,3}$/
    if (!ipRegex.test(address)) {
      return NextResponse.json(
        { error: 'Endereço IP inválido' },
        { status: 400 }
      )
    }

    // Enviar comando para impressora via TCP
    const result = await sendToPrinter(address, port, command)

    return NextResponse.json({ 
      success: true,
      message: 'Comando enviado para impressora',
      result 
    })
  } catch (error) {
    console.error('Erro ao enviar para impressora:', error)
    return NextResponse.json(
      { error: 'Erro ao comunicar com a impressora: ' + (error as Error).message },
      { status: 500 }
    )
  }
}

function sendToPrinter(address: string, port: number, command: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const client = new net.Socket()
    let response = ''

    // Timeout de 5 segundos
    client.setTimeout(5000)

    client.connect(port, address, () => {
      console.log(`Conectado à impressora ${address}:${port}`)
      client.write(command)
    })

    client.on('data', (data) => {
      response += data.toString()
    })

    client.on('close', () => {
      console.log('Conexão com impressora fechada')
      resolve(response || 'Comando enviado com sucesso')
    })

    client.on('error', (error) => {
      console.error('Erro na conexão com impressora:', error)
      reject(new Error(`Falha na conexão: ${error.message}`))
    })

    client.on('timeout', () => {
      console.error('Timeout na conexão com impressora')
      client.destroy()
      reject(new Error('Timeout na conexão com a impressora'))
    })

    // Fechar conexão após enviar o comando
    setTimeout(() => {
      if (!client.destroyed) {
        client.end()
      }
    }, 1000)
  })
}

