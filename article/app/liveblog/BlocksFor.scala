package liveblog

import model.liveblog.BodyBlock

object BlocksFor {

  def apply(blocks: Seq[BodyBlock], page: Option[Int]): Option[BlocksFor] = {
    page match {
      case Some(pageNo) => None
      case None => Some(BlocksFor(blocks, 1))//TODO use page to produce different blocks
    }
  }

}

case class BlocksFor(blocks: Seq[BodyBlock], pageNo: Int)// TODO prev/next
