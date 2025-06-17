package dfp

import com.google.api.ads.admanager.axis.utils.v202502.StatementBuilder
import common.dfp.GuAdUnit
import concurrent.BlockingOperations

import scala.util.Try

class PlacementAgent(val blockingOperations: BlockingOperations) extends DataAgent[Long, Seq[String]] {

  override def loadFreshData(): Try[Map[Long, Seq[String]]] =
    Try {
      val maybeData = for (session <- SessionWrapper()) yield {
        val placements = session.placements(new StatementBuilder())
        placements.map { placement =>
          placement.getId.toLong -> placement.getTargetedAdUnitIds.toSeq
        }.toMap
      }
      maybeData getOrElse Map.empty
    }
}

class PlacementService(placementAgent: PlacementAgent, adUnitService: AdUnitService) {

  def placementAdUnitIds(session: SessionWrapper)(placementId: Long): Seq[GuAdUnit] = {
    lazy val fallback = {
      val stmtBuilder = new StatementBuilder().where("id = :id").withBindVariableValue("id", placementId)
      session.placements(stmtBuilder) flatMap (_.getTargetedAdUnitIds.toSeq)
    }
    val adUnitIds = placementAgent.get.data getOrElse (placementId, fallback)
    adUnitIds.flatMap(adUnitService.activeAdUnit)
  }

}
