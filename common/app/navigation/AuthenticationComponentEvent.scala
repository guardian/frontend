package navigation

import java.net.URLEncoder


object AuthenticationComponentEvent {
  sealed abstract class ComponentEventId(val id: String)
  case object SigninHeaderId extends ComponentEventId("guardian_signin_header")
  case object SigninToReply extends ComponentEventId("signin_to_reply_comment")
  case object SigninToRecommend extends ComponentEventId("signin_to_recommend_comment")
  case object RegisterToRecommend extends ComponentEventId("register_to_recommend_comment")
  case object SigninRedirect extends ComponentEventId("signin_redirect_for_action")
  case object SigninFromFormStack extends ComponentEventId("signin_from_formstack")
  case object SigninFromPasswordResetConfirmation extends ComponentEventId("signin_from_password_reset_confirmation")

  def createAuthenticationComponentEventParams(componentEventId: ComponentEventId): String = createAuthenticationComponentEventTuple(componentEventId) match {
    case (key, value) => s"$key=$value"
  }

  def createAuthenticationComponentEventTuple(componentEventId: ComponentEventId): (String, String) = {
    val eventParams = s"componentType=IDENTITY_AUTHENTICATION&componentId=${componentEventId.id}"
    val encodedParams = URLEncoder.encode(eventParams, "UTF-8")
    "componentEventParams" -> encodedParams
  }
}
