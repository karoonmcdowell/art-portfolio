const USE_MOCK_DATA = true;
function renderSidebar() {
    return `<aside class="sidebar"><h2>Art Portfolio</h2></aside>`;
}
let artPieces = [];
const colorPalettes = [
    ["#FFB347", "#4682B4", "#FFD700", "#5F9EA0"],
    ["#E57373", "#81C784", "#64B5F6", "#FFD54F"],
    ["#A569BD", "#F7CA18", "#229954", "#F1948A"],
    ["#34495E", "#F1C40F", "#E67E22", "#1ABC9C"]
];

async function loadArtPieces() {
	try {
		const res = await fetch('artpieces.json');
		if (!res.ok) throw new Error('No artpieces.json');
		let realArt = (await res.json()).filter(piece => {
			if (!piece.title || /FOLDER_TEMPLATE/i.test(piece.title) || /FOLDER_TEMPLATE/i.test(piece.id)) return false;
			if (!piece.images || !piece.images[0]) return false;
			return true;
		});
		if (!Array.isArray(realArt)) throw new Error('Invalid artpieces.json');
		let mockups = [];
		if (USE_MOCK_DATA) {
			for (let i = 0; i < 12; i++) {
				const palette = colorPalettes[i % colorPalettes.length];
				mockups.push({
					id: 'mock-' + (i+1),
					title: `Mock Art #${i+1}`,
					images: [
						`https://placehold.co/300x200/${palette[0].replace('#','')}/fff?text=Art+${i+1}`
					],
					colors: palette,
					shape: ['square','vertical','wide','circle'][i%4],
					width: 160 + (i%3)*40,
					height: 120 + (i%2)*40,
					sold: Math.random() < 0.2
				});
			}
		}
		artPieces = [...realArt, ...mockups];
	} catch (e) {
		if (USE_MOCK_DATA) {
			artPieces = [];
			for (let i = 0; i < 12; i++) {
				const palette = colorPalettes[i % colorPalettes.length];
				artPieces.push({
					id: 'mock-' + (i+1),
					title: `Mock Art #${i+1}`,
					images: [
						`https://placehold.co/300x200/${palette[0].replace('#','')}/fff?text=Art+${i+1}`
					],
					colors: palette,
					shape: ['square','vertical','wide','circle'][i%4],
					width: 160 + (i%3)*40,
					height: 120 + (i%2)*40,
					sold: Math.random() < 0.2
				});
			}
		} else {
			artPieces = [];
		}
	}
}
function renderGallery(pieces) {
	setTimeout(() => {
		document.querySelectorAll('.art-tile').forEach(card => {
			card.addEventListener('click', e => {
				const id = card.getAttribute('data-id');
				window.location.hash = `art/${id}`;
			});
		});
	}, 0);
	return `
		<main class="gallery-masonry">
			${pieces.map(piece => {
				return `
				<div class="art-tile" data-id="${piece.id}" style="width:180px;height:180px;">
					<div class="art-tile-img">
						<img src='${piece.images && piece.images[0] ? piece.images[0] : ''}' alt='${piece.title}' draggable="false" />
					</div>
					<div class="art-tile-label">${piece.title}</div>
				</div>
				`;
			}).join('')}
		</main>
	`;
}
function renderHomePage() {
	document.getElementById('app').innerHTML = `
		<div class="container">
			${renderSidebar()}
			${renderGallery(artPieces)}
		</div>
	`;
}
function handleRouting() {
	const hash = window.location.hash;
	if (hash.startsWith('#art/')) {
		const id = hash.replace('#art/', '');
		const piece = artPieces.find(p => p.id == id);
		renderArtpiecePage(piece);
	} else {
		renderHomePage();
	}
}
window.addEventListener('hashchange', handleRouting);

// Initial render: load art pieces first, then render
loadArtPieces().then(() => {
	handleRouting();
});


function enableGalleryDragScroll() {
	const container = document.querySelector('.gallery-masonry');
	if (!container) return;
	window.enableUnifiedDragScroll(container, { horizontal: true, scale: 1.7 });
}


// Call loadArtPieces() on startup and re-render gallery when loaded




// Drag-scroll logic now handled by dragScroll.js

