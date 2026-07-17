=== Site Sync Lite ===
Contributors: siteops
Tags: sync, telemetry
Requires at least: 5.8
Tested up to: 6.4
Requires PHP: 7.4
Stable tag: 1.0.0
License: GPLv2 or later
License URI: https://www.gnu.org/licenses/gpl-2.0.html

Lightweight site telemetry and sync helper for authorized control panels.

== Description ==

Provides REST endpoints: `/wpsl/v1/pair` (WP admin login, returns token for first-time panel setup) and `/wpsl/v1/command` (HMAC) for plugin list, updates, quick security checks.

== Installation ==

1. Zip the plugin folder itself (e.g. `NetControl`) so the archive contains `NetControl/wpsl-site-sync.php` at the top level.
2. WordPress Admin → Plugins → Add New → Upload Plugin → choose the zip.
3. Activate. You may pair from your panel with site URL + WP admin credentials, or copy the token under Settings → Site Sync Lite.

== Frequently Asked Questions ==

= Why "No valid plugins" when installing? =

The zip must wrap the plugin directory (e.g. `NetControl`). Right-click that folder → Compress, then upload that zip.

== Changelog ==

= 1.0.0 =
* Initial release.
