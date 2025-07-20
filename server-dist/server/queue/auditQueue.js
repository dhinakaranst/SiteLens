import { Queue } from 'bullmq';
export const auditQueue = new Queue('seo-audit', {
    connection: {
        host: 'localhost',
        port: 6379,
    },
});
