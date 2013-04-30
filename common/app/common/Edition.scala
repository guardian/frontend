package common

import play.api.mvc.RequestHeader

object Edition {

  /*
  TODO For a while we need to live with both Multi domain sites and single domain sites
  this abstracts away getting the edition for those. Later we will simplify this
   */
  def apply(request: RequestHeader): String = {

    val editionFromParameter = request.getQueryString("_edition").map(_.toUpperCase)
    val editionFromHeader = request.headers.get("X-Gu-Edition").map(_.toUpperCase)
    val editionFromSite = Site(request).edition

    editionFromParameter.orElse(editionFromHeader).getOrElse(editionFromSite)
  }
}
