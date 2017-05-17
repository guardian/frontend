package components

import components.core.{ComponentCss, Css, HtmlComponent}
import model.ApplicationContext
import play.twirl.api.Html

case class MyComponent(implicit context: ApplicationContext) extends HtmlComponent {

  val myTitle: MyTitle = MyTitle("This is the title")
  val myText: MyText = MyText("This is the text")

  override def html: Html = views.html.prototype.MyComponent()(myTitle.html, myText.html)
  override def componentCss: Seq[Css] = Seq(
    ComponentCss.load("component-myComponent")
  )
}

case class MyTitle(title: String)(implicit context: ApplicationContext) extends HtmlComponent {
  override def html: Html = views.html.prototype.MyTitle(title)
  override def componentCss: Seq[Css] = Seq(
    ComponentCss.load("component-myTitle")
  )
}

case class MyText(text: String)(implicit context: ApplicationContext) extends HtmlComponent {
  override def html: Html = views.html.prototype.MyText(text)
  override def componentCss: Seq[Css] = Seq(
    ComponentCss.load("component-myText")
  )
}
