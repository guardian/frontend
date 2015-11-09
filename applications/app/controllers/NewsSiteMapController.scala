package controllers

import common._
import conf.{Configuration, LiveContentApi}
import conf.LiveContentApi._
import implicits.Dates.DateTime2ToCommonDateFormats
import model._
import org.joda.time.{DateTimeZone, DateTime}
import play.api.mvc.{Action, Controller}

import scala.concurrent.Future

object NewsSiteMapController extends Controller with Logging with ExecutionContexts {

  private case class UrlSet(urls: Seq[Url]){
    def xml() = {
      <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
              xmlns:news="http://www.google.com/schemas/sitemap-news/0.9"
              xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
        { urls.map(_.xml()) }
      </urlset>
    }
  }

  private case class Url(
    location: String,
    keywords: String,
    title: String,
    genres: String,
    webPublicationDate: DateTime,
    imageUrl: String) {

    def xml() = {
      <url>
        <loc>{location}</loc>
        <image:image>
          <image:loc>{imageUrl}</image:loc>
        </image:image>
        <changefreq>hourly</changefreq>
        <news:news>
          <news:publication>
            <news:name>The Guardian</news:name>
            <news:language>en</news:language>
          </news:publication>
          <news:genres>{genres}</news:genres>
          <news:publication_date>{webPublicationDate.withZone(DateTimeZone.UTC).toISODateTimeNoMillisString}</news:publication_date>
          <news:title>{title}</news:title>
          <news:keywords>{keywords}</news:keywords>
        </news:news>
      </url>
    }
  }

  private def getLatestContentForSitemap: Future[Seq[Url]] = {

    val query = LiveContentApi.search(Edition.defaultEdition)
      .pageSize(200)
      .tag("-tone/sponsoredfeatures,-type/crossword,-extra/extra,-tone/advertisement-features")
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
        item <- resp.results.map(Content.apply)
      } yield {
        val keywordTags = item.keywords.map(_.webTitle)
        val sectionTag = item.seriesTag.toList.filter(tag => !keywordTags.contains(tag.sectionName)).map(_.webTitle)
        val keywords = (keywordTags ++ sectionTag).mkString(", ")

        val genres = item.tones.flatMap(_.webTitle match {
          case "Blogposts" => Some("Blog")
          case "Reviews" => Some("Opinion")
          case "Comment" => Some("OpEd")
          case _ => None
        }).mkString(", ")

        val imageUrl: String = item.mainPicture.flatMap(_.largestEditorialCrop.flatMap(_.url))
          .getOrElse(Configuration.images.fallbackLogo)

        Url(
          location = item.webUrl,
          keywords = keywords,
          title = item.headline,
          genres = genres,
          webPublicationDate = item.webPublicationDate,
          imageUrl = imageUrl)
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
