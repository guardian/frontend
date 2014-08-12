package controllers

import common.{SectionLink, NavItem, Edition}
import model.Cached
import play.api.libs.json.Json._
import play.api.libs.json.Writes
import play.api.mvc.{Action, Controller}

object NavigationController extends Controller {

  private implicit val sectionLinkWrites = new Writes[SectionLink] {
    def writes(item: SectionLink) = obj(
      "title" -> item.title,
      "href" -> item.href
    )
  }

  private implicit val navItemWrites = new Writes[NavItem] {
    def writes(item: NavItem) = obj(
      "section" -> item.name,
      "subSections" -> item.links
    )
  }

  def nav() = Action{ Cached(500)(
      Ok(arr(Edition.all.map{ edition => obj(edition.id -> arr(edition.navigation))}))
  )}
}
