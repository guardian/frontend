package services

import conf.Configuration
import contentapi.ContentApiClient
import com.gu.contentapi.client.model.SearchQuery
import com.gu.contentapi.client.model.v1.{Content => CapiContent}
import common.GuLogging
import model.Content
import org.joda.time.{DateTime, DateTimeZone}
import implicits.Dates.{CapiRichDateTime, DateTime2ToCommonDateFormats}
import views.support.Item1200

import scala.concurrent.{ExecutionContext, Future}
import scala.xml.{Elem, NodeSeq}
import java.net.URI
import java.nio.charset.StandardCharsets.UTF_8
import java.time.OffsetDateTime

class FilterSiteMap(contentApiClient: ContentApiClient) extends GuLogging {
  import FilterSiteMap.{Region, Settings}

  def buildLatestSitemaps()(implicit executionContext: ExecutionContext): Future[Option[Map[Region, NodeSeq]]] =
    buildLatestSitemaps(FilterSiteMap.settings)

  private[services] def buildLatestSitemaps(settings: Settings)(implicit
      executionContext: ExecutionContext,
  ): Future[Option[Map[Region, NodeSeq]]] = {
    if (settings.manualIds.isEmpty && settings.automaticFrom.isEmpty) {
      log.info("Skipping Filter sitemap refresh: no article sources configured")
      Future.successful(None)
    } else {
      val manual = fetchManualArticles(settings.manualIds)
      val automatic = settings.automaticFrom.map(fetchAutomaticArticles).getOrElse(Future.successful(Nil))

      for {
        manualContent <- manual
        automaticContent <- automatic
      } yield Some(FilterSiteMap.buildSitemaps(manualContent ++ automaticContent))
    }
  }

  private def fetchManualArticles(ids: Seq[String])(implicit
      executionContext: ExecutionContext,
  ): Future[Seq[CapiContent]] =
    if (ids.nonEmpty) fetchAllPages(query.ids(ids.mkString(",")))
    else Future.successful(Nil)

  private def fetchAutomaticArticles(cutoff: OffsetDateTime)(implicit
      executionContext: ExecutionContext,
  ): Future[Seq[CapiContent]] =
    fetchAllPages(
      query
        .tag(s"(${FilterSiteMap.regions.flatMap(_.tagIds).mkString("|")}),-tone/advertisement-features")
        .fromDate(cutoff.toInstant),
    ).map(_.filter(publishedOnOrAfter(cutoff)))

  private def publishedOnOrAfter(cutoff: OffsetDateTime)(content: CapiContent): Boolean =
    content.webPublicationDate.exists(date => !date.toJoda.toInstant.isBefore(cutoff.toInstant.toEpochMilli))

  private def fetchAllPages(query: SearchQuery)(implicit
      executionContext: ExecutionContext,
  ): Future[Seq[CapiContent]] =
    contentApiClient.getResponse(query).flatMap { initialResponse =>
      val followingPages = (2 to initialResponse.pages).map(page => contentApiClient.getResponse(query.page(page)))
      Future.sequence(Future.successful(initialResponse) +: followingPages).map(_.flatMap(_.results).toList)
    }

  private def query: SearchQuery =
    contentApiClient
      .search()
      .pageSize(200)
      .orderBy("newest")
      .showFields("headline,lastModified")
      .showTags("all")
      .showElements("image")
}

object FilterSiteMap extends GuLogging {

  case class Settings(manualIds: Seq[String], automaticFrom: Option[OffsetDateTime])

  def settings: Settings = Settings(
    Configuration.filterSiteMap.manualIds,
    if (Configuration.filterSiteMap.automaticEnabled) {
      Some(OffsetDateTime.parse(Configuration.filterSiteMap.automaticFrom.getOrElse {
        throw new IllegalArgumentException(
          "filter.sitemap.automaticFrom is required when automatic population is enabled",
        )
      }))
    } else None,
  )

  // Each region's tags match hasFilterTag in DCR: the Filter series tag and commissioning desk.
  sealed abstract class Region(val id: String, val tagIds: Seq[String]) {
    val path = s"/sitemaps/thefilter-$id.xml"
  }

