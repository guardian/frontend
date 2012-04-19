package frontend.common

import play.api.Logger
import com.gu.conf.{ Configuration => GuardianConfiguration }

trait Logging {
  implicit val log = Logger(getClass)
}
