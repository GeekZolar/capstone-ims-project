export default () => ({
  baseUrl: import.meta.env.VITE_API_BASE_URL ?? '',
  usersEndpoint:
    import.meta.env.VITE_USERS_ENDPOINT ?? '/users',
  usersCreateEndpoint:
    import.meta.env.VITE_USERS_CREATE_ENDPOINT ?? '/users/create',
  changePasswordEndpoint:
    import.meta.env.VITE_CHANGE_PASSWORD_ENDPOINT ?? '/users/change-password',
  loginEndpoint: import.meta.env.VITE_LOGIN_ENDPOINT ?? import.meta.env.LOGIN_ENDPOINT ?? '/auth/login',
  verifyLoginEndpoint: import.meta.env.VITE_VERIFY_LOGIN_ENDPOINT ?? import.meta.env.VERIFY_LOGIN_ENDPOINT ?? '/auth/mfa/verify-login',
  registrationRolesEndpoint:
    import.meta.env.VITE_REGISTRATION_ROLES_ENDPOINT ?? '/roles/registration',
  suppliersEndpoint:
    import.meta.env.VITE_SUPPLIERS_ENDPOINT ?? '/utility/suppliers',
  countriesEndpoint:
    import.meta.env.VITE_COUNTRIES_ENDPOINT ?? '/utility/countries',
  categoriesEndpoint:
    import.meta.env.VITE_CATEGORIES_ENDPOINT ?? '/utility/categories',
  warehousesEndpoint:
    import.meta.env.VITE_WAREHOUSES_ENDPOINT ?? '/utility/warehouses',
  productsEndpoint:
    import.meta.env.VITE_PRODUCTS_ENDPOINT ?? '/utility/products',
  purchaseOrdersEndpoint:
    import.meta.env.VITE_PURCHASE_ORDERS_ENDPOINT ?? '/purchase-orders',
  mfaSetupEndpoint:
    import.meta.env.VITE_MFA_SETUP_ENDPOINT ?? import.meta.env.MFA_SETUP_ENDPOINT ?? '/auth/mfa/setup',
  mfaVerifyEndpoint:
    import.meta.env.VITE_MFA_VERIFY_ENDPOINT ?? import.meta.env.MFA_VERIFY_ENDPOINT ?? '/auth/mfa/verify',
  mfaDisableEndpoint:
    import.meta.env.VITE_MFA_DISABLE_ENDPOINT ?? import.meta.env.MFA_DISABLE_ENDPOINT ?? '/auth/mfa/verify-disable',
  logoutEndpoint: import.meta.env.LOGOUT_ENDPOINT,
  passwordResetRequestEndpoint: import.meta.env.PASSWORD_RESET_REQUEST_ENDPOINT,
  passwordResetVerifyEndpoint: import.meta.env.PASSWORD_RESET_VERIFY_ENDPOINT,
  verifyEmailEndpoint: import.meta.env.VITE_VERIFY_EMAIL_ENDPOINT,
  verifyEmailTokenEndpoint: import.meta.env.VITE_VERIFY_EMAIL_TOKEN_ENDPOINT,
});