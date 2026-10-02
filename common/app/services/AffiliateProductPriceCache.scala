package services

import java.net.URI
import java.util.concurrent.atomic.AtomicReference
import app.LifecycleComponent
import common.{GuLogging, JobScheduler, PekkoAsync}
import model.dotcomrendering.pageElements.AffiliateProductPrice
import conf.switches.Switches.AffiliateProductLivePricing
import conf.Configuration.affiliateLinks

import play.api.inject.ApplicationLifecycle

import scala.concurrent.{ExecutionContext, Future}
import scala.concurrent.duration._
import scala.util.Try

object AffiliateProductPriceCache extends GuLogging {

  private val latestProductPrices = new AtomicReference(Map.empty[String, AffiliateProductPrice])

  def csvToMap(prices: String): Map[String, AffiliateProductPrice] =
    prices.linesIterator
      .map(_.trim)
      .filter(_.nonEmpty)
      .map(_.split(",", 3).map(_.trim))
      .collect { case Array(url, currencySymbol, price) =>
        url -> AffiliateProductPrice(currencySymbol, price)
      }
      .toMap

  def populateLatestProductPrices(): Unit = {
    if (AffiliateProductLivePricing.isSwitchedOn) {
      log.error("Fetching and caching latest affiliate product prices")
      val prices = S3.get(affiliateLinks.latestPricesKey).getOrElse {
        log.error(
          s"Failed to fetch latest product prices from S3: ${S3.bucket}/${affiliateLinks.latestPricesKey}",
        )
        ""
      }
      latestProductPrices.set(csvToMap(prices))
    }
  }

  def getLatestPrice(productUrl: String): Option[AffiliateProductPrice] = latestProductPrices.get().get(productUrl)

  /** Allows tests to inject prices without requiring S3 access. */
  def setLatestProductPrices(prices: Map[String, AffiliateProductPrice]): Unit = latestProductPrices.set(prices)
}

class AffiliateProductPriceCacheLifeCycle(
    appLifecycle: ApplicationLifecycle,
    jobs: JobScheduler,
    pekkoAsync: PekkoAsync,
)(implicit ec: ExecutionContext)
    extends LifecycleComponent {

  appLifecycle.addStopHook { () =>
    Future {
      jobs.deschedule("AffiliateProductPriceJob")
    }
  }
  override def start(): Unit = {
    jobs.deschedule("AffiliateProductPriceJob")
    jobs.scheduleEvery("AffiliateProductPriceJob", 5.minutes) {
      AffiliateProductPriceCache.populateLatestProductPrices()
      Future.successful(())
    }

    pekkoAsync.after1s {
      AffiliateProductPriceCache.populateLatestProductPrices()
    }
  }
}
