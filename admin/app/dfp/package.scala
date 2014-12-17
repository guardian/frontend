import common.ExecutionContexts
import org.joda.time.format.DateTimeFormat
import org.joda.time.{DateTime, DateTimeZone}

package object dfp extends ExecutionContexts {

  def printLondonTime(timestamp: DateTime): String = DateTimeFormat.longDateTime().withZone(DateTimeZone.forID("Europe/London")).print(timestamp)

  def refreshAllDfpData() {
    for {
      _ <- AdUnitAgent.refresh()
      _ <- CustomFieldAgent.refresh()
      _ <- CustomTargetingKeyAgent.refresh()
      _ <- CustomTargetingValueAgent.refresh()
      _ <- PlacementAgent.refresh()
    } {
      DfpDataCacheJob.run()
    }
  }
}
