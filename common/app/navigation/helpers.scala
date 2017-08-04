package common

import conf.Configuration
import model.Page
import SectionLinks._
import NewNavigation._
import SubSectionLinks._
import NavLinks._

object NavigationHelpers {

  def getMembershipLinks(edition: Edition): NavLinkLists = {
    val editionId = edition.id.toLowerCase()

    NavLinkLists(List(
      NavLink("become a supporter", s"${Configuration.id.membershipUrl}/${editionId}/supporter?INTCMP=mem_${editionId}_web_newheader"),
      NavLink("subscribe", s"${Configuration.id.digitalPackUrl}/${editionId}?INTCMP=NGW_NEWHEADER_${editionId}_GU_SUBSCRIBE")
    ))
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

  def getSectionLinks(sectionName: String, edition: Edition): Tuple2[Seq[NavLink], Seq[NavLink]] = {
    val sectionList = sectionLinks.filter { item =>
      item.pageId == sectionName
    }

    if (sectionList.isEmpty) {
      val mostPopular = News.getEditionalisedSubSectionLinks(edition).mostPopular.drop(1)
      val leastPopular = News.getEditionalisedSubSectionLinks(edition).leastPopular

      (mostPopular, leastPopular)
    } else {
      val section = sectionList.head
      val mostPopular = section.parentSection.getEditionalisedSubSectionLinks(edition).mostPopular.drop(1)
      val leastPopular = section.parentSection.getEditionalisedSubSectionLinks(edition).leastPopular

      if (mostPopular.contains(section.navLink) || NewNavigation.PrimaryLinks.contains(section.navLink)) {
        (mostPopular, leastPopular)
      } else {
        (Seq(section.navLink) ++ mostPopular, leastPopular.filter(_.title != section.navLink.title))
      }
    }
  }

  def getPillarName(id: String): String = {
    getSectionLink(id).getOrElse("News")
  }

  def getActivePillar(page: Page): Tuple2[String, String] = {
    val sectionOrTagId = NavigationHelpers.getSectionOrPageId(page)
    val activeSectionLink = getSectionLink(sectionOrTagId)

    (sectionOrTagId, activeSectionLink.getOrElse(""))
  }

  private def getSectionLink(id: String): Option[String] = {
    sectionLinks.find(_.pageId == id).map(_.parentSection.name)
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

  def getSubSectionNavLinks(id: String, edition: Edition, isFront: Boolean): Tuple2[Seq[NavLink], Seq[NavLink]] = {
    if (isEditionalistedSubSection(id)) {
      val subNav = editionalisedSubSectionLinks.filter(_.pageId == id).head.parentSection

      (subNav.getEditionalisedSubSectionLinks(edition).mostPopular,
        subNav.getEditionalisedSubSectionLinks(edition).leastPopular)
    } else {
      val subSectionList = subSectionLinks.filter(_.pageId == simplifyFootball(id))

      if (subSectionList.isEmpty) {
        NavigationHelpers.getSectionLinks(id, edition)
      } else {
        (subSectionList.head.parentSection.mostPopular,
          subSectionList.head.parentSection.leastPopular)

      }
    }
  }

  def isEditionalistedSubSection(sectionId: String): Boolean = {
    editionalisedSubSectionLinks.exists(_.pageId == sectionId)
  }
}
