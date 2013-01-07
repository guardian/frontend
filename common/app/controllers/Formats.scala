package controllers

import model._
import common._
import play.api.mvc.{ RequestHeader, Results }

trait Formats extends Paging {

  /*
   * Key/value of paging param name to default value
   */
  def validFormats: Seq[String]

  /**
   * Confirm it's a valid format
   */
  protected def checkFormat(format: String): Option[String] = {
    validFormats.find(_ == format)
  }

  /**
   * Render the trails as json
   */
  protected def renderJsonTrails(trails: Seq[Trail])(implicit request: RequestHeader) = {
    // pull out the paging params
    val paging = extractPaging(request)
    // offest the trails
    val trails: Seq[Trail] = trails.drop(paging("actual-offset"))
    if (trails.size == 0) {
      NoContent
    } else {
      JsonComponent(
        request.getQueryString("callback"),
        "html" -> views.html.fragments.trailblocks.headline(trails, numItemsVisible = paging("page-size")),
        "hasMore" -> (trails.size > paging("page-size"))
      )
    }
  }

}
