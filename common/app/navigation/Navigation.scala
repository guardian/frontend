package navigation

import common.{Edition, Navigation, editions}
import _root_.model.Page
import NavLinks._

import scala.annotation.tailrec

case class Subnav(parent: Option[NavLink], children: Option[Seq[NavLink]], hasSecondaryParent: Boolean = false, hasTertiary: Boolean = false)

sealed trait NavNode {
  def children: Seq[NavLink]
}

case class NavLink(
  title: String,
  url: String,
  longTitle: String = "",
  // TODO: Shouldn't need iconName. Remove, and just make the first NavLink on mobile
  iconName: String = "",
  children: Seq[NavLink] = Nil
) extends NavNode


case class NavRoot private(val children: Seq[NavLink]) extends NavNode {

  def getOtherPillarsFromEdition(edition: Edition): Seq[NavLink] = {
    Edition.others(edition).flatMap( edition => {
      NavRoot(edition).children
    })
  }

  def findDescendantByUrl(url: String, edition: Edition): Option[NavLink] = {

    @tailrec
    def find(children: Seq[NavLink]): Option[NavLink] = {
      children match {
        case Nil => None
        case head :: tail if (head.url == url) => Some(head)
        case head :: tail => find(tail ++ head.children)
      }
    }
    // If the link isn't found within the current edition, check other editions
    find(children).orElse(find(getOtherPillarsFromEdition(edition)))
  }

  def findParentByCurrentNavLink(currentNavLink: NavLink, edition: Edition): Option[NavLink] = {
    // Football is currently in the News Pillar and the Sport pillar, however we don't want the parent to be News.
    def footballDoesNotBelongInNews(parentTitle: String): Boolean = {
      currentNavLink.title == "football" && parentTitle == "news"
    }

    @tailrec
    def find(children: Seq[NavLink]): Option[NavLink] = {
      children match {
        case Nil => find(getOtherPillarsFromEdition(edition))
        case head :: tail if (head == currentNavLink) => Some(head) // If primary link, use that
        case head :: tail if (footballDoesNotBelongInNews(head.title)) => find(tail ++ head.children)
        case head :: tail if head.children.contains(currentNavLink) => Some(head)
        case head :: tail => find(tail ++ head.children)
      }
    }
    // If the parent isn't found within the current edition, check other editions
    find(children).orElse(find(getOtherPillarsFromEdition(edition)))
  }

  def getPillar(pillars: Seq[NavLink], currentParent: NavLink, edition: Edition): NavLink = {
    if(pillars.contains(currentParent)) {
      currentParent
    } else {
      // TODO: should we have default pillar that is not UK (like a blank one)?
      findParentByCurrentNavLink(currentParent, edition).getOrElse(ukNewsPillar)
    }
  }

  def getSubnav(currentNavLink: Option[NavLink], currentParent: NavLink, currentPillar: NavLink): Subnav = {
    val currentNavHasChildren = currentNavLink.map(navLink => navLink.children.nonEmpty).getOrElse(false)
    val parentIsPillar =  currentNavLink.contains(currentPillar)

    val showParent = if (parentIsPillar) false else true
    val parent = if (!showParent) None else if(currentNavHasChildren) currentNavLink else Some(currentParent)

    val childrenToShow = if (currentNavHasChildren) currentNavLink else Some(currentParent)
    val children = childrenToShow.map( navLink => Some(navLink.children) ).getOrElse(None)

    Subnav(parent, children, parent.isDefined, parent.isDefined && children.isDefined)
  }
}

object NavRoot {
  def apply(edition: Edition): NavRoot = {
    edition match {
      case editions.Uk => NavRoot(Seq(ukNewsPillar, ukSportPillar, ukOpinionPillar, ukArtsPillar, ukLifestylePillar))
      case editions.Us => NavRoot(Seq(usNewsPillar, usSportPillar, usOpinionPillar, usArtsPillar, usLifestylePillar))
      case editions.Au => NavRoot(Seq(auNewsPillar, auSportPillar, auOpinionPillar, auArtsPillar, auLifestylePillar))
      case editions.International => NavRoot(Seq(auNewsPillar, auSportPillar, auOpinionPillar, auArtsPillar, auLifestylePillar))
    }
  }
}

case class SimpleMenu private (root: NavRoot) {
  def pillars: Seq[NavLink] = root.children
}

case class NavMenu private (page: Page, root: NavRoot, edition: Edition) {

  def currentUrl: String = NavMenu.getSectionOrPageUrl(page, edition)
  def pillars: Seq[NavLink] = root.children

  def currentNavLink: Option[NavLink] = root.findDescendantByUrl(currentUrl, edition)
  def currentParent: NavLink = currentNavLink.flatMap( link => root.findParentByCurrentNavLink(link, edition) ).getOrElse(ukNewsPillar)
  def currentPillar: NavLink = root.getPillar(pillars, currentParent, edition)

  def subNavSections: Subnav = root.getSubnav(currentNavLink, currentParent, currentPillar)
}

object NavMenu {

  def apply(page: Page, edition: Edition): NavMenu = NavMenu(page, NavRoot(edition), edition)

  def apply(edition: Edition): SimpleMenu = SimpleMenu(NavRoot(edition))

  def getSectionOrPageUrl(page: Page, edition: Edition): String = {
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
    val networkFronts = Seq("uk", "us", "au", "international")
    val tags = Navigation.getTagsFromPage(page)
    val commonKeywords = tags.keywordIds.intersect(tagPages).sortWith(tags.keywordIds.indexOf(_) < tags.keywordIds.indexOf(_))
    val isTagPage = (page.metadata.isFront || frontLikePages.contains(page.metadata.id)) && tagPages.contains(page.metadata.id)
    val isArticleInTagPageSection = commonKeywords.nonEmpty

    val id = if (page.metadata.sectionId == "commentisfree") {
      page.metadata.sectionId
    } else if(networkFronts.contains(page.metadata.sectionId)) {
      ""
    } else if (isTagPage) {
      page.metadata.id
    } else if (isArticleInTagPageSection) {
      commonKeywords.head
    } else if(edition.isEditionalised(page.metadata.sectionId) || page.metadata.isFront) {
       page.metadata.sectionId
    } else {
      page.metadata.sectionId
    }

    s"/$id"
  }
}
