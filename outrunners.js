// Outrunners Community UK - Dashboard Logic

let map;
let gpxLayer;

function initMap() {
    map = L.map('map').setView([51.505, -0.09], 13);
    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; OpenStreetMap contributors',
        subdomains: 'abcd',
        maxZoom: 20
    }).addTo(map);
}

// --- GPX Handling ---
document.getElementById('gpxUpload').addEventListener('change', function(e) {
    const file = e.target.files[0];
    if (!file) return;
    document.getElementById('fileName').innerText = `File: ${file.name}`;
    const reader = new FileReader();
    reader.onload = function(ev) {
        if (gpxLayer) map.removeLayer(gpxLayer);
        gpxLayer = new L.GPX(ev.target.result, {
            async: true,
            polyline_options: { color: '#39FF14', opacity: 0.8, weight: 5 }
        }).on('loaded', (e) => map.fitBounds(e.target.getBounds())).addTo(map);
    };
    reader.readAsText(file);
});

// --- Split Calculator ---
const SplitCalculator = {
    targetInput: document.getElementById('targetTime'),
    paceOutput: document.getElementById('requiredPace'),
    statusText: document.getElementById('statusText'),
    paceCard: document.getElementById('paceCard'),

    init() {
        this.targetInput.addEventListener('input', () => this.calculate());
        this.calculate();
    },

    calculate() {
        const timeStr = this.targetInput.value;
        const totalSeconds = this.parseTimeToSeconds(timeStr);
        if (!totalSeconds || totalSeconds <= 0) {
            this.paceOutput.innerText = "--:--";
            return;
        }
        const distance = 18;
        const secondsPerKm = totalSeconds / distance;
        const mins = Math.floor(secondsPerKm / 60);
        const secs = Math.round(secondsPerKm % 60);
        this.paceOutput.innerText = `${mins}:${secs.toString().padStart(2, '0')}/km`;
        
        if (secondsPerKm <= 240) {
            this.statusText.innerText = "ELITE ZONE";
            this.paceCard.classList.add('success-zone');
        } else {
            this.statusText.innerText = "GRIND ZONE";
            this.paceCard.classList.remove('success-zone');
        }
    },

    parseTimeToSeconds(str) {
        const parts = str.split(':').map(Number);
        if (parts.length === 3) return parts[0] * 3600 + parts[1] * 60 + parts[2];
        if (parts.length === 2) return parts[0] * 3600 + parts[1] * 60;
        return null;
    }
};

window.onload = () => {
    initMap();
    SplitCalculator.init();
};
