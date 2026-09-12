package net.irext.server.businesslogic;

import com.google.gson.Gson;
import net.irext.server.utils.Constants;
import net.irext.server.utils.LoggerUtil;
import okhttp3.*;
import net.irext.server.model.UserApp;
import net.irext.server.request.AppSignInRequest;
import net.irext.server.response.LoginResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Controller;

/**
 * Filename:       AppLoginLogic.java
 * Revised:        Date: 2026-08-31
 * Revision:       Revision: 1.1
 * <p>
 * Description:    IRext private server login logic
 * <p>
 * Revision log:
 * 2019-06-08: created by strawmanbobi
 * 2026-08-31: added offline mode support by strawmanbobi
 */
@Controller
public class AppLoginLogic {
    private static final String TAG = AppLoginLogic.class.getName();

    private static final MediaType JSON
            = MediaType.parse("application/json; charset=utf-8");

    private static final int OFFLINE_USER_APP_ID = 1;

    @Value("${user.irext.server}")
    private String irextServerUrl;

    @Value("${irext.server.offline:0}")
    private String offlineMode;

    @Value("${irext.server.appkey:}")
    private String configuredAppKey;

    @Value("${irext.server.appsecret:}")
    private String configuredAppSecret;

    public UserApp login(AppSignInRequest appSignInRequest) {
        if (Integer.parseInt(offlineMode) == Constants.DEPLOY_MODE_OFFLINE) {
            return offlineLogin(appSignInRequest);
        }
        return hybridLogin(appSignInRequest);
    }

    private UserApp offlineLogin(AppSignInRequest appSignInRequest) {
        LoggerUtil.getInstance().trace(TAG, "authenticating in offline mode" +
                ", appKey: " + appSignInRequest.getAppKey() + ", appSecret: " + appSignInRequest.getAppSecret() +
                ", configuredAppKey: " + configuredAppKey + ", configuredAppSecret: " + configuredAppSecret);
        if (configuredAppKey.equals(appSignInRequest.getAppKey())
                && configuredAppSecret.equals(appSignInRequest.getAppSecret())) {
            UserApp userApp = new UserApp();
            userApp.setId(OFFLINE_USER_APP_ID);
            userApp.setAppKey(configuredAppKey);
            return userApp;
        }
        LoggerUtil.getInstance().trace(TAG, "offline authentication failed");
        return null;
    }

    private UserApp hybridLogin(AppSignInRequest appSignInRequest) {
        String url = irextServerUrl + Constants.APP_LOGIN_URL;
        String requestBody = new Gson().toJson(appSignInRequest);
        OkHttpClient client = new OkHttpClient();

        RequestBody body = RequestBody.create(requestBody, JSON);
        Request request = new Request.Builder()
                .url(url)
                .post(body)
                .build();
        try {
            Response response = client.newCall(request).execute();
            if (response.body() != null) {
                String responseBody = response.body().string();
                LoginResponse loginResponse = new Gson().fromJson(responseBody, LoginResponse.class);
                return loginResponse.getEntity();
            }
        } catch(Exception e) {
            e.printStackTrace();
        }
        return null;
    }
}
