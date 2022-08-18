// This file can be replaced during build by using the `fileReplacements` array.
// `ng build --prod` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment = {
  production: false,
  baseUrlCCTVL: 'http://192.168.2.105:5005/api/',//trabajo
  baseUrlCCTVP: 'http://192.168.2.105:5005/api/',//trabajo
  
  //baseWhatsapp: "http://127.0.0.1:5010/",
  baseWhatsapp: "http://192.168.2.97:5010/",
  sharedFolder: "shared-test"
};
 
/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/dist/zone-error';  // Included with Angular CLI.
