function openModal(projectId) {
    // AJAX request to get project details
    fetch(`/project/${projectId}`)
        .then(response => response.text())
        .then(html => {
            document.getElementById('modalBody').innerHTML = html;
            document.getElementById('projectModal').style.display = 'block';
        });
}

function closeModal() {
    document.getElementById('projectModal').style.display = 'none';
}

// Close modal when clicking outside of it
window.onclick = function(event) {
    const modal = document.getElementById('projectModal');
    if (event.target === modal) {
        closeModal();
    }
}
document.getElementById('hamburger-button').addEventListener('click', function() {
    var navOverlay = document.getElementById('nav-overlay');
    navOverlay.style.display = navOverlay.style.display === 'block' ? 'none' : 'block';
});

document.getElementById('hamburger-button-filter').addEventListener('click', function() {
    var filterOverlay = document.getElementById('filter-overlay');
    filterOverlay.style.display = filterOverlay.style.display === 'flex' ? 'none' : 'flex';
});

document.getElementById('filter-overlay').addEventListener('click', function(event) {
    var filterForm = document.getElementById('filter-form-mobile');
    if (!filterForm.contains(event.target)) {
        this.style.display = 'none';
    }
});

document.getElementById('filter-form-mobile').addEventListener('click', function(event) {
    event.stopPropagation();
});

document.addEventListener('click', function(event) {
    var navOverlay = document.getElementById('nav-overlay');
    var navLinks = document.getElementById('nav-links');
    var hamburgerButton = document.getElementById('hamburger-button');

    if (window.innerWidth <= 1080) {
        if (navOverlay.style.display === 'block' && !navOverlay.contains(event.target) && !hamburgerButton.contains(event.target)) {
            navOverlay.style.display = 'none';
            //console.log('nav-overlay area outside the buttons clicked, overlay closing');
        } else if (navLinks.contains(event.target)) {
            navOverlay.style.display = 'none';
            //console.log('nav-links area clicked, overlay closing');
        }
    }
});

document.addEventListener("DOMContentLoaded", function() {
    const urlParams = new URLSearchParams(window.location.search);
    const projectID = urlParams.get('projectID');
    if (projectID) {
        showOverlayForProjectID(projectID);
    }

    document.getElementById('overlay').addEventListener('click', function(event) {
        if (event.target === this) {
            closeOverlay();
            history.pushState(null, '', '/list');
        }
    });

    document.getElementById('filter-form-mobile').addEventListener('keypress', function(event) {
        if (event.keyCode === 13) { // Enter key
            event.preventDefault();
        }
    });
});

function showOverlayForProjectID(projectID) {
    fetch('/api/project/' + projectID)
        .then(response => response.json())
        .then(data => {
            document.getElementById('overlay-title').textContent = data.title;
            document.getElementById('overlay-description').textContent = data.description;
            document.getElementById('overlay').style.display = 'flex';
        });
}

function closeOverlay() {
    document.getElementById('overlay').style.display = 'none';
}
function openProjectDetails(projectId) {
    window.location.href = '/project_details/' + projectId;
}

document.addEventListener("DOMContentLoaded", function() {
    document.querySelectorAll('.project-thumbnail').forEach(item => {
        item.addEventListener('click', function() {
            const projectId = this.getAttribute('data-project-id');
            openProjectDetails(projectId);
        });
    });

    // Delayed search functionality for the filter form
   // document.getElementById('search').addEventListener('input', function() {
     //   clearTimeout(window.searchTimer);
       // window.searchTimer = setTimeout(function() {
         //   document.getElementById('filter-form').submit();
        // }, 500); // Adjust delay as needed
    // });

    // Event listener for filter form changes
    document.getElementById('filter-form').addEventListener('change', function() {
        this.submit();
    });

    // Redirect functions
    function redirectToStimmungskarte() {
        window.location.href = 'https://stimmungskartendemo.ermine.at';
    }

    function redirectToNeuerbeitrag() {
        window.location.href = '/neuerbeitrag';
    }

    function redirectToneuerbeitrag() {
        window.location.href = '/neuerbeitrag';
    }

    // Display success message alert, if any
    {% with messages = get_flashed_messages(category_filter=["success"]) %}
        {% if messages %}
            alert("{{ messages[0] }}");
        {% endif %}
    {% endwith %}
});

