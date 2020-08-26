package html

import model.ApplicationContext
import play.twirl.api.Html

trait Styles {
  def criticalCssLink: Html
  def criticalCssInline: Html
  def linkCss: Html
  def oldIECriticalCss: Html
  def oldIELinkCss: Html
  def IE9CriticalCss: Html
  def IE9LinkCss: Html

  def criticalCss(implicit context: ApplicationContext): Html =
    if (context.environment.mode == play.api.Mode.Dev || !conf.switches.Switches.InlineCriticalCss.isSwitchedOn) {
      criticalCssLink
    } else {
      criticalCssInline
    }
}