// Simple bin-packing for edge-to-edge layout
function packMasonryTiles() {
	const container = document.querySelector('.gallery-masonry');
	if (!container) return;
	const tiles = Array.from(container.children);
	// Clear previous positions
	tiles.forEach(tile => { tile.style.left = ''; tile.style.top = ''; });
	// Packing algorithm
	const margin = 0;
	const containerWidth = container.clientWidth;
	let positions = [];
	let maxY = 0;
	tiles.forEach((tile, i) => {
		const w = tile.offsetWidth;
		const h = tile.offsetHeight;
		let placed = false;
		let x = 0, y = 0;
		// Try to fit in every possible spot
		while (!placed) {
			let collision = false;
			for (let pos of positions) {
				if (
					x < pos.x + pos.w &&
					x + w > pos.x &&
					y < pos.y + pos.h &&
					y + h > pos.y
				) {
					collision = true;
					break;
				}
			}
			if (!collision && x + w <= containerWidth) {
				placed = true;
				break;
			}
			x += 1;
			if (x + w > containerWidth) {
				x = 0;
				y += 1;
			}
		}
		tile.style.left = x + 'px';
		tile.style.top = y + 'px';
		positions.push({x, y, w, h});
		if (y + h > maxY) maxY = y + h;
	});

	// Add hover logic to shift neighbors
	tiles.forEach((tile, i) => {
		tile.onmouseenter = () => {
			tiles.forEach((other, j) => {
				if (other === tile) {
					// Grow hovered tile
					other.style.transform = 'scale(1.22) rotate(-1.5deg)';
					other.style.zIndex = 20;
				} else {
					// Calculate distance from hovered tile
					const dx = Math.abs(j - i);
					if (dx === 1) {
						// Immediate neighbor: shift away
						other.style.transform = `translateX(${j < i ? '-30px' : '30px'})`;
						other.style.zIndex = 10;
					} else if (dx === 2) {
						// Next neighbor: slight shift
						other.style.transform = `translateX(${j < i ? '-10px' : '10px'})`;
						other.style.zIndex = 5;
					} else {
						other.style.transform = '';
						other.style.zIndex = '';
					}
				}
			});
		};
		tile.onmouseleave = () => {
			tiles.forEach(other => {
				other.style.transform = '';
				other.style.zIndex = '';
			});
		};
	});
	container.style.height = maxY + 'px';
}

function renderArtpiecePage(piece) {
	if (!piece) {
		document.getElementById('app').innerHTML = '<div style="padding:2rem">Artwork not found. <a href="#">Back to gallery</a></div>';
		document.querySelector('a').addEventListener('click', e => {
			e.preventDefault();
			navigateToGallery();
		});
		return;
	}

	function renderDetail() {
			// Center primary image (first) among 5 images (always 5, even if images array exists)
			let images = [...piece.images];
			if (images.length < 5) {
				const palette = piece.colors || colorPalettes[0];
				images = [0,1,2,3,4].map(j => `https://placehold.co/300x200/${palette[j%palette.length].replace('#','')}/fff?text=Mock+${encodeURIComponent(piece.title.replace(/\s/g,' '))}+${j+1}`);
			} else {
				const primary = images.shift();
				images.splice(2, 0, primary);
			}
		let selectedIdx = 2;
		document.getElementById('app').innerHTML = `
			<div class="container">
				<aside class="sidebar">
					<button id="back-to-gallery">← Back to Gallery</button>
				</aside>
				<main class="artpiece-detail">
					<h2>${piece.title}</h2>
					<div class="artpiece-masonry">
						<div class="edge-fade left"></div>
						<div class="edge-fade right"></div>
						${images.map((img, idx) => `<img class="artpiece-img${idx===selectedIdx?' selected':''}" src="${img}" alt="${piece.title} photo ${idx+1}" data-idx="${idx}">`).join('')}
					</div>
					<div class="art-meta">
						<span><b>Shape:</b> ${piece.shape}</span>
						${piece.sold ? '<span class="sold">Sold</span>' : ''}
					</div>
				</main>
			</div>
		`;
		// ...no click-to-select logic needed for hover effect...
		enableArtpieceMasonryDragScroll();
		document.getElementById('back-to-gallery').addEventListener('click', function(e) {
			e.preventDefault();
			window.location.hash = '';
		});
	}
	renderDetail();
}

// Masonry drag-scroll for artpiece images, allowing overlap

function enableArtpieceMasonryDragScroll() {
	const container = document.querySelector('.artpiece-masonry');
	if (!container) return;
	window.enableUnifiedDragScroll(container, { horizontal: true, scale: 1 });
}

