package com.gu.fronts.integration.test.features;

import org.junit.Before;
import org.junit.Test;
import org.junit.experimental.categories.Category;
import org.junit.runner.RunWith;
import org.springframework.test.context.ContextConfiguration;
import org.springframework.test.context.junit4.SpringJUnit4ClassRunner;

import com.gu.fronts.integration.test.categories.AnyEnvironment;
import com.gu.fronts.integration.test.common.StubbedFrontsIntegrationTestCase;
import com.gu.fronts.integration.test.config.SpringTestConfig;

@RunWith(SpringJUnit4ClassRunner.class)
@ContextConfiguration(classes = SpringTestConfig.class)
public class NetworkFrontTest extends StubbedFrontsIntegrationTestCase {

    @Before
    public void beforeTestCase() {
        stubPressedJsonByFileName("NetworkStartPage-pressed.json");
        networkFrontPage = openNetworkFrontPage();
    }

    @Test
    @Category(AnyEnvironment.class)
    public void networkStartPageShouldHaveFooterAndHeader() throws Exception {
        networkFrontPage.isDisplayed();
        networkFrontPage.footer().isDisplayed();
        networkFrontPage.header().isDisplayed();

        networkFrontPage = networkFrontPage.header().clickLogo();
        networkFrontPage.isDisplayed();

        networkFrontPage = networkFrontPage.footer().clickLogo();
        networkFrontPage.isDisplayed();
    }

    @Test
    @Category(AnyEnvironment.class)
    public void networkStartPageShouldHaveEditionsDisplayedProperly() throws Exception {
        networkFrontPage.header().editions().isDisplayed();
        networkFrontPage.header().editions().isUkEditionSelected();
        networkFrontPage.header().editions().usUsEditionPresent();
        networkFrontPage.header().editions().isAuEditionPresent();
    }
}
