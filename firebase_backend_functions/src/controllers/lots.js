'use strict';
const lotsService = require('../services/lots');

class LotsController {
  // PUBLIC_INTERFACE
  async list(req, res) {
    /** List all active lots. */
    const data = await lotsService.listLots();
    return res.json(data);
  }

  // PUBLIC_INTERFACE
  async get(req, res) {
    /** Get a single lot. */
    const { lotId } = req.params;
    const lot = await lotsService.getLot(lotId);
    if (!lot) return res.status(404).json({ error: 'not_found' });
    return res.json(lot);
  }

  // PUBLIC_INTERFACE
  async upsert(req, res) {
    /** Admin: create/update lot. */
    const { lotId } = req.params;
    const saved = await lotsService.upsertLot(lotId, req.body || {});
    return res.json(saved);
  }
}

module.exports = new LotsController();
