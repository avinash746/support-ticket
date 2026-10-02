const Ticket = require('../models/Ticket');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');
const escapeRegex = require('../utils/escapeRegex');

/** POST /api/tickets */
exports.createTicket = asyncHandler(async (req, res) => {
  const ticket = await Ticket.create(req.validated.body);
  res.status(201).json({ data: ticket });
});

/** GET /api/tickets?search=&status=&priority=&sort=&page=&limit= */
exports.listTickets = asyncHandler(async (req, res) => {
  const { search, status, priority, sort, page, limit } = req.validated.query;

  // Search, status and priority are AND-ed together
  const filter = {};
  if (status) filter.status = status;
  if (priority) filter.priority = priority;
  if (search) {
    const pattern = new RegExp(escapeRegex(search), 'i');
    filter.$or = [{ title: pattern }, { customerEmail: pattern }];
  }

  const direction = sort === 'oldest' ? 1 : -1;
  const sortSpec = { createdAt: direction, _id: direction }; // _id keeps paging stable on ties

  const [tickets, total] = await Promise.all([
    Ticket.find(filter)
      .sort(sortSpec)
      .skip((page - 1) * limit)
      .limit(limit),
    Ticket.countDocuments(filter),
  ]);

  res.json({
    data: tickets,
    pagination: { page, limit, total, totalPages: Math.max(1, Math.ceil(total / limit)) },
  });
});

/** GET /api/tickets/stats - always whole dataset, never filtered */
exports.getStats = asyncHandler(async (_req, res) => {
  const grouped = await Ticket.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]);
  const byStatus = Object.fromEntries(grouped.map((g) => [g._id, g.count]));

  const open = byStatus['Open'] || 0;
  const inProgress = byStatus['In Progress'] || 0;
  const resolved = byStatus['Resolved'] || 0;

  res.json({ data: { total: open + inProgress + resolved, open, inProgress, resolved } });
});

/** GET /api/tickets/:id */
exports.getTicket = asyncHandler(async (req, res) => {
  const ticket = await Ticket.findById(req.params.id);
  if (!ticket) throw ApiError.notFound('Ticket not found');
  res.json({ data: ticket });
});

/** PATCH /api/tickets/:id  (status and/or priority) */
exports.updateTicket = asyncHandler(async (req, res) => {
  const ticket = await Ticket.findByIdAndUpdate(
    req.params.id,
    { $set: req.validated.body },
    { new: true, runValidators: true }
  );
  if (!ticket) throw ApiError.notFound('Ticket not found');
  res.json({ data: ticket });
});
