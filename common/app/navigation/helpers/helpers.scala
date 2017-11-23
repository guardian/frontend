package navigation

import common.Edition
import UrlHelpers.{SideMenu, getSupportOrMembershipUrl, getSupportOrSubscriptionUrl}
import play.api.mvc.RequestHeader

object NavigationHelpers {

  def getMembershipLinks(edition: Edition)(implicit request: RequestHeader): List[NavLink] = {
    val editionId = edition.id.toLowerCase()

    List(
      NavLink("become a supporter", getSupportOrMembershipUrl(SideMenu)),
      NavLink("subscribe", getSupportOrSubscriptionUrl(SideMenu))
    )
  }
}
