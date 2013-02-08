package controllers

import model._
import common._
import play.api.mvc.{ RequestHeader, Results }
import play.api.templates.Html

trait JsonTrails extends Paging with Results {

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

      // option to use 'link' view mainly used for top-stories tab view
      val html: Html = if (request.getQueryString("view").getOrElse("") == "link") {
        views.html.fragments.trailblocks.link(offsetTrails, numItemsVisible = paging("page-size"))
      } else {
        views.html.fragments.trailblocks.headline(offsetTrails, numItemsVisible = paging("page-size"))
      }

      JsonComponent(
        request.getQueryString("callback"),
        "html" -> html,
        "hasMore" -> (offsetTrails.size > paging("page-size"))
      )
    }
  }

}
