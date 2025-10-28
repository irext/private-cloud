package net.irext.server.businesslogic;

import com.google.gson.Gson;
import com.squareup.okhttp.*;
import net.irext.server.model.UserApp;
import net.irext.server.request.AppSignInRequest;
import net.irext.server.response.LoginResponse;
import org.springframework.stereotype.Controller;

/**
 * Filename:       UserLoginLogic
 * Revised:        Date: 2019-06-08
 * Revision:       Revision: 1.0
 * <p>
 * Description:    IRext private server login logic
 * <p>
 * Revision log:
 * 2019-06-08: created by strawmanbobi
 */
@Controller
public class UserLoginLogic {
    private static final MediaType JSON
            = MediaType.parse("application/json; charset=utf-8");

    public UserApp login(AppSignInRequest appSignInRequest) {
        String url = "http://irext.net/irext-server/app/app_login";
        String requestBody = new Gson().toJson(appSignInRequest);
        OkHttpClient client = new OkHttpClient();

        RequestBody body = RequestBody.create(JSON, requestBody);
        Request request = new Request.Builder()
                .url(url)
                .post(body)
                .build();
        try {
            Response response = client.newCall(request).execute();
            String responseBody = response.body().string();
            LoginResponse loginResponse = new Gson().fromJson(responseBody, LoginResponse.class);
            return loginResponse.getEntity();
        } catch(Exception e) {
            e.printStackTrace();
        }
        return null;
    }
}
