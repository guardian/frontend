package targeting

import common._
import com.gu.targeting.client.CampaignCache
import conf.Configuration
import scala.concurrent.Future
import conf.switches.Switches.Targeting

object CampaignAgent extends Logging with ExecutionContexts {
  private val agent = AkkaAgent[CampaignCache](CampaignCache(Nil, None))

  def refresh(): Future[Unit] = {
    if (Targeting.isSwitchedOn) {
      Configuration.targeting.campaignsUrl.map(url => {
        CampaignCache.fetch(url, 100, Some(Configuration.targeting.ruleLimit), Some(Configuration.targeting.tagLimit))
          .flatMap(agent.alter).map(_ => ())
      }).getOrElse(Future.failed(new BadConfigurationException("Campaigns URL not configured")))
    } else {
      Future.successful(())
    }
  }

  def getCampaignsForTags(tags: Seq[String]) = {
    if (Targeting.isSwitchedOn) {
      agent().getCampaignsForTags(tags)
    } else {
      Nil
    }
  }
}
