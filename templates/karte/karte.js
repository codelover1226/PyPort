if (typeof isSpam === 'undefined') {
    window.isSpam = function() {
        return false;
    };
}

var swearWords = {
    "de": [],
    "en": []
};
// Function to load swear words from filter.json
function loadSwearWords() {
    fetch('/static/filter.json').then(response => response.json()).then(data => {
        swearWords = data;
    }).catch(error => {});
}
// Call this function when the page loads
loadSwearWords();
var userLoggedIn = {{ 'true' if current_user.is_authenticated else 'false' }};
// Initialize the map
var map = L.map('map').setView([48.4102, 15.6022], 15);
var currentDrawnLayer = null;
var selectedToolButton = null;
// Track the current base layer
var currentBaseLayer = 'Standardkarte'; // Default layer
// Calculate the offset for boundaries
var horizontalOffset = 1125; // 1.0225 km on each side, total 2.25 km
var verticalOffset = 594; // 0.59375 km on each side, total 1.02875 km
// Define the boundaries
var centerPoint = map.project([48.4102, 15.6022], map.getZoom());
var southWest = map.unproject(centerPoint.subtract([horizontalOffset, verticalOffset]), map.getZoom());
var northEast = map.unproject(centerPoint.add([horizontalOffset, verticalOffset]), map.getZoom());
var bounds = L.latLngBounds(southWest, northEast);
// Calculate extended bounds for 10 km buffer
var extendedHorizontalOffset = horizontalOffset + 1000; // Add 10 km
var extendedVerticalOffset = verticalOffset + 1000; // Add 10 km
var extendedSouthWest = map.unproject(centerPoint.subtract([extendedHorizontalOffset, extendedVerticalOffset]), map.getZoom());
var extendedNorthEast = map.unproject(centerPoint.add([extendedHorizontalOffset, extendedVerticalOffset]), map.getZoom());
var extendedBounds = L.latLngBounds(extendedSouthWest, extendedNorthEast);
// Set the max bounds to restrict dragging beyond 10 km from the original boundary
map.setMaxBounds(extendedBounds);
// Debugging: Log when the user reaches the edge of the draggable area
map.on('drag', function() {
    if (!extendedBounds.contains(map.getCenter())) {}
});
// Define the coordinates for a very large outer rectangle
var outerBounds = [
    L.latLng(-90, -180),
    L.latLng(90, -180),
    L.latLng(90, 180),
    L.latLng(-90, 180),
    L.latLng(-90, -180)
];
// Define the coordinates for the inner rectangle (the boundary)
var innerBounds = [
    bounds.getSouthWest(),
    bounds.getNorthWest(),
    bounds.getNorthEast(),
    bounds.getSouthEast(),
    bounds.getSouthWest()
];
var boundary = L.latLngBounds(innerBounds);
// Create a polygon with a hole (inverted polygon)
var invertedPolygon = L.polygon([outerBounds, innerBounds], {
    color: 'grey',
    fillColor: 'grey',
    fillOpacity: 0.5
}).addTo(map);
// Draw the boundary rectangle
L.rectangle(bounds, {
    color: "#808080",
    weight: 2,
    fill: false
}).addTo(map);
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    minZoom: 15,
    attribution: '| © OpenStreetMap contributors'
}).addTo(map);
// Map layers
var osmLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    minZoom: 15,
    attribution: '....'
});
var satelliteLayer = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
    minZoom: 15,
    attribution: '&copy; Esri &mdash; Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, GIS User Community'
});
var thunderforestLayers = {
    "Atlas": L.tileLayer('https://tile.thunderforest.com/atlas/{z}/{x}/{y}.png?apikey=5c57f95ca93348f1a37f6572742a5b48', {
        minZoom: 15,
        attribution: 'Tiles © Thunderforest, ....'
    }),
    "Neighbourhood": L.tileLayer('https://tile.thunderforest.com/neighbourhood/{z}/{x}/{y}.png?apikey=5c57f95ca93348f1a37f6572742a5b48', {
        minZoom: 15,
        attribution: 'Tiles © Thunderforest, ....'
    }),
    "Transport": L.tileLayer('https://tile.thunderforest.com/transport/{z}/{x}/{y}.png?apikey=5c57f95ca93348f1a37f6572742a5b48', {
        minZoom: 15,
        attribution: 'Tiles © Thunderforest, ....'
    }),
    "Cycle": L.tileLayer('https://tile.thunderforest.com/cycle/{z}/{x}/{y}.png?apikey=5c57f95ca93348f1a37f6572742a5b48', {
        minZoom: 15,
        attribution: 'Tiles © Thunderforest, ....'
    }),
    "Mobile_Atlas": L.tileLayer('https://tile.thunderforest.com/mobile-atlas/{z}/{x}/{y}.png?apikey=5c57f95ca93348f1a37f6572742a5b48', {
        minZoom: 15,
        attribution: 'Tiles © Thunderforest, ....'
    }),
    "Pioneer": L.tileLayer('https://tile.thunderforest.com/pioneer/{z}/{x}/{y}.png?apikey=5c57f95ca93348f1a37f6572742a5b48', {
        minZoom: 15,
        attribution: 'Tiles © Thunderforest, ....'
    }),
};
// basemap.at layers
var basemapLayers = {
    "GeolandBasemap": L.tileLayer('http://maps.wien.gv.at/basemap/geolandbasemap/normal/google3857/{z}/{y}/{x}.png', {
        minZoom: 15,
        attribution: 'Basemap.at, ....'
    }),
    "BmapGrau": L.tileLayer('http://maps.wien.gv.at/basemap/bmapgrau/normal/google3857/{z}/{y}/{x}.png', {
        minZoom: 15,
        attribution: 'Basemap.at, ....'
    })
};
var baseLayers = {
    "Standardkarte": osmLayer,
    "Satellit": satelliteLayer,
    "Klar": thunderforestLayers.Atlas,
    "Öffi": thunderforestLayers.Transport,
    "Radwege": thunderforestLayers.Cycle,
    "Grau": basemapLayers.BmapGrau,
    "Kontrast": thunderforestLayers.Mobile_Atlas,
    "Papyrus": thunderforestLayers.Pioneer,
};
// Add default layer to map
baseLayers["Standardkarte"].addTo(map);
map.on('baselayerchange', function(e) {
    currentBaseLayer = e.name;
    updateMarkerIcons();
});
L.control.layers(baseLayers).addTo(map);
// Global variable to store the future marker icon and details
let futureMarker = {
    icon: null,
    category: '',
    description: ''
};
// Function to create a colored circle icon
function createIcon(pinSize, outlineSize, fillColor, isFeatured) {
    var adjustedPinSize = currentBaseLayer === 'Satellit' ? pinSize * 2.5 : pinSize * 1.5;
    var strokeColor = currentBaseLayer === 'Satellit' ? 'white' : fillColor;
    var strokeWidth = currentBaseLayer === 'Satellit' ? 5 : outlineSize * 10;
    var strokeOpacity = currentBaseLayer === 'Satellit' ? 1 : 0.5;
    // Star emoji
    var starSize = adjustedPinSize / 2; // Star emoji size
    var starEmoji = isFeatured ? `
         											<text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" font-size="${starSize}" fill="yellow">⭐</text>` : '';
    // Black outline for featured project
    var blackOutline = isFeatured ? `
         											<circle cx="${adjustedPinSize / 2}" cy="${adjustedPinSize / 2}" r="${adjustedPinSize / 4 + 2}" stroke="black" stroke-width="2" fill="none" />` : '';
    // SVG icon with conditional star and outline
    var svgIcon = `
         											<svg
         												xmlns="http://www.w3.org/2000/svg" width="${adjustedPinSize}" height="${adjustedPinSize}" viewBox="0 0 ${adjustedPinSize} ${adjustedPinSize}">
         												<circle cx="${adjustedPinSize / 2}" cy="${adjustedPinSize / 2}" r="${adjustedPinSize / 4}" fill="${fillColor}" />
         												<circle cx="${adjustedPinSize / 2}" cy="${adjustedPinSize / 2}" r="${adjustedPinSize / 4}" stroke="${strokeColor}" stroke-width="${strokeWidth}" fill="none" stroke-opacity="${strokeOpacity}" />
                ${blackOutline}
                ${starEmoji}
            
         											</svg>`;
    return L.icon({
        iconUrl: `data:image/svg+xml;base64,${btoa(unescape(encodeURIComponent(svgIcon)))}`,
        iconSize: [adjustedPinSize, adjustedPinSize],
        iconAnchor: [adjustedPinSize / 2, adjustedPinSize / 2],
        popupAnchor: [0, -adjustedPinSize / 2]
    });
}
// Function to create a simple SVG icon for cursor
function createCursorIcon(fillColor) {
    var svgCursorIcon = `
         											<svg
         												xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
         												<circle cx="12" cy="12" r="10" fill="${fillColor}" />
         											</svg>`;
    return `data:image/svg+xml;base64,${btoa(unescape(encodeURIComponent(svgCursorIcon)))}`;
}
var isMarkerCreationActive = false;
// Function to set the map cursor and activate marker creation process
function setMapCursor() {
    var cursorIconUrl = futureMarker.icon;
    document.getElementById('map').style.cursor = `url('${cursorIconUrl}') 12 12, auto`;
    isMarkerCreationActive = true; // Activate marker creation process
}
// Function to handle map click for placing a marker
function handleMapClick(e) {
    // Only process click if marker creation is active
    if (isMarkerCreationActive) {
        // Check if the clicked location is inside the boundary
        if (boundary.contains(e.latlng)) {
            selectedLatLng = e.latlng;
            var tempMarker = L.marker(e.latlng, {
                icon: createIcon(24, 2, getCategoryColor(futureMarker.category))
            }).addTo(map);
            showCustomConfirm(selectedLatLng, tempMarker);
        } else {}
    }
}
// Register the map click event listener
map.on('click', handleMapClick);
// Function to show the custom confirmation dialog
function showCustomConfirm(latlng, tempMarker) {
    var confirmDiv = document.getElementById('custom-confirm');
    confirmDiv.style.display = 'block';
    document.getElementById('confirm-yes').onclick = function() {
        saveMarkerData(latlng, futureMarker.category, futureMarker.description, function(savedMarkerData) {
            map.removeLayer(tempMarker); // Remove the temporary marker
            addNewMarker(latlng, futureMarker.category, futureMarker.description, savedMarkerData.id);
        });
        confirmDiv.style.display = 'none';
        resetMapCursor();
        isMarkerCreationActive = false;
    };
    document.getElementById('confirm-tryagain').onclick = function() {
        map.removeLayer(tempMarker); // Remove the temporary marker
        confirmDiv.style.display = 'none';
        isMarkerCreationActive = true; // Reactivate marker creation process
        setMapCursor(); // Reset cursor to marker icon
    };
    document.getElementById('confirm-no').onclick = function() {
        map.removeLayer(tempMarker); // Remove the temporary marker
        confirmDiv.style.display = 'none';
        resetMapCursor();
        isMarkerCreationActive = false; // Deactivate marker creation process
    };

    function addNewMarker(latLng, category, description, markerId) {
        var fillColor = getCategoryColor(category);
        var popupContent = `
         											<div style="text-align: center;">${description}</div>`;
        var marker = L.marker(latLng, {
            icon: createIcon(24, 2, fillColor, false), // Assuming the new marker is not featured
            category: category,
            isMapObject: true,
            isFeatured: false
        }).addTo(map);
        marker.bindPopup(popupContent);
        // Attach the markerId to the marker
        marker.markerId = markerId;
        // Add the new marker to the corresponding category layer
        if (!categoryLayers[category]) {
            categoryLayers[category] = L.layerGroup().addTo(map);
        }
        marker.addTo(categoryLayers[category]);
        // Update button text for the category
        updateCategoryButtonText(category);
    }

    function updateCategoryButtonText(category) {
        var button = document.querySelector(`button[category-name="${category}"]`);
        if (button && categoryLayers[category]) {
            button.innerText = `${category} (${categoryLayers[category].getLayers().length} Beiträge)`;
        }
    }
    document.getElementById('confirm-tryagain').onclick = function() {
        map.removeLayer(tempMarker); // Remove the temporary marker
        confirmDiv.style.display = 'none';
        isMarkerCreationActive = true; // Reactivate marker creation process
        setMapCursor(); // Reset cursor to marker icon
    };
    document.getElementById('confirm-no').onclick = function() {
        map.removeLayer(tempMarker);
        confirmDiv.style.display = 'none';
        resetMapCursor();
        isMarkerCreationActive = false; // Deactivate marker creation process
    };
}
// Function to reset map cursor
function resetMapCursor() {
    document.getElementById('map').style.cursor = '';
    isMarkerCreationActive = false; // Deactivate marker creation process
}
// Function to open marker overlay
function openMarkerOverlay(event) {
    var overlay = document.getElementById('marker-overlay');
    if (overlay) {
        overlay.style.display = 'flex'; // Force display flex
        overlay.style.justifyContent = 'center';
        overlay.style.alignItems = 'center';
        overlay.style.zIndex = '10000'; // Ensure it's above other content
        // Update the category description when the overlay is opened
        updateMarkerCategoryDescription();
    } else {}
    // Stop propagation if it's a user-triggered event
    if (event) {
        event.stopPropagation();
    }
}
// Function to initialize event listeners
function initializeEventListeners() {
    // Attach a click event listener to the "marker-description" text area
    document.getElementById('marker-description').addEventListener('click', function() {});
}
// Call the function to initialize the event listeners
initializeEventListeners();

