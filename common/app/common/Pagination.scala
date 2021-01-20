package common

import play.api.libs.json.{Json, Writes}

case class Pagination(currentPage: Int, lastPage: Int, totalContent: Int) {

  val next: Option[Int] = if (lastPage > currentPage) Some(currentPage + 1) else None
  val previous: Option[Int] = if (currentPage > 1) Some(currentPage - 1) else None
  val isFirstPage: Boolean = currentPage == 1

  /**
    * Returns the next/prev 3 navigation pages with the current page as close to the center as possible.
    * For first and last 4 pages it shows 4 pages.
    *
   * For 10 pages:
    * Page 1-3:  1 2 3 4
    * Page 8-10: 7 8 9 10
    * Page 4-7:  4 5 6
    */
  lazy val pages: Seq[Int] = {
    def distanceFromCenter(i: Seq[Int]) = math.abs(2 - getOffset - i.indexOf(currentPage))
    val lowerBoundry = math.max(currentPage - 4 + getOffset, 1)
    val upperBoundry = math.min(lastPage + 1, currentPage + 5 - getOffset)

    /**
      * Make sure that edge cases are handled.
      *
     * If we have only 5 or less pages we want to show whole range.
      * Example:
      *
     * 1 2 3 for 3 pages
      * 1 2 3 4 5 for 5 pages
      *
     * If we have 5+ pages we want to show only 4 pages on the edges
      * Example:
      *
     * 1 2 3 4 ... 10 if we are on the one of the first 3 pages
      * 1 ... 7 8 9 10 if we are on the one of the last 3 pages
      * 1 ... 4 5 6 ... 10 if we are somewhere in between
      */
    if (currentPage <= 3 && lastPage > 5) 1 to 4
    else if (currentPage >= lastPage - 2 && lastPage > 5) (currentPage - 3 to lastPage).takeRight(4)
    else
      Range(lowerBoundry, upperBoundry)
        .sliding(5 - (getOffset * 2))
        .toSeq
        .sortBy(distanceFromCenter)
        .head
  }

  /**
    * In the case of having just 5 or less pages we want range to be 1-5
    * In the case of having 5+ pages we want range to be 1-3
    *
   * This function is returning proper offset to use in page range calculation above
    */
  def getOffset: Int = {
    if (lastPage > 5) 1 else 0
  }
}

object Pagination {
  implicit val paginationWrites: Writes[Pagination] = Json.writes[Pagination]
}
