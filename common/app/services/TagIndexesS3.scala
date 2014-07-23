package services

import conf.Configuration
import model.TagIndexPage
import play.api.Play
import play.api.Play.current
import play.api.libs.json.{JsError, JsSuccess, Json}

sealed trait TagIndexError

case object TagIndexNotFound extends TagIndexError
case class TagIndexReadError(error: JsError) extends TagIndexError

object TagIndexesS3 extends S3 {
  override lazy val bucket = Configuration.indexes.tagIndexesBucket

  val stage = if (Play.isTest) "TEST" else Configuration.facia.stage

  private def indexKey(indexType: String, indexCharacter: Char) =
    s"$stage/index/${indexType}s/$indexCharacter.json"

  def putIndex(indexType: String, tagPage: TagIndexPage) = putPublic(
    indexKey(indexType, tagPage.indexCharacter),
    Json.stringify(Json.toJson(tagPage)),
    "application/json"
  )

  def getIndex(indexType: String, indexCharacter: Char): Either[TagIndexError, TagIndexPage] =
    get(indexKey(indexType, indexCharacter)) match {
      case Some(jsonString) =>
        Json.fromJson[TagIndexPage](Json.parse(jsonString)) match {
          case JsSuccess(tagPage) => Right(tagPage)
          case error @ JsError(_) => Left(TagIndexReadError(error))
        }

      case None =>
        Left(TagIndexNotFound)
    }
}
