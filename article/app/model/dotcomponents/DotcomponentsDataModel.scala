package model.dotcomponents

import common.Edition
import conf.Configuration
import controllers.ArticlePage
import navigation.NavMenu
import play.api.libs.json.{Json, Writes}
import play.api.mvc.RequestHeader

// We have introduced our own set of objects for serializing data to the DotComponents API,
// because we don't want people changing the core frontend models and as a side effect,
// making them incompatible with Dotcomponents. By having our own set of models, there's
// only one reason for change.
// The one exception to this is the Nav class, which we reuse because it's really big.

case class TagProperties(id: String, tagType: String, webTitle: String, twitterHandle: Option[String])
case class Tag(properties: TagProperties)
case class Block(bodyHtml: String)
case class Blocks(body: List[Block])
case class PageData(author: String, pageId: String, pillar: String, ajaxUrl: String, webPublicationDate: Long, section: String, headline: String, webTitle: String)
case class Config(isImmersive: Boolean, page: PageData, nav: NavMenu)
case class ContentFields(standfirst: String, main: String, body: String, blocks: Blocks)
case class DotcomponentsDataModel(contentFields: ContentFields, config: Config, tags: List[Tag], version: Int)

object Block {
  implicit val writes = Json.writes[Block]
}

object Blocks {
  implicit val writes = Json.writes[Blocks]
}

object ContentFields {
  implicit val writes = Json.writes[ContentFields]
}

object TagProperties {
  implicit val writes = Json.writes[TagProperties]
}

object Tag {
  implicit val writes = Json.writes[Tag]
}

object PageData {
  implicit val writes = Json.writes[PageData]
}

object Config {
  implicit val writes = Json.writes[Config]
}

object DotcomponentsDataModel {

  val VERSION = 1

  def fromArticle(articlePage: ArticlePage, request: RequestHeader): DotcomponentsDataModel = {

    val article = articlePage.article

    val blocks: List[Block] = article.blocks match {
      case Some(bs) => bs.body.map(bb => Block(bb.bodyHtml)).toList
      case None => List()
    }

    val dcBlocks = Blocks(blocks)

    val contentFields = ContentFields(
      article.fields.standfirst.getOrElse(""),
      article.fields.main,
      article.fields.body,
      dcBlocks
    )

    val pageData = PageData(
      article.tags.contributors.map(_.name).mkString(","),
      article.metadata.id,
      article.metadata.pillar.map(_.toString).getOrElse(""),
      Configuration.ajax.url,
      article.trail.webPublicationDate.getMillis,
      article.metadata.section.map(_.value).getOrElse(""),
      article.trail.headline,
      article.metadata.webTitle
    )

    val tags = article.tags.tags.map(
      t => Tag(
        TagProperties(
          t.id,
          t.properties.tagType,
          t.properties.webTitle,
          t.properties.twitterHandle
        )
      )
    )

    val navMenu = NavMenu(articlePage, Edition(request))

    val config = Config(
      article.isImmersive,
      pageData,
      navMenu
    )

    DotcomponentsDataModel(
      contentFields,
      config,
      tags,
      VERSION
    )

  }

  def toJsonString(model: DotcomponentsDataModel): String = {

    // make what we have look a bit closer to what dotcomponents currently expects

    implicit val DotComponentsDataModelWrites = new Writes[DotcomponentsDataModel] {
      def writes(model: DotcomponentsDataModel) = Json.obj(
        "config" -> model.config,
        "contentFields" -> Json.obj(
          "fields" -> model.contentFields
        ),
        "tags" -> Json.obj(
          "tags" -> model.tags
        ),
        "version" -> model.version
      )
    }

    Json.prettyPrint(Json.toJson(model))

  }

}
