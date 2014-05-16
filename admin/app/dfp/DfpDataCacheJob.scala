package dfp

import common.ExecutionContexts
import play.api.libs.json.Json._
import scala.concurrent.future
import play.api.libs.json._
import tools.Store

object DfpDataCacheJob extends ExecutionContexts {

  private implicit val targetWrites = new Writes[Target] {
    def writes(target: Target) = Json.obj(
      "name" -> target.name,
      "op" -> target.op,
      "values" -> target.values
    )
  }

  private implicit val targetSetWrites = new Writes[TargetSet] {
    def writes(targetSet: TargetSet) = Json.obj(
      "op" -> targetSet.op,
      "targets" -> targetSet.targets
    )
  }

  private implicit val lineItemWrites = new Writes[LineItem] {
    def writes(lineItem: LineItem) = Json.obj(
      "id" -> lineItem.id,
      "targetSets" -> lineItem.targetSets
    )
  }

  private implicit val dfpDataWrites = new Writes[DfpData] {
    def writes(data: DfpData) = Json.obj("lineItems" -> data.lineItems)
  }

  def run() {
    future {
      val lineItems = DfpApi.fetchCurrentLineItems()
      if (lineItems.nonEmpty) {
        val dfpData = DfpData(lineItems)
        Store.putDfpData(stringify(toJson(dfpData)))
      }
    }
  }
}
