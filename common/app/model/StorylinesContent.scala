package model

import common.GuLogging
import conf.Configuration
import io.circe.generic.semiauto.{deriveDecoder, deriveEncoder}
import io.circe.{Decoder, DecodingFailure, Encoder}
import play.api.libs.json.{Json, Writes}
import services.S3

import java.time.Instant
import experiments.{TagPageStorylines, ActiveExperiments}
import play.api.mvc.{Filter, RequestHeader}

// this mirrors the structure in the tool generating the content
// https://github.com/guardian/tag-page-supercharger/blob/main/app/models/FrontendContent.scala#L18
case class StorylinesContent(
    created: Instant,
    tag: String,
    storylines: List[Storyline],
    earliestArticleTime: Option[Instant],
    latestArticleTime: Option[Instant],
)

case class Storyline(
    title: String,
    content: List[CategoryContent],
)

case class CategoryContent(
    category: String,
    articles: Option[List[ArticleData]],
)

case class ImageData(
    src: Option[String],
    altText: Option[String],
    isAvatar: Boolean = false,
    mediaData: Option[StorylinesMediaData] = None,
)

case class ArticleData(
    url: String,
    headline: String,
    byline: Option[String],
    publicationTime: Instant,
    image: Option[
      ImageData,
    ],
)

// These mirror the definitions from DCR: https://github.com/guardian/dotcom-rendering/blob/main/dotcom-rendering/src/types/mainMedia.ts
// In DCR, we effectively bypass the usual transformations done to Frontend/CAPI data,
// but need to provide the fields below so multimedia cards can render correctly.
// There are existing Video/Gallery/Audio references in Frontend, so we define separate types here to avoid confusion.
sealed trait StorylinesMediaData {
  def `type`: String
}

case class StorylinesVideo(
    `type`: String = "YoutubeVideo",
    id: String,
    videoId: String,
    height: Int,
    width: Int,
    origin: String,
    title: String,
    duration: Int,
    expired: Boolean,
    image: Option[String] = None,
) extends StorylinesMediaData

case class StorylinesAudio(
    `type`: String = "Audio",
    duration: String,
) extends StorylinesMediaData

case class StorylinesGallery(
    `type`: String = "Gallery",
    count: String,
) extends StorylinesMediaData

object StorylinesMediaData {
  implicit val videoDecoder: Decoder[StorylinesVideo] = deriveDecoder
  implicit val audioDecoder: Decoder[StorylinesAudio] = deriveDecoder
  implicit val galleryDecoder: Decoder[StorylinesGallery] = deriveDecoder
  implicit val mediaDataDecoder: Decoder[StorylinesMediaData] =
    Decoder.instance { cursor =>
      cursor.get[String]("type").flatMap {
        case "YoutubeVideo" => cursor.as[StorylinesVideo]
        case "Audio"        => cursor.as[StorylinesAudio]
        case "Gallery"      => cursor.as[StorylinesGallery]
        case other          =>
          Left(DecodingFailure(s"Unknown mediaType: $other", cursor.history))
      }
    }

  implicit val videoEncoder: Encoder[StorylinesVideo] = deriveEncoder
  implicit val audioEncoder: Encoder[StorylinesAudio] = deriveEncoder
  implicit val galleryEncoder: Encoder[StorylinesGallery] = deriveEncoder
  implicit val mediaDataEncoder: Encoder[StorylinesMediaData] = Encoder.instance {
    case v: StorylinesVideo   => videoEncoder(v)
    case a: StorylinesAudio   => audioEncoder(a)
    case g: StorylinesGallery => galleryEncoder(g)
  }

  implicit val videoWrites: Writes[StorylinesVideo] = Json.writes[StorylinesVideo]
  implicit val audioWrites: Writes[StorylinesAudio] = Json.writes[StorylinesAudio]
  implicit val galleryWrites: Writes[StorylinesGallery] = Json.writes[StorylinesGallery]
  implicit val mediaDataWrites: Writes[StorylinesMediaData] = Json.writes[StorylinesMediaData]
}

object Storyline {
  implicit val decoder: Decoder[Storyline] = deriveDecoder
  implicit val encoder: Encoder[Storyline] = deriveEncoder
  implicit val storylinesWrites: Writes[Storyline] = Json.writes[Storyline]

}

object CategoryContent {
  implicit val decoder: Decoder[CategoryContent] = deriveDecoder
  implicit val encoder: Encoder[CategoryContent] = deriveEncoder
  implicit val categoryContentWrites: Writes[CategoryContent] = Json.writes[CategoryContent]

}

object ImageData {
  implicit val decoder: Decoder[ImageData] = deriveDecoder
  implicit val encoder: Encoder[ImageData] = deriveEncoder
  implicit val imageDataWrites: Writes[ImageData] = Json.writes[ImageData]

}

object ArticleData {
  implicit val decoder: Decoder[ArticleData] = deriveDecoder
  implicit val encoder: Encoder[ArticleData] = deriveEncoder
  implicit val articleDataWrites: Writes[ArticleData] = Json.writes[ArticleData]

}

object StorylinesContent extends GuLogging {
  implicit val storylinesContentDecoder: Decoder[StorylinesContent] = deriveDecoder
  implicit val storylinesContentEncoder: Encoder[StorylinesContent] = deriveEncoder
  implicit val storylinesWrites: Writes[StorylinesContent] = Json.writes[StorylinesContent]

  def getContent(tag: String)(implicit rh: RequestHeader): Option[StorylinesContent] = {
    if (ActiveExperiments.isParticipating(TagPageStorylines)) {
      lazy val stage: String = Configuration.facia.stage.toUpperCase
      val encodedTag = java.net.URLEncoder.encode(tag, "UTF-8")
      val location = s"$stage/tag-page-ai-data/$encodedTag.json"
      val maybeStorylinesContent = S3.get(location).map { jsonString =>
        io.circe.parser.decode[StorylinesContent](jsonString) match {
          case Right(content) => Some(content)
          case Left(error)    =>
            log.error(s"Error decoding Storylines Content for tag $tag: $error")
            None
        }
      }
      maybeStorylinesContent match {
        case Some(content) => content
        case None          => log.error("Storylines Content not found for tag: " + tag); None
      }
    } else {
      None
    }
  }
}