function updateMarkerCategoryDescription() {
    const categorySelect = document.getElementById("marker-category");
    const categoryDescription = document.getElementById("marker-category-description");
    const selectedOption = categorySelect.value;
    let categoryText = "";
    switch (selectedOption) {
        case "Transport":
            categoryText = "Wünschen Sie sich einen neuen Radweg? Eine neue Busverbindung? Gibt es Probleme mit dem Parken?";
            break;
        case "Öffentliche Plätze":
            categoryText = "Sollen öffentliche Plätze umgestaltet werden? Braucht es mehr Grünflächen?";
            break;
        case "Umwelt":
            categoryText = "Ist Ihnen Umweltverschmutzung aufgefallen? Haben Sie Ideen, um die Stadt sauberer, ökologischer oder Zukunftsfit zu machen?";
            break;
        case "Verwaltung":
            categoryText = "Gibt es Ideen für bessere Dienste der Verwaltung? Projektvorschläge, öffentliche Veranstaltungen betreffen?";
            break;
        case "Kultur":
            categoryText = "Gibt es Ideen für Veranstaltungen, Kunstinstallationen, Theater oder Literatur?";
            break;
        case "Bildung":
            categoryText = "Welche Dinge im Bereich der Bildung, Schulen und Hochschulen können wir als Gemeinde verbessern?";
            break;
        case "Gesundheit":
            categoryText = "Ideen zum Thema Gesundheit? Verbesserungsvorschläge für medizinische Einrichtungen oder gesundheitsfördernde Maßnahmen?";
            break;
        case "Sport":
            categoryText = "Ideen zu Sportveranstaltungen, Sportplätzen oder städtischen Kursen?";
            break;
        case "Andere":
            categoryText = "Haben Sie einen eigenen Vorschlag, der in keine der genannten Kategorien passt? Teilen Sie Ihre Idee uns mit!";
            break;
        default:
            categoryText = "Bitte wählen Sie eine Kategorie aus.";
            break;
    }
    categoryDescription.textContent = categoryText;
}
var swearWords = {
    "de": [],
    "en": []
};
// Function to load swear words from filter.json
function loadSwearWords() {
    fetch('/static/filter.json').then(response => response.json()).then(data => {
        swearWords = data;
    }).catch(error => {});
}
// Call this function when the page loads
loadSwearWords();
// Function to check for swear words in a given text
function containsSwearWords(text, language) {
    var words = swearWords[language] || [];
    var textWords = text.toLowerCase().split(/\s+/);
    return textWords.some(word => words.includes(word));
}
// Function to handle posting a marker
// Function to handle posting a marker
function postMarker() {
    // Get the textarea and its value
    var markerDescriptionTextarea = document.getElementById('marker-description');
    var description = markerDescriptionTextarea.value;

    if (containsSwearWords(description, 'de') || containsSwearWords(description, 'en')) {
        alert("Bitte entfernen Sie unangebrachte Ausdrücke aus Ihrer Beschreibung.");
        return; // Stop the function here if swear words are found
    }
    if (isSpam(description)) {
        alert("Ihr Text scheint Spam zu enthalten. Bitte überprüfen Sie ihn und versuchen Sie es erneut.");
        return;
    }
    // Check if the description meets the minimum character requirement
    if (description.length < 15) {
        alert("Bitte geben Sie mindestens 15 Zeichen ein.");
        return; // Stop the function if the condition is not met
    }
    // Continue with the rest of your function if the condition is met
    var markerOverlay = document.getElementById('marker-overlay');
    if (markerOverlay) {
        markerOverlay.style.display = 'none';
    } else {
        return;
    }
    // Get the selected category from the form
    var selectedCategory = document.getElementById('marker-category').value;
    // Prepare the future marker details
    futureMarker.category = selectedCategory;
    futureMarker.description = description;
    var fillColor = getCategoryColor(selectedCategory);
    futureMarker.icon = createCursorIcon(fillColor);
    // Change the cursor to the future marker icon
    setMapCursor();
    // Clear the textarea
    document.getElementById('marker-description').value = '';
}
// Function to toggle the sidebar visibility and adjust map size
function toggleMarkerSidebar() {
    var sidebar = document.getElementById('sidebar');
    var mapElement = document.getElementById('map');
    if (sidebar.style.display === 'none' || sidebar.style.display === '') {
        sidebar.style.display = 'block';
        mapElement.classList.add('sidebar-visible'); // Add class to resize map
    } else {
        sidebar.style.display = 'none';
        mapElement.classList.remove('sidebar-visible'); // Remove class to resize map
    }
}
var allMarkers = []; // Store all markers
var displayedMarkersCount = 0;
const markersPerPage = 20; // Number of markers per page
const categoryColors = {
    'Transport': '#133873',
    'Öffentliche Plätze': '#ff5c00',
    'Umwelt': '#4CAF50',
    'Verwaltung': '#653993',
    'Kultur': '#431307',
    'Bildung': '#eab003',
    'Gesundheit': '#9A031E',
    'Sport': '#3d4f53',
    'Andere': '#212121'
};

