package dfp

import com.google.api.ads.dfp.axis.utils.v201705.StatementBuilder
import common.dfp.GuAdUnit

import scala.util.Try

object PlacementAgent extends DataAgent[Long, Seq[String]] {

  override def loadFreshData() = Try {
    val maybeData = for (session <- SessionWrapper()) yield {
      val placements = session.placements(new StatementBuilder())
      placements.map { placement =>
        placement.getId.toLong -> placement.getTargetedAdUnitIds.toSeq
      }.toMap
    }
    maybeData getOrElse Map.empty
  }
}

object PlacementService {

  def placementAdUnitIds(session: SessionWrapper)(placementId: Long): Seq[GuAdUnit] = {
    lazy val fallback = {
      val stmtBuilder = new StatementBuilder().where("id = :id").withBindVariableValue("id", placementId)
      session.placements(stmtBuilder) flatMap (_.getTargetedAdUnitIds.toSeq)
    }
    val adUnitIds = PlacementAgent.get.data getOrElse(placementId, fallback)
    adUnitIds.flatMap(AdUnitService.activeAdUnit)
  }

}
