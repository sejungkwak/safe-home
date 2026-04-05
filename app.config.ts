import "dotenv/config";

export default {
  expo: {
    name: "SafeHome",
    slug: "SafeHome",
    version: "1.0.0",
    orientation: "portrait",
    icon: "./assets/images/icon.png",
    scheme: "safehome",
    userInterfaceStyle: "automatic",
    newArchEnabled: true,
    ios: {
      supportsTablet: true,
      bundleIdentifier: "com.sejungkwak.safehome",
      infoPlist: {
        ITSAppUsesNonExemptEncryption: false,
        GIDClientID: process.env.SUPABASE_AUTH_EXTERNAL_GOOGLE_IOS_CLIENT_ID,
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
        foregroundImage: "./assets/images/android-icon-foreground.png",
        backgroundImage: "./assets/images/android-icon-background.png",
        monochromeImage: "./assets/images/android-icon-monochrome.png",
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
      ],
      package: "com.sejungkwak.safehome",
    },
    web: {
      output: "static",
      favicon: "./assets/images/favicon.png",
      bundler: "metro",
    },
    plugins: [
      "expo-router",
      [
        "expo-splash-screen",
        {
          image: "./assets/images/splash-icon.png",
          imageWidth: 200,
          resizeMode: "contain",
          backgroundColor: "#ffffff",
          dark: {
            backgroundColor: "#000000",
          },
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
      "expo-secure-store",
      "expo-sqlite",
      [
        "@react-native-google-signin/google-signin",
        {
          iosUrlScheme:
            process.env.SUPABASE_AUTH_EXTERNAL_GOOGLE_IOS_URL_SCHEME,
        },
      ],
      ["@react-native-community/datetimepicker"],
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
