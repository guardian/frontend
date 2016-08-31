package targeting

import common._
import com.gu.targeting.client._
import com.amazonaws.services.s3.AmazonS3Client
import conf.Configuration
import services.AwsEndpoints

import scala.util.Try
import scala.util.control.NonFatal

object CampaignAgent extends Logging with ExecutionContexts {
  val crossAccountClient: Option[AmazonS3Client] = Try({
    val client = new AmazonS3Client(Configuration.targeting.crossAccountMandatoryCredentials)
    client.setEndpoint(AwsEndpoints.s3)
    client
  }).toOption

  private val agent = AkkaAgent[CampaignCache](new CampaignCache())

  def refresh() {
    crossAccountClient.foreach(client => {
      agent.alter { old =>
        try {
          old.update(client, Configuration.targeting.campaignsBucket)
        } catch {
          case NonFatal(e) => log.error("Failed to update campaign list.", e)
        }
        old
      }
    })
  }

  def getCampaignsForTags(tags: Seq[String]) = try {
    agent().getCampaignsForTags(tags)
  } catch {
    case NonFatal(e) =>
      log.error("Failed to get campaigns for tags.", e)
      List()
  }
}


