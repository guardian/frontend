package instant

import common.{Edition, ExecutionContexts}
import conf.LiveContentApi._
import model.{Content, _}
import org.joda.time.DateTime
import play.api.mvc.RequestHeader

import scala.concurrent.Future
import scala.xml.PCData

object InstantArticlesRss extends ExecutionContexts with implicits.Dates {

  val ids = Seq(
    "sport/gallery/2015/jun/01/giro-ditalia-2015-stages-16-to-21-in-pictures",
    "sport/video/2015/apr/13/railway-company-issues-complaint-against-paris-roubaix-riders-video"
  ).mkString(",")

  def stripInvalidXMLCharacters(s: String) = {
    s.replaceAll("[^\\x09\\x0A\\x0D\\x20-\\uD7FF\\uE000-\\uFFFD\\u10000-\\u10FFFF]", "")
  }

  def apply()(implicit request: RequestHeader): Future[String] = {

    val contentToIndex = getResponse(search(Edition.defaultEdition)
      .showFields("all")
      .ids(ids)).map(
        _.results
          .map(ApiContentWithMeta(_))
          .map(Content(_))
      )

    // this RSS needs to follow the guidelines over here...
    // https://developers.facebook.com/docs/partners/native-articles
    contentToIndex.map{ content =>
      <rss version="2.0" xmlns:content="http://purl.org/rss/1.0/modules/content/">
        <channel>
          <title>The Guardian</title>
          <link>http://www.theguardian.com</link>
          <description>
            Latest news, sport, business, comment, analysis and reviews from the Guardian, the world's leading liberal voice.
          </description>
          <language>en-us</language>
          <lastBuildDate>{DateTime.now.toISODateTimeNoMillisString}</lastBuildDate>
          {content.map { item =>
              <item>
                <title>{PCData(item.webTitle)}</title>
                <link>{item.webUrl}</link>
                <guid>{item.guid}</guid>
                <pubDate>{item.webPublicationDate.toISODateTimeNoMillisString}</pubDate>
                <author>{PCData(item.contributors.map(_.name).mkString(", "))}</author>

                <description>{PCData(item.standfirst.getOrElse(""))}</description>

                <content:encoded>{PCData(renderContentBody(item))}</content:encoded>
              </item>
          }}
        </channel>
      </rss>.toString
    }


  }

  private def renderContentBody(content: Content): String = content match {
    case gallery: Gallery => views.html.content.gallery(gallery).toString()
    case video: Video => views.html.content.video(video).toString()
    case _ => ""
  }
}
