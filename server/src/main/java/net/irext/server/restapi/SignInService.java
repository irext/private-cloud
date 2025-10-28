package net.irext.server.restapi;

import jakarta.servlet.http.HttpServletRequest;
import net.irext.server.utils.Constants;
import net.irext.server.businesslogic.UserLoginLogic;
import net.irext.server.cache.IUserAppRepository;
import net.irext.server.model.UserApp;
import net.irext.server.request.AppSignInRequest;
import net.irext.server.response.LoginResponse;
import net.irext.server.response.Status;
import net.irext.server.restapi.base.AbstractBaseService;
import net.irext.server.utils.MD5Util;
import net.irext.server.utils.VeDate;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * Filename:       SignInServiceImpl.java
 * Revised:        Date: 2017-04-27
 * Revision:       Revision: 1.0
 * <p>
 * Description:    User app login server
 * <p>
 * Revision log:
 * 2017-04-27: created by strawmanbobi
 */

@RestController
@RequestMapping("/irext-server/app")
@Service("SignInService")
@SuppressWarnings("unused")
public class SignInService extends AbstractBaseService {

    private static final String TAG = SignInService.class.getSimpleName();

    private UserLoginLogic loginLogic;

    private IUserAppRepository userAppRepository;

    @Autowired
    public void setLoginLogic(UserLoginLogic loginLogic) {
        this.loginLogic = loginLogic;
    }

    @Autowired
    public void setUserAppRepository(IUserAppRepository userAppRepository) {
        this.userAppRepository = userAppRepository;
    }

    @PostMapping("/app_login")
    public LoginResponse signIn(HttpServletRequest request, @RequestBody AppSignInRequest appSignInRequest) {
        try {
            LoginResponse response = new LoginResponse();
            response.setStatus(new Status());

            if (appSignInRequest == null ||
                    StringUtils.isEmpty(appSignInRequest.getAppKey()) ||
                    StringUtils.isEmpty(appSignInRequest.getAppSecret())) {
                response.getStatus().setCode(Constants.ERROR_CODE_NETWORK_ERROR);
                return response;
            }

            UserApp userApp = loginLogic.login(appSignInRequest);

            if (userApp != null) {
                // generate token by date time
                String currentTime = VeDate.getNow().toString();
                String tokenSource = currentTime + userApp.getAppKey();
                String token = MD5Util.MD5Encode(tokenSource, null);
                userAppRepository.add(userApp.getId(), token);

                userApp.setToken(token);

                response.getStatus().setCode(Constants.ERROR_CODE_SUCCESS);
                response.setEntity(userApp);
            } else {
                response.getStatus().setCode(Constants.ERROR_CODE_AUTH_FAILURE);
            }

            return response;
        } catch (Exception e) {
            e.printStackTrace();
            return getExceptionResponse(LoginResponse.class);
        }
    }
}
