package dfp

import com.google.api.ads.admanager.axis.utils.v202208.StatementBuilder
import com.google.api.ads.admanager.axis.v202208.{CustomTargetingKey, CustomTargetingValue}
import common.GuLogging
import common.dfp.{GuCustomTargeting, GuCustomTargetingValue}
import concurrent.BlockingOperations

import scala.util.Try

class CustomTargetingAgent(val blockingOperations: BlockingOperations)
    extends DataAgent[Long, GuCustomTargeting]
    with GuLogging {

  def loadFreshData(): Try[Map[Long, GuCustomTargeting]] =
    Try {
      val maybeData = for (session <- SessionWrapper()) yield {

        val keys: Map[Long, CustomTargetingKey] =
          session.customTargetingKeys(new StatementBuilder()).map { key => key.getId.longValue -> key }.toMap

        val statementWithIds = new StatementBuilder()
          .where(s"customTargetingKeyId IN (${keys.keys.mkString(",")})")

        val valuesByKey: Map[Long, Seq[CustomTargetingValue]] =
          session.customTargetingValues(statementWithIds).groupBy { _.getCustomTargetingKeyId.longValue }

        valuesByKey flatMap {
          case (keyId: Long, values: Seq[CustomTargetingValue]) =>
            keys.get(keyId) map { key =>
              val guValues: Seq[GuCustomTargetingValue] = values map { value =>
                GuCustomTargetingValue(
                  id = value.getId.longValue,
                  name = value.getName,
                  displayName = value.getDisplayName,
                )
              }

              keyId -> GuCustomTargeting(
                keyId = keyId,
                name = key.getName,
                displayName = key.getDisplayName,
                values = guValues,
              )
            }
        }
      }

      maybeData getOrElse Map.empty
    }
}

class CustomTargetingService(customTargetingAgent: CustomTargetingAgent) {

  def targetingKey(session: SessionWrapper)(keyId: Long): String = {
    lazy val fallback = {
      val stmtBuilder = new StatementBuilder()
        .where("id = :keyId")
        .withBindVariableValue("keyId", keyId)
      session.customTargetingKeys(stmtBuilder).headOption.map(_.getName).getOrElse("unknown")
    }

    customTargetingAgent.get.data get keyId map (_.name) getOrElse fallback
  }

  def targetingValue(session: SessionWrapper)(keyId: Long, valueId: Long): String = {
    lazy val fallback = {
      val stmtBuilder = new StatementBuilder()
        .where("customTargetingKeyId = :keyId AND id = :valueId")
        .withBindVariableValue("keyId", keyId)
        .withBindVariableValue("valueId", valueId)
      session.customTargetingValues(stmtBuilder).headOption.map(_.getName).getOrElse("unknown")
    }

    customTargetingAgent.get.data get keyId flatMap { _.values.find(_.id == valueId) } map (_.name) getOrElse fallback
  }
}
