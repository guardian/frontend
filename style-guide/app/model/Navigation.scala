package styleguide

import common.GuardianConfiguration
import play.api.mvc.RequestHeader

case class SectionLink(id: String, linkName: String, href: String)

object Navigation {

  private val sections = Seq(
    SectionLink("home", "Home", "/style-guide"),
    SectionLink("zones", "Zones", "/style-guide/zones"),
    SectionLink("typography", "Typography", "/style-guide/typography"),
    //SectionLink("grid", "Grid", "/style-guide/grid"),
    SectionLink("helpers", "CSS helpers", "/style-guide/csshelpers"),
    SectionLink("modules", "Modules", "/style-guide/modules"),
    SectionLink("coding-standards", "Coding standards", "/style-guide/codingstandards"),
    SectionLink("sprites", "CSS sprites", "/style-guide/sprites")
  )

  def apply(request: RequestHeader, config: GuardianConfiguration) = {
    sections
  }
}