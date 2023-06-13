import {repository} from '@loopback/repository';
import {Socket} from 'socket.io';
import {InstructionRepository} from '../repositories';

export class SocketController {
  constructor(
    @repository(InstructionRepository) private productRepo: InstructionRepository,
  ) { }

  // Real-time update example
  async subscribeToProductUpdates(socket: Socket, id: number): Promise<void> {
    const product = await this.productRepo.findById(id);
    console.log('Joining room: ', id);

    // Emit initial data
    socket.emit('product-updates', {
      productId: id,
      data: product,
    });

    // Listen for changes in the subscribed product
    // and emit updates to connected clients
    const changeStream = this.productRepo.dataSource.connector!.collection('products').watch();
    changeStream.on('change', async (change: {operationType: string; documentKey: {_id: number;};}) => {
      if (change.operationType === 'update' && change.documentKey._id === id) {
        const updatedProduct = await this.productRepo.findById(id);
        socket.emit('product-updates', {
          productId: id,
          data: updatedProduct,
        });
      }
    });
  }
}
