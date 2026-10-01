# IRext Private Cloud

This repository is the private cloud edition of IRext services and consoles

## Deployment
1. Prerequisite: Linux Server (Ubuntu 22.04 is recommended) and Docker runtime.

2. Go to the 'Applications' page, create an application of type 'Private Service', then click the application entry to enter the details page.
<img width="600" height="316" alt="image" src="https://github.com/user-attachments/assets/99289a5e-a965-49de-a39e-e0fed87731a4" />

3. On the details page, click the 'View Deployment Method' button to see two supported deployment options. Please select the radio buttons below according to your actual environment and requirements to view the deployment and initialization instructions for each mode.

### Hybrid cloud deployment

The private service works in collaboration with the public cloud, authentication and data updates are handled through the public cloud

In hybrid cloud mode, the private service host requires Internet access. Follow the steps in the private service application details on the "Applications" page and run the docker run command directly.

<img width="520" height="560" alt="image" src="https://github.com/user-attachments/assets/ef267194-c2a1-4f8a-b49d-38e9f24e4a2f" />

During this process, please ensure that the deployment administrator is the IRext account that applied to create the "Private Service Application". The administrator's IRext login password, and the APP Key and APP Secret of the private service application are all sensitive information. Please keep these credentials safe and do not disclose them.

### Offline deployment

Runs completely offline, all authentication and data are managed locally.

In offline deployment mode, since the private service host cannot connect to the Internet or can only connect with restrictions, you need to follow the instructions in the private service application details on the "Application" page, download the container image package on a host with Internet access, safely copy it to the private service host, and then import and start the container image.

<img width="520" height="560" alt="image" src="https://github.com/user-attachments/assets/ffc21d3f-b663-4fac-9bc9-af9f95bff6ad" />

During this process, please ensure that the deployment administrator is the IRext account that applied to create the "Private Service Application". The administrator's IRext login password, and the APP Key and APP Secret of the private service application are all sensitive information. Please keep these credentials safe and do not disclose them.

After the container starts successfully, please wait 1 minute. Then open http://<server_ip>:8080 in a browser on a PC connected to the private service to access the private service console and enter the initialization settings.


## Installation

### Hybrid cloud installation:
  
1. In hybrid cloud deployment mode, the private service can call the user authentication and data synchronization Restful API of the IRext public cloud, facilitating convenient data download and import.

2. When logging in to the private service console for the first time, you can choose the hybrid cloud deployment mode or the offline deployment mode (hybrid cloud mode is compatible with offline mode). It is recommended to choose the hybrid cloud mode.

<img width="522" height="398" alt="image" src="https://github.com/user-attachments/assets/1e41e747-d0c8-4dff-baa3-98e58a5911b0" />

3. Then enter your IRext username (email address) and 6-digit numeric password to perform administrator authentication.

<img width="522" height="411" alt="image" src="https://github.com/user-attachments/assets/08ec7bdf-b7df-4c37-bbfc-c76db8343b0c" />

4. After the administrator authentication passes, it begins to download and import the private service data, which is stored in the container of the private service, completely isolated from the IRext public cloud.

<img width="522" height="320" alt="image" src="https://github.com/user-attachments/assets/813ff86e-83c1-499a-9802-19c7cf059e5a" />
<img width="522" height="355" alt="image" src="https://github.com/user-attachments/assets/2499d10c-230c-4c1a-be31-442503ee4342" />

5. After initialization, you can enter the administrator username and password again to log in to the private service console, download binary codes in the console, and perform online decoding and data updates.

<img width="522" height="421" alt="image" src="https://github.com/user-attachments/assets/a5cf7cec-2371-4bd3-975f-e7704a7e6c55" />

### Offiline mode installation

1. In offline deployment mode, the deployment administrator must be the IRext user who created the private service application on the public cloud. Therefore, authentication is done by entering the APP_SECRET. The APP_SECRET can be obtained from the private service application details on the "Application" page.

