import "intlayer";
import _1uyykdeguti from './date-time-range-picker.ts';
import _1c1gwjvwk2e from './editable-table.ts';
import _4izxcy1o3m from './indexContent.ts';
import _1qzsiv5u24y from './journalContent.ts';
import _1buu80xh2qu from './locale-switcher.ts';
import _njkdyj9q2 from './more-drawer.ts';
import _rwbtcx6ld9 from './navigation-dock.ts';
import _pert5tqqgp from './tableContent.ts';
import _17domwazptv from './tankContent.ts';

declare module 'intlayer' {
  interface __DictionaryRegistry {
    "date-time-range-picker": typeof _1uyykdeguti;
    "editable-table": typeof _1c1gwjvwk2e;
    "indexContent": typeof _4izxcy1o3m;
    "journalContent": typeof _1qzsiv5u24y;
    "locale-switcher": typeof _1buu80xh2qu;
    "more-drawer": typeof _njkdyj9q2;
    "navigation-dock": typeof _rwbtcx6ld9;
    "tableContent": typeof _pert5tqqgp;
    "tankContent": typeof _17domwazptv;
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
