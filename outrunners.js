let map;
let gpxLayer;

function initMap() {
    map = L.map('map').setView([51.505, -0.09], 13);
    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png').addTo(map);
}

document.getElementById('gpxUpload').addEventListener('change', function(e) {
    const reader = new FileReader();
    reader.onload = (ev) => {
        if (gpxLayer) map.removeLayer(gpxLayer);
        gpxLayer = new L.GPX(ev.target.result, {
            async: true,
            polyline_options: { color: '#39FF14', weight: 5 }
        }).on('loaded', (e) => map.fitBounds(e.target.getBounds())).addTo(map);
    };
    reader.readAsText(e.target.files[0]);
});

const SUPABASE_URL = 'https://qcqyyfnsfyuaaaacddsm.supabase.co';
const SUPABASE_KEY = 'sb_publishable_uXs2e5aPzrIL_M2xsYDmWg_hPOUaG1l';
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

const LiveTrackingService = {
    marker: null,
    indicator: document.getElementById('liveIndicator'),
    init() {
        supabase.channel('live_tracking_channel')
            .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'live_tracks', filter: 'id=eq.admin' }, 
                (payload) => this.handleUpdate(payload.new)).subscribe();
    },
    handleUpdate(data) {
        if (data.is_active) {
            this.indicator.style.display = 'block';
            if (!this.marker) {
                this.marker = L.marker([data.lat, data.lng]).addTo(map);
            } else {
                this.marker.setLatLng([data.lat, data.lng]);
            }
        } else {
            this.indicator.style.display = 'none';
            if (this.marker) { map.removeLayer(this.marker); this.marker = null; }
        }
    }
};

window.onload = () => { initMap(); LiveTrackingService.init(); };
