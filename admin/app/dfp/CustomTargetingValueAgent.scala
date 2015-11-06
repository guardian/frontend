package dfp

import com.google.api.ads.dfp.axis.utils.v201508.StatementBuilder
import common.Logging
import org.joda.time.DateTime

import scala.util.Try

object CustomTargetingValueAgent extends DataAgent[Long, String] with Logging {

  private def targetingValues(stmtBuilder: StatementBuilder): Try[Map[Long, String]] = Try {
    val targetValues = DfpServiceRegistry().fold(Map[Long, String]()) { serviceRegistry =>
      val values = DfpApiWrapper.fetchCustomTargetingValues(serviceRegistry, stmtBuilder)
      values.map { v => v.getId.longValue() -> v.getName }.toMap
    }

    log.info(s"Fetched ${targetValues.size} targeting values: $targetValues")

    targetValues
  }

  override def loadFreshData: Try[Map[Long, String]] = {
    log.info(s"Fetching all targeting values ...")
    targetingValues(new StatementBuilder())
  }

  override def dataModifiedSince(threshold: DateTime): Try[Map[Long, String]] = {
    log.info(s"Fetching targeting values modified since $threshold ...")

    targetingValues(
      new StatementBuilder()
        .where("lastModifiedDateTime > :threshold")
        .withBindVariableValue("threshold", threshold.getMillis)
    )
  }
}
