(function () {
	'use strict';

	var STORAGE_KEY = 'permitEmployeeProfiles';
	var DEFAULT_PHOTO = 'Image1.jpg';
	var currentPhoto = DEFAULT_PHOTO;

	var form             = document.getElementById('profileForm');
	var list             = document.getElementById('profileList');
	var searchInput      = document.getElementById('profileSearch');
	var statusNode       = document.getElementById('formStatus');
	var photoInput       = document.getElementById('photo');
	var photoPreview     = document.getElementById('photoPreview');
	var editingPermit    = document.getElementById('editingPermitNumber');

	// ─── Utilitaires ───────────────────────────────────────────────────────────

	function normalize(value) {
		return String(value || '')
			.toLowerCase()
			.normalize('NFD')
			.replace(/[\u0300-\u036f]/g, '')
			.replace(/[^a-z0-9]+/g, ' ')
			.trim();
	}

	function loadProfiles() {
		try {
			return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
		} catch (e) {
			return [];
		}
	}

	function saveProfiles(profiles) {
		localStorage.setItem(STORAGE_KEY, JSON.stringify(profiles));
	}

	function showStatus(message, isError) {
		statusNode.textContent = message || '';
		statusNode.classList.toggle('error', Boolean(isError));
	}

	function profileMatches(profile, query) {
		if (!query) { return true; }
		return normalize([
			profile.surname, profile.firstName, profile.employerName,
			profile.postHeld, profile.passportNumber, profile.permitNumber,
			profile.gender, profile.dateOfBirth
		].join(' ')).indexOf(normalize(query)) !== -1;
	}

	// ─── Lecture / écriture du formulaire ──────────────────────────────────────

	function getFormProfile() {
		return {
			surname:        form.surname.value.trim().toUpperCase(),
			firstName:      form.firstName.value.trim(),
			employerName:   form.employerName.value.trim(),
			postHeld:       form.postHeld.value.trim().toUpperCase(),
			passportNumber: form.passportNumber.value.trim().toUpperCase(),
			nationality:    form.nationality ? form.nationality.value.trim() : '',
			dateOfBirth:    form.dateOfBirth.value.trim(),
			validityFrom:   form.validityFrom.value.trim(),
			validityTo:     form.validityTo.value.trim(),
			gender:         form.gender.value,
			permitNumber:   form.permitNumber.value.trim().toUpperCase(),
			status:         form.status.value,
			photo:          currentPhoto
		};
	}

	function setFormProfile(profile) {
		form.surname.value        = profile.surname        || '';
		form.firstName.value      = profile.firstName      || '';
		form.employerName.value   = profile.employerName   || '';
		form.postHeld.value       = profile.postHeld       || '';
		form.passportNumber.value = profile.passportNumber || '';
		form.dateOfBirth.value    = profile.dateOfBirth    || '';
		form.validityFrom.value   = profile.validityFrom   || '';
		form.validityTo.value     = profile.validityTo     || '';
		form.gender.value         = profile.gender         || 'male';
		form.permitNumber.value   = profile.permitNumber   || '';
		form.status.value         = profile.status         || 'Active';
		if (form.nationality) { form.nationality.value = profile.nationality || ''; }
		editingPermit.value = profile.permitNumber || '';
		currentPhoto        = profile.photo || DEFAULT_PHOTO;
		photoPreview.src    = currentPhoto;
		showStatus('', false);
		window.scrollTo({ top: 0, behavior: 'smooth' });
	}

	function resetForm() {
		form.reset();
		form.gender.value = 'male';
		form.status.value = 'Active';
		editingPermit.value  = '';
		currentPhoto         = DEFAULT_PHOTO;
		photoPreview.src     = DEFAULT_PHOTO;
		photoInput.value     = '';
		showStatus('', false);
	}

	// ─── CRUD ──────────────────────────────────────────────────────────────────

	function upsertProfile(profile) {
		var profiles   = loadProfiles();
		var oldPermit  = normalize(editingPermit.value);
		var newPermit  = normalize(profile.permitNumber);
		var index      = profiles.findIndex(function (p) {
			return normalize(p.permitNumber) === newPermit ||
			       normalize(p.permitNumber) === oldPermit;
		});

		if (index >= 0) {
			profiles[index] = profile;
		} else {
			profiles.push(profile);
		}

		profiles.sort(function (a, b) {
			return String(a.surname || '').localeCompare(String(b.surname || ''));
		});
		saveProfiles(profiles);
		renderProfiles();
		resetForm();
		showStatus('Profil sauvegardé.', false);
	}

	function deleteProfile(permitNumber) {
		if (!confirm('Supprimer ce profil ?')) { return; }
		var profiles = loadProfiles().filter(function (p) {
			return normalize(p.permitNumber) !== normalize(permitNumber);
		});
		saveProfiles(profiles);
		renderProfiles();
		showStatus('Profil supprimé.', false);
	}

	// ─── Lien de partage ───────────────────────────────────────────────────────

	function buildProfileLink(permitNumber) {
		var base = window.location.origin + window.location.pathname
			.replace('admin.html', 'index.html');
		return base + '?permit=' + encodeURIComponent(permitNumber);
	}

	function copyLink(permitNumber) {
		var url = buildProfileLink(permitNumber);
		if (navigator.clipboard && navigator.clipboard.writeText) {
			navigator.clipboard.writeText(url).then(function () {
				showStatus('Lien copié : ' + url, false);
			});
		} else {
			// Fallback
			var ta = document.createElement('textarea');
			ta.value = url;
			ta.style.position = 'fixed';
			ta.style.opacity  = '0';
			document.body.appendChild(ta);
			ta.select();
			document.execCommand('copy');
			document.body.removeChild(ta);
			showStatus('Lien copié : ' + url, false);
		}
	}

	// ─── Rendu liste ───────────────────────────────────────────────────────────

	function renderProfiles() {
		var query    = searchInput.value;
		var profiles = loadProfiles().filter(function (p) {
			return profileMatches(p, query);
		});

		list.textContent = '';

		if (!profiles.length) {
			var empty = document.createElement('div');
			empty.className   = 'empty-state';
			empty.textContent = 'Aucun profil sauvegardé.';
			list.appendChild(empty);
			return;
		}

		profiles.forEach(function (profile) {
			var item = document.createElement('div');
			item.className = 'profile-item';

			var img = document.createElement('img');
			img.src = profile.photo || DEFAULT_PHOTO;
			img.alt = '';

			var content = document.createElement('div');
			var name    = document.createElement('div');
			name.className   = 'profile-name';
			name.textContent = [profile.surname, profile.firstName].filter(Boolean).join(' ');

			var meta          = document.createElement('div');
			meta.className   = 'profile-meta';
			meta.textContent = [
				profile.permitNumber,
				profile.passportNumber,
				profile.employerName
			].filter(Boolean).join(' | ');

			content.appendChild(name);
			content.appendChild(meta);

			var actions = document.createElement('div');
			actions.className = 'list-actions';

			// Bouton Modifier
			var editBtn       = document.createElement('button');
			editBtn.type      = 'button';
			editBtn.textContent = 'Modifier';
			editBtn.addEventListener('click', function () { setFormProfile(profile); });

			// Bouton Lien
			var linkBtn       = document.createElement('button');
			linkBtn.type      = 'button';
			linkBtn.textContent = 'Copier lien';
			linkBtn.title     = buildProfileLink(profile.permitNumber);
			linkBtn.addEventListener('click', function () { copyLink(profile.permitNumber); });

			// Bouton Supprimer
			var deleteBtn     = document.createElement('button');
			deleteBtn.type    = 'button';
			deleteBtn.className = 'danger';
			deleteBtn.textContent = 'Supprimer';
			deleteBtn.addEventListener('click', function () { deleteProfile(profile.permitNumber); });

			actions.appendChild(editBtn);
			actions.appendChild(linkBtn);
			actions.appendChild(deleteBtn);

			item.appendChild(img);
			item.appendChild(content);
			item.appendChild(actions);
			list.appendChild(item);
		});
	}

	// ─── Redimensionnement photo ────────────────────────────────────────────────

	function resizePhoto(file) {
		return new Promise(function (resolve, reject) {
			var reader = new FileReader();
			reader.onload = function () {
				var image    = new Image();
				image.onload = function () {
					var maxW   = 360, maxH = 440;
					var ratio  = Math.min(maxW / image.width, maxH / image.height, 1);
					var canvas = document.createElement('canvas');
					canvas.width  = Math.round(image.width  * ratio);
					canvas.height = Math.round(image.height * ratio);
					canvas.getContext('2d').drawImage(image, 0, 0, canvas.width, canvas.height);
					resolve(canvas.toDataURL('image/jpeg', 0.86));
				};
				image.onerror = reject;
				image.src     = reader.result;
			};
			reader.onerror = reject;
			reader.readAsDataURL(file);
		});
	}

	// ─── Export / Import ───────────────────────────────────────────────────────

	function exportProfiles() {
		var blob = new Blob([JSON.stringify(loadProfiles(), null, 2)], { type: 'application/json' });
		var a    = document.createElement('a');
		a.href   = URL.createObjectURL(blob);
		a.download = 'permit-profiles.json';
		a.click();
		URL.revokeObjectURL(a.href);
	}

	function importProfiles(file) {
		var reader   = new FileReader();
		reader.onload = function () {
			try {
				var imported = JSON.parse(reader.result);
				if (!Array.isArray(imported)) { throw new Error('Format invalide'); }
				saveProfiles(imported);
				renderProfiles();
				showStatus('Profils importés (' + imported.length + ').', false);
			} catch (e) {
				showStatus('Échec de l\'import.', true);
			}
		};
		reader.readAsText(file);
	}

	// ─── Événements ────────────────────────────────────────────────────────────

	photoInput.addEventListener('change', function () {
		var file = photoInput.files && photoInput.files[0];
		if (!file) { return; }
		resizePhoto(file).then(function (dataUrl) {
			currentPhoto     = dataUrl;
			photoPreview.src = dataUrl;
			showStatus('', false);
		}).catch(function () {
			showStatus('Impossible de charger la photo.', true);
		});
	});

	form.addEventListener('submit', function (e) {
		e.preventDefault();
		upsertProfile(getFormProfile());
	});

	document.getElementById('clearForm').addEventListener('click', resetForm);
	document.getElementById('exportProfiles').addEventListener('click', exportProfiles);
	document.getElementById('importProfiles').addEventListener('change', function (e) {
		var file = e.target.files && e.target.files[0];
		if (file) { importProfiles(file); }
	});
	searchInput.addEventListener('input', renderProfiles);

	renderProfiles();
}());
