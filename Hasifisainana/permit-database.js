(function () {
	'use strict';

	var PROFILES_URL = 'profiles.json';

	// ─── Utilitaires ───────────────────────────────────────────────────────────

	function normalize(value) {
		return String(value || '')
			.toLowerCase()
			.normalize('NFD')
			.replace(/[\u0300-\u036f]/g, '')
			.replace(/[^a-z0-9]+/g, ' ')
			.trim();
	}

	function employeeSearchText(emp) {
		return normalize([
			emp.surname, emp.firstName, emp.employerName,
			emp.postHeld, emp.passportNumber, emp.permitNumber,
			emp.gender, emp.dateOfBirth, emp.validityFrom, emp.validityTo
		].join(' '));
	}

	function findEmployee(employees, query) {
		var q = normalize(query);
		if (!q) { return employees[0] || null; }

		var exact = employees.find(function (emp) {
			return [
				emp.permitNumber,
				emp.passportNumber,
				emp.surname,
				emp.firstName,
				(emp.surname || '') + ' ' + (emp.firstName || '')
			].some(function (v) { return normalize(v) === q; });
		});
		if (exact) { return exact; }

		return employees.find(function (emp) {
			return employeeSearchText(emp).indexOf(q) !== -1;
		}) || null;
	}

	// ─── Rendu DOM ─────────────────────────────────────────────────────────────

	function setText(field, value) {
		var el = document.querySelector('[data-permit-field="' + field + '"]');
		if (el) { el.textContent = value || ''; }
	}

	function setStatus(value) {
		var el = document.querySelector('elicatmu-permit-status');
		if (el) {
			el.textContent = value || '';
			el.style.color = normalize(value) === 'active' ? 'green' : '#a94442';
		}
	}

	function setPhoto(src) {
		var el = document.querySelector('[data-permit-field="photo"]');
		if (el && src) {
			el.src = src;
			el.alt = 'Profile photo';
		}
	}

	function renderEmployee(emp) {
		if (!emp) { return; }
		setText('permitNumber', emp.permitNumber);
		setText('surname', emp.surname);
		setText('firstName', emp.firstName);
		setText('employerName', emp.employerName);
		setText('postHeld', emp.postHeld);
		setText('passportNumber', emp.passportNumber);
		setText('gender', emp.gender);
		setText('dateOfBirth', emp.dateOfBirth);
		setText('validityFrom', emp.validityFrom);
		setText('validityTo', emp.validityTo);
		setStatus(emp.status);
		setPhoto(emp.photo);

		if (emp.permitNumber && history.replaceState) {
			history.replaceState(null, '', '?permit=' + encodeURIComponent(emp.permitNumber));
		}
	}

	function search(employees, query) {
		var emp = findEmployee(employees, query);
		if (emp) { renderEmployee(emp); }
	}

	// ─── Paramètre URL ?permit= ────────────────────────────────────────────────

	function getPermitFromURL() {
		try {
			return new URLSearchParams(window.location.search).get('permit') || '';
		} catch (e) {
			var match = window.location.search.match(/[?&]permit=([^&]*)/);
			return match ? decodeURIComponent(match[1]) : '';
		}
	}

	// ─── Formulaires de recherche ──────────────────────────────────────────────

	function bindSearchForms(employees) {
		Array.prototype.forEach.call(
			document.querySelectorAll('.theme_search_form'),
			function (form) {
				var input = form.querySelector('.searchInput');
				if (!input) { return; }
				input.setAttribute('autocomplete', 'off');
				input.removeAttribute('list');
				form.addEventListener('submit', function (e) {
					e.preventDefault();
					search(employees, input.value);
					input.value = '';
				});
			}
		);
	}

	// ─── Initialisation avec les employés ──────────────────────────────────────

	function init(employees) {
		if (!employees || !employees.length) { return; }
		window.permitEmployeeDatabase = employees;
		bindSearchForms(employees);
		var permitParam = getPermitFromURL();
		var empToShow = permitParam ? findEmployee(employees, permitParam) : employees[0];
		renderEmployee(empToShow || employees[0]);
	}

	// ─── Chargement de profiles.json (avec fallback localStorage) ──────────────

	function loadProfiles() {
		// Fallback : profils sauvegardés en local via admin
		function getLocalProfiles() {
			try {
				return JSON.parse(localStorage.getItem('permitEmployeeProfiles')) || [];
			} catch (e) {
				return [];
			}
		}

		// Sur hébergement : fetch le fichier JSON
		if (window.location.protocol !== 'file:') {
			fetch(PROFILES_URL + '?v=' + Date.now())
				.then(function (res) {
					if (!res.ok) { throw new Error('HTTP ' + res.status); }
					return res.json();
				})
				.then(function (data) {
					var profiles = Array.isArray(data) ? data : [];
					// Fusionner avec les profils locaux (admin)
					var local = getLocalProfiles();
					var merged = mergeByKey(profiles, local);
					init(merged);
				})
				.catch(function () {
					init(getLocalProfiles());
				});
		} else {
			// En local (file://) : utiliser directement localStorage
			init(getLocalProfiles());
		}
	}

	function mergeByKey(base, extra) {
		var map = {};
		base.concat(extra).forEach(function (emp) {
			var key = normalize(
				emp.permitNumber || emp.passportNumber || (emp.surname + emp.firstName)
			);
			if (key) { map[key] = emp; }
		});
		return Object.keys(map).map(function (k) { return map[k]; });
	}

	// ─── Démarrage ─────────────────────────────────────────────────────────────

	document.addEventListener('DOMContentLoaded', loadProfiles);
}());
