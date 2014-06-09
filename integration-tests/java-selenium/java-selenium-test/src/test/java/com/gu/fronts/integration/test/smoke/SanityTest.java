package com.gu.fronts.integration.test.smoke;

import org.junit.Test;
import org.junit.runner.RunWith;
import org.springframework.test.context.ContextConfiguration;
import org.springframework.test.context.junit4.SpringJUnit4ClassRunner;

import com.gu.fronts.integration.SpringTestConfig;
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
        // Given
        NetworkFrontPage networkFrontPage = openNetworkFrontPage();
        
        //When
        //no actions

        // Then
        networkFrontPage.isDisplayed();
        
        //networkFrontPage.sports().isDisplayed();
    }
}
