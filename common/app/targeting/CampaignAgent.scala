package targeting

import common._
import com.gu.targeting.client.CampaignCache
import conf.Configuration
import scala.util.control.NonFatal
import scala.concurrent.Future
import conf.switches.Switches.Targeting

object CampaignAgent extends Logging with ExecutionContexts {
  private val agent = AkkaAgent[CampaignCache](CampaignCache(Nil, None))

  def refresh(): Future[Unit] = {
    if (Targeting.isSwitchedOn) {
      Configuration.targeting.campaignsUrl.map(url => {
        CampaignCache.fetch(url, limit = 100).flatMap(agent.alter).map(_ => ())
      }).getOrElse(Future.failed(new BadConfigurationException("Campaigns URL not configured")))
    } else {
      Future.successful(())
    }
  }

  def getCampaignsForTags(tags: Seq[String]) = {
    if (Targeting.isSwitchedOn) {
      try {
        agent().getCampaignsForTags(tags)
      } catch {
        case NonFatal(e) =>
          log.error("Failed to get campaigns for tags.", e)
          List()
      }
    } else {
      Nil
    }
  }
}
