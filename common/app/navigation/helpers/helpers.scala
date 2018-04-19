package navigation

import common.Edition
import navigation.ReaderRevenueSite._
import UrlHelpers.{SideMenu, getReaderRevenueUrl}
import play.api.mvc.RequestHeader

object NavigationHelpers {

  def getMembershipLinks(edition: Edition)(implicit request: RequestHeader): List[NavLink] = {
    val editionId = edition.id.toLowerCase()

    List(
      NavLink("Make a contribution", getReaderRevenueUrl(SupportContribute, SideMenu)),
      NavLink("Subscribe", getReaderRevenueUrl(SupportSubscribe, SideMenu), classList = Seq("js-subscribe"))
    )
  }
}
