package navigation

import common.{Edition, Navigation}
import conf.Configuration
import model.Page
import SectionLinks._
import NavLinks._

object NavigationHelpers {

  def getMembershipLinks(edition: Edition): List[NavLink] = {
    val editionId = edition.id.toLowerCase()

    List(
      NavLink("become a supporter", s"${Configuration.id.membershipUrl}/${editionId}/supporter?INTCMP=mem_${editionId}_web_newheader"),
      NavLink("subscribe", s"${Configuration.id.digitalPackUrl}/${editionId}?INTCMP=NGW_NEWHEADER_${editionId}_GU_SUBSCRIBE")
    )
  }

  def getSectionOrPageId(page: Page): String = {
    val frontLikePages = List(
      "theguardian",
      "observer",
      "football/live",
      "football/tables",
      "football/competitions",
      "football/results",
      "football/fixtures",
      "type/cartoon",
      "cartoons/archive"
    )
    val tags = Navigation.getTagsFromPage(page)
    val commonKeywords = tags.keywordIds.intersect(tagPages).sortWith(tags.keywordIds.indexOf(_) < tags.keywordIds.indexOf(_))
    val isTagPage = (page.metadata.isFront || frontLikePages.contains(page.metadata.id)) && tagPages.contains(page.metadata.id)
    val isArticleInTagPageSection = commonKeywords.nonEmpty

    // opinion pieces should always clearly be opinion pieces, regardless of other keywords
    if (page.metadata.sectionId == "commentisfree") {
      page.metadata.sectionId
    } else if (isTagPage) {
      simplifySectionId(page.metadata.id)
    } else if (isArticleInTagPageSection) {
      simplifySectionId(commonKeywords.head)
    } else {
      simplifySectionId(page.metadata.sectionId)
    }
  }

  def getPillarName(id: String): String = {
    sectionLinks.find(_.id == id).map(_.pillar.title).getOrElse("")
  }

  def getSubNav(page: Page): Option[NavLink2] = {
    val sectionOrTagId = NavigationHelpers.getSectionOrPageId(page)
    val subNav = sectionLinks.find(_.id == sectionOrTagId)

    subNav
  }

  def getSectionsToDisplay(item: NavLink2, edition: Edition): List[NavLink2] = {
    val useChildSections = item.children.isDefined
    val useParentSections = item.parent.isDefined && item.parent.get.children.isDefined

    if (useChildSections) {
      lazy val sectionList = item.children.get.getEditionalisedList(edition)

      List(item) ++ sectionList
    } else if (useParentSections) {
        item.parent.get.children.get.getEditionalisedList(edition)
    } else {
      item.pillar.children.getEditionalisedList(edition)
    }
  }

  def simplifySectionId(sectionId: String): String = {
    val sectionMap = Map(
      "money/property" -> "money",
      "money/pensions" -> "money",
      "money/savings" -> "money",
      "money/debt" -> "money",
      "money/work-and-careers" -> "money",
      "world/europe-news" -> "world",
      "world/americas" -> "world",
      "world/asia" -> "world",
      "education" -> "uk-news",
      "media" -> "uk-news",
      "society" -> "uk-news",
      "law" -> "uk-news",
      "scotland" -> "uk-news",
      "business/economics" -> "business",
      "business/banking" -> "business",
      "business/retail" -> "business",
      "business/stock-markets" -> "business",
      "business/eurozone" -> "business",
      "us/sustainable-business" -> "business",
      "business/us-small-business" -> "business",
      "environment/climate-change" -> "environment",
      "environment/wildlife" -> "environment",
      "environment/energy" -> "environment",
      "environment/pollution" -> "environment",
      "travel/uk" -> "travel",
      "travel/europe" -> "travel",
      "travel/usa" -> "travel",
      "travel/skiing" -> "travel",
      "travel/australasia" -> "travel",
      "travel/asia" -> "travel"
    )

    sectionMap.getOrElse(sectionId, sectionId)
  }

  private def simplifyFootball(sectionId: String): String = {
    val sectionMap = Map(
      "football/live" -> "football",
      "football/tables" -> "football",
      "football/competitions" -> "football",
      "football/results" -> "football",
      "football/fixtures" -> "football"
    )

    sectionMap.getOrElse(sectionId, sectionId)
  }
}
