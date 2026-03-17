export default () => ({
  baseUrl: import.meta.env.VITE_API_BASE_URL ?? '',
  loginEndpoint: import.meta.env.VITE_LOGIN_ENDPOINT ?? import.meta.env.LOGIN_ENDPOINT ?? '/auth/login',
  verifyLoginEndpoint: import.meta.env.VITE_VERIFY_LOGIN_ENDPOINT ?? import.meta.env.VERIFY_LOGIN_ENDPOINT ?? '/auth/mfa/verify-login',
  mfaSetupEndpoint: import.meta.env.MFA_SETUP_ENDPOINT,
  mfaVerifyEndpoint: import.meta.env.MFA_VERIFY_ENDPOINT,
  logoutEndpoint: import.meta.env.LOGOUT_ENDPOINT,
  passwordResetRequestEndpoint: import.meta.env.PASSWORD_RESET_REQUEST_ENDPOINT,
  passwordResetVerifyEndpoint: import.meta.env.PASSWORD_RESET_VERIFY_ENDPOINT,
  verifyEmailEndpoint: import.meta.env.VITE_VERIFY_EMAIL_ENDPOINT,
  verifyEmailTokenEndpoint: import.meta.env.VITE_VERIFY_EMAIL_TOKEN_ENDPOINT,
});