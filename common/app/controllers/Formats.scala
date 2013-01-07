package controllers

import model._
import common._

import play.api.mvc.{ RequestHeader, Results }

trait Formats extends Paging with Results {

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
    val offsetTrails: Seq[Trail] = trails.drop(paging("actual-offset"))
    if (offsetTrails.size == 0) {
      NoContent
    } else {
      JsonComponent(
        request.getQueryString("callback"),
        "html" -> views.html.fragments.trailblocks.headline(offsetTrails, numItemsVisible = paging("page-size")),
        "hasMore" -> (offsetTrails.size > paging("page-size"))
      )
    }
  }

}
