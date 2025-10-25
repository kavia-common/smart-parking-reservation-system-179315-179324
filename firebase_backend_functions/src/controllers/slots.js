'use strict';
const slotsService = require('../services/slots');

class SlotsController {
  // PUBLIC_INTERFACE
  async list(req, res) {
    /** List slots for a lot with optional filters. */
    const { lotId } = req.params;
    const { isAvailable, level } = req.query;
    const filter = {};
    if (isAvailable !== undefined) filter.isAvailable = isAvailable === 'true';
    if (level !== undefined) filter.level = isNaN(Number(level)) ? level : Number(level);
    const data = await slotsService.listSlots(lotId, filter);
    return res.json(data);
  }

  // PUBLIC_INTERFACE
  async setAvailability(req, res) {
    /** Admin: set availability for a slot. */
    const { lotId, slotId } = req.params;
    const { isAvailable } = req.body || {};
    if (typeof isAvailable !== 'boolean') {
      return res.status(400).json({ error: 'isAvailable boolean required' });
    }
    const saved = await slotsService.setAvailability(lotId, slotId, isAvailable);
    return res.json(saved);
  }
}

module.exports = new SlotsController();
