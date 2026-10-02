// Prevents user input from being interpreted as a regular expression
module.exports = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
