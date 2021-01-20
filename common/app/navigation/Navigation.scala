package navigation

import _root_.model.{NavItem, Page, Tags}
import common.{Edition, editions}
import play.api.libs.json.{Json, Writes}

import scala.annotation.tailrec

sealed trait Subnav
case class FlatSubnav(links: Seq[NavLink]) extends Subnav
case class ParentSubnav(parent: NavLink, links: Seq[NavLink]) extends Subnav

case class NavLink(
    title: String,
    url: String,
    longTitle: String = "",
    // TODO: Shouldn't need iconName. Remove, and just make the first NavLink on mobile
    iconName: String = "",
    children: Seq[NavLink] = Nil,
    classList: Seq[String] = Nil,
)

case class SimpleMenu(
    pillars: Seq[NavLink],
    otherLinks: Seq[NavLink],
    brandExtensions: Seq[NavLink],
)

case class NavMenu(
    currentUrl: String,
    pillars: Seq[NavLink],
    otherLinks: Seq[NavLink],
    brandExtensions: Seq[NavLink],
    currentNavLink: Option[NavLink],
    currentParent: Option[NavLink],
    currentPillar: Option[NavLink],
    subNavSections: Option[Subnav],
)

object NavMenu {

  val navigationData = NavigationData()

  implicit val navlinkWrites = Json.writes[NavLink]
  implicit val flatSubnavWrites = Json.writes[FlatSubnav]
  implicit val parentSubnavWrites = Json.writes[ParentSubnav]
  implicit val subnavWrites = Writes[Subnav] {
    case nav: FlatSubnav   => flatSubnavWrites.writes(nav)
    case nav: ParentSubnav => parentSubnavWrites.writes(nav)
  }
  implicit val writes = Json.writes[NavMenu]

  private[navigation] case class NavRoot(
      children: Seq[NavLink],
      otherLinks: Seq[NavLink],
      brandExtensions: Seq[NavLink],
  )

  def apply(page: Page, edition: Edition): NavMenu = {
    val root = navRoot(edition)
    val currentUrl = getSectionOrPageUrl(page, edition)
    val currentNavLink = findDescendantByUrl(currentUrl, edition, root.children, root.otherLinks)
    val currentParent = currentNavLink.flatMap(link => findParent(link, edition, root.children, root.otherLinks))
    val currentPillar = getPillar(currentParent, edition, root.children, root.otherLinks)
    NavMenu(
      currentUrl = currentUrl,
      pillars = root.children,
      otherLinks = root.otherLinks,
      brandExtensions = root.brandExtensions,
      currentNavLink = currentNavLink,
      currentParent = currentParent,
      currentPillar = currentPillar,
      subNavSections = getSubnav(page.metadata.customSignPosting, currentNavLink, currentParent, currentPillar),
    )
  }

  def apply(edition: Edition): SimpleMenu = {
    val root = navRoot(edition)
    SimpleMenu(root.children, root.otherLinks, root.brandExtensions)
  }

  /*
   * Useful when looking for a link, which may not exist in current edition, but
   * does in another.
   *
  * For example, if you are in the US edition, but go to `/cricket`, we still
   * want the Sports Pillar to be highlighted, even though cricket isn't in the
   * UsSportsPillar
   */
  private[navigation] def getChildrenFromOtherEditions(edition: Edition): Seq[NavLink] = {
    Edition.others(edition).flatMap(edition => NavMenu.navRoot(edition).children ++ NavMenu.navRoot(edition).otherLinks)
  }

  @tailrec
  private[navigation] def find(graph: Seq[NavLink], p: NavLink => Boolean): Option[NavLink] = {
    graph match {
      case Nil                     => None
      case head :: tail if p(head) => Some(head)
      case head :: tail            => find(tail ++ head.children, p)
    }
  }

  private[navigation] def findDescendantByUrl(
      url: String,
      edition: Edition,
      pillars: Seq[NavLink],
      otherLinks: Seq[NavLink],
  ): Option[NavLink] = {
    def hasUrl(link: NavLink): Boolean = link.url == url

    find(pillars ++ otherLinks, hasUrl)
      .orElse(find(getChildrenFromOtherEditions(edition), hasUrl))
  }

