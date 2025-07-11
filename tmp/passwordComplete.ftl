[#ftl/]
[#-- @ftlvariable name="application" type="io.fusionauth.domain.Application" --]
[#-- @ftlvariable name="client_id" type="java.lang.String" --]
[#-- @ftlvariable name="currentUser" type="io.fusionauth.domain.User" --]
[#-- @ftlvariable name="tenant" type="io.fusionauth.domain.Tenant" --]
[#-- @ftlvariable name="tenantId" type="java.util.UUID" --]
[#import "../_helpers.ftl" as helpers/]

[@helpers.html]
  [@helpers.head]
    [#-- Custom <head> code goes here --]
    <script type="text/javascript">
      document.addEventListener('DOMContentLoaded', () => {
         const state = new URL(window.location.href).searchParams.get('state') || window.sessionStorage.getItem('state');
         if(state) {
          let deserializedState = JSON.parse(atob(state || '{}'));
          if(deserializedState && deserializedState.oauth && deserializedState.oauth.redirect_uri) {
            setTimeout(function() {
              const returnToApp = new URL(deserializedState.oauth.redirect_uri);
              // We want to return to the base URL of the application
              window.location.href = returnToApp.origin;
            }, 3000);
          } 
         }
      });
    </script>
  [/@helpers.head]
  [@helpers.body]
    [@helpers.header]
      [#-- Custom header code goes here --]
    [/@helpers.header]

    [@helpers.main title=theme.message('password-changed-title')]
      <p>
        ${theme.message('password-changed')}
      </p>
    [/@helpers.main]

    [@helpers.footer]
      [#-- Custom footer code goes here --]
    [/@helpers.footer]
  [/@helpers.body]
[/@helpers.html]