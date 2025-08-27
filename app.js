
let map, userMarker, accuracyCircle, watchId = null;

const statusEl = document.getElementById('status');
const btnUbicar = document.getElementById('btn-ubicar');
const btnSeguir = document.getElementById('btn-seguir');
const btnParar = document.getElementById('btn-parar');


function initMap() {
  map = L.map('map').setView([-34.6037, -58.3816], 13); 


  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution:
      '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
  }).addTo(map);
}


function showPositionOnMap(lat, lng, accuracy) {
  const latlng = [lat, lng];

  if (!userMarker) {
    userMarker = L.marker(latlng).addTo(map).bindPopup('Estás aquí');
  } else {
    userMarker.setLatLng(latlng);
  }

  if (!accuracyCircle) {
    accuracyCircle = L.circle(latlng, { radius: accuracy }).addTo(map);
  } else {
    accuracyCircle.setLatLng(latlng);
    accuracyCircle.setRadius(accuracy);
  }


  const currentZoom = map.getZoom();
  if (currentZoom < 16) {
    map.setView(latlng, 16, { animate: true });
  } else {
    map.panTo(latlng, { animate: true });
  }
}

function getOnce() {
  if (!('geolocation' in navigator)) {
    setStatus('Tu navegador no soporta geolocalización.');
    return;
  }

  setStatus('Obteniendo ubicación...');
  navigator.geolocation.getCurrentPosition(
    (pos) => {
      const { latitude, longitude, accuracy } = pos.coords;
      setStatus(
        `Ubicación obtenida ✔️ (precisión ≈ ${Math.round(accuracy)} m)`
      );
      showPositionOnMap(latitude, longitude, accuracy);
    },
    (err) => handleGeolocationError(err),
    {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 0,
    }
  );
}

function startWatching() {
  if (watchId !== null) return; 
  if (!('geolocation' in navigator)) {
    setStatus('Tu navegador no soporta geolocalización.');
    return;
  }

  setStatus('Iniciando seguimiento...');
  watchId = navigator.geolocation.watchPosition(
    (pos) => {
      const { latitude, longitude, accuracy } = pos.coords;
      setStatus(
        `Siguiendo tu posición (precisión ≈ ${Math.round(accuracy)} m)`
      );
      showPositionOnMap(latitude, longitude, accuracy);
    },
    (err) => handleGeolocationError(err),
    {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 0,
    }
  );

  btnSeguir.disabled = true;
  btnParar.disabled = false;
}

function stopWatching() {
  if (watchId !== null) {
    navigator.geolocation.clearWatch(watchId);
    watchId = null;
    setStatus('Seguimiento detenido.');
    btnSeguir.disabled = false;
    btnParar.disabled = true;
  }
}


function handleGeolocationError(err) {
  if (err.code === 1) {
    setStatus('Permiso denegado. Actívalo y vuelve a intentar.');
  } else if (err.code === 2) {
    setStatus('Ubicación no disponible. Intenta moverte o revisar la señal GPS.');
  } else if (err.code === 3) {
    setStatus('Tiempo de espera agotado. Vuelve a intentar.');
  } else {
    setStatus('Error de geolocalización.');
  }
}

function setStatus(msg) {
  statusEl.textContent = msg;
}

initMap();

btnUbicar.addEventListener('click', getOnce);
btnSeguir.addEventListener('click', startWatching);
btnParar.addEventListener('click', stopWatching);


