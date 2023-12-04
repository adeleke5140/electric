import net from 'net'
import { WebSocket, createWebSocketStream } from 'ws'

const serviceUrl = process.argv[2]
const localPort = process.argv[3]

const server = net.createServer((clientSocket) => {
	console.log('New connection!')

  const websocket = new WebSocket(serviceUrl, [], {perMessageDeflate: false, skipUTF8Validation: true})
  const wsStream = createWebSocketStream(websocket)
  wsStream.on('error', (error) => {
    console.log('WebSocket error:', error)
  })
  console.log('Created WebSocket stream')

  clientSocket.on('end', () => {
    websocket.close()
    console.log('client disconnected')
  })

  clientSocket.pipe(wsStream).pipe(clientSocket)
})
console.log('Created server')

server.listen(localPort, () => {
	console.log('server listening')
})
