[#ftl/]
[#-- @ftlvariable name="application" type="io.fusionauth.domain.Application" --]
[#-- @ftlvariable name="client_id" type="java.lang.String" --]
[#-- @ftlvariable name="email" type="java.lang.String" --]
[#-- @ftlvariable name="tenant" type="io.fusionauth.domain.Tenant" --]
[#-- @ftlvariable name="tenantId" type="java.util.UUID" --]
[#import "../_helpers.ftl" as helpers/]

[@helpers.html]
  [@helpers.head]
    [#-- Custom <head> code goes here --]
    <script type="text/javascript">
      document.addEventListener('DOMContentLoaded', () => {
         const returnToLogin = document.getElementById('returnToLogin');
         const state = new URL(window.location.href).searchParams.get('state') || window.sessionStorage.getItem('state');
         if(state) {
          let deserializedState = JSON.parse(atob(state || '{}'));
          if(deserializedState && deserializedState.oauth && deserializedState.oauth.redirect_uri) {
            const returnToLoginUrl = new URL(returnToLogin.href);
            Object.keys(deserializedState.oauth).forEach(key => {
              returnToLoginUrl.searchParams.set(key, deserializedState.oauth[key]);
            });
            returnToLogin.href = returnToLoginUrl.href;
          } else {
            returnToLogin.href = '/oauth2/authorize';
          }
         }
      });
    </script>
  [/@helpers.head]
  [@helpers.body]
    [@helpers.header]
      [#-- Custom header code goes here --]
    [/@helpers.header]

    [@helpers.main title=theme.message('forgot-password-email-sent-title')]
      <p>
        ${theme.message('forgot-password-email-sent', email)}
      </p>
      <p class="mt-2">[@helpers.link url="/oauth2/authorize" id="returnToLogin"]${theme.message('return-to-login')}[/@helpers.link]</p>
    [/@helpers.main]

    [@helpers.footer]
      [#-- Custom footer code goes here --]
    [/@helpers.footer]
  [/@helpers.body]
[/@helpers.html]