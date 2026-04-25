import "dotenv/config";

export default {
  expo: {
    name: "Safe Home",
    slug: "SafeHome",
    version: "1.0.0",
    orientation: "portrait",
    icon: "./src/assets/images/icons/icon.png",
    scheme: "safehome",
    userInterfaceStyle: "automatic",
    newArchEnabled: true,
    ios: {
      supportsTablet: true,
      bundleIdentifier: "com.sejungkwak.safehome",
      infoPlist: {
        ITSAppUsesNonExemptEncryption: false,
        GIDClientID: process.env.SUPABASE_AUTH_EXTERNAL_GOOGLE_IOS_CLIENT_ID,
        UIBackgroundModes: ["fetch", "remote-notification"],
      },
      icon: {
        light: "./src/assets/images/icons/ios-light.png",
        dark: "./src/assets/images/icons/ios-dark.png",
      },
    },
    android: {
      config: {
        googleMaps: {
          apiKey: process.env.GOOGLE_MAPS_API_KEY,
        },
      },
      adaptiveIcon: {
        backgroundColor: "#E6F4FE",
        foregroundImage: "./src/assets/images/icons/adaptive-icon.png",
      },
      edgeToEdgeEnabled: true,
      predictiveBackGestureEnabled: false,
      softwareKeyboardLayoutMode: "pan",
      permissions: [
        "android.permission.RECORD_AUDIO",
        "android.permission.ACCESS_COARSE_LOCATION",
        "android.permission.ACCESS_FINE_LOCATION",
        "android.permission.FOREGROUND_SERVICE",
        "android.permission.FOREGROUND_SERVICE_LOCATION",
        "android.permission.NOTIFICATIONS",
        "android.permission.POST_NOTIFICATIONS",
      ],
      package: "com.sejungkwak.safehome",
      googleServicesFile: "./google-services.json",
    },
    web: {
      output: "static",
      bundler: "metro",
    },
    plugins: [
      "expo-router",
      [
        "expo-splash-screen",
        {
          image: "./src/assets/images/icons/icon.png",
          resizeMode: "contain",
          imageWidth: 200,
        },
      ],
      [
        "expo-image-picker",
        {
          photosPermission:
            "The app accesses your photos to let you upload them.",
          colors: {
            cropToolbarColor: "#000000",
          },
          dark: {
            colors: {
              cropToolbarColor: "#000000",
            },
          },
        },
      ],
      [
        "expo-location",
        {
          locationAlwaysAndWhenInUsePermission:
            "Allow Safe Home to use your location.",
          isAndroidForegroundServiceEnabled: true,
        },
      ],
      [
        "@react-native-google-signin/google-signin",
        {
          iosUrlScheme:
            process.env.SUPABASE_AUTH_EXTERNAL_GOOGLE_IOS_URL_SCHEME,
        },
      ],
      "expo-secure-store",
      "expo-sqlite",
      "@react-native-community/datetimepicker",
      "expo-notifications",
    ],
    experiments: {
      typedRoutes: true,
      reactCompiler: true,
    },
    extra: {
      router: {},
      eas: {
        projectId: "d7a55699-2c5b-4c80-99f6-6f4f48218b25",
      },
    },
    owner: "sejungkwak",
  },
};
