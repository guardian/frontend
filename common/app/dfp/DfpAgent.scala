package dfp

import common._
import conf.Configuration.commercial.dfpDataKey
import model.Content
import model.Section
import model.Tag
import play.api.Play.current
import play.api.libs.functional.syntax._
import play.api.libs.json.Json._
import play.api.libs.json.{JsSuccess, JsResult, JsValue, JsPath, Reads}
import play.api.{Play, Application, GlobalSettings}
import scala.Some
import scala.io.Codec.UTF8
import services.S3


object DfpAgent extends ExecutionContexts with Logging {

  private lazy val dfpDataAgent = AkkaAgent[Option[DfpData]](None)

  private def dfpData: Option[DfpData] = {
    if (Play.isTest) {
      Some(DfpData(Seq(LineItem(0, Nil))))
    } else {
      dfpDataAgent get()
    }
  }

  private def normalise(name: String) = name.toLowerCase.replace(" ", "-")

  def isSponsored(content: Content): Boolean = isSponsored(content.keywords)

  def isSponsored(section: Section): Boolean = isSponsored(section.webTitle)

  def isSponsored(keywords: Seq[Tag]): Boolean = keywords.exists(keyword => isSponsored(keyword.name))

  def isSponsored(keyword: String): Boolean = dfpData.fold(false)(_.isSponsored(normalise(keyword)))

  def refresh() {

    implicit val targetReads: Reads[Target] = (
      (JsPath \ "name").read[String] and
        (JsPath \ "op").read[String] and
        (JsPath \ "values").read[Seq[String]]
      )(Target.apply _)

    implicit val targetSetReads: Reads[TargetSet] = (
      (JsPath \ "op").read[String] and
        (JsPath \ "targets").read[Seq[Target]]
      )(TargetSet.apply _)

    implicit val lineItemReads: Reads[LineItem] = (
      (JsPath \ "id").read[Long] and
        (JsPath \ "targetSets").read[Seq[TargetSet]]
      )(LineItem.apply _)

    // See http://stackoverflow.com/questions/18625185/parsing-a-list-of-models-in-play-2-1-x
    implicit val reader = new Reads[DfpData] {
      def reads(js: JsValue): JsResult[DfpData] = {
        JsSuccess(DfpData((js \ "lineItems").as[Seq[LineItem]]))
      }
    }

    def fetchDfpData(): Option[DfpData] = {

      def logDataChanges(freshData: Option[DfpData]) {
        def minus(optData: Option[DfpData], optSubData: Option[DfpData]): Seq[LineItem] = {
          for {
            data <- optData
            subData <- optSubData
          } yield
            data.lineItems filterNot (subData.lineItems contains _)
        }.getOrElse(Nil)
        val removedLineItems = minus(dfpData, freshData)
        if (removedLineItems.nonEmpty) log.info(s"Removed DFP line items: $removedLineItems")
        val newLineItems = minus(freshData, dfpData)
        if (newLineItems.nonEmpty) log.info(s"New DFP line items loaded: $newLineItems")
      }

      val json = S3.get(dfpDataKey)(UTF8) map parse
      val freshData = json map (_.as[DfpData])

      logDataChanges(freshData)

      freshData
    }

    dfpDataAgent sendOff { oldData =>
      val freshData = fetchDfpData()
      if (freshData.exists(_.lineItems.nonEmpty)) {
        freshData
      } else oldData
    }
  }

  def stop() {
    dfpDataAgent close()
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
