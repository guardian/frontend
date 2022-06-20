package model

sealed trait BlockRange { def query: Option[Seq[String]] }

case object ArticleBlocks extends BlockRange {
  // we currently only use this for emails, we just want all the blocks
  val query = None
}

case object CanonicalLiveBlog extends BlockRange {
  // sport pagesize is 30 so the first page could be 30+29 if it's one block away from splitting off a page
  // plus we need an extra one to be able to reference the second page if necessary making 30+29+1=60
  val mainBlock = "main"
  val firstPage = "body:latest:60"
  val oldestPage = "body:oldest:1"
  val timeline = "body:key-events"
  val summary = "body:summary"
  val pinned = "body:pinned"
  val query = Some(Seq(mainBlock, firstPage, oldestPage, timeline, summary, pinned))
}

case object AutomaticFilterLiveBlog extends BlockRange {
  val mainBlock = "main"
  val oldestPage = "body:oldest:1"
  val timeline = "body:key-events"
  val summary = "body:summary"
  val pinned = "body:pinned"
  val body = "body" // supports Dotcom Rendering model which currently requires field body
  val query = Some(Seq(mainBlock, oldestPage, timeline, summary, pinned, body))
}

// Created to handle ArticleController (for preview) specifically, where we may render an
// article or a liveblog (that doesn't get caught by the liveblog specific routes, which may
// or may not actually happen in the wild) so we request both specific blocks and the whole body
case object GenericFallback extends BlockRange {
  val mainBlock = "main"
  val firstPage = "body:latest:60"
  val oldestPage = "body:oldest:1"
  val timeline = "body:key-events"
  val summary = "body:summary"
  val pinned = "body:pinned"
  val body = "body" // supports Dotcom Rendering model which currently requires field body
  val query = Some(Seq(mainBlock, firstPage, oldestPage, timeline, summary, pinned, body))
}

case class PageWithBlock(page: String) extends BlockRange {
  // just get them all, the caching should prevent too many requests, could use "around"
  val query = None
}

case class SinceBlockId(lastUpdate: String) extends BlockRange {
  val mainBlock = "main"
  val around = s"body:around:$lastUpdate:5"
  // more than 5 could come in (in one go), but unlikely and won't matter as it'll just fetch again soon
  val query = Some(Seq(mainBlock, around))
}
