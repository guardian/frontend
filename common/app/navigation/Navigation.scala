package navigation

import common.{Edition, editions}
import model.NavItem
import _root_.model.{Page, Tags}
import NavLinks._

import scala.annotation.tailrec

case class Subnav(parent: Option[NavLink], children: Seq[NavLink])

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


case class NavRoot private(children: Seq[NavLink], otherLinks: Seq[NavLink], brandExtensions: Seq[NavLink]) extends NavNode {

  def getChildrenFromOtherEditions(edition: Edition): Seq[NavLink] = {
    Edition.others(edition).flatMap( edition =>
      NavRoot(edition).children ++ NavRoot(edition).otherLinks
    )
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
    /*
    * If the link isn't found within the current edition, check other editions
    * For example, if you are in the US edition, but go to `/cricket`.
    * We still want the Sports Pillar to be highlighted, even though cricket isn't in the UsSportsPillar
    */
    find(children ++ otherLinks).orElse(find(getChildrenFromOtherEditions(edition)))
  }

  def findParent(currentNavLink: NavLink, edition: Edition): Option[NavLink] = {
    // Football is currently in the News Pillar and the Sport pillar, however we don't want the parent to be News.
    def isFootballInNews(parentTitle: String): Boolean = {
      currentNavLink.title == "Football" && parentTitle == "News"
    }

    @tailrec
    def find(children: Seq[NavLink]): Option[NavLink] = {
      children match {
        case Nil => None
        case head :: tail if (head == currentNavLink || head.children.contains(currentNavLink) && !isFootballInNews(head.title)) => Some(head)
        case head :: tail => find(tail ++ head.children)
      }
    }
    // If the parent isn't found within the current edition, check other editions
    find(children ++ otherLinks).orElse(find(getChildrenFromOtherEditions(edition)))
  }

  def getPillar(currentParent: Option[NavLink], edition: Edition): Option[NavLink] = {
    currentParent.flatMap( parent =>
      if(otherLinks.contains(parent)) {
        None
      } else if (children.contains(parent)) {
        currentParent
      } else findParent(parent, edition).orElse(Some(ukNewsPillar))
    )
  }
}

object NavRoot {
  def apply(edition: Edition): NavRoot = {
    edition match {
      case editions.Uk => NavRoot(Seq(ukNewsPillar, ukOpinionPillar, ukSportPillar, ukCulturePillar, ukLifestylePillar), ukOtherLinks, ukBrandExtensions)
      case editions.Us => NavRoot(Seq(usNewsPillar, usOpinionPillar, usSportPillar, usCulturePillar, usLifestylePillar), usOtherLinks, usBrandExtensions)
      case editions.Au => NavRoot(Seq(auNewsPillar, auOpinionPillar, auSportPillar, auCulturePillar, auLifestylePillar), auOtherLinks, auBrandExtensions)
      case editions.International => NavRoot(Seq(intNewsPillar, intOpinionPillar, intSportPillar, intCulturePillar, intLifestylePillar), intOtherLinks, intBrandExtensions)
    }
  }
}

case class SimpleMenu private (root: NavRoot) {
  def pillars: Seq[NavLink] = root.children
  def otherLinks: Seq[NavLink] = root.otherLinks
  def brandExtensions: Seq[NavLink] = root.brandExtensions
}

case class NavMenu private (page: Page, root: NavRoot, edition: Edition) {

  def currentUrl: String = NavMenu.getSectionOrPageUrl(page, edition)
  def pillars: Seq[NavLink] = root.children
  def otherLinks: Seq[NavLink] = root.otherLinks
  def brandExtensions: Seq[NavLink] = root.brandExtensions
  def currentNavLink: Option[NavLink] = root.findDescendantByUrl(currentUrl, edition)
  def currentParent: Option[NavLink] = currentNavLink.flatMap( link => root.findParent(link, edition) )
  def currentPillar: Option[NavLink] = root.getPillar(currentParent, edition)
  def subNavSections: Subnav = NavMenu.getSubnav(page, currentNavLink, currentParent, currentPillar)
}

object NavMenu {

  def apply(page: Page, edition: Edition): NavMenu = NavMenu(page, NavRoot(edition), edition)
  def apply(edition: Edition): SimpleMenu = SimpleMenu(NavRoot(edition))

  private def getTagsFromPage(page: Page): Tags = {
    Page.getContent(page).map(_.tags).getOrElse(Tags(Nil))
  }

  private[navigation] def getSectionOrPageUrl(page: Page, edition: Edition): String = {
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
    val tags = getTagsFromPage(page)
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

  private[navigation] def getCustomSignPosting(navItem: NavItem): Subnav = {
    val children = navItem.links.map( link => NavLink(link.breadcrumbTitle, link.href) )
    val parent = NavLink(navItem.name.breadcrumbTitle, navItem.name.href)
    Subnav(Some(parent), children)
  }

  private[navigation] def getSubnav(page: Page, currentNavLink: Option[NavLink], currentParent: Option[NavLink], currentPillar: Option[NavLink]): Subnav = {
    lazy val subnav = {
      val currentNavHasChildren = currentNavLink.exists(_.children.nonEmpty)
      val parentIsPillar = currentParent.equals(currentPillar)

      val currentNavIsPillar = currentNavLink.equals(currentPillar)

      val parent = if (currentNavHasChildren & !currentNavIsPillar) currentNavLink else if (parentIsPillar) None else currentParent

      val childrenToShow = if (currentNavHasChildren) currentNavLink else currentParent
      val children = childrenToShow.map(navLink => navLink.children).getOrElse(Nil)

      Subnav(parent, children)
    }

    page.metadata.customSignPosting.map(getCustomSignPosting).getOrElse(subnav)
  }
}
