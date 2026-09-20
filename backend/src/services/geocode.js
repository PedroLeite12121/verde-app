const NOMINATIM_URL = 'https://nominatim.openstreetmap.org/search';

async function geocodeAddress({ rua, bairro, cidade }) {
  const parts = [rua, bairro, cidade || 'São Paulo', 'SP', 'Brasil'].filter(Boolean);
  if (parts.length === 0) return null;

  const q = encodeURIComponent(parts.join(', '));

  try {
    const res = await fetch(`${NOMINATIM_URL}?format=json&limit=1&q=${q}`, {
      headers: {
        'User-Agent': 'app-verde (https://github.com/vickyAqui/verde-app)',
      },
      signal: AbortSignal.timeout(8000),
    });

    if (!res.ok) return null;

    const data = await res.json();
    if (!Array.isArray(data) || data.length === 0) return null;

    return {
      latitude: parseFloat(data[0].lat),
      longitude: parseFloat(data[0].lon),
    };
  } catch {
    return null;
  }
}

module.exports = { geocodeAddress };