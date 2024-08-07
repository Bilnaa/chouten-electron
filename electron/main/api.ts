import Fastify, { FastifyInstance } from 'fastify';

export default class FastifyServer {
    private listenIp = '0.0.0.0';
    private listenPort = 8000;
    private fastify: FastifyInstance;

    constructor() {
        this.fastify = Fastify();
    }

    start() {
        this.fastify.get('/auth', async (request, reply) => {
            reply.send('Successfully authenticated, this window will close shortly. If it does not, you can close it manually by pressing the "Escape" key.');
        });

        this.fastify.get('/ping', async (request, reply) => {
            reply.send('pong');
        });

        this.fastify.listen({
            port: this.listenPort,
            host: this.listenIp
        })
        .then((address) => {
            this.fastify.log.info(`server listening on ${address}`);
        })
        .catch((err) => {
            this.fastify.log.error(err);
            process.exit(1);
        });
    }

    stop() {
        this.fastify.close().then(() => {
            this.fastify.log.info('server closed');
        });
    }

    getFastify() {
        return this.fastify;
    }
}
