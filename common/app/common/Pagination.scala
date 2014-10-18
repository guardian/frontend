package common

case class Pagination(currentPage: Int, lastPage: Int, totalContent: Int) {

  val next: Option[Int] = if (lastPage > currentPage) Some(currentPage + 1) else None
  val previous: Option[Int] = if (currentPage > 1) Some(currentPage -1) else None
  val isFirstPage: Boolean = currentPage == 1
  val isLastPage: Boolean = currentPage == totalContent

  /**
   * Returns the next/prev 5 navigation pages with the current page as close to the center as possible.
   * e.g.
   * if the current page is 6 then 4,5,6,7,8
   * if the current page is 1 then 1,2,3,4,5
   * if the current page is 10 (and it is the last page) 6,7,8,9,10
   */
  lazy val pages: Seq[Int] = {
    def distanceFromCenter(i: Seq[Int]) = math.abs((2 - (getOffset - 1)) - i.indexOf(currentPage))
    val lowerBoundry = math.max(currentPage - 4 - getOffset, 1)
    val upperBoundry = math.min(lastPage + 1, currentPage + 5 - getOffset)

    println(totalContent, getOffset, currentPage)

    Range(lowerBoundry, upperBoundry)
      .sliding(5 - getOffset)
      .toSeq
      .sortBy(distanceFromCenter).head
  }

  def getOffset: Int =
    if (totalContent > 5) {
      if (isFirstPage || currentPage < 4) 1
      else if (isLastPage || currentPage > totalContent - 3) 1
        else 2
    } else 0
}
