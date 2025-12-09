package model

import common.GuLogging
import conf.Configuration
import io.circe.generic.semiauto.{deriveDecoder, deriveEncoder}
import io.circe.{Decoder, DecodingFailure, Encoder}
import play.api.libs.json.{Json, Writes}
import services.S3
import java.time.Instant

// this mirrors the structure in the tool generating the content
// https://github.com/guardian/tag-page-supercharger/blob/main/app/models/FrontendContent.scala#L18
case class TagPageAIContent(
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
    mediaData: Option[TPSGMediaData] = None,
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
// but need to provide the fields below so multimedia cards can render correctly
sealed trait TPSGMediaData {
  def `type`: String
}

case class TPSGVideo(
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
) extends TPSGMediaData

case class TPSGAudio(
    `type`: String = "Audio",
    duration: String,
) extends TPSGMediaData

case class TPSGGallery(
    `type`: String = "Gallery",
    count: String,
) extends TPSGMediaData

object TPSGMediaData {
  implicit val videoDecoder: Decoder[TPSGVideo] = deriveDecoder
  implicit val audioDecoder: Decoder[TPSGAudio] = deriveDecoder
  implicit val galleryDecoder: Decoder[TPSGGallery] = deriveDecoder
  implicit val mediaDataDecoder: Decoder[TPSGMediaData] =
    Decoder.instance { cursor =>
      cursor.get[String]("type").flatMap {
        case "YoutubeVideo" => cursor.as[TPSGVideo]
        case "Audio"        => cursor.as[TPSGAudio]
        case "Gallery"      => cursor.as[TPSGGallery]
        case other =>
          Left(DecodingFailure(s"Unknown mediaType: $other", cursor.history))
      }
    }

  implicit val videoEncoder: Encoder[TPSGVideo] = deriveEncoder
  implicit val audioEncoder: Encoder[TPSGAudio] = deriveEncoder
  implicit val galleryEncoder: Encoder[TPSGGallery] = deriveEncoder
  implicit val mediaDataEncoder: Encoder[TPSGMediaData] = Encoder.instance {
    case v: TPSGVideo   => videoEncoder(v)
    case a: TPSGAudio   => audioEncoder(a)
    case g: TPSGGallery => galleryEncoder(g)
  }

  implicit val videoWrites: Writes[TPSGVideo] = Json.writes[TPSGVideo]
  implicit val audioWrites: Writes[TPSGAudio] = Json.writes[TPSGAudio]
  implicit val galleryWrites: Writes[TPSGGallery] = Json.writes[TPSGGallery]
  implicit val mediaDataWrites: Writes[TPSGMediaData] = Json.writes[TPSGMediaData]
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

object TagPageAIContent extends GuLogging {
  implicit val tpsgContentDecoder: Decoder[TagPageAIContent] = deriveDecoder
  implicit val tpsgContentEncoder: Encoder[TagPageAIContent] = deriveEncoder
  implicit val tpsgWrites: Writes[TagPageAIContent] = Json.writes[TagPageAIContent]

  def getContent(tag: String): Option[TagPageAIContent] = {
    lazy val stage: String = Configuration.facia.stage.toUpperCase
    val encodedTag = java.net.URLEncoder.encode(tag, "UTF-8")
    val location = s"$stage/tag-page-ai-data/$encodedTag.json"
    val maybeTagPageAIContent = S3.get(location).map { jsonString =>
      io.circe.parser.decode[TagPageAIContent](jsonString) match {
        case Right(content) => Some(content)
        case Left(error) =>
          log.error(s"Error decoding TPSGContent for tag $tag: $error")
          None
      }
    }
    maybeTagPageAIContent match {
      case Some(content) => content
      case None          => log.error("TPSGContent not found for tag: " + tag); None
    }
  }
}
