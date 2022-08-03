package controllers

import common.{Edition, JsonComponent, LinkTo}
import conf.Configuration
import model.Cached.RevalidatableResult
import model.{Cached, Cors}
import navigation.{NavLink, SimpleMenu, UrlHelpers}
import play.api.libs.json.{JsValue, Json, Writes}
import play.api.mvc.{Action, AnyContent, BaseController, ControllerComponents}

case class ApiError(message: String, statusCode: Int)

object ApiError {
  implicit val writes = Json.writes[ApiError]
}

class NavigationController(val controllerComponents: ControllerComponents) extends BaseController {

  private case class topLevelNavItems(navLink: NavLink)
  private case class navSectionLink(navLink: NavLink)

  def renderDCRNav(editionId: String): Action[AnyContent] =
    Action { implicit request =>
      Edition.byId(editionId) match {
        case Some(edition) =>
          val menu = SimpleMenu(edition)
          Cached(900)(JsonComponent.fromWritable(menu))
        case None =>
          Cached(60) {
            val json = Json.toJson(ApiError("Invalid edition ID.", 400)).toString()
            RevalidatableResult(Cors(BadRequest(json).as(JSON))(request), "")
          }
      }
    }

  //  This is to editionalise the menu on AMP
  def renderAmpNav: Action[AnyContent] =
    Action { implicit request =>
      val edition = Edition(request)
      val menu = SimpleMenu(edition)
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
