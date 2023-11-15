import ReactDOM from 'react-dom/client';

import fontStyles from '@fontsource/raleway/index.css?inline';

import App from './App.tsx';
import globalStyles from './index.css?inline';
import type { Integration } from './integrations/integration.ts';
import { initIntegrations } from './integrations/integration.ts';

export { default as console } from './integrations/console/index.ts';
export { default as sentry } from './integrations/sentry/index.ts';

function createStyleSheet(styles: string) {
  const sheet = new CSSStyleSheet();
  sheet.replaceSync(styles);
  return sheet;
}

const spotlightEventTarget: EventTarget = new EventTarget();

/**
 * Open or close the Spotlight UI
 */
export async function toggleSpotlight() {
  spotlightEventTarget.dispatchEvent(new Event('toggle'));
}

export async function init({
  fullScreen = false,
  showTriggerButton = true,
  integrations,
  defaultEventId,
}: {
  integrations?: Integration[];
  fullScreen?: boolean;
  defaultEventId?: string;
  sidecarUrl?: string;
  showTriggerButton?: boolean;
} = {}) {
  if (typeof document === 'undefined') return;

  const initializedIntegrations = await initIntegrations(integrations);

  // build shadow dom container to contain styles
  const docRoot = document.createElement('div');
  docRoot.id = 'sentry-spotlight-root';
  const shadow = docRoot.attachShadow({ mode: 'open' });
  const appRoot = document.createElement('div');
  appRoot.style.position = 'absolute';
  appRoot.style.top = '0';
  appRoot.style.left = '0';
  appRoot.style.right = '0';
  shadow.appendChild(appRoot);

  const ssGlobal = createStyleSheet(globalStyles);
  shadow.adoptedStyleSheets = [createStyleSheet(fontStyles), ssGlobal];

  if (import.meta.hot) {
    import.meta.hot.accept('./index.css?inline', newGlobalStyles => {
      ssGlobal.replaceSync(newGlobalStyles?.default);
    });
  }

  ReactDOM.createRoot(appRoot).render(
    // <React.StrictMode>
    <App
      integrations={initializedIntegrations}
      fullScreen={fullScreen}
      defaultEventId={defaultEventId}
      eventTarget={spotlightEventTarget}
      showTriggerButton={showTriggerButton}
    />,
    // </React.StrictMode>
  );

  window.addEventListener('load', () => {
    console.log('[spotlight] Injecting into application');

    document.body.append(docRoot);
  });
}