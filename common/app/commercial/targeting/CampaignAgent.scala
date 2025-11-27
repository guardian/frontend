package commercial.targeting

import common._
import com.gu.targeting.client.{Campaign, CampaignCache}
import conf.Configuration

import scala.concurrent.{ExecutionContext, Future}
import conf.switches.Switches.Targeting

object CampaignAgent extends GuLogging {
  private val agent = Box[CampaignCache](CampaignCache(Nil, None))

  def refresh()(implicit executionContext: ExecutionContext): Future[Unit] = {
    // The maximum number of campaigns which will be fetched. If there are too many campaigns additional campaigns will be truncated.
    // Which campaigns make it through is undefined
    val campaignLimit = 300

    // Total number of rules allowed per campaign, any campaigns with more than one rule will be filtered
    val ruleLimit = 1

    // The combined number of tags allowed in the required and lacking fields of a rule.
    // Any campaigns with rules with too many tags will be filtered
    val tagLimit = 20

    if (Targeting.isSwitchedOn) {
      Configuration.targeting.campaignsUrl
        .map(url => {
          CampaignCache
            .fetch(url, campaignLimit, Some(ruleLimit), Some(tagLimit))
            .flatMap(agent.alter)
            .map(_ => ())
        })
        .getOrElse(Future.failed(new BadConfigurationException("Campaigns URL not configured")))
    } else {
      Future.successful(())
    }
  }

  def getCampaignsForTags(tags: Seq[String]): List[Campaign] = {
    if (Targeting.isSwitchedOn) {
      agent().getCampaignsForTags(tags, stripRules = true)
    } else {
      Nil
    }
  }
}
