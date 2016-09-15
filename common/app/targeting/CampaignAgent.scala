package targeting

import common._
import com.gu.targeting.client.CampaignCache
import conf.Configuration
import scala.util.control.NonFatal
import scala.concurrent.Future

object CampaignAgent extends Logging with ExecutionContexts {
  private val agent = AkkaAgent[CampaignCache](CampaignCache(List()))

  def refresh(): Future[Unit] = {
    Configuration.targeting.campaignsUrl.map(url => {
      CampaignCache.fetch(url).map(agent.send)
    }).getOrElse(Future.failed(throw new BadConfigurationException("Campaigns URL not configured")))
  }

  def getCampaignsForTags(tags: Seq[String]) = try {
    agent().getCampaignsForTags(tags)
  } catch {
    case NonFatal(e) =>
      log.error("Failed to get campaigns for tags.", e)
      List()
  }
}


