import { Server as SocketIOServer } from 'socket.io';
import { Server } from 'http';

const initializeSocket = (server: Server, origins: string[]): SocketIOServer => {
  const io = new SocketIOServer(server, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST'],
    },
  });

  io.on('connection', socket => {
    socket.on('send-save-order', () => {
      socket.broadcast.emit('get-save-order', 'Có lệnh mới được tạo thành công');
    });

    socket.on('send-package-cell-allocation', () => {
      socket.broadcast.emit('get-package-cell-allocation', 'Có hàng mới hoàn thành tách hàng');
    });

    socket.on('send-package-export', () => {
      socket.broadcast.emit('get-package-export', 'Có hàng mới được xuất thành công');
    });

    socket.on('inputPalletToCellSuccess', () => {
      socket.broadcast.emit('receiveInputPalletToCellSuccess', 'Có pallet mới chuyển vào kho');
    });
  });

  return io;
};

export default initializeSocket;
