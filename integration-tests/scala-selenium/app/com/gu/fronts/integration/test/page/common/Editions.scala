package com.gu.fronts.integration.test.page.common

import com.gu.fronts.integration.test.page.util.PageElementHelper.elementIsALink
import java.lang.String.format
import org.openqa.selenium.WebDriver
import org.openqa.selenium.WebElement
import com.gu.fronts.integration.test.fw.selenium.ByTestAttributeSelector
import com.gu.fronts.integration.test.fw.selenium.FindByTestAttribute
import com.gu.fronts.integration.test.page.nwfront.NetworkFrontPage
import com.gu.fronts.integration.test.page.util.AbstractParentPage

class Editions(webDriver: WebDriver) extends AbstractParentPage(webDriver) {

  @FindByTestAttribute(using = "editions")
  private var editions: WebElement = _

  @FindByTestAttribute(using = "edition-US")
  private var editionUS: WebElement = _

  @FindByTestAttribute(using = "edition-UK")
  private var editionUK: WebElement = _

  @FindByTestAttribute(using = "edition-AU")
  private var editionAU: WebElement = _

  override def isDisplayed(): Editions = {
    super.assertExistsAndDisplayed(editions, editionUK, editionUS, editionAU)
    this
  }

  def selectUSEdition(): NetworkFrontPage = {
    editionUS.click()
    pageFactory.initPage(webDriver, classOf[NetworkFrontPage])
  }

  def selectUKEdition(): NetworkFrontPage = {
    editionUK.click()
    pageFactory.initPage(webDriver, classOf[NetworkFrontPage])
  }

  def selectAUEdition(): NetworkFrontPage = {
    editionAU.click()
    pageFactory.initPage(webDriver, classOf[NetworkFrontPage])
  }

  def usEditionSelected(): Editions = editionSelected(editionUS)

  def isUkEditionSelected(): Editions = editionSelected(editionUK)

  def auEditionSelected(): Editions = editionSelected(editionAU)

  private def editionSelected(editionElement: WebElement): Editions = {
    if (elementIsALink(editionElement)) {
      throw new AssertionError(format("%s was not selected", editionElement.getAttribute(ByTestAttributeSelector.TEST_ATTR_NAME)))
    }
    this
  }

  def isUsEditionPresent(): Editions = {
    super.assertExistsAndDisplayed(editionUS)
    this
  }

  def isAuEditionPresent(): Editions = {
    super.assertExistsAndDisplayed(editionAU)
    this
  }
}