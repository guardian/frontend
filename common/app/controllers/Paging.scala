package controllers

import play.api.mvc.RequestHeader

trait Paging extends implicits.Numbers {

  /*
   * Key/value of paging param name to default value
   */
  private val pagingParams: Map[String, Int] = Map(
    "offset" -> 0,
    "page" -> 1,
    "page-size" -> 5,
  )

  /**
    * Pull out 'paging' query string params
    */
  protected def extractPaging(request: RequestHeader): Map[String, Int] = {
    val paging = pagingParams.map {
      case (name, default) =>
        try {
          (name, request.getQueryString(name).map(_.toInt).getOrElse(default))
        } catch {
          case _: NumberFormatException => (name, default)
        }
    }
    // also compute actual offset, i.e. offset plus current page position
    val actualOffset = paging("offset") + (paging("page-size") * (paging("page") - 1))
    paging + ("actual-offset" -> actualOffset)
  }

  protected def inferPage(request: RequestHeader): Int =
    request
      .getQueryString("page")
      .filter(_.isInt)
      .map(_.toInt)
      .getOrElse(1)

}
