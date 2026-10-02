const formatter = new Intl.DateTimeFormat(undefined, { dateStyle: 'medium', timeStyle: 'short' });

export const formatDate = (iso) => (iso ? formatter.format(new Date(iso)) : '-');