// Carousel drag-scroll physics for artpiece page
function enableCarouselDragScroll() {
	const track = document.querySelector('.carousel-track');
	if (!track) return;
	let isDown = false, startX = 0, lastX = 0, velocityX = 0, momentumId = null;
	let offsetX = 0;
	function setTransform() {
		track.style.transform = `translateX(${offsetX}px)`;
	}
	setTransform();
	function onDown(e) {
		isDown = true;
		startX = (e.touches ? e.touches[0].clientX : e.clientX);
		lastX = startX;
		velocityX = 0;
		if (momentumId) cancelAnimationFrame(momentumId);
	}
	function onMove(e) {
		if (!isDown) return;
		const x = (e.touches ? e.touches[0].clientX : e.clientX);
		const dx = x - lastX;
		offsetX += dx;
		setTransform();
		velocityX = dx;
		lastX = x;
	}
	function onUp() {
		isDown = false;
		// Inertia
		let vx = velocityX * 0.7;
		function momentum() {
			offsetX += vx;
			setTransform();
			vx *= 0.92;
			// Bounds: don't scroll too far
			const minX = -track.scrollWidth + window.innerWidth * 0.7;
			const maxX = 60;
			if (offsetX < minX) vx += (minX - offsetX) * 0.08;
			if (offsetX > maxX) vx += (maxX - offsetX) * 0.08;
			if (Math.abs(vx) > 0.5 || offsetX < minX - 1 || offsetX > maxX + 1) {
				momentumId = requestAnimationFrame(momentum);
			} else {
				offsetX = Math.max(Math.min(offsetX, maxX), minX);
				setTransform();
			}
		}
		momentum();
	}
	track.addEventListener('mousedown', onDown);
	track.addEventListener('touchstart', onDown, {passive: false});
	window.addEventListener('mousemove', onMove);
	window.addEventListener('touchmove', onMove, {passive: false});
	window.addEventListener('mouseup', onUp);
	window.addEventListener('touchend', onUp);
}

function navigateToGallery() {
	window.location.hash = '';
	renderHomePage();
}

function navigateToArtpiece(id) {
	window.location.hash = `art/${id}`;
	const piece = artPieces.find(p => p.id == id);
	renderArtpiecePage(piece);
}

function filterArt(pieces) {
	// Filter logic removed for minimal version
	return pieces; // Return all pieces without filtering
}

function renderHomePage() {
	document.getElementById('app').innerHTML = `
		<div class="container">
			${renderSidebar()}
			${renderGallery(artPieces)}
		</div>
	`;
	// No filter or keyboard nav logic in minimal version
}

// Simple hash-based routing
function handleRouting() {
	const hash = window.location.hash;
	if (hash.startsWith('#art/')) {
		const id = hash.replace('#art/', '');
		navigateToArtpiece(id);
	} else {
		renderHomePage();
	}
}


window.addEventListener('hashchange', handleRouting);

// Initial render: load art pieces first, then render
loadArtPieces().then(() => {
	handleRouting();
});

function renderGallery(pieces) {
	// Only show grid, no in-place selection
	setTimeout(() => {
		packMasonryTiles();
		enableGalleryDragScroll();
		// Add click handler to navigate to artpiece page
		document.querySelectorAll('.art-tile').forEach(card => {
			card.addEventListener('click', e => {
				const id = card.getAttribute('data-id');
				navigateToArtpiece(id);
			});
		});
	}, 0);
	return `
		<main class="gallery-masonry">
			<div class="edge-fade left"></div>
			<div class="edge-fade right"></div>
			${pieces.map(piece => {
				const palette = piece.colors || colorPalettes[0];
				const width = piece.width || 120;
				const height = piece.height || 120;
				return `
				<div class="art-tile" data-id="${piece.id}"
					style="width:${width}px;height:${height}px;">
					<div class="art-tile-img" tabindex="0" aria-label="${piece.title}, ${piece.shape || ''}, ${palette[0]}">
						<img src='${piece.images && piece.images[0] ? piece.images[0] : ''}' alt='${piece.title}' draggable="false" />
					</div>
					<div class="art-tile-label">${piece.title}</div>
					${piece.sold ? '<span class="sold">Sold</span>' : ''}
				</div>
				`;
			}).join('')}
		</main>
	`;
}

// Generate filler description for artwork
function generateArtDescription(piece) {
    return `A beautiful piece titled "${piece.title}". Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vivamus lacinia odio vitae vestibulum.`;
}