function addMarkersToOverlay(markers) {
    allMarkers = markers; // Store all markers
    displayedMarkersCount = 0; // Reset displayed markers count
    loadMoreMarkers(); // Load initial set of markers
    const sortedMarkers = sortMarkersByNewest(markers);
    let currentPage = 1; // Start with the first page
    let filteredMarkers = markers.slice().sort((a, b) => b.id - a.id); // Default to Sortieren by newest
    let showFullProjectsOnly = false;
    const categoryColors = {
        'Transport': '#133873',
        'Öffentliche Plätze': '#ff5c00',
        'Umwelt': '#4CAF50',
        'Verwaltung': '#653993',
        'Kultur': '#431307',
        'Bildung': '#eab003',
        'Gesundheit': '#9A031E',
        'Sport': '#3d4f53',
        'Andere': '#212121'
    };

    function filterByCategory(category) {
        let tempMarkers = markers;
        if (category !== "Alle") {
            tempMarkers = tempMarkers.filter(marker => marker.category === category);
        }
        if (showFullProjectsOnly) {
            tempMarkers = tempMarkers.filter(marker => !marker.is_mapobject);
        }
        filteredMarkers = tempMarkers.slice().sort((a, b) => b.id - a.id); // Sortieren by Sortieren by newest
        renderPage(1); // Reset to the first page after filtering
    }

    function sortMarkers(sortType) {
        if (sortType === "Neueste") {
            filteredMarkers.sort((a, b) => new Date(b.date) - new Date(a.date));
        } else if (sortType === "Älteste") {
            filteredMarkers.sort((a, b) => new Date(a.date) - new Date(b.date));
        }

        renderPage(1); // Reset to the first page after sorting
    }

    function createCategoryFilter() {
        const filterDiv = document.getElementById('category-filter');
        filterDiv.innerHTML = ''; // Clear existing content
        const select = document.createElement('select');
        select.id = 'category-select';
        select.onchange = function() {
            filterByCategory(this.value);
        };
        const categories = ["Alle", "Transport", "Öffentliche Plätze", "Umwelt", "Verwaltung", "Kultur", "Bildung", "Gesundheit", "Sport", "Andere"];
        categories.forEach(category => {
            const option = document.createElement('option');
            option.value = category;
            option.innerText = category;
            select.appendChild(option);
        });
        filterDiv.appendChild(select);
    }

    function createSortFilter() {
        const sortDiv = document.getElementById('sort-filter');
        sortDiv.innerHTML = ''; // Clear existing content
        const select = document.createElement('select');
        select.id = 'sort-select';
        select.onchange = function() {
            sortMarkers(this.value);
        };
        const sortOptions = ["Neueste", "Älteste"];
        sortOptions.forEach(option => {
            const optionElement = document.createElement('option');
            optionElement.value = option;
            optionElement.innerText = option;
            select.appendChild(optionElement);
        });
        sortDiv.appendChild(select);
    }
    // Call these functions to create filters
    createCategoryFilter();
    createSortFilter();

    function paginateMarkers(page, markersPerPage) {
        const startIndex = (page - 1) * markersPerPage;
        const endIndex = startIndex + markersPerPage;
        return filteredMarkers.slice(startIndex, endIndex);
    }

    function renderPage(page) {
        currentPage = parseInt(page);
        const paginatedMarkers = paginateMarkers(page, markersPerPage);
        const list = document.getElementById('markers-list');
        list.innerHTML = '';
        if (paginatedMarkers.length === 0) {
            const noMarkersMessage = document.createElement('p');
            noMarkersMessage.textContent = "Keine Beiträge gefunden!";
            noMarkersMessage.style.textAlign = 'center';
            list.appendChild(noMarkersMessage);
        } else {
            paginatedMarkers.forEach(marker => {
                const listItem = document.createElement('li');
                const displayText = marker.is_mapobject ? marker.descriptionwhy : marker.name;
                const link = document.createElement('a');
                link.href = "#";
                link.style.color = categoryColors[marker.category] || 'black';
                link.style.fontWeight = marker.is_mapobject ? 'normal' : 'bold';
                link.style.textDecoration = 'none';
                link.innerHTML = displayText;
                link.onclick = function() {
                    centerMapOnMarker(marker.id);
                    return false;
                };
                listItem.appendChild(link);
                list.appendChild(listItem);
            });
        }
    }
    window.addEventListener('resize', function() {
        renderPage(currentPage);
    });
    document.getElementById('show-markers-btn').addEventListener('click', function() {
        var markersListOverlay = document.getElementById('markers-list-overlay');
        var showMarkersBtn = this; // Reference the clicked button
        if (markersListOverlay.style.display === 'block') {
            // Hide the overlay and change button text to "Liste anzeigen"
            markersListOverlay.style.display = 'none';
            showMarkersBtn.innerText = 'Liste anzeigen';
        } else {
            // Show the overlay and change button text to "Liste ausblenden"
            createSortFilter(); // Initialize sorting filter
            markersListOverlay.style.display = 'block';
            renderPage(1); // Render the first page of markers
            showMarkersBtn.innerText = 'Liste ausblenden';
        }
    });
    // Event listener for the 'Schließen' button
    document.getElementById('close-overlay-button').addEventListener('click', function() {
        var markersListOverlay = document.getElementById('markers-list-overlay');
        var showMarkersBtn = document.getElementById('show-markers-btn');
        // Hide the overlay and change button text to "Liste anzeigen"
        markersListOverlay.style.display = 'none';
        showMarkersBtn.innerText = 'Liste anzeigen';
    });
    // Global variable to track the filter state
    // Function to update marker visibility
    // Function to update marker visibility and synchronize button states
    function updateMarkerVisibility() {
        showFullProjectsOnly = !showFullProjectsOnly;
        // Retrieve the currently selected category
        const selectedCategory = document.getElementById('category-select').value;
        let tempMarkers = markers;
        if (showFullProjectsOnly) {
            tempMarkers = tempMarkers.filter(marker => !marker.is_mapobject);
        }
        if (selectedCategory !== "Alle") {
            tempMarkers = tempMarkers.filter(marker => marker.category === selectedCategory);
        }
        filteredMarkers = tempMarkers.slice().sort((a, b) => b.id - a.id); // Sortieren by newest
        renderPage(1); // Reset to the first page after filtering
        for (var category in categoryLayers) {
            categoryLayers[category].eachLayer(function(marker) {
                if (showFullProjectsOnly && marker.options.isMapObject) {
                    map.removeLayer(marker);
                } else {
                    map.addLayer(marker);
                }
            });
        }
        // Update the text of both buttons
        const filterButton = document.getElementById('full-project-filter-button');
        const hideMarkersButton = document.getElementById('hideNonMapMarkers');
        if (filterButton) {
            filterButton.textContent = showFullProjectsOnly ? 'Alles anzeigen' : 'Nur Projektvorschläge anzeigen';
        }
        if (hideMarkersButton) {
            hideMarkersButton.textContent = showFullProjectsOnly ? 'Alles anzeigen' : 'Nur Projektvorschläge anzeigen';
        }
    }
    // Function to create the full project filter
    function createFullProjectFilter() {
        const filterDiv = document.getElementById('full-project-filter');
        filterDiv.innerHTML = ''; // Clear existing content
        // Create the button
        const filterButton = document.createElement('button');
        filterButton.id = 'full-project-filter-button';
        filterButton.className = 'register-button-f'; // Use your desired class
        filterButton.textContent = 'Nur Projektvorschläge anzeigen';
        // Event listener for the button
        filterButton.addEventListener('click', updateMarkerVisibility);
        filterDiv.appendChild(filterButton);
    }
    // Button event listener for hideNonMapMarkers button
    document.getElementById('hideNonMapMarkers').addEventListener('click', updateMarkerVisibility);
    // Initialize the filter button
    createFullProjectFilter();
    // Call to create the filter UI
    function updatePaginationControls(page, markersPerPage) {
        const totalPages = Math.ceil(filteredMarkers.length / markersPerPage);
        const paginationDiv = document.getElementById('pagination-controls');
        paginationDiv.innerHTML = '';
        for (let i = 1; i <= totalPages; i++) {
            const pageButton = document.createElement('button');
            pageButton.innerText = i;
            pageButton.onclick = function() {
                renderPage(i);
            };
            if (i === page) {
                pageButton.style.fontWeight = 'bold';
            }
            paginationDiv.appendChild(pageButton);
        }
    }
    createCategoryFilter(); // Create category filter
    createSortFilter(); // Create sort filter
    createFullProjectFilter(); // Create full project filter
    renderPage(currentPage);
}

