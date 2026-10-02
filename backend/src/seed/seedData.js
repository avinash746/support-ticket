const { STATUSES, PRIORITIES } = require('../models/constants');

const subjects = [
  ['Cannot log in to my account', 'I get an "invalid credentials" error even after resetting my password twice.'],
  ['Invoice shows wrong amount', 'The March invoice charges for 10 seats but we only have 6 active users.'],
  ['Export to CSV is failing', 'Clicking Export downloads an empty file for reports older than 30 days.'],
  ['Request: dark mode', 'Our team works late and would love a dark theme for the dashboard.'],
  ['Password reset email never arrives', 'Checked spam and junk folders. Nothing received after 30 minutes.'],
  ['App crashes on Android 14', 'The app closes immediately after the splash screen on a Pixel 8.'],
  ['Need to add a new team member', 'Please add jordan@example.com with editor permissions.'],
  ['Webhook deliveries delayed', 'Webhooks arrive 10-15 minutes late since yesterday afternoon.'],
  ['Cancel subscription', 'We would like to cancel at the end of the current billing period.'],
  ['Slow dashboard loading', 'The main dashboard takes over 20 seconds to load for our org.'],
  ['Two-factor code not accepted', 'The authenticator code is rejected even though my phone time is correct.'],
  ['Data missing after migration', 'Customer notes from before January are no longer visible.'],
  ['API rate limit too low', 'We hit 429 errors during our nightly sync and need a higher limit.'],
  ['Typo on pricing page', '"Enterprize" is misspelled in the plan comparison table.'],
  ['Unable to upload attachments', 'Files larger than 5 MB fail with a generic error message.'],
  ['Wrong timezone on reports', 'Scheduled reports are sent in UTC instead of our configured timezone.'],
  ['Feature question: SSO', 'Do you support SAML SSO with Azure AD on the Business plan?'],
  ['Duplicate charges this month', 'We were billed twice on the 3rd. Please refund the duplicate payment.'],
  ['Mobile layout broken in Safari', 'The sidebar overlaps the content on iPhone SE screens.'],
  ['Cannot delete old projects', 'The delete button is greyed out for archived projects.'],
  ['Email notifications too frequent', 'We receive a notification for every comment. Can we digest them?'],
  ['Integration with Slack disconnected', 'The Slack integration stopped posting after we rotated our workspace token.'],
  ['Request: bulk edit tickets', 'We need to change the status of dozens of tickets at once.'],
  ['Search returns no results', 'Searching for "refund" returns nothing although many tickets mention it.'],
  ['Account locked after failed logins', 'Our shared support account was locked and we cannot unlock it.'],
  ['Incorrect tax on invoice', 'VAT is applied even though we provided a valid VAT ID.'],
  ['PDF report layout cut off', 'The right-hand column is clipped on exported PDF reports.'],
  ['Need data processing agreement', 'Please send a signed DPA for our compliance team.'],
  ['Profile picture will not update', 'Uploading a new avatar succeeds but the old one still shows.'],
  ['Calendar sync duplicates events', 'Every event appears twice after connecting Google Calendar.'],
];

const customers = [
  'alice.martin@acme.com', 'bob.chen@globex.io', 'carla.diaz@initech.co', 'dev.patel@umbrella.org',
  'elena.rossi@hooli.com', 'farid.khan@stark.dev', 'grace.lee@wayne.net', 'hiro.tanaka@wonka.jp',
];

/**
 * Builds `count` deterministic tickets with varied statuses / priorities,
 * spread across the last `count` days so sorting by date is easy to verify.
 */
function buildSeedTickets(count = 30, now = new Date()) {
  const DAY = 24 * 60 * 60 * 1000;
  return Array.from({ length: count }, (_, i) => {
    const [title, description] = subjects[i % subjects.length];
    const createdAt = new Date(now.getTime() - (count - i) * DAY - (i % 5) * 3600 * 1000);
    const status = STATUSES[(i * 7) % STATUSES.length];
    const updatedAt = status === 'Open' ? createdAt : new Date(createdAt.getTime() + ((i % 3) + 1) * 3600 * 1000);
    return {
      title,
      description,
      customerEmail: customers[i % customers.length],
      priority: PRIORITIES[(i * 5 + (i >> 1)) % PRIORITIES.length],
      status,
      createdAt,
      updatedAt,
    };
  });
}

module.exports = { buildSeedTickets };
