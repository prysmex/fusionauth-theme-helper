// FusionAuth "Login Validation" lambda for the tenant. A tenant has a single login validation lambda, so every
// login rule lives here, each in its own function called from validate().
//
// Assign it on the tenant: Tenant > Security > Login validation lambda.
// Requires FusionAuth >= 1.53.
//
// Rules
// 1. Disabled accounts: users Prysmex marked inactive (`user.data.is_active`) can't log in.
// 2. SSO enforcement: users of SSO clients can only log in through their client's identity provider.
//    Which identity provider a user must log in with comes from, in order:
//      a. `user.data.requiredIdentityProviderId`, once the Prysmex backend writes it (so a client can be managed
//         from Prysmex without editing this lambda);
//      b. otherwise the domain of the user's email, looked up in SSO_DOMAINS below.
//    There are no exemptions: accounts that must not use SSO (e.g. integrations) need an email outside SSO domains.
//    Users matching neither are not affected. Users that must use SSO can only log in through that identity provider:
//    password, passwordless (magic link), passkeys and any other identity provider (Google, generic Microsoft, ...)
//    are rejected. The error shown on the hosted pages is the theme message `[SSORequired]` (defaultMessages.txt and
//    localizedMessages.es.txt); the `message` is only used if the theme doesn't define it, e.g. for API logins.

// Email domain (lowercase) -> FusionAuth identity provider id that domain must log in with.
// Adding a domain here enforces SSO immediately for every user with that email domain, so first check that the
// identity provider links existing users by email (linking strategy) and sends the same email FusionAuth has.
var SSO_DOMAINS = {
  // 'acme.com': '00000000-0000-0000-0000-000000000000', // Acme (Entra ID SAML)
};

function validate(result, user, registration, context) {
  // A disabled account can't log in at all, so there is no point in also asking for SSO
  if (validateAccountActive(result, user)) {
    validateSSO(result, user, context);
  }
}

// Returns false (and adds the errors) when the account is disabled
function validateAccountActive(result, user) {
  if (user.data && user.data.is_active) {
    return true;
  }

  addErrors(result, [
    {
      code: '[LoginDisabled]',
      message: 'Your account is disabled.'
    },
    {
      code: '[CuentaDeshabilitada]',
      message: 'Tu cuenta esta deshabilitada.'
    }
  ]);

  return false;
}

function validateSSO(result, user, context) {
  var requiredIdentityProviderId = requiredIdentityProviderFor(user);

  // Not an SSO-enforced user: nothing to do
  if (!requiredIdentityProviderId) {
    return;
  }

  // Refreshing an existing session is not a new login; that session was validated when it started
  if (context.authenticationType === 'REFRESH_TOKEN') {
    return;
  }

  // Logged in through the required identity provider
  if (context.identityProvider && context.identityProvider.id === requiredIdentityProviderId) {
    return;
  }

  console.info('SSO required for user [' + user.id + ']: rejected [' + context.authenticationType + '] login' +
               (context.identityProvider ? ' via identity provider [' + context.identityProvider.id + ']' : ''));

  addErrors(result, [{
    code: '[SSORequired]',
    message: 'Your organization requires you to sign in with your corporate account.'
  }]);
}

function requiredIdentityProviderFor(user) {
  // Set by the Prysmex backend
  if (user.data && user.data.requiredIdentityProviderId) {
    return user.data.requiredIdentityProviderId;
  }

  // Prysmex doesn't send an email to FusionAuth for users that can't log in with one
  if (!user.email) {
    return null;
  }

  var email = user.email.toLowerCase();
  var domain = email.substring(email.lastIndexOf('@') + 1);

  return SSO_DOMAINS[domain] || null;
}

// Adds to the general errors instead of replacing them, so one rule can't drop another rule's errors
function addErrors(result, errors) {
  result.errors.generalErrors = (result.errors.generalErrors || []).concat(errors);
}
