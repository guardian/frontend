package controllers.front

import model.Collection
import common.Edition
import play.api.libs.json.{JsObject, Json}

trait FaciaDefaults {

  val defaultStyle = "regular-stories"
  val emptyCollection = Collection(items=Nil, displayName=None)

  val frontsMap: Map[String, List[String]] = Map(
    ("uk",                List("uk/news/regular-stories")),
    ("us",                List("us/news/regular-stories")),
    ("au",                List("au/news/regular-stories")),
    ("uk/commentisfree",  List("uk/commentisfree/regular-stories")),
    ("us/commentisfree",  List("us/commentisfree/regular-stories")),
    ("au/commentisfree",  List("au/commentisfree/regular-stories")),
    ("uk/sport",          List("uk/sport/regular-stories")),
    ("us/sport",          List("us/sport/regular-stories")),
    ("au/sport",          List("au/sport/regular-stories")),
    ("uk/culture",        List("uk/culture/regular-stories")),
    ("us/culture",        List("us/culture/regular-stories")),
    ("au/culture",        List("au/culture/regular-stories")),
    ("uk/business",       List("uk/business/regular-stories")),
    ("us/business",       List("us/business/regular-stories")),
    ("au/business",       List("au/business/regular-stories")),
    ("uk/money",          List("uk/money/regular-stories")),
    ("us/money",          List("us/money/regular-stories")),
    ("au/money",          List("au/money/regular-stories"))
  )

  val collectionsMap: Map[String, Map[String, String]] = Map(
    ("uk/news/regular-stories",           Map(("apiQuery", "?edition=UK"))),
    ("us/news/regular-stories",           Map(("apiQuery", "?edition=US"))),
    ("au/news/regular-stories",           Map(("apiQuery", "?edition=AU"))),
    ("uk/commentisfree/regular-stories",  Map(("apiQuery", "commentisfree?edition=UK"))),
    ("us/commentisfree/regular-stories",  Map(("apiQuery", "commentisfree?edition=US"))),
    ("au/commentisfree/regular-stories",  Map(("apiQuery", "commentisfree?edition=AU"))),
    ("uk/sport/regular-stories",          Map(("apiQuery", "sport?edition=UK"))),
    ("us/sport/regular-stories",          Map(("apiQuery", "sport?edition=US"))),
    ("au/sport/regular-stories",          Map(("apiQuery", "sport?edition=AU"))),
    ("uk/culture/regular-stories",        Map(("apiQuery", "culture?edition=UK"))),
    ("us/culture/regular-stories",        Map(("apiQuery", "culture?edition=US"))),
    ("au/culture/regular-stories",        Map(("apiQuery", "culture?edition=AU"))),
    ("uk/business/regular-stories",       Map(("apiQuery", "business?edition=UK"))),
    ("us/business/regular-stories",       Map(("apiQuery", "business?edition=US"))),
    ("au/business/regular-stories",       Map(("apiQuery", "business?edition=AU"))),
    ("uk/money/regular-stories",          Map(("apiQuery", "money?edition=UK"))),
    ("us/money/regular-stories",          Map(("apiQuery", "money?edition=US"))),
    ("au/money/regular-stories",          Map(("apiQuery", "money?edition=AU")))
  )

  def getDefaultConfig: JsObject = Json.obj(
    "fronts"      -> frontsMap.keys.foldLeft(Json.obj()){case (m, id) => m ++
      Json.obj(id ->
        Json.obj("collections" ->
          Json.arr(frontsMap.get(id))
        )
      )
    },
    "collections" -> frontsMap.values.flatten.foldLeft(Json.obj()){case (m, id) => m ++
      Json.obj(id -> collectionsMap.get(id))
    }
  )

  def getEdition(id: String): Edition = Edition.all.find(edition => id.toLowerCase.startsWith(edition.id.toLowerCase)).getOrElse(Edition.defaultEdition)
}

object FaciaDefaults extends FaciaDefaults
