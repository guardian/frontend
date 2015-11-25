package dfp

import com.google.api.ads.dfp.axis.utils.v201508.StatementBuilder

import scala.util.Try

object PlacementAgent extends DataAgent[Long, Seq[String]] {

  override def loadFreshData() = Try {
    DfpServiceRegistry().fold(Map[Long, Seq[String]]()) { serviceRegistry =>
      val session = new SessionWrapper(serviceRegistry.session)
      val placements = session.placements(new StatementBuilder())
      placements.map { placement =>
        placement.getId.toLong -> placement.getTargetedAdUnitIds.toSeq
      }.toMap
    }
  }

}
