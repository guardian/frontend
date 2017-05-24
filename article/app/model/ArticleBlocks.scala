package model

sealed trait BlockRange { def query: Option[Seq[String]] }

case object ArticleBlocks extends BlockRange {
  // we currently only use this for emails, we just want all the blocks
  val query = None
}

case object Canonical extends BlockRange {
  // sport pagesize is 30 so the first page could be 30+29 if it's one block away from splitting off a page
  // plus we need an extra one to be able to reference the second page if necessary making 30+29+1=60
  val firstPage = "body:latest:60"
  val oldestPage = "body:oldest:1"
  val timeline = "body:key-events"
  // this only makes sense for liveblogs at the moment, but article use field body not blocks anyway
  val query = Some(Seq(firstPage, oldestPage, timeline))
}

case class PageWithBlock(page: String) extends BlockRange {
  // just get them all, the caching should prevent too many requests, could use "around"
  val query = None
}

case class SinceBlockId(lastUpdate: String) extends BlockRange {
  val around = s"body:around:$lastUpdate:5"
  // more than 5 could come in (in one go), but unlikely and won't matter as it'll just fetch again soon
  val query = Some(Seq(around))
}
