package model

import com.gu.contentapi.client.model.v1.ContentType.{
  Article => ApiArticle,
  Liveblog => ApiLiveblog,
  Picture => ApiPicture,
  Gallery => ApiGallery,
  Interactive => ApiInteractive,
  Video => ApiVideo,
  Crossword => ApiCrossword,
  Audio => ApiAudio,
}
import play.api.libs.json._
import com.gu.contentapi.client.model.v1.{Content => ApiContent}
import model.pressed.PressedStory

// If you are reading this, you're probably trying to create a new Content Type.
// Please note that we send the content types to DFP for ad tracking.
// However, DFP will only recognise the content types from a specific PREDEFINED LIST.
//
// In DFP, this list is here:
// Inventory > Customised targeting > ct
//
// Please get Ad Ops to add it to the list BEFORE adding a new content type here if you want to be able to track this content type

sealed trait DotcomContentType {
  val name: String
}
object DotcomContentType {

  object Unknown extends DotcomContentType { override val name = "Article" }
  object Article extends DotcomContentType { override val name = "Article" }
  object NetworkFront extends DotcomContentType { override val name = "Network Front" }
  object Section extends DotcomContentType { override val name = "Section" }
  object ImageContent extends DotcomContentType { override val name = "ImageContent" }
  object Interactive extends DotcomContentType { override val name = "Interactive" }
  object Gallery extends DotcomContentType { override val name = "Gallery" }
  object Video extends DotcomContentType { override val name = "Video" }
  object Audio extends DotcomContentType { override val name = "Audio" }
  object LiveBlog extends DotcomContentType { override val name = "LiveBlog" }
  object Tag extends DotcomContentType { override val name = "Tag" }
  object TagIndex extends DotcomContentType { override val name = "Index" }
  object Crossword extends DotcomContentType { override val name = "Crossword" }
  object Survey extends DotcomContentType { override val name = "Survey" }
  object Signup extends DotcomContentType { override val name = "Signup" }
  object Identity extends DotcomContentType { override val name = "userid" }

  implicit val format: Format[DotcomContentType] = new Format[DotcomContentType] {
    override def reads(json: JsValue): JsResult[DotcomContentType] =
      json match {
        case JsString(Article.name)      => JsSuccess(Article)
        case JsString(NetworkFront.name) => JsSuccess(NetworkFront)
        case JsString(Section.name)      => JsSuccess(Section)
        case JsString(ImageContent.name) => JsSuccess(ImageContent)
        case JsString(Interactive.name)  => JsSuccess(Interactive)
        case JsString(Gallery.name)      => JsSuccess(Gallery)
        case JsString(Video.name)        => JsSuccess(Video)
        case JsString(Audio.name)        => JsSuccess(Audio)
        case JsString(LiveBlog.name)     => JsSuccess(LiveBlog)
        case JsString(Tag.name)          => JsSuccess(Tag)
        case JsString(TagIndex.name)     => JsSuccess(TagIndex)
        case JsString(Crossword.name)    => JsSuccess(Crossword)
        case JsString(Survey.name)       => JsSuccess(Survey)
        case JsString(Signup.name)       => JsSuccess(Signup)
        case JsString(Identity.name)     => JsSuccess(Identity)
        case _                           => JsError(s"Unknown content type: '$json'")
      }

    override def writes(o: DotcomContentType): JsValue = JsString(o.name)
  }

  def apply(apiContent: ApiContent): Option[DotcomContentType] = {
    apiContent.`type` match {
      case ApiArticle     => Some(DotcomContentType.Article)
      case ApiLiveblog    => Some(DotcomContentType.LiveBlog)
      case ApiGallery     => Some(DotcomContentType.Gallery)
      case ApiInteractive => Some(DotcomContentType.Interactive)
      case ApiPicture     => Some(DotcomContentType.ImageContent)
      case ApiVideo       => Some(DotcomContentType.Video)
      case ApiCrossword   => Some(DotcomContentType.Crossword)
      case ApiAudio       => Some(DotcomContentType.Audio)
      case _              => None
    }
  }

  def apply(storyContent: Option[PressedStory]): DotcomContentType = {
    storyContent.flatMap(_.metadata.`type`).getOrElse(DotcomContentType.Article)
  }
}
