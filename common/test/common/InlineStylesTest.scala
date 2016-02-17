package common

import org.scalatest.{FlatSpec, Matchers}

class InlineStylesTest extends FlatSpec with Matchers {
  // https://www.w3.org/TR/css3-selectors/#specificity
  it should "calculate specifity" in {
    CSSRule("*", "").specifity should be(0)
    CSSRule("LI", "").specifity should be(1)
    CSSRule("UL LI", "").specifity should be(2)
    CSSRule("UL OL +LI", "").specifity should be(3)
    CSSRule("H1 + *[REL = up]", "").specifity should be(11)
    CSSRule("UL OL LI.red", "").specifity should be(13)
    CSSRule("LI.red.level", "").specifity should be(21)
    CSSRule("#x34y", "").specifity should be(100)
    CSSRule("#s12: not (FOO)", "").specifity should be(101)
  }
}
