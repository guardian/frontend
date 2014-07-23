package services

import conf.Configuration
import model.TagIndexPage
import play.api.Play
import play.api.Play.current
import play.api.libs.json.{JsError, JsSuccess, Json}

import scala.collection.JavaConversions._

sealed trait TagIndexError

case object TagIndexNotFound extends TagIndexError
case class TagIndexReadError(error: JsError) extends TagIndexError

object TagIndexesS3 extends S3 {
  private val IndexKeyMatcher = """^.*/([^/]+)\.json$""".r

  override lazy val bucket = Configuration.indexes.tagIndexesBucket

  val stage = if (Play.isTest) "TEST" else Configuration.facia.stage

  private def indexRoot(indexType: String) = s"$stage/index/${indexType}s"

  private def indexKey(indexType: String, indexCharacter: Char) =
    s"${indexRoot(indexType)}/$indexCharacter.json"

  def putIndex(indexType: String, tagPage: TagIndexPage) = putPublic(
    indexKey(indexType, tagPage.indexCharacter),
    Json.stringify(Json.toJson(tagPage)),
    "application/json"
  )

  def getIndex(indexType: String, indexCharacter: Char): Either[TagIndexError, TagIndexPage] =
    get(indexKey(indexType, indexCharacter)) match {
      case Some(jsonString) =>
        Json.fromJson[TagIndexPage](Json.parse(jsonString)) match {
          case JsSuccess(tagPage, _) => Right(tagPage)
          case error @ JsError(_) => Left(TagIndexReadError(error))
        }

      case None =>
        Left(TagIndexNotFound)
    }

  def listIndexPages(indexType: String): Seq[Char] =
    (client.listObjects(bucket, indexRoot(indexType)).getObjectSummaries.map(_.getKey) collect {
      case IndexKeyMatcher(key) => key.charAt(0)
    }).toSeq
}
