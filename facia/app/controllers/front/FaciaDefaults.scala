package controllers.front

import model.{Collection, Config}
import common.Edition
import conf.ContentApi

trait FaciaDefaults {

  val defaultStyle = "regular-stories"
  val emptyCollection = Collection(items=Nil, displayName=None)
  val defaultIds: List[String] = List(
    "uk", "uk/commentisfree", "uk/sport", "uk/culture", "uk/business", "uk/money",
    "us", "us/commentisfree", "us/sport", "us/culture", "us/business", "us/money",
    "au", "au/commentisfree", "au/sport", "au/culture", "au/business", "au/money"
  )

  def createConfig(id: String): Config = Config(
    id              = "%s/%s".format(id, defaultStyle),
    contentApiQuery = Option(ContentApi.FaciaDefaults.generateContentApiQuery(id)),
    displayName     = None
  )

  def getEdition(id: String): Edition = Edition.all.find(edition => id.toLowerCase.startsWith(edition.id.toLowerCase)).getOrElse(Edition.defaultEdition)

  def configTuple(id: String): Config = createConfig(id)

  def getDefaultSetup: List[(Config, Collection)] = defaultIds.map (id => (createConfig(id), emptyCollection))

  def getDefaultPageFront: Map[String, Query] = defaultIds.map(id => (id, Query(id, getEdition(id)))).toMap

}

object FaciaDefaults extends FaciaDefaults
