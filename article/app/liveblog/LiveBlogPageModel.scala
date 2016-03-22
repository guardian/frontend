package liveblog

object LiveBlogPageModel {

  def apply[B](pageSize: Int, blocks: Seq[B])(isRequestedBlock: Option[B => Boolean], id: B => String): Option[LiveBlogPageModel[B]] = {
    val (mainPageBlocks, restPagesBlocks) = getPages(pageSize, blocks)
    val newestPage = FirstPage(mainPageBlocks)
    val pages = newestPage :: restPagesBlocks
      .zipWithIndex
      .map { case (page, index) =>
        // page number is index + 2 to account for first page and 0 based index
        BlockPage(blocks = page, blockId = id(page.head), pageNumber = index + 2)
      }
    val oldestPage = pages.lastOption.getOrElse(newestPage)

    val endedPages = None :: (pages.map(Some.apply) :+ None)

    def hasRequestedBlock(page: LiveBlogPageModel[B]): Boolean = {
      page.currentPage.blocks.exists(isRequestedBlock.getOrElse(_ => true))
    }


    endedPages.sliding(3).toList.zipWithIndex.map {
      case (List(newerPage, Some(currentPage), olderPage), index) =>
        val isNewestPage = newestPage.equals(currentPage)
        LiveBlogPageModel(
          allBlocks = blocks,
          currentPage = currentPage,
          pagination = if (pages.length > 1) Some(Pagination(
            newest = if (isNewestPage) None else Some(newestPage),
            newer = newerPage,
            oldest = if (oldestPage.equals(currentPage)) None else Some(oldestPage),
            older = olderPage,
            numberOfPages = pages.length
          )) else None
        )
    }.find(hasRequestedBlock)
  }

  // returns the pages, newest at the end, newest at the start
  def getPages[B](pageSize: Int, blocks: Seq[B]): (Seq[B], List[Seq[B]]) = {
    val length = blocks.size
    val remainder = length % pageSize
    val (main, rest) = blocks.splitAt(remainder + pageSize)
    (main, rest.grouped(pageSize).toList)
  }

}

sealed trait PageReference[B] {
  def blocks: Seq[B]
  def suffix: String
  def pageNumber: Int
  def isArchivePage: Boolean
}

case class Pagination[B](
  newest: Option[PageReference[B]],
  newer: Option[PageReference[B]],
  oldest: Option[PageReference[B]],
  older: Option[PageReference[B]],
  numberOfPages: Int
)

case class LiveBlogPageModel[B](
  allBlocks: Seq[B] /*for key events - TODO remove*/ ,
  currentPage: PageReference[B],
  pagination: Option[Pagination[B]]
)

case class FirstPage[B](blocks: Seq[B]) extends PageReference[B] {
  val suffix = ""
  val pageNumber = 1
  val isArchivePage = false
}
case class BlockPage[B](blocks: Seq[B], blockId: String, pageNumber: Int) extends PageReference[B] {
  val suffix = s"?page=with:block-$blockId"
  val isArchivePage = true
}
