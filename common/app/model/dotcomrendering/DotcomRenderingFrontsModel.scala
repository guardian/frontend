package model.dotcomrendering

import common.Edition
import model.PressedPage
import navigation.Nav
import play.api.libs.json.Json
import play.api.mvc.RequestHeader

case class DotcomRenderingFrontsModel(
    pressedPage: PressedPage,
    nav: Nav,
    editionId: String,
)

object DotcomRenderingFrontsModel {
  implicit val writes = Json.writes[DotcomRenderingFrontsModel]

  def apply(page: PressedPage, request: RequestHeader): DotcomRenderingFrontsModel = {
    val edition = Edition.edition(request)
    val nav = Nav(page, edition)

    DotcomRenderingFrontsModel(pressedPage = page, nav = nav, editionId = edition.id)
  }
}
