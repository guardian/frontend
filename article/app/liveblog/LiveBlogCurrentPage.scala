package liveblog

import model.liveblog.BodyBlock

object LiveBlogCurrentPage {

  def apply(pageSize: Int, blocks: Seq[BodyBlock], isRequestedBlock: Option[String]): Option[LiveBlogCurrentPage] = {
    val (mainPageBlocks, restPagesBlocks) = getPages(pageSize, blocks)
    val newestPage = FirstPage(mainPageBlocks)
    val pages = newestPage :: restPagesBlocks
      .zipWithIndex
      .map { case (page, index) =>
        // page number is index + 2 to account for first page and 0 based index
        BlockPage(blocks = page, blockId = page.head.id, pageNumber = index + 2)
      }
    val oldestPage = pages.lastOption.getOrElse(newestPage)

    val endedPages = None :: (pages.map(Some.apply) :+ None)

    def hasRequestedBlock(page: LiveBlogCurrentPage): Boolean = {
      isRequestedBlock.map(isRequestedBlock => page.currentPage.blocks.exists(_.id == isRequestedBlock)).getOrElse(true)
    }


    endedPages.sliding(3).toList.zipWithIndex.map {
      case (List(newerPage, Some(currentPage), olderPage), index) =>
        val isNewestPage = newestPage.equals(currentPage)
        LiveBlogCurrentPage(
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

sealed trait PageReference {
  def blocks: Seq[BodyBlock]
  def suffix: String
  def pageNumber: Int
  def isArchivePage: Boolean
}

case class Pagination(
  newest: Option[PageReference],
  newer: Option[PageReference],
  oldest: Option[PageReference],
  older: Option[PageReference],
  numberOfPages: Int
)

case class LiveBlogCurrentPage(
  currentPage: PageReference,
  pagination: Option[Pagination]
)

case class FirstPage(blocks: Seq[BodyBlock]) extends PageReference {
  val suffix = ""
  val pageNumber = 1
  val isArchivePage = false
}
case class BlockPage(blocks: Seq[BodyBlock], blockId: String, pageNumber: Int) extends PageReference {
  val suffix = s"?page=with:block-$blockId"
  val isArchivePage = true
}
