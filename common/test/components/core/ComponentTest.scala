package components.core

import model.{ApplicationContext, ApplicationIdentity}
import org.scalatest.{FlatSpec, Matchers}
import play.api.Environment
import play.twirl.api.Html

class ComponentTest extends FlatSpec with Matchers {

  implicit val testContext = ApplicationContext(Environment.simple(), ApplicationIdentity("tests"))

  object PageComponent extends HtmlComponent {
    override def html: Html = Html(
      """
        |<html>
        |   <head>
        |   </head>
        |   <body>
        |      <div class="text">Text</div>
        |   </body>
        |</html>
        |""".stripMargin)

    override def componentCss: Seq[Css] = Seq(
      Css(
        """
          |.text {
          |   color: black;
          |}
        """.stripMargin)
    )
  }

  object ButtonComponent extends HtmlComponent {
    override def html: Html = Html("""
        |<button type="button" class="info">Click Me!</button>
        |""".stripMargin)

    override def componentCss: Seq[Css] = Seq(
      Css(
        """
          |.info {
          |   color: blue;
          |}
        """.stripMargin)
    )
  }

  "A component with a head tag" should "be rendered with inlined css" in {
    PageComponent.render().toString should include("<style>")
  }

  "A component without a head tag" should "not contain inlined css" in {
    ButtonComponent.render().toString should not include("<style>")
  }

}

