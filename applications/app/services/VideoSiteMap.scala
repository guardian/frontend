package services

import common.{ExecutionContexts, Edition}
import conf.{Configuration, LiveContentApi}
import conf.LiveContentApi._
import model.{Video, Content}
import org.joda.time.{DateTimeZone, DateTime}
import implicits.Dates.DateTime2ToCommonDateFormats
import views.support.Naked

import scala.concurrent.Future
import scala.xml.NodeSeq

object VideoSiteMap extends ExecutionContexts {

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

  def getLatestContent: Future[NodeSeq] = {

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
      val urls = for {
        resp <- paginatedResults
        item <- resp.results.map(Content.apply).collect({ case video:Video => video })
      } yield {
        val keywordTags = item.tags.keywords.map(_.metadata.webTitle)
        val sectionTag = item.content.seriesTag.filter(tag => !keywordTags.contains(tag.properties.sectionName)).map(_.metadata.webTitle)


        val imageUrl: String = item.elements.mainPicture.flatMap(_.images.largestEditorialCrop.flatMap(_.url))
          .getOrElse(Configuration.images.fallbackLogo)

        val contentLocation: Option[String] = item.elements.mainVideo.flatMap(_.videos.encodings.find(_.format == "video/mp4")).map { encoding =>
          encoding.url
        }

        Url(
          location = item.metadata.webUrl,
          thumbnail_loc = item.elements.thumbnail.flatMap(thumbnail => Naked.bestFor(thumbnail.images)),
          content_loc = contentLocation,
          title = item.trail.headline,
          description = item.fields.trailText,
          duration = item.elements.mainVideo.map(_.videos.duration).getOrElse(0),
          publication = item.trail.webPublicationDate,
          tags = keywordTags ++ sectionTag,
          category = item.metadata.section)
      }

      UrlSet(urls take 1000).xml()
    }
  }
}