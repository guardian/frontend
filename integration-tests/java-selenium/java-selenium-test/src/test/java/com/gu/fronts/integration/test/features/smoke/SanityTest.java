package com.gu.fronts.integration.test.features.smoke;

import org.junit.Test;
import org.junit.runner.RunWith;
import org.springframework.test.context.ContextConfiguration;
import org.springframework.test.context.junit4.SpringJUnit4ClassRunner;

import com.gu.fronts.integration.test.SpringTestConfig;
import com.gu.fronts.integration.test.common.AbstractParentTestClass;
import com.gu.fronts.integration.test.page.NetworkFrontPage;

/**
 * This will run some sanity tests to make sure basic functionality is working properly
 */
@RunWith(SpringJUnit4ClassRunner.class)
@ContextConfiguration(classes = SpringTestConfig.class)
public class SanityTest extends AbstractParentTestClass {

    @Test
    public void networkStartPageShouldLoadProperly() {
        NetworkFrontPage networkFrontPage = openNetworkFrontPage();
        networkFrontPage.isDisplayed();
        networkFrontPage.footer().isDisplayed();
        networkFrontPage.header().isDisplayed();
        
        networkFrontPage = networkFrontPage.header().clickLogo();
        networkFrontPage.isDisplayed();
        
        networkFrontPage = networkFrontPage.footer().clickLogo();
        networkFrontPage.isDisplayed();
        
        networkFrontPage.header().ukEditionSelected();
        networkFrontPage.header().usEditionPresent();
        networkFrontPage.header().auEditionPresent();
    }
}
