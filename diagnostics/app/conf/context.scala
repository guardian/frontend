package conf

import play.api.mvc.Action

object HealthCheck extends HealthcheckController {

  override lazy val testPort: Int = 9006

  override def healthcheck() = Action.async{
    fetchResult("/ab.gif").map{
      case (_, 204) => Ok("ok")
      case (msg, status) => InternalServerError(s"$status $msg")
    }
  }
}
