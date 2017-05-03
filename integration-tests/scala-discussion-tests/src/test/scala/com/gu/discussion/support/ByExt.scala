package com.gu.discussion.support

import org.openqa.selenium.By

/**
 * Created by glockett.
 */
object ByExt {

  def dataTypeStream(value: String) = By.cssSelector(s"""[data-stream-type="$value"]""")
  def dataLinkName(value: String) = By.cssSelector(s"""[data-link-name="$value"]""")
  def dataTypeContent(value: String) = By.cssSelector(s"""[data-link-content="$value"]""")

}
