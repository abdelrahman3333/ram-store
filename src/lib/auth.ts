export const ADMIN_EMAILS = [
  'abdelarhmanamr800@gmail.com',
  'abdelrahmanamr800@gmail.com',
  'amrabdelazez038@gmail.com',
  'abdo@gmail.com',
  'test@test.com',
  'test@ram.com',
  'test2@ram.com',
];

export const isAdmin = (email?: string | null) => {
  if (!email) return false;
  return ADMIN_EMAILS.includes(email.toLowerCase());
};
