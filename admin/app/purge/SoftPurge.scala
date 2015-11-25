package purge

import java.util.concurrent.atomic.AtomicReference

import cache.SurrogateKey
import common.{AkkaAsync, ExecutionContexts, Jobs, Logging}
import conf.AdminConfiguration.fastly
import conf.Configuration.environment
import conf.LiveContentApi.{getResponse, search}
import implicits.Dates
import play.api.Play.current
import play.api.libs.ws.WS
import play.api.{Application, GlobalSettings}
import com.gu.contentapi.client.model.{Content => ApiContent}
import conf.switches.Switches.{SoftPurgeSwitch, LongCacheSwitch }
import scala.concurrent.Future
import scala.concurrent.duration._

trait SoftPurge extends GlobalSettings {

  private val JobName = "soft-purge-job"

  override def onStart(app: Application): Unit = {
    super.onStart(app)
    Jobs.scheduleEveryNSeconds(JobName, 5){
      CdnPurge.run()
    }
  }

  override def onStop(app: Application): Unit = {
    Jobs.deschedule(JobName)
    super.onStop(app)
  }
}

object CdnPurge extends ExecutionContexts with Dates with Logging {

  private val serviceId = "2eYr6Wx3ZCUoVPShlCM61l"

  private case class LastChange(key: String, timestamp: Long)

  private lazy val agent = new AtomicReference[Seq[LastChange]](Nil)

  def run(): Unit = if (SoftPurgeSwitch.isSwitchedOn || LongCacheSwitch.isSwitchedOn) {

    val lastKnownChanges = agent.get()
    val recentlyModifiedContent = getMostRecentlyModifiedContent
    val changedSinceLastTime = recentlyModifiedContent.map(_.filter(changed => !lastKnownChanges.contains(changed)))
    val indexedKeys = changedSinceLastTime.map(_.map(_.key)).map(_.zipWithIndex)

    indexedKeys.foreach(_.foreach {
      case (key, index) => AkkaAsync.after(index * 100.milliseconds) {
        soft(key)
      }
    })

    recentlyModifiedContent.foreach(agent.set)
  }


  private def getMostRecentlyModifiedContent: Future[Seq[LastChange]] = {
    getResponse(search
      .orderBy("newest")
      .useDate("last-modified")
      .pageSize(51)
      .showFields("last-modified")
    ).map(_.results.filter(_.id != "canary").map { content =>
        val lastMod = content.safeFields("lastModified").parseISODateTime
        val path = s"/${content.id}"
        LastChange(SurrogateKey(path), lastMod.getMillis)
      }
    )
  }

  // invalidates cache but keeps the ability to serve stale
  def soft(key:String): Unit = {
    purge(key, Seq("Fastly-Key" -> fastly.key, "Fastly-Soft-Purge" -> "1"))
  }

  // removes from cache
  def hard(key:String): Unit = {
    purge(key, Nil)
  }

  // see https://docs.fastly.com/api/purge#purge_5
  private def purge(key: String, headers: Seq[(String, String)]): Unit = {

    // under normal circumstances we only ever want this called from PROD.
    // Don't want too much decache going on.
    if (environment.isProd) {
      val purgeRequest = WS.url(s"https://api.fastly.com/service/$serviceId/purge/$key")
        .withHeaders(headers:_*)
        .post("")

      purgeRequest.foreach(r => log.info(s"purge $key from Fastly with response ${r.statusText}"))
    } else {
      log.info(s"mock call to Fastly to decache $key")
    }
  }
}
