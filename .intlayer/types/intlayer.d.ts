import "intlayer";
import _nJGggRTPrzcIEOZP709Y from './indexContent.ts';
import _HWJHzf6ZoaqSHvk0hYYy from './journalContent.ts';
import _v5JGTxdqpkE2cOSRqt39 from './locale-switcher.ts';
import _vP0afyWqddOflheNO7Jh from './tableContent.ts';
import _QfWZwMDGYuWoR46EG6Cn from './tankContent.ts';

declare module 'intlayer' {
  interface __DictionaryRegistry {
    "indexContent": typeof _nJGggRTPrzcIEOZP709Y;
    "journalContent": typeof _HWJHzf6ZoaqSHvk0hYYy;
    "locale-switcher": typeof _v5JGTxdqpkE2cOSRqt39;
    "tableContent": typeof _vP0afyWqddOflheNO7Jh;
    "tankContent": typeof _QfWZwMDGYuWoR46EG6Cn;
  }

  interface __DeclaredLocalesRegistry {
    "en": 1;
    "fr": 1;
    "es": 1;
  }

  interface __RequiredLocalesRegistry {
    "en": 1;
    "fr": 1;
    "es": 1;
  }

  interface __StrictModeRegistry { mode: 'inclusive' }
}