  private[navigation] def findParent(
      currentNavLink: NavLink,
      edition: Edition,
      pillars: Seq[NavLink],
      otherLinks: Seq[NavLink],
  ): Option[NavLink] = {
    // Football is currently in the News Pillar and the Sport pillar, however we don't want the parent to be News.
    def isFootballInNews(parentTitle: String): Boolean = {
      currentNavLink.title == "Football" && parentTitle == "News"
    }

    def isParent(link: NavLink): Boolean =
      link == currentNavLink || link.children.contains(currentNavLink) && !isFootballInNews(link.title)

    find(pillars ++ otherLinks, isParent)
      .orElse(find(getChildrenFromOtherEditions(edition), isParent))
  }

  private[navigation] def getPillar(
      currentParent: Option[NavLink],
      edition: Edition,
      pillars: Seq[NavLink],
      otherLinks: Seq[NavLink],
  ): Option[NavLink] = {
    currentParent.flatMap(parent =>
      if (otherLinks.contains(parent)) {
        None
      } else if (pillars.contains(parent)) {
        currentParent
      } else findParent(parent, edition, pillars, otherLinks).orElse(Some(navigationData.uk.newsPillar)),
    )
  }

  private[navigation] def navRoot(edition: Edition): NavRoot = {

    val editionLinks: EditionNavLinks = edition match {
      case editions.Uk            => navigationData.uk
      case editions.Us            => navigationData.us
      case editions.Au            => navigationData.au
      case editions.International => navigationData.international
    }

    NavRoot(
      Seq(
        editionLinks.newsPillar,
        editionLinks.opinionPillar,
        editionLinks.sportPillar,
        editionLinks.culturePillar,
        editionLinks.lifestylePillar,
      ),
      editionLinks.otherLinks,
      editionLinks.brandExtensions,
    )

  }

  private[navigation] def getTagsFromPage(page: Page): Tags = {
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
      "cartoons/archive",
    )
    val networkFronts = Seq("uk", "us", "au", "international")
    val tags = getTagsFromPage(page)
    val commonKeywords = tags.keywordIds
      .intersect(navigationData.tagPages)
      .sortWith(tags.keywordIds.indexOf(_) < tags.keywordIds.indexOf(_))
    val isTagPage = (page.metadata.isFront || frontLikePages.contains(page.metadata.id)) && navigationData.tagPages
      .contains(page.metadata.id)
    val isArticleInTagPageSection = commonKeywords.nonEmpty

    val id = if (networkFronts.contains(page.metadata.sectionId)) {
      ""
    } else if (isTagPage) {
      page.metadata.id
    } else if (isArticleInTagPageSection) {
      commonKeywords.head
    } else if (edition.isEditionalised(page.metadata.sectionId) || page.metadata.isFront) {
      page.metadata.sectionId
    } else {
      page.metadata.sectionId
    }

    // if id is a section tag, e.g. education/education, convert it to just /education, so it can be succesfully
    // found up in the navigation (see findDescendantByUrl)
    val idParts = id.split("/")
    if (idParts.length == 2 && idParts(0) == idParts(1)) {
      s"/${idParts(0)}"
    } else s"/$id"

  }

  private[navigation] def getSubnav(
      customSignPosting: Option[NavItem],
      currentNavLink: Option[NavLink],
      currentParent: Option[NavLink],
      currentPillar: Option[NavLink],
  ): Option[Subnav] = {

    customSignPosting match {

      case Some(navItem) =>
        val links = navItem.links.map(link => NavLink(link.breadcrumbTitle, link.href))
        val parent = NavLink(navItem.name.breadcrumbTitle, navItem.name.href)
        Some(ParentSubnav(parent, links))

      case None =>
        val currentNavIsPillar = currentNavLink.equals(currentPillar)
        val currentNavHasChildren = currentNavLink.exists(_.children.nonEmpty)
        val parentIsPillar = currentParent.equals(currentPillar)

        val parent =
          if (currentNavHasChildren & !currentNavIsPillar) {
            currentNavLink
          } else if (parentIsPillar) {
            None
          } else {
            currentParent
          }

        val links =
          if (currentNavHasChildren) {
            currentNavLink.map(_.children).getOrElse(Nil)
          } else {
            currentParent.map(_.children).getOrElse(Nil)
          }

        parent match {
          case Some(p)                => Some(ParentSubnav(p, links))
          case None if links.nonEmpty => Some(FlatSubnav(links))
          case None                   => None
        }
    }
  }
}
