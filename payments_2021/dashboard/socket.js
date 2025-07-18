const paymentsData = require("../base/payments");
const statsData = require("../base/stats");
const shopsData = require("../base/shops");
module.exports.load = async(server) => {
    const { Server } = require("socket.io");
    const io = new Server(server);
    let Sockets = [];
    io.on('connection', (socket) => {
        socket.on('get_pay', async(code) => {
            const pay = await paymentsData.findOne({code});
            if(pay == null || pay == undefined) return;
            socket.emit('get_pay', pay.paid, pay.canceled);
        });
        socket.on('initial', (user, shop, socketID) => {
            const address = socket.handshake.address?.replace('::ffff:', '');
            if(address != '::1' && address != '127.0.0.1') return;
            Sockets.push({socket:socketID, user, shop});
        });
        socket.on('disconnect', () => {
            {
                const DoSockets = Sockets;
                Sockets = [];
                for (let i = 0; i < DoSockets.length; i++) {
                    const DoSocket = DoSockets[i];
                    if(DoSocket.socket.id != socket.id) Sockets.push(DoSocket);
                }
            }
        });
        socket.on('stats', async() => {
            if(Sockets.filter(x => x.socket == socket.id).length == 0) return;
            const shop = Sockets.find(x => x.socket == socket.id).shop;
            const statData = await statsData.findOne({shop});
            if(statData == null || statData == undefined) return;
            const pays = await paymentsData.find({paid: true, shop});
            const prefer = [
                pays.filter(x => x.method == 'qiwi').length,
                pays.filter(x => x.method == 'yoomoney').length,
                pays.filter(x => x.method == 'card').length,
                pays.filter(x => x.method == 'telephone').length,
            ];
            socket.emit('stats', {labels: statData.labels, success: statData.success, canceled: statData.canceled, total: statData.total, prefer});
        });
        socket.on('module', async() => {
            if(Sockets.filter(x => x.socket == socket.id).length == 0) return;
            const sckt = Sockets.find(x => x.socket == socket.id).shop;
            const shopData = await shopsData.findOne({ owner: sckt.user, id: sckt.shop });
            if(shopData == null || shopData == undefined) return;
            socket.emit('module', {balance: shopData.balance, key_public: shopData.key_public,});
        });
    });
}