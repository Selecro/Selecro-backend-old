import * as fs from 'fs';
import * as https from 'https';
import {Server as SocketIOServer} from 'socket.io';

export class SocketServer {
  private server: https.Server;
  private io: SocketIOServer;

  constructor() {
    const options = {
      key: fs.readFileSync('localhost.decrypt.key', 'utf8'),
      cert: fs.readFileSync('localhost.crt', 'utf8'),
    };
    this.server = https.createServer(options);
    this.io = new SocketIOServer(this.server, {
      cors: {
        origin: '*',
        methods: ['GET', 'POST'],
      },
    });
  }

  public start() {
    this.io.on('connection', (socket) => {
      console.log('A user connected.');

      socket.on('message', (data: any) => {
        console.log('Received message:', data);

        // Broadcast the message to all connected clients
        this.io.emit('message', data);
      });

      socket.on('disconnect', () => {
        console.log('A user disconnected.');
      });
    });

    const port = 4000;
    this.server.listen(port, () => {
      console.log(`Server listening on port ${port}`);
    });
  }
}
