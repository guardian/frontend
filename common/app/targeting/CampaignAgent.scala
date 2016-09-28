package targeting

import common._
import com.gu.targeting.client.CampaignCache
import conf.Configuration
import scala.concurrent.Future
import conf.switches.Switches.Targeting

object CampaignAgent extends Logging with ExecutionContexts {
  private val agent = AkkaAgent[CampaignCache](CampaignCache(Nil, None))

  def refresh(): Future[Unit] = {
    // Total number of rules allowed per campaign, any campaigns with more than one rule will be filtered
    val ruleLimit: Int = 1

    // The combined number of tags allowed in the required and lacking fields of a rule.
    // Any campaigns with rules with too many tags will be filtered
    val tagLimit: Int = 20

    if (Targeting.isSwitchedOn) {
      Configuration.targeting.campaignsUrl.map(url => {
        CampaignCache.fetch(url, 100, Some(ruleLimit), Some(tagLimit))
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
