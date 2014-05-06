package dfp

import common.{AkkaAsync, Jobs, ExecutionContexts, AkkaAgent}
import conf.Configuration.commercial.dfpDataKey
import model.{Tag, Content}
import play.api.libs.json.Json._
import play.api.{Application, GlobalSettings}
import scala.io.Codec.UTF8
import services.S3

object DfpAgent extends ExecutionContexts {

  private lazy val targetedKeywordsAgent = AkkaAgent[Seq[String]](Nil)

  def targetedKeywords: Seq[String] = targetedKeywordsAgent get()

  def normalise(name: String) = name.toLowerCase.replace(" ", "-")

  def isSponsored(content: Content): Boolean = isSponsored(content.keywords)

  def isSponsored(tags: Seq[Tag]): Boolean = {
    val normalisedTags = tags.map(_.name.toLowerCase.replace(" ", "-"))
    (normalisedTags intersect targetedKeywords).nonEmpty
  }

  def refresh() {
    def fetchTargetedKeywords() = {
      val json = S3.get(dfpDataKey)(UTF8) map parse
      json map (_.as[Seq[String]]) getOrElse Nil
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
