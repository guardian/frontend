package services

import common.Edition
import conf.Configuration
import contentapi.ContentApiClient
import implicits.Dates.{ DateTime2ToCommonDateFormats, jodaToJavaInstant }
import model.{Content, Video}
import org.joda.time.{DateTime, DateTimeZone}
import views.support.Naked

import scala.concurrent.{ExecutionContext, Future}
import scala.xml.{Elem, NodeSeq}

class VideoSiteMap(contentApiClient: ContentApiClient) {

  private case class UrlSet(urls: Seq[Url]){
    def xml(): Elem = {
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

    def xml(): Elem = {
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

  def getLatestContent()(implicit executionContext: ExecutionContext): Future[NodeSeq] = {

    val date = DateTime.now(DateTimeZone.UTC).minusDays(2)

    val query = contentApiClient.search(Edition.defaultEdition)
      .pageSize(200)
      .tag("type/video,-tone/sponsoredfeatures,-tone/advertisement-features")
      .orderBy("newest")
      .showFields("headline")
      .showTags("all")
      .showReferences("all")
      .showElements("all")
      .fromDate(jodaToJavaInstant(date))

    val responses = contentApiClient.getResponse(query).flatMap { initialResponse =>
      // Request any further pages if needed.
      val followingPages = for {
        pageNumber <- 2 to initialResponse.pages
      } yield contentApiClient.getResponse(query.page(pageNumber))
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
          thumbnail_loc = item.elements.thumbnail.flatMap(thumbnail => Naked.bestSrcFor(thumbnail.images)),
          content_loc = contentLocation,
          title = item.trail.headline,
          description = item.fields.trailText,
          duration = item.elements.mainVideo.map(_.videos.duration).getOrElse(0),
          publication = item.trail.webPublicationDate,
          tags = keywordTags ++ sectionTag,
          category = item.metadata.sectionId)
      }

      UrlSet(urls take 1000).xml()
    }
  }
}
