package com.gu.fronts.endtoend.engine;

import hu.meza.aao.Action;
import hu.meza.tools.HttpClientWrapper;
import org.apache.http.cookie.Cookie;

public interface TrailBlockAction extends Action {

    void setAuthenticationData(Cookie cookie);

    void useClient(HttpClientWrapper client);

    boolean success();

}
