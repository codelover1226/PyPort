// Initialize the map
var map = L.map('map', {
    minZoom: 15
}).setView([48.4102, 15.6022], 15);

// Load and display tile layer on the map
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '© OpenStreetMap contributors'
}).addTo(map);

// Define the boundaries for the grey area
var centerPoint = map.project([48.4102, 15.6022], map.getZoom());
var horizontalOffset = 1125;
var verticalOffset = 594;
var southWest = map.unproject(centerPoint.subtract([horizontalOffset, verticalOffset]), map.getZoom());
var northEast = map.unproject(centerPoint.add([horizontalOffset, verticalOffset]), map.getZoom());
var bounds = L.latLngBounds(southWest, northEast);

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

// Create a polygon with a hole (inverted polygon)
L.polygon([outerBounds, innerBounds], {
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

// Fix for broken marker image
var icon = new L.Icon({
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});

// Add event listener for map click
var marker;
// Existing map click event handler in neuerbeitrag.html
// Define the coordinates for the boundary
var bounds = L.latLngBounds([
    L.latLng([48.405, 15.597]), // Southwest corner of the boundary
    L.latLng([48.415, 15.607]) // Northeast corner of the boundary
]);

console.log("Bounds set to SW: [48.405, 15.597], NE: [48.415, 15.607]");

// Initialize the map

// Define the boundaries using the method from karte.html
var horizontalOffset = 1125; // Adjust as per your requirement
var verticalOffset = 594; // Adjust as per your requirement
var centerPoint = map.project([48.4102, 15.6022], map.getZoom());
var southWest = map.unproject(centerPoint.subtract([horizontalOffset, verticalOffset]), map.getZoom());
var northEast = map.unproject(centerPoint.add([horizontalOffset, verticalOffset]), map.getZoom());
var bounds = L.latLngBounds(southWest, northEast);

// Define the coordinates for the inverted polygon (grey area)
var outerBounds = [L.latLng(-90, -180), L.latLng(90, -180), L.latLng(90, 180), L.latLng(-90, 180), L.latLng(-90, -180)];
var innerBounds = [bounds.getSouthWest(), bounds.getNorthWest(), bounds.getNorthEast(), bounds.getSouthEast(), bounds.getSouthWest()];

// Create the inverted polygon
var invertedPolygon = L.polygon([outerBounds, innerBounds], {
    color: 'grey',
    fillColor: 'grey',
    fillOpacity: 0.5
}).addTo(map);

// Add or update the click event handler
var marker;
map.on('click', function(e) {
    var coord = e.latlng;
    var lat = coord.lat;
    var lng = coord.lng;

    // Check if the clicked location is inside the boundary
    if (bounds.contains(e.latlng)) {
        console.log("You clicked the map within bounds at latitude: " + lat + " and longitude: " + lng);

        // Update the hidden input field
        document.getElementById('geoloc').value = lat + ',' + lng;

        // Add or update marker
        if (marker) {
            marker.setLatLng(coord);
        } else {
            marker = L.marker(coord, {
                icon: icon
            }).addTo(map);
        }
    } else {
        console.log("You clicked the map in THE GREY AREA (marker is not allowed!) at latitude: " + lat + " and longitude: " + lng);
    }
});


// Call invalidateSize after the map is visible/loaded
map.invalidateSize();

setTimeout(function() {
    map.invalidateSize();
}, 100); // Adjust the timeout as needed.


var cropper;
var originalSizeDisplayed = false; // Flag to track if original size has been displayed

function handleImageChange(event) {
    var file = event.target.files[0];
    if (file) {
        var reader = new FileReader();
        reader.onload = function(e) {
            if (cropper && typeof cropper.destroy === 'function') {
                cropper.destroy();
                cropper = null;
            }

            var imageContainer = document.getElementById('image-preview-container');
            imageContainer.innerHTML = '';

            var img = new Image();
            img.onload = function() {
                if (!originalSizeDisplayed) {
                    var originalSizeText = `Originalbildgröße: ${this.naturalWidth} x ${this.naturalHeight} Pixel, ${formatBytes(file.size)}`;
                    var originalSizeDiv = document.createElement('div');
                    originalSizeDiv.textContent = originalSizeText;
                    imageContainer.appendChild(originalSizeDiv);
                    originalSizeDisplayed = true;
                }

                // Adjust canvas size to maintain aspect ratio
                var aspectRatio = this.naturalWidth / this.naturalHeight;
                var targetWidth = 1920;
                var targetHeight = 1440;
                if (aspectRatio > targetWidth / targetHeight) {
                    targetHeight = targetWidth / aspectRatio;
                } else {
                    targetWidth = targetHeight * aspectRatio;
                }

                if (this.naturalWidth > targetWidth || this.naturalHeight > targetHeight) {
                    var canvas = document.createElement('canvas');
                    canvas.width = targetWidth;
                    canvas.height = targetHeight;
                    var ctx = canvas.getContext('2d');
                    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
                    canvas.toBlob(function(blob) {
                        var compressedSizeText = `Komprimiert auf ${canvas.width}x${canvas.height}, ${formatBytes(blob.size)}`;
                        var compressedSizeDiv = document.createElement('div');
                        compressedSizeDiv.textContent = compressedSizeText;
                        imageContainer.appendChild(compressedSizeDiv);

                        var dataTransfer = new DataTransfer();
                        dataTransfer.items.add(new File([blob], 'komprimiertes-bild.jpg', {
                            type: 'image/jpeg'
                        }));
                        document.getElementById('image').files = dataTransfer.files;

                        img.src = URL.createObjectURL(blob);
                    }, 'image/jpeg', 0.85);
                } else {
                    cropper = new Cropper(img, {
                        aspectRatio: 4 / 3,
                        viewMode: 1,
                        zoomable: false,
                        autoCropArea: 1 // Set crop area to cover entire image
                    });
                }
            };
            img.id = 'image-preview';
            img.style.maxWidth = '100%';
            img.src = e.target.result;
            imageContainer.appendChild(img);
        };
        reader.readAsDataURL(file);
    }
}

document.getElementById('image').addEventListener('change', handleImageChange);

// Toggle map container visibility
document.addEventListener('DOMContentLoaded', function() {
    const urlParams = new URLSearchParams(window.location.search);
    const projectID = urlParams.get('project_id');

    if (projectID) {
        console.log("Project_details.html: Entered editing mode, replacing the page title.");
        fetch(`/get_project_data/${projectID}`)
            .then(response => response.json())
            .then(data => {
                document.getElementById('page-title').textContent = 'Sie bearbeiten das Projekt: ' + data.name;

                // Handle "no-location-btn" button click
                document.getElementById('no-location-btn').addEventListener('click', function() {
                    var mapContainer = document.getElementById('map');
                    var geolocInput = document.getElementById('geoloc');

                    if (mapContainer.style.display === 'none') {
                        mapContainer.style.display = 'block';
                        geolocInput.required = true;
                    } else {
                        mapContainer.style.display = 'none';
                        geolocInput.required = false;
                        console.log(`Project_details.html: is_global for project ${projectID} set to false after 'no-location-btn' clicked.`);
                    }
                });
            })
            .catch(error => console.error('Error fetching project data:', error));
    }
});


// Modify existing form submission logic
document.querySelector('form').addEventListener('submit', function(event) {
    event.preventDefault();
    var geolocInput = document.getElementById('geoloc');
    if (geolocInput.required && !geolocInput.value) {
        alert('Bitte platzieren Sie zuerst einen Marker auf der Karte.');
        return;
    }

    // Fetch the swear words list
    fetch('/static/filter.json')
        .then(response => response.json())
        .then(filter => {
            // Get the values from the input and Quill editors
            var titleText = document.getElementById('title').value;
            var descriptionContent = descriptionEditor.root.innerText;
            var benefitContent = benefitEditor.root.innerText;

            // Check for swear words
            if (containsSwearWords(titleText, filter) ||
                containsSwearWords(descriptionContent, filter) ||
                containsSwearWords(benefitContent, filter)) {
                alert('Bitte entfernen Sie unangebrachte Ausdrücke aus Ihrer Beschreibung.');
            } else {
                // No swear words found, proceed with image handling and form submission
                handleImageAndSubmitForm(event);
            }
        })
        .catch(error => {
            console.error('Error fetching filter:', error);
            // Optionally submit the form even if the filter can't be loaded
            handleImageAndSubmitForm(event);
        });
});

function containsSwearWords(text, filter) {
    var words = text.toLowerCase().split(/\s+/);
    var swearWords = filter.de.concat(filter.en); // Assuming you want to check both German and English words
    return words.some(word => swearWords.includes(word));
}

function handleImageAndSubmitForm(event) {
    var titleText = document.getElementById('title').value;
    var descriptionContent = descriptionEditor.root.innerText;
    var benefitContent = benefitEditor.root.innerText;

    if (titleText.length < 20 || descriptionContent.length < 20 || benefitContent.length < 20) {
        alert('Jeder Text muss mindestens 20 Zeichen enthalten.');
        return;
    }

    if (cropper) {
        cropper.getCroppedCanvas({
            width: 1920,
            height: 1440,
            fillColor: '#fff'
        }).toBlob(function(blob) {
            console.log('Veröffentlichungs-Button geklickt, das zugeschnittene Bild wird verarbeitet und gespeichert.');

            // Generate a random 20 digit string
            var randomFileName = 's' + generateRandomString(10) + '.jpg';

            var dataTransfer = new DataTransfer();
            dataTransfer.items.add(new File([blob], randomFileName, {
                type: 'image/jpeg'
            }));
            document.getElementById('image').files = dataTransfer.files;

            // Submit the form
            event.target.submit();
        }, 'image/jpeg');
    } else {
        console.log('Kein Bild ausgewählt oder Cropper nicht initialisiert.');
        // Submit the form if no image is selected or cropper is not initialized
        event.target.submit();
    }
}

function generateRandomString(length) {
    var result = '';
    var characters = '0123456789';
    var charactersLength = characters.length;
    for (var i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
}

function formatBytes(bytes, decimals = 2) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}


// Toggle the navigation overlay when the hamburger button is clicked
document.getElementById('hamburger-button').addEventListener('click', function() {
    var navOverlay = document.getElementById('nav-overlay');
    navOverlay.classList.toggle('nav-overlay-active');
});

// Close the navigation overlay when clicking on the overlay background or on a non-button element
document.getElementById('nav-overlay').addEventListener('click', function(event) {
    // Close only if the clicked element is not a button or a link
    if (!event.target.closest('button, a')) {
        closeNavOverlay();
    }
});

// Function to close the navigation overlay
function closeNavOverlay() {
    var navOverlay = document.getElementById('nav-overlay');
    navOverlay.classList.remove('nav-overlay-active');
}

// Prevent closing when clicking on buttons (delegation)
document.getElementById('nav-links').addEventListener('click', function(event) {
    if (event.target.tagName === 'BUTTON' || event.target.tagName === 'A') {
        event.stopPropagation();
    }
});

// Resize event listener
window.addEventListener('resize', function() {
    // Check if the window width is greater than the threshold for mobile view
    if (window.innerWidth > 1080) {
        // Make sure the nav-overlay is displayed
        document.getElementById('nav-overlay').classList.add('nav-overlay-active');
    } else {
        // For mobile view, revert back to the default behavior
        document.getElementById('nav-overlay').classList.remove('nav-overlay-active');
    }
});

// Call the function on page load to set the initial state

function toggleOverlay() {
    var overlay = document.getElementById("category-choices");
    if (overlay.style.display === "none") {
        overlay.style.display = "flex";
    } else {
        overlay.style.display = "none";
    }
}

// JavaScript function to handle redirection to Stimmungskarte
function redirectToStimmungskarte() {
    window.location.href = '/karte';
}

// JavaScript function to handle redirection to Suggest an Idea
function redirectToList() {
    window.location.href = '/list';
}

// JavaScript function to handle redirection to List of Current Suggestions
function redirectToneuerbeitrag() {
    window.location.href = '/neuerbeitrag';
}

function toggleMenu() {
    var x = document.getElementById("nav-links");
    if (x.style.display === "block") {
        x.style.display = "none";
    } else {
        x.style.display = "block";
    }
}



// Function to update the category description text
function updateCategoryText() {
    const categorySelect = document.getElementById("category");
    const categoryDescription = document.getElementById("category-description");
    const selectedOption = categorySelect.value;

    let categoryText = "";

    switch (selectedOption) {
        case "Transport":
            categoryText = "Wünschen Sie sich einen neuen Radweg? Eine neue Busverbindung? Gibt es Probleme mit dem Parken?";
            break;
        case "Public spaces":
            categoryText = "Sollen öffentliche Plätze umgestaltet werden? Braucht es mehr Grünflächen?";
            break;
        case "Umwelt":
            categoryText = "Ist Ihnen Umweltverschmutzung aufgefallen? Haben Sie Ideen, um die Stadt sauberer, ökologischer oder Zukunftsfit zu machen?";
            break;
        case "Verwaltung":
            categoryText = "Gibt es Ideen für bessere Dienste der Verwaltung?. Projektvorschläge, öffentliche Veranstaltungen betreffen?";
            break;
        case "Kultur":
            categoryText = "Gibt es Ideen für Verstaltungen, Kunstinstallationen, Theater oder Literatur?";
            break;
        case "Bildung":
            categoryText = "Welche Dinge im Bereich der Bildungen, Schulen und Hochschulen können wir als Gemeinde verbessern?";
            break;
        case "Gesundheit":
            categoryText = "Ideen zum Thema Gesundheit?";
            break;
        case "Sport":
            categoryText = "Ideen zu Sportveranstaltungen, Sportplätzen oder städitschen Kursen?";
            break;
        case "Andere":
            categoryText = "Haben Sie einen eigenen Vorschlag, der in keine der genannten Kategorien passt? Teilen Sie Ihre Idee uns mit!";
            break;
        default:
            categoryText = "";
            break;
    }

    categoryDescription.textContent = categoryText;
    categoryDescription.style.color = "#003056" // Set the text color to #003056
}

// Initialize the category text when the page loads
window.addEventListener("load", updateCategoryText);

// Listen for changes in the category selection
const categorySelect = document.getElementById("category");
categorySelect.addEventListener("change", updateCategoryText);


function updateQuillCharCountFeedback(editor, feedbackElement, minLimit, maxLimit) {
    var text = editor.getText().trim();
    var charCount = text.length;
    var charRemaining = maxLimit - charCount;

    if (charCount < minLimit) {
        feedbackElement.textContent = `Sie müssen noch ${minLimit - charCount} Zeichen eingeben.`;
        feedbackElement.style.color = '#003056';
    } else if (charCount <= maxLimit) {
        feedbackElement.textContent = `Sie können noch ${charRemaining} Zeichen eingeben.`;
        feedbackElement.style.color = '#003056';
    } else {
        // Truncate the text to the maximum limit
        editor.setText(text.substring(0, maxLimit));
        feedbackElement.textContent = "Zeichenlimit erreicht.";
        feedbackElement.style.color = '#003056';
    }
}

// Function for updating character count on input field
function updateInputCharCountFeedback(inputElement, feedbackElement, minLimit, maxLimit) {
    var charCount = inputElement.value.length;
    var charRemaining = maxLimit - charCount;

    if (charCount < minLimit) {
        feedbackElement.textContent = `Sie müssen noch ${minLimit - charCount} Zeichen eingeben.`;
    } else if (charCount <= maxLimit) {
        feedbackElement.textContent = `Sie können noch ${charRemaining} Zeichen eingeben.`;
    } else {
        feedbackElement.textContent = "Zeichenlimit erreicht.";
        inputElement.value = inputElement.value.substring(0, maxLimit); // Truncate to maxLimit
    }
    feedbackElement.style.color = '#003056';
}

// Custom toolbar options with limited features
var toolbarOptions = [
    [{
        'header': '2'
    }], // Heading settings (h1, h2)
    ['bold', 'underline'], // Bold, underline
    [{
        'list': 'ordered'
    }, {
        'list': 'bullet'
    }], // Number points, bullet points
    ['clean'] // Style removal
];

// Initialize Quill editor for 'descriptionwhy' with limited toolbar
var descriptionEditor = new Quill('#description-editor', {
    theme: 'snow',
    modules: {
        toolbar: toolbarOptions
    }
});
var descriptionFeedback = document.createElement('div');
descriptionFeedback.id = 'descriptionFeedback';
document.getElementById('description-editor').parentNode.insertBefore(descriptionFeedback, document.getElementById('description-editor').nextSibling);

// Initialize Quill editor for 'public_benefit' with limited toolbar
var benefitEditor = new Quill('#benefit-editor', {
    theme: 'snow',
    modules: {
        toolbar: toolbarOptions
    }
});
var benefitFeedback = document.createElement('div');
benefitFeedback.id = 'benefitFeedback';
document.getElementById('benefit-editor').parentNode.insertBefore(benefitFeedback, document.getElementById('benefit-editor').nextSibling);


// Call updateQuillCharCountFeedback immediately for both editors
updateQuillCharCountFeedback(descriptionEditor, descriptionFeedback, 20, 5000);
updateQuillCharCountFeedback(benefitEditor, benefitFeedback, 20, 5000);

// Event listener for Quill editors
descriptionEditor.on('text-change', function() {
    updateQuillCharCountFeedback(descriptionEditor, descriptionFeedback, 20, 5000);
});

benefitEditor.on('text-change', function() {
    updateQuillCharCountFeedback(benefitEditor, benefitFeedback, 20, 5000);
});

// Character count for the input field
var titleInput = document.getElementById('title');
var titleFeedback = document.createElement('div');
titleFeedback.id = 'titleFeedback';
titleInput.parentNode.insertBefore(titleFeedback, titleInput.nextSibling);

titleInput.addEventListener('input', function() {
    updateInputCharCountFeedback(titleInput, titleFeedback, 20, 100);
});
updateInputCharCountFeedback(titleInput, titleFeedback, 20, 100); // Initial update

// Function to copy Quill content to textarea on form submission
document.querySelector('form').addEventListener('submit', function(event) {
    // Get HTML content from Quill editors
    var descriptionContent = descriptionEditor.root.innerHTML;
    var benefitContent = benefitEditor.root.innerHTML;

    // Set content to hidden textareas
    document.getElementById('descriptionwhy').value = descriptionContent;
    document.getElementById('public_benefit').value = benefitContent;
});




// Function to check if the editor content is effectively empty
function isEditorContentEmpty(editor) {
    return editor.getText().trim().length === 0;
}

// Listen for form submission
document.querySelector('form').addEventListener('submit', function(event) {
    // Get HTML content from Quill editor
    var descriptionContent = descriptionEditor.root.innerHTML;
    var benefitContent = benefitEditor.root.innerHTML;

    // Check if editors are effectively empty
    if (isEditorContentEmpty(descriptionEditor)) {
        alert('Please fill in the description.');
        event.preventDefault(); // Prevent form submission
        return false;
    }

    if (isEditorContentEmpty(benefitEditor)) {
        alert('Please fill in the public benefit.');
        event.preventDefault(); // Prevent form submission
        return false;
    }

    // Set the content to the hidden textareas
    document.querySelector('textarea[name="descriptionwhy"]').value = descriptionContent;
    document.querySelector('textarea[name="public_benefit"]').value = benefitContent;
});
// JavaScript function to handle redirection to Stimmungskarte
function redirectToStimmungskarte() {
    window.location.href = 'https://stimmungskartendemo.ermine.at';
}

// JavaScript function to handle redirection to Suggest an Idea
function redirectToNeuerbeitrag() {
    window.location.href = '/neuerbeitrag';
}

// JavaScript function to handle redirection to List of Current Suggestions
function redirectToneuerbeitrag() {
    window.location.href = '/neuerbeitrag';
}
// Show an alert if a success message is present
document.addEventListener("DOMContentLoaded", function(event) {
    {% with messages = get_flashed_messages(category_filter=["success"]) %}
        {% if messages %}
            alert("{{ messages[0] }}");
        {% endif %}
    {% endwith %}
});
// Check submission limit on page load
window.onload = function() {
    console.log("Checking project submission limit...");
    fetch('/check_project_limit?_=' + new Date().getTime())
        .then(response => response.json())
        .then(data => {
            console.log("Received data from /check_project_limit:", data);
            var publishButton = document.querySelector('.publish-button');

            if (data.limit_reached) {
                console.log("Submission limit reached. Limit expires at:", data.reset_time);
                // updateButtonState(publishButton, `Limit erreicht, läuft um ${data.reset_time} ab`, true);
                startTimer(data.reset_time, publishButton);
            } else {
                console.log("Submission limit not reached.");
                updateButtonState(publishButton, "Veröffentlichen", false);
            }
        })
        .catch(error => {
            console.error('Error checking submission limit:', error);
            var publishButton = document.querySelector('.publish-button');
            updateButtonState(publishButton, "Veröffentlichen", false); // Default state if error occurs
        });
};


function updateButtonState(button, text, disabled) {
    button.innerText = text;
    button.disabled = disabled;
    if (disabled) {
        button.classList.add('disabled-button'); // Style the disabled button
    } else {
        button.classList.remove('disabled-button'); // Remove the style if enabled
    }
}

// Function to start a countdown timer
function startTimer(expiryTime, publishButton) {
    var countDownDate = new Date(expiryTime).getTime();

    var x = setInterval(function() {
        var now = new Date().getTime();
        var distance = countDownDate - now;
        var hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        var minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        var seconds = Math.floor((distance % (1000 * 60)) / 1000);

        publishButton.innerText = `Limit erreicht, läuft in ${hours}h ${minutes}m ${seconds}s ab`;

        if (distance < 0) {
            clearInterval(x);
            updateButtonState(publishButton, "Veröffentlichen", false);
        }
    }, 1000);
}
document.getElementById('info-link').addEventListener('click', function(e) {
    e.preventDefault(); // Prevent default link behavior
    openVideoOverlay();
});

function openVideoOverlay() {
    var iframe = document.getElementById('youtube-iframe');
    var videoSrc;

    // Check screen width and set the video source accordingly
    if (window.innerWidth > 1080) {
        // Desktop video
        videoSrc = 'https://www.youtube.com/embed/N2u47YzgFv4?autoplay=1&mute=1&enablejsapi=1';
    } else {
        // Mobile video
        videoSrc = 'https://www.youtube.com/embed/gHzh1hiZY4Y?autoplay=1&mute=1&enablejsapi=1';
    }

    iframe.src = videoSrc;
    document.getElementById('video-overlay').style.display = 'flex';
    console.log('Video overlay opened');
}

function closeVideoOverlay() {
    var iframe = document.getElementById('youtube-iframe');
    iframe.src = ''; // Clear the iframe src
    document.getElementById('video-overlay').style.display = 'none';
    console.log('Video overlay closed');
}

// Prevent closing when clicking on the video (event propagation)
document.getElementById('youtube-iframe').addEventListener('click', function(event) {
    event.stopPropagation();
    console.log('Clicked on the video, overlay remains open');
});

// Initialize YouTube API
var tag = document.createElement('script');
tag.src = "https://www.youtube.com/iframe_api";
var firstScriptTag = document.getElementsByTagName('script')[0];
firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

var player;

function onYouTubeIframeAPIReady() {
    player = new YT.Player('youtube-iframe', {
        videoId: 'aV6s-reibEc', // Ensure the video ID is set
        events: {
            'onStateChange': onPlayerStateChange
        }
    });
}

function onPlayerStateChange(event) {
    if (event.data === YT.PlayerState.ENDED) {
        console.log('Video ended');
        showReplayImage();
    }
}

function showReplayImage() {
    // Hide the YouTube iframe
    var iframe = document.getElementById('youtube-iframe');
    iframe.style.display = 'none';

    // Display the replay container
    var replayContainer = document.getElementById('replay-container');
    replayContainer.style.display = 'flex';

    var replayImg = document.createElement('img');
    replayImg.id = 'replay-image';
    replayImg.src = '{{ url_for("static", filename="replay.png") }}';
    replayImg.addEventListener('click', replayVideo);

    replayContainer.innerHTML = ''; // Clear any existing content
    replayContainer.appendChild(replayImg); // Add the replay image to the container
}


function replayVideo() {
    console.log('Replay clicked');
    var replayContainer = document.getElementById('replay-container');
    replayContainer.style.display = 'none'; // Hide the replay container

    var iframe = document.getElementById('youtube-iframe');
    iframe.style.display = 'block';
    player.seekTo(0); // Seek to the beginning of the video
    player.playVideo(); // Play the video
}


document.addEventListener('DOMContentLoaded', function() {
    // Check for a project ID in the query string
    const urlParams = new URLSearchParams(window.location.search);
    const projectID = urlParams.get('project_id');

    if (projectID) {
        console.log(`Project_details.html: Project ID ${projectID} loaded, when the object is updated, the user will be redirected to project_details/${projectID}.`);
        setupEditingMode(projectID);


        // Fetch the project data from the server
        fetch(`/get_project_data/${projectID}`)
            .then(response => {
                if (response.ok) {
                    return response.json();
                } else if (response.status === 403) {
                    alert("You do not have permission to edit this project.");
                    window.location.href = '/';
                } else {
                    throw new Error('Failed to fetch project data.');
                }
            })
            .then(projectData => {
                if (projectData.is_global) {
                    console.log(`Project_details.html: Project ${projectID} has is_global=true. If you select a point on the map, it will be overwritten to is_global=false when submitted.`);
                }
                // Fill in the form fields
                document.getElementById('title').value = projectData.name;
                document.getElementById('category').value = projectData.category;

                // Fill the Quill editors with the project data
                descriptionEditor.clipboard.dangerouslyPasteHTML(projectData.descriptionwhy);
                benefitEditor.clipboard.dangerouslyPasteHTML(projectData.public_benefit);

                // Fetch and display the project's image
                if (projectData.image_file) {
                    var img = new Image();
                    img.onload = function() {
                        var imagePreviewContainer = document.getElementById('image-preview-container');
                        imagePreviewContainer.innerHTML = '';
                        imagePreviewContainer.appendChild(img);
                        if (cropper) {
                            cropper.replace(img.src);
                        } else {
                            cropper = new Cropper(img, {
                                aspectRatio: 4 / 3,
                                viewMode: 1,
                                zoomable: false
                            });
                        }
                    };
                    img.src = `/static/usersubmissions/${projectData.image_file}`;
                    img.id = 'image-preview';
                    img.style.display = 'block';
                }

                // Load and set marker position on the map
                if (projectData.geoloc) {
                    const [lat, lng] = projectData.geoloc.split(",");
                    const position = L.latLng(lat, lng);
                    map.setView(position, 15);
                    if (marker) {
                        marker.setLatLng(position);
                    } else {
                        marker = L.marker(position, {
                            icon: icon
                        }).addTo(map);
                    }
                }
            })
            .catch(error => console.error('Error fetching project data:', error));
    }
});

function setupEditingMode(projectID) {
    // Hide the 'Veröffentlichen' button and show 'Projekt aktualisieren' button
    const publishButton = document.querySelector('.publish-button');
    publishButton.style.display = 'none';

    const updateButton = document.createElement('button');
    updateButton.type = 'submit';
    updateButton.classList.add('button', 'publish-button');
    updateButton.textContent = 'Projekt aktualisieren';
    publishButton.parentNode.appendChild(updateButton);

    updateButton.addEventListener('click', function(event) {
        event.preventDefault(); // Prevent default form submission
        handleUpdateProject(projectID);
    });
}

function handleUpdateProject(projectID) {
    console.log(`Project_details.html: Editing project ${projectID}`);
    // Get HTML content from Quill editors
    var descriptionContent = descriptionEditor.root.innerHTML;
    var benefitContent = benefitEditor.root.innerHTML;

    // Set content to hidden textareas
    document.getElementById('descriptionwhy').value = descriptionContent;
    document.getElementById('public_benefit').value = benefitContent;

    // Create new FormData object
    const formData = new FormData(document.querySelector('form'));

    // Check and add the current geolocation to the formData
    if (marker) {
        const currentGeoloc = `${marker.getLatLng().lat},${marker.getLatLng().lng}`;
        formData.set('geoloc', currentGeoloc);
        console.log(`Project_details.html: Geoloc ${currentGeoloc} loaded. If the geoloc is not updated, it will be saved when the contents are updated.`);
    } else {
        console.log(`Project_details.html: Project ${projectID} loaded with is_global=true. Geoloc has not been selected. is_global=true will be maintained.`);
    }


    // Handle image cropping and update
    if (cropper) {
        cropper.getCroppedCanvas().toBlob(function(blob) {
            // Fallback file name
            var fallbackFileName = `cropped-${new Date().getTime()}.jpg`;

            // Try to extract the original file name
            var imgElement = document.getElementById('image-preview');
            var originalFileName = fallbackFileName; // Use fallback as default

            if (imgElement && imgElement.src) {
                var imageSrc = imgElement.src;
                var fileNameParts = imageSrc.split('/').pop().split('#')[0].split('?')[0];
                if (fileNameParts) {
                    originalFileName = fileNameParts;
                }
            }

            console.log(`File ${originalFileName} loaded into the cropper.`);

            formData.set('image_file', blob, originalFileName);

            var dimensions = `${cropper.getCroppedCanvas().width} x ${cropper.getCroppedCanvas().height}`;
            var sizeMB = (blob.size / (1024 * 1024)).toFixed(2);
            console.log(`File ${originalFileName} overwritten, new file size is ${dimensions} px, ${sizeMB} MB.`);

            sendUpdateRequest(projectID, formData);
        }, 'image/jpeg');
    } else {
        sendUpdateRequest(projectID, formData);
    }
}

function sendUpdateRequest(projectID, formData) {
    fetch(`/update_project_data/${projectID}`, {
            method: 'POST',
            body: formData
        })
        .then(response => {
            if (response.ok) {
                console.log(`Project ${projectID} updated successfully.`);
                console.log(`Project_details.html: Updating database of project ${projectID}, geoloc ${formData.get('geoloc')} has been kept`);
                window.location.href = `/project_details/${projectID}`; // Redirect to the project details page
            } else {
                throw new Error('Failed to update project.');
            }
        })
        .catch(error => {
            console.error(`Error updating project ${projectID}:`, error);
        });
}

document.addEventListener('DOMContentLoaded', function() {
    const urlParams = new URLSearchParams(window.location.search);
    const projectID = urlParams.get('project_id');

    if (projectID) {
        console.log("Project_details.html: Entered editing mode, replacing the page title.");
        fetch(`/get_project_data/${projectID}`)
            .then(response => response.json())
            .then(data => {
                document.getElementById('page-title').textContent = 'Sie bearbeiten das Projekt: ' + data.name;

                // Initialize isGlobal variable based on fetched data
                let isGlobal = data.is_global === true || data.is_global === 'true';

                if (isGlobal) {
                    console.log(`Project_details.html: Project ${projectID} has is_global=true.`);
                }

                // Handle "no-location-btn" button click
                const noLocationBtn = document.getElementById('no-location-btn');
                noLocationBtn.addEventListener('click', function() {
                    if (isGlobal) {
                        isGlobal = true; // Change is_global to false
                        console.log(`Project_details.html: is_global for project ${projectID} set to true after 'no-location-btn' clicked.`);
                    }
                });
            })
            .catch(error => console.error('Error fetching project data:', error));
    }
});