import express from 'express';
import multer from 'multer';
import { gatewayController } from '../controllers/gatewayController.js';

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() }); // In-memory for processing

// Functions
router.get('/functions', gatewayController.listFunctions);
router.get('/functions/:id', gatewayController.getFunctionDetail);
router.get('/functions/:id/metrics', gatewayController.getMetrics);
router.put('/functions/:id', gatewayController.updateFunction);
router.delete('/functions/:id', gatewayController.deleteFunction);

// Dashboard
router.get('/dashboard/stats', gatewayController.getDashboardStats);

// Actions
router.post('/upload', upload.single('file'), gatewayController.upload);
router.post('/run', gatewayController.run);

// Logs
router.get('/logs', gatewayController.getLogs);

// Health & Status
router.get('/health', (req, res) => res.json({ status: 'OK', role: 'Smart Gateway' }));
router.get('/system/status', (req, res) => res.json({
    status: 'online',
    uptime: process.uptime(),
    timestamp: new Date().toISOString()
}));

export default router;
