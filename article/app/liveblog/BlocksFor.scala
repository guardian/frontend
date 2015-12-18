package liveblog

import model.Content.BodyBlocks


object BlocksFor {

  def apply(blocks: Seq[BodyBlocks], page: Option[Int]): Option[BlocksFor] = {
    page match {
      case Some(pageNo) => None
      case None => Some(BlocksFor(blocks, 1))//TODO use page to produce different blocks
    }
  }

}

case class BlocksFor(blocks: Seq[BodyBlocks], pageNo: Int)// TODO prev/next
