TRRTL
=====

Reimagining of the graphical turtle of the Logo programming language as a Coffeescript-backed Progressive Web App.

Read the full story at https://danq.me/trrtl

## Usage

Visit [trrtl.com](https://trrtl.com/) to play with it in your browser. Click the "help" icon in the lower right for documentation on supported commands. Drag-drop or copy-paste code directly to the window to execute it; some samples are provided in the documentation. This app is capable of working entirely offline but will self-update in the background when running online; it's also capable of being installed as a desktop application.

The "reset" button in the bottom right wipes the screen and resets the position and state of the turtle (typing `reset()` does the same thing programatically). The "code editor" button in the bottom right opens an editor where you can write and execute longer programs.

Your program state is recorded to the address bar so you can bookmark or share it to carry on from where you left off (e.g. you can simply share the current URL to show a friend what you've produced).

## Limitations

Browsers which do not send "keypress" events are not able to use the (default) "console" mode. This includes most installations of Chrome on Android unless specialised keyboards are installed (e.g. Hacker's Keyboard). Firefox on Android, for the most part, works okay, and any modern browser is capable of using the 

## Mechanism of operation

The parser is powered by [CoffeeScript](https://coffeescript.org/), which was chosen because it's the most natively "Logo-like" JavaScript transpiler. The display contains two `<canvas>` elements: the uppermost one renders the turtle and is wiped/redrawn every time the turtle moves; the lowermost one shows the output of the turtle's lines. State is produced using [JSZip](https://stuk.github.io/jszip/) compression, encoded as Base64, into the hash of the window. A service worker and accompanying manifest file facilitate the PWA/offline working/local installation.

## Deployment & Security

The project is implemented as a simple static website suitable for deployment virtually anywhere. PWA functionality requires a HTTPS connection.

The resulting site is necessarily vulnerable to cross-site-scripting (XSS) attacks because code found in the hash of the address will be executed within the scope of the page. The site should not be deployed to a domain on which this could impact other applications (e.g. don't put it on a domain or subdomain of a site that uses cookies for authentication or that shows login forms, as these could then be stolen/spoofed): it should be hosted on its own domain.

As part of defence-in-depth, its also advisable to set a [Content-Security-Policy](https://content-security-policy.com/) header to e.g. prohibit third-party scripts and form submissions. This does not prevent XSS attacks, but reduces the ease with which they can be effected.

## Future

Possible future developments include:

* Finding workarounds to the "keypress" limitations in e.g. Chrome for Android
* (Re)implementing more of the UCB Logo command set
* Allowing for "delay" (like the original)
* Facilitating multiline statements through the default console
* "Multiplayer" turtling across a network using WebSockets or WebRTC
* Communicating with a physical turtle (perhaps by adapting an off-the-shelf remote-controlled turtle by adding an Arduino or something) using WebSockets, WebRTC, or the Web Bluetooth API
* Some kind of trainer/tutorial?
* Command-buffer/history (and maybe even autocomplete?)

Please feel free to fork or make pull requests with any of these in (pull requests must be unlicense-friendly).

## License

The CoffeeScript and JSZip libraries are used under the [MIT License](https://opensource.org/licenses/MIT). All other code and content was produced by [Dan Q](https://danq.me/) and is released into the public domain in accordance with [The Unlicense](https://unlicense.org/).
