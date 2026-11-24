// ==========================================
// ALERT DELIVERY CONFIGURATION
// ==========================================

export const MAX_DELIVERY_ATTEMPTS = 3;

export const RETRY_DELAY_MINUTES = 5;

// Recover an email delivery if the process stops
// while an alert is marked as sending.
export const EMAIL_SENDING_TIMEOUT_MINUTES = 15;
