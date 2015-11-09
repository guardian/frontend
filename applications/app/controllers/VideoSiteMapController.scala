package controllers

import common._
import conf.LiveContentApi._
import conf.{Configuration, LiveContentApi}
import implicits.Dates.DateTime2ToCommonDateFormats
import model._
import org.joda.time.{DateTime, DateTimeZone}
import play.api.mvc.{Action, Controller}
import views.support.Naked

import scala.concurrent.Future

object VideoSiteMapController extends Controller with Logging with ExecutionContexts {

  private case class UrlSet(urls: Seq[Url]){
    def xml() = {
      <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
              xmlns:video="http://www.google.com/schemas/sitemap-video/1.1">
        { urls.map(_.xml()) }
      </urlset>
    }
  }

  private case class Url(
    location: String,
    thumbnail_loc: Option[String],
    content_loc: Option[String],
    title: String,
    description: Option[String],
    duration: Int,
    publication: DateTime,
    tags: Seq[String],
    category: String) {

    def xml() = {
      <url>
        <loc>{location}</loc>
        <video:video>
          {thumbnail_loc.map(thumbnail => <video:thumbnail_loc>{thumbnail}</video:thumbnail_loc>).getOrElse(Nil)}
          <video:title>{title}</video:title>
          {description.map(desc => <video:description>{desc}</video:description>).getOrElse(Nil)}
          {content_loc.map(content => <video:content_loc>{content}</video:content_loc>).getOrElse(Nil)}
          <video:duration>{duration}</video:duration>
          <video:publication_date>{publication.withZone(DateTimeZone.UTC).toISODateTimeNoMillisString}</video:publication_date>
          {tags.map(tag => <video:tag>{tag}</video:tag>)}
          <video:category>{category}</video:category>
          <video:family_friendly>yes</video:family_friendly>
        </video:video>
      </url>
    }
  }

  private def getLatestContentForSitemap: Future[Seq[Url]] = {

    val query = LiveContentApi.search(Edition.defaultEdition)
      .pageSize(200)
      .tag("type/video,-tone/sponsoredfeatures,-tone/advertisement-features")
      .orderBy("newest")
      .showFields("headline")
      .showTags("all")
      .showReferences("all")
      .showElements("all")
      .fromDate(DateTime.now(DateTimeZone.UTC).minusDays(2))

    val responses = getResponse(query).flatMap { initialResponse =>
      // Request any further pages if needed.
      val followingPages = for {
        pageNumber <- 2 to initialResponse.pages
      } yield getResponse(query.page(pageNumber))
      Future.sequence(Future.successful(initialResponse) +: followingPages)
    }

    responses.map { paginatedResults =>
      for {
        resp <- paginatedResults
        item <- resp.results.map(Content.apply).collect({ case video:Video => video })
      } yield {
        val keywordTags = item.keywords.map(_.webTitle)
        val sectionTag = item.seriesTag.filter(tag => !keywordTags.contains(tag.sectionName)).map(_.webTitle)


        val imageUrl: String = item.mainPicture.flatMap(_.largestEditorialCrop.flatMap(_.url))
          .getOrElse(Configuration.images.fallbackLogo)

        Url(
          location = item.webUrl,
          thumbnail_loc = item.thumbnail.flatMap(Naked.bestFor),
          content_loc = item.source,
          title = item.headline,
          description = item.trailText,
          duration = item.mainVideo.map(_.duration).getOrElse(0),
          publication = item.webPublicationDate,
          tags = keywordTags ++ sectionTag,
          category = item.section)
      }
    }
  }

  def renderSiteMap() = Action.async { implicit request =>
    getLatestContentForSitemap.map { urls =>
      Cached(60) {
        Ok(UrlSet(urls take 1000).xml()).as("text/xml; charset=utf-8")
      }
    }
  }
}
