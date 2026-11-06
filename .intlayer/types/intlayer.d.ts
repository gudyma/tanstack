import "intlayer";
import _1xp63dt21b2 from './editable-table.ts';
import _23ronxkqkyx from './indexContent.ts';
import _1eydrxti6yf from './journalContent.ts';
import _1sj6lo4z33 from './locale-switcher.ts';
import _a6szrtlob0 from './more-drawer.ts';
import _j4gjapj24q from './navigation-dock.ts';
import _nm78urv5c9 from './tableContent.ts';
import _1tz87cb9svm from './tankContent.ts';

declare module 'intlayer' {
  interface __DictionaryRegistry {
    "editable-table": typeof _1xp63dt21b2;
    "indexContent": typeof _23ronxkqkyx;
    "journalContent": typeof _1eydrxti6yf;
    "locale-switcher": typeof _1sj6lo4z33;
    "more-drawer": typeof _a6szrtlob0;
    "navigation-dock": typeof _j4gjapj24q;
    "tableContent": typeof _nm78urv5c9;
    "tankContent": typeof _1tz87cb9svm;
  }

  interface __DeclaredLocalesRegistry {
    "uk": 1;
    "en": 1;
  }

  interface __RequiredLocalesRegistry {
    "uk": 1;
    "en": 1;
  }

  interface __SchemaRegistry {

  }

  interface __StrictModeRegistry { mode: 'inclusive' }

  interface __EditorRegistry { enabled : false }

  interface __RoutingRegistry { mode: 'prefix-no-default'; defaultLocale: 'uk' }
}
