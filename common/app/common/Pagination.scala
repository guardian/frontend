package common

case class Pagination(currentPage: Int, lastPage: Int, totalContent: Int) {

  val next: Option[Int] = if (lastPage > currentPage) Some(currentPage + 1) else None
  val previous: Option[Int] = if (currentPage > 1) Some(currentPage -1) else None
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
    def distanceFromCenter(i: Seq[Int]) = math.abs(1 - i.indexOf(currentPage))
    val lowerBoundry = math.max(currentPage - 3, 1)
    val upperBoundry = math.min(lastPage + 1, currentPage + 4)


    if (currentPage <= 3) 1 to 4
    else if (currentPage >= lastPage - 2) (currentPage - 3 to lastPage).takeRight(4)
    else Range(lowerBoundry, upperBoundry)
      .sliding(3)
      .toSeq
      .sortBy(distanceFromCenter).head
  }
}
