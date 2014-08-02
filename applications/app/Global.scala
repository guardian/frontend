import common.CloudWatchApplicationMetrics
import conf.{Configuration, Filters}
import dev.DevParametersLifecycle
import dfp.DfpAgentLifecycle
import ophan.SurgingContentAgentLifecycle
import play.api.mvc.WithFilters

object Global extends WithFilters(Filters.common: _*)
                      with DevParametersLifecycle
                      with CloudWatchApplicationMetrics
                      with DfpAgentLifecycle
                      with SurgingContentAgentLifecycle{
  override lazy val applicationName = "frontend-applications"
}
