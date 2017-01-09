# Boilerplate – Project starter kit

> A modern boilerplate for kickstarting new web projects

## Overview
**HTML**
- Template engine: [Pug]
- Guidelines: [Jade / Pug guidelines]
- Linter: [pug-lint]
  - Config: [pug-lint-config-pustur]

**CSS**
- Preprocessor: [PreCSS] \([PostCSS]\)
- Guidelines: [BEM] / [ITCSS]
- Linter: [stylelint]
  - Config: [stylelint-config-standard]

**Javascript**
- Transpiler: [Babel]
- Guidelines: [Airbnb JavaScript Style Guide]
- Linter: [ESLint]
  - Config: [eslint-config-airbnb-base]

**Task runner**
- Task runner: [gulp]

___

## Usage
Install required dependencies:
```
npm install
```

Compile the project:
```bash
# for development
gulp

# for production
gulp --production
```

You can lint the project by running:
```
npm test
```

## File structure
### HTML
- **Core**: Files that are constant for every page, can include meta tags, script tags, mixins, etc.
- **Layouts**: Files that define the foundamental structure of the pages.
- **Components**: Reusable modules and components.
- **Helpers**: Helpers are part of code that you cannot use as a full component.

### CSS
- **Settings**: Global variables, maps, etc.
- **Tools**: Functions and mixins.
- **Generic**: Very far reaching selectors. Setting `box-sizing` (using `*`) and CSS resets where elements are selected directly.
- **Base**: Default styling on elements without classes, such as typography and base elements.
- **Objects**: Class-based selectors which define undecorated design patterns.
- **Components**: Parts of the site (navigation, header, footer, carousel) selected with classes, using [BEM] where appropriate. If it's not obvious what each partial affects, add a comment.
- **Trumps**: Override, helpers, utilities and shame. The highest specificity, often carrying `!important` to guarantee these styles will win.

### JavaScript
- **Vendor:** Third party scripts.
- **Modules:** Custom single-purpose modules.

## License
[MIT]

[ITCSS]: http://itcss.io/
[Pug]: https://pugjs.org/
[gulp]: http://gulpjs.com/
[Babel]: https://babeljs.io/
[ESLint]: http://eslint.org/
[PostCSS]: http://postcss.org/
[stylelint]: http://stylelint.io/
[BEM]: https://en.bem.info/methodology/
[pug-lint]: https://github.com/pugjs/pug-lint
[PreCSS]: https://github.com/jonathantneal/precss
[MIT]: https://github.com/Pustur/boilerplate/blob/master/LICENSE
[Airbnb JavaScript Style Guide]: https://github.com/airbnb/javascript
[pug-lint-config-pustur]: https://github.com/Pustur/pug-lint-config-pustur
[stylelint-config-standard]: https://github.com/stylelint/stylelint-config-standard
[these guidelines]: https://github.com/Grawl/guidelines/blob/master/jade/architecture.md
[Jade / Pug guidelines]: https://github.com/Grawl/guidelines/blob/master/jade/architecture.md
[eslint-config-airbnb-base]: https://github.com/airbnb/javascript/tree/master/packages/eslint-config-airbnb
