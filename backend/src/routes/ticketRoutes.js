const express = require('express');
const controller = require('../controllers/ticketController');
const { validate, validateObjectId } = require('../middleware/validate');
const {
  createTicketSchema,
  updateTicketSchema,
  listQuerySchema,
} = require('../validators/ticketValidators');

const router = express.Router();

router.get('/', validate(listQuerySchema, 'query'), controller.listTickets);
router.post('/', validate(createTicketSchema), controller.createTicket);

// Must be declared before "/:id" so "stats" is not treated as an id
router.get('/stats', controller.getStats);

router.get('/:id', validateObjectId(), controller.getTicket);
router.patch('/:id', validateObjectId(), validate(updateTicketSchema), controller.updateTicket);

module.exports = router;
