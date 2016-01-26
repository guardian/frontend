package liveblog

object LiveBlogPageModel {

  def apply[B](pageSize: Int, extrasOnFirstPage: Int, blocks: Seq[B])(isRequestedBlock: Option[B => Boolean], id: B => String): Option[LiveBlogPageModel[_ <: B]] = {
    val (main, pages) = getPages(pageSize, extrasOnFirstPage, blocks)
    val noPage = BlockInfo(Nil/*ignored*/, NoPage)
    val endedPages = noPage :: BlockInfo(main, FirstPage) :: (pages.map(page => BlockInfo(page, BlockPage(id(page.head)))) :+ noPage)

    def hasRequestedBlock(page: LiveBlogPageModel[_ <: B]): Boolean = {
      page.blocks.exists(isRequestedBlock.getOrElse(_ => true))
    }

    endedPages.sliding(3).toList.map {
      case List(later, curr, earlier) =>
        LiveBlogPageModel(curr.page, main, later.self, earlier.self, curr.self)
    }.find(hasRequestedBlock)
  }

  // returns the pages, newest at the end, newest at the start
  def getPages[B](pageSize: Int, extrasOnFirstPage: Int, blocks: Seq[B]): (Seq[B], List[Seq[B]]) = {
    val length = blocks.size
    val remainder = extrasOnFirstPage + (length % pageSize)
    val (main, rest) = blocks.splitAt(remainder + pageSize)
    (main, rest.grouped(pageSize).toList)
  }

}

case class BlockInfo[B](page: Seq[B], self: PageReference)

case class LiveBlogPageModel[+B](blocks: Seq[B], main: Seq[B]/*for key events - TODO remove*/, later: PageReference, earlier: PageReference, canonical: PageReference)

sealed trait PageReference {
  def suffix: Option[String]
}
case object NoPage extends PageReference { val suffix = None }
case object FirstPage extends PageReference { val suffix = Some("") }
case class BlockPage(blockId: String) extends PageReference { val suffix = Some(s"?page=with:block-$blockId") }
