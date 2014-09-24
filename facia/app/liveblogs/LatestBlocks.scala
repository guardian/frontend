package liveblogs

import common.{AutoRefresh, ExecutionContexts}
import common.editions.Uk
import conf.LiveContentApi
import scala.concurrent.duration._
import scala.language.postfixOps

object LatestBlocks extends AutoRefresh[BlocksResponse](0 seconds, 15 seconds) with ExecutionContexts {
  override def refresh() = {
    LiveContentApi
      .item("tone/minutebyminute", Uk)
      .showFields("body,liveBloggingNow")
      .pageSize(15)
      .showElements("")
      .showInlineElements("")
      .showTags("")
      .showReferences("")
      .showStoryPackage(false) map { response =>
      BlocksResponse.fromContent(response.results)
    }
  }
}
