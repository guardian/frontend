package controllers.front

import play.api.libs.json.{JsValue, Json}

trait FaciaDefaults {

  def getDefaultConfig: JsValue = Json.parse(defaultJson)

  def defaultJson: String =
    """
      {
        "fronts" : {
          "uk/business" : {
            "collections" : [ "uk/business/regular-stories" ]
          },
          "uk" : {
            "collections" : [ "uk/news/regular-stories" ]
          },
          "au/money" : {
            "collections" : [ "au/money/regular-stories" ]
          },
          "uk/commentisfree" : {
            "collections" : [ "uk/commentisfree/regular-stories" ]
          },
          "au/commentisfree" : {
            "collections" : [ "au/commentisfree/regular-stories" ]
          },
          "au/sport" : {
            "collections" : [ "au/sport/regular-stories" ]
          },
          "uk/culture" : {
            "collections" : [ "uk/culture/regular-stories" ]
          },
          "us/culture" : {
            "collections" : [ "us/culture/regular-stories" ]
          },
          "us" : {
            "collections" : [ "us/news/regular-stories" ]
          },
          "us/commentisfree" : {
            "collections" : [ "us/commentisfree/regular-stories" ]
          },
          "uk/sport" : {
            "collections" : [ "uk/sport/regular-stories" ]
          },
          "us/business" : {
            "collections" : [ "us/business/regular-stories" ]
          },
          "us/money" : {
            "collections" : [ "us/money/regular-stories" ]
          },
          "us/sport" : {
            "collections" : [ "us/sport/regular-stories" ]
          },
          "au" : {
            "collections" : [ "au/news/regular-stories" ]
          },
          "au/business" : {
            "collections" : [ "au/business/regular-stories" ]
          },
          "uk/money" : {
            "collections" : [ "uk/money/regular-stories" ]
          },
          "au/culture" : {
            "collections" : [ "au/culture/regular-stories" ]
          }
        },
        "collections" : {
          "uk/business/regular-stories" : {
            "apiQuery" : "business?edition=UK"
          },
          "uk/news/regular-stories" : {
            "apiQuery" : "?edition=UK"
          },
          "au/money/regular-stories" : {
            "apiQuery" : "money?edition=AU"
          },
          "uk/commentisfree/regular-stories" : {
            "apiQuery" : "commentisfree?edition=UK"
          },
          "au/commentisfree/regular-stories" : {
            "apiQuery" : "commentisfree?edition=AU"
          },
          "au/sport/regular-stories" : {
            "apiQuery" : "sport?edition=AU"
          },
          "uk/culture/regular-stories" : {
            "apiQuery" : "culture?edition=UK"
          },
          "us/culture/regular-stories" : {
            "apiQuery" : "culture?edition=US"
          },
          "us/news/regular-stories" : {
            "apiQuery" : "?edition=US"
          },
          "us/commentisfree/regular-stories" : {
            "apiQuery" : "commentisfree?edition=US"
          },
          "uk/sport/regular-stories" : {
            "apiQuery" : "sport?edition=UK"
          },
          "us/business/regular-stories" : {
            "apiQuery" : "business?edition=US"
          },
          "us/money/regular-stories" : {
            "apiQuery" : "money?edition=US"
          },
          "us/sport/regular-stories" : {
            "apiQuery" : "sport?edition=US"
          },
          "au/news/regular-stories" : {
            "apiQuery" : "?edition=AU"
          },
          "au/business/regular-stories" : {
            "apiQuery" : "business?edition=AU"
          },
          "uk/money/regular-stories" : {
            "apiQuery" : "money?edition=UK"
          },
          "au/culture/regular-stories" : {
            "apiQuery" : "culture?edition=AU"
          }
        }
      }
    """
}

object FaciaDefaults extends FaciaDefaults
