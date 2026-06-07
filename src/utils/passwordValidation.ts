export interface PasswordValidationError {
  field: 'password' | 'confirm';
  message: string;
}

export const MIN_PASSWORD_LENGTH = 6;

export function validateNewPassword(
  password: string,
  confirmPassword: string,
): PasswordValidationError | null {
  if (!password) {
    return { field: 'password', message: 'Enter a new password.' };
  }
  if (password.length < MIN_PASSWORD_LENGTH) {
    return {
      field: 'password',
      message: `Password must be at least ${MIN_PASSWORD_LENGTH} characters.`,
    };
  }
  if (!confirmPassword) {
    return { field: 'confirm', message: 'Re-enter the password to confirm.' };
  }
  if (password !== confirmPassword) {
    return { field: 'confirm', message: 'Passwords do not match.' };
  }
  return null;
}
