const INTERNAL_EMAIL_DOMAIN = 'phbebidas.local';

export const toInternalEmail = (username) =>
  `${username.trim().toLowerCase()}@${INTERNAL_EMAIL_DOMAIN}`;
