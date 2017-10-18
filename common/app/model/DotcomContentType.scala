package model

import com.gu.contentapi.client.model.v1.ContentType.{
Article => ApiArticle,
Liveblog => ApiLiveblog,
Picture => ApiPicture,
Gallery => ApiGallery,
Interactive => ApiInteractive,
Video => ApiVideo,
Crossword => ApiCrossword,
Audio => ApiAudio
}
import play.api.libs.json._
import com.gu.contentapi.client.model.v1.{Content => ApiContent}

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

  case object Unknown extends DotcomContentType { override val name = "Unknown" }
  case object Article extends DotcomContentType { override val name = "Article" }
  case object NetworkFront extends DotcomContentType { override val name = "Network Front" }
  case object Section extends DotcomContentType { override val name = "Section" }
  case object ImageContent extends DotcomContentType { override val name = "ImageContent" }
  case object Interactive extends DotcomContentType { override val name = "Interactive" }
  case object Gallery extends DotcomContentType { override val name = "Gallery" }
  case object Video extends DotcomContentType { override val name = "Video" }
  case object Audio extends DotcomContentType { override val name = "Audio" }
  case object LiveBlog extends DotcomContentType { override val name = "LiveBlog" }
  case object Tag extends DotcomContentType { override val name = "Tag" }
  case object TagIndex extends DotcomContentType { override val name = "Index" }
  case object Crossword extends DotcomContentType { override val name = "Crossword" }
  case object Survey extends DotcomContentType { override val name = "Survey" }
  case object Signup extends DotcomContentType { override val name = "Signup" }
  case object Identity extends DotcomContentType { override val name = "userid" }

  implicit val format: Format[DotcomContentType] = new Format[DotcomContentType] {
    override def reads(json: JsValue): JsResult[DotcomContentType] = json match {
      case JsString(Article.name) =>  JsSuccess(Article)
      case JsString(NetworkFront.name) =>  JsSuccess(NetworkFront)
      case JsString(Section.name) =>  JsSuccess(Section)
      case JsString(ImageContent.name) =>  JsSuccess(ImageContent)
      case JsString(Interactive.name) =>  JsSuccess(Interactive)
      case JsString(Gallery.name) =>  JsSuccess(Gallery)
      case JsString(Video.name) =>  JsSuccess(Video)
      case JsString(Audio.name) =>  JsSuccess(Audio)
      case JsString(LiveBlog.name) =>  JsSuccess(LiveBlog)
      case JsString(Tag.name) =>  JsSuccess(Tag)
      case JsString(TagIndex.name) =>  JsSuccess(TagIndex)
      case JsString(Crossword.name) =>  JsSuccess(Crossword)
      case JsString(Survey.name) =>  JsSuccess(Survey)
      case JsString(Signup.name) =>  JsSuccess(Signup)
      case JsString(Identity.name) =>  JsSuccess(Identity)
      case _ => JsError(s"Unknown content type: '$json'")
    }

    override def writes(o: DotcomContentType): JsValue = JsString(o.name)
  }

  def apply(apiContent: ApiContent): Option[DotcomContentType] = {
    apiContent.`type` match {
      case ApiArticle => Some(DotcomContentType.Article)
      case ApiLiveblog => Some(DotcomContentType.LiveBlog)
      case ApiGallery => Some(DotcomContentType.Gallery)
      case ApiInteractive => Some(DotcomContentType.Interactive)
      case ApiPicture => Some(DotcomContentType.ImageContent)
      case ApiVideo => Some(DotcomContentType.Video)
      case ApiCrossword => Some(DotcomContentType.Crossword)
      case ApiAudio => Some(DotcomContentType.Audio)
      case _ => None
    }
  }
}
