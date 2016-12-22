package controllers

import common.{Edition, JsonComponent, LinkTo, NavItem, SectionLink, NewNavigation}
import model.Cached
import model.Cached.RevalidatableResult
import play.api.libs.json.{Json, JsArray, JsObject, JsNull, Writes}
import play.api.mvc.{Action, Controller}

class NavigationController extends Controller {

  private case class SectionLinkAndEdition(link: SectionLink, edition: Edition)
  private case class NavItemAndEdition(link: NavItem, edition: Edition)

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

//  This is to editionlise the menu on AMP
  def renderAmpNav = Action { implicit request =>
    val edition = Edition(request)

    Cached(900) {
      JsonComponent(
        "items" -> JsArray(Seq(
          Json.obj(
            "topLevelSections" -> NewNavigation.topLevelSections.map( section =>
              Json.obj(
                "title" -> section.name,
                "subSections" -> section.getEditionalisedNavLinks(edition).map( subsection =>
                   JsObject(
                    Json.obj(
                      "title" -> subsection.title,
                      "url" -> LinkTo(subsection.url)
                    )
                    .fields
                    .filterNot { case (_, v) => v == JsNull }
                  )
                )
              )
            ),
            "secondarySections" -> NewNavigation.NavFooterLinks.getEditionalisedNavLinks(edition).map( section =>
              Json.obj(
                "title" -> section.title,
                "url" -> LinkTo(section.url)
              )
            )
          )
        ))
      )
    }
  }
}
