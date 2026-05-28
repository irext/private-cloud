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
 * Revised:        Date: 2019-06-08
 * Revision:       Revision: 1.0
 * <p>
 * Description:    IRext private server login logic
 * <p>
 * Revision log:
 * 2019-06-08: created by strawmanbobi
 */
@Controller
public class AppLoginLogic {
    private static final String TAG = AppLoginLogic.class.getName();

    private static final MediaType JSON
            = MediaType.parse("application/json; charset=utf-8");

    @Value("${user.irext.server}")
    private String irextServerUrl;

    public UserApp login(AppSignInRequest appSignInRequest) {
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
