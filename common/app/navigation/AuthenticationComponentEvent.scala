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

  def createAuthenticationComponentEventParams(componentEventId: ComponentEventId): String =
    createAuthenticationComponentEventTuple(componentEventId) match {
      case (key, value) => s"$key=${URLEncoder.encode(value, "UTF-8")}"
    }

  def createAuthenticationComponentEventTuple(componentEventId: ComponentEventId): (String, String) = {
    val eventParams = s"componentType=identityauthentication&componentId=${componentEventId.id}"
    "componentEventParams" -> eventParams
  }
}
