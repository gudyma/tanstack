import "intlayer";
import _tPXZVjBEVgwkDzlxIk4i from './app.ts';
import _v5JGTxdqpkE2cOSRqt39 from './locale-switcher.ts';

declare module 'intlayer' {
  interface __DictionaryRegistry {
    "app": typeof _tPXZVjBEVgwkDzlxIk4i;
    "locale-switcher": typeof _v5JGTxdqpkE2cOSRqt39;
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
