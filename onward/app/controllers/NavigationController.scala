package controllers

import common.{Edition, JsonComponent, LinkTo, NavItem, NavLink, NewNavigation, SectionLink}
import model.Cached
import model.Cached.RevalidatableResult
import play.api.libs.json.{Json, Writes}
import play.api.mvc.{Action, Controller}

class NavigationController extends Controller {

  private case class SectionLinkAndEdition(link: SectionLink, edition: Edition)
  private case class NavItemAndEdition(link: NavItem, edition: Edition)

  private case class topLevelNavItems(editionalisedSection: NewNavigation.EditionalisedNavigationSection)
  private case class navSectionLink(navLink: NavLink)

  def nav() = Action { implicit request =>
    Cached(500) {

      implicit val sectionLinkWrites = new Writes[SectionLinkAndEdition] {
        def writes(item: SectionLinkAndEdition) = Json.obj(
          "title" -> item.link.title,
          "href" -> LinkTo(item.link.href, item.edition)
        )
      }

      implicit val navItemWrites = new Writes[NavItemAndEdition] {
        def writes(item: NavItemAndEdition) = Json.obj(
          "section" -> SectionLinkAndEdition(item.link.name, item.edition),
          "subSections" -> item.link.links.map(link => SectionLinkAndEdition(link, item.edition))
        )
      }

      RevalidatableResult.Ok(Json.arr(Edition.all.map { edition =>
        Json.obj(edition.id -> Json.arr(edition.navigation.map(item => NavItemAndEdition(item, edition))))
      }))
    }
  }

  //  This is to editionalise the menu on AMP
  def renderAmpNav = Action { implicit request =>
    val edition = Edition(request)
    val navSecondarySections = List.concat(
      NewNavigation.BrandExtensions.getAllEditionalisedNavLinks(edition).map(section => navSectionLink(section)),
      NewNavigation.OtherLinks.getAllEditionalisedNavLinks(edition).map(section => navSectionLink(section))
    )


    Cached(900) {

      implicit val sectionLinkAndTitleWrites = new Writes[navSectionLink] {
        def writes(item: navSectionLink) = Json.obj(
          "title" -> item.navLink.title,
          "url" -> LinkTo(item.navLink.url)
        )
      }

      implicit val topLevelSectionWrites = new Writes[topLevelNavItems] {
        def writes(item: topLevelNavItems) = Json.obj(
          "title" -> item.editionalisedSection.name,
          "subSections" -> item.editionalisedSection.getAllEditionalisedNavLinks(edition).map(subsection => navSectionLink(subsection))
        )
      }

      JsonComponent(
        "items" -> Json.arr(
          Json.obj(
            "topLevelSections" -> NewNavigation.topLevelSections.map( section => topLevelNavItems(section) ),
            "secondarySections" -> navSecondarySections
          )
        )
      )
    }
  }
}
