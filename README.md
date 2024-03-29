# fontface-styled-components

![GitHub Workflow Status](https://img.shields.io/github/workflow/status/La-Javaness/fontface-styled-components/deploy)
![https://www.npmjs.com/package/fontface-styled-components](https://img.shields.io/npm/v/fontface-styled-components.svg)

A library to generate fonts in ttf, eot, woff and woff2 formats, along with `@font-face`
instructions in the [styled-components](https://styled-components.com/) format. Inspired by
[fontface-loader](https://github.com/sjorssnoeren/fontface-loader).

This library aims to simplify the use of fontface automation for `styled-components` projects,
since most tools out there generate SCSS or CSS output. It also provides basic configuration
options for input and output directories, which some other scripts forget to provide.

The `styled-components` [createGlobalStyle](https://styled-components.com/docs/api#createglobalstyle)
helper function is used to allow you to import fonts in your DOM where you need them.
A prop is added to let you control the [font-display](https://developer.mozilla.org/en-US/docs/Web/CSS/@font-face/font-display) CSS property of the `@font-face`, so that you can optimise the loading order of your fonts programmatically (at least in SSR contexts).

For added convenience, this library can also generate individual CSS files that load a single `@font-face`, as well as SCSS files
that load a single `@font-face` and for which the [font-display](https://developer.mozilla.org/en-US/docs/Web/CSS/@font-face/font-display) CSS property can be controlled via a [`@use with` at-rule](https://sass-lang.com/documentation/at-rules/use#configuration).

## Installing

**npm**

    npm install --save-dev fontface-styled-components

**yarn**

    yarn add -D fontface-styled-components

### Optional Dependencies

* [FontForge](https://fontforge.org/)

## Input Format Support

### TrueType

Supported by default.

### OpenType

You must install [FontForge](https://fontforge.org/) and have the `fontforge` binary in your `$PATH`. If it is installed, a conversion script will convert OpenType fonts to TrueType as part of the build process.

## Usage:

To generate your fonts and CSS-in-JS files, use and adapt the following code:

```js
import fontface from 'fontface-styled-components';

fontface.run({
  sourceDir: 'assets/fonts',
  fontOutputDir: 'dist/fonts',
  fontsPublicDir: 'https://my.cdn.com/my-project/public/fonts',
  styledOutputDir: 'dist/src/assets/fontfaces/',
  forceRefresh: process.env.NODE_ENV === 'production',
})
```

To load a font in the DOM of one of your pages, use and adapt the following code:

```js
import CatamaranBoldFontFace from 'src/assets/fontfaces/CatamaranBoldFontFace.style'
import CatamaranRegularFontFace from 'src/assets/fontfaces/CatamaranBoldFontFace.style'

<MyPageRoot>
  <CatamaranBoldFontFace />
  <CatamaranFontFace fontDisplay="fallback" />
  <MyContent />
</MyPageRoot>
```

## Typical Output:

Importing the `Catamaran-bold.ttf` file would typically result in the following
CSS-in-JS file being generated:

```js
import { createGlobalStyle } from 'styled-components'

export const CatamaranBoldFontFace = createGlobalStyle`
  @font-face {
    font-display: ${props => props.fontDisplay || 'auto'};
    font-family: 'Catamaran';
    font-weight: 700;
    font-style: normal;
    src: local('Catamaran'),
        url('/public/fonts/Catamaran-Bold.eot?#iefix') format('embedded-opentype'),
        url('/public/fonts/Catamaran-Bold.woff2') format('woff2'),
        url('/public/fonts/Catamaran-Bold.ttf')  format('truetype'),
        url('/public/fonts/Catamaran-Bold.woff') format('woff');
  }
`

export default { CatamaranBoldFontFace }
```


## Options:

### sourceDir:

Path to the folder containing source TTF fonts.

**Default**: `'assets/fonts/'`

### fontOutputDir:

Path to the destination folder for the converted fonts to be placed in.
The original TTF font will also be copied in this folder.

**Default**: `'dist/fonts/'`

### fontsPublicDir:

Path of the fonts in your production server, which will be used in your
`@font-face` declaration URLs.

**Default**: `'/public/fonts/'`

### withStyledComponents:

Whether to generate @fontface files for styled-components.

**Default**: `true`

### styledOutputDir:

Path to the destination folder where to write CSS-in-JS files to.
Each source font file will have its own CSS-in-JS file.

**Default**: `'dist/src/fontfaces/'`

### withCSS:

Whether to generate vanilla CSS @fontface files.

**Default**: `false`

### cssOutputDir:

Path to the destination folder where to write CSS @fontface declaration files to.
Each source font file will have its own CSS file.

**Default**: `'dist/src/fontfaces/'`

### withSCSS:

Whether to generate SCSS mixin files for each font.

**Default**: `false`

### scssOutputDir:

Path to the destination folder where to write SCSS mixins to.
Each source font file will have its own SCSS file.

**Default**: `'dist/src/fontfaces/'`

### withLocal:

A flag to add a local source to @fontface declarations. Only recommended when your
project is to be deployed on B2B environments or point of sale devices where you can
ensure the local font is identical to the one you intend to serve, as they often vary
on consumer devices.

**Default**: `true` for backward compatibility, but we recommend you set it to `false`

### fontDisplay:

If set, applies a font-display property to *all* @fontface files indiscriminately.
This is primarily intended if you want to set a pattern that you'll replace with your
own logic post-build, or if you want to set a default and to manually edit specific
@fontface files.

If unset, `'auto'` will be used by default for CSS files. For CSS-in-JS files, a
template literal parameter will be injected, that first reads `props.fontDisplay`,
and that returns `'auto'` if that prop is unset.

**Default**: `null`

### allowEmpty:

A flag to allow an empty input directory. Useful for when you use `fontface-styled-components` in a programmatic environment. If `false`, an error will be thrown when
no fonts are found in the input directory.

**Default**: `false`

### forceRefresh:

A flag to force the regeneration of all input fonts, even when they're already
present in the output directory. This is disabled by default because generating
fonts for large Web projects can significantly impact build times. We recommend
you always enable this flag for production builds.

**Default**: `false`

### quiet:

A flag to prevent outputting info and warnings.

**Default**: `false`
