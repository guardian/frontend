package discussion.model

import play.api.libs.json.{JsArray, JsValue}
import org.joda.time.DateTime
import org.joda.time.Days

case class WitnessActivity(
    headline: String,
    webUrl: String,
    image: Option[String],
    bodyShort: String,
    daysAgo: String
)

object WitnessActivity {
    def apply(json: JsValue): WitnessActivity = {
        val updates = (json \ "updates").as[JsArray].value.head
        val body = (updates \ "body").as[String]
        val bodyTrimmed = body.split(" ",21).dropRight(1).mkString(" ")
        val daysAgo = Days.daysBetween(new DateTime((updates \ "created").as[String]) , new DateTime() ).getDays()
        val daysAgoStr = daysAgo match {
          case 0 => "just now"
          case 1 => "1 day ago"
          case default => daysAgo + " days ago"
        }
        WitnessActivity(
            headline = (json \ "headline").as[String],
            webUrl = (json \ "webUrl").as[String],
            image = (updates \ "image" \ "mediumlandscapecropdouble").asOpt[String],
            bodyShort = if(bodyTrimmed.length<body.length) bodyTrimmed+"..."  else bodyTrimmed,
            daysAgo = daysAgoStr
        )
    }
}