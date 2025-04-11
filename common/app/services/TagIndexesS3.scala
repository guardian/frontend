package services

import conf.Configuration
import model.{TagIndexListings, TagIndex}
import play.api.libs.json._

sealed trait TagIndexError

case object TagIndexNotFound extends TagIndexError
case class TagIndexReadError(error: JsError) extends TagIndexError

object TagIndexesS3 extends S3 {
  override lazy val bucket = Configuration.indexes.tagIndexesBucket

  val stage = Configuration.facia.stage.toUpperCase

  val ListingKey = "_listing"

  private def indexRoot(indexType: String) = s"$stage/index/$indexType"

  private def indexKey(indexType: String, pageName: String) =
    s"${indexRoot(indexType)}/$pageName.json"

  private def putJson[A: Writes](key: String, a: A) =
    putPrivate(
      key,
      Json.stringify(Json.toJson(a)),
      "application/json",
    )

  def putIndex(indexType: String, tagIndex: TagIndex): Unit =
    putJson(
      indexKey(indexType, tagIndex.id),
      tagIndex,
    )

  def putListing(indexType: String, listing: TagIndexListings): Unit =
    putJson(
      indexKey(indexType, ListingKey),
      listing,
    )

  private def getAndRead[A: Reads](key: String): Either[TagIndexError, A] =
    get(key) match {
      case Some(jsonString) =>
        Json.fromJson[A](Json.parse(jsonString)) match {
          case JsSuccess(tagIndex, _) => Right(tagIndex)
          case error @ JsError(_)     => Left(TagIndexReadError(error))
        }

      case None =>
        Left(TagIndexNotFound)
    }

  def getIndex(indexType: String, pageName: String): Either[TagIndexError, TagIndex] =
    getAndRead[TagIndex](indexKey(indexType, pageName))

  def getListing(indexType: String): Either[TagIndexError, TagIndexListings] =
    getAndRead[TagIndexListings](indexKey(indexType, ListingKey))

  def getListingOrDie(indexType: String): TagIndexListings =
    getListing(indexType) match {
      case Right(listings)            => listings
      case Left(TagIndexNotFound)     => throw new RuntimeException(s"Could not find index $indexType")
      case Left(TagIndexReadError(_)) => throw new RuntimeException(s"Could not deserialize index $indexType")
    }
}
