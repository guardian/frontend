package dfp

import com.google.api.ads.dfp.axis.utils.v201705.StatementBuilder
import com.google.api.ads.dfp.axis.v201705.{CustomTargetingValue, CustomTargetingKey}
import play.api.libs.json._
import tools.Store

import scala.concurrent.Future

case class GuCustomTargetingKey(
  id: Long,
  name: String,
  displayName: String,
  values: Seq[GuCustomTargetingValue]
) {
  val readableValues: Seq[GuCustomTargetingValue] = values.filter( _.displayName.nonEmpty)
}

case class GuCustomTargetingValue(
  id: Long,
  name: String,
  displayName: String
)

object GuCustomTargetingValue {
  implicit val format = Json.format[GuCustomTargetingValue]
}

object GuCustomTargetingKey {
  implicit val format = Json.format[GuCustomTargetingKey]
}

// This object is run by the commercial lifecycle and writes a json S3 file that stores
// key value mappings. In contrast, the CustomTargetingKeyAgent and CustomTargetingValueAgent
// objects are used to resolve key/value ids to string names.
object CustomTargetingKeyValueJob {

  def run(): Future[Unit] = Future {
    for (session <- SessionWrapper()) yield {

      val keys: Map[Long, CustomTargetingKey] = session.customTargetingKeys(
        new StatementBuilder()).map { k => k.getId.longValue() -> k}.toMap

      val values: Map[Long, Seq[CustomTargetingValue]] = session.customTargetingValues(
        new StatementBuilder()).groupBy { _.getCustomTargetingKeyId.longValue() }

      val customTargeting: Seq[GuCustomTargetingKey] = values.toSeq.flatMap {
        case ((keyId, targetingValues)) =>
          keys.get(keyId).map( (dfpKey: CustomTargetingKey) => {
            val guTargetingValues = targetingValues.map { dfpValue =>
              GuCustomTargetingValue(
                id = dfpValue.getId.longValue,
                name = dfpValue.getName,
                displayName = dfpValue.getDisplayName)
            }
            GuCustomTargetingKey(
              id = dfpKey.getId.longValue,
              name = dfpKey.getName,
              displayName = dfpKey.getDisplayName,
              values = guTargetingValues
            )
          })
      }

      Store.putDfpCustomTargetingKeyValues(Json.stringify(Json.toJson(customTargeting)))
    }

  }
}
