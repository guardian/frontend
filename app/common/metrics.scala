package common

import com.gu.management.{ TimingMetric, Metric }
import play.api.mvc.{ Action, Result, AnyContent, Request }

class TimingAction(group: String, name: String, title: String, description: String, master: Option[Metric] = None)
    extends TimingMetric(group, name, title, description, master) {

  def apply(f: Request[AnyContent] => Result): Action[AnyContent] = {
    Action {
      request =>
        measure {
          f(request)
        }
    }
  }
  def apply(f: => Result): Action[AnyContent] = {
    Action {
      measure {
        f
      }
    }
  }
}
