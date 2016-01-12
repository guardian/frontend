package liveblog

object BodyBlocks {

  val PAGE_SIZE = 10

  def apply[B](blocks: Seq[B], page: Option[Int]): Option[BodyBlocks[B]] = {
    val (main, pages) = getPages(blocks)
    page match {
      case Some(pageNo) if pages.length == 0 => None
      case Some(pageNo) if pageNo > pages.length || pageNo <= 0 => None

      case Some(pageNo) => {
        val higherLater = if (pageNo + 1 < pages.length) PageNumber(pageNo + 1) else FirstPage
        val earlierLower = if (pageNo > 1) Some(pageNo - 1) else None
        Some(BodyBlocks(pages(pageNo - 1), later = higherLater, earlier = earlierLower))
      }

      case None => Some(BodyBlocks(main, later = NoPage, earlier = if(pages.nonEmpty) Some(pages.length) else None))
    }
  }

  // returns the pages, newest at the end, oldest at the start
  def getPages[B](blocks: Seq[B]) = {
    val length = blocks.size
    val remainder = length % PAGE_SIZE
    val (main, rest) = blocks.splitAt(remainder + PAGE_SIZE)
    (main, rest.grouped(PAGE_SIZE).toList.reverse)
  }

}

case class BodyBlocks[B](blocks: Seq[B], later: LaterPage, earlier: Option[Int])

sealed trait LaterPage {
  def suffix: Option[String]
}
case object NoPage extends LaterPage { val suffix = None }
case object FirstPage extends LaterPage { val suffix = Some("") }
case class PageNumber(page: Int) extends LaterPage { val suffix = Some(s"?page=$page") }
