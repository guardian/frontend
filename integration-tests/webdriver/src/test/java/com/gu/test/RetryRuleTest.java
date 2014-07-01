package com.gu.test;

import com.gu.test.helpers.RetryRule;
import org.junit.Assert;
import org.junit.Ignore;
import org.junit.Rule;
import org.junit.Test;

public class RetryRuleTest {

    @Rule
    public RetryRule retry = new RetryRule(2);

    private static int failCount = 0;

    @Test
    public void testAssertionFailureRetry() {
        if (failCount % 2 == 0) {
            failCount++;
            System.out.println("FAIL RUN: " + failCount);
            Assert.assertTrue("FAIL!", false);
        } else {
            System.out.println("TEST RUN SUCCESS");
            failCount = 0;
        }
    }

    @Test
    public void testExceptionFailureRetry() {
        if (failCount % 2 == 0) {
            failCount++;
            System.out.println("FAIL RUN: " + failCount);
            throw new RuntimeException("FAIL!");
        } else {
            System.out.println("TEST RUN SUCCESS");
            failCount = 0;
        }
    }
    
    @Test
    @Ignore
    public void testGiveupFailure(){
        throw new RuntimeException("FAIL!");
    }
}