function updateMarkerIcons() {
    for (var category in categoryLayers) {
        categoryLayers[category].eachLayer(function(marker) {
            var pinSize = 24; // Base pin size
            var outlineSize = 2;
            var fillColor = getCategoryColor(marker.options.category);
            var isFeatured = marker.options.isFeatured; // Use the isFeatured option set on the marker
            var newIcon = createIcon(pinSize, outlineSize, fillColor, isFeatured);
            marker.setIcon(newIcon);
        });
    }
}
document.addEventListener('click', function(event) {
    // Check if the click is within the voting bar or its child elements
    if (event.target.closest('.voting-bar, .upvotes, .downvotes')) {
        return; // Exit the function early if click is on the voting bar
    }
    var markerOverlay = document.getElementById('marker-overlay');
    var overlayContent = document.getElementById('overlay-content');
    var navOverlay = document.getElementById('nav-overlay');
    var videoOverlay = document.getElementById('video-overlay'); // First video overlay
    var videoOverlay2 = document.getElementById('video-overlay-2'); // Second video overlay
    // Check if the clicked element is part of the nav-overlay
    if (navOverlay && navOverlay.contains(event.target)) {
        return; // Exit the function if clicked inside nav-overlay
    }
    // Check if the clicked element is part of the video-overlay
    if (videoOverlay && videoOverlay.contains(event.target)) {
        return; // Exit the function if clicked inside video-overlay
    }
    // Check if the clicked element is part of the video-overlay-2
    if (videoOverlay2 && videoOverlay2.contains(event.target)) {
        return; // Exit the function if clicked inside video-overlay-2
    }
    // Close the marker overlay if it is open and the click is outside its content
    if (markerOverlay && markerOverlay.style.display !== 'none' && !overlayContent.contains(event.target)) {
        markerOverlay.style.display = 'none';
    } else {}
});
// Function to get color based on category with added debugging
function getCategoryColor(category) {
    var color;
    switch (category) {
        case 'Transport':
            color = '#133873';
            break;
        case 'Öffentliche Plätze':
            color = '#ff5c00';
            break;
        case 'Umwelt':
            color = '#4CAF50';
            break;
        case 'Verwaltung':
            color = '#653993';
            break;
        case 'Kultur':
            color = '#431307';
            break;
        case 'Bildung':
            color = '#eab003';
            break;
        case 'Gesundheit':
            color = '#9A031E';
            break;
        case 'Sport':
            color = '#3d4f53';
            break;
        case 'Andere':
            color = '#212121';
            break;
        default:
            color = '#888'; // Default color
            break;
    }
    return color;
}
var categoryLayers = {}; // Global object to hold category layers
function logSelectedCategory() {
    var selectedCategory = document.getElementById('marker-category').value;
}
var markersById = {};