<img width="522" height="398" alt="image" src="https://github.com/user-attachments/assets/7d140f9b-edee-4ddf-994c-baf4d89818cf" />
<img width="522" height="357" alt="image" src="https://github.com/user-attachments/assets/c6790660-b9a1-4876-b0f2-eef253052a05" />

2. After the identity verification passes, you proceed to the data import step. You need to upload the encrypted data package (.tar.gz.enc format, no larger than 200MB) downloaded from the public cloud, which can be obtained by clicking the "Download Data Pack" button in the private service application details on the "Application" page. After the upload, the system automatically decrypts and extracts the package, and imports the code index database and the IR binary codes into the container of the private service. The import progress is displayed in real time, please wait patiently until it completes.

<img width="522" height="357" alt="image" src="https://github.com/user-attachments/assets/b0c09100-46c6-46c6-95c6-b9c3289e3eef" />
<img width="522" height="367" alt="image" src="https://github.com/user-attachments/assets/f986e7c2-c5b4-4488-9fa3-e1f726be876b" />

3. After the data import completes, the initialization succeeds. Click the "Go to Login" button and the page returns to the login screen. You can then log in to the private service console with the IRext administrator account (email address and login password) that created the private service application, and perform online decoding, data updates and other operations.

<img width="522" height="421" alt="image" src="https://github.com/user-attachments/assets/d869e81b-6389-4b45-b215-9bc1e8f45143" />

## Use Console

1. Enter local console, find your target remote control binary step by step and download the bin file.

2. Use the online decoding feature to manually obtain and analyze the carrier time sequence generated after decoding the remote control binary code.

## Use Web Restful API and Cloud SDK

### Call Restful API directly

The private service provides Restful API through URL http://<server_ip>:8081/irext-server. Please refer to the "Cloud Restful API" chapter for more information.

### Configure and use Android SDK

Configure and call the following initialization interface during application initialization, so that the Cloud SDK connects to the private service:

```
private static final String ADDRESS = "http://<your private server IP>:8081";
private static final String APP_NAME = "/irext-server";

public WebAPIs mWeAPIs = WebAPIs.getInstance(ADDRESS, APP_NAME);
```

In hybrid cloud deployment mode, set app_key and app_secret in AndroidManifest.xml to the APP KEY and APP SECRET of the Android application you registered on the public cloud

In offline deployment mode, set app_key and app_secret in AndroidManifest.xml to the APP KEY and APP SECRET of the private service application you registered on the public cloud

```
<meta-data
android:name="irext_app_key"
android:value="your android app_key for hybrid mode OR your private cloud app_key for offline mode" />

<meta-data
android:name="irext_app_secret"
android:value="your android app_secret for hybrid mode OR your private cloud app_secret for offline mode" />
Configure the private service IP address in network_security_config.xml to allow http access.
```

### Configure and use Java SDK

Configure and call the following initialization interface during application initialization, so that the Cloud SDK connects to the private service:

```
private static final String ADDRESS = "http://<your private server IP>:8081";
private static final String APP_NAME = "/irext-server";

public WebAPIs mWeAPIs = WebAPIs.getInstance(ADDRESS, APP_NAME);
```

In hybrid cloud deployment mode, pass the app_key and app_secret parameters when calling signIn, using the APP KEY and APP SECRET of the Web application you registered on the public cloud

In offline deployment mode, pass the app_key and app_secret parameters when calling signIn, using the APP KEY and APP SECRET of the private service application you registered on the public cloud

## Update Data

For private service version 1.6.0 and later, data can be updated monthly to stay in sync with the public cloud's code library index and binary remote control codes. Versions earlier than 1.6.0 do not support this update capability; please upgrade and deploy as soon as possible by following the instructions in this chapter.

In hybrid cloud deployment mode, after entering the console, click the 'Update Data' button in the upper-right corner of the console to start updating data automatically.

In offline deployment mode, you can click the 'Download Latest Data Package' button in the details of the private service application on the 'Applications' page of the public cloud console to obtain the latest data package and perform an offline update.

<img width="491" height="104" alt="image" src="https://github.com/user-attachments/assets/fabcd1d6-4175-4a3c-b01e-1fb827fe55ad" />

