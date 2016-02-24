package liveblog

object LiveBlogPageModel {

  def apply[B](pageSize: Int, blocks: Seq[B])(isRequestedBlock: Option[B => Boolean], id: B => String): Option[LiveBlogPageModel[_ <: B]] = {
    val (mainPage, restPages) = getPages(pageSize, blocks)
    val noPage = BlockInfo(Nil/*ignored*/, NoPage)
    val pages = BlockInfo(mainPage, FirstPage) :: restPages.map(page => BlockInfo(page, BlockPage(id(page.head))))
    val endedPages = noPage :: (pages :+ noPage)

    def hasRequestedBlock(page: LiveBlogPageModel[_ <: B]): Boolean = {
      page.blocks.exists(isRequestedBlock.getOrElse(_ => true))
    }

    endedPages.sliding(3).toList.zipWithIndex.map {
      case (List(newer, curr, older), index) =>
        LiveBlogPageModel(
          blocks = curr.page,
          main = blocks,
          newer = newer.self,
          older = older.self,
          canonical = curr.self,
          pageNumber = index + 1,
          pagesLength = pages.length,
          newest = pages.headOption.getOrElse(noPage).self,
          oldest = pages.lastOption.getOrElse(noPage).self
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

case class BlockInfo[B](page: Seq[B], self: PageReference)

case class LiveBlogPageModel[+B](
  blocks: Seq[B],
  main: Seq[B] /*for key events - TODO remove*/ ,
  newer: PageReference,
  older: PageReference,
  canonical: PageReference,
  pageNumber: Int,
  pagesLength: Int,
  newest: PageReference,
  oldest: PageReference
)

sealed trait PageReference {
  def suffix: Option[String]
}
case object NoPage extends PageReference { val suffix = None }
case object FirstPage extends PageReference { val suffix = Some("") }
case class BlockPage(blockId: String) extends PageReference { val suffix = Some(s"?page=with:block-$blockId#block-$blockId") }
