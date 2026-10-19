import "intlayer";
import _ql8rwet43s from './editable-table.ts';
import _1cy6q0s8k1a from './indexContent.ts';
import _prx1xp2yvy from './journalContent.ts';
import _1jj7yjkss47 from './locale-switcher.ts';
import _q7owgcmpun from './more-drawer.ts';
import _1an38brjody from './navigation-dock.ts';
import _1vxp4hdfvu9 from './tableContent.ts';
import _sco997kpv6 from './tankContent.ts';

declare module 'intlayer' {
  interface __DictionaryRegistry {
    "editable-table": typeof _ql8rwet43s;
    "indexContent": typeof _1cy6q0s8k1a;
    "journalContent": typeof _prx1xp2yvy;
    "locale-switcher": typeof _1jj7yjkss47;
    "more-drawer": typeof _q7owgcmpun;
    "navigation-dock": typeof _1an38brjody;
    "tableContent": typeof _1vxp4hdfvu9;
    "tankContent": typeof _sco997kpv6;
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
