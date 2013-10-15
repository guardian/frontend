package controllers.front

import model.{Collection, Config}
import common.editions.Uk

trait FaciaDefaults {

  val emptyCollection = Collection(items=Nil, displayName=None)
  val defaultIds: List[String] = List(
    "uk", "us", "au", "uk/money"
  )

  def createConfig(id: String): Config = Config(
    id              = id,
    contentApiQuery = Option(generateContentApiQuery(id)),
    displayName     = None
  )

  def generateContentApiQuery(id: String): String =
    "%s?tag=type/gallery|type/article|type/video|type/sudoku&show-editors-picks=true&edition=UK&show-fields=headline,trail-text,liveBloggingNow,thumbnail,hasStoryPackage,wordcount,shortUrl&show-elements=all"
    .format(id)

  def configTuple(id: String): (Config, Collection) = (createConfig(id), emptyCollection)

  def getDefaultSetup: List[(Config, Collection)] = defaultIds.map (id => (createConfig(id), emptyCollection))

  def getDefaultPageFront: Map[String, PageFront] = defaultIds.map(id => (id, new PageFront(id, Uk))).toMap

}

object FaciaDefaults extends FaciaDefaults
