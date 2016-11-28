package model

import play.api.mvc.DiscardingCookie


object SignoutDiscaringCookies {

  def apply(domain: String): List[DiscardingCookie] = {
    val payingMemberCookies = List(
      DiscardingCookie("gu_user_features_expiry", "/", Some(domain), secure = false),
      DiscardingCookie("gu_paying_member", "/", Some(domain), secure = false))

    DiscardingCookie("GU_U", "/", Some(domain), secure = false) ::
    DiscardingCookie("SC_GU_U", "/", Some(domain), secure = true) ::
    DiscardingCookie("GU_ID_CSRF", "/", Some(domain), secure = true) ::
    payingMemberCookies
  }
}
