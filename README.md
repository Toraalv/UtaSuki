[![License: GNU GPLv3](https://img.shields.io/badge/License-GPLv3-blue.svg)](http://www.gnu.org/licenses/gpl-3.0)
![version: 1.3.5](https://img.shields.io/badge/version-1.3.5-blue)

# 歌好き (UtaSuki)
The site is available at [utasuki.com](https://utasuki.com).

Current plans includes:
- [ ] Per track publicity setting?
- [ ] CI/CD
- [ ] Unit testing
- [ ] Some sort of common music library
- [ ] User interaction, such as adding each other as friends
- [ ] User statistics
- [ ] Mobile phone support

## Development

### Prerequisites

- A node package manager. [`npm`](https://github.com/npm/cli) will be used as an example
- [`mkcert`](https://github.com/FiloSottile/mkcert) -- used to create and install local CA and certificates
- [MariaDB](https://mariadb.org/) -- the used database system

### Setup

UtaSuki is divided into two parts, a [Svelte](https://svelte.dev/) web server and a [Node.js](https://nodejs.org/) REST API. Their respective setup can be found here:

[Svelte web server](/website/)

[API](/api/)

## LICENSE

This project is licensed under the terms of the [GNU GPLv3](http://www.gnu.org/licenses/gpl-3.0) license.