function addMarkers(projects) {
    projects.forEach(project => {
        if (project.geoloc) {
            var coords = project.geoloc.split(',');
            var latLng = L.latLng(parseFloat(coords[0]), parseFloat(coords[1]));
            var fillColor = getCategoryColor(project.category);
            var isFeatured = project.is_featured; // Check if the project is featured
            var popupContent;
            // Calculate vote percentages
            var totalVotes = project.upvotes + project.downvotes;
            var upvotePercentage = totalVotes > 0 ? ((project.upvotes / totalVotes) * 100).toFixed(1) : 0;
            var downvotePercentage = totalVotes > 0 ? ((project.downvotes / totalVotes) * 100).toFixed(1) : 0;
            if (project.is_mapobject) {
                // For Notizens, show simple description
                popupContent = `
         											<div style="text-align: center;">${project.descriptionwhy}</div>`;
            } else {
                // For Projektvorschläges, show detailed popup with voting details
                var votingDetailsHtml = `
                            
         											<div style="text-align: center; margin-bottom: 1px; font-size: 14px; font-weight: bold;">
         												<span onclick="vote(${project.id}, 'upvote')" class="vote-button" style="cursor: pointer;">👍</span>: 
         												<span id="upvote-count-${project.id}">${project.upvotes}</span>,
                                
         												<span onclick="vote(${project.id}, 'downvote')" class="vote-button"  style="cursor: pointer;">👎</span>: 
         												<span id="downvote-count-${project.id}">${project.downvotes}</span>
         											</div>
                        `;
                var votingBarHtml = `
                            
         											<div class="voting-bar" style="margin-top: 1px;">
         												<div class="upvotes" style="width: ${upvotePercentage}%;"></div>
         												<div class="downvotes" style="width: ${downvotePercentage}%;"></div>
         											</div>
                        `;
                popupContent = `
                            
         											<div style="text-align: center;">
         												<b>${project.name}</b>
         												<br>
         													<img src="/static/usersubmissions/${project.image_file}" style="width:300px; height:auto; object-fit: contain; display: block; margin: 10px auto; border-radius: 30px;">
                                ${votingDetailsHtml}
                                ${votingBarHtml}
                                
         														<a href="/project_details/${project.id}" target="_blank" class="button-hover-effect" style="font-size: 14px; font-weight: bold; color:white !important;">
                                    Details anzeigen
                                </a>
         													</div>
                        `;
            }
            var marker = L.marker(latLng, {
                icon: createIcon(24, 2, fillColor, isFeatured),
                category: project.category,
                isMapObject: project.is_mapobject,
                isFeatured: isFeatured
            }).addTo(map);
            marker.bindPopup(popupContent);
            map.on('popupopen', function(e) {
                var popupContent = e.popup.getContent();
                var tempDiv = document.createElement('div');
                tempDiv.innerHTML = popupContent;
                var upvoteElement = tempDiv.querySelector('[id^="upvote-count-"]');
                if (upvoteElement) {
                    var projectId = upvoteElement.id.replace('upvote-count-', '');
                    setInitialVoteBarStyles(projectId);
                }
            });
            markersById[project.id] = marker;
            if (!categoryLayers[project.category]) {
                categoryLayers[project.category] = L.layerGroup().addTo(map);
            }
            marker.addTo(categoryLayers[project.category]);
        }
    });
}

function setInitialVoteBarStyles(projectId) {
    document.querySelectorAll('.voting-bar').forEach(votingBar => {
        const upvoteElement = votingBar.querySelector('.upvotes');
        const downvoteElement = votingBar.querySelector('.downvotes');
        // Adjust border-radius
        const upvotePercentage = parseFloat(upvoteElement.style.width);
        const downvotePercentage = parseFloat(downvoteElement.style.width);
        if (upvotePercentage > 0 && downvotePercentage > 0) {
            upvoteElement.style.borderRadius = '30px 0 0 30px';
            downvoteElement.style.borderRadius = '0 30px 30px 0';
        } else if (upvotePercentage > 0) {
            upvoteElement.style.borderRadius = '30px';
            downvoteElement.style.borderRadius = '0';
        } else if (downvotePercentage > 0) {
            downvoteElement.style.borderRadius = '30px';
            upvoteElement.style.borderRadius = '0';
        }
        // Attach event listeners for voting
        upvoteElement.onclick = function() {
            vote(projectId, 'upvote');
        };
        downvoteElement.onclick = function() {
            vote(projectId, 'downvote');
        };
    });
}
// Call the function on page load
document.addEventListener('DOMContentLoaded', function() {
    setInitialVoteBarStyles();
});

