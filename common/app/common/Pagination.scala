package common

case class Pagination(currentPage: Int, lastPage: Int, pageSize: Int = 20) {

  val next: Option[Int] = if (lastPage > currentPage) Some(currentPage + 1) else None
  val previous: Option[Int] = if (currentPage > 1) Some(currentPage -1) else None

  val totalContent: Int = lastPage * pageSize

  /**
   * Returns the next/prev 5 navigation pages with the current page as close to the center as possible.
   * e.g.
   * if the current page is 6 then 4,5,6,7,8
   * if the current page is 1 then 1,2,3,4,5
   * if the current page is 10 (and it is the last page) 6,7,8,9,10
   */
  lazy val pages: Seq[Int] = {
    def distanceFromCenter(i: Seq[Int]) = math.abs(2 - i.indexOf(currentPage))
    val lowerBoundry = math.max(currentPage - 4, 1)
    val upperBoundry = math.min(lastPage + 1, currentPage + 5)

    Range(lowerBoundry, upperBoundry)
      .sliding(5)
      .toSeq
      .sortBy(distanceFromCenter).head
  }
}
