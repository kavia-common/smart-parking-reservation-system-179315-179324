'use strict';
const analyticsService = require('../services/analytics');

class AnalyticsController {
  // PUBLIC_INTERFACE
  async summary(req, res) {
    /** Return basic analytics summary. Admin-only route. */
    const data = await analyticsService.summary();
    return res.json(data);
  }
}

module.exports = new AnalyticsController();
