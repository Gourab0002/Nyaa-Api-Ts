# Security Policy

## Supported versions

| Version | Supported |
| ------- | --------- |
| 2.x     | Yes       |
| < 2.0   | No        |

This repository is an unofficial read-only scraper for public Nyaa listing and view pages. There is no authenticated user data and no persistent store.

## Reporting a vulnerability

Please open a [private security advisory](https://github.com/Gourab0002/Nyaa-Api-Ts/security/advisories/new) or email the repository owner through GitHub.

You can expect an acknowledgement when the report is received, and an update once it has been triaged. If the issue is accepted, a fix will be shipped in a patch release when possible. If it is declined, we will explain why.

Please do not open a public issue for anything that could be used to abuse this API or its upstream hosts.

## Scope notes

- This API only proxies public HTML from Nyaa mirrors. Do not send credentials, cookies, or private tracker data to it.
- Path parameters are validated so IDs and usernames cannot be used to walk off `/view/` or `/user/`.
- Reports about Nyaa itself should go to the Nyaa operators, not this project.
