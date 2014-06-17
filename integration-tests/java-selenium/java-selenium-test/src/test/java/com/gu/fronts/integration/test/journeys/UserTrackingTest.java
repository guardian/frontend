package com.gu.fronts.integration.test.journeys;

import org.junit.Ignore;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.springframework.test.context.ContextConfiguration;
import org.springframework.test.context.junit4.SpringJUnit4ClassRunner;

import com.gu.fronts.integration.test.common.StubbedFrontsIntegrationTestCase;
import com.gu.fronts.integration.test.config.SpringTestConfig;

@RunWith(SpringJUnit4ClassRunner.class)
@ContextConfiguration(classes = SpringTestConfig.class)
@Ignore
public class UserTrackingTest extends StubbedFrontsIntegrationTestCase {

    @Test
    public void theCorrectTrackingInformationShouldBeSentForSportArticle() throws Exception {
        // TODO
    }
}