function vote(projectId, voteType) {
    // Check if user is logged in
    if (!userLoggedIn) {
        alert("Melden Sie sich an, um über Projekte abzustimmen.");
        return;
    }
    fetch(`/vote/${projectId}/${voteType}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        },
        body: JSON.stringify({
            'project_id': projectId,
            'vote_type': voteType
        })
    }).then(response => response.json()).then(data => {
        if (data.success) {
            // Update UI elements
            updateVotingUI(projectId, data);
        } else {}
    }).catch(error => {});
}

function updateVotingUI(projectId, data) {
    var openPopup = null;
    map.eachLayer(function(layer) {
        // Check if layer has a popup and if it is open
        if (layer.getPopup && layer.getPopup() && layer.getPopup().isOpen()) {
            openPopup = layer.getPopup();
        }
    });
    // Proceed if an open popup is found
    if (openPopup) {
        // Extract and parse the popup content
        const popupContent = openPopup.getContent();
        const parser = new DOMParser();
        const popupDoc = parser.parseFromString(popupContent, 'text/html');
        // Update the voting counts and percentages
        const upvoteCountElement = popupDoc.getElementById(`upvote-count-${projectId}`);
        const downvoteCountElement = popupDoc.getElementById(`downvote-count-${projectId}`);
        const upvotePercentage = data.upvote_percentage.toFixed(1);
        const downvotePercentage = data.downvote_percentage.toFixed(1);
        if (upvoteCountElement) upvoteCountElement.innerText = `${data.upvote_count}`;
        if (downvoteCountElement) downvoteCountElement.innerText = `${data.downvote_count}`;
        // Update voting bars widths and adjust border-radius
        const upvotesBar = popupDoc.querySelector(`.upvotes`);
        const downvotesBar = popupDoc.querySelector(`.downvotes`);
        if (upvotesBar && downvotesBar) {
            upvotesBar.style.width = `${upvotePercentage}%`;
            downvotesBar.style.width = `${downvotePercentage}%`;
            if (data.upvote_count > 0 && data.downvote_count > 0) {
                upvotesBar.style.borderRadius = '30px 0 0 30px';
                downvotesBar.style.borderRadius = '0 30px 30px 0';
            } else if (data.upvote_count > 0 && data.downvote_count === 0) {
                upvotesBar.style.borderRadius = '30px';
                downvotesBar.style.borderRadius = '0';
            } else if (data.upvote_count === 0 && data.downvote_count > 0) {
                downvotesBar.style.borderRadius = '30px';
                upvotesBar.style.borderRadius = '0';
            }
        }
        // Update popup content with the modified HTML
        openPopup.setContent(popupDoc.documentElement.innerHTML);
    }
    setInitialVoteBarStyles(projectId); // Call this at the end of the function
}

function adjustBorderRadius(upvoteElement, downvoteElement, upvoteCount, downvoteCount) {
    if (upvoteCount > 0 && downvoteCount > 0) {
        upvoteElement.style.borderRadius = '30px 0 0 30px';
        downvoteElement.style.borderRadius = '0 30px 30px 0';
    } else if (upvoteCount > 0 && downvoteCount === 0) {
        upvoteElement.style.borderRadius = '30px';
    } else if (upvoteCount === 0 && downvoteCount > 0) {
        downvoteElement.style.borderRadius = '30px';
    }
}

function loadMoreMarkers() {
    const list = document.getElementById('markers-list');
    const showMoreBtn = document.getElementById('show-more-markers');
    // Determine the next set of markers to display
    const nextMarkers = allMarkers.slice(displayedMarkersCount, displayedMarkersCount + markersPerPage);
    nextMarkers.forEach(marker => {
        // Create list item for each marker
        const listItem = document.createElement('li');
        const displayText = marker.is_mapobject ? marker.descriptionwhy : marker.name;
        const link = document.createElement('a');
        link.href = "#";
        link.style.color = categoryColors[marker.category] || 'black';
        link.style.fontWeight = marker.is_mapobject ? 'normal' : 'bold';
        link.style.textDecoration = 'none';
        link.innerHTML = displayText;
        link.onclick = function() {
            centerMapOnMarker(marker.id);
            return false;
        };
        listItem.appendChild(link);
        list.appendChild(listItem);
    });
    // Update the count of displayed markers
    displayedMarkersCount += nextMarkers.length;
    // Check if there are more markers to show
    if (displayedMarkersCount < allMarkers.length) {
        showMoreBtn.style.display = 'block'; // Show the "Show More" button
        showMoreBtn.classList.add('register-button-f');
    } else {
        showMoreBtn.style.display = 'none'; // Hide the button if no more markers
    }
}
fetch('/get_projects').then(response => {
    if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
    }
    return response.json();
}).then(data => {
    const sortedData = sortMarkersByNewest(data); // Sortieren data by newest
    addMarkers(sortedData); // Add markers to the map in sorted order
    createCategoryButtons();
    updateCategoryButtonColors(); // Update category button colors
    // Ensure markers in the overlay are sorted by newest
    addMarkersToOverlay(sortedData);
}).catch(error => {});

function sortMarkersByNewest(markers) {
    return markers.sort((a, b) => new Date(b.date) - new Date(a.date));
}
var markersListOverlay = document.getElementById('markers-list-overlay');



function containsSwearWords(text, language) {
    var words = swearWords[language] || [];
    var textWords = text.toLowerCase().split(/\s+/);
    return textWords.some(word => words.includes(word));
}




function centerMapOnMarker(markerId) {
    var marker = markersById[markerId];
    if (marker) {
        var markerLatLng = marker.getLatLng();
        var popup = marker.getPopup();

        // Temporarily open the popup offscreen to measure its size if it's not already open
        var wasPopupOpen = map.hasLayer(popup);
        if (!wasPopupOpen) {
            popup.setLatLng(new L.LatLng(-90, -180)); // Offscreen position
            popup.openOn(map);
        }

        // Measure the popup size or use default values
        var popupWidth = popup.getElement() ? popup.getElement().clientWidth : 300; // Default width
        var popupHeight = popup.getElement() ? popup.getElement().clientHeight : 200; // Default height

        // Close the popup if it was not originally open
        if (!wasPopupOpen) {
            map.closePopup(popup);
        }

        var xOffset = 0;
        var yOffset = 0;
        // Adjust offsets for mobile screens
        if (window.innerWidth <= 1080) {
            xOffset = 0; // Adjust xOffset as needed based on mobile layout
            yOffset = popupHeight / 4 + 20; // Adjust yOffset as needed to center on mobile, and additional 20 pixels to move it below
        } else {
            yOffset = 20; // For non-mobile, move the marker 20px below the center
        }

        // Calculate the new center of the map
        var point = map.project(markerLatLng, map.getZoom()).subtract([xOffset, yOffset]);
        var newCenter = map.unproject(point, map.getZoom());

        // Set the map view to the new position
        map.setView(newCenter, map.getZoom());

        // Open the popup after a short delay to allow the map to finish moving
        setTimeout(function() {
            marker.openPopup();
        }, 300); // 300 milliseconds delay

        // Close the markers list overlay on mobile and tablet, and update button text
        if (window.innerWidth <= 1080) {
            var sidebar = document.getElementById('markers-list-overlay');
            sidebar.style.display = 'none';
            var showMarkersBtn = document.getElementById('show-markers-btn');
            showMarkersBtn.innerText = 'Liste anzeigen';
        }
    } else {}
}




function createCategoryButtons() {
    var container = document.getElementById('category-toggle-buttons');
    for (var category in categoryLayers) {
        var wrapperDiv = document.createElement('div');
        wrapperDiv.style.textAlign = 'center';
        // Create the category button
        var button = document.createElement('button');
        button.innerText = `${category} (${categoryLayers[category].getLayers().length} Beiträge)`;
        button.setAttribute('category-name', category);
        // Apply custom styles to the button
        button.style.fontWeight = 'bold';
        button.style.lineHeight = '1';
        button.style.cursor = 'pointer';
        button.style.textDecoration = 'none';
        button.style.display = 'flex';
        button.style.alignItems = 'center';
        button.style.justifyContent = 'center';
        button.style.width = '97%';
        button.style.height = 'auto';
        button.style.boxSizing = 'border-box';
        button.style.transition = 'background-color 0.2s ease-in-out';
        button.style.borderRadius = '30px';
        button.style.textAlign = 'center';
        button.style.border = 'none'; // Ensure no border is applied
        button.style.outline = 'none'; // Remove any focus outline
        button.style.boxShadow = 'none'; // Remove any shadow that might appear as an outline
        button.style.flexGrow = '1';
        button.style.flexShrink = '1';
        button.style.padding = '7px';
        button.style.margin = '7px auto';
        button.style.fontSize = '18px';
        button.style.color = 'white';
        button.style.backgroundColor = getCategoryColor(category);
        applyButtonStyles(button);
        setButtonState(button, category);
        // Add faded effect if the layer is not initially visible
        if (!map.hasLayer(categoryLayers[category])) {
            button.classList.add('faded');
        }
        // Set onclick event
        button.onclick = function() {
            toggleCategory(this.innerText);
            setButtonState(this, this.getAttribute('category-name'));
        };
        wrapperDiv.appendChild(button);
        container.appendChild(wrapperDiv);
    }
}

function setButtonState(button, category) {
    if (map.hasLayer(categoryLayers[category])) {
        button.classList.remove('faded');
    } else {
        button.classList.add('faded');
    }
}

function applyButtonStyles(button) {
    button.style.fontWeight = 'bold';
    // ... rest of the styling ...
}

function toggleCategory(categoryName) {
    for (var category in categoryLayers) {
        if (categoryLayers.hasOwnProperty(category)) {
            var layer = categoryLayers[category];
            var button = document.querySelector(`button[category-name="${category}"]`);
            if (categoryName === `${category} (${layer.getLayers().length} Beiträge)`) {
                if (map.hasLayer(layer)) {
                    map.removeLayer(layer);
                    button.classList.add('faded');
                } else {
                    map.addLayer(layer);
                    button.classList.remove('faded');
                }
            }
        }
    }
}

function updateCategoryButtonColors() {
    const categoryColors = {
        'Transport': '#133873',
        'Öffentliche Plätze': '#ff5c00',
        'Umwelt': '#4CAF50',
        'Verwaltung': '#653993',
        'Kultur': '#431307',
        'Bildung': '#eab003',
        'Gesundheit': '#9A031E',
        'Sport': '#3d4f53',
        'Andere': '#212121'
    };
    const categoryButtons = document.querySelectorAll('#category-toggle-buttons button');
    categoryButtons.forEach(button => {
        const buttonText = button.textContent.trim();
        const categoryMatch = buttonText.match(/^(.*?)(?=\s*\()/); // Use regex to extract the category name before the "("
        const category = categoryMatch ? categoryMatch[0].trim() : "";
        const color = categoryColors[category];
        if (color) {
            button.style.backgroundColor = color;
        }
    });
}
// Call the function after the buttons are added to the DOM
updateCategoryButtonColors();
let selectedLatLng;
// Variable to store the selected latitude and longitude
// Add this function in your JavaScript
function saveMarkerData(latlng, category, description, callback) {
    var isAuthenticated = false /* logic to determine if the user is authenticated */
    var dataToSend = {
        lat: latlng.lat,
        lng: latlng.lng,
        category: category,
        description: description,
        isAnonymous: !isAuthenticated
    };
    $.ajax({
        url: '/add_marker',
        method: 'POST',
        data: JSON.stringify(dataToSend),
        contentType: 'application/json; charset=utf-8',
        dataType: 'json',
        success: function(response) {
            if (callback) {
                callback(response); // Execute the callback with the response data
            }
            checkMarkerLimit();
        },
        error: function(xhr, textStatus, errorThrown) {
            if (xhr.status === 429) {
                alert("Sie haben Ihr Tageslimit für das Hinzufügen von Markierungen erreicht. Versuchen Sie es später noch einmal.");
            } else {}
        }
    });
}

function checkMarkerLimit() {
    fetch('/check_marker_limit').then(response => response.json()).then(data => {
        const limitInfoElement = document.getElementById('limit-info');
        if (data.limit_reached) {
            document.getElementById('add-marker-button').disabled = true;
            document.getElementById('open-overlay').disabled = true;
            startTimer(data.reset_time);
            limitInfoElement.textContent = `Sie haben Ihr Tageslimit von ${data.max_limit} Markierungen erreicht.`;
        } else {
            const markersRemaining = data.max_limit - data.current_count;
            limitInfoElement.textContent = `Sie haben heute schon ${data.current_count} / 10 Markierungen gepostet.`;
        }
    }).catch(error => {
        const limitInfoElement = document.getElementById('limit-info');
        limitInfoElement.textContent = "Fehler beim Abrufen der Marker-Limit-Informationen.";
    });
}
// Call checkMarkerLimit on page load
document.addEventListener('DOMContentLoaded', function() {
    checkMarkerLimit();
});
// Timer function
function startTimer(expiryTime) {
    if (!expiryTime) return; // Add this check
    var countDownDate = new Date(expiryTime).getTime();
    var addButton = document.getElementById('add-marker-button');
    var overlayButton = document.getElementById('open-overlay');
    var interval = setInterval(function() {
        var now = new Date().getTime();
        var distance = countDownDate - now;
        var hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        var minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        var seconds = Math.floor((distance % (1000 * 60)) / 1000);
        var timerText = `Limit erreicht, läuft in ${hours}h${minutes}m ab`;
        addButton.innerText = timerText;
        overlayButton.innerText = timerText;
        if (distance < 0) {
            clearInterval(interval);
            addButton.innerText = "Hinzufügen";
            addButton.disabled = false;
            overlayButton.innerText = "Hinzufügen";
            overlayButton.disabled = false;
        }
    }, 1000);
}
// Function for updating character count on textarea
function updateTextareaCharCountFeedback(textareaElement, feedbackElement, minLimit, maxLimit) {
    var charCount = textareaElement.value.length;
    var charRemaining = maxLimit - charCount;
    if (charCount < minLimit) {
        feedbackElement.textContent = `Sie müssen noch ${minLimit - charCount} Zeichen eingeben.`;
    } else if (charCount <= maxLimit) {
        feedbackElement.textContent = `Sie können noch ${charRemaining} Zeichen eingeben.`;
    } else {
        feedbackElement.textContent = "Zeichenlimit erreicht.";
        textareaElement.value = textareaElement.value.substring(0, maxLimit);
    }
    feedbackElement.style.color = '#003056';
}
// Create a feedback element for the marker description textarea
var markerDescriptionTextarea = document.getElementById('marker-description');
var markerDescriptionFeedback = document.createElement('div');
markerDescriptionFeedback.id = 'markerDescriptionFeedback';
markerDescriptionTextarea.parentNode.insertBefore(markerDescriptionFeedback, markerDescriptionTextarea.nextSibling);
// Event listener for the marker description textarea
markerDescriptionTextarea.addEventListener('input', function() {
    updateTextareaCharCountFeedback(markerDescriptionTextarea, markerDescriptionFeedback, 15, 300);
});
updateTextareaCharCountFeedback(markerDescriptionTextarea, markerDescriptionFeedback, 15, 300); // Initial update

// Toggle the navigation overlay
function toggleNavOverlay() {
    var navOverlay = document.getElementById('nav-overlay');
    if (navOverlay.style.display === 'block') {
        navOverlay.style.display = 'none';
    } else {
        navOverlay.style.display = 'block';
    }
}
// Close the navigation overlay when clicking on the overlay background or on a non-button element
document.getElementById('nav-overlay').addEventListener('click', function(event) {
    // Close only if on mobile
    if (window.innerWidth <= 1080 && !event.target.closest('button, a')) {
        toggleNavOverlay();
    }
});
// Event listener for hamburger button
document.getElementById('hamburger-button').addEventListener('click', toggleNavOverlay);
// Resize event listener
window.addEventListener('resize', function() {
    var navOverlay = document.getElementById('nav-overlay');
    // Show on desktop, hide on mobile
    if (window.innerWidth > 1080) {
        navOverlay.style.display = 'block';
    } else {
        navOverlay.style.display = 'none';
    }
});
// Set initial state of the nav-overlay based on device width
window.onload = function() {
    var navOverlay = document.getElementById('nav-overlay');
    // Show on desktop, hide on mobile
    if (window.innerWidth > 1080) {
        navOverlay.style.display = 'block';
    } else {
        navOverlay.style.display = 'none';
    }
};
document.addEventListener('DOMContentLoaded', function() {
    var submitButton = document.getElementById('add-marker-button'); // Assuming this is your submit button's ID
    submitButton.addEventListener('click', validateMarkerDescription);
});

function validateMarkerDescription(event) {
    var description = document.getElementById('marker-description').value;

    // Check for spammy content
    if (isSpam(description)) {
        event.preventDefault(); // Prevent form submission
        return false;
    }

    // Add more validation checks as needed
}


document.getElementById('info-link').addEventListener('click', function(e) {
    e.preventDefault();
    openVideoOverlay('youtube-iframe', 'video-overlay', 'aXB8KE_gpm8', 'V7EjnHuLZjI');
});
document.getElementById('info-link2').addEventListener('click', function(e) {
    e.preventDefault();
    openVideoOverlay('youtube-iframe-2', 'video-overlay-2', '9-bWivUusZ4', '9xEXWG8TybY');
});

function openVideoOverlay(iframeId, overlayId, desktopVideoId, mobileVideoId) {
    var iframe = document.getElementById(iframeId);
    var videoId = window.innerWidth > 1080 ? desktopVideoId : mobileVideoId; // Choose video based on screen width
    iframe.src = 'https://www.youtube.com/embed/' + videoId + '?autoplay=1&mute=1&enablejsapi=1';
    document.getElementById(overlayId).style.display = 'flex';
}

function closeVideoOverlay(iframeId, overlayId) {
    var iframe = document.getElementById(iframeId);
    if (iframe.src) {
        iframe.src = '';
    }
    document.getElementById(overlayId).style.display = 'none';
}
// Initialize YouTube API
var tag = document.createElement('script');
tag.src = "https://www.youtube.com/iframe_api";
var firstScriptTag = document.getElementsByTagName('script')[0];
firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
var player, player2;

function onYouTubeIframeAPIReady() {
    player = new YT.Player('youtube-iframe', {
        videoId: 'aXB8KE_gpm8',
        events: {
            'onStateChange': onPlayerStateChange
        }
    });
    player2 = new YT.Player('youtube-iframe-2', {
        videoId: '9-bWivUusZ4',
        events: {
            'onStateChange': onPlayerStateChange2
        }
    });
}

function onPlayerStateChange(event) {
    if (event.data === YT.PlayerState.ENDED) {
        showReplayImage('youtube-iframe', 'replay-container');
    }
}

function onPlayerStateChange2(event) {
    if (event.data === YT.PlayerState.ENDED) {
        showReplayImage('youtube-iframe-2', 'replay-container-2');
    }
}

function showReplayImage(iframeId, containerId) {
    var iframe = document.getElementById(iframeId);
    iframe.style.display = 'none';
    var replayContainer = document.getElementById(containerId);
    replayContainer.style.display = 'flex';
    var replayImg = document.createElement('img');
    replayImg.id = 'replay-image';
    replayImg.src = '{{ url_for("static", filename="replay.png") }}';
    replayImg.addEventListener('click', function() {
        replayVideo(iframeId, containerId);
    });
    replayContainer.innerHTML = '';
    replayContainer.appendChild(replayImg);
}

function replayVideo(iframeId, containerId) {
    var replayContainer = document.getElementById(containerId);
    replayContainer.style.display = 'none';
    var iframe = document.getElementById(iframeId);
    iframe.style.display = 'block';
    var playerToUse = iframeId === 'youtube-iframe' ? player : player2;
    playerToUse.seekTo(0);
    playerToUse.playVideo();
}
// Event listeners for closing overlays
document.getElementById('video-overlay').addEventListener('click', function(event) {
    if (!event.target.closest('#youtube-iframe, #replay-image')) {
        closeVideoOverlay('youtube-iframe', 'video-overlay');
    }
});
document.getElementById('video-overlay-2').addEventListener('click', function(event) {
    if (!event.target.closest('#youtube-iframe-2, #replay-image')) {
        closeVideoOverlay('youtube-iframe-2', 'video-overlay-2');
    }
});