document.getElementById('info-link').addEventListener('click', function(e) {
    e.preventDefault(); // Prevent default link behavior
    openVideoOverlay();
});

document.querySelector('.info-link').addEventListener('click', function(e) {
    e.preventDefault();
    openVideoOverlay();
});

function openVideoOverlay() {
    var iframe = document.getElementById('youtube-iframe');
    var videoSrc;

    // Check screen width and set the video source accordingly
    if (window.innerWidth > 1080) {
        // Desktop video
        videoSrc = 'https://www.youtube.com/embed/kMLiCkfo10E?autoplay=1&mute=1&enablejsapi=1';
    } else {
        // Mobile video
        videoSrc = 'https://www.youtube.com/embed/bJPDBCH1KQE?autoplay=1&mute=1&enablejsapi=1';
    }

    iframe.src = videoSrc;
    document.getElementById('video-overlay').style.display = 'flex';
    //console.log('Video overlay opened');
}

function closeVideoOverlay() {
    var iframe = document.getElementById('youtube-iframe');
    iframe.src = ''; // Clear the iframe src
    document.getElementById('video-overlay').style.display = 'none';
    //console.log('Video overlay closed');
}



// Add an event listener to the video-overlay
document.getElementById('video-overlay').addEventListener('click', function(event) {
    // Check if the clicked element is not the video itself
    if (!event.target.closest('#youtube-iframe, #replay-image')) {
        closeVideoOverlay();
        //console.log('Clicked outside the video, overlay closed');
    }
});

// Prevent closing when clicking on the video (event propagation)
document.getElementById('youtube-iframe').addEventListener('click', function(event) {
    event.stopPropagation();
    //console.log('Clicked on the video, overlay remains open');
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
        //console.log('Video ended');
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
    //console.log('Replay clicked');
    var replayContainer = document.getElementById('replay-container');
    replayContainer.style.display = 'none'; // Hide the replay container

    var iframe = document.getElementById('youtube-iframe');
    iframe.style.display = 'block';
    player.seekTo(0); // Seek to the beginning of the video
    player.playVideo(); // Play the video
}


document.addEventListener("DOMContentLoaded", function() {
    document.querySelectorAll('.project-thumbnail').forEach(projectThumbnail => {
        const upvotesElement = projectThumbnail.querySelector('.upvotes');
        const downvotesElement = projectThumbnail.querySelector('.downvotes');

        let upvotes = 0, downvotes = 0;

        if (upvotesElement) {
            upvotes = parseInt(upvotesElement.textContent.match(/\d+/) ? upvotesElement.textContent.match(/\d+/)[0] : "0");
        }

        if (downvotesElement) {
            downvotes = parseInt(downvotesElement.textContent.match(/\d+/) ? downvotesElement.textContent.match(/\d+/)[0] : "0");
        }

        // Log the project details and adjust border-radius
        if (upvotes > 0 && downvotes > 0) {
            //console.log(`Project loaded with ${upvotes} upvotes and ${downvotes} downvotes. Adjusting border-radius.`);
            if (upvotesElement) upvotesElement.style.borderRadius = '30px 0 0 30px';
            if (downvotesElement) downvotesElement.style.borderRadius = '0 30px 30px 0';
        } else if (upvotes > 0 && downvotes === 0) {
            //console.log(`Project loaded with ${upvotes} upvotes and 0 downvotes. Adjusting border-radius for upvotes.`);
            if (upvotesElement) upvotesElement.style.borderRadius = '30px';
        } else if (downvotes > 0 && upvotes === 0) {
            //console.log(`Project loaded with ${downvotes} downvotes and 0 upvotes. Adjusting border-radius for downvotes.`);
            if (downvotesElement) downvotesElement.style.borderRadius = '30px';
        } else {
            //console.log(`Project loaded with 0 upvotes and 0 downvotes. Setting border-radius to 30px on both sides.`);
            if (upvotesElement) upvotesElement.style.borderRadius = '30px';
            if (downvotesElement) downvotesElement.style.borderRadius = '30px';
        }
    });
});

