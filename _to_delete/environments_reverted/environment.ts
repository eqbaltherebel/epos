/**
 * Single source of truth for the SMART-PDS backend origin.
 *
 * The production backend is https://epos.bihar.gov.in. How the browser should
 * reach it depends on how you run the app:
 *
 *  - apiBaseUrl: ''  (RECOMMENDED, the default)
 *      API calls are made to the SAME origin as the app and reach the real
 *      backend through a proxy:
 *        • dev:  the Angular dev-server proxy (proxy.conf.json) forwards
 *                /Epos_Spring/* to https://epos.bihar.gov.in.
 *        • prod: put the built app behind a reverse proxy (nginx, etc.) that
 *                maps /Epos_Spring/* (and /images, /awards, /static/media) to
 *                https://epos.bihar.gov.in.
 *      This is required because the browser's CORS policy blocks a page on one
 *      origin (e.g. http://localhost:4200) from calling https://epos.bihar.gov.in
 *      directly — the government backend does not send Access-Control-Allow-Origin
 *      for third-party origins.
 *
 *  - apiBaseUrl: 'https://epos.bihar.gov.in'
 *      Calls go DIRECTLY to the production host. Only use this if the app is
 *      served from an origin the backend explicitly allows via CORS (for
 *      example, when the app itself is hosted under epos.bihar.gov.in).
 */
export const environment = {
  production: false,
  /** Backend origin. '' = same origin (via proxy). See notes above. */
  apiBaseUrl: '',
  /** Path prefix of the Spring backend. */
  apiContext: '/Epos_Spring',
};
