package common

import org.scalatest.{FlatSpec, Matchers}
import play.twirl.api.Html
import views.support.{ChaptersLinksCleaner, WitnessCleaner, withJsoup}

class ChaptersLinksCleanerTest extends FlatSpec with Matchers {

  "ChaptersLinksCleaner" should "add slug ids to chapter h2 headings surrounded by chapter sections" in {

    val html: Html = withJsoup(
      """<body>
        | <section class="auto-chapter"><h2><strong>St Mary’s</strong></h2>
        | some text about the chapter
        | </section>
        | <section class="auto-chapter"><h2><strong>Best places for £20</strong></h2>
        | some text other about the chapter
        | </section>
        | </body>""".stripMargin) { ChaptersLinksCleaner }

    html.body should include("<h2 id=\"st-marys\"><strong>St Mary’s</strong></h2>")
    html.body should include("<h2 id=\"best-places-for-20\"><strong>Best places for &pound;20</strong></h2>")
  }

  "ChaptersLinkCleaner" should "not add h2 headings not surrounded by chapter sections" in {
    val html: Html = withJsoup(
      """<body>
        | <h2><strong>St Mary’s</strong></h2>
        | some text about the chapter
        | </section>
        | <section class="auto-chapter"><h2><strong>Best places for £20</strong></h2>
        | some text other about the chapter
        | </section>
        | </body>""".stripMargin) { ChaptersLinksCleaner }

    html.body should not include("<h2 id=\"st-marys\"><strong>St Mary’s</strong></h2>")

    html.body should include("<h2 id=\"best-places-for-20\"><strong>Best places for &pound;20</strong></h2>")
  }
}
