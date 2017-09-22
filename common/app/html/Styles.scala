package html

import play.twirl.api.Html

trait Styles {
  def criticalCss: Html
  def linkCss: Html
  def oldIECriticalCss: Html
  def oldIELinkCss: Html
  def IE9CriticalCss: Html
  def IE9LinkCss: Html
}
