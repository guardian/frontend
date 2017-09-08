package discussion.api

import play.api.libs.json.JsValue
import scala.concurrent._
import play.api.libs.ws.WSResponse
import discussion.model.WitnessActivity
import discussion.util.Http

trait WitnessApi extends Http {
  protected val witnessApiRoot: String

  def getWitnessActivity(userId: String): Future[List[WitnessActivity]] = {
    val witnessUrl: String = s"$witnessApiRoot/search?noticeboardOwnedBy=guardianwitness&partnerUser=guardian.co.uk:$userId"
    def onError(r: WSResponse) = s"Error loading WitnessActivity, status: ${r.status}, message: ${r.statusText}, response: ${r.body}"
    def getWitnessActivity(json: JsValue): List[WitnessActivity] = {
      for {
        activity <- (json \ "results").as[List[JsValue]]
      } yield WitnessActivity(activity)
    }

    getJsonOrError(witnessUrl, onError) map getWitnessActivity
  }
}


