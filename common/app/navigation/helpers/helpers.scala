package navigation

import common.Edition
import UrlHelpers.{SideMenu, getReaderRevenueUrl}
import navigation.ReaderRevenueSite.{Support, SupportBySubscribing}
import play.api.mvc.RequestHeader

object NavigationHelpers {

  def getMembershipLinks(edition: Edition)(implicit request: RequestHeader): List[NavLink] = {
    val editionId = edition.id.toLowerCase()

    List(
      NavLink("Become a supporter", getReaderRevenueUrl(Support, SideMenu)),
      NavLink("Subscribe", getReaderRevenueUrl(SupportBySubscribing, SideMenu), classList = Seq("js-subscribe"))
    )
  }
}
