package dfp

import common._
import conf.Configuration.commercial.dfpDataKey
import model.Content
import play.api.Play.current
import play.api.libs.json.Json._
import play.api.{Play, Application, GlobalSettings}
import scala.io.Codec.UTF8
import services.S3

object DfpAgent extends ExecutionContexts with Logging {

  private lazy val targetedKeywordsAgent = AkkaAgent[Seq[String]](Nil)

  def targetedKeywords: Seq[String] = {
    if (Play.isTest) {
      Seq("live-better")
    } else {
      targetedKeywordsAgent get()
    }
  }

  def isSponsored(content: Content) = false

  def refresh() {
    def fetchTargetedKeywords() = {
      val json = S3.get(dfpDataKey)(UTF8) map parse
      val currKeywords = json map (_.as[Seq[String]]) getOrElse Nil

      val removedKeywords = targetedKeywords filterNot (currKeywords.contains(_))
      if (removedKeywords.nonEmpty) log.info(s"Removed DFP keywords: $removedKeywords")
      val newKeywords = currKeywords filterNot (targetedKeywords.contains(_))
      if (newKeywords.nonEmpty) log.info(s"New DFP keywords loaded: $newKeywords")

      currKeywords
    }

    targetedKeywordsAgent sendOff (current => fetchTargetedKeywords())
  }

  def stop() {
    targetedKeywordsAgent close()
  }
}


trait DfpAgentLifecycle extends GlobalSettings {

  override def onStart(app: Application) {
    super.onStart(app)

    Jobs.deschedule("DfpDataRefreshJob")
    Jobs.schedule("DfpDataRefreshJob", "0 6/30 * * * ?") {
      DfpAgent.refresh()
    }

    AkkaAsync {
      DfpAgent.refresh()
    }
  }

  override def onStop(app: Application) {
    Jobs.deschedule("DfpDataRefreshJob")
    DfpAgent.stop()

    super.onStop(app)
  }
}
