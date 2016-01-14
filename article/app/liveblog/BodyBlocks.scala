package liveblog

import model.liveblog.BodyBlock

object BodyBlocks {

  def apply(blocks: Seq[BodyBlock], page: Option[Int]): Option[BodyBlocks] = {
    page match {
      case Some(pageNo) => None
      case None => Some(BodyBlocks(blocks, 1))//TODO use page to produce different blocks
    }
  }

}

case class BodyBlocks(blocks: Seq[BodyBlock], pageNo: Int)// TODO prev/next
