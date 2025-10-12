// Service Worker para EstacionaAqui PWA
const CACHE_NAME = 'estacionaaqui-v1';
const RUNTIME_CACHE = 'estacionaaqui-runtime-v1';

// Arquivos essenciais para cache
const STATIC_CACHE_URLS = [
  '/',
  '/manifest.json',
  '/icon-192x192.png',
  '/icon-512x512.png',
];

// Instalação do Service Worker
self.addEventListener('install', (event) => {
  console.log('[SW] Instalando Service Worker...');
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[SW] Cache aberto');
      return cache.addAll(STATIC_CACHE_URLS).catch((err) => {
        console.error('[SW] Erro ao adicionar arquivos ao cache:', err);
      });
    })
  );
  self.skipWaiting();
});

// Ativação do Service Worker
self.addEventListener('activate', (event) => {
  console.log('[SW] Ativando Service Worker...');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME && cacheName !== RUNTIME_CACHE) {
            console.log('[SW] Deletando cache antigo:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  return self.clients.claim();
});

// Estratégia de cache: Network First com fallback para cache
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Ignorar requisições que não são do mesmo domínio
  if (url.origin !== location.origin) {
    return;
  }

  // Ignorar requisições da API - sempre buscar da rede
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          // Clone a resposta para armazenar no cache runtime
          if (response && response.status === 200) {
            const responseClone = response.clone();
            caches.open(RUNTIME_CACHE).then((cache) => {
              cache.put(request, responseClone);
            });
          }
          return response;
        })
        .catch(() => {
          // Se falhar, tentar buscar do cache
          return caches.match(request);
        })
    );
    return;
  }

  // Para outros recursos: Network First, fallback para cache
  event.respondWith(
    fetch(request)
      .then((response) => {
        // Se a resposta for válida, armazenar no cache
        if (response && response.status === 200) {
          const responseClone = response.clone();
          caches.open(RUNTIME_CACHE).then((cache) => {
            cache.put(request, responseClone);
          });
        }
        return response;
      })
      .catch(() => {
        // Se a rede falhar, buscar do cache
        return caches.match(request).then((cachedResponse) => {
          if (cachedResponse) {
            return cachedResponse;
          }

          // Se não houver cache, retornar página offline básica para navegação
          if (request.destination === 'document') {
            return caches.match('/');
          }

          // Para outros recursos, retornar erro
          return new Response('Offline - Recurso não disponível', {
            status: 503,
            statusText: 'Service Unavailable',
            headers: new Headers({
              'Content-Type': 'text/plain',
            }),
          });
        });
      })
  );
});

// Sincronização em background (quando voltar online)
self.addEventListener('sync', (event) => {
  console.log('[SW] Sincronização em background:', event.tag);
  if (event.tag === 'sync-reservations') {
    event.waitUntil(syncReservations());
  }
});

async function syncReservations() {
  try {
    // Aqui você pode implementar lógica para sincronizar dados pendentes
    console.log('[SW] Sincronizando reservas...');
    const response = await fetch('/api/reservations');
    if (response.ok) {
      const cache = await caches.open(RUNTIME_CACHE);
      cache.put('/api/reservations', response.clone());
    }
  } catch (error) {
    console.error('[SW] Erro ao sincronizar:', error);
  }
}

// Notificações push (preparado para futuro)
self.addEventListener('push', (event) => {
  console.log('[SW] Push recebido');

  const options = {
    body: event.data ? event.data.text() : 'Nova atualização disponível',
    icon: '/icon-192x192.png',
    badge: '/icon-72x72.png',
    vibrate: [200, 100, 200],
    tag: 'estacionaaqui-notification',
    requireInteraction: false,
  };

  event.waitUntil(
    self.registration.showNotification('EstacionaAqui', options)
  );
});

// Clique em notificação
self.addEventListener('notificationclick', (event) => {
  console.log('[SW] Notificação clicada');
  event.notification.close();

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      // Se já houver uma janela aberta, focar nela
      for (const client of clientList) {
        if (client.url === '/' && 'focus' in client) {
          return client.focus();
        }
      }
      // Caso contrário, abrir nova janela
      if (clients.openWindow) {
        return clients.openWindow('/');
      }
    })
  );
});

console.log('[SW] Service Worker carregado');
