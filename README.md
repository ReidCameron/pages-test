# Angular Drafts
Stores V3 drafts and provides persistent previews.

## Prerequisites
The V3 site must have the following script placed before the integration script.
```html
<script src="https://searchspring.github.io/angular-drafts/preview.js">
```
## Storing Drafts

TBD

## Building a preview URL

Append the following parameter to the site's URL:
```
?ss_preview:{draft name}
```

## Local Developement
```zsh
npm run build
```
```zsh
npm run dev
```