  case object Uk extends Region("uk", Seq("thefilter/series/the-filter", "tracking/commissioningdesk/the-filter"))

  case object Us extends Region("us", Seq("thefilter-us/series/thefilter-us", "tracking/commissioningdesk/filter-us"))

  val regions: Seq[Region] = Seq(Uk, Us)

  private val sitemapNamespace = "http://www.sitemaps.org/schemas/sitemap/0.9"

  // Sitemaps.org protocol limits apply to each uncompressed sitemap file.
  private val maxUrls = 50000
  private val maxBytes = 50 * 1024 * 1024

  // Kept as an index of one sitemap per region so Search Console reports UK and US indexing separately
  val index: Elem =
    <sitemapindex xmlns={sitemapNamespace}>
      {regions.map(region => <sitemap><loc>{s"${Configuration.site.host}${region.path}"}</loc></sitemap>)}
    </sitemapindex>

  private[services] def buildSitemaps(contents: Seq[CapiContent]): Map[Region, NodeSeq] = {
    val urlsByRegion = contents
      .distinctBy(_.id)
      .flatMap { apiContent =>
        regionOf(apiContent.tags.map(_.id).toList) match {
          case None =>
            log.warn(s"Dropping Filter sitemap entry with no Filter tag: ${apiContent.id}")
            None
          case Some(_) if !validLocation(apiContent) =>
            log.warn(s"Dropping Filter sitemap entry with invalid webUrl: ${apiContent.id}")
            None
          case Some(region) =>
            lastmod(apiContent) match {
              case None =>
                log.warn(s"Dropping Filter sitemap entry with missing dates: ${apiContent.id}")
                None
              case Some(date) =>
                Some(region -> Url(apiContent.webUrl, mainImageUrl(apiContent), date))
            }
        }
      }
      .groupMap(_._1)(_._2)

    regions.map { region =>
      val xml = UrlSet(urlsByRegion.getOrElse(region, Nil)).xml()
      requireWithinSitemapLimits(region, xml)
      region -> xml
    }.toMap
  }

  private def requireWithinSitemapLimits(region: Region, xml: Elem): Unit = {
    require(
      (xml \ "url").size <= maxUrls,
      s"Filter sitemap ${region.id} exceeds $maxUrls URLs; split it before publishing",
    )
    require(xml.toString.getBytes(UTF_8).length <= maxBytes, s"Filter sitemap ${region.id} exceeds 50 MB")
  }

  def regionFor(id: String): Option[Region] = regions.find(_.id == id)

  // Content tagged for both regions goes in one sitemap only: the region of whichever Filter tag comes first in
  // its tag list, which follows the order editors set
  def regionOf(tagIds: Seq[String]): Option[Region] =
    tagIds.view.flatMap(tagId => regions.find(_.tagIds.contains(tagId))).headOption

  private[services] def lastmod(content: CapiContent): Option[DateTime] =
    content.webPublicationDate
      .orElse(content.fields.flatMap(_.lastModified))
      .map(_.toJoda)

  private def validLocation(content: CapiContent): Boolean = {
    val location = Option(content.webUrl).getOrElse("")
    scala.util.Try(new URI(location)).toOption.exists { uri =>
      uri.getScheme == "https" && uri.getHost == "www.theguardian.com" &&
      uri.getRawUserInfo == null && uri.getPort == -1 && uri.getRawFragment == null
    }
  }

  private def mainImageUrl(content: CapiContent): Option[String] =
    Content(content).elements.mainPicture.flatMap(element => Item1200.bestSrcFor(element.images))

  private case class UrlSet(urls: Seq[Url]) {
    def xml(): Elem = {
      <urlset xmlns={sitemapNamespace}
              xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
        {urls.map(_.xml())}
      </urlset>
    }
  }

  private case class Url(location: String, imageUrl: Option[String], lastmod: DateTime) {
    def xml(): Elem = {
      <url>
        <loc>{location}</loc>
        <lastmod>{lastmod.withZone(DateTimeZone.UTC).toISODateTimeNoMillisString}</lastmod>
        {
        imageUrl.map(url => <image:image><image:loc>{url}</image:loc></image:image>).getOrElse(Nil)
      }
      </url>
    }
  }
}
