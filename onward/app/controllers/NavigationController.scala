package controllers

import common.{Edition, JsonComponent, LinkTo}
import conf.Configuration
import model.Cached
import navigation.{NavLink, NavMenu, UrlHelpers}
import play.api.libs.json.{JsValue, Json, Writes}
import play.api.mvc.{Action, AnyContent, BaseController, ControllerComponents}

class NavigationController(val controllerComponents: ControllerComponents) extends BaseController {

  private case class topLevelNavItems(navLink: NavLink)
  private case class navSectionLink(navLink: NavLink)

  //  This is to editionalise the menu on AMP
  def renderAmpNav: Action[AnyContent] =
    Action { implicit request =>
      val edition = Edition(request)
      val menu = NavMenu(edition)
      val navSecondarySections = List.concat(
        menu.brandExtensions.map(section => navSectionLink(section)),
        menu.otherLinks.map(section => navSectionLink(section)),
      )

      Cached(900) {

        implicit val sectionLinkAndTitleWrites = new Writes[navSectionLink] {
          def writes(item: navSectionLink) =
            Json.obj(
              "title" -> item.navLink.title,
              "url" -> LinkTo(item.navLink.url),
            )
        }

        // TODO:
        implicit val topLevelSectionWrites = new Writes[topLevelNavItems] {
          def writes(item: topLevelNavItems) =
            Json.obj(
              "title" -> item.navLink.title,
              "subSections" -> item.navLink.children.map(subsection => navSectionLink(subsection)),
            )
        }

        implicit val editionWrites: Writes[Edition] = new Writes[Edition] {
          def writes(edition: Edition): JsValue =
            Json.obj(
              "id" -> edition.id,
              "displayName" -> edition.displayName,
              "optInLink" -> s"${Configuration.site.host}/preference/edition/${edition.id.toLowerCase}",
            )
        }

        JsonComponent(
          "items" -> Json.arr(
            Json.obj(
              "topLevelSections" -> menu.pillars.map(section => topLevelNavItems(section)),
              "readerRevenueLinks" -> UrlHelpers.readerRevenueLinks.map(section => navSectionLink(section)),
              "secondarySections" -> navSecondarySections,
              "editions" -> Edition.all,
            ),
          ),
        )
      }
    }
}
